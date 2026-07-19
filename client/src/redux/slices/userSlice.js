import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url, setHeaders } from "./api";
import { toast } from "react-toastify";

const initialState = {
  profile: null,
  viewedProfile: null,
  users: [],
  status: "idle",
  viewedProfileStatus: "idle",
  usersStatus: "idle",
  error: null,
  usersError: null,
};

export const fetchProfile = createAsyncThunk("user/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.get(`${url}/auth/me`, headers);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load profile", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchUsers = createAsyncThunk("user/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.get(`${url}/users/profile`, headers);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load users", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const fetchUserProfile = createAsyncThunk("user/fetchUserProfile", async (userId, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.get(`${url}/users/profile/${userId}`, headers);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to load user profile", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.put(`${url}/users/profile`, payload, headers);
    toast.success(response.data.message, { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update profile", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const reportUser = createAsyncThunk("user/reportUser", async (payload, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.post(`${url}/users/profile/report`, payload, headers);
    toast.success(response.data.message, { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to report user", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const blockUser = createAsyncThunk("user/blockUser", async (payload, { rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.post(`${url}/users/profile/block`, payload, headers);
    toast.success(response.data.message, { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to block user", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const uploadProfilePhoto = createAsyncThunk("user/uploadProfilePhoto", async (file, { dispatch, rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const form = new FormData();
    form.append("image", file);

    const response = await axios.post(`${url}/users/profile/upload`, form, {
      headers: { ...headers.headers, "Content-Type": "multipart/form-data" },
    });

    // refresh profile after successful upload
    dispatch(fetchProfile());
    toast.success(response.data.message || "Uploaded", { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Upload failed", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const deleteProfilePhoto = createAsyncThunk("user/deleteProfilePhoto", async (urlToDelete, { dispatch, rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.delete(`${url}/users/profile/photo`, { data: { url: urlToDelete }, headers: headers.headers });
    dispatch(fetchProfile());
    toast.success(response.data.message || "Deleted", { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Delete failed", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const reorderProfilePhotos = createAsyncThunk("user/reorderProfilePhotos", async (photosArray, { dispatch, rejectWithValue }) => {
  try {
    const headers = setHeaders();
    const response = await axios.put(`${url}/users/profile/photos/reorder`, { photos: photosArray }, headers);
    dispatch(fetchProfile());
    toast.success(response.data.message || "Reordered", { position: "top-center" });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Reorder failed", { position: "top-center" });
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "success";
        const payload = action.payload?.data;
        if (Array.isArray(payload)) {
          state.profile = payload[0] || null;
        } else {
          state.profile = payload || null;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || action.error?.message;
      });
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = "pending";
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = "success";
        const payload = action.payload?.data;
        state.users = Array.isArray(payload) ? payload : payload ? [payload] : [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = "rejected";
        state.usersError = action.payload?.message || action.error?.message;
      });
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.viewedProfileStatus = "pending";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.viewedProfileStatus = "success";
        state.viewedProfile = action.payload?.data || null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.viewedProfileStatus = "rejected";
        state.error = action.payload?.message || action.error?.message;
      });
    builder
      .addCase(updateProfile.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "success";
        state.profile = action.payload.data || state.profile;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || action.error?.message;
      });
  },
});

export default userSlice.reducer;
