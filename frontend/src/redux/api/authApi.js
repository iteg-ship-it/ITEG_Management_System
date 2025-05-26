// src/features/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";
import { logout, setCredentials } from "../auth/authSlice";

const secretKey = "ITEG@123";

//  Decrypt from localStorage
const decrypt = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

//  Encrypt before storing
const encrypt = (data) => CryptoJS.AES.encrypt(data, secretKey).toString();

//  Base query with token in headers
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const encryptedToken = localStorage.getItem("token");
    const token = decrypt(encryptedToken);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

//  Auto-refresh logic
const baseQueryWithAutoRefresh = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.warn("Token expired. Attempting refresh...");

    const encryptedRefreshToken = localStorage.getItem("refreshToken");
    const refreshToken = decrypt(encryptedRefreshToken);

    if (!refreshToken) {
      console.error("No valid refresh token. Logging out...");
      api.dispatch(logout());
      localStorage.clear();
      window.location.href = "/login";
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: import.meta.env.VITE_REFRESH_TOKEN,
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      const {
        token: newToken,
        refreshToken: newRefreshToken,
        role,
      } = refreshResult.data;

      // Store encrypted tokens
      localStorage.setItem("token", encrypt(newToken));
      localStorage.setItem("refreshToken", encrypt(newRefreshToken));
      localStorage.setItem("role", role);

      api.dispatch(setCredentials({ token: newToken, role }));

      // Retry original query
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error("Refresh failed. Logging out...");
      api.dispatch(logout());
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return result;
};
// ---------users-------------
// 🔨 Create API
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAutoRefresh,
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
          const { token, refreshToken, role } = data;

          localStorage.setItem("token", encrypt(token));
          localStorage.setItem("refreshToken", encrypt(refreshToken));
          localStorage.setItem("role", role);

          dispatch(setCredentials({ token, role }));
          window.location.replace("/");
        } catch (error) {
          console.error("Login failed:", error);
          dispatch(logout());
        }
      },
    }),
    // ---- Create User API ----
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `user/update/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    //-- Logout API ----
    logout: builder.mutation({
      query: (payload) => ({
        url: import.meta.env.VITE_LOGOUT_ENDPOINT,
        method: "POST",
        body: payload,
      }),
    }),


    // Refresh token
    refreshToken: builder.mutation({
      query: (payload) => ({
        url: import.meta.env.VITE_REFRESH_TOKEN,
        method: "POST",
        body: payload,
      }),
    }),

    // login with goggle
    loginWithGoogle: builder.mutation({
      query: () => ({
        url: import.meta.env.VITE_LOGIN_WITH_GOOGLE,
        method: "GET",
      }),
    }),


    // ---- Forget Password API ----
    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: import.meta.env.VITE_FORGET_PASSWORD, // or your actual endpoint
        method: "POST",
        body: { email },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    // ---- Reset Password API ----
    resetPassword: builder.mutation({
      query: ({ token, body }) => ({
        url: `${import.meta.env.VITE_RESET_PASSWORD}${token}`,
        method: "POST",
        body,
      }),
    }),


    // ----otp-----
    // verify the otp
    verifyOtp: builder.mutation({
      query: (payload) => ({
        url: import.meta.env.VITE_LOGIN_OTP_VERIFY, // e.g., /auth/verify-otp
        method: "POST",
        body: payload, // { email, otp }
      }),
    }),
    // send the otp
    sendOtp: builder.mutation({
      query: (payload) => ({
        url: import.meta.env.VITE_LOGIN_OTP,
        method: "POST",
        body: payload,
      }),
    }),


    // ---------admission process-------------

    // get the students for admission process
    getAllStudents: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_ALL_STUDENTS,
        method: "GET",
      }),
    }),

    // get admission process student by id
    getStudentById: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_GET_STUDENT_BY_ID}${id}`,
        method: "GET",
      }),
    }),

    interviewCreate: builder.mutation({
      query: ({ studentId, ...formData }) => ({
        url: `${import.meta.env.VITE_INTERVIEW_CREATE}${studentId}`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    // get interview detail of student by id
    getInterviewDetailById: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_INTERVIEW_DETAIL}${id}`,
        method: "GET",
      }),
    }),

    // ---------admitted students-------------

    // get all the students for admitted process
    admitedStudents: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_ADMITTED_STUDENTS,
        method: "GET",
      }),
    }),


  }),
});

export const {
  useLoginMutation,
  useLoginWithGoogleMutation,
  useUpdateUserMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRefreshTokenMutation,
  useGetAllStudentsQuery,
  useAdmitedStudentsQuery,
  useInterviewCreateMutation,
  useGetInterviewDetailByIdQuery,
  useGetStudentByIdQuery,
  useLogoutMutation,
} = authApi;
