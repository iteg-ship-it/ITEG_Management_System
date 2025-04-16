import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/logo-ssism.png";
import googleLogo from "../../../assets/images/Google.png";
import linkedinLogo from "../../../assets/images/linkedin.png";
import facebookLogo from "../../../assets/images/FB.png";

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

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
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        const data = await response.json();
        const token = data.token;
 
         
        localStorage.setItem("token", token);

         
        navigate("/");
      } catch (error) {
        setLoginError("Invalid email or password.");
        console.error("Login error:", error);
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
          <img
            src={logo}
            alt="SSISM Logo"
            className="h-20"
          />
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
        >
          Sign in
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="p-2 border rounded-full hover:bg-gray-200"
          >
            <img src={googleLogo} alt="Google" className="h-10" />
          </button>
          <button
            type="button"
            className="p-2 border rounded-full hover:bg-gray-200"
          >
            <img src={linkedinLogo} alt="LinkedIn" className="h-10" />
          </button>
          <button
            type="button"
            className="p-2 border rounded-full hover:bg-gray-300"
          >
            <img src={facebookLogo} alt="Facebook" className="h-10" />
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <span className="text-orange-500 cursor-pointer">Sign Up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;

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

//   // Initialize a sample user in localStorage (run once)
//   useEffect(() => {
//     const existingUsers = localStorage.getItem("users");
//     if (!existingUsers) {
//       localStorage.setItem(
//         "users",
//         JSON.stringify([{ email: "user@example.com", password: "123456" }])
//       );
//     }
//   }, []);

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
//             className="p-2 border rounded-full hover:bg-gray-200"
//           >
//             <img src={googleLogo} alt="Google" className="h-10" />
//           </button>
//           <button
//             type="button"
//             className="p-2 border rounded-full hover:bg-gray-200"
//           >
//             <img src={linkedinLogo} alt="LinkedIn" className="  h-10" />
//           </button>
//           <button
//             type="button"
//             className="p-2 border rounded-full hover:bg-gray-300"
//           >
//             <img src={facebookLogo} alt="Facebook" className="  h-10" />
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

// // // import React from "react";

// // const Login = () => {
// //   return (
// //     <div className="flex justify-center items-center h-screen bg-gray-100">
// //       <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
// //         <div className="flex flex-col items-center">
// //           <img
// //             src="./src/assets/images/logo.png"
// //             alt="SSISM Logo"
// //             className="w-16 h-16 mb-4"
// //           />
// //           <h2 className="text-2xl font-bold">Login</h2>
// //         </div>

// //         <div className="mt-6">
// //           <input
// //             type="email"
// //             placeholder="Email"
// //             className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
// //           />
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
// //           />
// //           <p className="text-right text-sm text-gray-500">Forgot Your Password</p>
// //         </div>

// //         <button className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition">
// //           Sign in
// //         </button>

// //         <div className="flex items-center my-4">
// //           <div className="flex-grow border-t border-gray-300"></div>
// //           <span className="mx-2 text-gray-500">or</span>
// //           <div className="flex-grow border-t border-gray-300"></div>
// //         </div>

// //         <div className="flex justify-center gap-4">
// //           <button className="p-2 border rounded-full hover:bg-gray-200" >
// //             {/* <a href="https://www.google.com/"> </a> */}
// //             <img src="./src/assets/images/Google.png" alt="Google" className="w-6 h-6" />
// //           </button>
// //           <button className="p-2 border rounded-full hover:bg-gray-200">
// //             <img src="./src/assets/images/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
// //           </button>
// //           <button className="p-2 border rounded-full hover:bg-gray-300">
// //             <img src="./src/assets/images/FB.png" alt="Facebook" className="w-6 h-6" />
// //           </button>
// //         </div>

// //         <p className="text-center mt-4 text-gray-600">Don't have an account? <span className="text-orange-500 cursor-pointer">Sign Up</span>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;
