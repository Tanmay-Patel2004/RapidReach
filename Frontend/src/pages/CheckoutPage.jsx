import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  CheckCircleOutline,
  CreditCard as CreditCardIcon,
  Money as MoneyIcon,
} from "@mui/icons-material";
import { selectAuthToken } from "../store/slices/authSlice";
import { selectCartItems, setCartItems } from "../store/slices/cartSlice";
import logger from "../utils/logger";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const cartItems = useSelector(selectCartItems);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "card", // Default payment method
    cardDetails: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const steps = [
    "Review Cart",
    "Shipping Details",
    "Payment Method",
    "Confirm Order",
  ];

  const calculateTotalAmount = () => {
    return cartItems.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateTotalAmount();
    return subtotal * 0.13; // 13% tax
  };

  const calculateFinalTotal = () => {
    return calculateTotalAmount() + calculateTax();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProductStock = async (orderItems) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/products/update-stock",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: orderItems.map((item) => ({
              productId: item.productId._id || item.productId,
              quantity: item.quantity,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update product stock");
      }

      return await response.json();
    } catch (error) {
      logger.error("Error updating product stock:", error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // For card payments, show a payment processing step
      if (formData.paymentMethod === "card") {
        setPaymentProcessing(true);

        // Mock payment processing - simulate a 2 second delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Randomly determine if payment was successful (90% success rate)
        const isPaymentSuccessful = Math.random() < 0.9;

        if (!isPaymentSuccessful) {
          setPaymentProcessing(false);
          throw new Error(
            "Payment failed. Please try again or use a different payment method."
          );
        }

        setPaymentComplete(true);

        // Wait 1 more second before proceeding with order creation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Calculate tax and total with tax
      const subtotal = calculateTotalAmount();
      const tax = calculateTax();
      const totalWithTax = calculateFinalTotal();

      // First place the order
      const orderResponse = await fetch(
        "http://localhost:3000/api/orders/checkout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            paymentMethod: formData.paymentMethod,
            paymentStatus:
              formData.paymentMethod === "cod" ? "pending" : "paid",
            products: cartItems.items.map((item) => ({
              productId: item.productId._id || item.productId,
              name: item.productId.name,
              quantity: item.quantity,
              price: item.productId.price,
            })),
            subtotal: subtotal,
            tax: tax,
            totalAmount: totalWithTax,
          }),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const orderResult = await orderResponse.json();

      if (orderResult.code === 201) {
        try {
          // Clear the cart after successful order
          const cartResponse = await fetch(
            "http://localhost:3000/api/cart/clear",
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!cartResponse.ok) {
            console.warn(
              "Failed to clear cart, but order was placed successfully"
            );
          } else {
            // Update Redux cart state
            dispatch(setCartItems({ items: [] }));
          }

          // Show success message and redirect
          setOrderSuccess(true);
          setTimeout(() => {
            navigate("/orders");
          }, 2000);
        } catch (cartError) {
          console.warn("Error clearing cart:", cartError);
          // Still show success since order was placed
          setOrderSuccess(true);
          setTimeout(() => {
            navigate("/orders");
          }, 2000);
        }
      } else {
        throw new Error(orderResult.message || "Failed to place order");
      }
    } catch (err) {
      setError(err.message || "An error occurred while placing the order");
      logger.error("Error placing order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // If we're on the Payment Method step and using card payment,
    // validate card details before proceeding
    if (activeStep === 2 && formData.paymentMethod === "card") {
      // Validate card number
      if (
        !formData.cardDetails.cardNumber ||
        formData.cardDetails.cardNumber.length !== 16
      ) {
        setError("Please enter a valid 16-digit card number");
        return;
      }

      // Validate card holder name
      if (!formData.cardDetails.cardHolder) {
        setError("Please enter the card holder name");
        return;
      }

      // Validate expiry date (should be in MM/YY format)
      if (
        !formData.cardDetails.expiryDate ||
        !/^\d{2}\/\d{2}$/.test(formData.cardDetails.expiryDate)
      ) {
        setError("Please enter a valid expiry date in MM/YY format");
        return;
      }

      // Validate CVV (should be 3 digits)
      if (!formData.cardDetails.cvv || formData.cardDetails.cvv.length !== 3) {
        setError("Please enter a valid 3-digit CVV");
        return;
      }

      // Clear any previous errors
      setError(null);
    }

    // If we're on the Shipping Details step, validate shipping information
    if (activeStep === 1) {
      // Validate customer name
      if (!formData.customerName) {
        setError("Please enter your full name");
        return;
      }

      // Validate email
      if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Validate phone
      if (!formData.phone) {
        setError("Please enter your phone number");
        return;
      }

      // Validate address
      if (!formData.address) {
        setError("Please enter your shipping address");
        return;
      }

      // Clear any previous errors
      setError(null);
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (paymentProcessing) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}>
            <CircularProgress size={60} />
            <Typography variant="h5" gutterBottom>
              Processing Payment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we process your payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Do not close this window or refresh the page.
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  if (paymentComplete && !orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}>
            <CheckCircleOutline sx={{ fontSize: 60, color: "success.main" }} />
            <Typography variant="h5" gutterBottom>
              Payment Successful
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your payment has been processed successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your order is now being placed...
            </Typography>
            <CircularProgress size={24} />
          </Box>
        </Card>
      </Container>
    );
  }

  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, textAlign: "center" }}>
          <CheckCircleOutline
            sx={{ fontSize: 60, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Thank you for your purchase. Your order has been placed
            successfully.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You will receive a confirmation email shortly.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/orders")}
            sx={{ mt: 2 }}>
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
                            style={{ width: "100%", height: "auto" }}
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
                <Box component="form">
                  <Typography variant="h6" gutterBottom>
                    Payment Method
                  </Typography>

                  <FormControl
                    component="fieldset"
                    sx={{ mb: 3, width: "100%" }}>
                    <FormLabel component="legend">
                      Select a payment method
                    </FormLabel>
                    <RadioGroup
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }>
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CreditCardIcon sx={{ mr: 1 }} />
                            <Typography>Credit/Debit Card</Typography>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="cod"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <MoneyIcon sx={{ mr: 1 }} />
                            <Typography>Cash on Delivery (COD)</Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  {formData.paymentMethod === "card" && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Card Number"
                          name="cardNumber"
                          value={formData.cardDetails.cardNumber}
                          onChange={(e) => {
                            // Only allow numbers and limit to 16 digits
                            const value = e.target.value
                              .replace(/[^\d]/g, "")
                              .slice(0, 16);
                            setFormData((prev) => ({
                              ...prev,
                              cardDetails: {
                                ...prev.cardDetails,
                                cardNumber: value,
                              },
                            }));
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CreditCardIcon />
                              </InputAdornment>
                            ),
                          }}
                          placeholder="•••• •••• •••• ••••"
                          error={
                            formData.cardDetails.cardNumber &&
                            formData.cardDetails.cardNumber.length < 16
                          }
                          helperText={
                            formData.cardDetails.cardNumber &&
                            formData.cardDetails.cardNumber.length < 16
                              ? "Card number must be 16 digits"
                              : ""
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Card Holder Name"
                          name="cardHolder"
                          value={formData.cardDetails.cardHolder}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cardDetails: {
                                ...prev.cardDetails,
                                cardHolder: e.target.value,
                              },
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Expiry Date"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.cardDetails.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value
                              .replace(/[^\d]/g, "")
                              .slice(0, 4);

                            // Format as MM/YY
                            if (value.length > 2) {
                              value = value.slice(0, 2) + "/" + value.slice(2);
                            }

                            setFormData((prev) => ({
                              ...prev,
                              cardDetails: {
                                ...prev.cardDetails,
                                expiryDate: value,
                              },
                            }));
                          }}
                          error={
                            formData.cardDetails.expiryDate &&
                            formData.cardDetails.expiryDate.length < 5
                          }
                          helperText={
                            formData.cardDetails.expiryDate &&
                            formData.cardDetails.expiryDate.length < 5
                              ? "Format: MM/YY"
                              : ""
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="CVV"
                          name="cvv"
                          value={formData.cardDetails.cvv}
                          onChange={(e) => {
                            // Only allow numbers and limit to 3 digits
                            const value = e.target.value
                              .replace(/[^\d]/g, "")
                              .slice(0, 3);
                            setFormData((prev) => ({
                              ...prev,
                              cardDetails: {
                                ...prev.cardDetails,
                                cvv: value,
                              },
                            }));
                          }}
                          InputProps={{
                            inputProps: { maxLength: 3 },
                          }}
                          error={
                            formData.cardDetails.cvv &&
                            formData.cardDetails.cvv.length < 3
                          }
                          helperText={
                            formData.cardDetails.cvv &&
                            formData.cardDetails.cvv.length < 3
                              ? "CVV must be 3 digits"
                              : ""
                          }
                        />
                      </Grid>
                    </Grid>
                  )}

                  {formData.paymentMethod === "cod" && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      You've selected Cash on Delivery. You'll pay when your
                      order is delivered.
                    </Alert>
                  )}
                </Box>
              )}

              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>

                  {/* Products List */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600 }}>
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
                                  width: "100%",
                                  height: "auto",
                                  objectFit: "contain",
                                }}
                              />
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="subtitle2">
                                {item.productId.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                Quantity: {item.quantity} x $
                                {item.productId.price.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="subtitle2" align="right">
                                $
                                {(item.productId.price * item.quantity).toFixed(
                                  2
                                )}
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
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600 }}>
                      Shipping Details
                    </Typography>
                    <Card sx={{ bgcolor: "grey.50" }}>
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

                  {/* Payment Method */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: 600 }}>
                      Payment Method
                    </Typography>
                    <Card sx={{ bgcolor: "grey.50" }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Payment Type
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ display: "flex", alignItems: "center" }}>
                              {formData.paymentMethod === "card" ? (
                                <>
                                  <CreditCardIcon sx={{ mr: 1 }} />
                                  Credit/Debit Card
                                </>
                              ) : (
                                <>
                                  <MoneyIcon sx={{ mr: 1 }} />
                                  Cash on Delivery
                                </>
                              )}
                            </Typography>
                          </Grid>
                          {formData.paymentMethod === "card" && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  Card Holder
                                </Typography>
                                <Typography variant="body1">
                                  {formData.cardDetails.cardHolder}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  Card Number
                                </Typography>
                                <Typography variant="body1">
                                  •••• •••• ••••{" "}
                                  {formData.cardDetails.cardNumber.slice(-4)}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Order Total */}
                  <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
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
                          <Typography variant="body1">Tax (13%)</Typography>
                          <Typography variant="body1">
                            ${calculateTax().toFixed(2)}
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
                            ${calculateFinalTotal().toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Terms and Conditions */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, mb: 3 }}>
                    By placing this order, you agree to our Terms of Service and
                    Privacy Policy.
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 3,
                }}>
                <Button onClick={handleBack} disabled={activeStep === 0}>
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}>
                    Place Order
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
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
                  <Typography>
                    Subtotal ({cartItems.items.length} items)
                  </Typography>
                  <Typography>${calculateTotalAmount().toFixed(2)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography>Tax (13%)</Typography>
                  <Typography>${calculateTax().toFixed(2)}</Typography>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Total: ${calculateFinalTotal().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
