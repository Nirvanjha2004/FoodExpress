const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: {
      type: Number,
      default: 1
    },
    price: Number,
    specialInstructions: String
  }],
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'preparing', 'ready-for-pickup', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed'
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  riderLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit-card', 'debit-card', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  subtotal: Number,
  deliveryFee: Number,
  tax: Number,
  total: Number,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
