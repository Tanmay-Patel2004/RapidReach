import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  CheckCircleOutline,
} from '@mui/icons-material';
import { selectAuthToken } from '../store/slices/authSlice';
import { selectCartItems, setCartItems } from '../store/slices/cartSlice';
import logger from '../utils/logger';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const cartItems = useSelector(selectCartItems);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
  });

  const steps = ['Review Cart', 'Shipping Details', 'Confirm Order'];

  const calculateTotalAmount = () => {
    return cartItems.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProductStock = async (orderItems) => {
    try {
      const response = await fetch('http://localhost:3000/api/products/update-stock', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems.map(item => ({
            productId: item.productId._id || item.productId,
            quantity: item.quantity
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product stock');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating product stock:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // First place the order
      const orderResponse = await fetch('http://localhost:3000/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          products: cartItems.items.map(item => ({
            productId: item.productId._id || item.productId,
            name: item.productId.name,
            quantity: item.quantity,
            price: item.productId.price
          })),
          totalAmount: calculateTotalAmount()
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const orderResult = await orderResponse.json();

      if (orderResult.code === 201) {
        try {
          // Clear the cart after successful order
          const cartResponse = await fetch('http://localhost:3000/api/cart/clear', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!cartResponse.ok) {
            console.warn('Failed to clear cart, but order was placed successfully');
          } else {
            // Update Redux cart state
            dispatch(setCartItems({ items: [] }));
          }

          // Show success message and redirect
          setOrderSuccess(true);
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        } catch (cartError) {
          console.warn('Error clearing cart:', cartError);
          // Still show success since order was placed
          setOrderSuccess(true);
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        }
      } else {
        throw new Error(orderResult.message || 'Failed to place order');
      }

    } catch (err) {
      setError(err.message || 'An error occurred while placing the order');
      logger.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for your purchase. Your order has been placed successfully.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will receive a confirmation email shortly.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            View Orders
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review Your Cart
                  </Typography>
                  {cartItems.items.map((item) => (
                    <Box key={item.productId._id} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                          <img
                            src={item.productId.images[0]}
                            alt={item.productId.name}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle1">
                            {item.productId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle1" align="right">
                            ${(item.productId.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  ))}
                </Box>
              )}

              {activeStep === 1 && (
                <Box component="form">
                  <Typography variant="h6" gutterBottom>
                    Shipping Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Full Name"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Shipping Address"
                        name="address"
                        multiline
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  {/* Products List */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Products
                    </Typography>
                    {cartItems.items.map((item) => (
                      <Card key={item.productId._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                              <img
                                src={item.productId.images[0]}
                                alt={item.productId.name}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  objectFit: 'contain',
                                }}
                              />
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="subtitle2">
                                {item.productId.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: {item.quantity} x ${item.productId.price.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="subtitle2" align="right">
                                ${(item.productId.price * item.quantity).toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Shipping Details */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Shipping Details
                    </Typography>
                    <Card sx={{ bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body1">
                              {formData.customerName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              {formData.phone}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {formData.email}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Shipping Address
                            </Typography>
                            <Typography variant="body1">
                              {formData.address}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Order Total */}
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Grid container justifyContent="space-between">
                          <Typography variant="body1">Subtotal</Typography>
                          <Typography variant="body1">
                            ${calculateTotalAmount().toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container justifyContent="space-between">
                          <Typography variant="body1">Shipping</Typography>
                          <Typography variant="body1">Free</Typography>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Grid container justifyContent="space-between">
                          <Typography variant="h6">Total</Typography>
                          <Typography variant="h6" color="primary">
                            ${calculateTotalAmount().toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Terms and Conditions */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    Place Order
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Typography>Subtotal ({cartItems.items.length} items)</Typography>
                  <Typography>${calculateTotalAmount().toFixed(2)}</Typography>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Total: ${calculateTotalAmount().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage; 