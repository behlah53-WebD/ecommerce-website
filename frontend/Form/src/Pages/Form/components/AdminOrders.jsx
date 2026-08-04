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
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  Store as StoreIcon,
  Refresh as RefreshIcon,
  Block as RejectedIcon,
  ShoppingBag as ProductIcon,
  LocalShipping,
  LocalShipping as DeliveredIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  AssignmentTurnedIn as ReturnIcon,
  AssignmentReturn as CancelRequestIcon,
  Verified as ApproveRequestIcon,
  HighlightOff as RejectRequestIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutlined as ConfirmedIcon,
} from "@mui/icons-material";
import { apiGet, apiPost } from "@/API/api";

// ─── Tracking step constants (mirrors OrdersPage.jsx) ────────────────────────
const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Confirmed", badge: "Order Confirmed" },
  { key: "shipped", label: "Order Shipped", badge: "Order Shipped" },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    badge: "Out for Delivery",
  },
  { key: "delivered", label: "Order Delivered", badge: "Order Delivered" },
  { key: "return_requested", label: "Return Requested", badge: "Return Pending" },
  { key: "returned", label: "Returned", badge: "Returned" },
];

// Time thresholds in ms AFTER admin approval
const STEP_THRESHOLDS_MS = [
  0, // Order Confirmed  — immediately on approval
  1 * 60 * 1000, // Order Shipped    — 1 min after approval
  2 * 60 * 1000, // Out for Delivery — 2 min after approval
  3 * 60 * 1000, // Order Delivered  — 3 min after approval
];

const isOrderApproved = (order) => {
  const s = String(order?.status ?? "Pending")
    .trim()
    .toLowerCase();
  return ["processing", "shipped", "delivered", "returned"].includes(s);
};

const getTrackingStepIndex = (order, now) => {
  if (!isOrderApproved(order) || !order.approvedAt) return -1;
  const approvedTime = new Date(order.approvedAt).getTime();
  if (Number.isNaN(approvedTime)) return 0;
  const elapsed = now - approvedTime;
  let step = 0;
  for (let i = 0; i < STEP_THRESHOLDS_MS.length; i++) {
    if (elapsed >= STEP_THRESHOLDS_MS[i]) step = i;
    else break;
  }

  // After the order is delivered (step 3), evaluate the return flow:
  // - Return requested (pending)        → step 4 (Return Requested checkpoint)
  // - Return approved but < 1 min        → step 4 (still Return Requested)
  // - Return approved and >= 1 min       → step 5 (Returned)
  if (step >= 3 && order.returnRequest?.requested) {
    if (order.returnRequest?.status === "Pending") {
      return 4;
    }
    if (
      order.returnRequest?.status === "Approved" &&
      order.returnRequest?.processedAt
    ) {
      const processedTime = new Date(order.returnRequest.processedAt).getTime();
      if (Number.isNaN(processedTime) || now - processedTime >= 60000) {
        return 5;
      }
      return 4;
    }
  }

  return step;
};

/** Returns the same display-status that OrdersPage uses for a given order. */
const getAdminDisplayStatus = (order, now) => {
  if (
    order.cancelRequest?.requested &&
    order.cancelRequest?.status === "Pending"
  )
    return "Cancellation Pending";
  if (
    order.cancelRequest?.requested &&
    order.cancelRequest?.status === "Approved"
  )
    return "Cancelled";
  if (
    order.returnRequest?.requested &&
    order.returnRequest?.status === "Pending"
  )
    return "Return Pending";
  const stepIndex = getTrackingStepIndex(order, now);
  if (stepIndex < 0) return "Pending";
  return TRACKING_STEPS[stepIndex]?.badge || "Pending";
};
// ─────────────────────────────────────────────────────────────────────────────

