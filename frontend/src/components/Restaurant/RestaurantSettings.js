import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
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
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import {
  Save,
  ExpandMore,
  RestaurantMenu,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Image
} from '@mui/icons-material';

const RestaurantSettings = () => {
  const { currentUser } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Days of the week for hours
  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // First find the restaurant owned by current user
        const myRestaurantsResponse = await api.get('/api/restaurants', {
          params: { owner: currentUser.id }
        });
        
        if (myRestaurantsResponse.data.restaurants.length > 0) {
          const myRestaurant = myRestaurantsResponse.data.restaurants[0];
          setRestaurant(myRestaurant);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load restaurant data');
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchRestaurantData();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRestaurant({
      ...restaurant,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is edited
    if (formError[name]) {
      setFormError({
        ...formError,
        [name]: ''
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setRestaurant({
      ...restaurant,
      address: {
        ...restaurant.address,
        [name]: value
      }
    });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setRestaurant({
      ...restaurant,
      contact: {
        ...restaurant.contact,
        [name]: value
      }
    });
  };

  const handleHoursChange = (day, type, value) => {
    setRestaurant({
      ...restaurant,
      operatingHours: {
        ...restaurant.operatingHours,
        [day]: {
          ...restaurant.operatingHours?.[day],
          [type]: value
        }
      }
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!restaurant.name?.trim()) errors.name = 'Restaurant name is required';
    if (!restaurant.description?.trim()) errors.description = 'Description is required';
    if (!restaurant.address?.street?.trim()) errors.street = 'Street address is required';
    if (!restaurant.address?.city?.trim()) errors.city = 'City is required';
    if (!restaurant.contact?.phone?.trim()) errors.phone = 'Phone number is required';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const response = await api.put(`/api/restaurants/${restaurant._id}`, restaurant);
      setRestaurant(response.data);
      
      setAlert({
        open: true,
        message: 'Restaurant settings updated successfully',
        severity: 'success'
      });
      
      setSaving(false);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to update restaurant settings',
        severity: 'error'
      });
      setSaving(false);
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

  if (!restaurant) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Restaurant Settings</Typography>
          <Typography variant="body1" paragraph>
            You need to create a restaurant before accessing settings.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            component={Link}
            to="/create-restaurant"
          >
            Create Restaurant
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Restaurant Settings
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Restaurant Name"
              name="name"
              value={restaurant.name || ''}
              onChange={handleInputChange}
              required
              error={Boolean(formError.name)}
              helperText={formError.name}
              InputProps={{
                startAdornment: (
                  <RestaurantMenu sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Image URL"
              name="imageUrl"
              value={restaurant.imageUrl || ''}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <Image sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={restaurant.description || ''}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
              error={Boolean(formError.description)}
              helperText={formError.description}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Cuisine Types
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {restaurant.cuisine?.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => {
                    const newCuisine = restaurant.cuisine.filter((_, i) => i !== index);
                    setRestaurant({ ...restaurant, cuisine: newCuisine });
                  }}
                />
              ))}
              <TextField
                label="Add cuisine"
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newCuisine = [...(restaurant.cuisine || []), e.target.value.trim()];
                    setRestaurant({ ...restaurant, cuisine: newCuisine });
                    e.target.value = '';
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={restaurant.address?.street || ''}
              onChange={handleAddressChange}
              required
              error={Boolean(formError.street)}
              helperText={formError.street}
              InputProps={{
                startAdornment: (
                  <LocationOn sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={restaurant.address?.city || ''}
              onChange={handleAddressChange}
              required
              error={Boolean(formError.city)}
              helperText={formError.city}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={restaurant.address?.state || ''}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Zip Code"
              name="zipCode"
              value={restaurant.address?.zipCode || ''}
              onChange={handleAddressChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={restaurant.contact?.phone || ''}
              onChange={handleContactChange}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={restaurant.contact?.email || ''}
              onChange={handleContactChange}
              InputProps={{
                startAdornment: (
                  <Email sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                Operating Hours
              </Typography>
              <AccessTime sx={{ mr: 1 }} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            {daysOfWeek.map((day) => (
              <Accordion key={day}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ textTransform: 'capitalize' }}>
                    {day}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Opening Time"
                        type="time"
                        value={restaurant.operatingHours?.[day]?.open || '09:00'}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Closing Time"
                        type="time"
                        value={restaurant.operatingHours?.[day]?.close || '22:00'}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Restaurant Status
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={restaurant.isActive || false}
                    onChange={(e) => setRestaurant({ ...restaurant, isActive: e.target.checked })}
                    name="isActive"
                    color="primary"
                  />
                }
                label={restaurant.isActive ? "Active" : "Inactive"}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              When inactive, your restaurant will not appear in search results and customers cannot place orders.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
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

export default RestaurantSettings;
