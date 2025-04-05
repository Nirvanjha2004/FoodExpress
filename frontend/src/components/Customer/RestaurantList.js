import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants } from '../../firebase/firestore';
import { buildImageUrl } from '../../firebase/images';
import { 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Rating, 
  Box, 
  Chip, 
  TextField, 
  InputAdornment, 
  FormControl, 
  InputLabel,
  Select, 
  MenuItem, 
  Pagination, 
  CircularProgress,
  Stack,
  Skeleton,
  CardActionArea,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
  IconButton,
  Slider,
  styled
} from '@mui/material';
import { 
  Search, 
  Restaurant as RestaurantIcon,
  DeliveryDining,
  LocationOn,
  AccessTime,
  Star,
  FilterList
} from '@mui/icons-material';
import { dummyRestaurants, dummyOffers } from '../../services/dummyData';

// Enhanced styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
  }
}));

const RestaurantBanner = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 250,
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.dark, 0.9)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  [theme.breakpoints.down('sm')]: {
    height: 180,
  }
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
}));

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cuisineOptions, setCuisineOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [currentOffer, setCurrentOffer] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await getRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
        
        // Extract unique cuisines for filters
        const allCuisines = data.flatMap(restaurant => restaurant.cuisine || []);
        const uniqueCuisines = [...new Set(allCuisines)];
        setCuisines(uniqueCuisines);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Cycle through offers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % dummyOffers.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const renderedRestaurants = restaurants.slice((page - 1) * 6, page * 6);

  const renderSkeletons = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <Skeleton variant="rectangular" height={180} animation="wave" />
            <CardContent>
              <Skeleton animation="wave" height={30} width="80%" />
              <Skeleton animation="wave" height={20} width="40%" />
              <Skeleton animation="wave" height={20} width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );

  const renderBanner = () => {
    const currentOfferData = dummyOffers[currentOffer];
    
    return (
      <RestaurantBanner
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${currentOfferData.image})`,
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: {xs: 'center', md: 'flex-start'},
          padding: 4
        }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {currentOfferData.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '1rem', md: '1.25rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {currentOfferData.description}
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              fontWeight: 'bold', 
              px: 4, 
              py: 1,
              borderRadius: 2
            }}
          >
            Order Now
          </Button>
        </Box>
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 0, 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1 
          }}
        >
          {dummyOffers.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: currentOffer === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentOffer(index)}
            />
          ))}
        </Box>
      </RestaurantBanner>
    );
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Banner */}
      {renderBanner()}
      
      {/* Search and Filter */}
      <FilterContainer elevation={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search restaurants or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={10} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Cuisine</InputLabel>
              <Select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                label="Cuisine"
              >
                <MenuItem value="">All Cuisines</MenuItem>
                {cuisineOptions.map((cuisine) => (
                  <MenuItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={10} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="delivery">Fastest Delivery</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={2} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton 
              onClick={toggleFilters} 
              color={showFilters ? 'primary' : 'default'}
              sx={{ border: showFilters ? `1px solid ${theme.palette.primary.main}` : 'none' }}
            >
              <FilterList />
            </IconButton>
          </Grid>
          
          {showFilters && (
            <Grid item xs={12}>
              <Box sx={{ px: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={50}
                    marks={[
                      { value: 0, label: '$0' },
                      { value: 25, label: '$25' },
                      { value: 50, label: '$50+' }
                    ]}
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </FilterContainer>
      
      {/* Category chips */}
      <Box sx={{ mb: 4, display: 'flex', overflowX: 'auto', py: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'nowrap' }}>
          <Chip
            label="All"
            onClick={() => setCuisine('')}
            color={cuisine === '' ? 'primary' : 'default'}
            sx={{ fontWeight: cuisine === '' ? 'bold' : 'normal' }}
          />
          {cuisineOptions.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setCuisine(category)}
              color={cuisine === category ? 'primary' : 'default'}
              sx={{ fontWeight: cuisine === category ? 'bold' : 'normal' }}
            />
          ))}
        </Stack>
      </Box>

      {/* Restaurant list heading */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {cuisine ? `${cuisine} Restaurants` : 'Popular Restaurants Near You'}
      </Typography>

      {/* Restaurant listings */}
      {loading ? (
        <Grid container spacing={3}>
          {renderSkeletons()}
        </Grid>
      ) : restaurants.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>No restaurants found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => { setSearch(''); setCuisine(''); setSort('rating'); }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {renderedRestaurants.map((restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
              <StyledCard>
                <CardActionArea component={Link} to={`/restaurant/${restaurant.id}`}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={restaurant.imageUrl}
                    alt={restaurant.name}
                  />
                  <CardContent>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {restaurant.name}
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Star sx={{ color: '#FFD700', fontSize: 20, mr: 0.5 }} />
                        <Typography variant="body2" fontWeight="bold">
                          {restaurant.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                      {restaurant.cuisine.slice(0, 3).map((item, index) => (
                        <Chip 
                          key={index} 
                          label={item} 
                          size="small" 
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      ))}
                      {restaurant.cuisine.length > 3 && (
                        <Chip 
                          label={`+${restaurant.cuisine.length - 3}`} 
                          size="small"
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    
                    <Divider sx={{ mb: 1.5 }} />
                    
                    <Grid container spacing={1} sx={{ color: 'text.secondary' }}>
                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeliveryDining fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          {restaurant.deliveryTime} min
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" noWrap>
                          {restaurant.address.city}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">
                          ${restaurant.minOrder} min
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ color: alpha(theme.palette.success.main, 0.9) }}>
                          ${restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee} fee`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      )}
    </Container>
  );
};

export default RestaurantList;