import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
  Email as EmailIcon,
  Store as StoreIcon,
  Refresh as RefreshIcon,
  EditNote as EditIcon,
  AddCircleOutlined as AddIcon,
  DeleteForever as DeleteIcon,
  Block as RejectedIcon,
  ShoppingBag as ProductIcon,
} from "@mui/icons-material";
import { apiGet, apiPost } from "@/API/api";

const AdminRequests = ({ showToast }) => {
  const [requests, setRequests] = useState([]);
  const [declinedItems, setDeclinedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        apiGet("/users/admin/requests"),
        apiGet("/users?limit=10000"),
      ]);
      if (pendingRes.data && pendingRes.data.success) {
        setRequests(pendingRes.data.data || []);
      }
      if (allRes.data && allRes.data.success) {
        setDeclinedItems((allRes.data.data || []).filter((i) => i.status === "rejected"));
      }
    } catch (err) {
      console.error("Failed to fetch admin requests:", err);
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await apiPost(`/users/admin/requests/${id}/approve`);
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchRequests();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      const res = await apiPost(`/users/admin/requests/${id}/decline`);
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "info");
        fetchRequests();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending_add":
        return <Chip icon={<AddIcon fontSize="small" />} label="Pending Add" sx={{ backgroundColor: "#fef9c3", color: "#a16207", border: "1px solid #fde68a", fontWeight: 800, fontSize: "0.75rem" }} />;
      case "pending_edit":
        return <Chip icon={<EditIcon fontSize="small" />} label="Pending Edit" sx={{ backgroundColor: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe", fontWeight: 800, fontSize: "0.75rem" }} />;
      case "pending_delete":
        return <Chip icon={<DeleteIcon fontSize="small" />} label="Pending Delete" sx={{ backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", fontWeight: 800, fontSize: "0.75rem" }} />;
      case "rejected":
        return <Chip icon={<RejectedIcon fontSize="small" />} label="Declined" sx={{ backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 800, fontSize: "0.75rem" }} />;
      default:
        return null;
    }
  };

  const getAvatarSrc = (item) => {
    if (item.files && item.files.length > 0) {
      const firstFile = item.files[0];
      if (firstFile.data) return `data:${firstFile.mimetype || "image/jpeg"};base64,${firstFile.data}`;
    }
    return null;
  };

  const renderFieldDiff = (item) => {
    if (item.status !== "pending_edit" || !item.pendingChanges) return null;

    const fields = [
      { key: "productName", label: "Product Name" },
      { key: "sku", label: "SKU" },
      { key: "category", label: "Category" },
      { key: "brand", label: "Brand" },
      { key: "price", label: "Price ($)" },
      { key: "stock", label: "Stock" },
      { key: "productStatus", label: "Availability" },
      { key: "description", label: "Description" },
    ];

    const changes = [];
    fields.forEach(({ key, label }) => {
      const before = item[key] !== undefined ? item[key] : "";
      const after = item.pendingChanges[key] !== undefined ? item.pendingChanges[key] : "";
      if (String(before).trim() !== String(after).trim()) {
        changes.push({ label, before: String(before) || "(empty)", after: String(after) || "(empty)" });
      }
    });

    const beforeFilesCount = item.files?.length || 0;
    const afterFilesCount = item.pendingChanges.files?.length || 0;
    if (beforeFilesCount !== afterFilesCount) {
      changes.push({ label: "Product Images", before: `${beforeFilesCount} file(s)`, after: `${afterFilesCount} file(s)` });
    }

    if (changes.length === 0) return null;

    return (
      <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#f0f4ff", border: "1px dashed #c7d2fe" }}>
        <Typography variant="subtitle2" sx={{ color: "#4f46e5", fontWeight: 800, mb: 1.5, fontSize: "0.8rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Proposed Changes (Before → After)
        </Typography>
        <Grid container spacing={1.5}>
          {changes.map((change, idx) => (
            <Grid item xs={12} key={idx} sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Typography sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.825rem", minWidth: 140 }}>
                {change.label}:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <span style={{ textDecoration: "line-through", color: "#b91c1c", fontSize: "0.825rem", backgroundColor: "#fee2e2", padding: "2px 8px", borderRadius: "6px" }}>
                  {change.before}
                </span>
                <span style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 800 }}>→</span>
                <span style={{ color: "#15803d", fontSize: "0.825rem", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  {change.after}
                </span>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{ borderRadius: 4, overflow: "hidden", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)" }}
      >
        {}
        <Box
          sx={{
            p: 3,
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3.5,
                background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.2)",
              }}
            >
              <StoreIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>
                Product Approval Panel
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                Review pending product add, edit, and delete requests from sellers
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
            disabled={loading}
            sx={{
              borderRadius: "12px", px: 2.5, py: 1, fontWeight: 700, textTransform: "none",
              borderColor: "#e2e8f0", color: "#475569", borderWidth: "1.5px",
              "&:hover": { borderColor: "#6366f1", background: alpha("#6366f1", 0.04), color: "#4f46e5" },
            }}
          >
            Refresh Queue
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={40} sx={{ color: "#6366f1" }} />
          </Box>
        ) : requests.length === 0 ? (
          <Box sx={{ p: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
            <Avatar sx={{ width: 76, height: 76, background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)", color: "#6366f1", mb: 2, border: "2px solid #e2e8f0" }}>
              <ApproveIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              No Pending Moderation Requests
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
              All product requests are up to date! New add, edit, or delete actions from sellers will appear here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {requests.map((item) => {
              const avatarSrc = getAvatarSrc(item);
              const isActioning = actionLoading === item.id;
              const pending = item.pendingChanges;
              const productName = item.productName || item.firstName || "Unnamed Product";

              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                    transition: "all 0.25s ease",
                    "&:hover": { borderColor: "#6366f1", transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(79, 70, 229, 0.08)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Chip
                        avatar={<Avatar sx={{ bgcolor: "#4f46e5", color: "#fff" }}>S</Avatar>}
                        label={`Seller: ${item.sellerName || "Seller"}`}
                        sx={{ backgroundColor: "#ede9fe", color: "#4f46e5", fontWeight: 800, border: "1px solid #ddd6fe" }}
                      />
                      <Typography variant="caption" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}>
                        <EmailIcon sx={{ fontSize: 14, color: "#0284c7" }} /> {item.sellerEmail || "No Email"}
                      </Typography>
                    </Box>
                    {getStatusChip(item.status)}
                  </Box>

                  <Divider sx={{ borderColor: "#f1f5f9", mb: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                        <Avatar
                          src={avatarSrc || ""}
                          variant="rounded"
                          sx={{ width: 52, height: 52, background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)", fontSize: "1rem", fontWeight: 800, color: "#4f46e5", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                        >
                          {!avatarSrc && (productName ? productName[0].toUpperCase() : <ProductIcon />)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>{productName}</Typography>
                          {item.brand && <Typography variant="caption" sx={{ color: "#64748b" }}>by {item.brand}</Typography>}
                          {item.sku && <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace", display: "block" }}>{item.sku}</Typography>}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>PRICE</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                            {pending?.price !== undefined ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>${item.price}</span>{" "}
                                <span style={{ color: "#15803d", fontWeight: 800 }}>${pending.price}</span>
                              </>
                            ) : `$${item.price || 0}`}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>STOCK</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                            {pending?.stock !== undefined ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#94a3b8" }}>{item.stock}</span>{" "}
                                <span style={{ color: "#15803d", fontWeight: 800 }}>{pending.stock}</span>
                              </>
                            ) : (item.stock ?? "-")}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>CATEGORY</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                            {item.category || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>AVAILABILITY</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                            {item.productStatus || "In Stock"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {}
                    <Grid item xs={12} sm={3} md={3} sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        startIcon={isActioning ? <CircularProgress size={18} color="inherit" /> : <ApproveIcon />}
                        disabled={isActioning}
                        onClick={() => handleApprove(item.id)}
                        sx={{
                          borderRadius: "12px", px: 2.5, py: 1.1, fontWeight: 800, textTransform: "none",
                          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                          "&:hover": { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", transform: "translateY(-1px)" },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={isActioning ? <CircularProgress size={18} color="inherit" /> : <DeclineIcon />}
                        disabled={isActioning}
                        onClick={() => handleDecline(item.id)}
                        sx={{
                          borderRadius: "12px", px: 2, py: 1.1, fontWeight: 800, textTransform: "none",
                          borderColor: "#fecaca", color: "#e11d48", borderWidth: "1.5px",
                          "&:hover": { borderColor: "#e11d48", background: "#fff1f2", color: "#be123c" },
                        }}
                      >
                        Decline
                      </Button>
                    </Grid>
                  </Grid>
                  {renderFieldDiff(item)}
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {}
      {declinedItems.length > 0 && (
        <Paper
          elevation={0}
          sx={{ mt: 4, borderRadius: 4, overflow: "hidden", background: "#ffffff", border: "1px solid #fecaca", boxShadow: "0 4px 16px rgba(239, 68, 68, 0.06)" }}
        >
          <Box sx={{ p: 3, background: "#fff8f8", borderBottom: "1px solid #fef2f2", display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 46, height: 46, borderRadius: 3.5, background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(239, 68, 68, 0.2)" }}>
              <RejectedIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.2px" }}>
                Declined Products
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                {declinedItems.length} product{declinedItems.length !== 1 ? "s" : ""} declined
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {declinedItems.map((item) => {
              const avatarSrc = getAvatarSrc(item);
              const productName = item.productName || item.firstName || "Unnamed Product";
              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{ p: 2.5, borderRadius: 3, background: "#fff8f8", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
                >
                  <Avatar
                    src={avatarSrc || ""}
                    variant="rounded"
                    sx={{ width: 44, height: 44, background: "#fee2e2", fontSize: "1rem", fontWeight: 800, color: "#e11d48", borderRadius: "10px" }}
                  >
                    {!avatarSrc && (productName ? productName[0].toUpperCase() : "P")}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
                      {productName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      {item.category && `${item.category} • `}${item.price !== undefined ? `$${item.price}` : ""}{item.brand ? ` • ${item.brand}` : ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip size="small" label={`Seller: ${item.sellerName || "Seller"}`} sx={{ backgroundColor: "#ede9fe", color: "#4f46e5", border: "1px solid #ddd6fe", fontWeight: 700, fontSize: "0.7rem" }} />
                    <Chip size="small" icon={<RejectedIcon sx={{ fontSize: "14px !important" }} />} label="Declined" sx={{ backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontWeight: 700, fontSize: "0.7rem" }} />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AdminRequests;
