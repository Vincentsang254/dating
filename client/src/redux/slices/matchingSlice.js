import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url as API_URL } from "./api";

// Async Thunks
export const discoverUsers = createAsyncThunk(
  "matching/discoverUsers",
  async ({ limit = 10, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/matching/discover?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to discover users");
    }
  }
);

export const likeUser = createAsyncThunk(
  "matching/likeUser",
  async (likedUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/matching/like`,
        { likedUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to like user");
    }
  }
);

export const unlikeUser = createAsyncThunk(
  "matching/unlikeUser",
  async (likedUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/matching/unlike`,
        { likedUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to unlike user");
    }
  }
);

export const getUserLikes = createAsyncThunk(
  "matching/getUserLikes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/matching/likes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch user likes");
    }
  }
);

export const getLikesReceived = createAsyncThunk(
  "matching/getLikesReceived",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/matching/likes-received`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch received likes");
    }
  }
);

export const getUserMatches = createAsyncThunk(
  "matching/getUserMatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/matching/matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch matches");
    }
  }
);

export const checkMatch = createAsyncThunk(
  "matching/checkMatch",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/matching/check-match/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to check match");
    }
  }
);

// Initial State
const initialState = {
  // Discover
  discoverUsers: [],
  currentDiscoverIndex: 0,
  discoverLoading: false,
  discoverError: null,

  // Likes
  userLikes: [],
  likesLoading: false,
  likesError: null,

  // Likes Received
  likesReceived: [],
  likesReceivedLoading: false,
  likesReceivedError: null,

  // Matches
  matches: [],
  matchesLoading: false,
  matchesError: null,

  // General
  loading: false,
  error: null,
};

// Matching Slice
const matchingSlice = createSlice({
  name: "matching",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDiscoverError: (state) => {
      state.discoverError = null;
    },
    nextDiscoverUser: (state) => {
      state.currentDiscoverIndex += 1;
    },
    resetDiscoverIndex: (state) => {
      state.currentDiscoverIndex = 0;
    },
  },
  extraReducers: (builder) => {
    // Discover Users
    builder
      .addCase(discoverUsers.pending, (state) => {
        state.discoverLoading = true;
        state.discoverError = null;
      })
      .addCase(discoverUsers.fulfilled, (state, action) => {
        state.discoverLoading = false;
        state.discoverUsers = action.payload;
        state.currentDiscoverIndex = 0;
      })
      .addCase(discoverUsers.rejected, (state, action) => {
        state.discoverLoading = false;
        state.discoverError = action.payload;
      });

    // Like User
    builder
      .addCase(likeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeUser.fulfilled, (state, action) => {
        state.loading = false;
        // If it's a match, add to matches
        if (action.payload.isMatch) {
          state.matches.push(action.payload.like);
        }
        // Move to next user in discover
        state.currentDiscoverIndex += 1;
      })
      .addCase(likeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Unlike User
    builder
      .addCase(unlikeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikeUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from userLikes if present
        state.userLikes = state.userLikes.filter(
          (like) => like.likedUserId !== action.payload.likedUserId
        );
        // Move to next user in discover
        state.currentDiscoverIndex += 1;
      })
      .addCase(unlikeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get User Likes
    builder
      .addCase(getUserLikes.pending, (state) => {
        state.likesLoading = true;
        state.likesError = null;
      })
      .addCase(getUserLikes.fulfilled, (state, action) => {
        state.likesLoading = false;
        state.userLikes = action.payload;
      })
      .addCase(getUserLikes.rejected, (state, action) => {
        state.likesLoading = false;
        state.likesError = action.payload;
      });

    // Get Likes Received
    builder
      .addCase(getLikesReceived.pending, (state) => {
        state.likesReceivedLoading = true;
        state.likesReceivedError = null;
      })
      .addCase(getLikesReceived.fulfilled, (state, action) => {
        state.likesReceivedLoading = false;
        state.likesReceived = action.payload;
      })
      .addCase(getLikesReceived.rejected, (state, action) => {
        state.likesReceivedLoading = false;
        state.likesReceivedError = action.payload;
      });

    // Get User Matches
    builder
      .addCase(getUserMatches.pending, (state) => {
        state.matchesLoading = true;
        state.matchesError = null;
      })
      .addCase(getUserMatches.fulfilled, (state, action) => {
        state.matchesLoading = false;
        state.matches = action.payload;
      })
      .addCase(getUserMatches.rejected, (state, action) => {
        state.matchesLoading = false;
        state.matchesError = action.payload;
      });

    // Check Match
    builder
      .addCase(checkMatch.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkMatch.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDiscoverError, nextDiscoverUser, resetDiscoverIndex } =
  matchingSlice.actions;

export default matchingSlice.reducer;
