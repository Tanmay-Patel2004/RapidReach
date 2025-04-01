import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  CloudUpload as UploadIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { selectAuthToken, selectRoleName } from "../store/slices/authSlice";
import logger from "../utils/logger";

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const token = useSelector(selectAuthToken);
  const roleName = useSelector(selectRoleName);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // File input refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Product dialog state
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: "add", // 'add' or 'edit'
    product: {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      sku: "",
      unit: "pieces",
      images: [],
      specifications: [], // Add specifications array
      warehouseCode: "", // Add warehouse code field
    },
    imageFiles: [], // New field for image file uploads
    imageFilePreviews: [], // New field for image previews
    videoFile: null, // New field for video file upload
    videoPreview: null, // New field for video preview
  });

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    productName: "",
  });

  // Check if user is warehouse worker
  useEffect(() => {
    if (roleName && roleName.toLowerCase() !== "warehouse worker") {
      navigate("/dashboard");
    }
  }, [roleName, navigate]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, token]);

  // Real API fetch products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = searchQuery
        ? `http://localhost:3000/api/products?search=${searchQuery}&page=${currentPage}`
        : `http://localhost:3000/api/products?page=${currentPage}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.code === 200) {
        setProducts(result.data.products);
        setCategories(result.data.categories || []);
        setTotalPages(Math.ceil(result.data.count / result.data.pageSize) || 1);
        logger.info("Products fetched successfully", {
          count: result.data.count,
        });
      } else {
        throw new Error(result.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
      logger.error("Error fetching products", { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const handleOpenProductDialog = (mode, product = null) => {
    const initialProduct = product || {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      sku: "",
      unit: "pieces",
      images: [],
      specifications: [], // Add specifications default
      warehouseCode: "WH001", // Default warehouse code
    };

    // Create image previews from existing images if editing
    const imagePreviews =
      initialProduct.images?.map((url) => ({
        url,
        isExisting: true,
      })) || [];

    setProductDialog({
      open: true,
      mode,
      product: initialProduct,
      imageFiles: [],
      imageFilePreviews: imagePreviews,
      videoFile: null,
      videoPreview: initialProduct.videoUrl || null,
    });
  };

  const handleCloseProductDialog = () => {
    setProductDialog({
      ...productDialog,
      open: false,
      imageFiles: [],
      imageFilePreviews: [],
      videoFile: null,
      videoPreview: null,
    });
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductDialog({
      ...productDialog,
      product: {
        ...productDialog.product,
        [name]: value,
      },
    });
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create previews for selected images
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setProductDialog({
      ...productDialog,
      imageFiles: [...productDialog.imageFiles, ...files],
      imageFilePreviews: [...productDialog.imageFilePreviews, ...newPreviews],
    });

    // Reset file input
    e.target.value = null;
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    const updatedPreviews = [...productDialog.imageFilePreviews];
    const removedPreview = updatedPreviews[index];

    // Revoke object URL if it's a file preview
    if (!removedPreview.isExisting) {
      URL.revokeObjectURL(removedPreview.url);
    }

    updatedPreviews.splice(index, 1);

    // If it's a new file, remove it from imageFiles too
    let updatedFiles = [...productDialog.imageFiles];
    if (!removedPreview.isExisting) {
      const fileIndex = updatedFiles.findIndex(
        (f) => f === removedPreview.file
      );
      if (fileIndex !== -1) {
        updatedFiles.splice(fileIndex, 1);
      }
    }

    // If it's an existing image, update the product images array
    let updatedProductImages = [...productDialog.product.images];
    if (removedPreview.isExisting) {
      updatedProductImages = updatedProductImages.filter(
        (url) => url !== removedPreview.url
      );
    }

    setProductDialog({
      ...productDialog,
      imageFiles: updatedFiles,
      imageFilePreviews: updatedPreviews,
      product: {
        ...productDialog.product,
        images: updatedProductImages,
      },
    });
  };

  // Handle video selection
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke previous preview URL if exists
    if (productDialog.videoPreview && !productDialog.product.videoUrl) {
      URL.revokeObjectURL(productDialog.videoPreview);
    }

    setProductDialog({
      ...productDialog,
      videoFile: file,
      videoPreview: URL.createObjectURL(file),
    });

    // Reset file input
    e.target.value = null;
  };

  // Handle video removal
  const handleRemoveVideo = () => {
    // Revoke object URL if it's a file preview
    if (productDialog.videoPreview && !productDialog.product.videoUrl) {
      URL.revokeObjectURL(productDialog.videoPreview);
    }

    setProductDialog({
      ...productDialog,
      videoFile: null,
      videoPreview: null,
      product: {
        ...productDialog.product,
        videoUrl: null,
      },
    });
  };

  // Add a new specification field
  const handleAddSpecification = () => {
    setProductDialog({
      ...productDialog,
      product: {
        ...productDialog.product,
        specifications: [
          ...productDialog.product.specifications,
          { key: "", value: "" },
        ],
      },
    });
  };

  // Update specification field
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...productDialog.product.specifications];
    updatedSpecs[index] = {
      ...updatedSpecs[index],
      [field]: value,
    };

    setProductDialog({
      ...productDialog,
      product: {
        ...productDialog.product,
        specifications: updatedSpecs,
      },
    });
  };

  // Remove specification field
  const handleRemoveSpecification = (index) => {
    const updatedSpecs = [...productDialog.product.specifications];
    updatedSpecs.splice(index, 1);

    setProductDialog({
      ...productDialog,
      product: {
        ...productDialog.product,
        specifications: updatedSpecs,
      },
    });
  };

  // CRUD operations with real API
  const handleSaveProduct = async () => {
    try {
      setLoading(true);

      // Create form data for the request
      const formData = new FormData();

      // Prepare base product data
      const productData = {
        ...productDialog.product,
        price: Number(productDialog.product.price),
        stockQuantity: Number(productDialog.product.stockQuantity),
      };

      // Add all product data fields
      formData.append("name", productData.name);
      formData.append("description", productData.description || "");
      formData.append("price", productData.price.toString());
      formData.append("stockQuantity", productData.stockQuantity.toString());
      formData.append("category", productData.category || "");
      formData.append("sku", productData.sku || "");
      formData.append("unit", productData.unit || "pieces");
      formData.append("warehouseCode", productData.warehouseCode || "WH001");

      // Handle specifications separately - we need to use a format Mongoose can work with
      const cleanedSpecifications = productData.specifications.map((spec) => ({
        key: spec.key,
        value: spec.value,
      }));

      // Instead of sending a JSON string, send each specification as a separate field
      // This allows the backend to reconstruct the array properly
      cleanedSpecifications.forEach((spec, index) => {
        formData.append(`specifications[${index}][key]`, spec.key);
        formData.append(`specifications[${index}][value]`, spec.value);
      });

      // Add detailed debug logging
      console.log("Sending specifications as separate fields:");
      cleanedSpecifications.forEach((spec, index) => {
        console.log(`specifications[${index}]:`, spec);
      });

      // Track existing images that should be kept
      const existingImages = productDialog.imageFilePreviews
        .filter((preview) => preview.isExisting)
        .map((preview) => preview.url);

      if (existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      // Add new image files
      productDialog.imageFiles.forEach((file, index) => {
        formData.append(`images`, file); // Use a standard field name
      });

      // Add video file if exists
      if (productDialog.videoFile) {
        formData.append("video", productDialog.videoFile);
      } else if (productData.videoUrl) {
        formData.append("existingVideo", productData.videoUrl);
      }

      // Add debug logging for FormData
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File ${value.name} (${value.size} bytes)`);
        } else if (typeof value === "string" && value.length > 100) {
          console.log(`${key}: ${value.substring(0, 50)}...`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      let response;

      if (productDialog.mode === "add") {
        // Create new product with FormData
        response = await fetch("http://localhost:3000/api/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type when sending FormData
          },
          body: formData,
        });
      } else {
        // Update existing product with FormData
        response = await fetch(
          `http://localhost:3000/api/products/${productDialog.product._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type when sending FormData
            },
            body: formData,
          }
        );
      }

      // Handle response
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("API response:", result);
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error(
          `Server response was not valid JSON: ${responseText.substring(
            0,
            200
          )}`
        );
      }

      if (!response.ok || (result.code !== 200 && result.code !== undefined)) {
        // Check if the message still indicates success despite error status
        if (
          result.message &&
          (result.message.toLowerCase().includes("success") ||
            result.message.toLowerCase().includes("created") ||
            result.message.toLowerCase().includes("updated"))
        ) {
          // This is actually a success despite error status
          setSnackbar({
            open: true,
            message: result.message,
            severity: "success",
          });

          handleCloseProductDialog();
          fetchProducts();
          return; // Exit early to avoid throwing error
        }

        // It's a genuine error
        console.error("Full error response:", result);
        throw new Error(
          result.message ||
            result.error ||
            `Failed to ${
              productDialog.mode === "add" ? "add" : "update"
            } product`
        );
      }

      setSnackbar({
        open: true,
        message: `Product ${
          productDialog.mode === "add" ? "added" : "updated"
        } successfully!`,
        severity: "success",
      });

      handleCloseProductDialog();
      fetchProducts();
    } catch (error) {
      console.error(
        `Error ${
          productDialog.mode === "add" ? "adding" : "updating"
        } product:`,
        error
      );
      setSnackbar({
        open: true,
        message: `Failed to ${productDialog.mode} product: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("Delete response:", result);

      // Check if the response contains a success message or status code
      if (
        response.ok ||
        result.code === 200 ||
        result.message?.toLowerCase().includes("success") ||
        result.message?.toLowerCase().includes("removed") ||
        result.message?.toLowerCase().includes("deleted")
      ) {
        setSnackbar({
          open: true,
          message: result.message || "Product deleted successfully!",
          severity: "success",
        });
        fetchProducts();
      } else {
        throw new Error(result.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      // Check if the error message indicates success (some APIs return success messages in error responses)
      if (
        error.message?.toLowerCase().includes("success") ||
        error.message?.toLowerCase().includes("removed") ||
        error.message?.toLowerCase().includes("deleted")
      ) {
        setSnackbar({
          open: true,
          message: error.message,
          severity: "success",
        });
        fetchProducts();
      } else {
        setSnackbar({
          open: true,
          message: `Failed to delete product: ${error.message}`,
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, productId: null, productName: "" });
    }
  };

  // Pagination handler
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Search handler
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Search submit handler
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchProducts();
  };

  // Snackbar handler
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter products based on search query (client-side filtering as backup)
  const filteredProducts =
    searchQuery.trim() !== ""
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description &&
              product.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (product.category &&
              product.category
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
        )
      : products;

  // Add these new functions for managing the delete dialog
  const handleOpenDeleteDialog = (product) => {
    setDeleteDialog({
      open: true,
      productId: product._id,
      productName: product.name,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      productId: null,
      productName: "",
    });
  };

  const confirmDeleteProduct = () => {
    if (deleteDialog.productId) {
      handleDeleteProduct(deleteDialog.productId);
    }
  };

  // Render loading state
  if (loading && products.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error && products.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Management
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              label="Search Products"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" type="submit">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </form>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenProductDialog("add")}>
            Add Product
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="products table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product._id}</TableCell>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <Box
                        component="img"
                        sx={{ width: 50, height: 50, objectFit: "contain" }}
                        src={product.images[0]}
                        alt={product.name}
                      />
                    ) : (
                      <ImageIcon sx={{ width: 50, height: 50, p: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category || "N/A"}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.stockQuantity} {product.unit || "pieces"}
                    {product.stockQuantity <= 5 && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          color: "warning.main",
                          backgroundColor: "warning.lighter",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          ml: 1,
                        }}>
                        Low Stock
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenProductDialog("edit", product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(product)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1">
                    No products found. Add some products to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={productDialog.open}
        onClose={handleCloseProductDialog}
        maxWidth="md"
        fullWidth>
        <DialogTitle>
          {productDialog.mode === "add" ? "Add New Product" : "Edit Product"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Product Name"
              name="name"
              value={productDialog.product.name || ""}
              onChange={handleProductInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={productDialog.product.description || ""}
              onChange={handleProductInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="SKU"
              name="sku"
              value={productDialog.product.sku || ""}
              onChange={handleProductInputChange}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Price"
                name="price"
                type="number"
                value={productDialog.product.price || ""}
                onChange={handleProductInputChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <Typography>$</Typography>,
                }}
              />
              <TextField
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={productDialog.product.stockQuantity || ""}
                onChange={handleProductInputChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={productDialog.product.category || ""}
                  onChange={handleProductInputChange}
                  label="Category">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))
                  ) : (
                    <>
                      <MenuItem value="Electronics">Electronics</MenuItem>
                      <MenuItem value="Clothing">Clothing</MenuItem>
                      <MenuItem value="Home & Kitchen">Home & Kitchen</MenuItem>
                      <MenuItem value="Books">Books</MenuItem>
                      <MenuItem value="Toys">Toys</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={productDialog.product.unit || "pieces"}
                  onChange={handleProductInputChange}
                  label="Unit">
                  <MenuItem value="pieces">Pieces</MenuItem>
                  <MenuItem value="kg">Kilograms</MenuItem>
                  <MenuItem value="g">Grams</MenuItem>
                  <MenuItem value="l">Liters</MenuItem>
                  <MenuItem value="ml">Milliliters</MenuItem>
                  <MenuItem value="packs">Packs</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Warehouse Code"
              name="warehouseCode"
              value={productDialog.product.warehouseCode || "WH001"}
              onChange={handleProductInputChange}
              fullWidth
              required
              helperText="Warehouse identification code (e.g., WH001)"
            />

            {/* Specifications Section */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle1">
                Product Specifications
              </Typography>
            </Divider>

            <Box>
              {productDialog.product.specifications.map((spec, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                  }}>
                  <TextField
                    label="Feature"
                    value={spec.key || ""}
                    onChange={(e) =>
                      handleSpecificationChange(index, "key", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Value"
                    value={spec.value || ""}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveSpecification(index)}>
                    <CancelIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSpecification}
                sx={{ mt: 1 }}>
                Add Specification
              </Button>
            </Box>

            {/* Image Upload Section */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle1">Product Images</Typography>
            </Divider>

            <Box>
              <Grid container spacing={2}>
                {/* Image Preview Grid */}
                {productDialog.imageFilePreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={preview.url}
                        alt={`Product image ${index + 1}`}
                        sx={{ objectFit: "contain" }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                        onClick={() => handleRemoveImage(index)}>
                        <CancelIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}

                {/* Upload Button Card */}
                <Grid item xs={6} sm={4} md={3}>
                  <Card
                    sx={{
                      height: "140px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      border: "2px dashed #ccc",
                      bgcolor: "background.default",
                    }}
                    onClick={() => imageInputRef.current.click()}>
                    <CardContent>
                      <Stack direction="column" spacing={1} alignItems="center">
                        <UploadIcon color="primary" fontSize="large" />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center">
                          Click to upload image
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Video Upload Section */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle1">
                Product Video (Optional)
              </Typography>
            </Divider>

            <Box>
              {productDialog.videoPreview ? (
                <Card sx={{ position: "relative", maxWidth: 500, mx: "auto" }}>
                  <CardMedia
                    component="video"
                    controls
                    height="240"
                    src={productDialog.videoPreview}
                    sx={{ objectFit: "contain" }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    onClick={handleRemoveVideo}>
                    <CancelIcon />
                  </IconButton>
                </Card>
              ) : (
                <Card
                  sx={{
                    height: "140px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    border: "2px dashed #ccc",
                    bgcolor: "background.default",
                    maxWidth: 500,
                    mx: "auto",
                  }}
                  onClick={() => videoInputRef.current.click()}>
                  <CardContent>
                    <Stack direction="column" spacing={1} alignItems="center">
                      <VideoIcon color="primary" fontSize="large" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center">
                        Click to upload product video
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                style={{ display: "none" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Cancel</Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            color="primary"
            disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete{" "}
            <strong>{deleteDialog.productName}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteProduct}
            color="error"
            variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManagementPage;
