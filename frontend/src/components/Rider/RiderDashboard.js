import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { connectWithAuth } from '../../services/socket';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  DirectionsBike,
  Pending,
  LocationOn,
  RestaurantMenu,
  Home,
  Phone,
  Person,
  CheckCircle,
  AccessTime,
  DoNotDisturb,
  RadioButtonUnchecked,
  RadioButtonChecked
} from '@mui/icons-material';

const RiderDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders assigned to this rider
        const myOrdersResponse = await api.get('/api/orders/rider-orders');
        setMyOrders(myOrdersResponse.data);
        
        // Fetch available orders (orders with status "ready-for-pickup" but no rider assigned)
        const availableOrdersResponse = await api.get('/api/orders/available-for-pickup');
        setAvailableOrders(availableOrdersResponse.data);
        
        // Fetch earnings data
        const earningsResponse = await api.get('/api/riders/earnings');
        setEarnings(earningsResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
      
      // Connect socket with auth token
      const token = localStorage.getItem('token');
      if (token) {
        connectWithAuth(token);
        
        // Listen for new available orders
        socket.on('new-available-order', (data) => {
          fetchData();
        });
      }
    }
    
    return () => {
      socket.off('new-available-order');
    };
  }, [currentUser]);

  const handleStatusChange = async () => {
    try {
      await api.patch('/api/riders/availability', { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Failed to update availability', error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await api.post(`/api/orders/${orderId}/accept`);
      
      // Refresh data after accepting an order
      const myOrdersResponse = await api.get('/api/orders/rider-orders');
      setMyOrders(myOrdersResponse.data);
      
      const availableOrdersResponse = await api.get('/api/orders/available-for-pickup');
      setAvailableOrders(availableOrdersResponse.data);
      
      setOrderDetailsOpen(false);
    } catch (error) {
      console.error('Failed to accept order', error);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      
      // Refresh data after updating status
      const myOrdersResponse = await api.get('/api/orders/rider-orders');
      setMyOrders(myOrdersResponse.data);
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'ready-for-pickup':
        return <Chip label="Ready for pickup" color="secondary" size="small" icon={<Pending />} />;
      case 'out-for-delivery':
        return <Chip label="Out for delivery" color="warning" size="small" icon={<DirectionsBike />} />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" icon={<CheckCircle />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1">
                Rider Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back, {currentUser.name}
              </Typography>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAvailable}
                    onChange={handleStatusChange}
                    color="primary"
                  />
                }
                label={isAvailable ? "Available" : "Unavailable"}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Today's Earnings</Typography>
              <Typography variant="h3">${earnings.today.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Weekly Earnings</Typography>
              <Typography variant="h3">${earnings.week.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Monthly Earnings</Typography>
              <Typography variant="h3">${earnings.month.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Active Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {myOrders.filter(order => order.status !== 'delivered').length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No active orders at the moment.
              </Typography>
            ) : (
              <List>
                {myOrders
                  .filter(order => order.status !== 'delivered')
                  .map((order) => (
                    <Paper key={order._id} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RestaurantMenu sx={{ mr: 1 }} />
                            <Typography variant="subtitle1">
                              {order.restaurant.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Home sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {order.deliveryAddress.street}, {order.deliveryAddress.city}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {order.customer.name}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 1 }}>
                            {getStatusChip(order.status)}
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {order.items.length} items | ${order.total.toFixed(2)}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenOrderDetails(order)}
                            >
                              Details
                            </Button>
                            {order.status === 'ready-for-pickup' && (
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => handleUpdateStatus(order._id, 'out-for-delivery')}
                              >
                                Start Delivery
                              </Button>
                            )}
                            {order.status === 'out-for-delivery' && (
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                onClick={() => handleUpdateStatus(order._id, 'delivered')}
                              >
                                Mark Delivered
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Available Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!isAvailable ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <DoNotDisturb sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1">
                  You're currently set as unavailable.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Switch to available to see new orders.
                </Typography>
              </Box>
            ) : availableOrders.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No orders available for pickup at the moment.
              </Typography>
            ) : (
              <List>
                {availableOrders.map((order) => (
                  <ListItem 
                    key={order._id} 
                    divider 
                    button 
                    onClick={() => handleOpenOrderDetails(order)}
                    sx={{ 
                      borderRadius: 1, 
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <RestaurantMenu />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={order.restaurant.name}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            ${order.total.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" component="span">
                            {' • '}
                            {order.deliveryAddress.city}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {myOrders.filter(order => order.status === 'delivered').length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                No completed deliveries yet.
              </Typography>
            ) : (
              <List>
                {myOrders
                  .filter(order => order.status === 'delivered')
                  .slice(0, 5)
                  .map((order) => (
                    <ListItem key={order._id} divider>
                      <ListItemText
                        primary={`${order.restaurant.name} - ${formatDateTime(order.actualDeliveryTime || order.updatedAt)}`}
                        secondary={`${order.deliveryAddress.street}, ${order.deliveryAddress.city}`}
                      />
                      <Typography>
                        ${order.total.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
              </List>
            )}
            
            {myOrders.filter(order => order.status === 'delivered').length > 5 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button variant="text" component={Link} to="/delivery-history">
                  View All History
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        fullWidth
        maxWidth="md"
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order Details
              <Typography variant="subtitle2" color="text.secondary">
                Order #{selectedOrder._id.substring(selectedOrder._id.length - 6)}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Restaurant
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedOrder.restaurant.name}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                      {selectedOrder.restaurant.address.street}, {selectedOrder.restaurant.address.city}
                    </Typography>
                    {selectedOrder.restaurant.contact?.phone && (
                      <Typography variant="body2" display="flex" alignItems="center">
                        <Phone fontSize="small" sx={{ mr: 0.5 }} />
                        {selectedOrder.restaurant.contact.phone}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Customer
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedOrder.customer.name}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 0.5 }} />
                      {selectedOrder.customer.phone}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                    </Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Timing
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                      Order placed: {formatDateTime(selectedOrder.createdAt)}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                      Estimated delivery: {formatDateTime(selectedOrder.estimatedDeliveryTime)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <List dense>
                    {selectedOrder.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.menuItem.name}`}
                          secondary={item.specialInstructions || ''}
                        />
                        <Typography variant="body1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">Subtotal:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="body2">${selectedOrder.subtotal.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">Delivery Fee:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="body2">${selectedOrder.deliveryFee.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">Tax:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="body2">${selectedOrder.tax.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>${selectedOrder.total.toFixed(2)}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Payment Method: {selectedOrder.paymentMethod}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {getStatusChip(selectedOrder.status)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOrderDetails}>Close</Button>
              {selectedOrder.status === 'ready-for-pickup' && !selectedOrder.rider && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAcceptOrder(selectedOrder._id)}
                >
                  Accept Order
                </Button>
              )}
              {selectedOrder.status === 'ready-for-pickup' && selectedOrder.rider?._id === currentUser.id && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'out-for-delivery')}
                >
                  Start Delivery
                </Button>
              )}
              {selectedOrder.status === 'out-for-delivery' && selectedOrder.rider?._id === currentUser.id && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                >
                  Mark as Delivered
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default RiderDashboard;
