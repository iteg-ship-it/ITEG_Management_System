import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import authReducer from "./auth/authSlice";

const rtkQueryErrorLogger = () => (next) => (action) => {
  if (action?.payload?.status >= 400 && action?.payload?.status < 500) {
    return next(action);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { warnAfter: 128 },
    })
    .concat(authApi.middleware)
    .concat(rtkQueryErrorLogger),
});