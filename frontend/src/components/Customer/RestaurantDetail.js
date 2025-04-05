import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { getRestaurantById, getMenuItems } from '../../firebase/firestore';
import { buildImageUrl } from '../../firebase/images';
import { 
  dummyRestaurants, 
  generateMenuItems, 
  getRandomFoodImage 
} from '../../services/dummyData';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  Rating,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,  // Added the missing import
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  styled,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccessTime,
  Add,
  ExpandMore,
  Restaurant as RestaurantIcon,
  Favorite,
  FavoriteBorder,
  Info,
  Star,
  DirectionsBike,
  AttachMoney,
  LocalOffer,
  Phone,
  LocationOn
} from '@mui/icons-material';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 280,
  width: '100%',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    height: 220,
  },
  [theme.breakpoints.down('sm')]: {
    height: 180,
  },
}));

const HeroImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const HeroOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(3),
  color: 'white',
}));

const MenuItemCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
  }
}));

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#FFD700',
  },
});

const TagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 500,
}));

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        
        // Get restaurant data from Firestore
        const restaurantData = await getRestaurantById(id);
        setRestaurant(restaurantData);
        
        // Get menu items from Firestore
        const menuItemsData = await getMenuItems(id);
        setMenuItems(menuItemsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(menuItemsData.map(item => item.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load restaurant details');
        setLoading(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [id]);

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    setSnackbar({
      open: true,
      message: `${item.name} added to cart!`,
      severity: 'success'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Skeleton loaders for loading state
  const renderSkeletons = () => (
    <>
      <HeroSection>
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      </HeroSection>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Skeleton animation="wave" height={45} width="60%" />
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Skeleton animation="wave" height={25} width="15%" sx={{ mr: 2 }} />
              <Skeleton animation="wave" height={25} width="25%" />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton animation="wave" height={60} />
              <Skeleton animation="wave" height={30} width="70%" />
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Skeleton animation="wave" height={40} width="30%" />
            <Skeleton animation="wave" height={40} width="100%" sx={{ my: 1 }} />
          </Box>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} key={item}>
                <Card sx={{ display: 'flex', height: '100%' }}>
                  <Box sx={{ width: 120 }}>
                    <Skeleton animation="wave" variant="rectangular" width={120} height="100%" />
                  </Box>
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                      <Skeleton animation="wave" height={30} width="80%" />
                      <Skeleton animation="wave" height={20} width="40%" />
                      <Skeleton animation="wave" height={20} width="60%" />
                    </CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pb: 1 }}>
                      <Skeleton animation="wave" height={30} width={60} />
                      <Box sx={{ ml: 'auto', mr: 1 }}>
                        <Skeleton animation="wave" height={30} width={60} />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Skeleton animation="wave" height={30} width="60%" />
            <Skeleton animation="wave" height={25} width="100%" sx={{ mt: 1, mb: 2 }} />
            <Skeleton animation="wave" height={25} width="100%" />
            <Skeleton animation="wave" height={25} width="80%" />
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Skeleton animation="wave" height={30} width="50%" />
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mt: 2 }}>
                <Skeleton animation="wave" height={20} width="100%" />
                <Skeleton animation="wave" height={20} width="90%" />
                {item < 3 && <Skeleton animation="wave" height={1} sx={{ my: 1.5 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (loading || !restaurant) {
    return (
      <Container sx={{ py: 4 }}>
        {renderSkeletons()}
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Hero Section */}
      <HeroSection>
        <HeroImage src={restaurant.imageUrl} alt={restaurant.name} />
        <HeroOverlay>
          <Box sx={{ maxWidth: '80%' }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              {restaurant.name}
            </Typography>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <StyledRating 
                value={restaurant.rating} 
                precision={0.5} 
                readOnly 
                icon={<Star fontSize="inherit" />}
                emptyIcon={<Star fontSize="inherit" />}
              />
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                {restaurant.rating.toFixed(1)}
                <Typography component="span" variant="body2" color="gray.200" sx={{ ml: 0.5 }}>
                  (120+ ratings)
                </Typography>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {restaurant.cuisine.map((cuisine, index) => (
                <TagChip 
                  key={index} 
                  label={cuisine} 
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                <Typography variant="body2">
                  {restaurant.deliveryTime} min
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsBike fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                <Typography variant="body2">
                  ${restaurant.deliveryFee.toFixed(2)} delivery
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                <Typography variant="body2">
                  ${restaurant.minOrder} min. order
                </Typography>
              </Box>
            </Box>
          </Box>
        </HeroOverlay>
      </HeroSection>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Restaurant description */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              About {restaurant.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {restaurant.description || "Enjoy delicious meals from this amazing restaurant, featuring a variety of cuisines and flavors to satisfy your cravings."}
            </Typography>
            
            {/* Special offers */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1, border: `1px dashed ${theme.palette.primary.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalOffer sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="subtitle1" color="primary" fontWeight="medium">
                  Special Offers
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • 20% off on orders above ${restaurant.minOrder * 2}
              </Typography>
              <Typography variant="body2">
                • Free delivery on orders above ${restaurant.minOrder * 3}
              </Typography>
            </Box>
          </Paper>

          {/* Menu tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: 100,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                },
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3
              }}
            >
              <Tab label="All" value={0} />
              {categories.map((category, index) => (
                <Tab key={category} label={category} value={index + 1} />
              ))}
            </Tabs>
          </Box>

          {/* Menu items */}
          {tabValue === 0 ? (
            categories.map((category, index) => (
              <Box key={category} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    width: 4,
                    height: 24,
                    backgroundColor: theme.palette.primary.main,
                    display: 'inline-block',
                    marginRight: 1.5,
                    borderRadius: 1
                  }
                }}>
                  {category}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {menuItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <Grid item xs={12} sm={6} key={item.id}>
                        <MenuItemCard>
                          {item.imageUrl && (
                            <CardMedia
                              component="img"
                              sx={{ width: 120, objectFit: 'cover' }}
                              image={item.imageUrl}
                              alt={item.name}
                            />
                          )}
                          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                              <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {item.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                {item.isVegetarian && (
                                  <Chip 
                                    label="Veg" 
                                    size="small" 
                                    color="success" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {item.isSpicy && (
                                  <Chip 
                                    label="Spicy" 
                                    size="small" 
                                    color="error" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {item.isPopular && (
                                  <Chip 
                                    label="Popular" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1, justifyContent: 'space-between' }}>
                              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                ${item.price.toFixed(2)}
                              </Typography>
                              <Button 
                                onClick={() => handleAddToCart(item)}
                                variant="contained"
                                size="small"
                                sx={{ 
                                  borderRadius: 2,
                                  px: 2,
                                  py: 0.5,
                                  minWidth: 'auto',
                                  fontWeight: 'bold',
                                  boxShadow: 2
                                }}
                              >
                                Add
                              </Button>
                            </Box>
                          </Box>
                        </MenuItemCard>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            ))
          ) : (
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {menuItems
                  .filter(item => item.category === categories[tabValue - 1])
                  .map(item => (
                    <Grid item xs={12} sm={6} key={item.id}>
                      <MenuItemCard>
                        {item.imageUrl && (
                          <CardMedia
                            component="img"
                            sx={{ width: 120, objectFit: 'cover' }}
                            image={item.imageUrl}
                            alt={item.name}
                          />
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {item.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              {item.isVegetarian && (
                                <Chip 
                                  label="Veg" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              {item.isSpicy && (
                                <Chip 
                                  label="Spicy" 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                              {item.isPopular && (
                                <Chip 
                                  label="Popular" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          </CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1, justifyContent: 'space-between' }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                              ${item.price.toFixed(2)}
                            </Typography>
                            <Button 
                              onClick={() => handleAddToCart(item)}
                              variant="contained"
                              size="small"
                              sx={{ 
                                borderRadius: 2,
                                px: 2,
                                py: 0.5,
                                minWidth: 'auto',
                                fontWeight: 'bold',
                                boxShadow: 2
                              }}
                            >
                              Add
                            </Button>
                          </Box>
                        </Box>
                      </MenuItemCard>
                    </Grid>
                  ))}
              </Grid>
              {menuItems.filter(item => item.category === categories[tabValue - 1]).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No items found in this category.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Restaurant Info Card */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Restaurant Info
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <LocationOn fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Address"
                  secondary={`${restaurant.address.street || '123 Main St'}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}`}
                  primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding sx={{ mb: 2 }}>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <Phone fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={restaurant.contact?.phone || '(555) 123-4567'}
                  primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <AccessTime fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Hours"
                  secondary={
                    <Box component="span" sx={{ display: 'block' }}>
                      Monday - Friday: 11:00 AM - 10:00 PM<br />
                      Saturday - Sunday: 10:00 AM - 11:00 PM
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Reviews Card */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Reviews
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Overall Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ mr: 1 }}>
                    {restaurant.rating.toFixed(1)}
                  </Typography>
                  <StyledRating 
                    value={restaurant.rating} 
                    precision={0.5} 
                    readOnly 
                    size="small"
                    icon={<Star fontSize="inherit" />}
                    emptyIcon={<Star fontSize="inherit" />}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Based on 120+ ratings
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            {/* Sample Reviews */}
            {[
              { name: "Michael Smith", rating: 5, date: "2 days ago", comment: "Amazing food, fast delivery and great service. Will definitely order again!" },
              { name: "Sarah Johnson", rating: 4, date: "1 week ago", comment: "Food was delicious, but delivery took a bit longer than expected." },
              { name: "David Lee", rating: 5, date: "2 weeks ago", comment: "Excellent! The pasta was cooked to perfection and everything was still hot on arrival." }
            ].map((review, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {review.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StyledRating 
                      value={review.rating} 
                      readOnly 
                      size="small"
                      icon={<Star fontSize="inherit" />}
                      emptyIcon={<Star fontSize="inherit" />}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {review.date}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {review.comment}
                </Typography>
                {index < 2 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
            
            <Button 
              variant="text" 
              fullWidth 
              sx={{ mt: 1 }}
            >
              See all reviews
            </Button>
          </Paper>
        </Grid>
      </Grid>
        
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RestaurantDetail;