import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch cart items from Firebase
  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          // If no user is logged in, use local storage or empty cart
          const localCart = localStorage.getItem('cart');
          setCartItems(localCart ? JSON.parse(localCart) : []);
          setLoading(false);
          return;
        }
        
        const cartRef = doc(db, 'carts', userId);
        const cartDoc = await getDoc(cartRef);
        
        if (cartDoc.exists()) {
          setCartItems(cartDoc.data().items || []);
        } else {
          // Initialize empty cart for user
          await setDoc(cartRef, { items: [] });
          setCartItems([]);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCartItems();
  }, []);
  
  // Save cart to Firebase
  const saveCart = async (newCartItems) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const cartRef = doc(db, 'carts', userId);
        await updateDoc(cartRef, { items: newCartItems });
      } else {
        // Store in local storage if no user is logged in
        localStorage.setItem('cart', JSON.stringify(newCartItems));
      }
    } catch (err) {
      console.error("Error saving cart:", err);
      setError("Failed to update cart");
    }
  };
  
  const addToCart = async (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cartItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }
    
    setCartItems(updatedCart);
    await saveCart(updatedCart);
  };
  
  const removeFromCart = async (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    await saveCart(updatedCart);
  };
  
  const updateQuantity = async (productId, quantity) => {
    const updatedCart = cartItems.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    await saveCart(updatedCart);
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
