import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  styled
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Google,
  Facebook,
  Twitter
} from '@mui/icons-material';

const AuthPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  marginBottom: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 16,
  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6),
  },
}));

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 600,
  justifyContent: 'flex-start',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }
}));

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { login, isAuthenticated, error: authError, authLoading, clearError } = useContext(AuthContext);
  
  // Get the return path and message from location state
  const from = location.state?.from || '/';
  const message = location.state?.message || '';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Clear errors when component unmounts or changes
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      // Call login function from AuthContext (which now uses Firebase)
      await login(formData.email, formData.password);
      // The redirect will be handled by the useEffect for isAuthenticated
    } catch (err) {
      console.error("Login error:", err);
      // Only set loading to false on error since AuthContext handles loading state
      setLoading(false);
      
      // If there's no authError set in context, set a local error
      if (!authError) {
        setError('Authentication failed. Please check your credentials and try again.');
      }
    }
  };
  
  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };
  
  return (
    <Container maxWidth="sm">
      <AuthPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Login to your account to order delicious food
        </Typography>
        
        {/* Display redirect message if exists */}
        {message && (
          <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
            {message}
          </Alert>
        )}
        
        {/* Display error if exists */}
        {(error || authError) && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error || authError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Grid container justifyContent="flex-end" sx={{ mt: 1, mb: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
              <Typography variant="body2">Forgot password?</Typography>
            </Link>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || authLoading}
            sx={{ py: 1.5 }}
          >
            {(loading || authLoading) ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                OR LOGIN WITH
              </Typography>
            </Divider>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{ borderColor: '#DB4437', color: '#DB4437' }}
              >
                Google
              </SocialButton>
            </Grid>
            <Grid item xs={12} sm={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<Facebook />}
                sx={{ borderColor: '#4267B2', color: '#4267B2' }}
              >
                Facebook
              </SocialButton>
            </Grid>
            <Grid item xs={12} sm={4}>
              <SocialButton
                fullWidth
                variant="outlined"
                startIcon={<Twitter />}
                sx={{ borderColor: '#1DA1F2', color: '#1DA1F2' }}
              >
                Twitter
              </SocialButton>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 'bold' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </AuthPaper>
    </Container>
  );
};

export default Login;

