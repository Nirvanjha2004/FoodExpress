// Array of Unsplash food and restaurant images
const foodImages = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Pizza
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Burger
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Burger 2
  'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Ramen
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Sushi
  'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Tacos
  'https://images.unsplash.com/photo-1606728035253-49e8a23146de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Pasta
  'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Steak
  'https://images.unsplash.com/photo-1528510138849-786a5feddf34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Dim Sum
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Sandwich
];

const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Restaurant 1
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Restaurant 2
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Restaurant 3
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Restaurant 4
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80', // Restaurant 5
];

const bannerImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
];

// Get random image from array
export const getRandomFoodImage = () => {
  return foodImages[Math.floor(Math.random() * foodImages.length)];
};

export const getRandomRestaurantImage = () => {
  return restaurantImages[Math.floor(Math.random() * restaurantImages.length)];
};

export const getRandomBannerImage = () => {
  return bannerImages[Math.floor(Math.random() * bannerImages.length)];
};

// Dummy restaurant data
export const dummyRestaurants = [
  {
    _id: '1',
    name: 'Italiano Delizioso',
    description: 'Authentic Italian cuisine with handmade pasta and wood-fired pizzas.',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    rating: 4.7,
    imageUrl: restaurantImages[0],
    deliveryTime: '25-35',
    deliveryFee: 2.99,
    minOrder: 15,
  },
  {
    _id: '2',
    name: 'Sushi Paradise',
    description: 'Fresh and creative Japanese cuisine featuring premium sushi and sashimi.',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    address: {
      street: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
    },
    rating: 4.9,
    imageUrl: restaurantImages[1],
    deliveryTime: '30-40',
    deliveryFee: 3.99,
    minOrder: 20,
  },
  {
    _id: '3',
    name: 'Burger Joint',
    description: 'Juicy burgers with premium beef and creative toppings.',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    address: {
      street: '789 Maple Rd',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
    },
    rating: 4.5,
    imageUrl: restaurantImages[2],
    deliveryTime: '20-30',
    deliveryFee: 1.99,
    minOrder: 10,
  },
  {
    _id: '4',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street food with homemade salsas and fresh ingredients.',
    cuisine: ['Mexican', 'Tacos', 'Latin American'],
    address: {
      street: '321 Elm St',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
    },
    rating: 4.6,
    imageUrl: restaurantImages[3],
    deliveryTime: '25-35',
    deliveryFee: 2.49,
    minOrder: 12,
  },
  {
    _id: '5',
    name: 'Curry House',
    description: 'Flavorful Indian dishes with aromatic spices and fresh ingredients.',
    cuisine: ['Indian', 'Curry', 'Asian'],
    address: {
      street: '654 Pine St',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
    },
    rating: 4.8,
    imageUrl: restaurantImages[4],
    deliveryTime: '35-45',
    deliveryFee: 2.99,
    minOrder: 20,
  },
  {
    _id: '6',
    name: 'Noodle House',
    description: 'Authentic Asian noodles from different regions with homemade broths.',
    cuisine: ['Asian', 'Chinese', 'Thai', 'Vietnamese'],
    address: {
      street: '987 Cedar Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10006',
    },
    rating: 4.7,
    imageUrl: restaurantImages[0],
    deliveryTime: '30-40',
    deliveryFee: 3.49,
    minOrder: 15,
  },
];

// Dummy menu categories
export const menuCategories = [
  'Appetizers', 'Main Dishes', 'Burgers', 'Pizzas', 'Pastas', 
  'Sushi Rolls', 'Salads', 'Desserts', 'Beverages', 'Sides'
];

