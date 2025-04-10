// services/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiPro = createApi({
  reducerPath: "apiPro",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/",
  }),
  endpoints: (builder) => ({
    loginAdmin: builder.mutation({
      query: (credentials) => ({
        url: "admin/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginAdminMutation } = apiPro;
