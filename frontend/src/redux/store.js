
// src/app/store.js

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../redux/api/authApi";
import authReducer from "../redux/auth/authSlice"; // ✅ Import kara

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer, // ✅ Add kara
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// import { configureStore } from "@reduxjs/toolkit";
// import { authApi } from "./auth/authApiSlice";

// export const store = configureStore({
//   reducer: {
//     [authApi.reducerPath]: authApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(authApi.middleware),
// });
