import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext'; // Add AuthContext import
import { createOrder } from '../../firebase/firestore';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ShoppingBag,
  ArrowBack,
  LocalShipping,
  Payment,
  CheckCircleOutline
} from '@mui/icons-material';

const steps = ['Delivery Address', 'Payment Method', 'Review Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [], restaurantGroups = {}, subtotal = 0, clearCart } = useContext(CartContext);
  const { isAuthenticated, currentUser, userData } = useContext(AuthContext); // Get authentication status
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'creditCard',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please log in to proceed with checkout' 
        } 
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Check if cart is empty and redirect if so
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (userData) {
      setFormData(prevFormData => ({
        ...prevFormData,
        fullName: userData.displayName || '',
        phone: userData.phone || '',
        address: userData.address?.street || '',
        city: userData.address?.city || '',
        zipCode: userData.address?.zipCode || '',
      }));
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (activeStep === 0) {
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
    } 
    else if (activeStep === 1 && formData.paymentMethod === 'creditCard') {
      if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required';
      if (!formData.cardExpiry.trim()) errors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCVC.trim()) errors.cardCVC = 'CVC is required';
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // If we're on the last step, place the order
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Prepare order data for Firebase
      const orderData = {
        userId: currentUser.uid,
        userDetails: {
          name: formData.fullName,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.zipCode}`
        },
        restaurants: Object.entries(restaurantGroups).map(([restaurantId, group]) => ({
          restaurantId,
          restaurantName: group.restaurant.name,
          items: group.items.map(item => ({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: group.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          deliveryFee: group.restaurant.deliveryFee || 0
        })),
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod === 'creditCard' ? {
          cardNumberLast4: formData.cardNumber.slice(-4)
        } : {},
        status: 'placed',
        totalAmount: orderTotal,
      };
      
      // Create order in Firebase
      const order = await createOrder(orderData);
      
      // Clear cart and show success
      clearCart();
      setOrderSuccess(true);
      
      // Redirect to success page after delay
      setTimeout(() => {
        navigate(`/order-success/${order.id}`);
      }, 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setFormErrors({
        submit: 'Failed to place your order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Redirecting to login...</Typography>
      </Container>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Redirecting to cart...</Typography>
      </Container>
    );
  }

  // Calculate delivery fee and total
  const deliveryFee = Object.values(restaurantGroups || {})
    .reduce((total, group) => total + ((group?.restaurant?.deliveryFee || 0)), 0);
  const orderTotal = subtotal + deliveryFee;

  const renderDeliveryAddressForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Delivery Address</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            error={!!formErrors.fullName}
            helperText={formErrors.fullName}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            error={!!formErrors.city}
            helperText={formErrors.city}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            error={!!formErrors.zipCode}
            helperText={formErrors.zipCode}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderPaymentMethodForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Payment Method</Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <RadioGroup
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
        >
          <Paper sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
            <FormControlLabel 
              value="creditCard" 
              control={<Radio />} 
              label="Credit / Debit Card" 
            />
          </Paper>
          
          <Paper sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
            <FormControlLabel 
              value="cash" 
              control={<Radio />} 
              label="Cash on Delivery" 
            />
          </Paper>
        </RadioGroup>
      </FormControl>
      
      {formData.paymentMethod === 'creditCard' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Card Number"
              name="cardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              value={formData.cardNumber}
              onChange={handleInputChange}
              error={!!formErrors.cardNumber}
              helperText={formErrors.cardNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Expiry Date"
              name="cardExpiry"
              placeholder="MM/YY"
              value={formData.cardExpiry}
              onChange={handleInputChange}
              error={!!formErrors.cardExpiry}
              helperText={formErrors.cardExpiry}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="CVC"
              name="cardCVC"
              placeholder="123"
              value={formData.cardCVC}
              onChange={handleInputChange}
              error={!!formErrors.cardCVC}
              helperText={formErrors.cardCVC}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const renderOrderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Order Review</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">Delivery Address</Typography>
        <Typography variant="body2">
          {formData.fullName}<br />
          {formData.address}<br />
          {formData.city}, {formData.zipCode}<br />
          Phone: {formData.phone}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">Payment Method</Typography>
        <Typography variant="body2">
          {formData.paymentMethod === 'creditCard' 
            ? `Credit Card (ending in ${formData.cardNumber.slice(-4)})` 
            : 'Cash on Delivery'}
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">Order Items</Typography>
        
        {Object.keys(restaurantGroups || {}).map(restaurantId => {
          const group = restaurantGroups[restaurantId] || {};
          const restaurant = group.restaurant || {};
          const items = group.items || [];
          
          return (
            <Paper key={restaurantId} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {restaurant.name || 'Unknown Restaurant'}
              </Typography>
              
              {items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                  <Typography variant="body2">
                    {item.quantity || 1} x {item.name || 'Item'}
                  </Typography>
                  <Typography variant="body2">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          );
        })}
      </Box>
      
      {formErrors.submit && (
        <Alert severity="error" sx={{ mt: 2 }}>{formErrors.submit}</Alert>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Forms */}
            {activeStep === 0 && renderDeliveryAddressForm()}
            {activeStep === 1 && renderPaymentMethodForm()}
            {activeStep === 2 && renderOrderReview()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep > 0 ? (
                <Button 
                  onClick={handleBack}
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  disabled={loading}
                >
                  Back
                </Button>
              ) : (
                <Button 
                  component={Link} 
                  to="/cart" 
                  variant="outlined"
                  startIcon={<ArrowBack />}
                >
                  Back to Cart
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                variant="contained" 
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Place Order'
                ) : (
                  'Continue'
                )}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Order Summary
              </Typography>
              
              {Object.keys(restaurantGroups || {}).length > 0 ? (
                <>
                  {Object.keys(restaurantGroups).map(restaurantId => {
                    const group = restaurantGroups[restaurantId] || {};
                    const restaurant = group.restaurant || {};
                    const items = group.items || [];
                    
                    return (
                      <Box key={restaurantId} sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {restaurant.name || 'Unknown Restaurant'}
                        </Typography>
                        
                        {items.slice(0, 3).map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', my: 0.5 }}>
                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                              {item.quantity || 1} x {item.name || 'Item'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                              ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                        
                        {items.length > 3 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            + {items.length - 3} more items
                          </Typography>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    );
                  })}
                  
                  {/* Summary calculations */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Items Subtotal</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Delivery Fee</Typography>
                    <Typography>${deliveryFee.toFixed(2)}</Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
                    <Typography variant="h6" fontWeight="bold">Total</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ${orderTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>Your cart is empty</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Success notification */}
      <Snackbar
        open={orderSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Order placed successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout;
