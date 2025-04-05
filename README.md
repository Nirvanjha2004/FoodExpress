# Food Delivery Platform

A comprehensive food delivery platform that connects customers, restaurants, and delivery riders. This application allows customers to browse restaurants, order food, track deliveries, and manage their profile while enabling restaurants to manage their menus and handle incoming orders.

![Food Delivery App Screenshot](./screenshot.png)

## Features

### For Customers
- Browse restaurants with filtering options
- View restaurant details and menus
- Add items to cart from multiple restaurants
- Checkout and payment processing
- Real-time order tracking
- Order history
- Profile management

### For Restaurants
- Restaurant dashboard with order statistics
- Menu management (add, edit, delete items)
- Order management (accept, prepare, ready for pickup)
- Restaurant profile settings

### For Riders
- Order pickup and delivery management
- Delivery status updates
- Earnings tracking

## Technologies Used

### Frontend
- React.js
- Material UI
- React Router
- Context API for state management

### Backend
- Node.js
- Express
- MongoDB
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v14.x or later)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/food-delivery-platform.git
   cd food-delivery-platform
   ```

2. Install dependencies for both frontend and backend
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the backend directory
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/food-delivery
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the application
   ```bash
   # Run backend (from backend directory)
   npm run dev

   # Run frontend (from frontend directory)
   npm start
   ```

5. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

