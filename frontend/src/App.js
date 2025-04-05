import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import FirebaseInitializer from './components/Firebase/FirebaseInitializer';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Customer Components
import RestaurantList from './components/Customer/RestaurantList';
import RestaurantDetail from './components/Customer/RestaurantDetail';
import ShoppingCart from './components/Customer/ShoppingCart';
import Checkout from './components/Customer/Checkout';
import OrderTracking from './components/Customer/OrderTracking';
import OrderHistory from './components/Customer/OrderHistory';
import ProfileSettings from './components/Customer/ProfileSettings';

// Restaurant Components
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard';
import MenuManager from './components/Restaurant/MenuManager';
import OrderManagement from './components/Restaurant/OrderManagement';
import RestaurantSettings from './components/Restaurant/RestaurantSettings';

// Rider Components
import RiderDashboard from './components/Rider/RiderDashboard';

// Common Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Create a theme for the SaaS application
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B2B', // A vibrant red/orange that's appetizing for food
      light: '#FF7E5F',
      dark: '#D83A0D',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E293B', // Deep blue-gray for contrast
      light: '#334155',
      dark: '#0F172A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 15px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FirebaseInitializer>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Header />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<RestaurantList />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<ShoppingCart />} />
                
                {/* Protected Routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />
                
                <Route path="/track-order/:id" element={<OrderTracking />} />
                
                {/* Restaurant Routes */}
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/menu-manager" element={<MenuManager />} />
                <Route path="/order-management" element={<OrderManagement />} />
                <Route path="/restaurant-settings" element={<RestaurantSettings />} />
                
                {/* Rider Routes */}
                <Route path="/rider-dashboard" element={<RiderDashboard />} />
                
                {/* Redirect if not found */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </Router>
          </CartProvider>
        </AuthProvider>
      </FirebaseInitializer>
    </ThemeProvider>
  );
}

export default App;
