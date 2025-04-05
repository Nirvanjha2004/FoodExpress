# Firebase Authentication Troubleshooting Guide

If you're encountering authentication errors with Firebase, follow this guide to troubleshoot and resolve them.

## Common Authentication Errors

### "An error occurred during authentication"

This generic error can have several causes:

1. **Firebase configuration issues**
2. **Authentication service not enabled**
3. **Network connectivity problems**
4. **Incorrect credentials**

## Step-by-Step Troubleshooting

### 1. Check Firebase Authentication Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Authentication" in the left sidebar
4. Verify that the Email/Password provider is enabled:
   - Click on the "Sign-in method" tab
   - Find "Email/Password" in the list
   - Make sure it's "Enabled"

### 2. Verify Your Firebase Configuration

Check that your Firebase configuration in `src/firebase/config.js` contains valid values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY", // Should NOT contain "YOUR_API_KEY"
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

If you need to retrieve your Firebase config:
1. Go to Project Settings in Firebase Console
2. Under "Your apps", find your web app 
3. Click the config icon (</>) 
4. Copy the configuration object

### 3. Network Connection Issues

- Make sure you have a stable internet connection
- Try disabling any VPN or proxy services
- Check if Firebase services are experiencing downtime [Firebase Status](https://status.firebase.google.com/)

### 4. Clear Browser Data

1. Clear cookies and site data for your development domain
2. Restart your browser
3. Try authentication again

### 5. Check Console for Specific Error Messages

Open your browser's developer console (F12 or Ctrl+Shift+I) to check for specific error codes:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/invalid-email` | Email format is incorrect | Fix email format |
| `auth/user-disabled` | Account has been disabled | Contact admin |
| `auth/user-not-found` | No user with this email | Check email or register |
| `auth/wrong-password` | Incorrect password | Check password |
| `auth/email-already-in-use` | Email already registered | Try logging in instead |
| `auth/weak-password` | Password too weak | Use stronger password |
| `auth/operation-not-allowed` | Provider not enabled | Enable provider in Firebase Console |
| `auth/network-request-failed` | Network error | Check internet connection |

### 6. Firebase Rules

Make sure your Firebase security rules allow authentication operations:

