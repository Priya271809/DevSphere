import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import feedReducer from "./feedSlice";
import requestsReducer from "./requestsSlice";
import connectionsReducer from "./connectionsSlice";
import toastReducer from "./toastSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    requests: requestsReducer,
    connections: connectionsReducer,
    toast: toastReducer,
  },
});

export default store;
