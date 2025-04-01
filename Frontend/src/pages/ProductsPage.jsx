import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Paper,
  Button,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Fab,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { selectAuthToken, selectRoleName } from "../store/slices/authSlice";
import { setCartItems, selectCartItems } from "../store/slices/cartSlice";
import logger from "../utils/logger";
import LowStockIndicator from "../components/LowStockIndicator";
import { api } from "../utils/api";

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const token = useSelector(selectAuthToken);
  const roleName = useSelector(selectRoleName)?.toLowerCase();
  const isWarehouseWorker = roleName === "warehouse worker";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const cartItems = useSelector(selectCartItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // For warehouse worker product CRUD
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: "add", // 'add' or 'edit'
    product: {
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      imageUrl: "",
    },
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      if (result.code === 200) {
        setProducts(result.data.products);
        setCategories(result.data.categories);
        const imageIndices = {};
        result.data.products.forEach((product) => {
          imageIndices[product._id] = 0;
        });
        setCurrentImageIndex(imageIndices);
        logger.info("Products fetched successfully", {
          count: result.data.count,
        });
      } else {
        throw new Error(result.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      logger.error("Error fetching products", { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    let matchesPrice = true;
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      matchesPrice =
        product.price >= min && (max ? product.price <= max : true);
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleImageChange = (productId, direction) => {
    setCurrentImageIndex((prev) => {
      const currentIndex = prev[productId];
      const product = products.find((p) => p._id === productId);
      const maxIndex = product.images.length - 1;

      let newIndex;
      if (direction === "next") {
        newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      }

      return { ...prev, [productId]: newIndex };
    });
  };

  const isProductInCart = (productId) => {
    return cartItems?.items?.some(
      (item) => item.productId._id === productId || item.productId === productId
    );
  };

  const handleAddToCart = async (productId, event) => {
    event.stopPropagation(); // Prevent navigation to product details
    try {
      const response = await fetch("http://localhost:3000/api/cart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        dispatch(setCartItems(result.data));
        setSnackbar({
          open: true,
          message: "Item added to cart successfully",
          severity: "success",
        });
      } else {
        throw new Error(result.message || "Failed to add item to cart");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error",
      });
      logger.error("Error adding item to cart", { error: err.message });
    }
  };

  const FilterDrawer = () => (
    <Drawer
      anchor={isMobile ? "bottom" : "left"}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 280,
          p: 2,
          borderRadius: isMobile ? "16px 16px 0 0" : 0,
        },
      }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Price Range</InputLabel>
        <Select
          value={priceRange}
          label="Price Range"
          onChange={(e) => setPriceRange(e.target.value)}>
          <MenuItem value="all">All Prices</MenuItem>
          <MenuItem value="0-50">$0 - $50</MenuItem>
          <MenuItem value="50-100">$50 - $100</MenuItem>
          <MenuItem value="100-200">$100 - $200</MenuItem>
          <MenuItem value="200-500">$200 - $500</MenuItem>
          <MenuItem value="500">$500+</MenuItem>
        </Select>
      </FormControl>

      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          setSelectedCategory("all");
          setPriceRange("all");
          setSearchQuery("");
        }}>
        Clear Filters
      </Button>
    </Drawer>
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Warehouse worker product management functions
  const handleOpenProductDialog = (mode, product = null) => {
    setProductDialog({
      open: true,
      mode,
      product: product || {
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        category: "",
        imageUrl: "",
      },
    });
  };

  const handleCloseProductDialog = () => {
    setProductDialog({
      ...productDialog,
      open: false,
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

  const handleSaveProduct = async () => {
    try {
      setLoading(true);
      // Placeholder for actual API call
      console.log("Saving product:", productDialog.product);

      // Mock success response
      setTimeout(() => {
        setSnackbar({
          open: true,
          message:
            productDialog.mode === "add"
              ? "Product added successfully!"
              : "Product updated successfully!",
          severity: "success",
        });
        handleCloseProductDialog();
        fetchProducts();
      }, 1000);
    } catch (error) {
      console.error("Error saving product:", error);
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
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        // Placeholder for actual API call
        console.log("Deleting product:", productId);

        // Mock success response
        setTimeout(() => {
          setSnackbar({
            open: true,
            message: "Product deleted successfully!",
            severity: "success",
          });
          fetchProducts();
        }, 1000);
      } catch (error) {
        console.error("Error deleting product:", error);
        setSnackbar({
          open: true,
          message: `Failed to delete product: ${error.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setDrawerOpen(true)}>
                Filters
              </Button>
            </Grid>
          </Grid>
        </Box>

        {(selectedCategory !== "all" || priceRange !== "all") && (
          <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedCategory !== "all" && (
              <Chip
                label={`Category: ${selectedCategory}`}
                onDelete={() => setSelectedCategory("all")}
              />
            )}
            {priceRange !== "all" && (
              <Chip
                label={`Price: $${priceRange}`}
                onDelete={() => setPriceRange("all")}
              />
            )}
          </Box>
        )}

        <Box>
          <Grid container spacing={3} justifyContent="center">
            {filteredProducts.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product._id}
                sx={{
                  display: "flex",
                }}>
                <Card
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                  onClick={() => navigate(`/products/${product._id}`)}>
                  <LowStockIndicator
                    stockQuantity={product.stockQuantity}
                    unit={product.unit}
                    variant="badge"
                  />
                  <Box sx={{ position: "relative", pt: "100%" }}>
                    <CardMedia
                      component="img"
                      image={
                        product.images[currentImageIndex[product._id]] ||
                        "https://via.placeholder.com/280"
                      }
                      alt={product.name}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        bgcolor: "grey.50",
                        p: 2,
                      }}
                    />
                    {product.images.length > 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 0,
                          right: 0,
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}>
                        {product.images.map((_, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                index === currentImageIndex[product._id]
                                  ? "primary.main"
                                  : "grey.300",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setCurrentImageIndex((prev) => ({
                                ...prev,
                                [product._id]: index,
                              }))
                            }
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                    }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        lineHeight: 1.3,
                        height: "2.6rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}>
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        height: "3rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontSize: "0.875rem",
                      }}>
                      {product.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontSize: "1.5rem" }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Chip
                        label={product.category}
                        size="medium"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}>
                        SKU: {product.sku}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            product.stockQuantity > 0
                              ? product.stockQuantity <= 5
                                ? "warning.main"
                                : "success.main"
                              : "error.main",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}>
                        {product.stockQuantity > 0 ? (
                          <>
                            Current Stock: {product.stockQuantity}{" "}
                            {product.unit}
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
                          </>
                        ) : (
                          <Typography
                            component="span"
                            sx={{
                              color: "error.main",
                              backgroundColor: "error.lighter",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}>
                            Out of Stock
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    {product.specifications &&
                      product.specifications.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Specifications:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}>
                            {product.specifications.map((spec) => (
                              <Chip
                                key={spec._id}
                                label={`${spec.key}: ${spec.value}`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.75rem" }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant={
                        isProductInCart(product._id) ? "outlined" : "contained"
                      }
                      startIcon={<CartIcon />}
                      disabled={product.stockQuantity === 0}
                      onClick={(e) => handleAddToCart(product._id, e)}
                      sx={{
                        bgcolor: isProductInCart(product._id)
                          ? "transparent"
                          : "primary.main",
                        color: isProductInCart(product._id)
                          ? "primary.main"
                          : "white",
                        borderColor: "primary.main",
                        "&:hover": {
                          bgcolor: isProductInCart(product._id)
                            ? "primary.lighter"
                            : "primary.dark",
                        },
                        transition: "all 0.3s ease",
                        position: "relative",
                      }}>
                      {product.stockQuantity === 0
                        ? "Out of Stock"
                        : isProductInCart(product._id)
                        ? "In Cart"
                        : "Add to Cart"}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredProducts.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
              <Typography variant="h6" color="text.secondary">
                No products found matching your criteria
              </Typography>
            </Paper>
          )}
        </Box>

        <FilterDrawer />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProductsPage;
