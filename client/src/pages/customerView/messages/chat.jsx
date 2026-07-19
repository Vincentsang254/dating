import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
import CallModal from "@/components/customerView/messages/call-modal";

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [presenceInfo, setPresenceInfo] = useState({ status: "offline", lastSeenAt: null });
  const [activeCall, setActiveCallUi] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionState, setConnectionState] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const messagesEndRef = useRef(null);
  const mediaRecorder = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const pendingCallRef = useRef(null);

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

    socketService.onCallAccepted(async (data) => {
      console.log("call accepted event", data);
      // Caller receives this when receiver accepted. Start WebRTC offer generation.
      setActiveCallUi((prev) => prev ? { ...prev, callId: data.callId } : prev);
      try {
        if (!peerConnectionRef.current) {
          await createPeerConnection(activeCall?.type || "voice");
        }
        const pc = peerConnectionRef.current;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.emitCallOffer({
          recipientId: activeCall?.recipientId,
          callId: data.callId,
          sdp: offer,
          callType: activeCall?.type || "voice",
        });
        setConnectionState("connecting");
      } catch (err) {
        console.error("Failed to create offer after accept", err);
        clearCallState();
        setActiveCallUi(null);
      }

      if (!callTimerRef.current) {
        callTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    });

    socketService.onCallRejected((data) => {
      setConnectionState("idle");
      setActiveCallUi(null);
      clearCallState();
    });

    socketService.onCallEnded(() => {
      setConnectionState("idle");
      setActiveCallUi(null);
      clearCallState();
    });

    socketService.onCallOffer(async (data) => {
      // Received an offer from caller
      console.log('received call offer', data);
      pendingCallRef.current = data;
      // If the user already accepted (clicked accept), create answer
      if (activeCall && activeCall.callId === data.callId) {
        try {
          if (!peerConnectionRef.current) {
            await createPeerConnection(data.callType === 'video' ? 'video' : 'voice');
          }
          const pc = peerConnectionRef.current;
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketService.emitCallAnswer({ recipientId: data.senderId, callId: data.callId, sdp: answer });
          setConnectionState('connected');
        } catch (err) {
          console.error('Failed to handle incoming offer', err);
          clearCallState();
          setActiveCallUi(null);
        }
      } else {
        // Show incoming UI (if not already)
        setActiveCallUi({ callId: data.callId, type: data.callType === 'video' ? 'video' : 'voice', recipientId: data.senderId, isCaller: false });
        setConnectionState('connecting');
      }
    });

    socketService.onCallAnswer((data) => {
      console.log('received call answer', data);
      if (peerConnectionRef.current && data.sdp) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
          setConnectionState('connected');
        }).catch((err) => console.error('setRemoteDescription failed', err));
      }
    });

    socketService.onCallIceCandidate((data) => {
      // add incoming remote ICE candidate
      try {
        if (peerConnectionRef.current && data.candidate) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch((err) => {
            console.error('addIceCandidate error', err);
          });
        }
      } catch (err) {
        console.error('onCallIceCandidate handler error', err);
      }
    });

    socketService.onCallIceCandidate((data) => {
      if (peerConnectionRef.current && data.candidate) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socketService.removeEventListener("message_receive");
      socketService.removeEventListener("call_incoming");
      socketService.removeEventListener("user_typing");
      socketService.removeEventListener("user_stop_typing");
      socketService.removeEventListener("call_accepted");
      socketService.removeEventListener("call_rejected");
      socketService.removeEventListener("call_ended");
      socketService.removeEventListener("call_offer");
      socketService.removeEventListener("call_answer");
      socketService.removeEventListener("call_ice_candidate");
    };
  }, [token, userId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

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

  const clearCallState = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setConnectionState("idle");
  };

  const createPeerConnection = async (callType) => {
    const configuration = { iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] };
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });
    streamRef.current = stream;
    setLocalStream(stream);

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      const [remoteStreamObj] = event.streams;
      setRemoteStream(remoteStreamObj);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emitCallIceCandidate({
          recipientId: activeCall?.recipientId,
          callId: activeCall?.callId,
          candidate: event.candidate && event.candidate.toJSON ? event.candidate.toJSON() : event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setConnectionState("connected");
      } else if (pc.connectionState === "connecting") {
        setConnectionState("connecting");
      }
    };

    return pc;
  };

  const handleStartVoiceCall = async () => {
    if (!userFeatures.features.voiceCalls) {
      alert("Voice calls are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }
    const recipientId = otherUser?.id || (currentConversation?.user1Id === userId
      ? currentConversation?.user2Id
      : currentConversation?.user1Id);
    const callId = `call_${Date.now()}`;
    const nextCall = { callId, type: "voice", recipientId, isCaller: true };
    setActiveCallUi(nextCall);
    setConnectionState("ringing");
    dispatch(setActiveCall({ callId, type: "voice", recipientId }));

    socketService.emitCallInitiate({
      callId,
      callType: "voice",
      recipientId,
      senderId: userId,
    });

    // auto-cancel if not answered in 30s
    const timeout = setTimeout(() => {
      socketService.emitCallEnd({ recipientId, callId });
      clearCallState();
      setActiveCallUi(null);
      alert('Call timed out');
    }, 30000);
    // store timer so it can be cleared when accepted/rejected
    if (callTimerRef.current) clearTimeout(callTimerRef.current);
    callTimerRef.current = timeout;
  };

  const handleStartVideoCall = async () => {
    if (!userFeatures.features.videoCalls) {
      alert("Video calls are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }
    const recipientId = otherUser?.id || (currentConversation?.user1Id === userId
      ? currentConversation?.user2Id
      : currentConversation?.user1Id);
    const callId = `call_${Date.now()}`;
    const nextCall = { callId, type: "video", recipientId, isCaller: true };
    setActiveCallUi(nextCall);
    setConnectionState("ringing");
    dispatch(setActiveCall({ callId, type: "video", recipientId }));

    socketService.emitCallInitiate({
      callId,
      callType: "video",
      recipientId,
      senderId: userId,
    });

    // auto-cancel if not answered in 30s
    const timeout = setTimeout(() => {
      socketService.emitCallEnd({ recipientId, callId });
      clearCallState();
      setActiveCallUi(null);
      alert('Call timed out');
    }, 30000);
    if (callTimerRef.current) clearTimeout(callTimerRef.current);
    callTimerRef.current = timeout;
  };

  const resetVoiceRecorder = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
    mediaRecorder.current = null;
    setVoiceRecording(false);
    setRecordingTime(0);
    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
  };

  const handleSendVoiceMessage = async () => {
    if (!userFeatures.features.voiceMessages) {
      alert("Voice messages are available for Premium users only. Subscribe to unlock this feature!");
      return;
    }

    if (voiceRecording) {
      mediaRecorder.current?.stop();
      setVoiceRecording(false);
      return;
    }

    if (recordedAudioBlob) {
      setIsUploadingVoice(true);
      try {
        const formData = new FormData();
        formData.append("audio", recordedAudioBlob, "voice-message.webm");

        const uploadResponse = await axios.post(`${import.meta.env.VITE_API_URL || "https://dating-rpig.onrender.com/api"}/messaging/messages/voice`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        await dispatch(
          sendMessage({
            conversationId: parseInt(conversationId),
            content: uploadResponse.data.data.url,
            messageType: "voice",
            mediaUrl: uploadResponse.data.data.url,
            mediaType: "audio/webm",
            duration: recordingTime,
          })
        );

        resetVoiceRecorder();
      } catch (error) {
        console.error("Failed to upload voice message:", error);
        alert("Unable to upload voice message right now.");
      } finally {
        setIsUploadingVoice(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.current?.mimeType || "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.current.start();
      setVoiceRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please enable microphone access to send voice messages");
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
                // Inform server that we're accepting; caller will generate offer
                socketService.emitCallAccept({ senderId: incomingCall.senderId, callId: incomingCall.callId });
                dispatch(clearIncomingCall());
                setActiveCallUi({ callId: incomingCall.callId, type: incomingCall.callType === 'video' ? 'video' : 'voice', recipientId: incomingCall.senderId, isCaller: false });
                setConnectionState('connecting');
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
                clearCallState();
                setActiveCallUi(null);
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
                {message.messageType === "voice" || message.mediaType?.startsWith("audio/") || message.content?.startsWith("data:audio/") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-base">
                        🎤
                      </span>
                      <span>Voice message</span>
                    </div>
                    <audio controls className="w-full max-w-[220px]" src={message.mediaUrl || message.content} />
                    {message.duration ? <p className="text-xs opacity-80">{message.duration}s</p> : null}
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

      <CallModal
        isOpen={Boolean(activeCall)}
        role={activeCall?.isCaller ? "caller" : "receiver"}
        callType={activeCall?.type || "audio"}
        remoteName={otherUser?.name || "Connecting"}
        localStream={localStream}
        remoteStream={remoteStream}
        connectionState={connectionState}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        callDuration={new Date(callDuration * 1000).toISOString().slice(14, 19)}
        onAccept={() => {
          // receiver accept handled by incomingCall flow; included here for safety
          socketService.emitCallAccept({ senderId: activeCall?.recipientId, callId: activeCall?.callId });
        }}
        onReject={() => {
          socketService.emitCallReject({ senderId: activeCall?.recipientId, callId: activeCall?.callId });
          clearCallState();
          setActiveCallUi(null);
        }}
        onCancel={() => {
          // caller cancels while ringing
          socketService.emitCallEnd({ recipientId: activeCall?.recipientId, callId: activeCall?.callId });
          clearCallState();
          setActiveCallUi(null);
        }}
        onEnd={() => {
          socketService.emitCallEnd({ recipientId: activeCall?.recipientId, callId: activeCall?.callId });
          clearCallState();
          setActiveCallUi(null);
        }}
        onToggleMute={() => {
          if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((track) => {
              track.enabled = !track.enabled;
            });
          }
          setIsMuted((prev) => !prev);
        }}
        onToggleCamera={() => {
          if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((track) => {
              track.enabled = !track.enabled;
            });
          }
          setIsCameraOff((prev) => !prev);
        }}
        onSwitchCamera={() => {
          if (streamRef.current?.getVideoTracks().length) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            videoTrack.applyConstraints({ facingMode: videoTrack.getSettings().facingMode === "user" ? { exact: "environment" } : { exact: "user" } });
          }
        }}
      />

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex items-center gap-2">
            {voiceRecording && (
              <span className="text-sm font-medium text-red-600">
                {recordingTime}s
              </span>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSendVoiceMessage}
              disabled={!userFeatures.features.voiceMessages || isUploadingVoice}
              className={voiceRecording ? "bg-red-100 text-red-600" : ""}
            >
              <Mic className="w-4 h-4" />
            </Button>
            {(voiceRecording || recordedAudioBlob) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetVoiceRecorder}
              >
                Cancel
              </Button>
            )}
          </div>
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
