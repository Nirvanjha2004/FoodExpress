// Since Firebase Storage is limited in free tier, we'll use placeholder images

const PLACEHOLDER_IMAGES = {
  restaurants: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de'
  ],
  foodItems: {
    pizza: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47'
    ],
    burger: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
    ],
    sushi: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de'
    ],
    pasta: [
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141'
    ],
    dessert: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b'
    ],
    default: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
    ]
  },
  users: [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/women/1.jpg'
  ]
};

// Get a random image URL from array
const getRandomImage = (images) => {
  return images[Math.floor(Math.random() * images.length)];
};

// Get a restaurant image
export const getRestaurantImageUrl = () => {
  return getRandomImage(PLACEHOLDER_IMAGES.restaurants);
};

// Get a food item image based on category
export const getFoodItemImageUrl = (category) => {
  const categoryLower = category?.toLowerCase() || 'default';
  const categoryImages = PLACEHOLDER_IMAGES.foodItems[categoryLower] || PLACEHOLDER_IMAGES.foodItems.default;
  return getRandomImage(categoryImages);
};

// Get a user profile image
export const getUserImageUrl = (gender = 'male') => {
  return gender === 'female' 
    ? PLACEHOLDER_IMAGES.users[1] 
    : PLACEHOLDER_IMAGES.users[0];
};

// Helper to build image URL with parameters for better quality/size
export const buildImageUrl = (baseUrl, width = 400, height = 300) => {
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
};
