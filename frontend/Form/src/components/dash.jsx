import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  alpha,
  Badge,
  Fade,
  Zoom,
} from "@mui/material";
import {
  ShoppingBag as ShoppingIcon,
  Verified as VerifiedIcon,
  HourglassTop as HourglassIcon,
  Cancel as RejectedIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  WarningAmber as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Diamond as DiamondIcon,
  RocketLaunch as RocketIcon,
  Stars as StarsIcon,
  LocalOffer as TagIcon,
  Timeline as TimelineIcon,
  Circle as CircleIcon,
  NotificationsActive as AlertIcon,
  PieChart as PieChartIcon,
  CheckCircle as ApprovedIcon,
  PendingActions as PendingIcon,
  Block as DeclinedIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { apiGet, getUserFromToken } from "@/API/api";

function Dash({ onNavigate }) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    declined: 0,
    totalStockValue: 0,
    totalStockVolume: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categories: [],
    recentProducts: [],
    criticalProducts: [],
    role: "User",
    name: "User",
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userObj = getUserFromToken();
    if (userObj) {
      setStats((prev) => ({
        ...prev,
        role: userObj.role || "Buyer",
        name: userObj.name || "User",
      }));
    }

    setLoading(true);
    apiGet("/users?limit=10000")
      .then((res) => {
        if (res.data && res.data.success) {
          const list = res.data.data || [];

          const totalVal = list.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.stock || 0),
            0,
          );
          const totalStockVol = list.reduce(
            (sum, item) => sum + Number(item.stock || 0),
            0,
          );
          const lowStock = list.filter(
            (item) =>
              Number(item.stock || 0) <= 5 && Number(item.stock || 0) > 0,
          ).length;
          const outOfStock = list.filter(
            (item) => Number(item.stock || 0) === 0,
          ).length;

          const categoriesMap = {};
          list.forEach((item) => {
            if (item.category) {
              categoriesMap[item.category] =
                (categoriesMap[item.category] || 0) + 1;
            }
          });
          const categoryList = Object.keys(categoriesMap)
            .map((cat) => ({
              name: cat,
              count: categoriesMap[cat],
              percentage: list.length
                ? Math.round((categoriesMap[cat] / list.length) * 100)
                : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setStats((prev) => ({
            ...prev,
            total: res.data.pagination?.totalRecords || list.length,
            approved: list.filter((i) => i.status === "approved" || !i.status)
              .length,
            pending: list.filter(
              (i) => i.status && i.status.startsWith("pending"),
            ).length,
            declined: list.filter((i) => i.status === "rejected").length,
            totalStockValue: totalVal,
            totalStockVolume: totalStockVol,
            lowStockCount: lowStock,
            outOfStockCount: outOfStock,
            categories: categoryList,
            recentProducts: list.slice(0, 6),
            criticalProducts: list
              .filter((item) => Number(item.stock || 0) <= 5)
              .slice(0, 5),
          }));
        }
      })
      .catch((err) => console.error("Error loading Dashboard metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const isBuyer = stats.role === "Buyer";

  const formattedStockValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(stats.totalStockValue);

  const healthPercentage =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const approvalRate =
    stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const pendingRate =
    stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  const declineRate =
    stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0;

  const adminCards = [
    {
      title: "Total Catalog",
      value: stats.total,
      subtitle: "Products in inventory",
      icon: <InventoryIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(102, 126, 234, 0.1)",
      accent: "#667eea",
      trend: `${stats.total} items`,
      trendUp: true,
    },
    {
      title: "Stock Value",
      value: formattedStockValue,
      subtitle: "Total inventory worth",
      icon: <MoneyIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "rgba(240, 147, 251, 0.1)",
      accent: "#f5576c",
      trend: "Total value",
      trendUp: true,
    },
    {
      title: "Low Stock",
      value: stats.lowStockCount,
      subtitle: "Items below threshold",
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      iconBg: "rgba(168, 237, 234, 0.1)",
      accent: "#f59e0b",
      trend: stats.lowStockCount > 0 ? "Needs attention" : "All good",
      trendUp: stats.lowStockCount === 0,
      pulse: stats.lowStockCount > 0,
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockCount,
      subtitle: "Unavailable items",
      icon: <RejectedIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",
      iconBg: "rgba(248, 54, 0, 0.1)",
      accent: "#dc2626",
      trend: stats.outOfStockCount > 0 ? "Critical" : "None",
      trendUp: stats.outOfStockCount === 0,
      pulse: stats.outOfStockCount > 0,
    },
    {
      title: "Approved Requests",
      value: stats.approved,
      subtitle: "Successfully approved",
      icon: <ApprovedIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      iconBg: "rgba(67, 233, 123, 0.1)",
      accent: "#10b981",
      trend: `${approvalRate}% approval rate`,
      trendUp: true,
    },
    {
      title: "Declined Requests",
      value: stats.declined,
      subtitle: "Rejected items",
      icon: <DeclinedIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      iconBg: "rgba(250, 112, 154, 0.1)",
      accent: "#ef4444",
      trend: stats.declined > 0 ? `${declineRate}% of total` : "None declined",
      trendUp: stats.declined === 0,
      pulse: stats.declined > 0,
    },
    {
      title: "Pending Requests",
      value: stats.pending,
      subtitle: "Awaiting review",
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      iconBg: "rgba(246, 211, 101, 0.1)",
      accent: "#f59e0b",
      trend: stats.pending > 0 ? `${pendingRate}% of total` : "All clear",
      trendUp: stats.pending === 0,
      pulse: stats.pending > 0,
    },
  ];

  const buyerCards = [
    {
      title: "Available Items",
      value: stats.approved,
      subtitle: "Ready to purchase",
      icon: <ShoppingIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      iconBg: "rgba(168, 237, 234, 0.15)",
      accent: "#10b981",
      trend: "In stock",
      trendUp: true,
    },
    {
      title: "Total Volume",
      value: stats.totalStockVolume,
      subtitle: "Units across sellers",
      icon: <InventoryIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
      iconBg: "rgba(212, 252, 121, 0.15)",
      accent: "#0284c7",
      trend: "Available",
      trendUp: true,
    },
    {
      title: "Pending Orders",
      value: stats.pending,
      subtitle: "Awaiting confirmation",
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      iconBg: "rgba(246, 211, 101, 0.15)",
      accent: "#f59e0b",
      trend: stats.pending > 0 ? "In progress" : "None",
      trendUp: true,
    },
    {
      title: "Declined Orders",
      value: stats.declined,
      subtitle: "Rejected requests",
      icon: <DeclinedIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      iconBg: "rgba(250, 112, 154, 0.15)",
      accent: "#ef4444",
      trend: stats.declined > 0 ? "Review needed" : "None",
      trendUp: stats.declined === 0,
    },
  ];

  const cards = isBuyer ? buyerCards : adminCards;

  const getStatusChip = (status) => {
    const s = status || "approved";
    if (s === "approved") {
      return (
        <Chip
          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
          label="Approved"
          size="small"
          sx={{
            bgcolor: alpha("#10b981", 0.1),
            color: "#059669",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 24,
            border: `1px solid ${alpha("#10b981", 0.2)}`,
            "& .MuiChip-icon": { color: "#059669" },
          }}
        />
      );
    } else if (s.startsWith("pending")) {
      return (
        <Chip
          icon={<HourglassIcon sx={{ fontSize: 14 }} />}
          label="Pending"
          size="small"
          sx={{
            bgcolor: alpha("#f59e0b", 0.1),
            color: "#d97706",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 24,
            border: `1px solid ${alpha("#f59e0b", 0.2)}`,
            "& .MuiChip-icon": { color: "#d97706" },
          }}
        />
      );
    } else {
      return (
        <Chip
          icon={<RejectedIcon sx={{ fontSize: 14 }} />}
          label="Rejected"
          size="small"
          sx={{
            bgcolor: alpha("#ef4444", 0.1),
            color: "#dc2626",
            fontWeight: 700,
            fontSize: "0.7rem",
            height: 24,
            border: `1px solid ${alpha("#ef4444", 0.2)}`,
            "& .MuiChip-icon": { color: "#dc2626" },
          }}
        />
      );
    }
  };

  const getStockProgress = (stock) => {
    const val = Math.min(100, (stock / 30) * 100);
    let color = "#10b981";
    let bgColor = alpha("#10b981", 0.1);
    if (stock === 0) {
      color = "#ef4444";
      bgColor = alpha("#ef4444", 0.1);
    } else if (stock <= 5) {
      color = "#f59e0b";
      bgColor = alpha("#f59e0b", 0.1);
    }

    return (
      <Box
        sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <LinearProgress
          variant="determinate"
          value={val}
          sx={{
            flexGrow: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: bgColor,
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            minWidth: 24,
            textAlign: "center",
            color: stock === 0 ? "#ef4444" : stock <= 5 ? "#d97706" : "#059669",
            bgcolor: bgColor,
            px: 1,
            py: 0.3,
            borderRadius: 1,
          }}
        >
          {stock}
        </Typography>
      </Box>
    );
  };

  const PulseDot = ({ active }) => {
    if (!active) return null;
    return (
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: "#ef4444",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            bgcolor: "#ef4444",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)", opacity: 1 },
              "100%": { transform: "scale(3)", opacity: 0 },
            },
          },
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: { xs: "100dvh", md: "100vh" },
        bgcolor: "#f8fafc",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "60%",
          background:
            "radial-gradient(circle at top right, rgba(102, 126, 234, 0.05), transparent 70%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "30%",
          height: "40%",
          background:
            "radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Enhanced Header Card - Full Width */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow:
              "0 20px 60px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
            mb: 4,
            width: "100%",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.5,
              pointerEvents: "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: { xs: 1.5, md: 3 },
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 0.8,
                    borderRadius: 20,
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))",
                    border: `1px solid ${alpha("#6366f1", 0.15)}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <DiamondIcon
                    sx={{
                      color: "#6366f1",
                      fontSize: 18,
                      animation: "spin 3s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6366f1",
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontSize: "0.7rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <CircleIcon sx={{ fontSize: 8, color: "#10b981" }} />
                    {stats.role} Dashboard
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    {currentTime.toLocaleTimeString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    •
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", md: "2.8rem" },
                  background:
                    "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                  letterSpacing: "-1px",
                  lineHeight: 1.2,
                }}
              >
                {greeting}, {stats.name}!
                <StarsIcon
                  sx={{
                    ml: 1,
                    color: "#f59e0b",
                    fontSize: 28,
                    verticalAlign: "middle",
                    animation: "bounce 2s infinite",
                    "@keyframes bounce": {
                      "0%, 100%": { transform: "translateY(0)" },
                      "50%": { transform: "translateY(-10px)" },
                    },
                  }}
                />
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#64748b",
                  maxWidth: "100%",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                }}
              >
                {isBuyer
                  ? "Discover premium products, track availability, and make informed purchasing decisions with real-time inventory insights."
                  : "Take control of your inventory management with powerful analytics, real-time stock monitoring, and streamlined product moderation."}
              </Typography>

              <Box sx={{ display: "flex", gap: { xs: 1.5, md: 3 }, mt: 3, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: alpha("#10b981", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VerifiedIcon sx={{ color: "#10b981", fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      System Status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#0f172a",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Operational
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: alpha("#6366f1", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TimelineIcon sx={{ color: "#6366f1", fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      Last Updated
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#0f172a",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Just now
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: alpha("#f59e0b", 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PieChartIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        fontWeight: 700,
                      }}
                    >
                      Health Score
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#0f172a",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      {healthPercentage}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Zoom in timeout={1000}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  px: 4,
                  py: 3,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid rgba(226, 232, 240, 0.6)",
                  boxShadow: "0 15px 40px rgba(15, 23, 42, 0.06)",
                  minWidth: 160,
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                  },
                }}
              >
                <RocketIcon
                  sx={{
                    color: "#6366f1",
                    fontSize: 32,
                    filter: "drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))",
                  }}
                />
                <Typography
                  sx={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 900,
                    fontSize: "2.5rem",
                    lineHeight: 1,
                  }}
                >
                  {stats.approved}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6366f1",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "0.7rem",
                    bgcolor: alpha("#6366f1", 0.08),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Active Listings
                </Typography>
              </Box>
            </Zoom>
          </Box>
        </Paper>
      </Fade>

      {/* Stats Cards Grid */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Grid container spacing={3}>
          {cards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={isBuyer ? 6 : 3} key={idx}>
              <Zoom in timeout={600 + idx * 100}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: "#ffffff",
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: "100%",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: card.gradient,
                      transition: "height 0.3s ease",
                    },
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(15, 23, 42, 0.1)",
                      "&::before": {
                        height: 6,
                      },
                      "& .card-icon": {
                        transform: "scale(1.1) rotate(10deg)",
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          fontWeight: 800,
                          letterSpacing: "1px",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        {card.pulse && <PulseDot active />}
                        <Typography
                          variant="caption"
                          sx={{
                            color: card.trendUp ? "#10b981" : "#ef4444",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            bgcolor: alpha(
                              card.trendUp ? "#10b981" : "#ef4444",
                              0.08,
                            ),
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                          }}
                        >
                          {card.trend}
                        </Typography>
                      </Box>
                    </Box>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        background: card.iconBg,
                        border: `2px solid ${alpha(card.accent, 0.1)}`,
                        transition: "all 0.3s ease",
                        boxShadow: `0 8px 16px ${alpha(card.accent, 0.1)}`,
                      }}
                    >
                      {React.cloneElement(card.icon, {
                        sx: { color: card.accent, fontSize: 28 },
                      })}
                    </Avatar>
                  </Box>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                      mb: 1,
                      letterSpacing: "-1px",
                      fontSize: { xs: "1.8rem", md: "2.2rem" },
                    }}
                  >
                    {card.value}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    {card.subtitle}
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Request Status Summary Bar */}
      {!isBuyer && (
        <Fade in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)",
              border: "1px solid rgba(226, 232, 240, 0.6)",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
              mb: 4,
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <ShieldIcon sx={{ color: "#6366f1", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}
              >
                Request Status Overview
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: { xs: 1.5, md: 3 }, flexWrap: "wrap" }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#10b981" }}
                  >
                    Approved ({approvalRate}%)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#10b981" }}
                  >
                    {stats.approved}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={approvalRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha("#10b981", 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#ef4444" }}
                  >
                    Declined ({declineRate}%)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#ef4444" }}
                  >
                    {stats.declined}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={declineRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha("#ef4444", 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      background: "linear-gradient(90deg, #ef4444, #f87171)",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#f59e0b" }}
                  >
                    Pending ({pendingRate}%)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: "#f59e0b" }}
                  >
                    {stats.pending}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pendingRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha("#f59e0b", 0.1),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Main Content Area */}
      <Box sx={{ width: "100%" }}>
        {/* Products Table - Full Width */}
        <Zoom in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 5,
              border: "1px solid rgba(226, 232, 240, 0.6)",
              bgcolor: "#ffffff",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
              mb: 4,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon sx={{ color: "#6366f1", fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      fontSize: "1.1rem",
                    }}
                  >
                    Recent Products
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 500 }}
                  >
                    Latest inventory additions
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${stats.recentProducts.length} items`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha("#6366f1", 0.08),
                  color: "#6366f1",
                  fontSize: "0.7rem",
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <Box sx={{ textAlign: "center" }}>
                  <LinearProgress
                    sx={{ width: 120, height: 6, borderRadius: 3, mb: 2 }}
                  />
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Loading products...
                  </Typography>
                </Box>
              </Box>
            ) : stats.recentProducts.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <InventoryIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 2 }} />
                <Typography
                  variant="body1"
                  sx={{ color: "#94a3b8", fontWeight: 600, mb: 1 }}
                >
                  No products yet
                </Typography>
                <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                  Add your first product to get started
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  border: "1px solid #f1f5f9",
                  borderRadius: 3,
                  overflow: { xs: "auto", md: "hidden" },
                  "& .MuiTableRow-root": {
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha("#6366f1", 0.02),
                    },
                  },
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: "#fafbfd",
                        "& .MuiTableCell-root": {
                          borderBottom: "2px solid #f1f5f9",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Product Details
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Category
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          width: 150,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Stock Level
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentProducts.map((product, index) => (
                      <TableRow
                        key={product.id}
                        sx={{
                          animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                          "@keyframes fadeIn": {
                            "0%": {
                              opacity: 0,
                              transform: "translateX(-10px)",
                            },
                            "100%": { opacity: 1, transform: "translateX(0)" },
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: alpha("#6366f1", 0.08),
                                color: "#6366f1",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                              }}
                            >
                              {product.productName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  color: "#334155",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {product.productName}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#94a3b8", fontSize: "0.7rem" }}
                              >
                                {product.brand || "Generic"} • SKU:{" "}
                                {product.sku || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.category || "Unassigned"}
                            size="small"
                            sx={{
                              bgcolor: "#f8fafc",
                              color: "#475569",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: "#0f172a",
                              fontSize: "0.9rem",
                            }}
                          >
                            ${Number(product.price || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>{getStockProgress(product.stock)}</TableCell>
                        <TableCell>{getStatusChip(product.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Zoom>

        {/* Top Categories and Stock Alerts Side by Side */}
        <Grid container spacing={3.5}>
          {/* Top Categories */}
          <Grid item xs={12} md={6}>
            <Zoom in timeout={900}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 5,
                  border: "1px solid rgba(226, 232, 240, 0.6)",
                  bgcolor: "#ffffff",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                  width: "100%",
                  height: "100%",
                  minHeight:
                    stats.criticalProducts.length > 0 ? "auto" : "400px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        background:
                          "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <PieChartIcon sx={{ color: "#10b981", fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: "1rem",
                        }}
                      >
                        Top Categories
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontSize: "0.7rem" }}
                      >
                        Distribution overview
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {stats.categories.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <TagIcon sx={{ fontSize: 36, color: "#e2e8f0", mb: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontStyle: "italic" }}
                    >
                      No categories yet
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {stats.categories.map((cat, idx) => {
                      const colors = [
                        { main: "#6366f1", light: alpha("#6366f1", 0.1) },
                        { main: "#10b981", light: alpha("#10b981", 0.1) },
                        { main: "#3b82f6", light: alpha("#3b82f6", 0.1) },
                        { main: "#f59e0b", light: alpha("#f59e0b", 0.1) },
                        { main: "#ec4899", light: alpha("#ec4899", 0.1) },
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <Box key={idx}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: color.main,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: "#475569",
                                  fontSize: "0.85rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {cat.name}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: "#64748b",
                                bgcolor: color.light,
                                px: 1.5,
                                py: 0.3,
                                borderRadius: 1,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                fontSize: "0.7rem",
                              }}
                            >
                              {cat.count} items
                            </Typography>
                          </Box>
                          <Box sx={{ position: "relative", mt: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={cat.percentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: color.light,
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 4,
                                  background: `linear-gradient(90deg, ${color.main}, ${alpha(color.main, 0.7)})`,
                                  transition:
                                    "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
                                },
                              }}
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 800,
                                  color: color.main,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {cat.percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Zoom>
          </Grid>

          {/* Stock Alerts (Admin only) */}
          {!isBuyer && (
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 5,
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    bgcolor: "#ffffff",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                    width: "100%",
                    height: "100%",
                    minHeight: "400px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2.5,
                          background:
                            "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <AlertIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "1rem",
                          }}
                        >
                          Stock Alerts
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#64748b", fontSize: "0.7rem" }}
                        >
                          Critical inventory items
                        </Typography>
                      </Box>
                    </Box>
                    {stats.criticalProducts.length > 0 && (
                      <Badge
                        badgeContent={stats.criticalProducts.length}
                        color="error"
                      >
                        <AlertIcon sx={{ color: "#ef4444" }} />
                      </Badge>
                    )}
                  </Box>

                  {stats.criticalProducts.length === 0 ? (
                    <Box
                      sx={{
                        py: 4,
                        textAlign: "center",
                        border: "2px dashed #e2e8f0",
                        borderRadius: 4,
                        bgcolor: "#fafbfd",
                      }}
                    >
                      <VerifiedIcon
                        sx={{ color: "#10b981", fontSize: 40, mb: 1.5 }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 800, color: "#059669", mb: 0.5 }}
                      >
                        All Clear!
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", display: "block" }}
                      >
                        No critical stock alerts
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {stats.criticalProducts.map((product) => {
                        const isOut = product.stock === 0;
                        return (
                          <Box
                            key={product.id}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: isOut
                                ? alpha("#ef4444", 0.2)
                                : alpha("#f59e0b", 0.2),
                              bgcolor: isOut
                                ? alpha("#fef2f2", 0.5)
                                : alpha("#fffbeb", 0.5),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 2,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateX(4px)",
                                borderColor: isOut ? "#ef4444" : "#f59e0b",
                                boxShadow: `0 4px 12px ${alpha(isOut ? "#ef4444" : "#f59e0b", 0.15)}`,
                              },
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                {isOut ? (
                                  <RejectedIcon
                                    sx={{
                                      color: "#ef4444",
                                      fontSize: 16,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <WarningIcon
                                    sx={{
                                      color: "#f59e0b",
                                      fontSize: 16,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <Typography
                                  noWrap
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 800,
                                    color: "#0f172a",
                                    fontSize: "0.85rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {product.productName}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  display: "block",
                                  ml: 4,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {product.category} • SKU: {product.sku || "N/A"}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              label={
                                isOut
                                  ? "OUT OF STOCK"
                                  : `ONLY ${product.stock} LEFT`
                              }
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.65rem",
                                bgcolor: isOut ? "#fef2f2" : "#fffbeb",
                                color: isOut ? "#dc2626" : "#d97706",
                                border: `1px solid ${isOut ? alpha("#ef4444", 0.3) : alpha("#f59e0b", 0.3)}`,
                                flexShrink: 0,
                                whiteSpace: "nowrap",
                                maxWidth: "fit-content",
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </Zoom>
            </Grid>
          )}

          {/* For buyer, show Quick Actions */}
          {isBuyer && (
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 5,
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    bgcolor: "#ffffff",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                    width: "100%",
                    height: "100%",
                    minHeight: "400px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        background:
                          "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShoppingIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: "1rem",
                        }}
                      >
                        Quick Actions
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", fontSize: "0.7rem" }}
                      >
                        Marketplace shortcuts
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid rgba(226, 232, 240, 0.6)",
                        bgcolor: alpha("#10b981", 0.03),
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: alpha("#10b981", 0.06),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#059669", mb: 0.5 }}
                      >
                        Browse Products
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Explore available inventory and make purchases
                      </Typography>
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid rgba(226, 232, 240, 0.6)",
                        bgcolor: alpha("#6366f1", 0.03),
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: alpha("#6366f1", 0.06),
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#4f46e5", mb: 0.5 }}
                      >
                        Track Orders
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Monitor your order status and history
                      </Typography>
                    </Paper>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}

export default Dash;
