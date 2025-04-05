const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const restaurantOwner = require('../middleware/restaurantOwner');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const { cuisine, search, sort, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sorting options
    let sortOption = {};
    if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }
    
    const restaurants = await Restaurant.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count for pagination
    const count = await Restaurant.countDocuments(query);
    
    res.json({
      restaurants,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant by id
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Get menu items for the restaurant
    const menuItems = await MenuItem.find({ restaurant: req.params.id });
    
    res.json({ restaurant, menuItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create restaurant (protected, only for restaurant owners)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user role is restaurant
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Only restaurant owners can create restaurants' });
    }

    const restaurant = new Restaurant({
      ...req.body,
      owner: req.user.id
    });
    
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update restaurant (protected, only for restaurant owners)
router.put('/:id', auth, restaurantOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete restaurant (protected, only for restaurant owners)
router.delete('/:id', auth, restaurantOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Delete all menu items for this restaurant
    await MenuItem.deleteMany({ restaurant: req.params.id });
    
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add menu item to restaurant
router.post('/:id/menu', auth, restaurantOwner, async (req, res) => {
  try {
    const menuItem = new MenuItem({
      ...req.body,
      restaurant: req.params.id
    });
    
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get restaurant reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('reviews.user', 'name');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant.reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review to restaurant
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user already reviewed this restaurant
    const alreadyReviewed = restaurant.reviews.find(
      review => review.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }
    
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment
    };
    
    restaurant.reviews.push(review);
    
    // Calculate average rating
    restaurant.rating = restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) 
      / restaurant.reviews.length;
    
    await restaurant.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
