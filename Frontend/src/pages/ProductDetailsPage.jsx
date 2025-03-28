import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Divider,
  Card,
  CardMedia,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../store/slices/authSlice';
import logger from '../utils/logger';
import LowStockIndicator from '../components/LowStockIndicator';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = useSelector(selectAuthToken);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const result = await response.json();
        
        if (result.code === 200) {
          setProduct(result.data);
          logger.info('Product details fetched successfully');
        } else {
          throw new Error(result.message || 'Failed to fetch product details');
        }
      } catch (err) {
        setError(err.message);
        logger.error('Error fetching product details', { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev >= product.images.length - 1 ? 0 : prev + 1;
      } else {
        return prev <= 0 ? product.images.length - 1 : prev - 1;
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mb: 3 }}
        >
          Back to Products
        </Button>

        <Grid container spacing={4}>
          {/* Left side - Images and Video */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, position: 'relative' }}>
              <CardMedia
                component="img"
                height={400}
                image={product.images[currentImageIndex]}
                alt={product.name}
                sx={{ objectFit: 'contain', bgcolor: 'grey.50' }}
              />
              {product.images.length > 1 && (
                <>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={() => handleImageNavigation('prev')}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={() => handleImageNavigation('next')}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                </>
              )}
            </Card>

            {/* Thumbnail Images */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    border: index === currentImageIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: theme.palette.grey[50],
                    }}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                </Box>
              ))}
            </Box>

            {/* Product Video */}
            {product.video && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Product Video
                </Typography>
                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                  <video
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: theme.palette.grey[100],
                    }}
                  >
                    <source src={product.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>
              </Box>
            )}
          </Grid>

          {/* Right side - Product Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, position: 'relative' }}>
              {/* Add LowStockIndicator badge */}
              <LowStockIndicator 
                stockQuantity={product.stockQuantity} 
                unit={product.unit} 
                variant="badge"
                sx={{
                  top: 16,
                  right: 16,
                  '& .MuiChip-label': {
                    px: 2,
                    py: 0.5,
                    fontSize: '0.9rem',
                  },
                }}
              />

              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>

              <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                ${product.price.toFixed(2)}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Chip
                  label={product.category}
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  color={product.stockQuantity > 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {product.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Product Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      SKU
                    </Typography>
                    <Typography variant="body1">
                      {product.sku}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Stock
                    </Typography>
                    {/* Add LowStockIndicator text variant */}
                    <LowStockIndicator 
                      stockQuantity={product.stockQuantity} 
                      unit={product.unit} 
                      variant="text"
                      sx={{ 
                        fontSize: '1rem',
                        mt: 0.5
                      }}
                    />
                    {/* Show regular stock text if not low on stock */}
                    {(product.stockQuantity >= 5 || product.stockQuantity === 0) && (
                      <Typography variant="body1">
                        {product.stockQuantity} {product.unit}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Specifications
                  </Typography>
                  <Grid container spacing={2}>
                    {product.specifications.map((spec) => (
                      <Grid item xs={12} key={spec._id}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {spec.key}
                          </Typography>
                          <Typography variant="body1">
                            {spec.value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Warehouse Information */}
              {product.warehouse && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Warehouse Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {product.warehouse.warehouseCode}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {product.warehouse.address.street}<br />
                      {product.warehouse.address.province}, {product.warehouse.address.country}<br />
                      {product.warehouse.address.zipCode}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Add to Cart Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CartIcon />}
                disabled={product.stockQuantity === 0}
                sx={{ mt: 2 }}
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductDetailsPage; 