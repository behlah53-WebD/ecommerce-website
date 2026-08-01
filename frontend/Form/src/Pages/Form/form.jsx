import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Container, Alert, Snackbar, alpha } from "@mui/material";

import { useHttp } from "@/Pages/Form/Hook/Hook";
import UserHeader from "@/Pages/Form/components/userHeader";
import UserTable from "@/Pages/Form/components/userTable";
import UserDialog from "@/Pages/Form/components/userDialogbox";

import { getUserFromToken } from "@/API/api";

const initialFormState = {
  id: null,
  productName: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  brand: "",
  description: "",
  productStatus: "In Stock",
  files: [],
};

const Form = ({ onLogout, currentUser: propsUser }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const currentUser = propsUser || getUserFromToken();
  const userRole = currentUser?.role || "Buyer";

  const [searchQuery, setSearchQuery] = useState("");

  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const { data, loading, error, fetchData, postData, putData, deleteData } =
    useHttp();

  const isInitialMount = useRef(true);

  const loadPage = useCallback(
    async (pageNumber = 1, search = "") => {
      try {
        const res = await fetchData({
          page: pageNumber,
          limit: 5,
          search: search.trim(),
        });

        const meta = res?.pagination || res?.data?.pagination;
        if (meta) {
          setPaginationData({
            currentPage: meta.currentPage || pageNumber,
            totalPages: meta.totalPages || 1,
          });
        } else {
          setPaginationData((prev) => ({ ...prev, currentPage: pageNumber }));
        }
        return res;
      } catch (err) {
        throw err;
      }
    },
    [fetchData],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
      }
      loadPage(1, searchQuery).catch(() => {});
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, loadPage]);

  const handlePageChange = useCallback((newPage) => {
    loadPage(newPage, searchQuery).catch(() => {});
  }, [loadPage, searchQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
  }, []);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleClickOpen = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setOpen(true);
  };

  const handleEditOpen = async (item) => {
    setIsEditing(true);
    // Fetch full product data (including files/images) from single-product endpoint
    let fullItem = item;
    try {
      const res = await apiGet(`/users/${item.id || item._id}`);
      if (res.data?.success && res.data?.data) {
        fullItem = res.data.data;
      }
    } catch {
      // fallback to list item if fetch fails
    }
    setFormData({
      ...initialFormState,
      ...fullItem,
      id: fullItem.id || fullItem._id,
      productName: fullItem.productName || fullItem.firstName || "",
      sku: fullItem.sku || "",
      category: fullItem.category || "",
      price: fullItem.price !== undefined ? fullItem.price : "",
      stock: fullItem.stock !== undefined ? fullItem.stock : "",
      brand: fullItem.brand || "",
      description: fullItem.description || "",
      productStatus: fullItem.productStatus || "In Stock",
      files: fullItem.files || [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (newFiles) => {
    setFormData((prev) => ({ ...prev, files: newFiles }));
  };

  const handleGetRequest = async () => {
    try {
      const res = await loadPage(paginationData.currentPage, searchQuery);
      showToast(`Products Refreshed: ${res?.message || "Success"}`, "info");
    } catch (err) {
      showToast(`Fetch Error: ${err.message}`, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName) {
      showToast("Product Name is required!", "warning");
      return;
    }

    const payload = new FormData();
    const existingBase64Files = [];

    Object.keys(formData).forEach((key) => {
      if (key === "files") {
        (formData.files || []).forEach((fileObj) => {
          if (fileObj instanceof File) {
            payload.append("file", fileObj);
          } else if (fileObj && fileObj.data) {
            existingBase64Files.push(fileObj);
          }
        });
      } else if (formData[key] !== null && formData[key] !== undefined) {
        payload.append(key, formData[key]);
      }
    });

    payload.append("existingFiles", JSON.stringify(existingBase64Files));

    try {
      let result;
      if (isEditing) {
        result = await putData(payload);
      } else {
        result = await postData(payload);
      }

      const fileCount = result?.dataReceived?.files?.length || 0;
      const countMsg = fileCount > 0 ? ` with ${fileCount} image(s)` : "";

      showToast((result?.message || "Operation successful!") + countMsg);
      handleClose();

      loadPage(isEditing ? paginationData.currentPage : 1, searchQuery).catch(
        () => {},
      );
    } catch (err) {
      showToast(`Error: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteData(id);
      showToast(result?.message || "Product deleted successfully!");
      loadPage(paginationData.currentPage, searchQuery).catch(() => {});
    } catch (err) {
      showToast(`Delete Error: ${err.message}`, "error");
    }
  };

  const rawList = Array.isArray(data)
    ? data
    : data?.data && Array.isArray(data.data)
      ? data.data
      : [];

  const tableList = userRole === "Buyer"
    ? rawList.filter((item) => !item.status || item.status === "approved")
    : rawList;

  const activePagination = data?.pagination || paginationData;

  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", md: "100vh" },
        bgcolor: "#f8fafc",
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        py: { xs: 2, sm: 3, md: 5 },
        px: 0,
        position: "relative",
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '60%',
          background: 'radial-gradient(circle at top right, rgba(102, 126, 234, 0.03), transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '30%',
          height: '40%',
          background: 'radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.03), transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container
        maxWidth="lg"
        disableGutters
        sx={{ position: "relative", zIndex: 1, maxWidth: "100%" }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 4 }, minWidth: 0 }}>
          <UserHeader onLogout={onLogout} userRole={userRole} />

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                backgroundColor: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                fontWeight: 600,
                "& .MuiAlert-icon": { color: "#ef4444" },
              }}
            >
              {error}
            </Alert>
          )}

          <UserTable
            data={tableList}
            loading={loading}
            onTestGet={handleGetRequest}
            onOpenAdd={handleClickOpen}
            onOpenEdit={handleEditOpen}
            onDelete={handleDelete}
            userRole={userRole}
            paginationData={activePagination}
            onPageChange={handlePageChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
          />
        </Box>
      </Container>

      <UserDialog
        open={open}
        isEditing={isEditing}
        formData={formData}
        loading={loading}
        onClose={handleClose}
        onChange={handleChange}
        onFilesChange={handleFilesChange}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{
            borderRadius: 3,
            width: "100%",
            background: "#ffffff",
            color: "#0f172a",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
            border: "1px solid #e2e8f0",
            fontWeight: 600,
            "& .MuiAlert-icon": { color: "inherit" },
            "& .MuiAlert-action": { color: "#64748b" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Form;
