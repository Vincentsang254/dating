import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import socketService from "@/services/socketService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Async Thunks
export const getConversations = createAsyncThunk(
  "messaging/getConversations",
  async ({ limit = 10, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/messaging/conversations?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch conversations");
    }
  }
);

export const getOrCreateConversation = createAsyncThunk(
  "messaging/getOrCreateConversation",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/messaging/conversations`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to create conversation");
    }
  }
);

export const getMessages = createAsyncThunk(
  "messaging/getMessages",
  async ({ conversationId, limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/messaging/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return { conversationId, messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch messages");
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async ({ conversationId, content }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(
        `${API_URL}/messaging/messages`,
        { conversationId, content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      
      // Emit via Socket.IO for real-time updates
      const state = getState();
      const recipientId = state.messaging.currentConversation?.user1Id === state.auth.id 
        ? state.messaging.currentConversation?.user2Id 
        : state.messaging.currentConversation?.user1Id;
      
      socketService.emitMessageSend({
        conversationId,
        recipientId,
        ...response.data.data,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to send message");
    }
  }
);

export const markAsRead = createAsyncThunk(
  "messaging/markAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/messaging/mark-read`,
        { conversationId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to mark as read");
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "messaging/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/messaging/unread-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return response.data.data.unreadCount;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch unread count");
    }
  }
);

export const deleteConversation = createAsyncThunk(
  "messaging/deleteConversation",
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/messaging/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete conversation");
    }
  }
);

// Initial State
const initialState = {
  // Conversations
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,

  // Current Conversation
  currentConversation: null,
  currentConversationLoading: false,
  currentConversationError: null,

  // Messages
  messages: [],
  messagesLoading: false,
  messagesError: null,

  // Calls
  incomingCall: null,
  activeCall: null,
  onlineUsers: [],

  // Premium Features
  userFeatures: {
    isPremium: false,
    features: {
      textMessages: true,
      voiceMessages: false,
      videoCalls: false,
      voiceCalls: false,
      screenShare: false,
    },
  },

  // Typing indicators
  typingUsers: [],

  // General
  unreadCount: 0,
  loading: false,
  error: null,
};

// Messaging Slice
const messagingSlice = createSlice({
  name: "messaging",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage, lastMessageAt } = action.payload;
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = lastMessage;
        conversation.lastMessageAt = lastMessageAt;
      }
    },
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
    },
    clearActiveCall: (state) => {
      state.activeCall = null;
    },
    updateOnlineUsers: (state, action) => {
      const { userId, status } = action.payload;
      if (status === "online") {
        if (!state.onlineUsers.includes(userId)) {
          state.onlineUsers.push(userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
      }
    },
    setUserFeatures: (state, action) => {
      state.userFeatures = action.payload;
    },
    addTypingUser: (state, action) => {
      const userId = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      state.typingUsers = state.typingUsers.filter((id) => id !== userId);
    },
  },
  extraReducers: (builder) => {
    // Get Conversations
    builder
      .addCase(getConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload;
      });

    // Get Or Create Conversation
    builder
      .addCase(getOrCreateConversation.pending, (state) => {
        state.currentConversationLoading = true;
        state.currentConversationError = null;
      })
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        state.currentConversationLoading = false;
        state.currentConversation = action.payload;
        state.messages = [];
      })
      .addCase(getOrCreateConversation.rejected, (state, action) => {
        state.currentConversationLoading = false;
        state.currentConversationError = action.payload;
      });

    // Get Messages
    builder
      .addCase(getMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload;
      });

    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Mark As Read
    builder
      .addCase(markAsRead.fulfilled, (state) => {
        // Update unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });

    // Get Unread Count
    builder
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Delete Conversation
    builder
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          (c) => c.id !== action.payload
        );
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      });
  },
});

export const { 
  clearError, 
  addMessage, 
  updateConversationLastMessage,
  setIncomingCall,
  clearIncomingCall,
  setActiveCall,
  clearActiveCall,
  updateOnlineUsers,
  setUserFeatures,
  addTypingUser,
  removeTypingUser,
} = messagingSlice.actions;

export default messagingSlice.reducer;
