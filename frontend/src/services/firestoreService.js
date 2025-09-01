import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../service/firebaseConfig';

class FirestoreService {
  constructor() {
    this.collections = {
      trips: 'trips',
      users: 'users',
      userProfiles: 'userProfiles',
      tripCollaborators: 'tripCollaborators',
      tripInvitations: 'tripInvitations',
      tripActivities: 'tripActivities',
      tripVotes: 'tripVotes'
    };
    this.isFirestoreAvailable = !!db;
    this.isOnline = navigator.onLine;

    if (!this.isFirestoreAvailable) {
      console.warn('⚠️ Firestore not available - using fallback mode');
    }
  }

  // Wrapper for Firestore operations with error handling
  async executeFirestoreOperation(operation, fallbackValue = null) {
    if (!this.isFirestoreAvailable) {
      console.warn('⚠️ Firestore not available - returning fallback value');
      return fallbackValue;
    }

    try {
      return await operation();
    } catch (error) {
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        console.warn('⚠️ Firestore permissions denied - using fallback mode');
        return fallbackValue;
      }

      if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
        console.warn('⚠️ Firestore temporarily unavailable - using fallback mode');
        return fallbackValue;
      }

      // Handle additional error codes that cause 400 errors
      if (error.code === 'failed-precondition' ||
          error.code === 'resource-exhausted' ||
          error.message?.includes('400') ||
          error.message?.includes('Bad Request')) {
        console.warn('⚠️ Firestore error - using fallback mode:', error.code || error.message);
        return fallbackValue;
      }

