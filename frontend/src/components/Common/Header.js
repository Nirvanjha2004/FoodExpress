import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  Divider,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme,
  styled,
  alpha
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Person,
  ExitToApp,
  Receipt,
  Restaurant,
  Dashboard,
  Settings,
  RoomService,
  DirectionsBike,
  Home,
  Fastfood
} from '@mui/icons-material';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  backgroundColor: 'white',
  color: theme.palette.text.primary
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1)
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  fontWeight: 600,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  }
}));

const CartButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  position: 'relative'
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  backgroundColor: theme.palette.primary.main,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

// Hide header on scroll down
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'restaurant':
        return '/restaurant-dashboard';
      case 'rider':
        return '/rider-dashboard';
      default:
        return '/profile';
    }
  };

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Fastfood sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>FoodExpress</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to="/" onClick={toggleMobileMenu}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        {currentUser ? (
          <>
            <ListItem button component={Link} to={getDashboardLink()} onClick={toggleMobileMenu}>
              <ListItemIcon>
                {currentUser.role === 'restaurant' ? <Restaurant /> : 
                 currentUser.role === 'rider' ? <DirectionsBike /> : 
                 <Person />}
              </ListItemIcon>
              <ListItemText primary={
                currentUser.role === 'restaurant' ? 'Restaurant Dashboard' : 
                currentUser.role === 'rider' ? 'Rider Dashboard' : 
                'My Account'
              } />
            </ListItem>

            <ListItem button component={Link} to="/orders" onClick={toggleMobileMenu}>
              <ListItemIcon>
                <Receipt />
              </ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItem>
            
            {currentUser.role === 'restaurant' && (
              <>
                <ListItem button component={Link} to="/menu-manager" onClick={toggleMobileMenu}>
                  <ListItemIcon>
                    <RoomService />
                  </ListItemIcon>
                  <ListItemText primary="Menu Manager" />
                </ListItem>
                <ListItem button component={Link} to="/restaurant-settings" onClick={toggleMobileMenu}>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
              </>
            )}
            
            <Divider />
            
            <ListItem button onClick={() => { handleLogout(); toggleMobileMenu(); }}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={toggleMobileMenu}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={toggleMobileMenu}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <HideOnScroll>
        <StyledAppBar position="sticky">
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
              {isMobile && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleMobileMenu}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <LogoText variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', display: 'flex' }}>
                <Fastfood />
                FoodExpress
              </LogoText>

              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NavButton component={Link} to="/">
                    Restaurants
                  </NavButton>
                  {currentUser && currentUser.role === 'restaurant' && (
                    <>
                      <NavButton component={Link} to="/restaurant-dashboard">
                        Dashboard
                      </NavButton>
                      <NavButton component={Link} to="/menu-manager">
                        Menu
                      </NavButton>
                      <NavButton component={Link} to="/order-management">
                        Orders
                      </NavButton>
                    </>
                  )}
                  {currentUser && currentUser.role === 'rider' && (
                    <NavButton component={Link} to="/rider-dashboard">
                      Deliveries
                    </NavButton>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CartButton
                  component={Link}
                  to="/cart"
                  aria-label="shopping cart"
                >
                  <Badge badgeContent={itemCount} color="primary">
                    <ShoppingCart />
                  </Badge>
                </CartButton>

                {currentUser ? (
                  <>
                    <UserAvatar
                      onClick={handleMenuOpen}
                      sx={{ ml: 2 }}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </UserAvatar>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem
                        component={Link}
                        to={getDashboardLink()}
                        onClick={handleMenuClose}
                      >
                        <ListItemIcon>
                          <Person fontSize="small" />
                        </ListItemIcon>
                        My Account
                      </MenuItem>
                      <MenuItem
                        component={Link}
                        to="/orders"
                        onClick={handleMenuClose}
                      >
                        <ListItemIcon>
                          <Receipt fontSize="small" />
                        </ListItemIcon>
                        My Orders
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <ExitToApp fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      to="/login"
                      sx={{ ml: 2 }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/register"
                      sx={{ ml: 2 }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                )}
              </Box>
            </Toolbar>
          </Container>
        </StyledAppBar>
      </HideOnScroll>
      {renderMobileMenu()}
    </>
  );
};

export default Header;
