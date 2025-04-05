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
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Stack
} from '@mui/material';
import {
  RestaurantMenu,
  ShoppingCart,
  People,
  StarRate,
  MonetizationOn,
  TrendingUp,
  ArrowForward,
  AccessTime,
  Notifications
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RestaurantDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgRating: 0,
    pendingOrders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Fetch restaurant information
        const myRestaurantResponse = await api.get('/api/restaurants', {
          params: { owner: currentUser.id }
        });
        
        if (myRestaurantResponse.data.restaurants.length > 0) {
          const myRestaurant = myRestaurantResponse.data.restaurants[0];
          setRestaurant(myRestaurant);
          
          // Fetch recent orders
          const ordersResponse = await api.get('/api/orders/restaurant-orders', {
            params: { limit: 5 }
          });
          setRecentOrders(ordersResponse.data.slice(0, 5));
          
          // Calculate stats
          const pendingOrders = ordersResponse.data.filter(
            order => ['placed', 'confirmed', 'preparing', 'ready-for-pickup'].includes(order.status)
          ).length;
          
          const totalRevenue = ordersResponse.data.reduce((sum, order) => {
            if (order.status !== 'cancelled') return sum + order.total;
            return sum;
          }, 0);
          
          setStats({
            totalOrders: ordersResponse.data.length,
            totalRevenue,
            avgRating: myRestaurant.rating,
            pendingOrders
          });
          
          // Generate sample sales data
          const last7Days = generateLast7DaysData(ordersResponse.data);
          setSalesData(last7Days);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load restaurant data');
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchRestaurantData();
      
      // Connect socket with auth token
      const token = localStorage.getItem('token');
      if (token) {
        connectWithAuth(token);
        
        // Listen for new orders
        socket.on('new-order', (data) => {
          const notification = {
            id: Date.now(),
            title: 'New Order',
            message: `New order #${data.orderId} from ${data.customerName}`,
            time: new Date(),
            read: false
          };
          setNotifications(prev => [notification, ...prev]);
          
          // Refresh orders
          fetchRestaurantData();
        });
      }
    }
    
    return () => {
      socket.off('new-order');
    };
  }, [currentUser]);

  // Function to generate sample sales data for the last 7 days
  const generateLast7DaysData = (orders) => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => {
        if (order.status !== 'cancelled') return sum + order.total;
        return sum;
      }, 0);
      
      days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: parseFloat(dayRevenue.toFixed(2)),
        orders: dayOrders.length
      });
    }
    
    return days;
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
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Welcome to the Restaurant Dashboard</Typography>
          <Typography variant="body1" paragraph>
            It looks like you haven't set up your restaurant yet.
          </Typography>
          <Button 
            component={Link} 
            to="/create-restaurant" 
            variant="contained" 
            color="primary"
            startIcon={<RestaurantMenu />}
          >
            Create Your Restaurant
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Header with restaurant info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                {restaurant.name} Dashboard
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={restaurant.isActive ? 'Active' : 'Inactive'} 
                  color={restaurant.isActive ? 'success' : 'error'} 
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {restaurant.address.city}, {restaurant.address.state}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Button 
                component={Link} 
                to={`/restaurant/${restaurant._id}`} 
                variant="outlined" 
                size="small"
                endIcon={<ArrowForward />}
              >
                View Public Page
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Key metrics */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Total Orders</Typography>
                <Typography variant="h4">{stats.totalOrders}</Typography>
              </Box>
              <ShoppingCart fontSize="large" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Revenue</Typography>
                <Typography variant="h4">${stats.totalRevenue.toFixed(2)}</Typography>
              </Box>
              <MonetizationOn fontSize="large" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Rating</Typography>
                <Typography variant="h4">{stats.avgRating.toFixed(1)}</Typography>
              </Box>
              <StarRate fontSize="large" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Pending Orders</Typography>
                <Typography variant="h4">{stats.pendingOrders}</Typography>
              </Box>
              <AccessTime fontSize="large" />
            </Box>
          </Paper>
        </Grid>

        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            {notifications.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.map((notification) => (
                  <ListItem 
                    key={notification.id} 
                    divider 
                    sx={{ 
                      backgroundColor: notification.read ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
                      py: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Notifications />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={notification.title} 
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {notification.message}
                          </Typography>
                          {new Date(notification.time).toLocaleTimeString()}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button 
                component={Link} 
                to="/order-management" 
                endIcon={<ArrowForward />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentOrders.length > 0 ? (
              <List>
                {recentOrders.map((order) => (
                  <ListItem 
                    key={order._id}
                    divider 
                    sx={{ py: 1, px: 0 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={1}>
                        <Typography variant="body2" color="text.secondary">
                          #{order._id.substr(-6)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">
                          {order.customer?.name || 'Customer'}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">
                          {order.items.length} items, ${order.total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Chip 
                          label={order.status} 
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            'primary'
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={2} textAlign="right">
                        <Button
                          component={Link}
                          to={`/order-management/${order._id}`}
                          size="small"
                        >
                          Details
                        </Button>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent orders
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
            <Button 
              component={Link} 
              to="/menu-manager" 
              variant="contained" 
              startIcon={<RestaurantMenu />}
              fullWidth
            >
              Manage Menu
            </Button>
            <Button 
              component={Link} 
              to="/order-management" 
              variant="contained" 
              startIcon={<ShoppingCart />}
              fullWidth
            >
              Manage Orders
            </Button>
            <Button 
              component={Link} 
              to="/restaurant-settings" 
              variant="contained"
              fullWidth
            >
              Restaurant Settings
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RestaurantDashboard;
