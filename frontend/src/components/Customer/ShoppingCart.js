import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import {
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Button, 
  IconButton, 
  Grid,
  Card, 
  CardMedia,
  CardContent,
  TextField,
  Alert,
  Collapse,
  styled,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack,
  Store,
  LocalOffer
} from '@mui/icons-material';

const ShoppingCart = () => {
  const { cart, restaurantGroups, subtotal, updateQuantity, removeFromCart, clearRestaurantItems, loading } = useContext(CartContext);
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  // Show loading indicator while cart is being fetched
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your cart...</Typography>
      </Container>
    );
  }

  // Check if cart is empty
  if (cart.length === 0 || !cart) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add items to your cart from our restaurants
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
            startIcon={<ArrowBack />}
          >
            Browse Restaurants
          </Button>
        </Paper>
      </Container>
    );
  }

  // Safety check for restaurantGroups
  const groupsToRender = restaurantGroups || {};
  const groupKeys = Object.keys(groupsToRender);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>Your Cart</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Restaurant groups */}
          {groupKeys.length > 0 ? (
            groupKeys.map(restaurantId => {
              const group = groupsToRender[restaurantId] || {};
              const restaurant = group.restaurant || {};
              const items = group.items || [];
              
              return (
                <Box key={restaurantId} sx={{ mb: 4 }}>
                  {/* Restaurant header */}
                  <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Store color="primary" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="h6">{restaurant.name || 'Unknown Restaurant'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Delivery fee: ${(restaurant.deliveryFee || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button 
                        variant="outlined" 
                        component={Link} 
                        to={`/restaurant/${restaurantId}`}
                        sx={{ mr: 1 }}
                      >
                        Add More
                      </Button>
                      <IconButton 
                        color="error" 
                        onClick={() => clearRestaurantItems(restaurantId)} 
                        title="Remove all items from this restaurant"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Paper>

                  {/* Restaurant items */}
                  <Paper sx={{ overflow: 'hidden' }}>
                    {items.map((item, index) => (
                      <React.Fragment key={`${item._id || 'item'}-${index}`}>
                        {index > 0 && <Divider />}
                        <Box sx={{ p: 2, display: 'flex' }}>
                          {/* Item image */}
                          {item.imageUrl && (
                            <Box sx={{ flexShrink: 0, width: 80, height: 80, mr: 2 }}>
                              <img 
                                src={item.imageUrl} 
                                alt={item.name || 'Food item'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                              />
                            </Box>
                          )}
                          
                          {/* Item details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                              {item.name || 'Unnamed Item'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {item.description?.substring(0, 80) || 'No description'}
                              {item.description?.length > 80 ? '...' : ''}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" color="primary.main">
                                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => updateQuantity(item._id, item.restaurantId, (item.quantity || 1) - 1)}
                                >
                                  <Remove fontSize="small" />
                                </IconButton>
                                <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
                                  {item.quantity || 1}
                                </Typography>
                                <IconButton 
                                  size="small"
                                  onClick={() => updateQuantity(item._id, item.restaurantId, (item.quantity || 1) + 1)}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  color="error" 
                                  size="small" 
                                  onClick={() => removeFromCart(item._id, item.restaurantId)}
                                  sx={{ ml: 1 }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </React.Fragment>
                    ))}
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No items in your cart</Typography>
            </Paper>
          )}
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Order Summary</Typography>
            
            {/* Display multiple restaurants warning */}
            {groupKeys.length > 1 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have items from multiple restaurants. Each restaurant will be checked out separately.
              </Alert>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                Items from {groupKeys.length} restaurant(s)
              </Typography>
              {groupKeys.map(restaurantId => {
                const group = groupsToRender[restaurantId] || {};
                const restaurant = group.restaurant || {};
                const items = group.items || [];
                
                return (
                  <Box key={restaurantId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {restaurant.name || 'Unknown Restaurant'} ({items.reduce((t, i) => t + (i.quantity || 1), 0)} items)
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${items.reduce((t, i) => t + ((i.price || 0) * (i.quantity || 1)), 0).toFixed(2)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography fontWeight="medium">${subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Delivery Fee</Typography>
              <Typography fontWeight="medium">
                ${Object.values(groupsToRender).reduce((t, r) => t + ((r.restaurant?.deliveryFee || 0)), 0).toFixed(2)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold">
                ${(subtotal + Object.values(groupsToRender).reduce((t, r) => t + ((r.restaurant?.deliveryFee || 0)), 0)).toFixed(2)}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ShoppingCart;
