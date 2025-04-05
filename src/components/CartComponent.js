import React from 'react';
import { useCart } from '../contexts/CartContext';

const CartComponent = () => {
  const { cartItems, loading, error, removeFromCart, updateQuantity } = useCart();

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (cartItems.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

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
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
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
