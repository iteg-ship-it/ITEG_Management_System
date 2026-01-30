import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";

const secretKey = "ITEG@123";

// Decrypt function
const decrypt = (encrypted) => {
  try {
    if (!encrypted || typeof encrypted !== "string") return null;
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

const initialState = {
  token: decrypt(localStorage.getItem("token")) || null,
  role: localStorage.getItem("role") || null,
  isAuthenticated: !!decrypt(localStorage.getItem("token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.clear();
    },
  },
});

export const { setCredentials, setRole, logout } = authSlice.actions;
export default authSlice.reducer;
