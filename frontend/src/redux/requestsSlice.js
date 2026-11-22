import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";
import { showToast } from "./toastSlice";
import { fetchConnections } from "./connectionsSlice";

// Fetch pending connection requests received by logged in user
export const fetchRequests = createAsyncThunk("requests/fetchRequests", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/user/requests/received");
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Review connection request (accepted or rejected) with optimistic update & rollback
export const reviewRequestAction = createAsyncThunk(
  "requests/reviewRequestAction",
  async ({ requestId, status, requestItem }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post(`/request/review/${status}/${requestId}`);
      dispatch(
        showToast(
          status === "accepted" ? "success" : "info",
          status === "accepted"
            ? `Connected with ${requestItem?.fromUserId?.firstName || "developer"}!`
            : "Request rejected."
        )
      );
      if (status === "accepted") {
        dispatch(fetchConnections());
      }
      return { requestId, status, data: res.data };
    } catch (err) {
      dispatch(showToast("error", `Action failed: ${err.message}`));
      return rejectWithValue({ requestId, status, requestItem, error: err.message });
    }
  }
);

const requestsSlice = createSlice({
  name: "requests",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRequests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.error = null;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // reviewRequestAction
      .addCase(reviewRequestAction.pending, (state, action) => {
        const { requestId } = action.meta.arg;
        // Optimistic removal from list
        state.items = state.items.filter((req) => req._id !== requestId);
      })
      .addCase(reviewRequestAction.rejected, (state, action) => {
        // Rollback request back into list if server rejected
        if (action.payload?.requestItem) {
          state.items.unshift(action.payload.requestItem);
        }
      });
  },
});

export default requestsSlice.reducer;
