import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../service/firebaseConfig';
import { useTelemetry } from './telemetryService';

class CollaborationService {
  constructor() {
    this.activeListeners = new Map();
    this.collaboratorCache = new Map();
    this.votingCache = new Map();
  }

  // Invite collaborators to a trip
  async inviteCollaborators(tripId, invitations, inviterInfo) {
    try {
      const inviteResults = [];
      
      for (const invitation of invitations) {
        const inviteId = `${tripId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const inviteData = {
          id: inviteId,
          tripId: tripId,
          inviterUserId: inviterInfo.userId,
          inviterName: inviterInfo.name,
          inviterEmail: inviterInfo.email,
          inviteeEmail: invitation.email,
          inviteeName: invitation.name || invitation.email,
          role: invitation.role || 'editor', // owner, editor, viewer
          status: 'pending', // pending, accepted, declined
          permissions: this.getRolePermissions(invitation.role || 'editor'),
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          message: invitation.message || `Join me in planning our trip!`
        };

        // Save invitation to database
        await setDoc(doc(db, 'tripInvitations', inviteId), inviteData);
        
        // Send invitation (email/notification)
        await this.sendInvitationNotification(inviteData);
        
        inviteResults.push({
          email: invitation.email,
          inviteId: inviteId,
          status: 'sent'
        });
      }

      return {
        success: true,
        invitations: inviteResults,
        totalSent: inviteResults.length
      };
    } catch (error) {
      console.error('Error inviting collaborators:', error);
      throw new Error(`Failed to send invitations: ${error.message}`);
    }
  }

  // Accept trip invitation
  async acceptInvitation(inviteId, userInfo) {
    try {
      const inviteRef = doc(db, 'tripInvitations', inviteId);
      const inviteSnap = await getDoc(inviteRef);
      
      if (!inviteSnap.exists()) {
        throw new Error('Invitation not found');
      }

      const inviteData = inviteSnap.data();
      
      // Check if invitation is still valid
      if (inviteData.status !== 'pending') {
        throw new Error('Invitation is no longer valid');
      }
      
      if (new Date(inviteData.expiresAt) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Update invitation status
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        acceptedByUserId: userInfo.userId
      });

      // Add user as collaborator to the trip
      const collaboratorData = {
        userId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name,
        photoURL: userInfo.photoURL || null,
        role: inviteData.role,
        permissions: inviteData.permissions,
        joinedAt: new Date().toISOString(),
        status: 'active',
        lastActive: new Date().toISOString()
      };

      await setDoc(
        doc(db, 'tripCollaborators', `${inviteData.tripId}_${userInfo.userId}`),
        collaboratorData
      );

      // Log activity
      await this.logActivity(inviteData.tripId, {
        type: 'collaborator_joined',
        userId: userInfo.userId,
        userName: userInfo.name,
        details: { role: inviteData.role }
      });

      return {
        success: true,
        tripId: inviteData.tripId,
        role: inviteData.role,
        permissions: inviteData.permissions
      };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  // Get trip collaborators
  async getTripCollaborators(tripId) {
    try {
      const cacheKey = `collaborators_${tripId}`;
      
      // Check cache first
      if (this.collaboratorCache.has(cacheKey)) {
        const cached = this.collaboratorCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
          return cached.data;
        }
      }

      const collaboratorsQuery = query(
        collection(db, 'tripCollaborators'),
        where('tripId', '==', tripId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(collaboratorsQuery);
      const collaborators = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache the result
      this.collaboratorCache.set(cacheKey, {
        data: collaborators,
        timestamp: Date.now()
      });

      return collaborators;
    } catch (error) {
      console.error('Error getting trip collaborators:', error);
      throw error;
    }
  }

  // Start real-time collaboration session
  startCollaborationSession(tripId, userId, onUpdate) {
    const sessionKey = `${tripId}_${userId}`;
    
    // Clean up existing listener
    if (this.activeListeners.has(sessionKey)) {
      this.activeListeners.get(sessionKey)();
    }

    // Set up real-time listeners
    const listeners = [];

    // Listen to collaborator changes
    const collaboratorsQuery = query(
      collection(db, 'tripCollaborators'),
      where('tripId', '==', tripId)
    );
    
    const collaboratorsUnsubscribe = onSnapshot(collaboratorsQuery, (snapshot) => {
      const collaborators = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      onUpdate({
        type: 'collaborators_updated',
        data: collaborators
      });
    });
    listeners.push(collaboratorsUnsubscribe);

    // Listen to activity feed
    const activityQuery = query(
      collection(db, 'tripActivities'),
      where('tripId', '==', tripId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const activityUnsubscribe = onSnapshot(activityQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      onUpdate({
        type: 'activity_feed_updated',
        data: activities
      });
    });
    listeners.push(activityUnsubscribe);

    // Listen to votes
    const votesQuery = query(
      collection(db, 'tripVotes'),
      where('tripId', '==', tripId)
    );
    
    const votesUnsubscribe = onSnapshot(votesQuery, (snapshot) => {
      const votes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      onUpdate({
        type: 'votes_updated',
        data: votes
      });
    });
    listeners.push(votesUnsubscribe);

    // Store cleanup function
    this.activeListeners.set(sessionKey, () => {
      listeners.forEach(unsubscribe => unsubscribe());
    });

    return () => {
      if (this.activeListeners.has(sessionKey)) {
        this.activeListeners.get(sessionKey)();
        this.activeListeners.delete(sessionKey);
      }
    };
  }

  // Cast vote on trip item
  async castVote(tripId, itemId, itemType, vote, userId, comment = null) {
    try {
      const voteId = `${tripId}_${itemId}_${userId}`;
      
      const voteData = {
        id: voteId,
        tripId: tripId,
        itemId: itemId,
        itemType: itemType, // activity, place, day, accommodation
        userId: userId,
        vote: vote, // up, down, neutral
        comment: comment,
        timestamp: new Date().toISOString()
      };

      // Save or update vote
      await setDoc(doc(db, 'tripVotes', voteId), voteData);

      // Update vote summary
      await this.updateVoteSummary(tripId, itemId, itemType);

      // Log activity
      await this.logActivity(tripId, {
        type: 'vote_cast',
        userId: userId,
        details: { itemId, itemType, vote, comment }
      });

      return {
        success: true,
        voteId: voteId,
        vote: vote
      };
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }

  // Get voting summary for items
  async getVotingSummary(tripId, itemIds = []) {
    try {
      const cacheKey = `votes_${tripId}`;
      
      let votesQuery;
      if (itemIds.length > 0) {
        votesQuery = query(
          collection(db, 'tripVotes'),
          where('tripId', '==', tripId),
          where('itemId', 'in', itemIds)
        );
      } else {
        votesQuery = query(
          collection(db, 'tripVotes'),
          where('tripId', '==', tripId)
        );
      }

      const snapshot = await getDocs(votesQuery);
      const votes = snapshot.docs.map(doc => doc.data());

      // Group votes by item
      const voteSummary = {};
      votes.forEach(vote => {
        if (!voteSummary[vote.itemId]) {
          voteSummary[vote.itemId] = {
            itemId: vote.itemId,
            itemType: vote.itemType,
            upVotes: 0,
            downVotes: 0,
            neutralVotes: 0,
            totalVotes: 0,
            score: 0,
            consensus: 'neutral',
            comments: []
          };
        }

        const summary = voteSummary[vote.itemId];
        summary.totalVotes++;
        
        if (vote.vote === 'up') summary.upVotes++;
        else if (vote.vote === 'down') summary.downVotes++;
        else summary.neutralVotes++;

        if (vote.comment) {
          summary.comments.push({
            userId: vote.userId,
            comment: vote.comment,
            vote: vote.vote,
            timestamp: vote.timestamp
          });
        }
      });

      // Calculate scores and consensus
      Object.values(voteSummary).forEach(summary => {
        summary.score = summary.upVotes - summary.downVotes;
        
        const upPercentage = summary.upVotes / summary.totalVotes;
        const downPercentage = summary.downVotes / summary.totalVotes;
        
        if (upPercentage >= 0.7) summary.consensus = 'strong_yes';
        else if (upPercentage >= 0.5) summary.consensus = 'yes';
        else if (downPercentage >= 0.7) summary.consensus = 'strong_no';
        else if (downPercentage >= 0.5) summary.consensus = 'no';
        else summary.consensus = 'neutral';
      });

      return voteSummary;
    } catch (error) {
      console.error('Error getting voting summary:', error);
      throw error;
    }
  }

  // Apply votes to itinerary (reorder based on popularity)
  async applyVotesToItinerary(tripId, itinerary) {
    try {
      const votingSummary = await this.getVotingSummary(tripId);
      
      // Apply votes to each day's activities
      const updatedItinerary = { ...itinerary };
      
      updatedItinerary.itinerary = itinerary.itinerary.map(day => {
        if (!day.activities) return day;
        
        // Sort activities by vote score
        const sortedActivities = [...day.activities].sort((a, b) => {
          const aVotes = votingSummary[a.id] || { score: 0 };
          const bVotes = votingSummary[b.id] || { score: 0 };
          return bVotes.score - aVotes.score;
        });

        return {
          ...day,
          activities: sortedActivities,
          votingSummary: day.activities.reduce((summary, activity) => {
            if (votingSummary[activity.id]) {
              summary[activity.id] = votingSummary[activity.id];
            }
            return summary;
          }, {})
        };
      });

      // Log activity
      await this.logActivity(tripId, {
        type: 'votes_applied',
        details: { totalItems: Object.keys(votingSummary).length }
      });

      return updatedItinerary;
    } catch (error) {
      console.error('Error applying votes to itinerary:', error);
      throw error;
    }
  }

  // Get activity feed for trip
  async getActivityFeed(tripId, limit = 50) {
    try {
      const activityQuery = query(
        collection(db, 'tripActivities'),
        where('tripId', '==', tripId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(activityQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting activity feed:', error);
      throw error;
    }
  }

  // Helper methods
  getRolePermissions(role) {
    const permissions = {
      owner: {
        canEdit: true,
        canDelete: true,
        canInvite: true,
        canManageRoles: true,
        canExport: true,
        canVote: true
      },
      editor: {
        canEdit: true,
        canDelete: false,
        canInvite: true,
        canManageRoles: false,
        canExport: true,
        canVote: true
      },
      viewer: {
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageRoles: false,
        canExport: true,
        canVote: true
      }
    };

    return permissions[role] || permissions.viewer;
  }

  async sendInvitationNotification(inviteData) {
    // This would integrate with email service or push notifications
    console.log('Sending invitation to:', inviteData.inviteeEmail);
    
    // In a real implementation, this would:
    // 1. Send email with invitation link
    // 2. Send push notification if user has the app
    // 3. Create in-app notification
    
    return true;
  }

  async logActivity(tripId, activity) {
    try {
      const activityData = {
        tripId: tripId,
        type: activity.type,
        userId: activity.userId,
        userName: activity.userName,
        details: activity.details || {},
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'tripActivities'), activityData);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async updateVoteSummary(tripId, itemId, itemType) {
    // This would update cached vote summaries for performance
    // Implementation would depend on specific caching strategy
  }

  // Clean up resources
  cleanup() {
    // Clean up all active listeners
    this.activeListeners.forEach(cleanup => cleanup());
    this.activeListeners.clear();
    
    // Clear caches
    this.collaboratorCache.clear();
    this.votingCache.clear();
  }
}

// Create singleton instance
const collaborationService = new CollaborationService();

// React hook for collaboration service
export const useCollaborationService = () => {
  const telemetry = useTelemetry();

  return {
    inviteCollaborators: async (tripId, invitations, inviterInfo) => {
      try {
        telemetry.trackCollaborationInvited(tripId, invitations.length, 'email');
        const result = await collaborationService.inviteCollaborators(tripId, invitations, inviterInfo);
        telemetry.trackEvent('collaboration_invites_sent', { 
          tripId, 
          inviteCount: result.totalSent 
        });
        return result;
      } catch (error) {
        telemetry.trackError(error, { action: 'inviteCollaborators', tripId });
        throw error;
      }
    },

    acceptInvitation: async (inviteId, userInfo) => {
      try {
        const result = await collaborationService.acceptInvitation(inviteId, userInfo);
        telemetry.trackEvent('invitation_accepted', { 
          inviteId, 
          tripId: result.tripId, 
          role: result.role 
        });
        return result;
      } catch (error) {
        telemetry.trackError(error, { action: 'acceptInvitation', inviteId });
        throw error;
      }
    },

    getTripCollaborators: async (tripId) => {
      try {
        return await collaborationService.getTripCollaborators(tripId);
      } catch (error) {
        telemetry.trackError(error, { action: 'getTripCollaborators', tripId });
        throw error;
      }
    },

    startCollaborationSession: (tripId, userId, onUpdate) => {
      telemetry.trackEvent('collaboration_session_started', { tripId, userId });
      return collaborationService.startCollaborationSession(tripId, userId, onUpdate);
    },

    castVote: async (tripId, itemId, itemType, vote, userId, comment) => {
      try {
        telemetry.trackVoteCast(userId, tripId, itemId, itemType, vote);
        return await collaborationService.castVote(tripId, itemId, itemType, vote, userId, comment);
      } catch (error) {
        telemetry.trackError(error, { action: 'castVote', tripId, itemId });
        throw error;
      }
    },

    getVotingSummary: async (tripId, itemIds) => {
      try {
        return await collaborationService.getVotingSummary(tripId, itemIds);
      } catch (error) {
        telemetry.trackError(error, { action: 'getVotingSummary', tripId });
        throw error;
      }
    },

    applyVotesToItinerary: async (tripId, itinerary) => {
      try {
        const result = await collaborationService.applyVotesToItinerary(tripId, itinerary);
        telemetry.trackEvent('votes_applied_to_itinerary', { tripId });
        return result;
      } catch (error) {
        telemetry.trackError(error, { action: 'applyVotesToItinerary', tripId });
        throw error;
      }
    },

    getActivityFeed: async (tripId, limit) => {
      try {
        return await collaborationService.getActivityFeed(tripId, limit);
      } catch (error) {
        telemetry.trackError(error, { action: 'getActivityFeed', tripId });
        throw error;
      }
    }
  };
};

export default collaborationService;
