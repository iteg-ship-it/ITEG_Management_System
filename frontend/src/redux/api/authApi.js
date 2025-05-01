// src/features/api/authApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";
import { setCredentials, logout } from "../auth/authSlice"; // ✅ Import kara

const secretKey = "ITEG@123"; // Same key used to encrypt

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const encryptedToken = localStorage.getItem("token");

      if (encryptedToken) {
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
          const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

          if (decryptedToken) {
            headers.set("Authorization", `Bearer ${decryptedToken}`);
          }
        } catch (error) {
          console.error("Token decryption failed:", error);
        }
      }

      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { token, role } = data;
          const encryptedToken = CryptoJS.AES.encrypt(
            token,
            secretKey
          ).toString();
          localStorage.setItem("token", encryptedToken);
          localStorage.setItem("role", role);

          dispatch(setCredentials({ token, role })); // ✅ Redux me set
          window.location.replace("/");
        } catch (error) {
          console.error("Login failed:", error);
          dispatch(logout()); // ✅ Error pe logout
        }
      },
    }),

    getAllStudents: builder.query({
      query: () => ({
        url: "/students/admission/getall",
        method: "GET",
      }),
    }),
    admitedStudents: builder.query({
      query: () => ({
        url: "/students/getall",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetAllStudentsQuery,
  useAdmitedStudentsQuery,
} = authApi;
