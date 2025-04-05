import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import {
  Receipt,
  AccessTime,
  CheckCircle,
  Cancel,
  LocalShipping
} from '@mui/icons-material';

const OrderHistory = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/orders/my-orders');
        setOrders(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError('Failed to load your orders');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const getStatusChip = (status) => {
    switch(status) {
      case 'placed':
        return <Chip label="Placed" color="info" size="small" icon={<Receipt />} />;
      case 'confirmed':
        return <Chip label="Confirmed" color="primary" size="small" icon={<Receipt />} />;
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const displayedOrders = orders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
      <Typography variant="h4" component="h1" gutterBottom>
        Your Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Orders Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't placed any orders yet. Start ordering from our restaurants!
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Browse Restaurants
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Restaurant</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>#{order._id.substring(order._id.length - 6)}</TableCell>
                    <TableCell>{order.restaurant?.name}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      {order.status === 'out-for-delivery' ? (
                        <Button
                          component={Link}
                          to={`/track-order/${order._id}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        >
                          Track
                        </Button>
                      ) : (
                        <Button
                          component={Link}
                          to={`/order-details/${order._id}`}
                          size="small"
                          variant="outlined"
                        >
                          Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderHistory;
