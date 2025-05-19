import { useState } from "react";
import { useForgetPasswordMutation } from "../../../redux/api/authApi"; // Update the path as needed

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [forgetPassword, { isLoading, isSuccess, isError, error }] = useForgetPasswordMutation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgetPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>
        {submitted && isSuccess ? (
          <div className="text-green-600 text-center">
            Password reset link sent to your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            {isError && (
              <div className="text-red-600 text-sm">
                {error?.data?.message || "Failed to send reset email."}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}



// import logo from "../../../assets/images/logo-ssism.png";
// import ReusableForm from "../../../ReusableForm";
// import EmailField from "../common-feild/EmailField";
// import { loginValidationSchema } from "../../../validationSchema";
// import { useNavigate } from "react-router-dom";
// // import {  useForgetPasswordMutation} from "../../../redux/api/authApi/"
// const ForgetPassword = () => {
//   const navigate = useNavigate();
//   const initialValues = {
//     email: "",
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <div className="bg-white p-10 rounded-lg w-full max-w-sm">
//         <div className="flex flex-col items-center">
//           <img src={logo} alt="SSISM Logo" className="h-20 w-30" />
//           <h2 className="text-xl font-bold text-gray-800 mt-2">
//             Forget Password
//           </h2>
//         </div>

//         {/* ✅ ReusableForm properly used */}
//         <ReusableForm
//           initialValues={initialValues}
//           validationSchema={loginValidationSchema}
//         >
//           {(values, handleChange) => (
//             <>
//               <div className="mt-4">
//                 <EmailField value={values.email} onChange={handleChange} />
//               </div>

//               <button
//                 onClick={navigate("/confirm-password")}
//                 type="submit"
//                 className="w-full bg-orange-500 text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition"
//               >
//                 Get Link
//               </button>
//             </>
//           )}
//         </ReusableForm>
//       </div>
//     </div>
//   );
// };

// export default ForgetPassword;
