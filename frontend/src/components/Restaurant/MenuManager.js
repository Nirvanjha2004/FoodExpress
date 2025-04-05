import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  RestaurantMenu,
  Category as CategoryIcon,
  AttachMoney,
  Description,
  Image
} from '@mui/icons-material';

const MenuManager = () => {
  const { currentUser } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Menu item dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    isVegetarian: false,
    isSpicy: false,
    isAvailable: true,
    allergens: '',
    preparationTime: 15
  });
  const [formError, setFormError] = useState({});
  
  // Category dialog
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Alert
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // First find the restaurant owned by current user
        const myRestaurantsResponse = await api.get('/api/restaurants', {
          params: { owner: currentUser.id }
        });
        
        if (myRestaurantsResponse.data.restaurants.length > 0) {
          const myRestaurant = myRestaurantsResponse.data.restaurants[0];
          setRestaurant(myRestaurant);
          
          // Then fetch the menu items for this restaurant
          const restaurantDetailsResponse = await api.get(`/api/restaurants/${myRestaurant._id}`);
          const items = restaurantDetailsResponse.data.menuItems || [];
          setMenuItems(items);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(items.map(item => item.category))];
          setCategories(uniqueCategories);
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

  const handleDialogOpen = (mode, item = null) => {
    if (mode === 'edit' && item) {
      setCurrentItem({
        ...item,
        allergens: item.allergens ? item.allergens.join(', ') : ''
      });
    } else {
      // Reset form for new item
      setCurrentItem({
        name: '',
        description: '',
        price: '',
        category: categories.length > 0 ? categories[0] : '',
        imageUrl: '',
        isVegetarian: false,
        isSpicy: false,
        isAvailable: true,
        allergens: '',
        preparationTime: 15
      });
    }
    setDialogMode(mode);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormError({});
  };

  const handleCategoryDialogOpen = () => {
    setOpenCategoryDialog(true);
  };

  const handleCategoryDialogClose = () => {
    setOpenCategoryDialog(false);
    setNewCategory('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentItem({
      ...currentItem,
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

  const validateForm = () => {
    const errors = {};
    if (!currentItem.name.trim()) errors.name = 'Name is required';
    if (!currentItem.price) errors.price = 'Price is required';
    else if (isNaN(currentItem.price) || currentItem.price <= 0) 
      errors.price = 'Price must be a positive number';
    if (!currentItem.category) errors.category = 'Category is required';
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = async () => {
    if (!validateForm()) return;
    
    try {
      const itemData = {
        ...currentItem,
        price: parseFloat(currentItem.price),
        allergens: currentItem.allergens ? currentItem.allergens.split(',').map(a => a.trim()) : [],
        preparationTime: parseInt(currentItem.preparationTime)
      };
      
      let response;
      
      if (dialogMode === 'add') {
        response = await api.post(`/api/restaurants/${restaurant._id}/menu`, itemData);
        setMenuItems([...menuItems, response.data]);
        
        // Add category if it's new
        if (!categories.includes(response.data.category)) {
          setCategories([...categories, response.data.category]);
        }
        
        setAlert({
          open: true,
          message: 'Menu item added successfully',
          severity: 'success'
        });
      } else {
        response = await api.put(`/api/menu-items/${currentItem._id}`, itemData);
        setMenuItems(menuItems.map(item => 
          item._id === response.data._id ? response.data : item
        ));
        
        setAlert({
          open: true,
          message: 'Menu item updated successfully',
          severity: 'success'
        });
      }
      
      handleDialogClose();
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error saving menu item',
        severity: 'error'
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/api/menu-items/${itemId}`);
        setMenuItems(menuItems.filter(item => item._id !== itemId));
        
        setAlert({
          open: true,
          message: 'Menu item deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        setAlert({
          open: true,
          message: 'Error deleting menu item',
          severity: 'error'
        });
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
    
    handleCategoryDialogClose();
    
    // Set as selected category
    setSelectedCategory(newCategory);
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
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
          <Typography variant="h5" gutterBottom>Menu Manager</Typography>
          <Typography variant="body1" paragraph>
            You need to set up your restaurant first before managing the menu.
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

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Menu Manager
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleDialogOpen('add')}
          >
            Add Menu Item
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
            <Tabs 
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="menu categories"
              sx={{ flexGrow: 1 }}
            >
              <Tab label="All Items" value="all" />
              {categories.map((category) => (
                <Tab key={category} label={category} value={category} />
              ))}
            </Tabs>
            <Button 
              onClick={handleCategoryDialogOpen}
              startIcon={<Add />}
              sx={{ ml: 2 }}
            >
              Category
            </Button>
          </Box>
        </Box>
        
        {filteredMenuItems.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            No menu items in this category. Add your first item to get started.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredMenuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: item.isAvailable ? 1 : 0.7
                  }}
                >
                  {item.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.imageUrl}
                      alt={item.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {item.isVegetarian && (
                        <Chip 
                          label="Vegetarian" 
                          size="small" 
                          color="success" 
                        />
                      )}
                      {item.isSpicy && (
                        <Chip 
                          label="Spicy" 
                          size="small" 
                          color="error" 
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<Edit />}
                      onClick={() => handleDialogOpen('edit', item)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Delete />}
                      onClick={() => handleDeleteItem(item._id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Add/Edit Menu Item Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add Menu Item' : 'Edit Menu Item'}
          <IconButton 
            aria-label="close"
            onClick={handleDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Item Name"
                fullWidth
                value={currentItem.name}
                onChange={handleInputChange}
                required
                error={Boolean(formError.name)}
                helperText={formError.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RestaurantMenu />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={currentItem.description}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                value={currentItem.price}
                onChange={handleInputChange}
                required
                error={Boolean(formError.price)}
                helperText={formError.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={Boolean(formError.category)}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={currentItem.category}
                  onChange={handleInputChange}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon />
                    </InputAdornment>
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="imageUrl"
                label="Image URL"
                fullWidth
                value={currentItem.imageUrl}
                onChange={handleInputChange}
                helperText="Leave empty for no image"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="preparationTime"
                label="Preparation Time (minutes)"
                type="number"
                fullWidth
                value={currentItem.preparationTime}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="allergens"
                label="Allergens (comma separated)"
                fullWidth
                value={currentItem.allergens}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isVegetarian"
                      checked={currentItem.isVegetarian}
                      onChange={handleInputChange}
                    />
                  }
                  label="Vegetarian"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isSpicy"
                      checked={currentItem.isSpicy}
                      onChange={handleInputChange}
                    />
                  }
                  label="Spicy"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isAvailable"
                      checked={currentItem.isAvailable}
                      onChange={handleInputChange}
                    />
                  }
                  label="Available"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveItem}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCategoryDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCategoryDialogClose}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

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

export default MenuManager;
