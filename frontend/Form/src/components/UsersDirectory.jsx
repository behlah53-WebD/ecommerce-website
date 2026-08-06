import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  alpha,
  LinearProgress,
  Fade,
  Zoom,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  Storefront as StorefrontIcon,
  ShoppingBag as ShoppingBagIcon,
  AttachFile as AttachFileIcon,
  Inventory as InventoryIcon,
  Diamond as DiamondIcon,
  Stars as StarsIcon,
  Circle as CircleIcon,
  Verified as VerifiedIcon,
  RocketLaunch as RocketIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { apiGet } from "@/API/api";

function UsersDirectory({ roleFilter = "All" }) {
  const [users, setUsers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = roleFilter === "All" ? "/auth/users-list" : `/auth/users-list?role=${roleFilter}`;
      const userRes = await apiGet(url);
      if (userRes.data?.success) {
        setUsers(userRes.data.data || []);
      }

      const productsRes = await apiGet("/users?limit=10000");
      if (productsRes.data?.success) {
        setAllProducts(productsRes.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching directory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const emailMatch = user.authEmail?.toLowerCase().includes(query);
    const roleMatch = user.role?.toLowerCase().includes(query);
    
    const details = user.details?.[0] || {};
    const cityMatch = details.city?.toLowerCase().includes(query);
    const stateMatch = details.state?.toLowerCase().includes(query);
    const phoneMatch = details.phone?.toLowerCase().includes(query);
    const usernameMatch = details.username?.toLowerCase().includes(query);

    return nameMatch || emailMatch || roleMatch || cityMatch || stateMatch || phoneMatch || usernameMatch;
  });

  const totalCount = filteredUsers.length;
  const totalProductsCount = allProducts.length;

  const handleCardClick = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleDownloadFile = (file) => {
    if (!file.data) return;
    try {
      const link = document.createElement("a");
      link.href = file.data.startsWith("data:") 
        ? file.data 
        : `data:${file.mimetype || "application/octet-stream"};base64,${file.data}`;
      link.download = file.filename || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return { bg: alpha("#ec4899", 0.1), color: "#db2777", border: alpha("#ec4899", 0.3), gradient: "linear-gradient(135deg, #ec4899, #f472b6)" };
      case "Seller":
        return { bg: alpha("#f59e0b", 0.1), color: "#d97706", border: alpha("#f59e0b", 0.3), gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" };
      case "Buyer":
        return { bg: alpha("#3b82f6", 0.1), color: "#2563eb", border: alpha("#3b82f6", 0.3), gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" };
      default:
        return { bg: alpha("#6366f1", 0.1), color: "#4f46e5", border: alpha("#6366f1", 0.3), gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" };
    }
  };

  const getSellerProducts = (sellerId) => {
    return allProducts.filter((p) => p.sellerId === sellerId);
  };

  const getApprovalStatusChip = (user) => {
    if (user.role !== "Seller") return null;

    const status = user.approvalStatus || "approved";
    const isPending = status === "pending";

    return (
      <Chip
        size="small"
        label={isPending ? "Pending Approval" : "Approved"}
        icon={isPending ? <CircleIcon sx={{ fontSize: 12 }} /> : <VerifiedIcon sx={{ fontSize: 14 }} />}
        sx={{
          height: 24,
          fontSize: "0.68rem",
          fontWeight: 800,
          backgroundColor: isPending ? "#fef3c7" : "#dcfce7",
          color: isPending ? "#b45309" : "#15803d",
          border: `1px solid ${isPending ? "#fde68a" : "#bbf7d0"}`,
          "& .MuiChip-icon": {
            color: isPending ? "#f59e0b" : "#16a34a",
          },
        }}
      />
    );
  };

  const statCards = [
    {
      title: "Total Accounts",
      value: totalCount,
      icon: <GroupsIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "rgba(102, 126, 234, 0.1)",
      accent: "#667eea",
      always: true,
    },
    ...(roleFilter === "All" ? [
      {
        title: "Sellers",
        value: users.filter(u => u.role === "Seller").length,
        icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
        gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
        iconBg: "rgba(246, 211, 101, 0.1)",
        accent: "#f59e0b",
      },
      {
        title: "Buyers",
        value: users.filter(u => u.role === "Buyer").length,
        icon: <PersonIcon sx={{ fontSize: 28 }} />,
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        iconBg: "rgba(59, 130, 246, 0.1)",
        accent: "#3b82f6",
      },
    ] : roleFilter === "Seller" ? [
      {
        title: "Marketplace Listings",
        value: totalProductsCount,
        icon: <ShoppingBagIcon sx={{ fontSize: 28 }} />,
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        iconBg: "rgba(16, 185, 129, 0.1)",
        accent: "#10b981",
      },
    ] : [
      {
        title: "Unique Cities",
        value: new Set(users.map(u => u.details?.[0]?.city).filter(Boolean)).size,
        icon: <PublicIcon sx={{ fontSize: 28 }} />,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        iconBg: "rgba(240, 147, 251, 0.1)",
        accent: "#f5576c",
      },
    ]),
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      minHeight: "100vh", 
      bgcolor: "#f8fafc",
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '60%',
        background: 'radial-gradient(circle at top right, rgba(102, 126, 234, 0.05), transparent 70%)',
        pointerEvents: 'none',
      },
    }}>
      {/* Enhanced Header */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)',
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)',
            mb: 4,
            position: "relative",
            overflow: "hidden",
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.5,
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 0.8,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))',
                    border: `1px solid ${alpha("#6366f1", 0.15)}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <DiamondIcon sx={{ color: "#6366f1", fontSize: 18, animation: 'spin 3s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: "#6366f1", 
                      fontWeight: 800, 
                      letterSpacing: "1.5px", 
                      textTransform: "uppercase", 
                      fontSize: "0.7rem",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <CircleIcon sx={{ fontSize: 8, color: '#10b981' }} />
                    {roleFilter} Directory
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", md: "2.8rem" },
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: "-1px",
                  lineHeight: 1.2,
                }}
              >
                {roleFilter === "All" ? "User Management" : roleFilter === "Buyer" ? "Buyers Directory" : "Sellers Directory"}
                <StarsIcon sx={{ ml: 1, color: '#f59e0b', fontSize: 28, verticalAlign: 'middle', animation: 'bounce 2s infinite', '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } } }} />
              </Typography>
              <Typography variant="body1" sx={{ color: "#64748b", maxWidth: '100%', fontSize: "1rem", lineHeight: 1.6 }}>
                {roleFilter === "All" 
                  ? "Manage and monitor all registered users across the platform with real-time insights." 
                  : roleFilter === "Buyer" 
                    ? "View comprehensive buyer profiles and track their marketplace activity." 
                    : "Monitor seller performance, product catalogs, and inventory metrics."}
              </Typography>
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
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: "1px solid rgba(226, 232, 240, 0.6)",
                  boxShadow: '0 15px 40px rgba(15, 23, 42, 0.06)',
                  minWidth: 160,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                  },
                }}
              >
                <RocketIcon sx={{ color: '#6366f1', fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))' }} />
                <Typography sx={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900, 
                  fontSize: "2.5rem",
                  lineHeight: 1,
                }}>
                  {totalCount}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#6366f1", 
                    fontWeight: 800, 
                    textTransform: "uppercase", 
                    letterSpacing: "1px", 
                    fontSize: "0.7rem",
                    bgcolor: alpha('#6366f1', 0.08),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Total Users
                </Typography>
              </Box>
            </Zoom>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.2)",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.2,
                fontSize: '0.85rem',
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
                },
              }}
            >
              Refresh Directory
            </Button>
          </Box>
        </Paper>
      </Fade>

      {/* Stats Cards */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Grid container spacing={3}>
          {statCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={roleFilter === "All" ? 4 : 6} key={idx}>
              <Zoom in timeout={600 + idx * 100}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: '#ffffff',
                    border: "1px solid rgba(226, 232, 240, 0.6)",
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    cursor: 'pointer',
                    height: '100%',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: card.gradient,
                      transition: 'height 0.3s ease',
                    },
                    '&:hover': {
                      transform: "translateY(-6px)",
                      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                      '&::before': { height: 6 },
                      '& .stat-icon': { transform: 'scale(1.1) rotate(10deg)' },
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ color: "#64748b", fontWeight: 800, letterSpacing: "1px", fontSize: '0.65rem', textTransform: 'uppercase' }}
                    >
                      {card.title}
                    </Typography>
                    <Avatar 
                      className="stat-icon"
                      sx={{ 
                        width: 48, height: 48, 
                        background: card.iconBg,
                        border: `2px solid ${alpha(card.accent, 0.1)}`,
                        transition: 'all 0.3s ease',
                        boxShadow: `0 8px 16px ${alpha(card.accent, 0.1)}`,
                      }}
                    >
                      {React.cloneElement(card.icon, { sx: { color: card.accent, fontSize: 28 } })}
                    </Avatar>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-1px" }}>
                    {card.value}
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Search & View Toggle */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 4,
          border: "1px solid rgba(226, 232, 240, 0.6)",
          background: "#ffffff",
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name, email, username, city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: { xs: "100%", md: 400 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#f8fafc",
              transition: 'all 0.3s ease',
              '&:hover': { backgroundColor: '#f1f5f9' },
              '&.Mui-focused': { 
                backgroundColor: '#ffffff',
                boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.1)}`,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip 
            label={`${filteredUsers.length} users found`} 
            size="small" 
            sx={{ 
              fontWeight: 700, 
              bgcolor: alpha('#6366f1', 0.08),
              color: '#6366f1',
              fontSize: '0.7rem',
              mr: 1,
            }} 
          />
          <Tooltip title="Grid View">
            <IconButton 
              onClick={() => setViewMode("grid")} 
              color={viewMode === "grid" ? "primary" : "default"}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: viewMode === "grid" ? "#6366f1" : "#e2e8f0",
                bgcolor: viewMode === "grid" ? alpha("#6366f1", 0.08) : "transparent",
                transition: 'all 0.3s ease',
              }}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton 
              onClick={() => setViewMode("list")} 
              color={viewMode === "list" ? "primary" : "default"}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: viewMode === "list" ? "#6366f1" : "#e2e8f0",
                bgcolor: viewMode === "list" ? alpha("#6366f1", 0.08) : "transparent",
                transition: 'all 0.3s ease',
              }}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Content Area */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12, flexDirection: 'column', gap: 3 }}>
          <CircularProgress size={48} sx={{ color: "#6366f1" }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Loading directory data...
          </Typography>
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Fade in timeout={500}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              borderRadius: 5, 
              border: "2px dashed #e2e8f0", 
              textAlign: "center", 
              bgcolor: "#ffffff",
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            }}
          >
            <Avatar sx={{ width: 72, height: 72, bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', mx: "auto", mb: 2 }}>
              <SearchIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
              No accounts found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              We couldn't find any users matching "{searchQuery}"
            </Typography>
          </Paper>
        </Fade>
      ) : viewMode === "grid" ? (
        <Grid container spacing={3}>
          {filteredUsers.map((user, index) => {
            const roleStyle = getRoleBadgeColor(user.role);
            const userDetails = user.details?.[0] || {};
            const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
            const sellerProductsList = user.role === "Seller" ? getSellerProducts(user.id) : [];

            return (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Zoom in timeout={600 + index * 50}>
                  <Card
                    elevation={0}
                    onClick={() => handleCardClick(user)}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid rgba(226, 232, 240, 0.6)",
                      background: '#ffffff',
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: roleStyle.gradient,
                        transition: 'height 0.3s ease',
                      },
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
                        borderColor: alpha(roleStyle.color, 0.3),
                        '&::before': { height: 6 },
                        '& .user-avatar': { transform: 'scale(1.05)' },
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
                        <Avatar
                          className="user-avatar"
                          sx={{
                            width: 56,
                            height: 56,
                            background: roleStyle.gradient,
                            fontSize: "1.3rem",
                            fontWeight: 800,
                            boxShadow: `0 4px 12px ${alpha(roleStyle.color, 0.2)}`,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                        </Avatar>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, alignItems: "flex-end" }}>
                          <Chip
                            size="small"
                            label={user.role}
                            icon={user.role === "Seller" ? <StorefrontIcon sx={{ fontSize: 14 }} /> : user.role === "Buyer" ? <ShoppingBagIcon sx={{ fontSize: 14 }} /> : <VerifiedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.7rem",
                              height: 26,
                              px: 1,
                              backgroundColor: roleStyle.bg,
                              color: roleStyle.color,
                              border: `1px solid ${roleStyle.border}`,
                              '& .MuiChip-icon': { color: roleStyle.color },
                            }}
                          />
                          {getApprovalStatusChip(user)}
                        </Box>
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5, lineHeight: 1.2, fontSize: '1rem' }}>
                        {user.name || "Unnamed User"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "center", gap: 0.8, mb: 2, fontSize: "0.85rem" }}>
                        <EmailIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                        {user.authEmail}
                      </Typography>

                      <Divider sx={{ borderColor: "#f1f5f9", my: 2 }} />

                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                            JOINED
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.8rem", mt: 0.3 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                            {registrationDate}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                            LOCATION
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.8rem", mt: 0.3 }}>
                            <LocationOnIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                            {userDetails.city && userDetails.state ? `${userDetails.city}, ${userDetails.state}` : userDetails.city || userDetails.state || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>

                      {user.role === "Seller" && (
                        <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: alpha('#f59e0b', 0.03), border: `1px solid ${alpha('#f59e0b', 0.1)}` }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: '0.7rem' }}>
                              Listed Products
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#0f172a", fontWeight: 800, bgcolor: alpha('#f59e0b', 0.1), px: 1, py: 0.3, borderRadius: 1 }}>
                              {user.productStats?.count || sellerProductsList.length} Items
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: '0.7rem' }}>
                              Stock Value
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 800 }}>
                              ₹{(user.productStats?.value || sellerProductsList.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: "flex-end" }}>
                      <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                        View Profile &rarr;
                      </Typography>
                    </CardActions>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Fade in timeout={500}>
          <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ 
              borderRadius: 4, 
              border: "1px solid rgba(226, 232, 240, 0.6)", 
              overflow: "hidden",
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
              '& .MuiTableRow-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha('#6366f1', 0.02),
                },
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafbfd' }}>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Details</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role / Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stats</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, index) => {
                  const roleStyle = getRoleBadgeColor(user.role);
                  const userDetails = user.details?.[0] || {};
                  const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
                  const sellerProductsList = user.role === "Seller" ? getSellerProducts(user.id) : [];

                  return (
                    <TableRow 
                      key={user.id} 
                      hover 
                      onClick={() => handleCardClick(user)}
                      sx={{ 
                        cursor: "pointer", 
                        "&:last-child td, &:last-child th": { border: 0 },
                        animation: `fadeIn 0.5s ease-out ${index * 0.03}s both`,
                        '@keyframes fadeIn': {
                          '0%': { opacity: 0, transform: 'translateX(-10px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' },
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ 
                            width: 40, height: 40,
                            background: roleStyle.gradient,
                            color: '#ffffff',
                            fontWeight: 700, 
                            fontSize: "0.9rem",
                            boxShadow: `0 4px 8px ${alpha(roleStyle.color, 0.2)}`,
                          }}>
                            {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                              {user.name || "User"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: '0.7rem' }}>
                              @{userDetails.username || user.name || 'user'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#334155", fontSize: '0.85rem' }}>
                          {user.authEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.8 }}>
                          <Chip
                            size="small"
                            label={user.role}
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.68rem",
                              height: 24,
                              backgroundColor: roleStyle.bg,
                              color: roleStyle.color,
                              border: `1px solid ${roleStyle.border}`,
                            }}
                          />
                          {getApprovalStatusChip(user)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#475569", fontSize: '0.85rem' }}>
                          {userDetails.city && userDetails.state ? `${userDetails.city}, ${userDetails.state}` : userDetails.city || userDetails.state || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#475569", fontSize: '0.85rem' }}>
                          {registrationDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.role === "Seller" ? (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block" }}>
                              {user.productStats?.count || sellerProductsList.length} items
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 700 }}>
                              ₹{(user.productStats?.value || sellerProductsList.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: 'italic' }}>
                            &mdash;
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small"
                          sx={{ 
                            textTransform: "none", 
                            fontWeight: 700, 
                            color: "#6366f1",
                            fontSize: '0.8rem',
                            bgcolor: alpha('#6366f1', 0.05),
                            px: 2,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha('#6366f1', 0.1),
                            },
                          }}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      )}

      {/* Enhanced Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520 },
            borderLeft: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "-20px 0 60px rgba(15, 23, 42, 0.1)",
            p: 0,
            display: "flex",
            flexDirection: "column",
            background: 'linear-gradient(180deg, #ffffff 0%, #fafbfd 100%)',
          },
        }}
      >
        {selectedUser && (() => {
          const userDetails = selectedUser.details?.[0] || {};
          const registrationDate = selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
          const roleStyle = getRoleBadgeColor(selectedUser.role);
          const sellerProductsList = selectedUser.role === "Seller" ? getSellerProducts(selectedUser.id) : [];

          return (
            <>
              <Box sx={{ 
                p: 3, 
                borderBottom: "1px solid #e2e8f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                backdropFilter: 'blur(10px)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DiamondIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: '1.1rem' }}>
                    User Profile
                  </Typography>
                </Box>
                <IconButton 
                  onClick={handleCloseDrawer} 
                  sx={{ 
                    color: "#64748b",
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: alpha('#6366f1', 0.08), color: '#6366f1' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box sx={{ p: 4, flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 3 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: roleStyle.color,
                        border: '3px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {selectedUser.role === "Seller" ? <StorefrontIcon sx={{ fontSize: 12, color: '#fff' }} /> : 
                         selectedUser.role === "Buyer" ? <ShoppingBagIcon sx={{ fontSize: 12, color: '#fff' }} /> : 
                         <VerifiedIcon sx={{ fontSize: 12, color: '#fff' }} />}
                      </Box>
                    }
                  >
                    <Avatar
                      sx={{
                        width: 88,
                        height: 88,
                        background: roleStyle.gradient,
                        fontSize: "2rem",
                        fontWeight: 800,
                        boxShadow: `0 8px 24px ${alpha(roleStyle.color, 0.3)}`,
                        mb: 2,
                      }}
                    >
                      {selectedUser.name ? selectedUser.name[0].toUpperCase() : <PersonIcon fontSize="large" />}
                    </Avatar>
                  </Badge>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                    @{userDetails.username || selectedUser.name || 'user'}
                  </Typography>
                  <Chip
                    size="small"
                    label={selectedUser.role}
                    icon={selectedUser.role === "Seller" ? <StorefrontIcon sx={{ fontSize: 14 }} /> : selectedUser.role === "Buyer" ? <ShoppingBagIcon sx={{ fontSize: 14 }} /> : <VerifiedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      px: 1.5,
                      py: 2,
                      backgroundColor: roleStyle.bg,
                      color: roleStyle.color,
                      border: `1px solid ${roleStyle.border}`,
                      '& .MuiChip-icon': { color: roleStyle.color },
                    }}
                  />
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6366f1", mb: 2, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "1.5px", display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedIcon sx={{ fontSize: 14 }} />
                    Account Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          User ID
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: '0.8rem', wordBreak: 'break-all' }}>
                          {selectedUser.id}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 0.5, fontSize: '0.85rem' }}>
                          <EmailIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                          {selectedUser.authEmail}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Username
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                          {userDetails.username || selectedUser.name || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Registered
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 0.5, fontSize: '0.85rem' }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                          {registrationDate}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6366f1", mb: 2, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "1.5px", display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 14 }} />
                    Personal Details
                  </Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          First Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                          {userDetails.firstName || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Last Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155" }}>
                          {userDetails.lastName || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                          {userDetails.phone || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600, mb: 0.5 }}>
                          Location
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: "#6366f1" }} />
                          {userDetails.city && userDetails.state ? `${userDetails.city}, ${userDetails.state}` : userDetails.city || userDetails.state || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ borderColor: "#f1f5f9" }} />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6366f1", mb: 2, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "1.5px", display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon sx={{ fontSize: 14 }} />
                    Verification Files
                  </Typography>
                  {userDetails.files && userDetails.files.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {userDetails.files.map((file, idx) => (
                        <Paper
                          key={idx}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid #e2e8f0",
                            bgcolor: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: 'all 0.3s ease',
                            '&:hover': { borderColor: '#6366f1', boxShadow: `0 4px 12px ${alpha('#6366f1', 0.1)}` },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#6366f1', 0.08), color: '#6366f1' }}>
                              <AttachFileIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap variant="body2" sx={{ fontWeight: 700, color: "#334155", fontSize: '0.85rem' }}>
                                {file.filename}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "N/A"} • {file.mimetype || "unknown"}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownloadFile(file)} 
                            sx={{ 
                              color: "#6366f1",
                              transition: 'all 0.3s ease',
                              '&:hover': { bgcolor: alpha('#6366f1', 0.1) },
                            }}
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "2px dashed #e2e8f0", bgcolor: '#fafbfd', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                        No verification documents uploaded
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {selectedUser.role === "Seller" && (
                  <>
                    <Divider sx={{ borderColor: "#f1f5f9" }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#6366f1", mb: 2, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "1.5px", display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon sx={{ fontSize: 14 }} />
                        Product Inventory ({sellerProductsList.length})
                      </Typography>
                      {sellerProductsList.length > 0 ? (
                        <TableContainer 
                          component={Paper} 
                          elevation={0} 
                          sx={{ 
                            border: "1px solid #e2e8f0", 
                            borderRadius: 3, 
                            maxHeight: 320, 
                            overflowY: "auto",
                            '& .MuiTableRow-root': {
                              transition: 'all 0.2s ease',
                              '&:hover': { bgcolor: alpha('#6366f1', 0.02) },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: "#f8fafc", color: '#475569' }}>Product</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: "#f8fafc", color: '#475569' }}>SKU</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: "#f8fafc", color: '#475569' }}>Price</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.7rem", bgcolor: "#f8fafc", color: '#475569' }}>Stock</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sellerProductsList.map((product) => (
                                <TableRow key={product.id} hover>
                                  <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                    <Box>
                                      {product.productName}
                                      <Typography variant="caption" sx={{ display: "block", color: "#94a3b8", fontSize: "0.65rem" }}>
                                        {product.category}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                                    {product.sku || "N/A"}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                                    ₹{Number(product.price || 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={product.stock} 
                                      size="small"
                                      sx={{ 
                                        height: 20, 
                                        fontSize: "0.65rem", 
                                        fontWeight: 800,
                                        bgcolor: product.stock === 0 ? alpha('#ef4444', 0.1) : product.stock <= 5 ? alpha('#f59e0b', 0.1) : alpha('#10b981', 0.1),
                                        color: product.stock === 0 ? "#dc2626" : product.stock <= 5 ? "#d97706" : "#059669",
                                        border: `1px solid ${product.stock === 0 ? alpha('#ef4444', 0.3) : product.stock <= 5 ? alpha('#f59e0b', 0.3) : alpha('#10b981', 0.3)}`,
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "2px dashed #e2e8f0", bgcolor: '#fafbfd', textAlign: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                          <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                            No products listed yet
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </>
          );
        })()}
      </Drawer>
    </Box>
  );
}

export default UsersDirectory;
