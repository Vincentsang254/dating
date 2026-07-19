import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  addMessage,
  setIncomingCall,
  clearIncomingCall,
  setActiveCall,
  setCurrentConversation,
  setUserFeatures,
  addTypingUser,
  removeTypingUser,
  updateOnlineUsers,
} from "@/redux/slices/messagingSlice";
import { Send, ArrowLeft, AlertCircle, Phone, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import socketService from "@/services/socketService";

const ChatPage = () => {
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { id: userId, token } = useSelector((state) => state.auth);
  const { 
    messages, 
    messagesLoading, 
    messagesError, 
    currentConversation,
    conversations,
    loading,
    userFeatures,
    incomingCall,
    typingUsers,
    onlineUsers,
  } = useSelector((state) => state.messaging);

  const [messageText, setMessageText] = useState("");
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [presenceInfo, setPresenceInfo] = useState({ status: "offline", lastSeenAt: null });
  const messagesEndRef = useRef(null);
  const mediaRecorder = useRef(null);

  useEffect(() => {
    if (conversationId) {
      dispatch(getConversations({ limit: 20, offset: 0 }));
      dispatch(getMessages({ conversationId, limit: 50, offset: 0 }));
      dispatch(markAsRead(parseInt(conversationId)));
    }
  }, [dispatch, conversationId]);

  useEffect(() => {
    if (!conversationId || !conversations?.length) return;

    const matchedConversation = conversations.find((item) => item.id === Number(conversationId));
    if (matchedConversation) {
      dispatch(setCurrentConversation(matchedConversation));
    }
  }, [conversationId, conversations, dispatch]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token && !socketService.connected) {
      socketService.connect(token);
      socketService.emitUserOnline(userId);
    }

    // Listen for incoming messages
    socketService.onMessageReceive((data) => {
      dispatch(addMessage(data));
    });

    // Listen for incoming calls
    socketService.onCallIncoming((data) => {
      dispatch(setIncomingCall(data));
    });

    socketService.onUserStatus((data) => {
      dispatch(updateOnlineUsers(data));
      if (Number(data.userId) === Number(otherUser?.id)) {
        setPresenceInfo({
          status: data.status,
          lastSeenAt: data.lastSeenAt || null,
        });
      }
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      dispatch(addTypingUser(data.senderId));
    });

    socketService.onUserStopTyping((data) => {
      dispatch(removeTypingUser(data.senderId));
    });

    return () => {
      socketService.removeEventListener("message_receive");
      socketService.removeEventListener("call_incoming");
      socketService.removeEventListener("user_typing");
      socketService.removeEventListener("user_stop_typing");
    };
  }, [token, userId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (!userFeatures.features.textMessages) {
      alert("Text messaging not available for your account type");
      return;
    }

    await dispatch(
      sendMessage({
        conversationId: parseInt(conversationId),
        content: messageText,
      })
    );
    setMessageText("");
  };

  const handleStartVoiceCall = () => {
    if (!userFeatures.features.voiceCalls) {
      alert("Voice calls are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }

    const callId = `call_${Date.now()}`;
    const recipientId = otherUser?.id || (currentConversation?.user1Id === userId
      ? currentConversation?.user2Id
      : currentConversation?.user1Id);

    dispatch(setActiveCall({ callId, type: "voice", recipientId }));
    socketService.emitCallInitiate({
      callId,
      callType: "voice",
      recipientId,
      senderId: userId,
    });
  };

  const handleStartVideoCall = () => {
    if (!userFeatures.features.videoCalls) {
      alert("Video calls are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }

    const callId = `call_${Date.now()}`;
    const recipientId = otherUser?.id || (currentConversation?.user1Id === userId
      ? currentConversation?.user2Id
      : currentConversation?.user1Id);

    dispatch(setActiveCall({ callId, type: "video", recipientId }));
    socketService.emitCallInitiate({
      callId,
      callType: "video",
      recipientId,
      senderId: userId,
    });
  };

  const handleSendVoiceMessage = async () => {
    if (!userFeatures.features.voiceMessages) {
      alert("Voice messages are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }

    if (voiceRecording) {
      mediaRecorder.current?.stop();
      setVoiceRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        
        const audioChunks = [];
        mediaRecorder.current.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };

        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks, {
            type: mediaRecorder.current?.mimeType || "audio/webm",
          });

          try {
            const audioUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(audioBlob);
            });

            await dispatch(
              sendMessage({
                conversationId: parseInt(conversationId),
                content: audioUrl,
              })
            );
          } catch (error) {
            console.error("Failed to send voice message:", error);
          } finally {
            stream.getTracks().forEach((track) => track.stop());
          }
        };

        mediaRecorder.current.start();
        setVoiceRecording(true);
      } catch (error) {
        console.error("Microphone access denied:", error);
        alert("Please enable microphone access to send voice messages");
      }
    }
  };

  const getOtherUser = () => {
    const activeConversation = currentConversation || conversations.find((item) => item.id === Number(conversationId));
    if (!activeConversation) return null;
    return activeConversation.user1Id === userId
      ? activeConversation.user2
      : activeConversation.user1;
  };

  const otherUser = getOtherUser();

  useEffect(() => {
    if (!otherUser?.id) {
      setPresenceInfo({ status: "offline", lastSeenAt: null });
      return;
    }

    const isOnline = onlineUsers.includes(Number(otherUser.id));
    setPresenceInfo({
      status: isOnline ? "online" : "offline",
      lastSeenAt: isOnline ? null : presenceInfo.lastSeenAt,
    });
  }, [otherUser?.id, onlineUsers]);

  if (messagesLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 max-w-md w-full p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Error Loading Chat</h3>
              <p className="text-sm text-gray-600 mt-1">{messagesError}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/user/messages")} className="w-full mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Handle incoming call
  if (incomingCall) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {incomingCall.callType === "video" ? "📹" : "📞"} Incoming Call
          </h2>
          <p className="text-gray-600 mb-6">
            {otherUser?.name} is calling you...
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                socketService.emitCallAccept({
                  senderId: incomingCall.senderId,
                  callId: incomingCall.callId,
                });
                dispatch(clearIncomingCall());
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              onClick={() => {
                socketService.emitCallReject({
                  senderId: incomingCall.senderId,
                  callId: incomingCall.callId,
                });
                dispatch(clearIncomingCall());
              }}
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/user/messages")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {otherUser && (
            <div className="flex-1 flex items-center gap-3">
              <img
                src={otherUser.profilePic || "/placeholder.png"}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
                <p className="text-xs text-gray-500">
                  {typingUsers.length > 0
                    ? "typing..."
                    : presenceInfo.status === "online"
                      ? "Online"
                      : presenceInfo.lastSeenAt
                        ? `Last seen at ${new Date(presenceInfo.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Offline"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Call buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartVoiceCall}
            disabled={!userFeatures.features.voiceCalls}
            title={!userFeatures.features.voiceCalls ? "Premium feature" : "Start voice call"}
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleStartVideoCall}
            disabled={!userFeatures.features.videoCalls}
            title={!userFeatures.features.videoCalls ? "Premium feature" : "Start video call"}
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages?.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === userId
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                {message.content?.startsWith("data:audio/") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-base">
                        🎤
                      </span>
                      <span>Voice message</span>
                    </div>
                    <audio controls className="w-full max-w-[220px]">
                      <source src={message.content} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  <p className="text-sm break-words">{message.content}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === userId ? "text-primary/70" : "text-gray-500"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSendVoiceMessage}
            disabled={!userFeatures.features.voiceMessages}
            className={voiceRecording ? "bg-red-100 text-red-600" : ""}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !messageText.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
        {!userFeatures.features.voiceMessages && (
          <p className="text-xs text-gray-500 mt-2">
            💎 Voice messages available for Premium users
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