const AdminOrders = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Keep 'now' ticking so tracking steps auto-advance
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/orders/admin/all");
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
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
      // Set status to Processing — this is the admin approval that unlocks the tracking line
      const res = await apiPost(`/orders/admin/${orderId}/status`, {
        status: "Processing",
      });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
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
      const res = await apiPost(`/orders/admin/${orderId}/cancel-request`, {
        action,
      });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnRequest = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      const res = await apiPost(`/orders/admin/${orderId}/return-request`, {
        action,
      });
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchOrders();
      }
    } catch (err) {
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getBuyerInfo = (order) => {
    const name =
      `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
      "Unknown Buyer";
    const email = order.shippingAddress?.email || "No Email";
    return { name, email };
  };

  /**
   * Chip that mirrors the tracking-line badge shown in OrdersPage.
   */
  const getStatusChip = (displayStatus) => {
    const baseSx = {
      fontWeight: 700,
      fontSize: "0.72rem",
      height: 28,
      borderRadius: "8px",
      letterSpacing: "0.2px",
    };

    switch (displayStatus) {
      case "Pending":
        return (
          <Chip
            icon={<PendingIcon sx={{ fontSize: 15 }} />}
            label="Pending"
            sx={{
              ...baseSx,
              backgroundColor: "#fef3c7",
              color: "#b45309",
              border: "1px solid #fcd34d",
              "& .MuiChip-icon": { color: "#b45309" },
            }}
          />
        );
      case "Order Confirmed":
        return (
          <Chip
            icon={<ConfirmedIcon sx={{ fontSize: 15 }} />}
            label="Order Confirmed"
            sx={{
              ...baseSx,
              backgroundColor: "#fef9c3",
              color: "#a16207",
              border: "1px solid #fde68a",
              "& .MuiChip-icon": { color: "#a16207" },
            }}
          />
        );
      case "Order Shipped":
        return (
          <Chip
            icon={<LocalShipping sx={{ fontSize: 15 }} />}
            label="Order Shipped"
            sx={{
              ...baseSx,
              backgroundColor: "#dbeafe",
              color: "#1d4ed8",
              border: "1px solid #93c5fd",
              "& .MuiChip-icon": { color: "#1d4ed8" },
            }}
          />
        );
      case "Out for Delivery":
        return (
          <Chip
            icon={<LocalShipping sx={{ fontSize: 15 }} />}
            label="Out for Delivery"
            sx={{
              ...baseSx,
              backgroundColor: "#e0e7ff",
              color: "#3730a3",
              border: "1px solid #c7d2fe",
              "& .MuiChip-icon": { color: "#3730a3" },
            }}
          />
        );
      case "Order Delivered":
        return (
          <Chip
            icon={<DeliveredIcon sx={{ fontSize: 15 }} />}
            label="Order Delivered"
            sx={{
              ...baseSx,
              backgroundColor: "#dcfce7",
              color: "#15803d",
              border: "1px solid #86efac",
              "& .MuiChip-icon": { color: "#15803d" },
            }}
          />
        );
      case "Cancellation Pending":
        return (
          <Chip
            icon={<CancelRequestIcon sx={{ fontSize: 15 }} />}
            label="Cancellation Pending"
            sx={{
              ...baseSx,
              backgroundColor: "#ffedd5",
              color: "#c2410c",
              border: "1px solid #fed7aa",
              "& .MuiChip-icon": { color: "#c2410c" },
            }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            icon={<RejectedIcon sx={{ fontSize: 15 }} />}
            label="Cancelled"
            sx={{
              ...baseSx,
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              "& .MuiChip-icon": { color: "#b91c1c" },
            }}
          />
        );
      case "Return Pending":
        return (
          <Chip
            icon={<ReturnIcon sx={{ fontSize: 15 }} />}
            label="Return Pending"
            sx={{
              ...baseSx,
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
              "& .MuiChip-icon": { color: "#92400e" },
            }}
          />
        );
      case "Returned":
        return (
          <Chip
            icon={<ConfirmedIcon sx={{ fontSize: 15 }} />}
            label="Returned"
            sx={{
              ...baseSx,
              backgroundColor: "#d1fae5",
              color: "#065f46",
              border: "1px solid #6ee7b7",
              "& .MuiChip-icon": { color: "#065f46" },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3.5 },
        bgcolor: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 2.75,
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
              }}
            >
              <StoreIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.3px",
                  lineHeight: 1.25,
                }}
              >
                Orders Management
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontSize: "0.84rem", mt: 0.25 }}
              >
                Review, approve and manage customer orders
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            disabled={loading}
            sx={{
              borderRadius: "10px",
              px: 2.25,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.875rem",
              borderColor: "#e2e8f0",
              color: "#475569",
              borderWidth: "1.5px",
              "&:hover": {
                borderColor: "#6366f1",
                background: alpha("#6366f1", 0.04),
                color: "#4f46e5",
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress
              size={42}
              thickness={4}
              sx={{ color: "#6366f1" }}
            />
          </Box>
        ) : orders.length === 0 ? (
          <Box
            sx={{
              py: 10,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)",
                color: "#6366f1",
                mb: 2.5,
                border: "1px solid #e2e8f0",
              }}
            >
              <ApproveIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}
            >
              No Orders Yet
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                textAlign: "center",
                maxWidth: 380,
                lineHeight: 1.65,
              }}
            >
              No customer orders have been placed yet. New orders will appear
              here for your review and approval.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {orders.map((order) => {
              const isActioning = actionLoading === order.orderId;
              const { name: buyerName, email: buyerEmail } =
                getBuyerInfo(order);
              const displayStatus = getAdminDisplayStatus(order, now);

              return (
                <Paper
                  key={order.orderId}
                  elevation={0}
                  sx={{
                    p: { xs: 2.25, md: 2.75 },
                    borderRadius: 2.5,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#c7d2fe",
                      boxShadow: "0 4px 16px rgba(79, 70, 229, 0.08)",
                    },
                  }}
                >
                  {/* Top row: Buyer + Status */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        avatar={
                          <Avatar
                            sx={{
                              bgcolor: "#4f46e5 !important",
                              color: "#fff !important",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          >
                            {buyerName.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        label={buyerName}
                        sx={{
                          backgroundColor: "#ede9fe",
                          color: "#4f46e5",
                          fontWeight: 700,
                          border: "1px solid #ddd6fe",
                          height: 32,
                          "& .MuiChip-label": { px: 1.25 },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.6,
                          fontWeight: 500,
                          fontSize: "0.8rem",
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 15, color: "#0284c7" }} />
                        {buyerEmail}
                      </Typography>
                    </Box>
                    {getStatusChip(displayStatus)}
                  </Box>

                  <Divider sx={{ borderColor: "#f1f5f9", mb: 2.25 }} />

                  {/* Main content grid */}
                  <Grid container spacing={2} alignItems="center">
                    {/* Product preview */}
                    <Grid item xs={12} sm={3.5} md={3}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.75,
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 54,
                            height: 54,
                            background:
                              "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)",
                            color: "#4f46e5",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                        >
                          {order.items?.[0]?.image ? (
                            <img
                              src={order.items[0].image}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "11px",
                              }}
                            />
                          ) : (
                            <ProductIcon />
                          )}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#0f172a",
                              fontSize: "0.93rem",
                              lineHeight: 1.3,
                            }}
                          >
                            {order.items?.length} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontSize: "0.75rem",
                              display: "block",
                              mt: 0.25,
                            }}
                          >
                            {order.orderId}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Meta info */}
                    <Grid item xs={12} sm={5} md={5.5}>
                      <Grid container spacing={1.5}>
                        {[
                          {
                            label: "TOTAL",
                            value: `$${(order.grandTotal || 0).toFixed(2)}`,
                            bold: true,
                          },
                          {
                            label: "DATE",
                            value: new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            ),
                          },
                          {
                            label: "PAYMENT",
                            value: order.paymentMethod || "Card",
                          },
                          {
                            label: "STATUS",
                            value: order.status,
                          },
                        ].map((item) => (
                          <Grid item xs={6} sm={3} key={item.label}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#94a3b8",
                                fontWeight: 700,
                                fontSize: "0.68rem",
                                letterSpacing: "0.4px",
                                display: "block",
                                mb: 0.35,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#0f172a",
                                fontWeight: item.bold ? 800 : 600,
                                fontSize: "0.875rem",
                              }}
                            >
                              {item.value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    {/* Actions */}
                    <Grid
                      item
                      xs={12}
                      sm={3.5}
                      md={3.5}
                      sx={{
                        display: "flex",
                        gap: 1.25,
                        justifyContent: { xs: "flex-start", sm: "flex-end" },
                        flexWrap: "wrap",
                      }}
                    >
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          onClick={() => handleView(order)}
                          sx={{
                            borderRadius: "10px",
                            width: 40,
                            height: 40,
                            background:
                              "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
                            color: "#fff",
                            boxShadow: "0 3px 10px rgba(79, 70, 229, 0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #4338ca 0%, #0369a1 100%)",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>

                      {order.status === "Pending" && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            isActioning ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <ApproveIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          disabled={isActioning}
                          onClick={() => handleApprove(order.orderId)}
                          sx={{
                            borderRadius: "10px",
                            px: 2.25,
                            py: 0.9,
                            fontWeight: 700,
                            textTransform: "none",
                            fontSize: "0.84rem",
                            background:
                              "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#fff",
                            boxShadow: "0 3px 10px rgba(22, 163, 74, 0.28)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          Approve
                        </Button>
                      )}

                      {order.cancelRequest?.requested &&
                        order.cancelRequest.status === "Pending" && (
                          <>
                            <Tooltip title="Approve Cancellation" arrow>
                              <IconButton
                                disabled={isActioning}
                                onClick={() =>
                                  handleCancelRequest(order.orderId, "approve")
                                }
                                sx={{
                                  borderRadius: "10px",
                                  width: 40,
                                  height: 40,
                                  background:
                                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                  color: "#fff",
                                  boxShadow:
                                    "0 3px 10px rgba(22, 163, 74, 0.28)",
                                  "&:hover": { transform: "translateY(-1px)" },
                                }}
                              >
                                <ApproveRequestIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Cancellation" arrow>
                              <IconButton
                                disabled={isActioning}
                                onClick={() =>
                                  handleCancelRequest(order.orderId, "reject")
                                }
                                sx={{
                                  borderRadius: "10px",
                                  width: 40,
                                  height: 40,
                                  background:
                                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                  color: "#fff",
                                  boxShadow:
                                    "0 3px 10px rgba(220, 38, 38, 0.28)",
                                  "&:hover": { transform: "translateY(-1px)" },
                                }}
                              >
                                <RejectRequestIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                      {order.returnRequest?.requested &&
                        order.returnRequest.status === "Pending" && (
                          <>
                            <Tooltip title="Approve Return" arrow>
                              <IconButton
                                disabled={isActioning}
                                onClick={() =>
                                  handleReturnRequest(order.orderId, "approve")
                                }
                                sx={{
                                  borderRadius: "10px",
                                  width: 40,
                                  height: 40,
                                  background:
                                    "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                  color: "#fff",
                                  boxShadow:
                                    "0 3px 10px rgba(22, 163, 74, 0.28)",
                                  "&:hover": { transform: "translateY(-1px)" },
                                }}
                              >
                                <ApproveRequestIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Return" arrow>
                              <IconButton
                                disabled={isActioning}
                                onClick={() =>
                                  handleReturnRequest(order.orderId, "reject")
                                }
                                sx={{
                                  borderRadius: "10px",
                                  width: 40,
                                  height: 40,
                                  background:
                                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                  color: "#fff",
                                  boxShadow:
                                    "0 3px 10px rgba(220, 38, 38, 0.28)",
                                  "&:hover": { transform: "translateY(-1px)" },
                                }}
                              >
                                <RejectRequestIcon sx={{ fontSize: 20 }} />
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

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 500 }}
          >
            Total:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>
              {orders.length}
            </Box>{" "}
            order{orders.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Paper>

      {/* ─── View Order Modal ─── */}
      {viewModalOpen && selectedOrder && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
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
              maxWidth: 860,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 3,
              bgcolor: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Box
              sx={{
                px: 3.5,
                py: 2.5,
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Order Details
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  {selectedOrder.orderId}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setViewModalOpen(false)}
                sx={{
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Grid container spacing={3.5}>
                {/* Shipping Address */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#64748b",
                      mb: 1.5,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.6px",
                    }}
                  >
                    Shipping Address
                  </Typography>
                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}
                    >
                      {getBuyerInfo(selectedOrder).name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#475569", lineHeight: 1.7 }}
                    >
                      {selectedOrder.shippingAddress?.address}
                      <br />
                      {selectedOrder.shippingAddress?.city}
                      {selectedOrder.shippingAddress?.postalCode
                        ? `, ${selectedOrder.shippingAddress.postalCode}`
                        : ""}
                      <br />
                      {getBuyerInfo(selectedOrder).email}
                    </Typography>
                  </Box>
                </Grid>

                {/* Price Breakdown */}
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#64748b",
                      mb: 1.5,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.6px",
                    }}
                  >
                    Price Breakdown
                  </Typography>
                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Stack spacing={1.1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Subtotal
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#0f172a" }}
                        >
                          ${(selectedOrder.subtotal || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Shipping
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#0f172a" }}
                        >
                          {selectedOrder.shipping === 0
                            ? "FREE"
                            : `$${(selectedOrder.shipping || 0).toFixed(2)}`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Tax
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#0f172a" }}
                        >
                          ${(selectedOrder.tax || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderColor: "#e2e8f0", my: 0.5 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                          Total
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                          ${(selectedOrder.grandTotal || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {/* Cancellation Request */}
              {selectedOrder.cancelRequest?.requested && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2.25,
                    borderRadius: 2,
                    bgcolor: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#991b1b",
                      mb: 1,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Cancellation Request{" "}
                    {selectedOrder.cancelRequest.status === "Pending"
                      ? "(Pending)"
                      : `(${selectedOrder.cancelRequest.status})`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", mb: 0.75 }}
                  >
                    <strong>Reason:</strong>{" "}
                    {selectedOrder.cancelRequest.reason}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontSize: "0.8rem" }}
                  >
                    Requested:{" "}
                    {new Date(
                      selectedOrder.cancelRequest.requestedAt,
                    ).toLocaleString()}
                    {selectedOrder.cancelRequest.processedAt && (
                      <span>
                        {" "}
                        · Processed:{" "}
                        {new Date(
                          selectedOrder.cancelRequest.processedAt,
                        ).toLocaleString()}
                      </span>
                    )}
                    {selectedOrder.cancelRequest.processedBy && (
                      <span>
                        {" "}
                        · By: {selectedOrder.cancelRequest.processedBy}
                      </span>
                    )}
                  </Typography>

                  {selectedOrder.cancelRequest.status === "Pending" && (
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ApproveRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() =>
                          handleCancelRequest(selectedOrder.orderId, "approve")
                        }
                        sx={{
                          borderRadius: "10px",
                          px: 2.25,
                          py: 0.9,
                          fontWeight: 700,
                          textTransform: "none",
                          background:
                            "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          boxShadow: "0 3px 10px rgba(22, 163, 74, 0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                          },
                        }}
                      >
                        Approve Cancellation
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RejectRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() =>
                          handleCancelRequest(selectedOrder.orderId, "reject")
                        }
                        sx={{
                          borderRadius: "10px",
                          px: 2.25,
                          py: 0.9,
                          fontWeight: 700,
                          textTransform: "none",
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          boxShadow: "0 3px 10px rgba(220, 38, 38, 0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                          },
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
                <Box
                  sx={{
                    mt: 3,
                    p: 2.25,
                    borderRadius: 2,
                    bgcolor: "#fffbeb",
                    border: "1px solid #fcd34d",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: "#92400e",
                      mb: 1,
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Return Request{" "}
                    {selectedOrder.returnRequest.status === "Pending"
                      ? "(Pending)"
                      : `(${selectedOrder.returnRequest.status})`}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", mb: 0.75 }}
                  >
                    <strong>Reason:</strong>{" "}
                    {selectedOrder.returnRequest.reason}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontSize: "0.8rem" }}
                  >
                    Requested:{" "}
                    {new Date(
                      selectedOrder.returnRequest.requestedAt,
                    ).toLocaleString()}
                    {selectedOrder.returnRequest.processedAt && (
                      <span>
                        {" "}
                        · Processed:{" "}
                        {new Date(
                          selectedOrder.returnRequest.processedAt,
                        ).toLocaleString()}
                      </span>
                    )}
                    {selectedOrder.returnRequest.processedBy && (
                      <span>
                        {" "}
                        · By: {selectedOrder.returnRequest.processedBy}
                      </span>
                    )}
                  </Typography>

                  {selectedOrder.returnRequest.status === "Pending" && (
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        gap: 1.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ApproveRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() =>
                          handleReturnRequest(selectedOrder.orderId, "approve")
                        }
                        sx={{
                          borderRadius: "10px",
                          px: 2.25,
                          py: 0.9,
                          fontWeight: 700,
                          textTransform: "none",
                          background:
                            "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          boxShadow: "0 3px 10px rgba(22, 163, 74, 0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                          },
                        }}
                      >
                        Approve Return
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<RejectRequestIcon />}
                        disabled={actionLoading === selectedOrder.orderId}
                        onClick={() =>
                          handleReturnRequest(selectedOrder.orderId, "reject")
                        }
                        sx={{
                          borderRadius: "10px",
                          px: 2.25,
                          py: 0.9,
                          fontWeight: 700,
                          textTransform: "none",
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          boxShadow: "0 3px 10px rgba(220, 38, 38, 0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                          },
                        }}
                      >
                        Reject Return
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {/* Items */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#64748b",
                  mt: 3.5,
                  mb: 1.75,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.6px",
                }}
              >
                Items Ordered
              </Typography>

              <Stack spacing={1.5}>
                {selectedOrder.items?.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {item.image ? (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1.5,
                          objectFit: "cover",
                          border: "1px solid #e2e8f0",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: "#ede9fe",
                          color: "#4f46e5",
                          borderRadius: 1.5,
                        }}
                      >
                        <ProductIcon />
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "0.95rem",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", mt: 0.25 }}
                      >
                        Qty: {item.quantity}
                        {item.color && ` · ${item.color}`}
                        {item.size && ` · Size ${item.size}`}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminOrders;
