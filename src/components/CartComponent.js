import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

const CartComponent = () => {
  const { cartItems, loading, error, removeFromCart, updateQuantity } = useCart();
  const [processingItems, setProcessingItems] = useState({});
  const [actionErrors, setActionErrors] = useState({});

  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your cart...</p>
    </div>;
  }

  if (cartItems.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1 || processingItems[itemId]) return;
    
    // Mark this item as processing
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setActionErrors(prev => ({ ...prev, [itemId]: null }));
    
    try {
      const success = await updateQuantity(itemId, newQuantity);
      if (!success) {
        setActionErrors(prev => ({ ...prev, [itemId]: "Failed to update quantity" }));
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setActionErrors(prev => ({ ...prev, [itemId]: "Error updating quantity" }));
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (processingItems[itemId]) return;
    
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setActionErrors(prev => ({ ...prev, [itemId]: null }));
    
    try {
      const success = await removeFromCart(itemId);
      if (!success) {
        setActionErrors(prev => ({ ...prev, [itemId]: "Failed to remove item" }));
        setProcessingItems(prev => ({ ...prev, [itemId]: false }));
      }
      // No need to reset processing state on success as the item will be removed from UI
    } catch (err) {
      console.error("Error removing item:", err);
      setActionErrors(prev => ({ ...prev, [itemId]: "Error removing item" }));
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-price">${parseFloat(item.price).toFixed(2)}</p>
              
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                  disabled={processingItems[item.id] || item.quantity <= 1}
                >
                  -
                </button>
                
                <span className="quantity">
                  {processingItems[item.id] ? '...' : item.quantity}
                </span>
                
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                  disabled={processingItems[item.id]}
                >
                  +
                </button>
              </div>
              
              {actionErrors[item.id] && (
                <p className="item-error">{actionErrors[item.id]}</p>
              )}
              
              <button 
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
                disabled={processingItems[item.id]}
              >
                {processingItems[item.id] ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total:</span>
          <span>${calculateTotal()}</span>
        </div>
        
        <button className="checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartComponent;
