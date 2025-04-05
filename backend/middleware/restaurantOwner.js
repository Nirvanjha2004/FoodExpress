const Restaurant = require('../models/Restaurant');

// Middleware to check if the authenticated user is the owner of the restaurant
module.exports = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if the authenticated user is the owner
    if (restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized as the restaurant owner' });
    }
    
    // Pass the restaurant to the next middleware/controller
    req.restaurant = restaurant;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
