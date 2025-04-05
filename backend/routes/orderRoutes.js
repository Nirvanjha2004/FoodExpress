const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const auth = require('../middleware/auth');
const socketService = require('../services/socketService');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Calculate order details
    let subtotal = 0;
    const orderItems = [];

    // Verify each item and calculate prices
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    // Calculate additional fees
    const deliveryFee = 3.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    // Set estimated delivery time (30 minutes from now)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 30);

    const order = new Order({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      deliveryAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      estimatedDeliveryTime
    });

    await order.save();

    // Notify restaurant owner about new order
    socketService.notifyNewOrder(restaurant.owner, order);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get customer's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name address')
      .populate('items.menuItem', 'name');
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant's orders
router.get('/restaurant-orders', auth, async (req, res) => {
  try {
    // Check if user has a restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(403).json({ message: 'You do not own a restaurant' });
    }
    
    const { status } = req.query;
    const query = { restaurant: restaurant._id };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name');
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name address')
      .populate('customer', 'name phone')
      .populate('items.menuItem')
      .populate('rider', 'name phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user.id });
      if (!restaurant || order.restaurant._id.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ owner: req.user.id });
      if (!restaurant || order.restaurant.toString() !== restaurant._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Restaurant owners can only update to these statuses
      const allowedStatuses = ['confirmed', 'preparing', 'ready-for-pickup', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status update for restaurant' });
      }
    } else if (req.user.role === 'rider') {
      // Riders can only update to these statuses
      const allowedStatuses = ['out-for-delivery', 'delivered'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status update for rider' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update the order
    order.status = status;
    
    // Assign rider if provided
    if (riderId && status === 'ready-for-pickup') {
      const rider = await User.findById(riderId);
      if (!rider || rider.role !== 'rider') {
        return res.status(404).json({ message: 'Rider not found' });
      }
      order.rider = riderId;
    }
    
    // If delivered, set actual delivery time
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    
    await order.save();
    
    // Notify customer about order status update
    socketService.notifyOrderStatusUpdate(order.customer, order);
    
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update rider's location
router.post('/:id/rider-location', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Only riders can update location' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    order.riderLocation = {
      lat,
      lng,
      timestamp: new Date()
    };
    
    await order.save();
    
    // Emit location update via socket
    socketService.updateRiderLocation(order._id, {
      lat,
      lng,
      timestamp: new Date()
    });
    
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
