import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null, // Initialize role from localStorage
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
    },
    setRole: (state, action) => {
      state.role = action.payload; // Directly set the role
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});

export const { setCredentials, setRole, logout } = authSlice.actions;
export default authSlice.reducer;
