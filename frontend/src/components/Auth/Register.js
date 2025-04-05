import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  styled
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Person,
  Phone,
  Google,
  Facebook,
  Twitter,
  RestaurantMenu,
  DeliveryDining
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

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { register, isAuthenticated, error: authError } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('customer');
  
  // Redirect after successful registration
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const { displayName, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate form
    if (!formData.displayName.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Register with Firebase through AuthContext
      await register(formData.email, formData.password, formData.displayName);
      // The redirect will be handled by the useEffect for isAuthenticated
    } catch (err) {
      // Error is already set in the AuthContext
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };
  
  return (
    <Container maxWidth="md">
      <AuthPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Create an Account
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join FoodExpress to order from your favorite restaurants
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="displayName"
                label="Full Name"
                name="displayName"
                value={displayName}
                onChange={handleChange}
                autoComplete="name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={email}
                onChange={handleChange}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={handleChange}
                autoComplete="new-password"
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
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
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
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                <FormLabel component="legend">Register as</FormLabel>
                <RadioGroup
                  aria-label="role"
                  name="role"
                  value={role}
                  onChange={handleRoleChange}
                  row
                >
                  <FormControlLabel value="customer" control={<Radio />} label="Customer" />
                  <FormControlLabel value="restaurant" control={<Radio />} label="Restaurant" />
                  <FormControlLabel value="rider" control={<Radio />} label="Delivery Rider" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                OR REGISTER WITH
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
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 'bold' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </AuthPaper>
    </Container>
  );
};

export default Register;
