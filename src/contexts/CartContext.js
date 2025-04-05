import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user ID
  const getUserId = () => {
    return auth.currentUser?.uid;
  };
  
  // Initialize and listen to cart changes
  useEffect(() => {
    setLoading(true);
    
    const userId = getUserId();
    if (!userId) {
      // If no user is logged in, use local storage
      const localCart = localStorage.getItem('cart');
      setCartItems(localCart ? JSON.parse(localCart) : []);
      setLoading(false);
      return;
    }
    
    const cartRef = doc(db, 'carts', userId);
    
    // Create an empty cart if it doesn't exist
    const initializeCart = async () => {
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) {
        await setDoc(cartRef, { items: [] });
      }
    };
    
    initializeCart();
    
    // Set up real-time listener for cart changes
    const unsubscribe = onSnapshot(
      cartRef,
      (doc) => {
        if (doc.exists()) {
          setCartItems(doc.data().items || []);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to cart updates:", err);
        setError("Failed to load cart items");
        setLoading(false);
      }
    );
    
    // Clean up listener
    return () => unsubscribe();
  }, [auth.currentUser]);
  
  // Save cart changes to Firebase
  const saveCart = async (items) => {
    const userId = getUserId();
    
    try {
      if (userId) {
        // Save to Firebase if user is logged in
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items });
      } else {
        // Save to localStorage if no user
        localStorage.setItem('cart', JSON.stringify(items));
      }
      return true;
    } catch (err) {
      console.error("Error saving cart:", err);
      setError("Failed to update cart");
      return false;
    }
  };
  
  const addToCart = async (product) => {
    try {
      const existingItem = cartItems.find(item => item.id === product.id);
      let updatedCart;
      
      if (existingItem) {
        updatedCart = cartItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...cartItems, { ...product, quantity: 1 }];
      }
      
      await saveCart(updatedCart);
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      return false;
    }
  };
  
  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== productId);
      await saveCart(updatedCart);
      return true;
    } catch (err) {
      console.error("Error removing from cart:", err);
      return false;
    }
  };
  
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return false;
      
      const updatedCart = cartItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      
      await saveCart(updatedCart);
      return true;
    } catch (err) {
      console.error("Error updating quantity:", err);
      return false;
    }
  };
  
  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};
