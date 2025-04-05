import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// ========== Restaurants ==========

export const getRestaurants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting restaurants:', error);
    throw error;
  }
};

export const getRestaurantById = async (restaurantId) => {
  try {
    const docRef = doc(db, 'restaurants', restaurantId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Restaurant not found');
    }
  } catch (error) {
    console.error('Error getting restaurant:', error);
    throw error;
  }
};

export const getRestaurantsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'restaurants'),
      where('cuisine', 'array-contains', category)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting restaurants by category:', error);
    throw error;
  }
};

// ========== Menu Items ==========

export const getMenuItems = async (restaurantId) => {
  try {
    const q = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
};

// ========== Orders ==========

export const createOrder = async (orderData) => {
  try {
    const order = {
      ...orderData,
      status: 'placed',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), order);
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// ========== User Profile ==========

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// For Restaurant owners
export const getRestaurantByOwnerId = async (userId) => {
  try {
    const q = query(
      collection(db, 'restaurants'),
      where('ownerId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting owner restaurant:', error);
    throw error;
  }
};

// ========== User Cart ==========

export const getUserCart = async (userId) => {
  try {
    const docRef = doc(db, 'userCarts', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting user cart:', error);
    throw error;
  }
};

export const saveUserCart = async (userId, cartItems) => {
  try {
    await setDoc(doc(db, 'userCarts', userId), {
      userId,
      items: cartItems,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving user cart:', error);
    throw error;
  }
};

export const clearUserCart = async (userId) => {
  try {
    await setDoc(doc(db, 'userCarts', userId), {
      userId,
      items: [],
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error clearing user cart:', error);
    throw error;
  }
};
