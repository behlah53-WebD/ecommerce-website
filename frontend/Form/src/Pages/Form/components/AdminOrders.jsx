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
  IconButton,
  Tooltip,
  Badge,
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
  LocalShipping as DeliveredIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  AssignmentTurnedIn as ReturnIcon,
  AssignmentReturn as CancelRequestIcon,
  Verified as ApproveRequestIcon,
  HighlightOff as RejectRequestIcon,
} from "@mui/icons-material";
import { apiGet, apiPost } from "@/API/api";

const AdminOrders = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/orders/admin/all");
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleApprove = async (orderId) => {
    setActionLoading(orderId);
    try {
      // Update order status to Delivered which will also decrease stock
      const res = await apiPost(`/orders/admin/${orderId}/status`, { status: 'Delivered' });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleCancelRequest = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      const res = await apiPost(`/orders/admin/${orderId}/cancel-request`, { action });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnRequest = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      const res = await apiPost(`/orders/admin/${orderId}/return-request`, { action });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getBuyerInfo = (order) => {
    const name = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() || "Unknown Buyer";
    const email = order.shippingAddress?.email || "No Email";
    return { name, email };
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Processing":
        return (
          <Chip
            icon={<EditIcon fontSize="small" />}
            label="Processing"
            sx={{
              backgroundColor: "#fef9c3",
              color: "#a16207",
              border: "1px solid #fde68a",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
      case "Shipped":
        return (
          <Chip
            icon={<LocalShipping fontSize="small" />}
            label="Shipped"
            sx={{
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              border: "1px solid #93c5fd",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
      case "Delivered":
        return (
          <Chip
            icon={<DeliveredIcon fontSize="small" />}
            label="Delivered"
            sx={{
              backgroundColor: "#dcfce7",
              color: "#15803d",
              border: "1px solid #86efac",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            icon={<RejectedIcon fontSize="small" />}
            label="Cancelled"
            sx={{
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
      case "Return Requested":
        return (
          <Chip
            icon={<ReturnIcon fontSize="small" />}
            label="Return Requested"
            sx={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
      case "Returned":
        return (
          <Chip
            icon={<ReturnIcon fontSize="small" />}
            label="Returned"
            sx={{
              backgroundColor: "#e0e7ff",
              color: "#3730a3",
              border: "1px solid #c7d2fe",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          />
        );
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{ borderRadius: 4, overflow: "hidden", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)" }}
      >
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
                Orders Management
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                Review and approve customer orders
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            disabled={loading}
            sx={{
              borderRadius: "12px", px: 2.5, py: 1, fontWeight: 700, textTransform: "none",
              borderColor: "#e2e8f0", color: "#475569", borderWidth: "1.5px",
              "&:hover": { borderColor: "#6366f1", background: alpha("#6366f1", 0.04), color: "#4f46e5" },
            }}
          >
            Refresh Orders
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={40} sx={{ color: "#6366f1" }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ p: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
            <Avatar sx={{ width: 76, height: 76, background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)", color: "#6366f1", mb: 2, border: "2px solid #e2e8f0" }}>
              <ApproveIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              No Orders Yet
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
              No customer orders have been placed yet. New orders will appear here for approval.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {orders.map((order) => {
              const isActioning = actionLoading === order.orderId;
              const { name: buyerName, email: buyerEmail } = getBuyerInfo(order);

              return (
                <Paper
                  key={order.orderId}
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
                        label={`Buyer: ${buyerName}`}
                        sx={{ backgroundColor: "#ede9fe", color: "#4f46e5", fontWeight: 800, border: "1px solid #ddd6fe" }}
                      />
                      <Typography variant="caption" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}>
                        <EmailIcon sx={{ fontSize: 14, color: "#0284c7" }} /> {buyerEmail}
                      </Typography>
                    </Box>
                    {getStatusChip(order.status)}
                  </Box>

                  <Divider sx={{ borderColor: "#f1f5f9", mb: 2 }} />

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                        <Avatar
                          variant="rounded"
                          sx={{ width: 52, height: 52, background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)", fontSize: "1rem", fontWeight: 800, color: "#4f46e5", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                        >
                          {order.items?.[0]?.image ? (
                            <img src={order.items[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} />
                          ) : (
                            <ProductIcon />
                          )}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
                            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Order: {order.orderId}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>TOTAL</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                            ${(order.grandTotal || 0).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>DATE</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                            {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>PAYMENT</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                            {order.paymentMethod || "Card"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>STATUS</Typography>
                          <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 500 }}>
                            {order.status}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} sm={3} md={3} sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleView(order)}
                          sx={{
                            borderRadius: "12px", px: 1.5, py: 1, fontWeight: 800, textTransform: "none",
                            background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                            color: "#fff", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                            "&:hover": { transform: "translateY(-1px)" },
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {order.status === "Processing" && (
                        <Button
                          variant="contained"
                          startIcon={isActioning ? <CircularProgress size={18} color="inherit" /> : <ApproveIcon />}
                          disabled={isActioning}
                          onClick={() => handleApprove(order.orderId)}
                          sx={{
                            borderRadius: "12px", px: 2.5, py: 1.1, fontWeight: 800, textTransform: "none",
                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                            "&:hover": { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", transform: "translateY(-1px)" },
                          }}
                        >
                          Approve
                        </Button>
                      )}
                      {order.cancelRequest?.requested && order.cancelRequest.status === 'Pending' && (
                        <>
                          <Tooltip title="Approve Cancellation">
                            <IconButton
                              disabled={isActioning}
                              onClick={() => handleCancelRequest(order.orderId, 'approve')}
                              sx={{
                                borderRadius: "12px", px: 1.5, py: 1, fontWeight: 800, textTransform: "none",
                                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                                "&:hover": { transform: "translateY(-1px)" },
                              }}
                            >
                              <ApproveRequestIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Cancellation">
                            <IconButton
                              disabled={isActioning}
                              onClick={() => handleCancelRequest(order.orderId, 'reject')}
                              sx={{
                                borderRadius: "12px", px: 1.5, py: 1, fontWeight: 800, textTransform: "none",
                                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                color: "#fff", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                                "&:hover": { transform: "translateY(-1px)" },
                              }}
                            >
                              <RejectRequestIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {order.returnRequest?.requested && order.returnRequest.status === 'Pending' && (
                        <>
                          <Tooltip title="Approve Return">
                            <IconButton
                              disabled={isActioning}
                              onClick={() => handleReturnRequest(order.orderId, 'approve')}
                              sx={{
                                borderRadius: "12px", px: 1.5, py: 1, fontWeight: 800, textTransform: "none",
                                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                                "&:hover": { transform: "translateY(-1px)" },
                              }}
                            >
                              <ApproveRequestIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Return">
                            <IconButton
                              disabled={isActioning}
                              onClick={() => handleReturnRequest(order.orderId, 'reject')}
                              sx={{
                                borderRadius: "12px", px: 1.5, py: 1, fontWeight: 800, textTransform: "none",
                                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                color: "#fff", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                                "&:hover": { transform: "translateY(-1px)" },
                              }}
                            >
                              <RejectRequestIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            p: 3,
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Total: {orders.length} order{orders.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Paper>

      {/* View Order Modal */}
      {viewModalOpen && selectedOrder && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            p: 2,
          }}
          onClick={() => setViewModalOpen(false)}
        >
          <Paper
            elevation={24}
            sx={{
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 4,
              bgcolor: "#ffffff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 3, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Order Details - {selectedOrder.orderId}
              </Typography>
              <IconButton onClick={() => setViewModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Shipping Address
                  </Typography>
                  <div sx={{ color: "#374151", lineHeight: 1.8 }}>
                    <p><strong>{getBuyerInfo(selectedOrder).name}</strong></p>
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                    <p>{getBuyerInfo(selectedOrder).email}</p>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Price Breakdown
                  </Typography>
                  <div sx={{ color: "#374151" }}>
                    <div sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><span>Subtotal</span><span>${(selectedOrder.subtotal || 0).toFixed(2)}</span></div>
                    <div sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><span>Shipping</span><span>{selectedOrder.shipping === 0 ? 'FREE' : `$${(selectedOrder.shipping || 0).toFixed(2)}`}</span></div>
                    <div sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><span>Tax</span><span>${(selectedOrder.tax || 0).toFixed(2)}</span></div>
                    <div sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px solid #e2e8f0", pt: 1, mt: 2 }}><span>Total</span><span>${(selectedOrder.grandTotal || 0).toFixed(2)}</span></div>
                  </div>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Cancellation Request */}
              {selectedOrder.cancelRequest?.requested && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#991b1b", mb: 1, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Cancellation Request {selectedOrder.cancelRequest.status === 'Pending' ? '(Pending)' : `(${selectedOrder.cancelRequest.status})`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}>
                    <strong>Reason:</strong> {selectedOrder.cancelRequest.reason}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Requested: {new Date(selectedOrder.cancelRequest.requestedAt).toLocaleString()}
                    {selectedOrder.cancelRequest.processedAt && <span> | Processed: {new Date(selectedOrder.cancelRequest.processedAt).toLocaleString()}</span>}
                    {selectedOrder.cancelRequest.processedBy && <span> | By: {selectedOrder.cancelRequest.processedBy}</span>}
                  </Typography>
                  {selectedOrder.cancelRequest.status === 'Pending' && (
                    <Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
                      <Button
                        variant="contained"
                        startIcon={<ApproveRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() => handleCancelRequest(selectedOrder.orderId, 'approve')}
                        sx={{
                          borderRadius: "12px", px: 2, py: 1, fontWeight: 800, textTransform: "none",
                          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                          "&:hover": { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)" },
                        }}
                      >
                        Approve Cancellation
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<RejectRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() => handleCancelRequest(selectedOrder.orderId, 'reject')}
                        sx={{
                          borderRadius: "12px", px: 2, py: 1, fontWeight: 800, textTransform: "none",
                          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          color: "#fff", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                          "&:hover": { background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)" },
                        }}
                      >
                        Reject Cancellation
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Return Request */}
              {selectedOrder.returnRequest?.requested && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "#fef3c7", border: "1px solid #fcd34d" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#92400e", mb: 1, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Return Request {selectedOrder.returnRequest.status === 'Pending' ? '(Pending)' : `(${selectedOrder.returnRequest.status})`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}>
                    <strong>Reason:</strong> {selectedOrder.returnRequest.reason}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Requested: {new Date(selectedOrder.returnRequest.requestedAt).toLocaleString()}
                    {selectedOrder.returnRequest.processedAt && <span> | Processed: {new Date(selectedOrder.returnRequest.processedAt).toLocaleString()}</span>}
                    {selectedOrder.returnRequest.processedBy && <span> | By: {selectedOrder.returnRequest.processedBy}</span>}
                  </Typography>
                  {selectedOrder.returnRequest.status === 'Pending' && (
                    <Box sx={{ mt: 2, display: "flex", gap: 1.5 }}>
                      <Button
                        variant="contained"
                        startIcon={<ApproveRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() => handleReturnRequest(selectedOrder.orderId, 'approve')}
                        sx={{
                          borderRadius: "12px", px: 2, py: 1, fontWeight: 800, textTransform: "none",
                          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          color: "#fff", boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
                          "&:hover": { background: "linear-gradient(135deg, #15803d 0%, #166534 100%)" },
                        }}
                      >
                        Approve Return
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<RejectRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() => handleReturnRequest(selectedOrder.orderId, 'reject')}
                        sx={{
                          borderRadius: "12px", px: 2, py: 1, fontWeight: 800, textTransform: "none",
                          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          color: "#fff", boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                          "&:hover": { background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)" },
                        }}
                      >
                        Reject Return
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                Items Ordered
              </Typography>
              {selectedOrder.items?.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", mb: 2 }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      sx={{ width: 60, height: 60, borderRadius: 2, objectFit: "cover", border: "1px solid #e2e8f0" }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Qty: {item.quantity} {item.color && `· ${item.color}`} {item.size && `· Size ${item.size}`}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminOrders;