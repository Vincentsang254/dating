import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserMatches } from "@/redux/slices/matchingSlice";
import { getOrCreateConversation, setCurrentConversation } from "@/redux/slices/messagingSlice";
import { MessageCircle, AlertCircle, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MatchesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { matches, matchesLoading, matchesError } = useSelector((state) => state.matching);

  useEffect(() => {
    dispatch(getUserMatches());
  }, [dispatch]);

  const handleStartChat = async (otherUserId) => {
    try {
      const resultAction = await dispatch(getOrCreateConversation(otherUserId));
      if (getOrCreateConversation.fulfilled.match(resultAction)) {
        dispatch(setCurrentConversation(resultAction.payload));
        navigate(`/user/messages/${resultAction.payload.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  if (matchesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Matches</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading matches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (matchesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Matches</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Error Loading Matches</h3>
                <p className="text-sm text-gray-600 mt-1">{matchesError}</p>
              </div>
            </div>
            <Button
              onClick={() => dispatch(getUserMatches())}
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Matches</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Matches Yet</h2>
            <p className="text-gray-600 mb-6">
              Start liking profiles to find your matches. When someone likes you back, it's a match!
            </p>
            <Link to="/user/dashboard">
              <Button>Start Discovering</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-gray-600">
            You have {matches.length} matching {matches.length === 1 ? "connection" : "connections"}
          </p>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            const otherUser = match.otherUser;
            return (
              <div
                key={match.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={otherUser?.profilePic || "/placeholder.png"}
                    alt={otherUser?.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {otherUser?.name}
                    {otherUser?.age && `, ${otherUser.age}`}
                  </h3>
                  {otherUser?.location && (
                    <p className="text-sm text-gray-600 mt-1">{otherUser.location}</p>
                  )}

                  {/* Bio Preview */}
                  {otherUser?.bio && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {otherUser.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleStartChat(otherUser?.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send Message
                    </Button>
                    <Link to={`/user/profile/${otherUser?.id}`}>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchesPage;
