import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, 
  ShareIcon,
  HeartIcon,
  XMarkIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const CollaborativePlanner = ({ tripPlan, onTripUpdate }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Mock collaborators data
  useEffect(() => {
    setCollaborators([
      { id: 1, name: 'You', avatar: '👤', isOwner: true },
      { id: 2, name: 'Priya', avatar: '👩', isOwner: false },
      { id: 3, name: 'Rahul', avatar: '👨', isOwner: false },
      { id: 4, name: 'Sneha', avatar: '👩‍🦱', isOwner: false }
    ]);

    // Generate mock share link
    setShareLink(`https://tripcraft.ai/shared/${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Handle voting on activities
  const handleVote = (activityId, vote) => {
    setVotes(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [vote]: (prev[activityId]?.[vote] || 0) + 1
      }
    }));
    
    toast.success(`Voted ${vote === 'like' ? '👍' : '👎'} for activity!`);
  };

  // Handle comments
  const handleAddComment = (activityId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: 'You',
      avatar: '👤',
      text: newComment,
      timestamp: new Date()
    };
    
    setComments(prev => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), comment]
    }));
    
    setNewComment('');
    toast.success('Comment added!');
  };

  // Generate shareable link
  const generateShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Share link copied to clipboard!');
  };

  // Get vote summary for an activity
  const getVoteSummary = (activityId) => {
    const activityVotes = votes[activityId] || {};
    const likes = activityVotes.like || 0;
    const dislikes = activityVotes.dislike || 0;
    const total = likes + dislikes;
    
    return { likes, dislikes, total, score: total > 0 ? (likes / total) * 100 : 0 };
  };

  // Get activity popularity color
  const getPopularityColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <UserGroupIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Collaborative Planning</h3>
            <p className="text-sm text-gray-600">Plan together with friends and family</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Collaborators */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Trip Collaborators ({collaborators.length})</h4>
        <div className="flex items-center space-x-3">
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-2xl">{collaborator.avatar}</span>
              <div>
                <p className="text-sm font-medium">{collaborator.name}</p>
                {collaborator.isOwner && (
                  <p className="text-xs text-purple-600">Owner</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voting on Activities */}
      {tripPlan?.itinerary && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Vote on Activities</h4>
          <div className="space-y-4">
            {tripPlan.itinerary.slice(0, 2).map((day, dayIndex) => (
              <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Day {day.day}</h5>
                <div className="space-y-3">
                  {day.activities?.slice(0, 2).map((activity, actIndex) => {
                    const activityId = `${dayIndex}-${actIndex}`;
                    const voteSummary = getVoteSummary(activityId);
                    
                    return (
                      <div key={actIndex} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium text-sm">{activity.placeName}</h6>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPopularityColor(voteSummary.score)}`}>
                            {voteSummary.score.toFixed(0)}% liked
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleVote(activityId, 'like')}
                              className="flex items-center space-x-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                            >
                              <HeartIcon className="w-4 h-4" />
                              <span className="text-sm">{voteSummary.likes}</span>
                            </button>
                            
                            <button
                              onClick={() => handleVote(activityId, 'dislike')}
                              className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              <span className="text-sm">{voteSummary.dislikes}</span>
                            </button>
                            
                            <button
                              onClick={() => setSelectedActivity(activityId)}
                              className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                              <ChatBubbleLeftRightIcon className="w-4 h-4" />
                              <span className="text-sm">{comments[activityId]?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Comments Section */}
                        {selectedActivity === activityId && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-200"
                          >
                            <div className="space-y-2 mb-3">
                              {comments[activityId]?.map((comment) => (
                                <div key={comment.id} className="flex items-start space-x-2 p-2 bg-white rounded">
                                  <span className="text-sm">{comment.avatar}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-medium">{comment.user}</span>
                                      <span className="text-xs text-gray-500">
                                        {comment.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(activityId)}
                              />
                              <button
                                onClick={() => handleAddComment(activityId)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Preferences Summary */}
      <div className="p-4 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">👥 Group Insights</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-purple-800">Most Popular Activities</p>
            <p className="text-purple-600">Beach visits, Local cuisine</p>
          </div>
          <div>
            <p className="text-purple-800">Group Consensus</p>
            <p className="text-purple-600">85% agreement on itinerary</p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Trip Plan</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Share this link with friends to collaborate on your trip planning
              </p>
              
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg mb-4">
                <LinkIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={generateShareLink}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    // Share via Web Share API if available
                    if (navigator.share) {
                      navigator.share({
                        title: 'Trip Plan',
                        text: 'Check out our trip plan!',
                        url: shareLink
                      });
                    } else {
                      generateShareLink();
                    }
                  }}
                  className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborativePlanner;
