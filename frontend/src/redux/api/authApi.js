/* eslint-disable no-unused-vars */
// src/features/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";
import { logout, setCredentials } from "../auth/authSlice";

const secretKey = "ITEG@123";

//  Decrypt from localStorage
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

//  Encrypt before storing
const encrypt = (data) => CryptoJS.AES.encrypt(data, secretKey).toString();

// Function to decode JWT payload
const jwtDecode = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

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

  const isExternalAttendanceAPI = result?.error &&
    (args.headers?.['x-api-key'] === import.meta.env.VITE_ITEG_ATTENDANCE_API_KEY ||
      (typeof args.url === 'string' && args.url.includes(import.meta.env.VITE_ITEG_ATTENDANCE_API_URL)));

  if (isExternalAttendanceAPI) {
    return result;
  }

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

    console.log("Attempting token refresh...");
    const refreshResult = await rawBaseQuery(
      {
        url: '/user/refresh_token',
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult?.data?.accessToken) {
      const { accessToken } = refreshResult.data;
      console.log("Token refreshed successfully");

      // Store encrypted token
      localStorage.setItem("token", encrypt(accessToken));
      
      const user = jwtDecode(accessToken);

      // Update Redux state
      api.dispatch(setCredentials({ token: accessToken, user }));

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
  tagTypes: ['Student', 'PlacementStudent', 'User', 'Department', 'Role', 'Permission'],
  // Global configuration for better caching
  keepUnusedDataFor: 300, // 5 minutes default cache
  refetchOnMountOrArgChange: 30, // Only refetch if data is older than 30 seconds
  refetchOnFocus: false, // Disable refetch on window focus
  refetchOnReconnect: true, // Refetch on network reconnect
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/user/login',
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { token, refreshToken } = data;
          const user = jwtDecode(token);

          localStorage.setItem("token", encrypt(token));
          localStorage.setItem("refreshToken", encrypt(refreshToken));
          localStorage.setItem("role", user.role);

          dispatch(setCredentials({ token, user }));
          window.location.replace("/");
        } catch (error) {
          console.error("Login failed:", error);
          localStorage.clear();
          dispatch(logout());
        }
      },
    }),

    signup: builder.mutation({
      query: (userData) => ({
        url: '/user/signup',
        method: "POST",
        body: userData,
      }),
    }),
    // ---- Create User API ----
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/user/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id }
      ],
    }),
    //-- Logout API ----
    logout: builder.mutation({
      query: ({ id }) => ({
        url: '/user/logout',
        method: "POST",
        body: { id },
      }),
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: (payload) => ({
        url: '/user/refresh_token',
        method: "POST",
        body: payload,
      }),
    }),

    // login with goggle
    loginWithGoogle: builder.mutation({
      query: () => ({
        url: '/user/google',
        method: "GET",
      }),
    }),

    // ---- Forget Password API ----
    forgetPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/user/forgot_password', // or your actual endpoint
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
        url: `/user/reset_password/${token}`,
        method: "POST",
        body,
      }),
    }),

    // ----otp-----
    // verify the otp
    verifyOtp: builder.mutation({
      query: (payload) => ({
        url: '/user/otp/verify', // e.g., /auth/verify-otp
        method: "POST",
        body: payload, // { email, otp }
      }),
    }),
    // send the otp
    sendOtp: builder.mutation({
      query: (payload) => ({
        url: '/user/otp/send',
        method: "POST",
        body: payload,
      }),
    }),

    // ---------admission process-------------

    // get the students for admission process
    getAllStudents: builder.query({
      query: () => ({
        url: '/admission/students/getall',
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
        url: `/admission/students/get/${id}`,
        method: "GET",
      }),
    }),

    // create interview for student
    interviewCreate: builder.mutation({
      query: ({ studentId, ...formData }) => ({
        url: `/admission/students/create_interview/${studentId}`,
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
        url: `/admission/students/get_interviews/${id}`,
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
        url: '/admitted/students/getall',
        method: "GET",
      }),
      providesTags: ['Student'],
      keepUnusedDataFor: 300, // 5 minutes cache
    }),

    // create level interview
    createLevelInterview: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admitted/students/create_level/${id}`,
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
        url: `/admitted/students/get_levels/${id}`,
        method: "GET",
      }),
    }),

    getLevelNumber: builder.query({
      query: (levelNo) => ({
        url: `/admitted/students/level/${levelNo}`,
        method: "GET",
      }),
    }),

    getAdmittedStudentsById: builder.query({
      query: (id) => ({
        url: `/admitted/students/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: 'Student', id }
      ],
    }),

    getPermissionStudent: builder.query({
      query: () => ({
        url: `/admitted/students/permission_students`,
        method: "GET",
      }),
    }),

    updatePermission: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admitted/students/update_permission_student/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),

    updatePlacement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admitted/students/update-placement/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    updateTechnology: builder.mutation({
      query: ({ id, techno }) => {
        const fullUrl = `/admitted/students/update_technology/${id}`;
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
          dispatch(authApi.util.invalidateTags([{ type: 'Student', id }]));
        } catch (error) {
          // Error handled by toast
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

    updateStudentEmail: builder.mutation({
      query: ({ id, email }) => ({
        url: `/admitted/students/update/email/${id}`,
        method: "PATCH",
        body: { email },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id }
      ],
    }),


    // Get student level interviews for history page
    getStudentLevelInterviews: builder.query({
      query: (studentId) => ({
        url: `/admitted/students/get_levels/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: 'Student', id: studentId }
      ],
    }),



    //Placement api calling
    // get all ready students for placement
    getReadyStudentsForPlacement: builder.query({
      query: () => ({
        url: '/admitted/students/Ready_Students',
        method: "GET",
      }),
      providesTags: ['PlacementStudent'],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),

    addPlacementInterviewRecord: builder.mutation({
      query: ({ studentId, interviewData }) => ({
        url: `/admitted/students/interviews/${studentId}`,
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
        url: `/admitted/students/update/interviews/${studentId}/${interviewId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['PlacementStudent'],
      // Force immediate cache invalidation and refetch
      async onQueryStarted({ studentId, interviewId, ...data }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          dispatch(authApi.util.invalidateTags([{ type: 'PlacementStudent', id: studentId }]));
        } catch (error) {
          // Error handled by toast
        }
      },
    }),

    // Upload resume
    uploadResume: builder.mutation({
      query: ({ studentId, fileName, fileData }) => ({
        url: '/admitted/students/upload_Resume_Base64',
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
          // Error handled by toast
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
          // Error handled by toast
        }
      },
    }),

    // Confirm placement
    confirmPlacement: builder.mutation({
      query: (data) => ({
        url: `/admitted/students/confirm_placement`,
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ['PlacementStudent', 'Student'],
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['PlacementStudent']));
          dispatch(authApi.util.invalidateTags(['Student']));
        } catch (error) {
          console.error('Error confirming placement:', error);
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

    // Update placement post
    updatePlacementPost: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/admitted/students/placement_post/update/${studentId}`,
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

    // Get placed students by company ID
    getPlacedStudentsByCompany: builder.query({
      query: (companyId) => ({
        url: `/admitted/students/companies/placed_students/${companyId}`,
        method: "GET",
      }),
      providesTags: (result, error, companyId) => [
        { type: 'PlacementStudent', id: companyId }
      ],
    }),

    // Get ITEG attendance data
    getItegAttendance: builder.query({
      query: ({ dateFrom, dateTo }) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        return {
          url: `${import.meta.env.VITE_ITEG_ATTENDANCE_API_URL}${import.meta.env.VITE_ITEG_ATTENDANCE_ENDPOINT}?${params.toString()}`,
          method: "GET",
          headers: {
            'x-api-key': import.meta.env.VITE_ITEG_ATTENDANCE_API_KEY
          }
        };
      },
      providesTags: ['ItegAttendance'],
      keepUnusedDataFor: 300,
    }),

    // Get ITEG student attendance details
    getItegStudentAttendance: builder.query({
      query: ({ year, dateFrom, dateTo }) => {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        return {
          url: `${import.meta.env.VITE_ITEG_ATTENDANCE_API_URL}${import.meta.env.VITE_ITEG_ATTENDANCE_STUDENTS_ENDPOINT}/${year}?${params.toString()}`,
          method: "GET",
          headers: {
            'x-api-key': import.meta.env.VITE_ITEG_ATTENDANCE_API_KEY
          }
        };
      },
      providesTags: ['ItegStudentAttendance'],
      keepUnusedDataFor: 300,
    }),



    // Get student attendance calendar
    getStudentAttendanceCalendar: builder.query({
      query: ({ stdId, dateFrom, dateTo }) => {
        const params = new URLSearchParams();
        params.append('stdId', stdId);
        params.append('dateFrom', dateFrom);
        params.append('dateTo', dateTo);

        return {
          url: `${import.meta.env.VITE_ITEG_ATTENDANCE_API_URL}/student-attendance-calendar?${params.toString()}`,
          method: "GET",
          headers: {
            'x-api-key': import.meta.env.VITE_ITEG_ATTENDANCE_API_KEY
          }
        };
      },
      providesTags: ['StudentCalendar'],
      keepUnusedDataFor: 300,
    }),

    // Get all users (superadmin only)
    getAllUsers: builder.query({
      query: () => ({
        url: '/user/all',
        method: "GET",
      }),
      providesTags: ['User'],
    }),

    // Delete user (superadmin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/user/delete/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['User'],
    }),

    // Edit user (superadmin only)
    editUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/user/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query({
      query: (userId) => ({
        url: `/user/get/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: 'User', id: userId }
      ],
    }),

    // Get report card by student ID
    getReportCard: builder.query({
      query: (studentId) => ({
        url: `/reportcards/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: 'Student', id: studentId }
      ],
    }),

    // Create report card
    createReportCard: builder.mutation({
      query: (reportData) => {
        return {
          url: '/reportcards',
          method: "POST",
          body: reportData,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: ['Student'],
    }),

    // Get report card for editing
    getReportCardForEdit: builder.query({
      query: (studentId) => ({
        url: `/reportcards/${studentId}/edit`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: 'Student', id: studentId }
      ],
    }),

    // Update report card
    updateReportCard: builder.mutation({
      query: ({ id, ...reportData }) => ({
        url: `/reportcards/report-card/${id}`,
        method: "PUT",
        body: reportData,
      }),
      invalidatesTags: ['Student'],
    }),

    // Add Department
    addDepartment: builder.mutation({
      query: (departmentData) => ({
        url: '/departments/add',
        method: "POST",
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Get All Departments
    getAllDepartments: builder.query({
      query: () => ({
        url: '/departments/all',
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Update Department
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Department
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Add Subdepartment
    addSubdepartment: builder.mutation({
      query: ({ departmentId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update Subdepartment
    updateSubdepartment: builder.mutation({
      query: ({ departmentId, subdepartmentId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Subdepartment
    deleteSubdepartment: builder.mutation({
      query: ({ departmentId, subdepartmentId }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Get Subdepartments by Department
    getSubdepartmentsByDepartment: builder.query({
      query: (departmentId) => ({
        url: `/departments/${departmentId}/subdepartments`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Get Levels by Subdepartment
    getLevelsBySubdepartment: builder.query({
      query: ({ departmentId, subdepartmentId }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Add Level
    addLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update Level
    updateLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, levelId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Level
    deleteLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, levelId }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Add SubLevel
    addSubLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, levelId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}/sublevels`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update SubLevel
    updateSubLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, levelId, subLevelId, ...data }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}/sublevels/${subLevelId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete SubLevel
    deleteSubLevel: builder.mutation({
      query: ({ departmentId, subdepartmentId, levelId, subLevelId }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}/sublevels/${subLevelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Get SubLevels by Level
    getSubLevelsByLevel: builder.query({
      query: ({ departmentId, subdepartmentId, levelId }) => ({
        url: `/departments/${departmentId}/subdepartments/${subdepartmentId}/levels/${levelId}/sublevels`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Role Management APIs
    createRole: builder.mutation({
      query: (roleData) => ({
        url: '/roles/create',
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),

    getAllRoles: builder.query({
      query: () => ({
        url: '/roles/all',
        method: "GET",
      }),
      providesTags: ['Role'],
    }),

    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/roles/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ['Role'],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Role'],
    }),

    // Permissions Management APIs
    getAllPossiblePermissions: builder.query({
      query: () => '/user/permissions/all',
      providesTags: ['Permission'],
    }),

    getUserPermissions: builder.query({
      query: (id) => `/user/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),

    updateUserPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/user/permissions/${id}`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Permission', id }],
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
 useCreatePlacementPostMutation ,
  useUpdatePlacementPostMutation,
  useGetAllCompaniesQuery,
  useGetPlacedStudentsByCompanyQuery,
  useGetItegAttendanceQuery,
  useGetItegStudentAttendanceQuery,
  useUpdateStudentEmailMutation,

  useGetStudentAttendanceCalendarQuery,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useEditUserMutation,
  useGetUserByIdQuery,
  useGetReportCardQuery,
  useCreateReportCardMutation,
  useGetReportCardForEditQuery,
  useUpdateReportCardMutation,
  useAddDepartmentMutation,
  useGetAllDepartmentsQuery,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useAddSubdepartmentMutation,
  useUpdateSubdepartmentMutation,
  useDeleteSubdepartmentMutation,
  useGetSubdepartmentsByDepartmentQuery,
  useGetLevelsBySubdepartmentQuery,
  useAddLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useAddSubLevelMutation,
  useUpdateSubLevelMutation,
  useDeleteSubLevelMutation,
  useGetSubLevelsByLevelQuery,
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAllPossiblePermissionsQuery,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation
} = authApi;
