import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import {
  useLoginMutation,
  useFacultyLoginMutation,
} from "../../../redux/auth/authApiSlice";
import CryptoJS from "crypto-js";

// Images
import logo from "../../../assets/images/logo-ssism.png";
import googleLogo from "../../../assets/images/Google.png";
import linkedinLogo from "../../../assets/images/linkedin.png";
import facebookLogo from "../../../assets/images/FB.png";
import { getDecryptedRole } from "../../../helpers/authUtils";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading: isAdminLoading }] = useLoginMutation();
  const [facultyLogin, { isLoading: isFacultyLoading }] =
    useFacultyLoginMutation();
  const secretKey = "ITEG@123";

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
      setLoginError("");

      try {
        let response;
        try {
          response = await facultyLogin(values).unwrap();
        } catch {
          response = await login(values).unwrap();
        }

        const encryptedToken = CryptoJS.AES.encrypt(response.token, secretKey).toString();
        const encryptedRole = CryptoJS.AES.encrypt(response.role || "admin", secretKey).toString();

        localStorage.setItem("token", encryptedToken);
        localStorage.setItem("role", encryptedRole);

        if (response.role === "faculty") {
          navigate("/faculty/dashboard", { replace: true });
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (error) {
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
          <h2 className="text-2xl font-bold mt-2">Login</h2>
        </div>

        <div className="mt-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.email && formik.errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-orange-500"}`}
          />
          {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm mb-2">{formik.errors.email}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full p-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.password && formik.errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-orange-500"}`}
          />
          {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm mb-2">{formik.errors.password}</p>}

          {loginError && <p className="text-red-600 text-sm mb-2">{loginError}</p>}
          <p className="text-right text-sm text-gray-500 cursor-pointer hover:underline">Forgot Your Password?</p>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
          disabled={isAdminLoading || isFacultyLoading}
        >
          {isAdminLoading || isFacultyLoading ? "Logging in..." : "Sign in"}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4 mb-2">
          <button type="button">
            <img src={googleLogo} alt="Google" className="h-10" />
          </button>
          <button type="button">
            <img src={linkedinLogo} alt="LinkedIn" className="h-10" />
          </button>
          <button type="button">
            <img src={facebookLogo} alt="Facebook" className="h-10" />
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/registration" className="text-orange-500 hover:text-orange-800 transition">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate, Link } from "react-router-dom";
// import {
//   useLoginMutation,
//   useFacultyLoginMutation,
// } from "../../../redux/auth/authApiSlice";
// import CryptoJS from "crypto-js";

// // Images
// import logo from "../../../assets/images/logo-ssism.png";
// import googleLogo from "../../../assets/images/Google.png";
// import linkedinLogo from "../../../assets/images/linkedin.png";
// import facebookLogo from "../../../assets/images/FB.png";

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [loginError, setLoginError] = useState("");

//   const [login, { isLoading: isAdminLoading }] = useLoginMutation();
//   const [facultyLogin, { isLoading: isFacultyLoading }] =
//     useFacultyLoginMutation();
//   const secretKey = "ITEG@123";

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
//       setLoginError("");

//       try {
//         // 🧠 Automatically trying faculty login first, fallback to admin
//         let response;
//         try {
//           response = await facultyLogin(values).unwrap();
//           localStorage.setItem(
//             "token",
//             CryptoJS.AES.encrypt(response.token, secretKey).toString()
//           );
//           navigate("/faculty/dashboard", { replace: true });
//           return;
//         } catch {
//           // Faculty failed, try admin
//           response = await login(values).unwrap();
//           localStorage.setItem(
//             "token",
//             CryptoJS.AES.encrypt(response.token, secretKey).toString()
//           );
//           navigate("/admin/dashboard", { replace: true });
//         }
//       } catch (error) {
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
//           <h2 className="text-2xl font-bold mt-2">Login</h2>
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

//           <p className="text-right text-sm text-gray-500 cursor-pointer hover:underline">
//             Forgot Your Password?
//           </p>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
//           disabled={isAdminLoading || isFacultyLoading}
//         >
//           {isAdminLoading || isFacultyLoading ? "Logging in..." : "Sign in"}
//         </button>

//         <div className="flex items-center my-4">
//           <div className="flex-grow border-t border-gray-300"></div>
//           <span className="mx-2 text-gray-500">or</span>
//           <div className="flex-grow border-t border-gray-300"></div>
//         </div>

//         <div className="flex justify-center gap-4 mb-2">
//           <button type="button">
//             <img src={googleLogo} alt="Google" className="h-10" />
//           </button>
//           <button type="button">
//             <img src={linkedinLogo} alt="LinkedIn" className="h-10" />
//           </button>
//           <button type="button">
//             <img src={facebookLogo} alt="Facebook" className="h-10" />
//           </button>
//         </div>

//         <p className="text-center mt-4 text-gray-600">
//           Don't have an account?{" "}
//           <Link
//             to="/registration"
//             className="text-orange-500 hover:text-orange-800 transition"
//           >
//             Sign Up
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default LoginPage;
