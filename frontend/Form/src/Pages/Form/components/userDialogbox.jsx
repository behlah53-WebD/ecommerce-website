import React, { useState, useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
  InputAdornment,
  Avatar,
  Badge,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ShoppingBag as ProductIcon,
  QrCode as SkuIcon,
  Category as CategoryIcon,
  AttachMoney as PriceIcon,
  Inventory as StockIcon,
  Storefront as BrandIcon,
  Description as DescIcon,
  LocalShipping as StatusIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const fileTypes = ["JPG", "PNG", "GIF", "JPEG", "WEBP", "AVIF"];

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
    color: "#0f172a",
    "& fieldset": {
      borderColor: "#e2e8f0",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: "#6366f1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0284c7",
      borderWidth: "2px",
      boxShadow: "0 0 0 3px rgba(2, 132, 199, 0.1)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 500,
    fontSize: "0.9rem",
    "&.Mui-focused": { color: "#0284c7" },
    "&.MuiInputLabel-shrink": { color: "#0284c7" },
  },
  "& .MuiInputBase-input": {
    color: "#0f172a",
    fontSize: "0.925rem",
    padding: "13px 14px",
    "&::placeholder": { color: "#94a3b8", opacity: 1 },
  },
};

const CATEGORIES = [
  "Electronics", "Fashion & Apparel", "Home & Kitchen", "Beauty & Health",
  "Sports & Outdoors", "Toys & Games", "Automotive", "Books & Media",
  "Food & Grocery", "Jewelry & Accessories", "Office Supplies", "Tools & Hardware", "General"
];

const PRODUCT_STATUSES = ["In Stock", "Low Stock", "Out of Stock", "Discontinued"];

