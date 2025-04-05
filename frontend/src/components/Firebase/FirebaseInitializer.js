import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getRestaurantImageUrl, getFoodItemImageUrl } from '../../firebase/images';

// Sample data to seed the database if empty
const sampleRestaurants = [
  {
    name: 'Pizza Paradise',
    cuisine: ['Italian', 'Pizza'],
    rating: 4.7,
    deliveryTime: 30,
    deliveryFee: 2.99,
    minOrder: 10,
    imageUrl: getRestaurantImageUrl(),
    description: 'The best pizza in town, made with fresh ingredients and traditional recipes.',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    },
    contact: {
      phone: '(123) 456-7890',
      email: 'info@pizzaparadise.com'
    }
  },
  // Add more sample restaurants...
];

const FirebaseInitializer = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if we have restaurants data
        try {
          const restaurantsQuery = query(collection(db, 'restaurants'), limit(1));
          const restaurantsSnapshot = await getDocs(restaurantsQuery);
          
          // If no restaurants exist, seed the database with sample data
          if (restaurantsSnapshot.empty) {
            await seedDatabase();
          }
        } catch (firestoreError) {
          console.error('Firestore permission error:', firestoreError);
          setError(`Firebase permissions error: ${firestoreError.message}. Please update your Firestore security rules.`);
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    initializeFirebase();
  }, []);

  const seedDatabase = async () => {
    try {
      // Add sample restaurants
      for (const restaurant of sampleRestaurants) {
        const restaurantRef = await addDoc(collection(db, 'restaurants'), restaurant);
        
        // Add menu items for each restaurant
        await seedMenuItems(restaurantRef.id, restaurant.cuisine);
      }
      
      console.log('Database seeded successfully');
    } catch (err) {
      console.error('Error seeding database:', err);
      throw err;
    }
  };

  const seedMenuItems = async (restaurantId, cuisines) => {
    // Generate menu items based on cuisine
    const menuItems = generateMenuItemsForCuisine(restaurantId, cuisines);
    
    // Add menu items to database
    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), item);
    }
  };

  const generateMenuItemsForCuisine = (restaurantId, cuisines) => {
    const items = [];
    const mainCuisine = cuisines[0].toLowerCase();
    
    // Generate different menu items based on cuisine
    if (mainCuisine === 'italian' || mainCuisine === 'pizza') {
      items.push(
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 9.99,
          category: 'Pizza',
          imageUrl: getFoodItemImageUrl('pizza'),
          isVegetarian: true,
          isPopular: true,
          restaurantId
        },
        {
          name: 'Pepperoni Pizza',
          description: 'Traditional pizza topped with pepperoni slices',
          price: 11.99,
          category: 'Pizza',
          imageUrl: getFoodItemImageUrl('pizza'),
          isPopular: true,
          restaurantId
        },
        {
          name: 'Spaghetti Bolognese',
          description: 'Spaghetti with rich meat sauce',
          price: 12.99,
          category: 'Pasta',
          imageUrl: getFoodItemImageUrl('pasta'),
          restaurantId
        }
      );
    }
    
    // Add more cuisine-based items as needed
    
    return items;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Initializing Firebase...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', p: 3 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Failed to initialize Firebase
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Box>
    );
  }

  return children;
};

export default FirebaseInitializer;
