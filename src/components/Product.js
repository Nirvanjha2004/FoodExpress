import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const Product = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if product is already in cart
  const productInCart = cartItems.find(item => item.id === product.id);
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    setError(null);
    
    try {
      // Implement optimistic UI update
      const success = await addToCart(product);
      if (!success) {
        setError("Couldn't add item. Please try again later.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      
      // Handle quota exceeded specifically
      if (err.code === 'resource-exhausted') {
        setError("Service temporarily unavailable. Please try again later.");
      } else {
        setError("Failed to add item to cart");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="product">
      {/* ...existing code... */}
      {error && <p className="error-message">{error}</p>}
      <button 
        onClick={handleAddToCart} 
        disabled={isAdding}
        className={productInCart ? 'in-cart' : ''}
      >
        {isAdding ? 'Adding...' : 
         productInCart ? `In Cart (${productInCart.quantity})` : 'Add to Cart'}
      </button>
    </div>
  );
};

export default Product;