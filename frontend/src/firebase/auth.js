import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { setDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Register a new user with enhanced error handling
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    try {
      await updateProfile(user, { displayName });
    } catch (profileError) {
      console.error("Error updating profile:", profileError.code, profileError.message);
      // Continue even if profile update fails - we'll fix it later
    }
    
    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role: 'customer', // Default role
        createdAt: Timestamp.now(),
        address: {},
        phone: ''
      });
    } catch (firestoreError) {
      console.error("Error creating user document:", firestoreError.code, firestoreError.message);
      // User was created but we couldn't save extra data - the app can still function
    }
    
    return user;
  } catch (error) {
    console.error("Firebase registration error:", error.code, error.message);
    throw error;
  }
};

// Login a user with enhanced error handling
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase auth error:", error.code, error.message);
    throw error;
  }
};

// Logout a user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user data
export const getCurrentUserData = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('User data not found');
    }
  } catch (error) {
    throw error;
  }
};

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
