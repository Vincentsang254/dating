import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "./api";

const initialState = {
  overview: null,
  users: [],
  payments: [],
  reports: null,
  userReports: [],
  loading: false,
  error: null,
};

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token || ""}`,
  },
});

export const fetchAdminOverview = createAsyncThunk(
  "admin/fetchAdminOverview",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${url}/admin/overview`, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load admin overview");
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchAdminUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${url}/admin/users`, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load users");
    }
  }
);

export const fetchAdminPayments = createAsyncThunk(
  "admin/fetchAdminPayments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${url}/admin/payments`, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load payments");
    }
  }
);

export const fetchAdminReports = createAsyncThunk(
  "admin/fetchAdminReports",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${url}/admin/reports`, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load reports");
    }
  }
);

export const fetchAdminUserReports = createAsyncThunk(
  "admin/fetchAdminUserReports",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${url}/admin/reports/list`, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load user reports");
    }
  }
);

export const reviewAdminUserReport = createAsyncThunk(
  "admin/reviewAdminUserReport",
  async ({ reportId, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${url}/admin/reports/${reportId}`, { status }, authHeader(token));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update report status");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAdminPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
      })
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(fetchAdminUserReports.fulfilled, (state, action) => {
        state.userReports = action.payload;
      })
      .addCase(reviewAdminUserReport.fulfilled, (state, action) => {
        state.userReports = state.userReports.filter((report) => report.id !== action.payload.id);
        if (state.reports?.openReports != null) {
          state.reports.openReports = Math.max(0, state.reports.openReports - 1);
        }
      });
  },
});

export default adminSlice.reducer;