      console.error('❌ Firestore operation failed:', error);
      // Don't throw error to prevent app crashes, just return fallback
      console.warn('⚠️ Using fallback to prevent app crash');
      return fallbackValue;
    }
  }

  // Trip Management
  async saveTrip(userId, tripData) {
    return this.executeFirestoreOperation(async () => {
      const tripWithMetadata = {
        ...tripData,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: 1,
        status: 'active'
      };

      const docRef = await addDoc(collection(db, this.collections.trips), tripWithMetadata);

      console.log('✅ Trip saved with ID:', docRef.id);
      return {
        id: docRef.id,
        ...tripWithMetadata
      };
    }, {
      id: `local_${Date.now()}`,
      ...tripData,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: 'active'
    });
  }

  async getUserTrips(userId) {
    if (!userId) {
      console.warn('⚠️ No user ID provided for getUserTrips');
      return [];
    }

    return this.executeFirestoreOperation(async () => {
      // Use simple query without orderBy to avoid index requirement
      const q = query(
        collection(db, this.collections.trips),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const trips = [];

      querySnapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by createdAt on client side to avoid index requirement
      trips.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      console.log(`✅ Retrieved ${trips.length} trips for user ${userId}`);
      return trips;
    }, []); // Return empty array as fallback
  }

  async getTripById(tripId) {
    try {
      const docRef = doc(db, this.collections.trips, tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Trip not found');
      }
    } catch (error) {
      console.error('❌ Error getting trip:', error);
      throw new Error(`Failed to get trip: ${error.message}`);
    }
  }

  async updateTrip(tripId, updates) {
    try {
      const docRef = doc(db, this.collections.trips, tripId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        version: (updates.version || 1) + 1
      };

      await updateDoc(docRef, updateData);
      
      console.log('✅ Trip updated:', tripId);
      return { id: tripId, ...updateData };
    } catch (error) {
      console.error('❌ Error updating trip:', error);
      throw new Error(`Failed to update trip: ${error.message}`);
    }
  }

  async deleteTrip(tripId) {
    try {
      if (!tripId) {
        throw new Error('Trip ID is required');
      }

      console.log('🗑️ Attempting to delete trip:', tripId);
      console.log('🗑️ Database instance:', !!db);
      console.log('🗑️ Collections config:', this.collections);

      // First check if the trip exists and user has permission
      const docRef = doc(db, this.collections.trips, tripId);
      console.log('🗑️ Document reference created:', docRef.path);

      const tripDoc = await getDoc(docRef);
      console.log('🗑️ Trip document exists:', tripDoc.exists());

      if (!tripDoc.exists()) {
        throw new Error('Trip not found');
      }

      // Delete the trip
      console.log('🗑️ Calling deleteDoc...');
      await deleteDoc(docRef);

      console.log('✅ Trip deleted successfully:', tripId);
      return true;
    } catch (error) {
      console.error('❌ Detailed error deleting trip:', {
        error,
        message: error.message,
        code: error.code,
        stack: error.stack,
        tripId
      });

      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to delete this trip');
      } else if (error.code === 'not-found') {
        throw new Error('Trip not found');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Please sign in to delete trips');
      } else if (error.code === 'unavailable') {
        throw new Error('Service temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Failed to delete trip: ${error.message}`);
      }
    }
  }

  // User Profile Management
  async createUserProfile(userId, userData) {
    try {
      const userProfile = {
        userId: userId,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: {
          currency: 'USD',
          units: 'metric',
          language: 'en'
        },
        stats: {
          tripsCreated: 0,
          tripsCompleted: 0,
          totalSpent: 0
        }
      };

      await setDoc(doc(db, this.collections.userProfiles, userId), userProfile);
      
      console.log('✅ User profile created:', userId);
      return userProfile;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, this.collections.userProfiles, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      const docRef = doc(db, this.collections.userProfiles, userId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);
      
      console.log('✅ User profile updated:', userId);
      return updateData;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Collaboration Features
  async saveCollaborator(tripId, collaboratorData) {
    try {
      const collaboratorId = `${tripId}_${collaboratorData.userId}`;
      const docRef = doc(db, this.collections.tripCollaborators, collaboratorId);
      
      const collaborator = {
        ...collaboratorData,
        tripId: tripId,
        joinedAt: serverTimestamp(),
        status: 'active'
      };

      await setDoc(docRef, collaborator);
      
      console.log('✅ Collaborator saved:', collaboratorId);
      return collaborator;
    } catch (error) {
      console.error('❌ Error saving collaborator:', error);
      throw new Error(`Failed to save collaborator: ${error.message}`);
    }
  }

  async getTripCollaborators(tripId) {
    try {
      const q = query(
        collection(db, this.collections.tripCollaborators),
        where("tripId", "==", tripId),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const collaborators = [];

      querySnapshot.forEach((doc) => {
        collaborators.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return collaborators;
    } catch (error) {
      console.error('❌ Error getting collaborators:', error);
      throw new Error(`Failed to get collaborators: ${error.message}`);
    }
  }

  // Utility Methods
  async checkFirestoreConnection() {
    try {
      // Try to read from a test collection
      const testQuery = query(collection(db, 'test'), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ Firestore connection successful');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      return false;
    }
  }

  // Index Creation Helper
  getIndexCreationInfo() {
    return {
      message: 'Some queries require Firestore indexes. When you run a query that needs an index, Firebase will provide a direct link to create it.',
      commonIndexes: [
        {
          collection: 'trips',
          fields: [
            { field: 'userId', order: 'ASCENDING' },
            { field: 'createdAt', order: 'DESCENDING' }
          ],
          description: 'For getting user trips ordered by creation date'
        },
        {
          collection: 'trips',
          fields: [
            { field: 'userId', order: 'ASCENDING' },
            { field: 'status', order: 'ASCENDING' },
            { field: 'updatedAt', order: 'DESCENDING' }
          ],
          description: 'For getting active user trips ordered by update date'
        }
      ],
      autoCreation: 'Indexes will be automatically suggested when needed. Just click the provided link!'
    };
  }

  // User Profile Management
  async getUserProfile(userId) {
    return this.executeFirestoreOperation(async () => {
      const docRef = doc(db, this.collections.userProfiles, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    }, null);
  }

  async updateUserProfile(userId, profileData) {
    return this.executeFirestoreOperation(async () => {
      const docRef = doc(db, this.collections.userProfiles, userId);
      const profileWithMetadata = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, profileWithMetadata, { merge: true });
      console.log('Profile updated successfully');
      return { id: userId, ...profileData };
    });
  }

  async createUserProfile(userId, profileData) {
    return this.executeFirestoreOperation(async () => {
      const docRef = doc(db, this.collections.userProfiles, userId);
      const profileWithMetadata = {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, profileWithMetadata);
      console.log('Profile created successfully');
      return { id: userId, ...profileData };
    });
  }
}

// Create singleton instance
const firestoreService = new FirestoreService();

// React hook for Firestore operations
export const useFirestore = () => {
  return {
    // Trip operations
    saveTrip: (userId, tripData) => firestoreService.saveTrip(userId, tripData),
    getUserTrips: (userId) => firestoreService.getUserTrips(userId),
    getTripById: (tripId) => firestoreService.getTripById(tripId),
    getTrip: (tripId) => firestoreService.getTripById(tripId), // Alias for compatibility
    updateTrip: (tripId, updates) => firestoreService.updateTrip(tripId, updates),
    deleteTrip: (tripId) => firestoreService.deleteTrip(tripId),
    
    // User operations
    createUserProfile: (userId, userData) => firestoreService.createUserProfile(userId, userData),
    getUserProfile: (userId) => firestoreService.getUserProfile(userId),
    updateUserProfile: (userId, updates) => firestoreService.updateUserProfile(userId, updates),
    
    // Collaboration operations
    saveCollaborator: (tripId, collaboratorData) => firestoreService.saveCollaborator(tripId, collaboratorData),
    getTripCollaborators: (tripId) => firestoreService.getTripCollaborators(tripId),

    // Profile operations
    getUserProfile: (userId) => firestoreService.getUserProfile(userId),
    updateUserProfile: (userId, profileData) => firestoreService.updateUserProfile(userId, profileData),
    createUserProfile: (userId, profileData) => firestoreService.createUserProfile(userId, profileData),

    // Utility operations
    checkConnection: () => firestoreService.checkFirestoreConnection(),
    getIndexInfo: () => firestoreService.getIndexCreationInfo()
  };
};

export default firestoreService;
