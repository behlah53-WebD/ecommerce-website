import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/API/api";

export const useHttp = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const extractPayloadData = (payload) => {
    if (payload instanceof FormData) {
      return Object.fromEntries(payload.entries());
    }
    return payload || {};
  };

  
  const extractId = (payload) => {
    if (payload instanceof FormData) {
      return payload.get("id") || payload.get("userId");
    }
    return payload?.id || payload?.userId;
  };

  
  const fetchData = useCallback(
    async (param = "/users", limit = 10, search = "") => {
      setLoading(true);
      setError(null);
      try {
        let targetEndpoint = "/users";

       
        if (typeof param === "object" && param !== null) {
          const {
            page = 1,
            limit: pageLimit = limit,
            search: searchQuery = search,
            endpoint = "/users",
          } = param;

          const queryParams = new URLSearchParams();
          if (page) queryParams.append("page", page);
          if (pageLimit) queryParams.append("limit", pageLimit);
          if (searchQuery) queryParams.append("search", searchQuery);

          targetEndpoint = `${endpoint}?${queryParams.toString()}`;
        }
        
        else if (typeof param === "number") {
          const queryParams = new URLSearchParams();
          queryParams.append("page", param);
          queryParams.append("limit", limit);
          if (search) queryParams.append("search", search);

          targetEndpoint = `/users?${queryParams.toString()}`;
        }
        
        else if (typeof param === "string") {
          targetEndpoint = param;
          if (search && !targetEndpoint.includes("search=")) {
            const separator = targetEndpoint.includes("?") ? "&" : "?";
            targetEndpoint = `${targetEndpoint}${separator}search=${encodeURIComponent(search)}`;
          }
        }

        const response = await apiGet(targetEndpoint);
        const result = response.data;
        setLoading(false);

        
        if (Array.isArray(result)) setData(result);
        else if (Array.isArray(result.data)) setData(result.data);
        else if (result.data && typeof result.data === "object")
          setData([result.data]);
        else setData([]);

       
        if (result.pagination) {
          setPagination(result.pagination);
        }

        return result;
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "GET Request Failed",
        );
        setLoading(false);
        throw err;
      }
    },
    [],
  );

  const postData = useCallback(async (payload, endpoint = "/users") => {
    setLoading(true);
    setError(null);
    try {
      const config =
        payload instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const response = await apiPost(endpoint, payload, config);
      const result = response.data;
      setLoading(false);

      const parsedPayload = extractPayloadData(payload);
      const newItem = result.dataReceived ||
        result.data || {
          ...parsedPayload,
          id:
            extractId(payload) ||
            `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        };

      setData((prev) => [...prev, newItem]);
      return result;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "POST Request Failed",
      );
      setLoading(false);
      throw err;
    }
  }, []);

  const putData = useCallback(async (payload, endpoint = "/users") => {
    setLoading(true);
    setError(null);
    try {
      const config =
        payload instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const response = await apiPut(endpoint, payload, config);
      const result = response.data;
      setLoading(false);

      if (result.success || response.status === 200) {
        const updatedItem =
          result.dataReceived || extractPayloadData(payload);
        const targetId = updatedItem.id || extractId(payload);

        setData((prev) => {
          const exists = prev.some(
            (item) =>
              item.id && targetId && String(item.id) === String(targetId),
          );

          if (exists) {
            return prev.map((item) =>
              item.id && targetId && String(item.id) === String(targetId)
                ? { ...item, ...updatedItem }
                : item,
            );
          } else {
            return [...prev, updatedItem];
          }
        });
      }
      return result;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "PUT Request Failed",
      );
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteData = useCallback(async (id, endpoint = "/users") => {
    setLoading(true);
    setError(null);
    try {
      const targetEndpoint =
        id && endpoint === "/users" ? `${endpoint}/${id}` : endpoint;

      const response = await apiDelete(targetEndpoint, {
        data: { id },
      });
      const result = response.data;
      setLoading(false);

      if (result.success || response.status === 200) {
        setData((prev) =>
          id
            ? prev.filter((item) => String(item.id || item._id) !== String(id))
            : prev,
        );
      }
      return result;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "DELETE Request Failed",
      );
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    data,
    setData,
    pagination,
    loading,
    error,
    fetchData,
    postData,
    putData,
    deleteData,
  };
};

export default useHttp;