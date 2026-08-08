import axios from "axios";

const BASE_URL = "http://localhost:3000";

const pendingRequests = new Map();

const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'get') {
      const key = generateRequestKey(config);
      if (pendingRequests.has(key)) {
        console.log(`[Dedupe] Returning existing promise for: ${key}`);
        return pendingRequests.get(key);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      const key = generateRequestKey(response.config);
      pendingRequests.delete(key);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.method === 'get') {
      const key = generateRequestKey(originalRequest);
      pendingRequests.delete(key);
    }

    const status = error.response?.status;
    const isTokenError = status === 401 || status === 403;

    if (isTokenError && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

        if (data.success && data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            sessionStorage.setItem("refreshToken", data.refreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          processQueue(null, data.accessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    const errMsg = error.response?.data?.message || error.message;
    console.error(`API Error [${status}] ${originalRequest?.url}:`, errMsg);

    return Promise.reject(error);
  }
);

export default apiClient;