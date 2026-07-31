import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => sessionStorage.getItem("refreshToken");

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return {
      id: payload.id,
      name: payload.name || "User",
      role: payload.role || "Buyer",
      authEmail: payload.email || "",
    };
  } catch {
    return null;
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(null, newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb(error, null));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    if (res.data?.success && res.data?.accessToken) {
      const { accessToken, refreshToken: newRefreshToken } = res.data;

      localStorage.setItem("accessToken", accessToken);

      if (newRefreshToken) {
        sessionStorage.setItem("refreshToken", newRefreshToken);
      }

      return accessToken;
    }
  } catch (err) {
    clearAuth();
  }

  return null;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((err, newToken) => {
            if (err) return reject(err);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      onRefreshFailed(error);
      clearAuth();
      window.dispatchEvent(new Event("logout"));
    }

    return Promise.reject(error);
  },
);

export const apiGet = (endpoint = "", config = {}) =>
  apiClient.get(endpoint, config);

export const apiPost = (endpoint = "", data, config = {}) =>
  apiClient.post(endpoint, data, config);

export const apiPut = (endpoint = "", data, config = {}) =>
  apiClient.put(endpoint, data, config);

export const apiDelete = (endpoint = "", config = {}) =>
  apiClient.delete(endpoint, config);

// export const apiGetPaginated = (endpoint = "", page = 1,  config = {}) => {

// ── Nodemailer Email Helper ───────────────────────────────────────────────────
/**
 * sendEmail — send an email via the backend SMTP route
 *
 * @param {string}  to       - Recipient email, e.g. "user@example.com"
 * @param {string}  subject  - Subject line
 * @param {string}  html     - HTML body  (use html OR text)
 * @param {string}  [text]   - Plain-text fallback (optional)
 * @returns {Promise<{success:boolean, message:string, messageId?:string}>}
 *
 * Example usage in any component:
 *   import { sendEmail } from '../../API/api';
 *
 *   const handleSend = async () => {
 *     const res = await sendEmail(
 *       'recipient@example.com',
 *       'Welcome!',
 *       '<h1>Welcome to our app!</h1>'
 *     );
 *     if (res.success) console.log('Sent!', res.messageId);
 *     else console.error(res.message);
 *   };
 */
export const sendEmail = async (to, subject, html, text) => {
  try {
    const res = await apiClient.post("/email/send", { to, subject, html, text });
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to send email",
    };
  }
};
// ─────────────────────────────────────────────────────────────────────────────









