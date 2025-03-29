import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { selectAuthToken } from '../store/slices/authSlice';
import { setCartItems, selectCartItems, selectCartLoading, selectCartError } from '../store/slices/cartSlice';
import logger from '../utils/logger';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectAuthToken);
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      if (data.code === 200) {
        dispatch(setCartItems(data.data));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      logger.error('Error fetching cart', { error: err.message });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/cart/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const result = await response.json();
      if (result.code === 200) {
        dispatch(setCartItems(result.data));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      logger.error('Error updating cart', { error: err.message });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      const result = await response.json();
      if (result.code === 200) {
        dispatch(setCartItems(result.data));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      logger.error('Error removing from cart', { error: err.message });
    }
  };

  const handleProceedToCheckout = () => {
    if (!cartItems || !cartItems.items || cartItems.items.length === 0) {
      return;
    }

    const outOfStockItems = cartItems.items.filter(
      item => item.quantity > (item.productId.stockQuantity || 0)
    );

    if (outOfStockItems.length > 0) {
      setError('Some items in your cart are out of stock or have insufficient quantity');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if cart is empty or items array doesn't exist
  const isCartEmpty = !cartItems || !cartItems.items || cartItems.items.length === 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mr: 2 }}
        >
          Back to Products
        </Button>
        <Typography variant="h4" component="h1">
          Shopping Cart
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isCartEmpty ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.items.map((item) => (
              <Card key={item.productId._id || item.productId} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <img
                        src={item.productId.images?.[0]}
                        alt={item.productId.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    </Grid>
                    <Grid item xs={9}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">{item.productId.name}</Typography>
                        <Typography variant="h6" color="primary">
                          ${((item.productId.price || 0) * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId._id || item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                updateQuantity(item.productId._id || item.productId, value);
                              }
                            }}
                            sx={{ width: 60, mx: 1 }}
                            inputProps={{ 
                              min: 1, 
                              style: { textAlign: 'center' },
                              type: 'number'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId._id || item.productId, item.quantity + 1)}
                            disabled={item.quantity >= (item.productId.stockQuantity || Infinity)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.productId._id || item.productId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        Available Stock: {item.productId.stockQuantity || 'N/A'} {item.productId.unit}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Grid container justifyContent="space-between">
                    <Typography>Subtotal ({cartItems.items.length} items)</Typography>
                    <Typography>
                      ${cartItems.items.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.items.length === 0}
                  sx={{
                    height: 48,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  {cartItems.items.length === 0 
                    ? 'Cart is Empty' 
                    : `Proceed to Checkout ($${cartItems.items.reduce(
                        (sum, item) => sum + (item.productId.price * item.quantity), 
                        0
                      ).toFixed(2)})`
                  }
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage; 