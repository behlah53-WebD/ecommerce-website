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
  Fade,
  Grow,
  Zoom,
  InputAdornment,
  Tooltip,
  Badge,
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
  Image as ImageIcon,
  Link as LinkIcon,
  TextFields as TextFieldsIcon,
  Slideshow as SlideshowIcon,
  Palette as PaletteIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { apiGet, apiPost, apiPut, apiDelete } from "@/API/api";

const defaultHeroData = {
  subtitle: "New Spring & Summer Collection",
  title: "Elevate Your Everyday Style",
  description:
    "Discover curated collections of premium fashion and lifestyle products. Timeless designs crafted for the modern individual.",
  imageUrl:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop",
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

  const [previewData, setPreviewData] = useState(defaultHeroData);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet("/users/hero/admin");
      if (res.data && res.data.success) {
        setSlides(res.data.data || []);
        if (res.data.data && res.data.data.length > 0) {
          setPreviewData(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch hero slides:", err);
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
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
    if (!window.confirm("Are you sure you want to delete this hero slide?"))
      return;

    try {
      const res = await apiDelete(`/users/hero/${id}`);
      if (res.data && res.data.success) {
        if (showToast)
          showToast(res.data.message || "Hero slide deleted", "success");
        fetchSlides();
      }
    } catch (err) {
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
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
        if (showToast)
          showToast(res.data.message || "Operation successful!", "success");
        setDialogOpen(false);
        fetchSlides();
      }
    } catch (err) {
      if (showToast)
        showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      setPreviewData({
        ...formData,
        imageUrl: filePreview || formData.imageUrl,
      });
    }
  }, [formData, filePreview, dialogOpen]);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  borderRadius: "16px",
                  p: 1.5,
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                }}
              >
                <SlideshowIcon sx={{ color: "#fff", fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-1px",
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  Hero Customization
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mt: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <PaletteIcon sx={{ fontSize: 16 }} />
                  Manage hero slider, content, images, and action links
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Tooltip title="Refresh slides" arrow>
                <Button
                  variant="outlined"
                  onClick={fetchSlides}
                  startIcon={<RefreshIcon />}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    color: "#64748b",
                    borderColor: "#e2e8f0",
                    bgcolor: "#fff",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      bgcolor: "#f8fafc",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Refresh
                </Button>
              </Tooltip>

              <Button
                variant="contained"
                onClick={handleOpenAdd}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.5)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Add New Slide
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>

      <Grid container spacing={4}>
        {/* Live Preview Section */}
        <Grid item xs={12}>
          <Grow in timeout={1000}>
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <PreviewIcon sx={{ color: "#6366f1", fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                  }}
                >
                  Live Shop Preview
                </Typography>
                <Chip
                  label="Real-time"
                  size="small"
                  sx={{
                    bgcolor: alpha("#6366f1", 0.1),
                    color: "#6366f1",
                    fontWeight: 600,
                    ml: 1,
                  }}
                />
              </Box>

              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  minHeight: "500px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 25px 50px rgba(15, 23, 42, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  transition: "all 0.4s ease",
                  "&:hover": {
                    boxShadow: "0 30px 60px rgba(15, 23, 42, 0.3)",
                  },
                }}
              >
                {/* Animated Background Overlay */}
                <Box sx={{ position: "absolute", inset: 0 }}>
                  <img
                    src={
                      previewData.imageUrl ||
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
                    }
                    alt="Live Preview Background"
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                      opacity: 0.45,
                      transition: "all 0.5s ease",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(3, 7, 18, 0.95) 0%, rgba(17, 24, 39, 0.7) 50%, transparent 100%)",
                      backdropFilter: "blur(2px)",
                    }}
                  />
                </Box>

                {/* Content with Animation */}
                <Fade in timeout={1500}>
                  <Box
                    sx={{
                      position: "relative",
                      px: { xs: 4, md: 10 },
                      py: 8,
                      maxWidth: "100%",
                      color: "#fff",
                      zIndex: 2,
                    }}
                  >
                    {previewData.subtitle && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "9999px",
                          px: 3,
                          py: 1,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "2px",
                          backdropFilter: "blur(10px)",
                          mb: 3,
                          animation: "pulse 2s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": {
                              boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)",
                            },
                            "50%": {
                              boxShadow: "0 0 0 10px rgba(99, 102, 241, 0)",
                            },
                          },
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
                        mb: 3,
                        fontSize: { xs: "2rem", md: "3.5rem" },
                        letterSpacing: "-1.5px",
                        background:
                          "linear-gradient(135deg, #fff 0%, #e2e8f0 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {previewData.title || "Elevate Your Style"}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "#cbd5e1",
                        mb: 4,
                        fontSize: { xs: "0.95rem", md: "1.15rem" },
                        lineHeight: 1.8,
                        maxWidth: "100%",
                        fontWeight: 400,
                      }}
                    >
                      {previewData.description ||
                        "Discover curated collections of premium fashion."}
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {previewData.buttonText1 && (
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            bgcolor: "#6366f1",
                            color: "#fff",
                            px: 4,
                            py: 1.8,
                            borderRadius: "14px",
                            fontWeight: 700,
                            fontSize: "1rem",
                            textTransform: "none",
                            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
                            "&:hover": {
                              bgcolor: "#4f46e5",
                              transform: "translateY(-2px)",
                              boxShadow: "0 12px 32px rgba(99, 102, 241, 0.5)",
                            },
                            transition: "all 0.3s ease",
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
                            borderWidth: "2px",
                            color: "#fff",
                            px: 4,
                            py: 1.8,
                            borderRadius: "14px",
                            fontWeight: 700,
                            fontSize: "1rem",
                            textTransform: "none",
                            backdropFilter: "blur(10px)",
                            "&:hover": {
                              borderColor: "#fff",
                              bgcolor: "rgba(255,255,255,0.15)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {previewData.buttonText2}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Fade>
              </Paper>
            </Box>
          </Grow>
        </Grid>

        {/* Slides Grid */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ImageIcon sx={{ color: "#6366f1" }} />
              Slide Collection
              <Chip
                label={slides.length}
                size="small"
                sx={{
                  bgcolor: alpha("#6366f1", 0.1),
                  color: "#6366f1",
                  fontWeight: 700,
                }}
              />
            </Typography>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 8,
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress size={50} sx={{ color: "#6366f1" }} />
              <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                Loading slides...
              </Typography>
            </Box>
          ) : slides.length === 0 ? (
            <Zoom in timeout={500}>
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: "24px",
                  border: "2px dashed #e2e8f0",
                  bgcolor: "#fff",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#6366f1",
                    bgcolor: "#f8fafc",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={handleOpenAdd}
              >
                <SlideshowIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ color: "#64748b", fontWeight: 600, mb: 1 }}
                >
                  No Hero Slides Yet
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Click here to create your first hero slide
                </Typography>
              </Paper>
            </Zoom>
          ) : (
            <Grid container spacing={3}>
              {slides.map((slide, index) => (
                <Grid item xs={12} md={6} key={slide._id}>
                  <Grow in timeout={800 + index * 200}>
                    <Card
                      sx={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
                          borderColor: "#6366f1",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            slide.imageUrl ||
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&fit=crop"
                          }
                          alt={slide.title}
                          sx={{
                            filter: "brightness(0.75)",
                            transition: "all 0.5s ease",
                            "&:hover": {
                              filter: "brightness(0.9)",
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                          }}
                        />
                        <Chip
                          icon={slide.isActive ? <CheckIcon /> : <CancelIcon />}
                          label={slide.isActive ? "Active" : "Disabled"}
                          color={slide.isActive ? "success" : "default"}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            fontWeight: 700,
                            backdropFilter: "blur(8px)",
                            bgcolor: slide.isActive
                              ? alpha("#10b981", 0.9)
                              : alpha("#64748b", 0.9),
                            color: "#fff",
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6366f1",
                            fontWeight: 700,
                            display: "block",
                            mb: 1,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          {slide.subtitle || "No Subtitle"}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            mb: 1.5,
                            fontSize: "1.1rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {slide.title || "No Title"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#64748b",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.6,
                          }}
                        >
                          {slide.description || "No description."}
                        </Typography>
                      </CardContent>

                      <Divider sx={{ borderColor: "#f1f5f9" }} />

                      <CardActions
                        sx={{ justifyContent: "space-between", px: 3, py: 2 }}
                      >
                        <Button
                          size="small"
                          startIcon={<PreviewIcon />}
                          onClick={() => setPreviewData(slide)}
                          sx={{
                            textTransform: "none",
                            color: "#6366f1",
                            fontWeight: 600,
                            "&:hover": {
                              bgcolor: alpha("#6366f1", 0.1),
                            },
                          }}
                        >
                          Preview
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit slide" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(slide)}
                              sx={{
                                color: "#3b82f6",
                                bgcolor: alpha("#3b82f6", 0.1),
                                "&:hover": {
                                  bgcolor: alpha("#3b82f6", 0.2),
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete slide" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(slide._id)}
                              sx={{
                                color: "#ef4444",
                                bgcolor: alpha("#ef4444", 0.1),
                                "&:hover": {
                                  bgcolor: alpha("#ef4444", 0.2),
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Enhanced Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(15, 23, 42, 0.25)",
          },
        }}
        TransitionComponent={Grow}
        transitionDuration={400}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: "1.5rem",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 4,
            py: 2.5,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              p: 1,
              display: "flex",
            }}
          >
            {isEditing ? <EditIcon /> : <AddIcon />}
          </Box>
          {isEditing ? "Edit Hero Slide" : "Create New Hero Slide"}
        </DialogTitle>

        <form onSubmit={handleSave}>
          <DialogContent sx={{ p: 4, bgcolor: "#f8fafc" }}>
            <Grid container spacing={4}>
              {/* Left Column - Form Fields */}
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <TextFieldsIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                    Content Details
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Subtitle / Tagline"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleFormChange}
                      placeholder="e.g. New Spring & Summer Collection"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TextFieldsIcon
                              sx={{ color: "#6366f1", fontSize: 20 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                      }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TextFieldsIcon
                              sx={{ color: "#6366f1", fontSize: 20 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Description Text"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Tell your shoppers more..."
                      multiline
                      rows={4}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": {
                            borderColor: "#6366f1",
                          },
                        },
                      }}
                    />
                  </Stack>

                  <Divider sx={{ my: 3, borderColor: "#e2e8f0" }} />

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LinkIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                    Button Settings
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Button 1 Text"
                        name="buttonText1"
                        value={formData.buttonText1}
                        onChange={handleFormChange}
                        placeholder="e.g. Shop Collection"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "&:hover fieldset": {
                              borderColor: "#6366f1",
                            },
                          },
                        }}
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "&:hover fieldset": {
                              borderColor: "#6366f1",
                            },
                          },
                        }}
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "&:hover fieldset": {
                              borderColor: "#6366f1",
                            },
                          },
                        }}
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "&:hover fieldset": {
                              borderColor: "#6366f1",
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right Column - Image Upload & Status */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#fff",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <ImageIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                    Background Image
                  </Typography>

                  <Box
                    sx={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "16px",
                      p: 4,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "#f8fafc",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#6366f1",
                        bgcolor: alpha("#6366f1", 0.02),
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(99, 102, 241, 0.1)",
                      },
                      position: "relative",
                      mb: 3,
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                    <CloudUploadIcon
                      sx={{ fontSize: 48, color: "#6366f1", mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "#475569", mb: 1 }}
                    >
                      Click to Upload Banner Image
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", display: "block" }}
                    >
                      Supports JPG, PNG or WEBP
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", display: "block" }}
                    >
                      Recommended: 1920 x 1080px
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": {
                          borderColor: "#6366f1",
                        },
                      },
                    }}
                  />

                  {filePreview && (
                    <Fade in timeout={500}>
                      <Box
                        sx={{
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "2px solid #e2e8f0",
                          mb: 3,
                          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.1)",
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="180"
                          image={filePreview}
                          alt="Banner Preview"
                          sx={{ objectFit: "cover" }}
                        />
                      </Box>
                    </Fade>
                  )}

                  <Divider sx={{ my: 3, borderColor: "#e2e8f0" }} />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleFormChange}
                        name="isActive"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#6366f1",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#6366f1",
                            },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                        Make this slide active/visible
                      </Typography>
                    }
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: 4,
              pb: 3,
              pt: 2,
              bgcolor: "#fff",
              borderTop: "1px solid #e2e8f0",
              gap: 2,
            }}
          >
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outlined"
              sx={{
                color: "#64748b",
                fontWeight: 600,
                borderRadius: "12px",
                px: 4,
                borderColor: "#e2e8f0",
                "&:hover": {
                  borderColor: "#6366f1",
                  color: "#6366f1",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveLoading}
              startIcon={
                saveLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CheckIcon />
                )
              }
              sx={{
                borderRadius: "12px",
                px: 4,
                fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.5)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {saveLoading ? "Saving..." : "Save Banner"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HeroCustomization;
