import React from 'react';
import { useCart } from '../contexts/CartContext';

const Product = ({ product }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product">
      {/* ...existing code... */}
      <button 
        onClick={handleAddToCart} 
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default Product;