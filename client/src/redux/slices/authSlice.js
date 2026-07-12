
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { setHeaders, url } from "./api";
import { toast } from "react-toastify";

// Initial state for the auth slice
const initialState = {
  token: localStorage.getItem("token") || null,
  phoneNumber: "",
  email: "",
  name: "",
  id: "",
  userType: null,
  registerStatus: "",
  registerError: "",
  loginStatus: "",
  loginError: "",
  userLoaded: false,
};
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (values, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/auth/signup`, {
        email: values.email,
        phoneNumber: values.phoneNumber,
        name: values.name,
        password: values.password,
      });

      toast.success(response.data.message, {
        position: "top-center",
      });

      // Return only the necessary information (e.g., user details)
      return { userData: response.data.data, message: response.data.message };
    } catch (error) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (values, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      // localStorage.setItem("token", JSON.stringify(token));

      toast.success(response.data.message, {
        position: "top-center",
      });
      return token;
    } catch (error) {
      toast.error(error.response.data.message, {
        position: "top-center",
      });
      return rejectWithValue(error.response.data.message);
    }
  }
);
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const headers = await setHeaders()
      const response = await axios.get(`${url}/auth/refresh-token`, headers);
      console.log("response from refresh token",response.data.data);
      return response.data.data; // latest user info
    } catch (error) {
      toast.error(error.response?.data?.message || "Session expired", {
        position: "top-center",
      });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// For token expiry handling:
const token = localStorage.getItem("token");
if (token) {
  const decodedToken = jwtDecode(token);
  const isExpired = decodedToken.exp * 1000 < Date.now();
  if (isExpired) {
    localStorage.removeItem("token");
    dispatch(logoutUser());
  }
}


// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadUser(state, action) {
      const token = state.token;
      if (token) {
        const user = jwtDecode(token);
        return {
          ...state,
          phoneNumber: user.phoneNumber,
          email: user.email,
          name: user.name,
          id: user.id,
          userType: user.userType,
          userLoaded: true,
        };
      } else {
        return { ...state, userLoaded: false };
      }
    },
    logoutUser(state) {
      localStorage.removeItem("token");
      return {
        ...state,
        token: "",
        phoneNumber: "",
        email: "",
        name: "",
        id: "",
        userType: null,
        registerStatus: "",
        registerError: "",
        loginStatus: "",
        loginError: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        return {
          ...state,
          phoneNumber: action.payload.phoneNumber,
          email: action.payload.email,
          name: action.payload.name,
          id: action.payload.id,
          userType: action.payload.userType,
          userLoaded: true,
        };
      })

      .addCase(registerUser.pending, (state) => {
        return { ...state, registerStatus: "pending" };
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const userData = action.payload.userData;
        if (userData) {
          return {
            ...state,
            phoneNumber: userData.phoneNumber,
            email: userData.email,
            name: userData.name,
            id: userData.id,
            userType: userData.userType || "client", // Default to "user" if not provided
            profilePic: userData.profilePic,
            verificationCode: userData.verificationCode,
            verified: userData.verified,
            registerStatus: "success",
          };
        }
        return state;
      })
      .addCase(registerUser.rejected, (state, action) => {
        return {
          ...state,
          registerStatus: "rejected",
          registerError: action.payload,
        };
      })
      .addCase(loginUser.pending, (state) => {
        return { ...state, loginStatus: "pending" };
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload) {
          const user = jwtDecode(action.payload);
          return {
            ...state,
            token: action.payload,
            phoneNumber: user.phoneNumber,
            name: user.name,
            email: user.email,
            id: user.id,
            userType: user.userType,
            loginStatus: "success",
          };
        }
        return state;
      })
      .addCase(loginUser.rejected, (state, action) => {
        return {
          ...state,
          loginStatus: "rejected",
          loginError: action.payload,
        };
      });
  },
});

// Exporting actions and reducer
export const { loadUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
