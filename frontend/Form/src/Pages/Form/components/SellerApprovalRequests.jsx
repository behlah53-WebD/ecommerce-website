import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Storefront as StorefrontIcon,
  HourglassEmpty as PendingIcon,
  Verified as VerifiedIcon,
} from "@mui/icons-material";
import { apiGet, apiPost } from "@/API/api";

const SellerApprovalRequests = ({ showToast }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/auth/seller-approval-requests");
      if (res.data?.success) {
        setSellers(res.data.data || []);
      }
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSellers();
  }, [fetchSellers]);

  const handleApprove = async (sellerId) => {
    setActionLoading(sellerId);
    try {
      const res = await apiPost(`/auth/seller-approval-requests/${sellerId}/approve`);
      if (res.data?.success) {
        if (showToast) showToast(res.data.message, "success");
        fetchSellers();
      }
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.message || err.message, "error");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const pendingSellers = sellers.filter(
    (seller) => (seller.approvalStatus || "approved") === "pending",
  );
  const approvedSellers = sellers.filter(
    (seller) => (seller.approvalStatus || "approved") === "approved",
  );

  const renderStatus = (status) => {
    if (status === "pending") {
      return (
        <Chip
          icon={<PendingIcon fontSize="small" />}
          label="Pending"
          sx={{
            bgcolor: "#fef3c7",
            color: "#b45309",
            border: "1px solid #fde68a",
            fontWeight: 800,
          }}
        />
      );
    }

    return (
      <Chip
        icon={<VerifiedIcon fontSize="small" />}
        label="Approved"
        sx={{
          bgcolor: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          fontWeight: 800,
        }}
      />
    );
  };

  const renderSellerCard = (seller, canApprove) => {
    const isActioning = actionLoading === seller.id;

    return (
      <Paper
        key={seller.id}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 54,
                height: 54,
                bgcolor: alpha("#f59e0b", 0.14),
                color: "#d97706",
                fontWeight: 900,
              }}
            >
              {seller.name ? seller.name[0].toUpperCase() : <StorefrontIcon />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1rem" }}>
                {seller.name || "Seller"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  wordBreak: "break-word",
                }}
              >
                <EmailIcon sx={{ fontSize: 16, color: "#0284c7" }} />
                {seller.authEmail}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Registered {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "recently"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {renderStatus(seller.approvalStatus || "approved")}
            {canApprove && (
              <Button
                variant="contained"
                startIcon={isActioning ? <CircularProgress size={18} color="inherit" /> : <ApproveIcon />}
                disabled={isActioning}
                onClick={() => handleApprove(seller.id)}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 800,
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#15803d" },
                }}
              >
                Approve
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
          <Avatar sx={{ bgcolor: "#f59e0b", color: "#fff", width: 48, height: 48 }}>
            <StorefrontIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
              Seller Register Approval
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Approve seller accounts before they can sign in.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSellers}
          disabled={loading}
          sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 800 }}
        >
          Refresh
        </Button>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              Pending Requests ({pendingSellers.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {pendingSellers.length
                ? pendingSellers.map((seller) => renderSellerCard(seller, true))
                : (
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                      No seller accounts are waiting for approval.
                    </Typography>
                  </Paper>
                )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 1.5 }}>
              Approved Sellers ({approvedSellers.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {approvedSellers.length
                ? approvedSellers.map((seller) => renderSellerCard(seller, false))
                : (
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
                      No approved sellers yet.
                    </Typography>
                  </Paper>
                )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SellerApprovalRequests;
