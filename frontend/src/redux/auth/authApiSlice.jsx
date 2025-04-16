import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // only if you're using cookies/sessions
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/admin/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // Faculty login
    facultyLogin: builder.mutation({
      query: (credentials) => ({
        url: "/faculty/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation, useFacultyLoginMutation } = authApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const authApi = createApi({
//   reducerPath: "authApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:5000/api",
//     credentials: "include", // only if you're using cookies/sessions
//   }),
//   endpoints: (builder) => ({
//     login: builder.mutation({
//       query: (credentials) => ({
//         url: "/admin/login",
//         method: "POST",
//         body: credentials,
//       }),
//     }),
//     // Faculty login
//     facultyLogin: builder.mutation({
//       query: (credentials) => ({
//         url: "/faculty/login",
//         method: "POST",
//         body: credentials,
//       }),
//     }),
//   }),
// });

// export const { useLoginMutation, useFacultyLoginMutation } = authApi;
