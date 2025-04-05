import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { connectWithAuth } from '../../services/socket';
import {
  Container, Paper, Box, Typography, TextField, InputAdornment, Tabs, Tab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemText, Divider, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Snackbar, CircularProgress, Alert, Chip
} from '@mui/material';
import { Search, Receipt, Info, AccessTime, LocalShipping, CheckCircle, Cancel, Person, Phone, LocationOn } from '@mui/icons-material';

const OrderManagement = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tabValue, setTabValue] = useState('all');
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders/restaurant-orders');
        setOrders(response.data);
        setFilteredOrders(response.data);
        setLoading(false);

        // Also fetch available riders
        const ridersResponse = await api.get('/api/users/riders');
        setRiders(ridersResponse.data);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
      
      // Connect socket with auth token
      const token = localStorage.getItem('token');
      if (token) {
        connectWithAuth(token);
        
        // Listen for new orders
        socket.on('new-order', (data) => {
          // Refresh orders when a new one comes in
          fetchOrders();
        });
      }
    }
    
    return () => {
      socket.off('new-order');
    };
  }, [currentUser]);

  // Apply filters when tab changes or search term changes
  useEffect(() => {
    if (!orders) return;
    
    let result = [...orders];
    
    // Filter by status
    if (tabValue !== 'all') {
      result = result.filter(order => order.status === tabValue);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchLower) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
        (order.customer?.phone && order.customer.phone.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredOrders(result);
  }, [orders, tabValue, search]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenOrderDialog = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setSelectedRider(order.rider || '');
    setOpenOrderDialog(true);
  };

  const handleCloseOrderDialog = () => {
    setOpenOrderDialog(false);
    setSelectedOrder(null);
  };

  const handleOrderStatusChange = (e) => {
    setOrderStatus(e.target.value);
  };

  const handleRiderChange = (e) => {
    setSelectedRider(e.target.value);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !orderStatus) return;
    
    try {
      const data = { status: orderStatus };
      
      // Add rider if status is ready-for-pickup and rider is selected
      if (orderStatus === 'ready-for-pickup' && selectedRider) {
        data.riderId = selectedRider;
      }
      
      await api.patch(`/api/orders/${selectedOrder._id}/status`, data);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order._id === selectedOrder._id) {
          return { 
            ...order, 
            status: orderStatus,
            rider: orderStatus === 'ready-for-pickup' ? selectedRider : order.rider
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      setAlert({
        open: true,
        message: 'Order status updated successfully',
        severity: 'success'
      });
      
      handleCloseOrderDialog();
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    }
  };

  const handleAlertClose = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'placed':
        return <Chip label="Placed" color="info" size="small" icon={<Receipt />} />;
      case 'confirmed':
        return <Chip label="Confirmed" color="primary" size="small" icon={<Info />} />;
      case 'preparing':
        return <Chip label="Preparing" color="warning" size="small" icon={<AccessTime />} />;
      case 'ready-for-pickup':
        return <Chip label="Ready" color="secondary" size="small" icon={<LocalShipping />} />;
      case 'out-for-delivery':
        return <Chip label="Out for delivery" color="warning" size="small" icon={<LocalShipping />} />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" icon={<CheckCircle />} />;
      case 'cancelled':
        return <Chip label="Cancelled" color="error" size="small" icon={<Cancel />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Order Management
          </Typography>
          <TextField
            placeholder="Search orders..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Orders" value="all" />
            <Tab label="New" value="placed" />
            <Tab label="Confirmed" value="confirmed" />
            <Tab label="Preparing" value="preparing" />
            <Tab label="Ready" value="ready-for-pickup" />
            <Tab label="Out for Delivery" value="out-for-delivery" />
            <Tab label="Delivered" value="delivered" />
            <Tab label="Cancelled" value="cancelled" />
          </Tabs>
        </Box>

        {filteredOrders.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            No orders found for the selected filter.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>#{order._id.substring(order._id.length - 6)}</TableCell>
                    <TableCell>{order.customer?.name || 'Customer'}</TableCell>
                    <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenOrderDialog(order)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog
          open={openOrderDialog}
          onClose={handleCloseOrderDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            Order #{selectedOrder._id.substring(selectedOrder._id.length - 6)}
            <Typography variant="subtitle2" color="text.secondary">
              {formatDateTime(selectedOrder.createdAt)}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <List>
                  {selectedOrder.items.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={`${item.quantity}x ${item.menuItem.name}`}
                          secondary={
                            item.specialInstructions && (
                              <Typography variant="body2" color="text.secondary">
                                Note: {item.specialInstructions}
                              </Typography>
                            )
                          }
                        />
                        <Typography variant="body1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </ListItem>
                      {index < selectedOrder.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body1">Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body1">${selectedOrder.subtotal.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">Delivery Fee:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body1">${selectedOrder.deliveryFee.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">Tax:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body1">${selectedOrder.tax.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">Total:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="h6">${selectedOrder.total.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method: {selectedOrder.paymentMethod}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ mb: 3, p: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} /> Customer Information
                    </Typography>
                    <Typography variant="body1">{selectedOrder.customer?.name}</Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {selectedOrder.customer?.phone || 'No phone'}
                    </Typography>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <LocationOn sx={{ mr: 1 }} /> Delivery Address
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.deliveryAddress?.street}
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} {selectedOrder.deliveryAddress?.zipCode}
                    </Typography>
                  </CardContent>
                </Card>

                <Typography variant="h6" gutterBottom>
                  Order Status
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={orderStatus}
                    onChange={handleOrderStatusChange}
                    label="Status"
                    disabled={['delivered', 'cancelled', 'out-for-delivery'].includes(selectedOrder.status)}
                  >
                    <MenuItem value="placed">Placed</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready-for-pickup">Ready for Pickup</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                {orderStatus === 'ready-for-pickup' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Assign Rider</InputLabel>
                    <Select
                      value={selectedRider}
                      onChange={handleRiderChange}
                      label="Assign Rider"
                    >
                      <MenuItem value="">
                        <em>Select a rider</em>
                      </MenuItem>
                      {riders.map((rider) => (
                        <MenuItem key={rider._id} value={rider._id}>
                          {rider.name} - {rider.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Estimated Delivery: {formatDateTime(selectedOrder.estimatedDeliveryTime)}
                  </Typography>
                  {selectedOrder.status === 'delivered' && selectedOrder.actualDeliveryTime && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Actual Delivery: {formatDateTime(selectedOrder.actualDeliveryTime)}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderDialog}>Close</Button>
            <Button 
              onClick={updateOrderStatus}
              variant="contained"
              color="primary"
              disabled={
                selectedOrder.status === orderStatus || 
                ['delivered', 'cancelled', 'out-for-delivery'].includes(selectedOrder.status) ||
                (orderStatus === 'ready-for-pickup' && !selectedRider)
              }
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderManagement;