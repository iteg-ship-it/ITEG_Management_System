// src/features/api/authApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";
import { logout, setCredentials } from "../auth/authSlice"; // Redux actions

const secretKey = "ITEG@123";

//  Step 1: Create base query to attach decrypted token
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
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
});

// Step 2: Wrap baseQuery to handle 401 (unauthorized)
const baseQueryWithAutoLogout = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Token expired or unauthorized, auto logout
    console.warn("Unauthorized! Logging out...");
    api.dispatch(logout());
    localStorage.clear(); // Clear localStorage
    window.location.href = "/login"; // Redirect to login page
  }

  return result;
};

//  Step 3: Define API with enhanced base query
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAutoLogout,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: import.meta.env.VITE_LOGIN_ENDPOINT,
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

          // Store encrypted token and user info
          localStorage.setItem("token", encryptedToken);
          localStorage.setItem("role", role);

          dispatch(setCredentials({ token, role }));
          window.location.replace("/");
        } catch (error) {
          console.error("Login failed:", error);
          dispatch(logout());
        }
      },
    }),

    getAllStudents: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_ALL_STUDENTS,
        method: "GET",
      }),
    }),

    admitedStudents: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_ADMITTED_STUDENTS,
        method: "GET",
      }),
    }),

    getStudentById: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_GET_STUDENT_BY_ID}${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetAllStudentsQuery,
  useAdmitedStudentsQuery,
  useGetStudentByIdQuery,
} = authApi;

// // src/features/api/authApi.js

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import CryptoJS from "crypto-js";
// import { setCredentials, logout } from "../auth/authSlice"; // ✅ Import kara

// const secretKey = "ITEG@123"; // Same key used to encrypt

// export const authApi = createApi({
//   reducerPath: "authApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:5000/api",
//     prepareHeaders: (headers) => {
//       const encryptedToken = localStorage.getItem("token");

//       if (encryptedToken) {
//         try {
//           const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
//           const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

//           if (decryptedToken) {
//             headers.set("Authorization", `Bearer ${decryptedToken}`);
//           }
//         } catch (error) {
//           console.error("Token decryption failed:", error);
//         }
//       }

//       return headers;
//     },
//     credentials: "include",
//   }),
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: "/user/login",
//         method: "POST",
//         body: credentials,
//       }),
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           const { data } = await queryFulfilled;
//           const { token, role } = data;
//           const encryptedToken = CryptoJS.AES.encrypt(
//             token,
//             secretKey
//           ).toString();
//           localStorage.setItem("token", encryptedToken);
//           localStorage.setItem("role", role);

//           dispatch(setCredentials({ token, role })); // ✅ Redux me set
//           window.location.replace("/");
//         } catch (error) {
//           console.error("Login failed:", error);
//           dispatch(logout()); // ✅ Error pe logout
//         }
//       },
//     }),

//     getAllStudents: builder.query({
//       query: () => ({
//         url: "/admission/students/getall",
//         method: "GET",
//       }),
//     }),
//     admitedStudents: builder.query({
//       query: () => ({
//         url: "/admitted/students/getall",
//         method: "GET",
//       }),
//     }),
//     getStudentById: builder.query({
//       query: (id) => ({
//         url: `/admission/students/get/${id}`,
//         method: "GET",
//       }),
//     }),
//   }),
// });

// export const {
//   useLoginMutation,
//   useGetAllStudentsQuery,
//   useAdmitedStudentsQuery,
//   useGetStudentByIdQuery,
// } = authApi;
