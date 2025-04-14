import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../redux/auth/authApiSlice";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo-ssism.png";
import googleLogo from "../../../assets/images/Google.png";
import linkedinLogo from "../../../assets/images/linkedin.png";
import facebookLogo from "../../../assets/images/FB.png";
import CryptoJS from "crypto-js"; // 🔐 Import crypto-js

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const secretKey = "ITEG@123"; // 🔐 Use a secure key in production from env

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await login(values).unwrap();
        console.log("Login Success:", response);

        // 🔒 Encrypt and store token in localStorage
        const encryptedToken = CryptoJS.AES.encrypt(
          response.token,
          secretKey
        ).toString();
        localStorage.setItem("token", encryptedToken);

        navigate("/"); // redirect to dashboard/home
      } catch (error) {
        console.error("Login failed:", error);
        setLoginError(error?.data?.message || "Invalid email or password.");
      }
    },
  });

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <div className="flex flex-col items-center">
          <img src={logo} alt="SSISM Logo" className="h-20" />
          <h2 className="text-2xl font-bold">Login</h2>
        </div>

        <div className="mt-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
              formik.touched.email && formik.errors.email
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-orange-500"
            }`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm mb-2">{formik.errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
              formik.touched.password && formik.errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-orange-500"
            }`}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm mb-2">
              {formik.errors.password}
            </p>
          )}

          {loginError && (
            <p className="text-red-600 text-sm mb-2">{loginError}</p>
          )}

          <p className="text-right text-sm text-gray-500">
            Forgot Your Password
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Sign in"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button type="button">
            <img src={googleLogo} alt="Google" className="h-12" />
          </button>
          <button type="button">
            <img src={linkedinLogo} alt="LinkedIn" className="h-12" />
          </button>
          <button type="button">
            <img src={facebookLogo} alt="Facebook" className="h-12" />
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 cursor-pointer hover:text-orange-800 transition"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

// use thidds code where want to decrypt the token
// import CryptoJS from "crypto-js";

// const secretKey = "ITEG@123";
// const encryptedToken = localStorage.getItem("token");