// Function to generate dummy menu items based on restaurant cuisine
export const generateMenuItems = (restaurantId, cuisineTypes) => {
  let menuItems = [];
  let id = 1;

  // Generate different items based on cuisine
  if (cuisineTypes.includes('Italian')) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 14.99,
        category: 'Pizzas',
        imageUrl: foodImages[0],
        isVegetarian: true,
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with pancetta, egg, and parmesan cheese',
        price: 16.99,
        category: 'Pastas',
        imageUrl: foodImages[6],
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        price: 9.99,
        category: 'Salads',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  if (cuisineTypes.includes('Japanese') || cuisineTypes.includes('Sushi')) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber roll with tobiko',
        price: 10.99,
        category: 'Sushi Rolls',
        imageUrl: foodImages[4],
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Spicy Tuna Roll',
        description: 'Fresh tuna with spicy mayo and cucumber',
        price: 12.99,
        category: 'Sushi Rolls',
        imageUrl: getRandomFoodImage(),
        isSpicy: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        price: 4.99,
        category: 'Appetizers',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  if (cuisineTypes.includes('American') || cuisineTypes.includes('Burgers')) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheddar, lettuce, tomato, and special sauce',
        price: 13.99,
        category: 'Burgers',
        imageUrl: foodImages[1],
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'BBQ Bacon Burger',
        description: 'Beef patty with bacon, cheddar, and BBQ sauce',
        price: 15.99,
        category: 'Burgers',
        imageUrl: foodImages[2],
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: 4.99,
        category: 'Sides',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  if (cuisineTypes.includes('Mexican')) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Street Tacos',
        description: 'Three tacos with your choice of meat, onions, and cilantro',
        price: 11.99,
        category: 'Main Dishes',
        imageUrl: foodImages[5],
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Chicken Quesadilla',
        description: 'Flour tortilla with grilled chicken, cheese, and pico de gallo',
        price: 10.99,
        category: 'Main Dishes',
        imageUrl: getRandomFoodImage(),
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Guacamole & Chips',
        description: 'Fresh avocado with tomato, onion, and lime',
        price: 7.99,
        category: 'Appetizers',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  if (cuisineTypes.includes('Indian')) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Chicken Tikka Masala',
        description: 'Grilled chicken in a creamy tomato sauce',
        price: 16.99,
        category: 'Main Dishes',
        imageUrl: getRandomFoodImage(),
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in a rich tomato gravy',
        price: 14.99,
        category: 'Main Dishes',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Garlic Naan',
        description: 'Freshly baked bread with garlic butter',
        price: 3.99,
        category: 'Sides',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  // Add some generic items if needed
  if (menuItems.length < 6) {
    menuItems = menuItems.concat([
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'House Special',
        description: 'Chef\'s daily special with premium ingredients',
        price: 18.99,
        category: 'Main Dishes',
        imageUrl: getRandomFoodImage(),
        isPopular: true,
      },
      {
        _id: `item-${restaurantId}-${id++}`,
        name: 'Garden Salad',
        description: 'Mixed greens with seasonal vegetables and house dressing',
        price: 8.99,
        category: 'Salads',
        imageUrl: getRandomFoodImage(),
        isVegetarian: true,
      }
    ]);
  }

  // Add common items
  menuItems = menuItems.concat([
    {
      _id: `item-${restaurantId}-${id++}`,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with a molten center',
      price: 7.99,
      category: 'Desserts',
      imageUrl: getRandomFoodImage(),
      isVegetarian: true,
    },
    {
      _id: `item-${restaurantId}-${id++}`,
      name: 'Soda',
      description: 'Your choice of soft drink',
      price: 2.99,
      category: 'Beverages',
      imageUrl: getRandomFoodImage(),
      isVegetarian: true,
    }
  ]);

  return menuItems;
};

// Dummy offers for promotional banners
export const dummyOffers = [
  {
    id: '1',
    title: '50% Off Your First Order',
    description: 'Use code WELCOME50 at checkout',
    image: getRandomBannerImage(),
  },
  {
    id: '2',
    title: 'Free Delivery',
    description: 'On orders above $25',
    image: getRandomBannerImage(),
  },
  {
    id: '3',
    title: 'Buy One Get One Free',
    description: 'Every Wednesday on selected restaurants',
    image: getRandomBannerImage(),
  }
];
