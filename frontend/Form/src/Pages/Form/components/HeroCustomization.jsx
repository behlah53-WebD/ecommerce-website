import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  alpha,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as PreviewIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { apiGet, apiPost, apiPut, apiDelete } from "@/API/api";

const defaultHeroData = {
  subtitle: "New Spring & Summer Collection",
  title: "Elevate Your Everyday Style",
  description: "Discover curated collections of premium fashion and lifestyle products. Timeless designs crafted for the modern individual.",
  imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
  buttonText1: "Shop Collection",
  buttonLink1: "/shop",
  buttonText2: "Browse Categories",
  buttonLink2: "/categories",
  isActive: true,
};

const HeroCustomization = ({ showToast }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState(defaultHeroData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  
  // Real-time Preview state representing currently selected or edited banner
  const [previewData, setPreviewData] = useState(defaultHeroData);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/users/hero/admin");
      if (res.data && res.data.success) {
        setSlides(res.data.data || []);
        if (res.data.data && res.data.data.length > 0) {
          // Set first slide as active preview on load
          setPreviewData(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch hero slides:", err);
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(defaultHeroData);
    setSelectedFile(null);
    setFilePreview("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (slide) => {
    setIsEditing(true);
    setEditId(slide._id);
    setFormData({
      subtitle: slide.subtitle || "",
      title: slide.title || "",
      description: slide.description || "",
      imageUrl: slide.imageUrl || "",
      buttonText1: slide.buttonText1 || "",
      buttonLink1: slide.buttonLink1 || "",
      buttonText2: slide.buttonText2 || "",
      buttonLink2: slide.buttonLink2 || "",
      isActive: slide.isActive !== false,
    });
    setSelectedFile(null);
    setFilePreview(slide.imageUrl || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero slide?")) return;
    
    try {
      const res = await apiDelete(`/users/hero/${id}`);
      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message || "Hero slide deleted", "success");
        fetchSlides();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      payload.append(key, formData[key]);
    });
    
    if (selectedFile) {
      payload.append("file", selectedFile);
    }

    try {
      let res;
      if (isEditing) {
        res = await apiPut(`/users/hero/${editId}`, payload);
      } else {
        res = await apiPost("/users/hero", payload);
      }

      if (res.data && res.data.success) {
        if (showToast) showToast(res.data.message || "Operation successful!", "success");
        setDialogOpen(false);
        fetchSlides();
      }
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Preview target update dynamically when form edits happen
  useEffect(() => {
    if (dialogOpen) {
      setPreviewData({
        ...formData,
        imageUrl: filePreview || formData.imageUrl,
      });
    }
  }, [formData, filePreview, dialogOpen]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: "100%", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
            Hero Customization
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Manage the hero slider, content, background images, and action links.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={fetchSlides}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: "12px", textTransform: "none", color: "#64748b", borderColor: "#cbd5e1" }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenAdd}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
            }}
          >
            Add New Slide
          </Button>
        </Stack>
      </Box>

      {/* Grid container with real-time preview and list of slides */}
      <Grid container spacing={3}>
        {/* Real-time Website Hero Preview */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
            <PreviewIcon sx={{ color: "#6366f1" }} /> Live Shop Preview (How it looks on shop)
          </Typography>
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              minHeight: "450px",
              borderRadius: "24px",
              overflow: "hidden",
              background: "#111827",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
              border: "1px solid #334155",
            }}
          >
            {/* Background Image */}
            <Box sx={{ position: "absolute", inset: 0 }}>
              <img
                src={previewData.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"}
                alt="Live Preview Background"
                style={{ height: "100%", width: "100%", objectCover: "cover", opacity: 0.45 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, rgba(3, 7, 18, 0.95) 0%, rgba(17, 24, 39, 0.8) 50%, transparent 100%)",
                }}
              />
            </Box>

            {/* Content overlay */}
            <Box sx={{ position: "relative", px: { xs: 4, md: 8 }, py: 6, maxW: "650px", color: "#fff", zIndex: 2 }}>
              {previewData.subtitle && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "9999px",
                    px: 2.5,
                    py: 0.8,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    backdropFilter: "blur(8px)",
                    mb: 3,
                  }}
                >
                  ✨ {previewData.subtitle}
                </Box>
              )}

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.15,
                  mb: 2.5,
                  fontSize: { xs: "2.2rem", md: "3.2rem" },
                  letterSpacing: "-1.5px",
                }}
              >
                {previewData.title || "Elevate Your Style"}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#cbd5e1",
                  mb: 4,
                  fontSize: { xs: "0.95rem", md: "1.1rem" },
                  lineHeight: 1.6,
                  maxW: "500px",
                }}
              >
                {previewData.description || "Discover curated collections of premium fashion."}
              </Typography>

              <Stack direction="row" spacing={2}>
                {previewData.buttonText1 && (
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#6366f1",
                      color: "#fff",
                      px: 3.5,
                      py: 1.5,
                      borderRadius: "12px",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#4f46e5" },
                    }}
                  >
                    {previewData.buttonText1}
                  </Button>
                )}
                {previewData.buttonText2 && (
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                      px: 3.5,
                      py: 1.5,
                      borderRadius: "12px",
                      fontWeight: 700,
                      textTransform: "none",
                      backdropFilter: "blur(4px)",
                      "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                  >
                    {previewData.buttonText2}
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Slides List */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}>
            Slide Collection ({slides.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={40} sx={{ color: "#6366f1" }} />
            </Box>
          ) : slides.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <Typography sx={{ color: "#64748b" }}>No custom hero slides. Seed database or add one.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {slides.map((slide) => (
                <Grid item xs={12} md={6} key={slide._id}>
                  <Card
                    sx={{
                      borderRadius: "20px",
                      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={slide.imageUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&fit=crop"}
                        alt={slide.title}
                        sx={{ filter: "brightness(0.7)" }}
                      />
                      <Chip
                        label={slide.isActive ? "Active" : "Disabled"}
                        color={slide.isActive ? "success" : "default"}
                        size="small"
                        sx={{ position: "absolute", top: 12, right: 12, fontWeight: 700 }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700, display: "block", mb: 0.5 }}>
                        {slide.subtitle || "No Subtitle"}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, lineClamp: 1 }}>
                        {slide.title || "No Title"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", lineClamp: 2, height: "40px", overflow: "hidden" }}>
                        {slide.description || "No description."}
                      </Typography>
                    </CardContent>
                    <Divider sx={{ borderColor: "#f1f5f9" }} />
                    <CardActions sx={{ justifyContent: "space-between", px: 2, py: 1.5 }}>
                      <Button
                        size="small"
                        startIcon={<PreviewIcon />}
                        onClick={() => setPreviewData(slide)}
                        sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
                      >
                        Preview
                      </Button>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleOpenEdit(slide)} sx={{ color: "#3b82f6" }}>
                          <EditIcon size="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(slide._id)} sx={{ color: "#ef4444" }}>
                          <DeleteIcon size="small" />
                        </IconButton>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Slide Edit/Add Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "24px", p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.4rem" }}>
          {isEditing ? "Edit Hero Slide" : "Add New Hero Slide"}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subtitle / Tagline"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                  placeholder="e.g. New Spring & Summer Collection"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Slide Title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Elevate Your Everyday Style"
                  variant="outlined"
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description Text"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Tell your shoppers more..."
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Button 1 Text"
                      name="buttonText1"
                      value={formData.buttonText1}
                      onChange={handleFormChange}
                      placeholder="e.g. Shop Collection"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Button 1 Link"
                      name="buttonLink1"
                      value={formData.buttonLink1}
                      onChange={handleFormChange}
                      placeholder="e.g. /shop"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Button 2 Text"
                      name="buttonText2"
                      value={formData.buttonText2}
                      onChange={handleFormChange}
                      placeholder="e.g. Browse Categories"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Button 2 Link"
                      name="buttonLink2"
                      value={formData.buttonLink2}
                      onChange={handleFormChange}
                      placeholder="e.g. /categories"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#475569" }}>
                  Background Image File or URL
                </Typography>
                
                <Box
                  sx={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: "#f8fafc",
                    transition: "border-color 0.2s ease",
                    "&:hover": { borderColor: "#6366f1" },
                    position: "relative",
                    mb: 2,
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <CloudUploadIcon sx={{ fontSize: 40, color: "#64748b", mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                    Click to Upload Banner Image
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    JPG, PNG or WEBP (Standard Cloudinary direct upload)
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Or enter Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleFormChange}
                  placeholder="https://images.unsplash.com/..."
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                {filePreview && (
                  <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1", mt: 1 }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={filePreview}
                      alt="Banner Preview"
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Make this slide active/visible"
                  sx={{ mt: 2, display: "block" }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveLoading}
              sx={{
                borderRadius: "12px",
                px: 3,
                bgcolor: "#6366f1",
                "&:hover": { bgcolor: "#4f46e5" },
              }}
            >
              {saveLoading ? <CircularProgress size={20} color="inherit" /> : "Save Banner"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HeroCustomization;
