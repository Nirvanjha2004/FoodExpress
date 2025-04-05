# Firebase Setup Instructions

This document explains how to set up Firebase for the Food Delivery Platform.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Food Delivery Platform")
4. Follow the setup wizard (you can disable Google Analytics if you want)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project console, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "Food Delivery Web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object for later use

## Step 3: Update the Firebase Configuration

1. Open the file `src/firebase/config.js` in the project
2. Replace the placeholders with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Step 4: Enable Firebase Authentication

1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Click on "Email/Password" and enable it
4. Click "Save"

## Step 5: Set Up Firestore Database

1. In the Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you'll want to set up proper security rules later)
4. Select a location for your database
5. Click "Enable"

## Step 6: Deploy Your Application (Optional)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize your project: `firebase init` (select Hosting and use "build" as the public directory)
4. Build your React app: `npm run build`
5. Deploy to Firebase: `firebase deploy`

## Security Notice

The current configuration is set for development with test mode security rules. Before launching your app to production, make sure to:

1. Set up proper Firestore Security Rules
2. Configure Authentication settings properly
3. Review and test your security model thoroughly

## Working With the Free Tier Limitations

The Firebase free tier ("Spark" plan) includes:

- Authentication: 10,000 verifications/month
- Firestore: 1GB storage, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day
- Hosting: 10GB storage, 360MB/day data transfer

To stay within these limits:
- Minimize reads by using efficient queries
- Cache data where possible
- Use external image URLs instead of Firebase Storage
- Keep document sizes small
- Implement pagination

## Database Structure

Our application uses the following collections:

1. `users` - User profiles and authentication data
2. `restaurants` - Restaurant details
3. `menuItems` - Food items for restaurants
4. `orders` - Customer orders

For detailed schema information, see the code documentation.