const UserDialog = ({
  open,
  isEditing,
  formData,
  loading,
  onClose,
  onChange,
  onFilesChange,
  onSubmit,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (open) {
      const initialFiles = formData?.files || [];
      setSelectedFiles(initialFiles);
      const initialPreviews = initialFiles.map((file) => {
        if (file instanceof File) return URL.createObjectURL(file);
        if (typeof file === "string") return file;
        if (file && file.url) return file.url;
        if (file && file.data) {
          return file.data.startsWith("http://") || file.data.startsWith("https://") || file.data.startsWith("data:")
            ? file.data
            : `data:${file.mimetype || "image/jpeg"};base64,${file.data}`;
        }
        return "";
      });
      setPreviews(initialPreviews);
    }
  }, [open, formData?.id]);

  const handleDropChange = (files) => {
    let fileList = [];
    if (files instanceof FileList || Array.isArray(files)) fileList = Array.from(files);
    else if (files instanceof File) fileList = [files];

    const updatedFiles = [...selectedFiles, ...fileList];
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    const newPreviews = fileList.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange(updatedFiles);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll="paper"
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(15, 23, 42, 0.35)", backdropFilter: "blur(8px)" },
        },
        paper: {
          sx: {
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: "24px",
            boxShadow: "0 25px 60px rgba(15, 23, 42, 0.15)",
            border: "1px solid #e2e8f0",
            overflow: "auto",
            m: { xs: 1.5, sm: 3 },
          },
        },
      }}
    >
      {}
      <Box
        sx={{
          position: "relative",
          background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)",
          px: { xs: 3, sm: 4 },
          py: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #6366f1 0%, #0284c7 100%)", borderRadius: "24px 24px 0 0" }} />

        <Box sx={{ zIndex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2, mb: 0.5 }}>
            {isEditing ? "Edit Product" : "Add New Product"}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              background: alpha("#6366f1", 0.08),
              border: "1px solid " + alpha("#6366f1", 0.2),
              borderRadius: "8px",
              px: 1.5,
              py: 0.4,
            }}
          >
            <Typography variant="caption" sx={{ color: "#4f46e5", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", fontSize: "0.725rem" }}>
              {isEditing ? "UPDATE PRODUCT" : "SUBMIT FOR APPROVAL"}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            color: "#64748b",
            bgcolor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            "&:hover": { color: "#ffffff", bgcolor: "#e11d48", borderColor: "#e11d48", transform: "scale(1.05)" },
            transition: "all 0.2s ease",
            zIndex: 1,
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <form onSubmit={onSubmit}>
        <DialogContent
          sx={{
            bgcolor: "#f8fafc",
            p: { xs: 3, sm: 4 },
            pt: 3,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "#f1f5f9" },
            "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "3px" },
          }}
        >
          <Stack spacing={3}>

            {}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: "#4f46e5", letterSpacing: "0.8px", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Product Images
              </Typography>
              <FileUploader handleChange={handleDropChange} name="file" types={fileTypes} multiple={true}>
                <Box
                  sx={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    p: 3.5,
                    textAlign: "center",
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    "&:hover": { borderColor: "#6366f1", backgroundColor: "#f0f4ff", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.08)" },
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 38, color: "#6366f1", mb: 1 }} />
                  <Typography variant="body1" fontWeight={700} sx={{ color: "#0f172a", fontSize: "0.95rem" }}>
                    Drag & Drop product images or click to browse
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", mt: 0.5, display: "block" }}>
                    JPG, PNG, GIF, WEBP supported
                  </Typography>
                </Box>
              </FileUploader>

              {previews.length > 0 && (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2.5 }}>
                  {previews.map((src, index) => (
                    <Badge
                      key={index}
                      overlap="circular"
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      badgeContent={
                        <IconButton size="small" onClick={() => handleRemoveImage(index)}
                          sx={{ bgcolor: "#e11d48", color: "#fff", width: 22, height: 22, "&:hover": { bgcolor: "#be123c" } }}
                        >
                          <DeleteIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      }
                    >
                      <Avatar src={src} variant="rounded"
                        sx={{ width: 64, height: 64, borderRadius: "12px", border: "1px solid #e2e8f0" }}
                      />
                    </Badge>
                  ))}
                </Box>
              )}
            </Box>

            {}
            <Box sx={{ bgcolor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: "#4f46e5", letterSpacing: "0.8px", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Basic Information
              </Typography>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                  <TextField
                    fullWidth
                    name="productName"
                    label="Product Name *"
                    placeholder="e.g. Wireless Bluetooth Headphones"
                    value={formData?.productName || ""}
                    onChange={onChange}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><ProductIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                    }}
                    sx={fieldStyles}
                  />
                  <TextField
                    fullWidth
                    name="sku"
                    label="SKU / Product Code"
                    placeholder="e.g. WBH-2024-BLK"
                    value={formData?.sku || ""}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SkuIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                    }}
                    sx={fieldStyles}
                  />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                  <FormControl fullWidth sx={{ ...fieldStyles, "& .MuiInputLabel-root": { color: "#64748b", "&.Mui-focused": { color: "#0284c7" } } }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData?.category || ""}
                      label="Category"
                      onChange={onChange}
                      startAdornment={<InputAdornment position="start"><CategoryIcon sx={{ color: "#6366f1", fontSize: 20, ml: 0.5 }} /></InputAdornment>}
                      sx={{ borderRadius: "14px", bgcolor: "#ffffff", color: "#0f172a" }}
                    >
                      {CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    name="brand"
                    label="Brand / Manufacturer"
                    placeholder="e.g. Sony, Apple, Samsung"
                    value={formData?.brand || ""}
                    onChange={onChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BrandIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                    }}
                    sx={fieldStyles}
                  />
                </Stack>

                <TextField
                  fullWidth
                  name="description"
                  label="Product Description"
                  placeholder="Describe your product, features, specifications..."
                  value={formData?.description || ""}
                  onChange={onChange}
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}><DescIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={fieldStyles}
                />
              </Stack>
            </Box>

            {}
            <Box sx={{ bgcolor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: "#4f46e5", letterSpacing: "0.8px", fontSize: "0.75rem", textTransform: "uppercase" }}>
                Pricing & Inventory
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                <TextField
                  fullWidth
                  name="price"
                  label="Price (₹) *"
                  placeholder="0.00"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  value={formData?.price ?? ""}
                  onChange={onChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PriceIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={fieldStyles}
                />
                <TextField
                  fullWidth
                  name="stock"
                  label="Stock Quantity"
                  placeholder="0"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData?.stock ?? ""}
                  onChange={onChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><StockIcon sx={{ color: "#6366f1", fontSize: 20 }} /></InputAdornment>,
                  }}
                  sx={fieldStyles}
                />
                <FormControl fullWidth sx={{ ...fieldStyles, "& .MuiInputLabel-root": { color: "#64748b", "&.Mui-focused": { color: "#0284c7" } } }}>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    name="productStatus"
                    value={formData?.productStatus || "In Stock"}
                    label="Availability"
                    onChange={onChange}
                    startAdornment={<InputAdornment position="start"><StatusIcon sx={{ color: "#6366f1", fontSize: 20, ml: 0.5 }} /></InputAdornment>}
                    sx={{ borderRadius: "14px", bgcolor: "#ffffff", color: "#0f172a" }}
                  >
                    {PRODUCT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            bgcolor: "#ffffff",
            p: { xs: 3, sm: 4 },
            pt: 2,
            gap: 2,
            justifyContent: "flex-end",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              borderRadius: "12px",
              px: 3.5,
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              "&:hover": { backgroundColor: "#f8fafc", borderColor: "#cbd5e1", color: "#0f172a" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "12px",
              px: 4.5,
              py: 1.2,
              fontWeight: 800,
              textTransform: "none",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)",
              boxShadow: "0 6px 18px rgba(79, 70, 229, 0.25)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(135deg, #4338ca 0%, #0369a1 100%)",
                boxShadow: "0 8px 22px rgba(79, 70, 229, 0.35)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDialog;
