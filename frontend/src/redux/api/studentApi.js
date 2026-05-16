import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import CryptoJS from "crypto-js";

const SECRET_KEY = "ITEG@123";
const decrypt = (enc) => {
  try {
    if (!enc) return null;
    return CryptoJS.AES.decrypt(enc, SECRET_KEY).toString(CryptoJS.enc.Utf8) || null;
  } catch { return null; }
};

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = decrypt(localStorage.getItem("studentToken"));
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["StudentProfile", "StudentTasks", "StudentHistory", "StudentSnapshots", "StudentEvents"],
  endpoints: (builder) => ({

    getMyStudentProfile: builder.query({
      query: () => ({ url: "/student-auth/me", method: "GET" }),
      providesTags: ["StudentProfile"],
    }),

    updateMyStudentProfileImage: builder.mutation({
      query: ({ image }) => ({ url: "/student-auth/me/profile-image", method: "PATCH", body: { image } }),
      invalidatesTags: ["StudentProfile"],
    }),

    changeMyStudentPassword: builder.mutation({
      query: (data) => ({ url: "/student-auth/me/change-password", method: "PATCH", body: data }),
    }),

    getMyStudentTasks: builder.query({
      query: (params = "") => ({ url: `/student-auth/me/tasks${params ? `?${params}` : ""}`, method: "GET" }),
      providesTags: ["StudentTasks"],
    }),

    getMyStudentLevelHistory: builder.query({
      query: () => ({ url: "/student-auth/me/level-history", method: "GET" }),
      providesTags: ["StudentHistory"],
    }),

    getMyStudentSnapshots: builder.query({
      query: (params = "") => ({ url: `/student-auth/me/snapshots${params ? `?${params}` : ""}`, method: "GET" }),
      providesTags: ["StudentSnapshots"],
    }),

    getMyStudentEventLog: builder.query({
      query: (params = "") => ({ url: `/student-auth/me/event-log${params ? `?${params}` : ""}`, method: "GET" }),
      providesTags: ["StudentEvents"],
    }),

    // Phase 3 — Permissions
    applyMyPermission: builder.mutation({
      query: (data) => ({ url: "/student-auth/me/permissions", method: "POST", body: data }),
      invalidatesTags: ["StudentProfile"],
    }),

    getMyPermissions: builder.query({
      query: () => ({ url: "/student-auth/me/permissions", method: "GET" }),
      providesTags: ["StudentProfile"],
    }),

    // Phase 3 — Documents
    uploadMyExtraDocument: builder.mutation({
      query: (data) => ({ url: "/student-auth/me/extra-documents", method: "POST", body: data }),
      invalidatesTags: ["StudentProfile"],
    }),

    getMyExtraDocuments: builder.query({
      query: () => ({ url: "/student-auth/me/extra-documents", method: "GET" }),
      providesTags: ["StudentProfile"],
    }),

    // Phase 4 — Placement + Report Card
    getMyPlacement: builder.query({
      query: () => ({ url: "/student-auth/me/placement", method: "GET" }),
      providesTags: ["StudentProfile"],
    }),

    getMyReportCard: builder.query({
      query: () => ({ url: "/student-auth/me/report-card", method: "GET" }),
      providesTags: ["StudentProfile"],
    }),

  }),
});

export const {
  useGetMyStudentProfileQuery,
  useUpdateMyStudentProfileImageMutation,
  useChangeMyStudentPasswordMutation,
  useGetMyStudentTasksQuery,
  useGetMyStudentLevelHistoryQuery,
  useGetMyStudentSnapshotsQuery,
  useGetMyStudentEventLogQuery,
  useApplyMyPermissionMutation,
  useGetMyPermissionsQuery,
  useUploadMyExtraDocumentMutation,
  useGetMyExtraDocumentsQuery,
  useGetMyPlacementQuery,
  useGetMyReportCardQuery,
} = studentApi;
