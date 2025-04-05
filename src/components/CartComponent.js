import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const CartComponent = () => {
  const { cartItems, loading, error, removeFromCart, updateQuantity } = useCart();
  const [processingItems, setProcessingItems] = useState({});

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!cartItems || cartItems.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Set this item as processing
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      // Remove processing state
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cartItems.map((item) => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div className="item-details">
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <div className="quantity">
              <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={processingItems[item.id] || item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={processingItems[item.id]}
              >
                +
              </button>
            </div>
            <button 
              onClick={() => handleRemoveItem(item.id)}
              disabled={processingItems[item.id]}
            >
              {processingItems[item.id] ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: ${calculateTotal().toFixed(2)}</h3>
        <button className="checkout-button">Checkout</button>
      </div>
    </div>
  );
};

export default CartComponent;
