import React, { createContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  subscribeToAuthChanges,
  getCurrentUserData
} from '../firebase/auth';
import { auth } from '../firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!auth) {
      console.error("Firebase auth not initialized");
      setError("Firebase initialization failed. Please check your configuration.");
      setLoading(false);
      return;
    }
    
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      setLoading(true);
      
      if (user) {
        try {
          // Get additional user data from Firestore
          const data = await getCurrentUserData(user.uid);
          setUserData(data);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setAuthLoading(true);
    try {
      console.log("Attempting login for:", email);
      await loginUser(email, password);
      setAuthLoading(false);
    } catch (err) {
      console.error("Login error in AuthContext:", err);
      setError(getAuthErrorMessage(err.code));
      setAuthLoading(false);
      throw err;
    }
  };

  const register = async (email, password, displayName) => {
    setError(null);
    try {
      await registerUser(email, password, displayName);
      // Auth state listener will handle setting the user
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
      // Auth state listener will handle setting the user to null
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
      return true;
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  // Helper function to get user-friendly error messages
  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email';
      case 'auth/weak-password':
        return 'Password is too weak (at least 6 characters)';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/network-request-failed':
        return 'Network error - check your internet connection';
      case 'auth/internal-error':
        return 'Authentication service encountered an error';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return `Authentication error: ${errorCode || 'Unknown error'}`;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser,
      userData,
      isAuthenticated: !!currentUser,
      loading,
      authLoading,
      error,
      login,
      register,
      logout,
      forgotPassword,
      clearError: () => setError(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
