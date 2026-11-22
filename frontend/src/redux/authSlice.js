import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Async thunk to verify existing session
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/profile/view");
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Async thunk for login
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post("/login", credentials);
    if (res.data.token) {
      localStorage.setItem("devtinder_token", res.data.token);
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Async thunk for signup
export const signupUser = createAsyncThunk("auth/signupUser", async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post("/signup", userData);
    if (res.data.token) {
      localStorage.setItem("devtinder_token", res.data.token);
    }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Async thunk for logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await api.post("/logout");
    localStorage.removeItem("devtinder_token");
    return true;
  } catch (err) {
    localStorage.removeItem("devtinder_token");
    return rejectWithValue(err.message);
  }
});

// Async thunk to update profile
export const updateProfile = createAsyncThunk("auth/updateProfile", async (updates, { rejectWithValue }) => {
  try {
    const res = await api.patch("/profile/edit", updates);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("devtinder_token") || null,
    isAuthenticated: false,
    loading: true, // starts true to check session on mount
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDemoUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // login
      .addCase(loginUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.actionLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // signup
      .addCase(signupUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.actionLoading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setDemoUser } = authSlice.actions;
export default authSlice.reducer;
