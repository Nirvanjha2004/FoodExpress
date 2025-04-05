import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [restaurantGroups, setRestaurantGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  
  // Calculate total items in cart
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load cart data when user changes
  useEffect(() => {
    // Clear cart when user logs out
    if (!isAuthenticated) {
      setCart([]);
      setRestaurantGroups({});
      setLoading(false);
      localStorage.removeItem('guestCart');
      return;
    }
    
    // User is logged in
    if (currentUser) {
      const userId = currentUser.uid;
      setLoading(true);
      
      // Subscribe to user's cart in Firestore
      const unsubscribe = onSnapshot(
        doc(db, 'userCarts', userId),
        (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCart(userData.items || []);
          } else {
            // No cart in Firestore yet, check localStorage for guest cart
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
              // Migrate guest cart to user cart
              const parsedCart = JSON.parse(guestCart);
              setCart(parsedCart);
              // Save to Firestore later via useEffect
              localStorage.removeItem('guestCart');
            } else {
              setCart([]);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error loading cart:", error);
          setLoading(false);
          // Fallback to local storage
          const savedCart = localStorage.getItem(`cart_${userId}`);
          setCart(savedCart ? JSON.parse(savedCart) : []);
        }
      );
      
      return () => unsubscribe();
    }
  }, [currentUser, isAuthenticated]);

  // Update localStorage and Firestore whenever cart changes
  useEffect(() => {
    if (loading) return; // Skip during initial load
    
    // Group items by restaurant
    const groups = cart.reduce((acc, item) => {
      const restaurantId = item.restaurantId;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: item.restaurant,
          items: []
        };
      }
      acc[restaurantId].items.push(item);
      return acc;
    }, {});
    
    setRestaurantGroups(groups);
    
    if (isAuthenticated && currentUser) {
      // Save to user's Firestore cart
      const userId = currentUser.uid;
      setDoc(doc(db, 'userCarts', userId), {
        userId: userId,
        items: cart,
        updatedAt: new Date().toISOString()
      }).catch(err => console.error("Error saving cart:", err));
      
      // Backup to localStorage
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    } else {
      // Save to guest cart in localStorage
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, currentUser, isAuthenticated, loading]);

  // Add item to cart
  const addToCart = (item, restaurant) => {
    // Create a new item with restaurant info
    const newItem = {
      ...item,
      restaurantId: restaurant.id || restaurant._id,
      restaurant: {
        id: restaurant.id || restaurant._id,
        name: restaurant.name,
        imageUrl: restaurant.imageUrl,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder
      },
      quantity: 1
    };

    // Check if item already exists
    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.id === item.id && cartItem.restaurantId === (restaurant.id || restaurant._id)
    );

    if (existingItemIndex !== -1) {
      // Increment quantity if item exists
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      // Add new item
      setCart([...cart, newItem]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId, restaurantId) => {
    setCart(cart.filter(item => !(item.id === itemId && item.restaurantId === restaurantId)));
  };

  // Update item quantity
  const updateQuantity = (itemId, restaurantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, restaurantId);
      return;
    }

    const newCart = cart.map(item => 
      (item.id === itemId && item.restaurantId === restaurantId)
        ? { ...item, quantity }
        : item
    );
    
    setCart(newCart);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Clear restaurant items
  const clearRestaurantItems = (restaurantId) => {
    setCart(cart.filter(item => item.restaurantId !== restaurantId));
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      itemCount, 
      subtotal, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      restaurantGroups,
      clearRestaurantItems,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};
