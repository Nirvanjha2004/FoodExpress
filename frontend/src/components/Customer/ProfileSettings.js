import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  Save,
  Lock
} from '@mui/icons-material';

const ProfileSettings = () => {
  const { currentUser } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [formError, setFormError] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users/me');
        setUserData(response.data);
        
        // Initialize form data
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          street: response.data.address?.street || '',
          city: response.data.address?.city || '',
          state: response.data.address?.state || '',
          zipCode: response.data.address?.zipCode || ''
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load your profile');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }
      };
      
      const response = await api.put('/api/users/me', updateData);
      setUserData(response.data);
      setIsEditing(false);
      
      setAlert({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setAlert({
        open: true,
        message: 'Failed to update profile',
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
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  bgcolor: 'primary.main',
                  mb: 2
                }}
              >
                {userData?.name?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {userData?.name}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {userData?.email}
              </Typography>
              
              <Box sx={{ mt: 2, width: '100%' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  sx={{ mt: 2 }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                Profile Information
              </Typography>
              
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEditToggle}
                  color="primary"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  color="primary"
                  variant="contained"
                >
                  Save
                </Button>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  error={Boolean(formError.name)}
                  helperText={formError.name}
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userData?.email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                  helperText="Email cannot be changed"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                  error={Boolean(formError.phone)}
                  helperText={formError.phone}
                  InputProps={{
                    startAdornment: (
                      <Phone sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <Home sx={{ color: 'action.active', mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
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

export default ProfileSettings;
