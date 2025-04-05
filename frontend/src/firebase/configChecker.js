import { auth } from './config';

export function checkFirebaseConfig() {
  try {
    // Check if auth is properly initialized
    if (!auth) {
      console.error("Firebase auth is not initialized");
      return {
        isValid: false,
        error: "Firebase Authentication is not properly initialized"
      };
    }

    // Check if auth has the required methods
    if (!auth.signInWithEmailAndPassword || !auth.createUserWithEmailAndPassword) {
      console.error("Firebase auth methods are missing");
      return {
        isValid: false,
        error: "Firebase Authentication methods are not available"
      };
    }

    // Check if Firebase config is set up with actual values
    const config = auth.app.options;
    if (!config.apiKey || config.apiKey.includes('YOUR_API_KEY')) {
      console.error("Firebase API key is not properly set");
      return {
        isValid: false,
        error: "Firebase API key is not configured correctly"
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error checking Firebase config:", error);
    return {
      isValid: false,
      error: `Firebase configuration error: ${error.message}`
    };
  }
}
