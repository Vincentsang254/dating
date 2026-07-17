
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

      const payload = response.data?.data || {};
      if (payload.token) {
        localStorage.setItem("token", payload.token);
      }

      toast.success(response.data.message, {
        position: "top-center",
      });

      return { userData: payload, message: response.data.message };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", {
        position: "top-center",
      });
      return rejectWithValue(error.response?.data?.message || "Registration failed");
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

      const payload = response.data?.data || {};
      if (payload.token) {
        localStorage.setItem("token", payload.token);
      }

      toast.success(response.data.message, {
        position: "top-center",
      });
      return payload.token;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed", {
        position: "top-center",
      });
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const headers = setHeaders();
      const response = await axios.get(`${url}/auth/refresh-token`, headers);
      return response.data?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Session expired", {
        position: "top-center",
      });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loadUser(state) {
      const token = state.token;
      if (token) {
        try {
          const user = jwtDecode(token);
          return {
            ...state,
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            name: user.name || "",
            id: user.id || "",
            userType: user.userType || null,
            userLoaded: true,
          };
        } catch (error) {
          return { ...state, userLoaded: false };
        }
      }
      return { ...state, userLoaded: false };
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
          phoneNumber: action.payload?.phoneNumber || "",
          email: action.payload?.email || "",
          name: action.payload?.name || "",
          id: action.payload?.id || "",
          userType: action.payload?.userType || null,
          userLoaded: true,
        };
      })

      .addCase(registerUser.pending, (state) => {
        return { ...state, registerStatus: "pending", registerError: "" };
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const userData = action.payload?.userData;
        if (userData?.user) {
          return {
            ...state,
            token: userData.token || state.token,
            phoneNumber: userData.user.phoneNumber || "",
            email: userData.user.email || "",
            name: userData.user.name || "",
            id: userData.user.id || "",
            userType: userData.user.userType || "customer",
            registerStatus: "success",
            registerError: "",
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
        return { ...state, loginStatus: "pending", loginError: "" };
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload) {
          const user = jwtDecode(action.payload);
          return {
            ...state,
            token: action.payload,
            phoneNumber: user.phoneNumber || "",
            name: user.name || "",
            email: user.email || "",
            id: user.id || "",
            userType: user.userType || "customer",
            loginStatus: "success",
            loginError: "",
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
