import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Avatar,
  Paper,
  alpha,
  Badge,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DiamondIcon from "@mui/icons-material/Diamond";
import StarsIcon from "@mui/icons-material/Stars";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import VerifiedIcon from "@mui/icons-material/Verified";
import CircleIcon from "@mui/icons-material/Circle";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const drawerWidth = { xs: 72, sm: 84, md: 280 };

function Sidebar({ activeView, onChangeView, currentUser }) {
  const role = currentUser?.role || "Buyer";
  const userName = currentUser?.name || "User";

  const getRoleColor = (userRole) => {
    switch (userRole) {
      case "Admin":
        return {
          bg: alpha("#ec4899", 0.1),
          color: "#db2777",
          border: alpha("#ec4899", 0.3),
          gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
          icon: <VerifiedIcon sx={{ fontSize: 14 }} />,
          badge: "👑",
        };
      case "Seller":
        return {
          bg: alpha("#f59e0b", 0.1),
          color: "#d97706",
          border: alpha("#f59e0b", 0.3),
          gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
          icon: <StorefrontIcon sx={{ fontSize: 14 }} />,
          badge: "🏪",
        };
      case "Buyer":
        return {
          bg: alpha("#3b82f6", 0.1),
          color: "#2563eb",
          border: alpha("#3b82f6", 0.3),
          gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
          icon: <ShoppingBagIcon sx={{ fontSize: 14 }} />,
          badge: "🛒",
        };
      default:
        return {
          bg: alpha("#6366f1", 0.1),
          color: "#4f46e5",
          border: alpha("#6366f1", 0.3),
          gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          icon: <PersonIcon sx={{ fontSize: 14 }} />,
          badge: "👤",
        };
    }
  };

  const roleStyle = getRoleColor(role);

  const menuItems = [
    {
      label: "Dashboard Overview",
      icon: <DashboardIcon />,
      value: "Dashboard",
      description: "Analytics & insights",
    },
    {
      label: "Products Catalog",
      icon: <ShoppingBagIcon />,
      value: "user",
      description: "Manage inventory",
    },
  ];

  if (role === "Admin") {
    menuItems.push(
      {
        label: "Approval Requests",
        icon: <HowToRegIcon />,
        value: "requests",
        description: "Review & moderate",
      },
      {
        label: "Orders Management",
        icon: <ReceiptIcon />,
        value: "orders",
        description: "Manage orders & approve",
      },
      {
        label: "All Users",
        icon: <PeopleIcon />,
        value: "users",
        description: "User management",
      },
      {
        label: "Buyers Directory",
        icon: <PersonIcon />,
        value: "buyers",
        description: "Customer profiles",
      },
      {
        label: "Sellers Directory",
        icon: <StorefrontIcon />,
        value: "sellers",
        description: "Merchant details",
      },
    );
  }

  if (role === "Seller") {
    menuItems.push({
      label: "My Orders",
      icon: <ReceiptIcon />,
      value: "seller-orders",
      description: "View orders for your products",
    });
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #ffffff 0%, #fafbfd 100%)",
          borderRight: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow:
            "8px 0 40px rgba(15, 23, 42, 0.06), 2px 0 8px rgba(15, 23, 42, 0.02)",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          overflow: "hidden",
          transition: "width 0.25s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.03), transparent 70%)",
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "40%",
            background:
              "radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.02), transparent 70%)",
            pointerEvents: "none",
          },
        },
      }}
    >
      {/* Fixed Layout Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          alignItems: { xs: "center", md: "stretch" },
        }}
      >
        {/* ===== FIXED TOP SECTION ===== */}
        <Box sx={{ flexShrink: 0 }}>
          {/* Brand Header */}
          <Box sx={{ px: { xs: 1.5, md: 3 }, pt: 2.5, pb: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: { xs: 44, md: 48 },
                  height: { xs: 44, md: 48 },
                  borderRadius: { xs: 3, md: 3.5 },
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 8px 24px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(102, 126, 234, 0.15)",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: -2,
                    borderRadius: 4,
                    background:
                      "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                    opacity: 0.3,
                    zIndex: -1,
                  },
                  animation: "logoGlow 3s ease-in-out infinite",
                  "@keyframes logoGlow": {
                    "0%, 100%": {
                      boxShadow:
                        "0 8px 24px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(102, 126, 234, 0.15)",
                    },
                    "50%": {
                      boxShadow:
                        "0 8px 32px rgba(102, 126, 234, 0.5), 0 2px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              >
                <DiamondIcon
                  sx={{
                    color: "#fff",
                    fontSize: 26,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  }}
                />
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    background:
                      "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  Market Hub
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <CircleIcon sx={{ fontSize: 8, color: "#10b981" }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    PRO PORTAL
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider
            sx={{
              borderColor: "#f1f5f9",
              mx: { xs: 1.5, md: 3 },
              my: 1.5,
              width: { xs: 44, md: "auto" },
            }}
          />

          {/* User Profile Card */}
          <Box sx={{ px: { xs: 1, md: 2.5 }, py: 1.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1, md: 2 },
                borderRadius: { xs: 3, md: 4 },
                background: "linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: { xs: 0, md: 2 },
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: roleStyle.gradient,
                },
                "&:hover": {
                  borderColor: alpha(roleStyle.color, 0.3),
                  boxShadow: `0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 8px ${alpha(roleStyle.color, 0.1)}`,
                  transform: "translateY(-2px)",
                  "& .profile-avatar": {
                    transform: "scale(1.05)",
                  },
                },
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: roleStyle.gradient,
                      border: "2.5px solid #ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 2px 8px ${alpha(roleStyle.color, 0.3)}`,
                    }}
                  >
                    {roleStyle.icon}
                  </Box>
                }
              >
                <Avatar
                  className="profile-avatar"
                  sx={{
                    width: { xs: 42, md: 48 },
                    height: { xs: 42, md: 48 },
                    background: roleStyle.gradient,
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: `0 6px 16px ${alpha(roleStyle.color, 0.3)}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  {userName ? (
                    userName[0].toUpperCase()
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                </Avatar>
              </Badge>
              <Box
                sx={{
                  minWidth: 0,
                  flexGrow: 1,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    color: "#0f172a",
                    mb: 0.3,
                  }}
                >
                  {userName}
                </Typography>
                <Chip
                  size="small"
                  icon={roleStyle.icon}
                  label={role}
                  sx={{
                    height: 24,
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    backgroundColor: roleStyle.bg,
                    color: roleStyle.color,
                    border: `1px solid ${roleStyle.border}`,
                    px: 0.5,
                    "& .MuiChip-icon": {
                      color: roleStyle.color,
                      marginLeft: "4px",
                    },
                  }}
                />
              </Box>
              <StarsIcon
                sx={{
                  color: "#f59e0b",
                  fontSize: 16,
                  opacity: 0.5,
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: { xs: "none", md: "block" },
                }}
              />
            </Paper>
          </Box>

          {/* Navigation Label */}
          <Box
            sx={{
              px: 3,
              pt: 2,
              pb: 1.5,
              display: { xs: "none", md: "block" },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#94a3b8",
                letterSpacing: "2px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 14, color: "#6366f1" }} />
              Main Navigation
            </Typography>
          </Box>
        </Box>

        {/* ===== SCROLLABLE MIDDLE SECTION (Only Navigation Items) ===== */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 1, md: 2 },
            width: "100%",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha("#94a3b8", 0.3),
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: alpha("#94a3b8", 0.5),
            },
          }}
        >
          <List sx={{ py: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = activeView === item.value;
              return (
                <Tooltip
                  key={item.value}
                  title={item.description || ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => onChangeView(item.value)}
                    sx={{
                      borderRadius: 3.5,
                      mb: 0.6,
                      py: { xs: 1.2, md: 1.4 },
                      px: { xs: 1, md: 2 },
                      minHeight: { xs: 48, md: "auto" },
                      transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      justifyContent: { xs: "center", md: "flex-start" },
                      animation: `slideIn 0.5s ease-out ${index * 0.05}s both`,
                      "@keyframes slideIn": {
                        "0%": { opacity: 0, transform: "translateX(-10px)" },
                        "100%": { opacity: 1, transform: "translateX(0)" },
                      },
                      "&.Mui-selected": {
                        background:
                          "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)",
                        boxShadow: `0 0 0 1px ${alpha("#6366f1", 0.2)}, 0 4px 12px ${alpha("#6366f1", 0.08)}`,
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: "70%",
                          borderRadius: 4,
                          background:
                            "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                          boxShadow: "0 0 8px rgba(102, 126, 234, 0.3)",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#6366f1",
                          boxShadow: "0 0 6px rgba(99, 102, 241, 0.4)",
                        },
                      },
                      "&:hover": {
                        background: alpha("#6366f1", 0.04),
                        transform: { xs: "none", md: "translateX(4px)" },
                        "& .menu-icon": {
                          transform: "scale(1.1) rotate(5deg)",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      className="menu-icon"
                      sx={{
                        minWidth: { xs: 0, md: 40 },
                        justifyContent: "center",
                        color: isActive ? "#6366f1" : "#64748b",
                        transition: "all 0.3s ease",
                        "& .MuiSvgIcon-root": {
                          fontSize: 22,
                          filter: isActive
                            ? "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))"
                            : "none",
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 800 : 600,
                        fontSize: "0.9rem",
                        letterSpacing: "0.2px",
                      }}
                      secondary={isActive ? item.description : null}
                      secondaryTypographyProps={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "#6366f1",
                        sx: { opacity: 0.7 },
                      }}
                      sx={{
                        color: isActive ? "#0f172a" : "#475569",
                        transition: "color 0.3s ease",
                        display: { xs: "none", md: "block" },
                      }}
                    />
                    {isActive && (
                      <ChevronRightIcon
                        sx={{
                          fontSize: 20,
                          color: "#6366f1",
                          ml: 0.5,
                          display: { xs: "none", md: "block" },
                          filter:
                            "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2))",
                          animation: "pulse 2s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>
        </Box>

        {/* ===== FIXED BOTTOM SECTION ===== */}
        <Box sx={{ flexShrink: 0 }}>
          <Divider
            sx={{
              borderColor: "#f1f5f9",
              mx: { xs: 1.5, md: 3 },
              my: { xs: 1, md: 2 },
              width: { xs: 44, md: "auto" },
            }}
          />

          {/* Logout Button */}
          <Box sx={{ px: { xs: 1, md: 2 }, pb: 1 }}>
            <ListItemButton
              onClick={() => onChangeView("logout")}
              sx={{
                borderRadius: 3.5,
                mb: 0.5,
                py: { xs: 1.2, md: 1.3 },
                px: { xs: 1, md: 2 },
                minHeight: { xs: 48, md: "auto" },
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                justifyContent: { xs: "center", md: "flex-start" },
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)",
                  transform: { xs: "none", md: "translateX(4px)" },
                  "& .MuiListItemIcon-root": {
                    color: "#dc2626",
                    transform: "scale(1.1) rotate(-5deg)",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#dc2626",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: "60%",
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: { xs: 0, md: 40 },
                  justifyContent: "center",
                  color: "#64748b",
                  transition: "all 0.3s ease",
                  "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout Account"
                primaryTypographyProps={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
                sx={{
                  color: "#475569",
                  transition: "color 0.3s ease",
                  display: { xs: "none", md: "block" },
                }}
              />
            </ListItemButton>
          </Box>

          {/* Footer */}
          <Box
            sx={{ px: 3, pb: 3, pt: 1, display: { xs: "none", md: "block" } }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3.5,
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(139, 92, 246, 0.02))",
                border: "1px solid rgba(226, 232, 240, 0.6)",
                textAlign: "center",
              }}
            >
              <DiamondIcon
                sx={{ color: "#6366f1", fontSize: 16, mb: 0.5, opacity: 0.5 }}
              />
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: "#94a3b8",
                  letterSpacing: "0.5px",
                  fontWeight: 600,
                }}
              >
                © 2026 Marketplace Portal
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "#cbd5e1",
                  fontWeight: 500,
                  mt: 0.3,
                }}
              >
                v2.0.1 • All rights reserved
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
