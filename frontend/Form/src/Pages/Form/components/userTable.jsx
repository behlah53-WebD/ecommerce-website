import React from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Chip,
  alpha,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  ShoppingBag as ProductIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

import Pagination from "@/components/paginate";
import SearchBar from "@/components/searchbar";

const UserTable = ({
  data = [],
  loading,
  onTestGet,
  onOpenAdd,
  onOpenEdit,
  onDelete,
  userRole = "Buyer",

  searchQuery = "",
  onSearchChange,
  onSearchClear,

  paginationData = { currentPage: 1, totalPages: 1 },
  onPageChange,
}) => {
  const isBuyer = userRole === "Buyer";

  const getProductAvatarSrc = (item) => {
    if (item.files && item.files.length > 0) {
      const firstFile = item.files[0];
      if (firstFile instanceof File) return URL.createObjectURL(firstFile);
      if (typeof firstFile === "string") return firstFile;
      if (firstFile.url) return firstFile.url;
      if (firstFile.data) {
        return firstFile.data.startsWith("http://") || firstFile.data.startsWith("https://") || firstFile.data.startsWith("data:")
          ? firstFile.data
          : `data:${firstFile.mimetype || "image/jpeg"};base64,${firstFile.data}`;
      }
    }
    return null;
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "approved":
        return (
          <Chip 
            size="small" 
            icon={<ApprovedIcon sx={{ fontSize: 14 }} />} 
            label="Approved"
            sx={{ 
              bgcolor: alpha("#10b981", 0.1), 
              color: "#059669", 
              border: `1px solid ${alpha("#10b981", 0.2)}`, 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
              '& .MuiChip-icon': { color: '#059669' }
            }}
          />
        );
      case "pending_add":
        return (
          <Chip 
            size="small" 
            icon={<PendingIcon sx={{ fontSize: 14 }} />} 
            label="Pending Add"
            sx={{ 
              bgcolor: alpha("#f59e0b", 0.1), 
              color: "#d97706", 
              border: `1px solid ${alpha("#f59e0b", 0.2)}`, 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
              '& .MuiChip-icon': { color: '#d97706' }
            }}
          />
        );
      case "pending_edit":
        return (
          <Chip 
            size="small" 
            icon={<PendingIcon sx={{ fontSize: 14 }} />} 
            label="Pending Edit"
            sx={{ 
              bgcolor: alpha("#8b5cf6", 0.1), 
              color: "#7c3aed", 
              border: `1px solid ${alpha("#8b5cf6", 0.2)}`, 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
              '& .MuiChip-icon': { color: '#7c3aed' }
            }}
          />
        );
      case "pending_delete":
        return (
          <Chip 
            size="small" 
            icon={<PendingIcon sx={{ fontSize: 14 }} />} 
            label="Pending Delete"
            sx={{ 
              bgcolor: alpha("#ef4444", 0.1), 
              color: "#dc2626", 
              border: `1px solid ${alpha("#ef4444", 0.2)}`, 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
              '& .MuiChip-icon': { color: '#dc2626' }
            }}
          />
        );
      case "rejected":
        return (
          <Chip 
            size="small" 
            icon={<RejectedIcon sx={{ fontSize: 14 }} />} 
            label="Declined"
            sx={{ 
              bgcolor: alpha("#ef4444", 0.1), 
              color: "#dc2626", 
              border: `1px solid ${alpha("#ef4444", 0.2)}`, 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
              '& .MuiChip-icon': { color: '#dc2626' }
            }}
          />
        );
      default:
        return (
          <Chip 
            size="small" 
            label={status || "Approved"}
            sx={{ 
              bgcolor: alpha("#10b981", 0.1), 
              color: "#059669", 
              fontWeight: 700, 
              fontSize: "0.7rem",
              height: 24,
            }}
          />
        );
    }
  };

  const getProductStatusChip = (productStatus) => {
    switch (productStatus) {
      case "In Stock":
        return <Chip size="small" label="In Stock" sx={{ bgcolor: alpha("#10b981", 0.1), color: "#059669", border: `1px solid ${alpha("#10b981", 0.2)}`, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />;
      case "Low Stock":
        return <Chip size="small" label="Low Stock" sx={{ bgcolor: alpha("#f59e0b", 0.1), color: "#d97706", border: `1px solid ${alpha("#f59e0b", 0.2)}`, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />;
      case "Out of Stock":
        return <Chip size="small" label="Out of Stock" sx={{ bgcolor: alpha("#ef4444", 0.1), color: "#dc2626", border: `1px solid ${alpha("#ef4444", 0.2)}`, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />;
      case "Discontinued":
        return <Chip size="small" label="Discontinued" sx={{ bgcolor: alpha("#64748b", 0.1), color: "#475569", border: `1px solid ${alpha("#64748b", 0.2)}`, fontWeight: 700, fontSize: "0.7rem", height: 24 }} />;
      default:
        return <Chip size="small" label={productStatus || "In Stock"} sx={{ bgcolor: alpha("#10b981", 0.1), color: "#059669", fontWeight: 700, fontSize: "0.7rem", height: 24 }} />;
    }
  };

  return (
    <Fade in timeout={800}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 3, md: 5 },
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfd 100%)',
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", lg: "row" },
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: { xs: "100%", lg: "auto" },
              minWidth: 0,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUpIcon sx={{ color: "#6366f1", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: '1.1rem', letterSpacing: "-0.2px" }}>
                Product Catalog
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                {data.length} products listed
              </Typography>
            </Box>
            {isBuyer && (
              <Chip
                icon={<ViewIcon sx={{ fontSize: 14 }} />}
                label="View Only"
                sx={{ 
                  bgcolor: alpha("#3b82f6", 0.08), 
                  color: "#2563eb", 
                  border: `1px solid ${alpha("#3b82f6", 0.2)}`, 
                  fontWeight: 700, 
                  fontSize: "0.7rem",
                  height: 26,
                  '& .MuiChip-icon': { color: '#2563eb' }
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              width: { xs: "100%", lg: "auto" },
              flexGrow: { xs: 1, lg: 0 },
              "& .MuiTextField-root": {
                flex: { xs: "1 1 100%", sm: "1 1 280px" },
              },
              "& .MuiButton-root": {
                flex: { xs: "1 1 100%", sm: "0 0 auto" },
              },
            }}
          >
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onClear={onSearchClear}
              placeholder="Search product, SKU, category..."
              loading={loading}
            />

            <Tooltip title="Refresh Products">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onTestGet}
                disabled={loading}
                sx={{
                  borderRadius: "12px",
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  borderWidth: "1.5px",
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    borderColor: "#6366f1",
                    borderWidth: "1.5px",
                    background: alpha("#6366f1", 0.04),
                    color: "#4f46e5",
                  },
                }}
              >
                Refresh
              </Button>
            </Tooltip>

            {!isBuyer && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenAdd}
                disabled={loading}
                sx={{
                  borderRadius: "12px",
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Add Product
              </Button>
            )}
          </Box>
        </Box>

        {loading && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress sx={{ height: 3, bgcolor: alpha('#6366f1', 0.08), "& .MuiLinearProgress-bar": { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' } }} />
          </Box>
        )}

        {data.length > 0 ? (
          <>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "#fafbfd" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                      SKU / Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                      Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                      Availability
                    </TableCell>

                    {!isBuyer && (
                      <TableCell sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                        Status
                      </TableCell>
                    )}
                    {!isBuyer && (
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#475569", borderBottom: "2px solid #f1f5f9", fontSize: "0.75rem", letterSpacing: "0.5px", textTransform: "uppercase", py: 2 }}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => {
                    const avatarSrc = getProductAvatarSrc(item);
                    const productName = item.productName || item.firstName || "Unnamed Product";
                    const brand = item.brand || "";
                    return (
                      <TableRow
                        key={item.id || item._id}
                        hover
                        sx={{
                          "&:hover": { background: alpha('#6366f1', 0.02) },
                          transition: "background 0.2s ease",
                          animation: `fadeIn 0.5s ease-out ${index * 0.03}s both`,
                          '@keyframes fadeIn': {
                            '0%': { opacity: 0, transform: 'translateX(-10px)' },
                            '100%': { opacity: 1, transform: 'translateX(0)' },
                          },
                        }}
                      >
                        {/* Product */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              src={avatarSrc || ""}
                              variant="rounded"
                              sx={{
                                background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)",
                                width: 46,
                                height: 46,
                                fontWeight: 800,
                                fontSize: "0.9rem",
                                color: "#4f46e5",
                                borderRadius: "12px",
                                border: "2px solid #e2e8f0",
                                boxShadow: '0 4px 8px rgba(99, 102, 241, 0.1)',
                              }}
                            >
                              {!avatarSrc && (productName ? productName[0].toUpperCase() : <ProductIcon sx={{ fontSize: 20 }} />)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ color: "#0f172a", fontWeight: 700, fontSize: "0.9rem" }}>
                                {productName}
                              </Typography>
                              {brand && (
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: '0.75rem' }}>
                                  by {brand}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        {/* SKU / Category */}
                        <TableCell>
                          <Box>
                            {item.sku && (
                              <Typography sx={{ color: "#475569", fontWeight: 600, fontSize: "0.8rem", fontFamily: "monospace" }}>
                                {item.sku}
                              </Typography>
                            )}
                            {item.category && (
                              <Chip 
                                size="small" 
                                label={item.category}
                                sx={{ 
                                  bgcolor: '#f8fafc', 
                                  color: '#475569', 
                                  border: '1px solid #e2e8f0', 
                                  fontWeight: 600, 
                                  fontSize: "0.7rem", 
                                  mt: item.sku ? 0.5 : 0,
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          <Typography sx={{ color: "#0f172a", fontWeight: 800, fontSize: "0.95rem" }}>
                            ₹{Number(item.price || 0).toFixed(2)}
                          </Typography>
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          <Typography sx={{ 
                            color: item.stock > 10 ? "#059669" : item.stock > 0 ? "#d97706" : "#dc2626", 
                            fontWeight: 700, 
                            fontSize: "0.9rem",
                            bgcolor: item.stock > 10 ? alpha("#10b981", 0.08) : item.stock > 0 ? alpha("#f59e0b", 0.08) : alpha("#ef4444", 0.08),
                            px: 1.5,
                            py: 0.3,
                            borderRadius: 1,
                            display: 'inline-block',
                          }}>
                            {item.stock !== undefined && item.stock !== null ? item.stock : "-"}
                          </Typography>
                        </TableCell>

                        {/* Availability */}
                        <TableCell>
                          {getProductStatusChip(item.productStatus)}
                        </TableCell>

                        {/* Status */}
                        {!isBuyer && (
                          <TableCell>
                            {getStatusChip(item.status)}
                          </TableCell>
                        )}

                        {/* Actions */}
                        {!isBuyer && (
                          <TableCell align="right">
                            <Tooltip title="Edit Product">
                              <IconButton
                                sx={{
                                  color: "#6366f1",
                                  background: alpha('#6366f1', 0.08),
                                  mr: 1,
                                  width: 36,
                                  height: 36,
                                  transition: 'all 0.3s ease',
                                  "&:hover": { background: alpha('#6366f1', 0.15), color: "#4f46e5", transform: 'scale(1.1)' },
                                }}
                                onClick={() => onOpenEdit(item)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product">
                              <IconButton
                                sx={{
                                  color: "#ef4444",
                                  background: alpha('#ef4444', 0.08),
                                  width: 36,
                                  height: 36,
                                  transition: 'all 0.3s ease',
                                  "&:hover": { background: alpha('#ef4444', 0.15), color: "#dc2626", transform: 'scale(1.1)' },
                                }}
                                onClick={() => onDelete(item.id || item._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ borderTop: '1px solid #f1f5f9', bgcolor: '#fafbfd' }}>
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={onPageChange}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              p: { xs: 3, sm: 5, md: 8 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: { xs: 320, md: 400 },
              bgcolor: '#fafbfd',
            }}
          >
            <Avatar
              sx={{
                width: 88,
                height: 88,
                background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)",
                color: "#6366f1",
                mb: 3,
                border: "3px solid #e2e8f0",
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.1)',
              }}
            >
              <ProductIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, letterSpacing: "-0.2px" }}>
              No Products Found
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mb: 4, maxWidth: 450, textAlign: "center", lineHeight: 1.6 }}
            >
              {searchQuery
                ? `No products matching "${searchQuery}". Try a different keyword.`
                : isBuyer
                  ? "No approved products available in the catalog at this time."
                  : "Start by adding your first product using the button below."}
            </Typography>
            {!isBuyer && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenAdd}
                sx={{
                  borderRadius: "14px",
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  boxShadow: "0 4px 14px rgba(99, 102, 241, 0.2)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Add Your First Product
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default UserTable;
