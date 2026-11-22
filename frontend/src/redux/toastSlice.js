import { createSlice } from "@reduxjs/toolkit";

let nextToastId = 1;

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: (state, action) => {
      const id = nextToastId++;
      state.toasts.push({
        id,
        type: action.payload.type || "info",
        message: action.payload.message,
        duration: action.payload.duration || 4000,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export const showToast = (type, message) => (dispatch) => {
  const id = nextToastId++;
  dispatch(toastSlice.actions.addToast({ type, message, id }));
  setTimeout(() => {
    dispatch(toastSlice.actions.removeToast(id));
  }, 4000);
};

export default toastSlice.reducer;