// if (encryptedToken) {
//   const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
//   const token = bytes.toString(CryptoJS.enc.Utf8);
//   console.log("Decrypted Token:", token);
// }

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { useLoginMutation } from "../../../redux/auth/authApiSlice"; // adjust the path as needed
// import { Link } from "react-router-dom";
// import logo from "../../../assets/images/logo-ssism.png";
// import googleLogo from "../../../assets/images/Google.png";
// import linkedinLogo from "../../../assets/images/linkedin.png";
// import facebookLogo from "../../../assets/images/FB.png";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [loginError, setLoginError] = useState("");
//   const [login, { isLoading }] = useLoginMutation();

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: Yup.object({
//       email: Yup.string()
//         .email("Invalid email address")
//         .required("Email is required"),
//       password: Yup.string()
//         .min(6, "Password must be at least 6 characters")
//         .required("Password is required"),
//     }),
//     onSubmit: async (values) => {
//       try {
//         const response = await login(values).unwrap();
//         console.log("Login Success:", response);

//         // Example: store token in localStorage if returned
//         localStorage.setItem("token", response.token);

//         navigate("/"); // redirect to dashboard/home
//       } catch (error) {
//         console.error("Login failed:", error);
//         setLoginError(error?.data?.message || "Invalid email or password.");
//       }
//     },
//   });

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form
//         onSubmit={formik.handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
//       >
//         <div className="flex flex-col items-center">
//           <img src={logo} alt="SSISM Logo" className="h-20" />
//           <h2 className="text-2xl font-bold">Login</h2>
//         </div>

//         <div className="mt-6">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.email}
//             className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
//               formik.touched.email && formik.errors.email
//                 ? "border-red-500 focus:ring-red-500"
//                 : "focus:ring-orange-500"
//             }`}
//           />
//           {formik.touched.email && formik.errors.email && (
//             <p className="text-red-500 text-sm mb-2">{formik.errors.email}</p>
//           )}

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.password}
//             className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
//               formik.touched.password && formik.errors.password
//                 ? "border-red-500 focus:ring-red-500"
//                 : "focus:ring-orange-500"
//             }`}
//           />
//           {formik.touched.password && formik.errors.password && (
//             <p className="text-red-500 text-sm mb-2">
//               {formik.errors.password}
//             </p>
//           )}

//           {loginError && (
//             <p className="text-red-600 text-sm mb-2">{loginError}</p>
//           )}

//           <p className="text-right text-sm text-gray-500">
//             Forgot Your Password
//           </p>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
//           disabled={isLoading}
//         >
//           {isLoading ? "Logging in..." : "Sign in"}
//         </button>

//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-300"></div>
//           <span className="mx-2 text-gray-500">or</span>
//           <div className="flex-grow border-t border-gray-300"></div>
//         </div>

//         <div className="flex justify-center gap-4">
//           <button type="button">
//             <img src={googleLogo} alt="Google" className="h-12" />
//           </button>
//           <button type="button">
//             <img src={linkedinLogo} alt="LinkedIn" className="h-12" />
//           </button>
//           <button type="button">
//             <img src={facebookLogo} alt="Facebook" className="h-12" />
//           </button>
//         </div>

//         <p className="text-center mt-4 text-gray-600">
//           Don't have an account?{" "}
//           <Link
//             to="/signup"
//             className="text-orange-500 cursor-pointer hover:text-orange-800 transition"
//           >
//             Sign Up
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;

// import React, { useEffect, useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import logo from "../../../assets/images/logo-ssism.png";
// import googleLogo from "../../../assets/images/Google.png";
// import linkedinLogo from "../../../assets/images/linkedin.png";
// import facebookLogo from "../../../assets/images/FB.png";

// const Login = () => {
//   const navigate = useNavigate();
//   const [loginError, setLoginError] = useState("");

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validationSchema: Yup.object({
//       email: Yup.string()
//         .email("Invalid email address")
//         .required("Email is required"),
//       password: Yup.string()
//         .min(6, "Password must be at least 6 characters")
//         .required("Password is required"),
//     }),
//     onSubmit: (values) => {
//       const users = JSON.parse(localStorage.getItem("users")) || [];
//       const matchedUser = users.find(
//         (user) =>
//           user.email === values.email && user.password === values.password
//       );

//       if (matchedUser) {
//         // Set login state (you could also use context here)
//         localStorage.setItem("isAuthenticated", "true");
//         navigate("/"); // Redirect to home/dashboard
//       } else {
//         setLoginError("Invalid email or password.");
//       }
//     },
//   });

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <form
//         onSubmit={formik.handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm"
//       >
//         <div className="flex flex-col items-center">
//           <img
//             src={logo} // Use the imported variable
//             alt="SSISM Logo"
//             className="h-20"
//           />
//           <h2 className="text-2xl font-bold">Login</h2>
//         </div>

//         <div className="mt-6">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.email}
//             className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
//               formik.touched.email && formik.errors.email
//                 ? "border-red-500 focus:ring-red-500"
//                 : "focus:ring-orange-500"
//             }`}
//           />
//           {formik.touched.email && formik.errors.email && (
//             <p className="text-red-500 text-sm mb-2">{formik.errors.email}</p>
//           )}

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             value={formik.values.password}
//             className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${
//               formik.touched.password && formik.errors.password
//                 ? "border-red-500 focus:ring-red-500"
//                 : "focus:ring-orange-500"
//             }`}
//           />
//           {formik.touched.password && formik.errors.password && (
//             <p className="text-red-500 text-sm mb-2">
//               {formik.errors.password}
//             </p>
//           )}

//           {loginError && (
//             <p className="text-red-600 text-sm mb-2">{loginError}</p>
//           )}

//           <p className="text-right text-sm text-gray-500">
//             Forgot Your Password
//           </p>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
//         >
//           Sign in
//         </button>

//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-300"></div>
//           <span className="mx-2 text-gray-500">or</span>
//           <div className="flex-grow border-t border-gray-300"></div>
//         </div>

//         <div className="flex justify-center gap-4">
//           <button
//             type="button"
//             // className="p-2 border rounded-full hover:bg-gray-200"
//           >
//             <img src={googleLogo} alt="Google" className="h-12" />
//           </button>
//           <button
//             type="button"
//             // className="p-2 border rounded-full hover:bg-gray-200"
//           >
//             <img src={linkedinLogo} alt="LinkedIn" className="  h-12" />
//           </button>
//           <button
//             type="button"
//             // className="p-2 border rounded-full hover:bg-gray-300"
//           >
//             <img src={facebookLogo} alt="Facebook" className="  h-12" />
//           </button>
//         </div>

//         <p className="text-center mt-4 text-gray-600">
//           Don't have an account?{" "}
//           <span className="text-orange-500 cursor-pointer">Sign Up</span>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Login;
