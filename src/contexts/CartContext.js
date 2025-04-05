import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper to implement exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  
  // Use refs to avoid dependency issues with current state values
  const cartItemsRef = useRef(cartItems);
  const syncTimeoutRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Update ref when cartItems changes
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);
  
  // Get current user ID
  const getUserId = () => auth.currentUser?.uid;
  
  // Load cart from local storage (fallback)
  const loadLocalCart = () => {
    try {
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
      return [];
    }
  };
  
  // Save cart to local storage (always do this as backup)
  const saveLocalCart = (items) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart to localStorage:", e);
    }
  };
  
  // Initialize cart
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const initCart = async () => {
      setLoading(true);
      
      try {
        // Always load from local storage first for immediate response
        const localItems = loadLocalCart();
        setCartItems(localItems);
        
        const userId = getUserId();
        if (!userId) {
          setLoading(false);
          return;
        }
        
        // Then try to fetch from Firebase
        const cartRef = doc(db, 'carts', userId);
        const cartDoc = await getDoc(cartRef);
        
        if (cartDoc.exists()) {
          const serverItems = cartDoc.data().items || [];
          setCartItems(serverItems);
          saveLocalCart(serverItems); // Update local storage
        } else {
          // Initialize empty cart for new users
          await setDoc(cartRef, { items: localItems });
        }
      } catch (err) {
        console.error("Error initializing cart:", err);
        setError("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };
    
    initCart();
    
    // Auth state listener instead of dependency
    const unsubscribe = auth.onAuthStateChanged(() => {
      if (!isInitializedRef.current) return;
      initCart();
    });
    
    return () => {
      unsubscribe();
      // Clear any pending sync timeout on unmount
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array
  
  // Function to sync cart with Firebase (without updating local state)
  const syncCartWithFirebase = async (items, maxRetries = 3) => {
    const userId = getUserId();
    if (!userId) return true; // No need to sync if not logged in
    
    // Try to save to Firebase with retries and backoff
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items });
        setLastSyncTime(Date.now());
        return true;
      } catch (err) {
        console.error(`Error saving cart (attempt ${retries + 1}):`, err);
        
        // If quota exceeded, wait longer before retry
        if (err.code === 'resource-exhausted') {
          await sleep(Math.pow(2, retries) * 1000 + Math.random() * 1000);
        } else {
          await sleep(500);
        }
        
        retries++;
        if (retries >= maxRetries) {
          setError("Failed to update cart on server");
          return false;
        }
      }
    }
    
    return false;
  };
  
  // Save cart locally immediately and schedule Firebase sync
  const saveCart = async (items) => {
    // Save locally right away
    saveLocalCart(items);
    setCartItems(items);
    
    // Cancel any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime;
    
    // If we recently synced, schedule a delayed sync
    if (timeSinceLastSync < 2000) {
      // Use ref to avoid stale closure issues
      syncTimeoutRef.current = setTimeout(() => {
        syncCartWithFirebase(items);
        syncTimeoutRef.current = null;
      }, 2000 - timeSinceLastSync);
      return true;
    } else {
      // Otherwise sync now
      return await syncCartWithFirebase(items);
    }
  };
  
  const addToCart = async (product) => {
    try {
      // Use ref for latest state
      const currentCartItems = cartItemsRef.current;
      const existingItem = currentCartItems.find(item => item.id === product.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = currentCartItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...currentCartItems, { ...product, quantity: 1 }];
      }
      
      return await saveCart(updatedCart);
    } catch (err) {
      console.error("Error adding to cart:", err);
      return false;
    }
  };
  
  const removeFromCart = async (productId) => {
    try {
      const currentCartItems = cartItemsRef.current;
      const updatedCart = currentCartItems.filter(item => item.id !== productId);
      return await saveCart(updatedCart);
    } catch (err) {
      console.error("Error removing from cart:", err);
      return false;
    }
  };
  
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return false;
      
      const currentCartItems = cartItemsRef.current;
      const updatedCart = currentCartItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
      
      return await saveCart(updatedCart);
    } catch (err) {
      console.error("Error updating quantity:", err);
      return false;
    }
  };
  
  // Clear error after 5 seconds, using ref to manage timeouts properly
  useEffect(() => {
    let errorTimeout;
    if (error) {
      errorTimeout = setTimeout(() => setError(null), 5000);
    }
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [error]);
  
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
