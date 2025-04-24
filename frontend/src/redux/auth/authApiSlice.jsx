// src/features/api/authApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js"; // Make sure this is installed

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
            console.log(decryptedToken);
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
    // Login mutation
    login: builder.mutation({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // Get all students query
    getAllStudents: builder.query({
      query: () => ({
        url: "/students/admission/getall",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetAllStudentsQuery } = authApi;

// // src/features/api/authApi.js

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const authApi = createApi({
//   reducerPath: "authApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:5000/api",
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       return headers;
//     },
//     credentials: "include", // needed only if you're using cookies for auth
//   }),
//   endpoints: (builder) => ({
//     // Login mutation
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: "/user/login",
//         method: "POST",
//         body: credentials,
//       }),
//     }),

//     // Get all students query
//     getAllStudents: builder.query({
//       query: () => ({
//         url: "/students/getall", // Adjust this to your actual API path
//         method: "GET",
//       }),
//     }),
//   }),
// });

// // Export the generated hooks
// export const { useLoginMutation, useGetAllStudentsQuery } = authApi;

// // // src/features/api/authApi.js

// // import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // export const authApi = createApi({
// //   reducerPath: "authApi",
// //   baseQuery: fetchBaseQuery({
// //     baseUrl: "http://localhost:5000/api",
// //     prepareHeaders: (headers) => {
// //       const token = localStorage.getItem("token");
// //       if (token) {
// //         headers.set("Authorization", `Bearer ${token}`);
// //       }
// //       return headers;
// //     },
// //     credentials: "include", // only needed for cookie-based auth
// //   }),
// //   endpoints: (builder) => ({
// //     login: builder.mutation({
// //       query: (credentials) => ({
// //         url: "/user/login",
// //         method: "POST",
// //         body: credentials,
// //       }),
// //     }),
// //   }),
// // });

// // export const { useLoginMutation } = authApi;
