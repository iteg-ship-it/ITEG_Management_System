import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counterSlice"; // Example reducer

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});