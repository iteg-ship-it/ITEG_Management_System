// store.js
import { configureStore } from "@reduxjs/toolkit"; // ✅ Correct import
import { apiPro } from "../services/apiSlice"; // ✅ Adjust path as needed

const store = configureStore({
  reducer: {
    [apiPro.reducerPath]: apiPro.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiPro.middleware),
});

export default store;
