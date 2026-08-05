import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton,
  alpha,
  Divider,
  Stack,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from "@mui/material";
import {
  Bolt as BoltIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  Percent as PercentIcon,
} from "@mui/icons-material";
import { apiGet, apiPost } from "@/API/api";
 
const ShockingDealsCustomization = ({ showToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
 
  const [title, setTitle] = useState("SHOCKING DEAL");
  const [subtitle, setSubtitle] = useState("The opportunity will quickly pass. Take it!");
  const [endTime, setEndTime] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({}); // productId -> discountPercentage
 
  // Fetch initial shocking deal state & products list
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch products
      const productsRes = await apiGet("/users?limit=10000");
      let allProducts = [];
      if (productsRes.data && productsRes.data.success) {
        allProducts = productsRes.data.data || [];
      } else if (Array.isArray(productsRes.data)) {
        allProducts = productsRes.data;
      }
      
      // Filter out approved items only
      const approvedProducts = allProducts.filter((p) => p.status === "approved");
      setProducts(approvedProducts);
 
      // 2. Fetch current deal settings
      const dealRes = await apiGet("/users/shocking-deal/admin");
      if (dealRes.data && dealRes.data.success && dealRes.data.data) {
        const deal = dealRes.data.data;
        setTitle(deal.title || "SHOCKING DEAL");
        setSubtitle(deal.subtitle || "The opportunity will quickly pass. Take it!");
        
        if (deal.endTime) {
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          const date = new Date(deal.endTime);
          const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
          const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
          setEndTime(localISOTime);
        }
 
        // Check if deal is active
        if (deal.isActive && new Date(deal.endTime) > new Date()) {
          const mapping = {};
          (deal.products || []).forEach((item) => {
            mapping[item.productId] = item.discountPercentage;
          });
          setSelectedProducts(mapping);
        } else {
          setSelectedProducts({});
        }
      }
    } catch (err) {
      console.error("Failed to fetch shocking deal data:", err);
      if (showToast) {
        showToast(err.response?.data?.message || err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);
 
  // Handle checking a product
  const handleProductCheck = (productId, checked) => {
    setSelectedProducts((prev) => {
      const copy = { ...prev };
      if (checked) {
        copy[productId] = 10; // Default 10% discount
      } else {
        delete copy[productId];
      }
      return copy;
    });
  };
 
  // Handle discount percentage changes
  const handleDiscountChange = (productId, value) => {
    let discount = Number(value);
    if (isNaN(discount)) discount = 10;
    if (discount < 1) discount = 1;
    if (discount > 99) discount = 99;
 
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: discount,
    }));
  };
 
  // Save the Shocking Deal
  const handleSave = async () => {
    if (!endTime) {
      if (showToast) showToast("Please set an end time for the Shocking Deal", "error");
      return;
    }
 
    const dateVal = new Date(endTime);
    if (dateVal <= new Date()) {
      if (showToast) showToast("End time must be in the future", "error");
      return;
    }
 
    const productsArray = Object.keys(selectedProducts).map((id) => ({
      productId: id,
      discountPercentage: selectedProducts[id],
    }));
 
    if (productsArray.length === 0) {
      if (showToast) showToast("Please select at least one product for the Shocking Deal", "error");
      return;
    }
 
    setSaveLoading(true);
    try {
      const res = await apiPost("/users/shocking-deal", {
        title,
        subtitle,
        endTime: dateVal.toISOString(),
        products: productsArray,
      });
 
      if (res.data && res.data.success) {
        if (showToast) showToast("Shocking Deal saved and activated successfully!", "success");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save shocking deal:", err);
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSaveLoading(false);
    }
  };
 
  // Deactivate/Cancel the Shocking Deal
  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate and remove this shocking deal?")) {
      return;
    }
 
    setSaveLoading(true);
    try {
      const res = await apiPost("/users/shocking-deal/deactivate");
      if (res.data && res.data.success) {
        if (showToast) showToast("Shocking Deal deactivated. All products returned to original prices.", "success");
        setTitle("SHOCKING DEAL");
        setSubtitle("The opportunity will quickly pass. Take it!");
        setEndTime("");
        setSelectedProducts({});
        fetchData();
      }
    } catch (err) {
      console.error("Failed to deactivate shocking deal:", err);
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSaveLoading(false);
    }
  };
 
  // Filter products based on search query
  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase();
    const name = (p.productName || p.name || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    return name.includes(term) || category.includes(term) || brand.includes(term);
  });
 
  const getProductImage = (p) => {
    if (p.files && p.files.length > 0) {
      return p.files[0].url || p.files[0].data;
    }
    return "";
  };
 
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={50} sx={{ color: "#6366f1" }} />
      </Box>
    );
  }
 
  const isAnyProductSelected = Object.keys(selectedProducts).length > 0;
 
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: "linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)",
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
            <BoltIcon sx={{ color: "#f59e0b", fontSize: 35 }} />
            Shocking Deals Customization
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Configure the countdown timer, edit sections, and decide which products are discounted.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={fetchData}
          startIcon={<RefreshIcon />}
          sx={{
            borderRadius: 3,
            color: "#6366f1",
            borderColor: "#e2e8f0",
            "&:hover": { borderColor: "#6366f1", backgroundColor: "rgba(99, 102, 241, 0.04)" },
          }}
        >
          Refresh Data
        </Button>
      </Box>
 
      <Grid container spacing={4}>
        {/* Left Side: Customization Parameters */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: "#0f172a" }}>
              Deal Parameters
            </Typography>
 
            <Stack spacing={3}>
              <TextField
                label="Section Title"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SHOCKING DEAL"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
              />
 
              <TextField
                label="Section Subtitle"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. The opportunity will quickly pass. Take it!"
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
              />
 
              <TextField
                label="Timer End Time"
                type="datetime-local"
                variant="outlined"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: 3 },
                }}
                helperText="Set when the Shocking Deal section should expire and remove itself."
              />
 
              <Divider sx={{ my: 1 }} />
 
              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#475569" }}>
                  Status Summary
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: isAnyProductSelected ? "rgba(99, 102, 241, 0.03)" : "rgba(241, 245, 249, 0.5)",
                    borderColor: isAnyProductSelected ? alpha("#6366f1", 0.2) : "#e2e8f0",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                    Selected Products: {Object.keys(selectedProducts).length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                    {isAnyProductSelected
                      ? "The deal is configured. Click Save below to deploy these changes to the shop storefront."
                      : "No products currently selected. Use the list on the right to add products and set discounts."}
                  </Typography>
                </Paper>
              </Box>
 
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={saveLoading}
                  onClick={handleSave}
                  startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                    backgroundColor: "#6366f1",
                    "&:hover": {
                      backgroundColor: "#4f46e5",
                      boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)",
                    },
                  }}
                >
                  Save & Activate
                </Button>
 
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={saveLoading}
                  onClick={handleDeactivate}
                  startIcon={<BlockIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: "none",
                    borderColor: "#fca5a5",
                    "&:hover": {
                      borderColor: "#ef4444",
                      backgroundColor: "rgba(239, 68, 68, 0.04)",
                    },
                  }}
                >
                  Deactivate Deal
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
 
        {/* Right Side: Product Catalog Selection */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }}
          >
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Select Products & Set Discounts
              </Typography>
 
              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, width: { xs: "100%", sm: 260 } },
                }}
              />
            </Box>
 
            {filteredProducts.length === 0 ? (
              <Box sx={{ py: 8, textCenter: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
                  No approved products found
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                  Try relaxing your search terms or verify that your products have been approved.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 500, border: "1px solid #f1f5f9", borderRadius: 3 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, backgroundColor: "#f8fafc", color: "#475569" }}>Included</TableCell>
                      <TableCell sx={{ fontWeight: 800, backgroundColor: "#f8fafc", color: "#475569" }}>Product Details</TableCell>
                      <TableCell sx={{ fontWeight: 800, backgroundColor: "#f8fafc", color: "#475569" }}>Base Price</TableCell>
                      <TableCell sx={{ fontWeight: 800, backgroundColor: "#f8fafc", color: "#475569", width: 180 }}>Discount Percentage</TableCell>
                      <TableCell sx={{ fontWeight: 800, backgroundColor: "#f8fafc", color: "#475569" }}>Final Deal Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const isChecked = selectedProducts[product.id] !== undefined;
                      const discount = selectedProducts[product.id] || 10;
                      const dealPrice = (product.price * (1 - discount / 100)).toFixed(2);
                      const img = getProductImage(product);
 
                      return (
                        <TableRow
                          key={product.id}
                          sx={{
                            transition: "background-color 0.2s",
                            backgroundColor: isChecked ? "rgba(99, 102, 241, 0.02)" : "inherit",
                            "&:hover": { backgroundColor: "rgba(241, 245, 249, 0.5)" },
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isChecked}
                              onChange={(e) => handleProductCheck(product.id, e.target.checked)}
                              sx={{
                                color: "#cbd5e1",
                                "&.Mui-checked": { color: "#6366f1" },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                src={img}
                                variant="rounded"
                                sx={{ width: 44, height: 44, borderRadius: 2, border: "1px solid #f1f5f9" }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b", noWrap: true }}>
                                  {product.productName || product.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                                  {product.category} • {product.brand || "No Brand"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#334155" }}>
                            ${product.price}
                          </TableCell>
                          <TableCell>
                            {isChecked ? (
                              <TextField
                                size="small"
                                type="number"
                                value={discount}
                                onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <PercentIcon sx={{ fontSize: 16, color: "#64748b" }} />
                                    </InputAdornment>
                                  ),
                                  sx: { borderRadius: 2, maxWidth: 100 },
                                  inputProps: { min: 1, max: 99 },
                                }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                                Not Included
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: isChecked ? "#10b981" : "#94a3b8" }}>
                            {isChecked ? `$${dealPrice}` : `—`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
 
export default ShockingDealsCustomization;