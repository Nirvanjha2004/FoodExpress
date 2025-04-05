import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Divider,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  styled
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Send,
  Fastfood
} from '@mui/icons-material';

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  transition: 'color 0.2s',
  display: 'block',
  marginBottom: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  margin: theme.spacing(0, 0.5),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  marginTop: 'auto',
  boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
}));

const FooterBottom = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2, 0),
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  color: theme.palette.primary.main,
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const Footer = () => {
  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <LogoTypography variant="h5" component="div" gutterBottom>
              <Fastfood />
              FoodExpress
            </LogoTypography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connecting restaurants and customers for a seamless food delivery experience. Order your favorite meals with just a few clicks.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <SocialButton aria-label="facebook">
                <Facebook fontSize="small" />
              </SocialButton>
              <SocialButton aria-label="twitter">
                <Twitter fontSize="small" />
              </SocialButton>
              <SocialButton aria-label="instagram">
                <Instagram fontSize="small" />
              </SocialButton>
              <SocialButton aria-label="linkedin">
                <LinkedIn fontSize="small" />
              </SocialButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters sx={{ mb: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText 
                  primary="123 Delivery Street, Foodville, NY 10001" 
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem disableGutters sx={{ mb: 1 }}>
                <Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText 
                  primary="(123) 456-7890" 
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <Email fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText 
                  primary="support@foodexpress.com" 
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Subscribe to Our Newsletter
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Get updates on special offers and news from our restaurants.
            </Typography>
            <Box component="form" sx={{ display: 'flex' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Your email"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  boxShadow: 'none'
                }}
              >
                <Send fontSize="small" />
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} FoodExpress. All rights reserved.
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FooterLink to="/terms">Terms</FooterLink>
              <FooterLink to="/privacy">Privacy</FooterLink>
              <FooterLink to="/cookies">Cookies</FooterLink>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
