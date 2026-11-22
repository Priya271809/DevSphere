import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";
import { showToast } from "./toastSlice";

// Async thunk to fetch developer feed with pagination & skill filter
export const fetchFeed = createAsyncThunk(
  "feed/fetchFeed",
  async ({ page = 1, limit = 12, skill = "" } = {}, { rejectWithValue }) => {
    try {
      let url = `/user/feed?page=${page}&limit=${limit}`;
      if (skill) url += `&skill=${encodeURIComponent(skill)}`;
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to send connection request with optimistic update and rollback
export const sendConnectionAction = createAsyncThunk(
  "feed/sendConnectionAction",
  async ({ targetUserId, status, targetUser }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post(`/request/send/${status}/${targetUserId}`);
      dispatch(
        showToast(
          status === "interested" ? "success" : "info",
          status === "interested"
            ? `Liked ${targetUser?.firstName || "developer"}!`
            : `Passed on ${targetUser?.firstName || "developer"}.`
        )
      );
      return { targetUserId, status, data: res.data };
    } catch (err) {
      dispatch(showToast("error", `Failed: ${err.message}`));
      return rejectWithValue({ targetUserId, status, targetUser, error: err.message });
    }
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    cards: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
    },
    filterSkill: "",
    loading: false,
    error: null,
  },
  reducers: {
    setFilterSkill: (state, action) => {
      state.filterSkill = action.payload;
    },
    // Optimistic removal of the active card
    popCard: (state) => {
      state.cards.shift();
    },
    // Rollback if an action failed
    restoreCard: (state, action) => {
      state.cards.unshift(action.payload);
    },
    resetFeedState: (state) => {
      state.cards = [];
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // sendConnectionAction
      .addCase(sendConnectionAction.pending, (state, action) => {
        const { targetUserId } = action.meta.arg;
        // Optimistically remove card from deck
        state.cards = state.cards.filter((user) => user._id !== targetUserId);
      })
      .addCase(sendConnectionAction.rejected, (state, action) => {
        // Rollback card back to the deck if the server returned an error!
        if (action.payload?.targetUser) {
          state.cards.unshift(action.payload.targetUser);
        }
      });
  },
});

export const { setFilterSkill, popCard, restoreCard, resetFeedState } = feedSlice.actions;
export default feedSlice.reducer;
