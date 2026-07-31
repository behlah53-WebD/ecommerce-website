import React from "react";
import { Box, Typography, alpha, Paper, Fade, Zoom } from "@mui/material";
import {
  AutoAwesome as SparkleIcon,
  ShoppingBag as ShoppingIcon,
  Inventory as InventoryIcon,
  Diamond as DiamondIcon,
  Stars as StarsIcon,
  Circle as CircleIcon,
  RocketLaunch as RocketIcon,
} from "@mui/icons-material";

const UserHeader = ({ onLogout, userRole }) => {
  const isBuyer = userRole === "Buyer";

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 5 },
          borderRadius: { xs: 3, md: 5 },
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            flexWrap: "wrap",
            gap: { xs: 2.5, md: 3 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
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
                  {isBuyer ? "Buyer Marketplace" : "Product Management Portal"}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.8rem" },
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: "-1px",
                lineHeight: 1.2,
              }}
            >
              {isBuyer ? "Browse Products" : "Product Catalog"}
              <StarsIcon sx={{ ml: 1, color: '#f59e0b', fontSize: 28, verticalAlign: 'middle', animation: 'bounce 2s infinite', '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } } }} />
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                maxWidth: '100%',
                fontSize: "1rem",
                lineHeight: 1.6,
              }}
            >
              {isBuyer
                ? "Explore all available product listings in the marketplace with real-time inventory insights."
                : "Manage products, track inventory records, and submit moderation requests with ease."}
            </Typography>
          </Box>

          <Zoom in timeout={1000}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                px: { xs: 2, sm: 4 },
                py: { xs: 2, sm: 3 },
                borderRadius: { xs: 3, md: 4 },
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: "1px solid rgba(226, 232, 240, 0.6)",
                boxShadow: '0 15px 40px rgba(15, 23, 42, 0.06)',
                minWidth: { xs: "100%", sm: 160 },
                width: { xs: "100%", md: "auto" },
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
              {isBuyer ? (
                <ShoppingIcon sx={{ color: '#6366f1', fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))' }} />
              ) : (
                <InventoryIcon sx={{ color: '#6366f1', fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))' }} />
              )}
              <Typography sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900, 
                fontSize: "2rem",
                lineHeight: 1,
              }}>
                {isBuyer ? "🛒" : "📦"}
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
                {isBuyer ? "Marketplace" : "Inventory"}
              </Typography>
            </Box>
          </Zoom>
        </Box>
      </Paper>
    </Fade>
  );
};

export default UserHeader;
