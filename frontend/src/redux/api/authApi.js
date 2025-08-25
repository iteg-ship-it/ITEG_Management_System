/* eslint-disable no-unused-vars */
// src/features/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";
import { logout, setCredentials } from "../auth/authSlice";

const secretKey = "ITEG@123";

//  Decrypt from localStorage
// const decrypt = (encrypted) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch (err) {
//     console.error("Decryption failed:", err);
//     return null;
//   }
// };
const decrypt = (encrypted) => {
  try {
    if (!encrypted || typeof encrypted !== "string") return null; // ✅ Prevent decryption of null or invalid input
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null; // If decryption fails silently, still return null
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

  // Handle server errors (5xx)
  if (result?.error?.status >= 500) {
    window.location.href = "/server-error";
    return result;
  }

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
      const { accessToken } = refreshResult.data;

      // Store encrypted token
      localStorage.setItem("token", encrypt(accessToken));

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
  tagTypes: ['Student', 'PlacementStudent'],
  // Global configuration for better caching
  keepUnusedDataFor: 300, // 5 minutes default cache
  refetchOnMountOrArgChange: 30, // Only refetch if data is older than 30 seconds
  refetchOnFocus: false, // Disable refetch on window focus
  refetchOnReconnect: true, // Refetch on network reconnect
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
    
    signup: builder.mutation({
      query: (userData) => ({
        url: import.meta.env.VITE_SIGNUP_ENDPOINT || '/api/auth/signup',
        method: "POST",
        body: userData,
      }),
    }),
    // ---- Create User API ----
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `${import.meta.env.VITE_UPDATE_USER_PROFILE}${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    //-- Logout API ----
    logout: builder.mutation({
      query: ({ id }) => {
        console.log("🚀 Sending logout request with ID:", id); // ✅ Log payload

        return {
          url: import.meta.env.VITE_LOGOUT_ENDPOINT,
          method: "POST",
          body: { id }, // ✅ this will match req.body.id in backend
        };
      },
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
      providesTags: ['Student'],
      keepUnusedDataFor: 300, // 5 minutes cache
    }),

    getAllStudentsByLevel: builder.query({
      query: (levelNo) => ({
        url: `${import.meta.env.VITE_GET_ALL_STUDENTS_BY_LEVEL}${levelNo}`,
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

    // create interview for student
    interviewCreate: builder.mutation({
      query: ({ studentId, ...formData }) => ({
        url: `${import.meta.env.VITE_INTERVIEW_CREATE}${studentId}`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ['Student'],
    }),

    // get interview detail of student by id
    getInterviewDetailById: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_INTERVIEW_DETAIL}${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: 'Student', id }
      ],
    }),

    // ---------admitted students-------------

    // get all the students for admitted process
    admitedStudents: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_ADMITTED_STUDENTS,
        method: "GET",
      }),
      providesTags: ['Student'],
      keepUnusedDataFor: 300, // 5 minutes cache
    }),

    // create level interview
    createLevelInterview: builder.mutation({
      query: ({ id, data }) => ({
        url: `${import.meta.env.VITE_CREATE_LEVEL_INTERVIEW}${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),

    updateStudentById: builder.mutation({
      query: ({ data }) => ({
        url: `${import.meta.env.VITE_UPDATE_STUDENT_BY_ID}`,
        method: "PATCH",
        body: data,
      }),
    }),

    // apiSlice.js or interviewApi.js
    getLevelInterview: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_GET_LEVEL_INTERVIEW_BY_ID}${id}`,
        method: "GET",
      }),
    }),

    getLevelNumber: builder.query({
      query: (levelNo) => ({
        url: `${import.meta.env.VITE_GET_LEVEL_BY_NUMBER}${levelNo}`,
        method: "GET",
      }),
    }),

    getAdmittedStudentsById: builder.query({
      query: (id) => ({
        url: `${import.meta.env.VITE_GET_ADMITTED_STUDENTS_BY_ID}${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: 'Student', id }
      ],
    }),

    getPermissionStudent: builder.query({
      query: () => ({
        url: `${import.meta.env.VITE_GET_PERMISSION_STUDENT}`,
        method: "GET",
      }),
    }),

    updatePermission: builder.mutation({
      query: ({ id, data }) => ({
        url: `${import.meta.env.VITE_UPDATE_PERMISSION_STUDENT}${id}`,
        method: "PATCH",
        body: data,
      }),
    }),

    updatePlacement: builder.mutation({
      query: ({ id, data }) => ({
        url: `${import.meta.env.VITE_UPDATE_PLACEMENT_INFO}${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    updateTechnology: builder.mutation({
      query: ({ id, techno }) => {
        const fullUrl = `${import.meta.env.VITE_UPDATE_TECHNOLOGY}${id}`;
        return {
          url: fullUrl,
          method: "PATCH",
          body: { techno },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id }
      ],
      async onQueryStarted({ id, techno }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate specific student data to force refetch
          dispatch(authApi.util.invalidateTags([{ type: 'Student', id }]));
        } catch (error) {
          console.error('Failed to update technology:', error);
        }
      },
    }),

    updateStudentImage: builder.mutation({
      query: ({ id, image }) => ({
        url: `/admitted/students/update/profile/${id}`,
        method: "PATCH",
        body: { image },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id }
      ],
    }),


    // Get student level interviews for history page
    getStudentLevelInterviews: builder.query({
      query: (studentId) => {
        const endpoint = `${import.meta.env.VITE_GET_LEVEL_INTERVIEW_BY_ID}${studentId}`;
        console.log('🎯 Level Interview History API Call:', {
          endpoint,
          studentId,
          fullUrl: `${import.meta.env.VITE_API_URL}${endpoint}`
        });
        return {
          url: endpoint,
          method: "GET",
        };
      },
    }),



    //Placement api calling
    // get all ready students for placement
    getReadyStudentsForPlacement: builder.query({
      query: () => ({
        url: import.meta.env.VITE_GET_READY_STUDENTS_FOR_PLACEMENT,
        method: "GET",
      }),
      providesTags: ['PlacementStudent'],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    addPlacementInterviewRecord: builder.mutation({
      query: ({ studentId, interviewData }) => ({
        url: `${import.meta.env.VITE_INTERVIEW_CREATE_PLACEMENT}${studentId}`,
        method: "POST",
        body: interviewData,
      }),
      invalidatesTags: ['PlacementStudent'],
      // Force immediate cache invalidation
      async onQueryStarted({ studentId, interviewData }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate all placement student queries
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
        } catch {
          // Handle error if needed
        }
      },
    }),


    // In redux/api/authApi.js
    updatePlacedInfo: builder.mutation({
      query: ({ studentId, interviewId, ...data }) => ({
        url: `${import.meta.env.VITE_PLACEMENT_INFO_UPDATE}${studentId}/${interviewId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent'],
      // Force immediate cache invalidation and refetch
      async onQueryStarted({ studentId, interviewId, ...data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate all placement student queries to force refetch
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          // Also invalidate specific student data
          dispatch(authApi.util.invalidateTags([{ type: 'PlacementStudent', id: studentId }]));
        } catch (error) {
          console.error('Failed to update interview record:', error);
        }
      },
    }),

    // Upload resume
    uploadResume: builder.mutation({
      query: ({ studentId, fileName, fileData }) => ({
        url: import.meta.env.VITE_RESUME_UPLOAD,
        method: "POST",
        body: { studentId, fileName, fileData },
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Student', id: studentId }
      ],
    }),




    getInterviewAttemptCount: builder.query({
      query: (studentId) => ({
        url: `${import.meta.env.VITE_GET_INTERVIEW_ATTEMPT}${studentId}`,
        method: "GET",
      }),
    }),

    // Get interview history for placement students
    getInterviewHistory: builder.query({
      query: (studentId) => ({
        url: `admitted/students/interview_history/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: 'PlacementStudent', id: studentId }
      ],
    }),

    // Reschedule interview
    rescheduleInterview: builder.mutation({
      query: ({ studentId, interviewId, ...data }) => ({
        url: `admitted/students/reschedule/interview/${studentId}/${interviewId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent'],
      async onQueryStarted({ studentId, interviewId, ...data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          dispatch(authApi.util.invalidateTags([{ type: 'PlacementStudent', id: studentId }]));
        } catch (error) {
          console.error('Failed to reschedule interview:', error);
        }
      },
    }),

    // Add interview round
    addInterviewRound: builder.mutation({
      query: ({ studentId, interviewId, ...data }) => ({
        url: `admitted/students/interviews/${studentId}/${interviewId}/add_round`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent'],
      async onQueryStarted({ studentId, interviewId, ...data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          dispatch(authApi.util.invalidateTags([{ type: 'PlacementStudent', id: studentId }]));
        } catch (error) {
          console.error('Failed to add interview round:', error);
        }
      },
    }),

    // Confirm placement
    confirmPlacement: builder.mutation({
      query: (data) => ({
        url: `/admitted/students/confirm_placement`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent', 'Student'],
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          dispatch(authApi.util.invalidateTags(['Student']));
        } catch (error) {
          console.error('Failed to confirm placement:', error);
        }
      },
    }),

    // Create placement post
    createPlacementPost: builder.mutation({
      query: (data) => ({
        url: `/admitted/students/placement_post`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent'],
    }),

    // Get all companies
    getAllCompanies: builder.query({
      query: () => ({
        url: '/admitted/students/companies',
        method: "GET",
      }),
      providesTags: ['Company'],
    }),

  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
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
  useGetAdmittedStudentsByIdQuery,
  useCreateLevelInterviewMutation,
  useUpdateStudentByIdMutation,
  useGetLevelInterviewQuery,
  useGetLevelNumberQuery,
  useGetPermissionStudentQuery,
  useUpdatePermissionMutation,
  useUpdatePlacementMutation,
  useGetReadyStudentsForPlacementQuery,
  useAddPlacementInterviewRecordMutation,
  useUpdatePlacedInfoMutation,
  useUpdateTechnologyMutation,
  useUpdateStudentImageMutation,
  useLogoutMutation,
  useGetAllStudentsByLevelQuery,
  useGetInterviewAttemptCountQuery,
  useGetStudentLevelInterviewsQuery,
  useUploadResumeMutation,
  useGetInterviewHistoryQuery,
  useRescheduleInterviewMutation,
  useAddInterviewRoundMutation,
  useConfirmPlacementMutation,
  useCreatePlacementPostMutation,
  useGetAllCompaniesQuery
} = authApi;