import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConversations, getUnreadCount } from "@/redux/slices/messagingSlice";
import { MessageCircle, AlertCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ConversationsPage = () => {
  const dispatch = useDispatch();
  const { conversations, conversationsLoading, conversationsError, unreadCount } = useSelector(
    (state) => state.messaging
  );
  const { id: userId, token, userLoaded } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !userLoaded) {
      return;
    }

    dispatch(getConversations({ limit: 20, offset: 0 }));
    dispatch(getUnreadCount());
  }, [dispatch, token, userLoaded]);

  if (conversationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Messages</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Messages</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Error Loading Conversations</h3>
                <p className="text-sm text-gray-600 mt-1">{conversationsError}</p>
              </div>
            </div>
            <Button
              onClick={() => dispatch(getConversations({ limit: 20, offset: 0 }))}
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Messages</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Messages Yet</h2>
            <p className="text-gray-600 mb-6">
              Start chatting with your matches! Go to Discover or Matches to begin conversations.
            </p>
            <Link to="/user/matches">
              <Button>View Matches</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getOtherUser = (conversation) => {
    return conversation.user1Id === userId ? conversation.user2 : conversation.user1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const hasUnread = conversation.lastMessageUserId !== userId;

            return (
              <Link
                key={conversation.id}
                to={`/user/messages/${conversation.id}`}
                className="block"
              >
                <div
                  className={`bg-white rounded-lg border ${
                    hasUnread ? "border-primary/50 bg-primary/5" : "border-gray-200"
                  } p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUser?.profilePic || "/placeholder.png"}
                        alt={otherUser?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-gray-900 ${hasUnread ? "text-primary" : ""}`}>
                        {otherUser?.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
