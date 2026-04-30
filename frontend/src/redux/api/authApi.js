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

const baseQueryWithSilentErrors = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

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
<<<<<<< HEAD
  tagTypes: ['Student', 'PlacementStudent', 'User', 'Department', 'Role', 'Permission', 'Task', 'Session', 'Syllabus', 'Company'],
=======
  tagTypes: ['Student', 'PlacementStudent', 'User', 'Department', 'Role', 'Permission', 'SyllabusVersion', 'Session', 'TaskMaster'],
>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
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
        url: `/admitted/students/get_student_by_level/${levelNo}`,
        method: "GET",
      }),
      providesTags: ['Student'],
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

    // Get current user
    getCurrentUser: builder.query({
      query: () => ({
        url: '/user/me',
        method: "GET",
      }),
      providesTags: ['User'],
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
      query: (formData) => ({
        url: '/departments',
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Get All Departments
    getAllDepartments: builder.query({
      query: () => ({
        url: '/departments',
        method: "GET",
      }),
      providesTags: ['Department'],
      keepUnusedDataFor: 300,
    }),

    // Update Department
    updateDepartment: builder.mutation({
      query: ({ id, _formData }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: _formData,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Department
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Add Subdepartment
    addSubdepartment: builder.mutation({
      query: (data) => ({
        url: '/subdepartments',
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update Subdepartment
    updateSubdepartment: builder.mutation({
      query: ({ subdepartmentId, ...data }) => ({
        url: `/subdepartments/${subdepartmentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Subdepartment
    deleteSubdepartment: builder.mutation({
      query: (subdepartmentId) => ({
        url: `/subdepartments/${subdepartmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Get Subdepartments by Department
    getSubdepartmentsByDepartment: builder.query({
      query: (departmentId) => ({
        url: `/subdepartments/department/${departmentId}`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Get All Subdepartments
    getAllSubdepartments: builder.query({
      query: () => ({
        url: '/subdepartments',
        method: "GET",
      }),
      providesTags: ['Department'],
      keepUnusedDataFor: 300,
    }),

    // Get Subdepartment by ID
    getSubdepartmentById: builder.query({
      query: (id) => ({
        url: `/subdepartments/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),

    // Get Levels by Subdepartment
    getLevelsBySubdepartment: builder.query({
      query: (subdepartmentId) => ({
        url: `/levels/subdepartment/${subdepartmentId}`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

    // Add Level
    addLevel: builder.mutation({
      query: (data) => ({
        url: '/levels',
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update Level
    updateLevel: builder.mutation({
      query: ({ levelId, ...data }) => ({
        url: `/levels/${levelId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete Level
    deleteLevel: builder.mutation({
      query: (levelId) => ({
        url: `/levels/${levelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Add SubLevel
    addSubLevel: builder.mutation({
      query: (data) => ({
        url: '/sublevels',
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Update SubLevel
    updateSubLevel: builder.mutation({
      query: ({ subLevelId, ...data }) => ({
        url: `/sublevels/${subLevelId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),

    // Delete SubLevel
    deleteSubLevel: builder.mutation({
      query: (subLevelId) => ({
        url: `/sublevels/${subLevelId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Department'],
    }),

    // Get SubLevels by Level
    getSubLevelsByLevel: builder.query({
      query: (levelId) => ({
        url: `/sublevels/level/${levelId}`,
        method: "GET",
      }),
      providesTags: ['Department'],
    }),

 // Get All Levels
    getAllLevels: builder.query({
      query: () => ({
        url: '/levels',
        method: "GET",
      }),
      providesTags: ['Department'],
      keepUnusedDataFor: 300,
    }),
    // ─── Role Management ───────────────────────────────────────────
    createRole: builder.mutation({
      query: (roleData) => ({ url: '/roles/create', method: 'POST', body: roleData }),
      invalidatesTags: ['Role'],
    }),
    getAllRoles: builder.query({
      query: () => '/roles/all',
      providesTags: ['Role'],
    }),
    getRoleById: builder.query({
      query: (id) => `/roles/get/${id}`,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/roles/update/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/roles/delete/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Role'],
    }),

    // ─── Permissions ───────────────────────────────────────────────
    getAllPossiblePermissions: builder.query({
      query: () => '/user/permissions/all',
      providesTags: ['Permission'],
    }),
    getUserPermissions: builder.query({
      query: (id) => `/user/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permission', id }],
    }),
    updateUserPermissions: builder.mutation({
      query: ({ id, permissions }) => ({ url: `/user/permissions/${id}`, method: 'PUT', body: { permissions } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Permission', id }],
    }),

<<<<<<< HEAD
    // ─── Student (Admitted) ────────────────────────────────────────
    getDashboardStats: builder.query({
      query: () => '/admitted/students/dashboard/stats',
      providesTags: ['Student'],
    }),
    getAttendanceStats: builder.query({
      query: () => '/admitted/students/attendance/stats',
      providesTags: ['Student'],
    }),
    getSelectedStudents: builder.query({
      query: () => '/admitted/students/selected_students',
      providesTags: ['PlacementStudent'],
    }),
    getPlacedStudents: builder.query({
      query: () => '/admitted/students/placed_students',
      providesTags: ['PlacementStudent'],
    }),
    updateJobType: builder.mutation({
      query: (data) => ({ url: '/admitted/students/update_job_type', method: 'PATCH', body: data }),
      invalidatesTags: ['PlacementStudent'],
    }),
    getPlacementDocuments: builder.query({
      query: (studentId) => `/admitted/students/placement_documents/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Student', id: studentId }],
    }),
    uploadPlacementDocuments: builder.mutation({
      query: (data) => ({ url: '/admitted/students/placement_documents', method: 'POST', body: data }),
      invalidatesTags: ['PlacementStudent'],
    }),
    getCompanyByName: builder.query({
      query: (companyName) => `/admitted/students/companies/${companyName}`,
      providesTags: ['Company'],
    }),
    generatePlacementPost: builder.mutation({
      query: (data) => ({ url: '/admitted/students/generate', method: 'POST', body: data }),
    }),
    getLevelWiseStudents: builder.query({
      query: (levelNo) => `/admitted/students/level/${levelNo}`,
      providesTags: ['Student'],
    }),
    getStudentsByLevelWithTasks: builder.query({
      query: (level) => `/tasks/level/${level}/students`,
      providesTags: ['Student'],
    }),

    // ─── Tasks ─────────────────────────────────────────────────────
    getTasksByLevel: builder.query({
      query: (level) => `/tasks/level/${level}`,
      providesTags: ['Task'],
    }),
    getStudentTasks: builder.query({
      query: (studentId) => `/tasks/student/${studentId}`,
      providesTags: (result, error, studentId) => [{ type: 'Task', id: studentId }],
    }),
    updateStudentTaskStatus: builder.mutation({
      query: ({ studentId, taskId, ...data }) => ({
        url: `/tasks/student/${studentId}/task/${taskId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [{ type: 'Task', id: studentId }],
    }),
    getStudentTaskPerformance: builder.query({
      query: (studentId) => `/tasks/student/${studentId}/performance`,
      providesTags: (result, error, studentId) => [{ type: 'Task', id: studentId }],
    }),
    bulkUploadTasks: builder.mutation({
      query: (data) => ({ url: '/tasks/bulk-upload', method: 'POST', body: data }),
      invalidatesTags: ['Task'],
    }),
    bulkUploadTasksToSelectedStudents: builder.mutation({
      query: (data) => ({ url: '/tasks/bulk-upload-selected', method: 'POST', body: data }),
      invalidatesTags: ['Task'],
    }),
    createIndividualTask: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/tasks/student/${studentId}/create`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [{ type: 'Task', id: studentId }],
    }),

    // ─── Sessions ──────────────────────────────────────────────────
=======
    // --- Session APIs ---
    getAllSessions: builder.query({
      query: () => ({ url: '/sessions', method: 'GET' }),
      providesTags: ['Session'],
    }),

>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
    createSession: builder.mutation({
      query: (data) => ({ url: '/sessions', method: 'POST', body: data }),
      invalidatesTags: ['Session'],
    }),
<<<<<<< HEAD
    getAllSessions: builder.query({
      query: () => '/sessions',
      providesTags: ['Session'],
    }),
    getSessionById: builder.query({
      query: (id) => `/sessions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Session', id }],
    }),
=======

>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
    updateSession: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/sessions/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Session'],
    }),
<<<<<<< HEAD
=======

>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
    deleteSession: builder.mutation({
      query: (id) => ({ url: `/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Session'],
    }),

<<<<<<< HEAD
    // ─── Syllabus ──────────────────────────────────────────────────
    createSyllabus: builder.mutation({
      query: (data) => ({ url: '/syllabus', method: 'POST', body: data }),
      invalidatesTags: ['Syllabus'],
    }),
    getAllSyllabus: builder.query({
      query: () => '/syllabus',
      providesTags: ['Syllabus'],
    }),
    getSyllabusById: builder.query({
      query: (id) => `/syllabus/${id}`,
      providesTags: (result, error, id) => [{ type: 'Syllabus', id }],
    }),
    updateSyllabus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/syllabus/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Syllabus'],
    }),
    deleteSyllabus: builder.mutation({
      query: (id) => ({ url: `/syllabus/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Syllabus'],
    }),
    approveSyllabus: builder.mutation({
      query: (id) => ({ url: `/syllabus/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Syllabus'],
    }),
    activateSyllabus: builder.mutation({
      query: (id) => ({ url: `/syllabus/${id}/activate`, method: 'POST' }),
      invalidatesTags: ['Syllabus'],
    }),

    // ─── Department (by ID) ────────────────────────────────────────
    getDepartmentById: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),

    // ─── Admission Process ─────────────────────────────────────────
    updateInterviewFlag: builder.mutation({
      query: (studentId) => ({ url: `/admission/students/update_interview_flag/${studentId}`, method: 'PUT' }),
      invalidatesTags: ['Student'],
=======
    // --- Syllabus Version APIs ---
    createSyllabusVersion: builder.mutation({
      query: (data) => ({
        url: '/syllabus/versions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    getAllSyllabusVersions: builder.query({
      query: (params = '') => ({
        url: `/syllabus/versions${params ? `?${params}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['SyllabusVersion'],
    }),

    getSyllabusVersionById: builder.query({
      query: (id) => ({
        url: `/syllabus/versions/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SyllabusVersion', id }],
    }),

    // Returns full version with subjects/topics/subtopics embedded
    getSyllabusVersionWithHierarchy: builder.query({
      query: (id) => ({
        url: `/syllabus/versions/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SyllabusVersion', id }],
    }),

    getSyllabusVersionsBySession: builder.query({
      query: (sessionId) => ({
        url: `/syllabus/versions?sessionId=${sessionId}`,
        method: 'GET',
      }),
      providesTags: ['SyllabusVersion'],
    }),

    getSyllabusVersionsBySubLevel: builder.query({
      query: ({ subLevelId, sessionId } = {}) => {
        if (!subLevelId) return { url: '/syllabus/versions', method: 'GET' };
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        return { url: `/syllabus/versions/sublevel/${subLevelId}${params}`, method: 'GET' };
      },
      providesTags: ['SyllabusVersion'],
    }),

    updateSyllabusVersion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/syllabus/versions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    deleteSyllabusVersion: builder.mutation({
      query: (id) => ({
        url: `/syllabus/versions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    // approve = activate (backend mein approve nahi hai, activate hai)
    approveSyllabusVersion: builder.mutation({
      query: (id) => ({
        url: `/syllabus/versions/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    activateSyllabusVersion: builder.mutation({
      query: (id) => ({
        url: `/syllabus/versions/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    archiveSyllabusVersion: builder.mutation({
      query: (id) => ({
        url: `/syllabus/versions/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    // --- Task APIs (separate Task collection) ---
    getTasksBySyllabusVersion: builder.query({
      query: (syllabusVersionId) => ({
        url: `/syllabus/versions/${syllabusVersionId}/tasks`,
        method: 'GET',
      }),
      providesTags: (result, error, syllabusVersionId) => [
        { type: 'SyllabusVersion', id: syllabusVersionId },
      ],
    }),

    createTaskMaster: builder.mutation({
      query: ({ syllabusVersionId, subjectId, topicId, subTopicId, ...taskData }) => ({
        url: `/syllabus/versions/${syllabusVersionId}/tasks`,
        method: 'POST',
        body: { subjectId, topicId, subTopicId, ...taskData },
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'SyllabusVersion', id: data.syllabusVersionId },
      ],
    }),

    updateTaskMaster: builder.mutation({
      query: ({ syllabusVersionId, taskId, isActive }) => ({
        url: `/syllabus/versions/${syllabusVersionId}/tasks/${taskId}/active`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['SyllabusVersion'],
    }),

    // Bulk upload via JSON subjects payload
    bulkUploadTasks: builder.mutation({
      query: ({ syllabusVersionId, subjects }) => ({
        url: `/syllabus/versions/${syllabusVersionId}/subjects/upload`,
        method: 'POST',
        body: { subjects },
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'SyllabusVersion', id: data.syllabusVersionId },
      ],
    }),

    // Subjects from embedded SyllabusVersion
    getSubjectsByVersion: builder.query({
      query: (syllabusVersionId) => ({ url: `/syllabus/versions/${syllabusVersionId}`, method: 'GET' }),
      transformResponse: (response) => ({ data: response?.data?.subjects || [] }),
      providesTags: (result, error, id) => [{ type: 'SyllabusVersion', id }],
    }),

    // Topics from a subject (need syllabusVersionId:subjectId format)
    getTopicsBySubject: builder.query({
      query: (subjectId) => ({ url: `/syllabus/versions?subjectId=${subjectId}`, method: 'GET' }),
      transformResponse: (response) => ({ data: [] }),
      providesTags: ['SyllabusVersion'],
    }),

    getSubTopicsByTopic: builder.query({
      query: (topicId) => ({ url: `/syllabus/versions?topicId=${topicId}`, method: 'GET' }),
      transformResponse: (response) => ({ data: [] }),
      providesTags: ['SyllabusVersion'],
    }),

    createTaskManual: builder.mutation({
      query: ({ syllabusVersionId, subjectId, topicId, subTopicId, ...taskData }) => ({
        url: `/syllabus/versions/${syllabusVersionId}/tasks`,
        method: 'POST',
        body: { subjectId, topicId, subTopicId, ...taskData },
      }),
      invalidatesTags: ['SyllabusVersion'],
>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
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
  useGetCurrentUserQuery,
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
  useGetAllSubdepartmentsQuery,
  useGetSubdepartmentByIdQuery,
  useGetLevelsBySubdepartmentQuery,
  useAddLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useAddSubLevelMutation,
  useUpdateSubLevelMutation,
  useDeleteSubLevelMutation,
  useGetSubLevelsByLevelQuery,  
  useGetAllLevelsQuery,
  useCreateRoleMutation,
  useGetAllRolesQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAllPossiblePermissionsQuery,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
<<<<<<< HEAD
  // Role
  useGetRoleByIdQuery,
  // Student extras
  useGetDashboardStatsQuery,
  useGetAttendanceStatsQuery,
  useGetSelectedStudentsQuery,
  useGetPlacedStudentsQuery,
  useUpdateJobTypeMutation,
  useGetPlacementDocumentsQuery,
  useUploadPlacementDocumentsMutation,
  useGetCompanyByNameQuery,
  useGeneratePlacementPostMutation,
  useGetLevelWiseStudentsQuery,
  useGetStudentsByLevelWithTasksQuery,
  // Tasks
  useGetTasksByLevelQuery,
  useGetStudentTasksQuery,
  useUpdateStudentTaskStatusMutation,
  useGetStudentTaskPerformanceQuery,
  useBulkUploadTasksMutation,
  useBulkUploadTasksToSelectedStudentsMutation,
  useCreateIndividualTaskMutation,
  // Sessions
  useCreateSessionMutation,
  useGetAllSessionsQuery,
  useGetSessionByIdQuery,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  // Syllabus
  useCreateSyllabusMutation,
  useGetAllSyllabusQuery,
  useGetSyllabusByIdQuery,
  useUpdateSyllabusMutation,
  useDeleteSyllabusMutation,
  useApproveSyllabusMutation,
  useActivateSyllabusMutation,
  // Department by ID
  useGetDepartmentByIdQuery,
  // Admission
  useUpdateInterviewFlagMutation,
=======
  useGetAllSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCreateSyllabusVersionMutation,
  useGetAllSyllabusVersionsQuery,
  useGetSyllabusVersionByIdQuery,
  useGetSyllabusVersionWithHierarchyQuery,
  useGetSyllabusVersionsBySessionQuery,
  useGetSyllabusVersionsBySubLevelQuery,
  useUpdateSyllabusVersionMutation,
  useDeleteSyllabusVersionMutation,
  useApproveSyllabusVersionMutation,
  useActivateSyllabusVersionMutation,
  useArchiveSyllabusVersionMutation,
  useGetTasksBySyllabusVersionQuery,
  useCreateTaskMasterMutation,
  useUpdateTaskMasterMutation,
  useBulkUploadTasksMutation,
  useGetSubjectsByVersionQuery,
  useGetTopicsBySubjectQuery,
  useGetSubTopicsByTopicQuery,
  useCreateTaskManualMutation,
>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
} = authApi;
