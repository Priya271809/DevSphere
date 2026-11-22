import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetch all accepted connections for logged-in user
export const fetchConnections = createAsyncThunk("connections/fetchConnections", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/user/connections");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const connectionsSlice = createSlice({
  name: "connections",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default connectionsSlice.reducer;
