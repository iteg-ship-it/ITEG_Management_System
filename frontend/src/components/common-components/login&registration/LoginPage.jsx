import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../redux/auth/authApiSlice";
import CryptoJS from "crypto-js";
import logo from "../../../assets/images/logo-ssism.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const secretKey = "ITEG@123";

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Too short").required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await login(values).unwrap();
        const encryptedToken = CryptoJS.AES.encrypt(
          response.token,
          secretKey
        ).toString();
        localStorage.setItem("token", encryptedToken);
        navigate("/", { replace: true }); // Redirect to dashboard without reload
      } catch (error) {
        setLoginError(error?.data?.message || "Login failed");
      }
    },
  });

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-16" />
          <h2 className="text-2xl font-bold mt-4">Login</h2>
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className="w-full p-3 mb-2 border rounded focus:outline-none"
        />
        {formik.touched.email && formik.errors.email && (
          <div className="text-red-500 text-sm mb-2">{formik.errors.email}</div>
        )}

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          className="w-full p-3 mb-2 border rounded focus:outline-none"
        />
        {formik.touched.password && formik.errors.password && (
          <div className="text-red-500 text-sm mb-2">
            {formik.errors.password}
          </div>
        )}

        {loginError && (
          <div className="text-red-600 text-sm mb-2">{loginError}</div>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded mt-4"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
