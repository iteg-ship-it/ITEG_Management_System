import logo from "../../../assets/images/logo-ssism.png";
import ReusableForm from "../../../ReusableForm";
import EmailField from "../common-feild/EmailField";
import { loginValidationSchema } from "../../../validationSchema";
import { useNavigate } from "react-router-dom";
import { useForgetPasswordMutation } from "../../../redux/api/authApi";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [forgetPassword, { isLoading, error }] = useForgetPasswordMutation();

  const initialValues = {
    email: "",
  };

  const handleSubmit = async (values) => {
    // console.log(values);

    try {
      const response = await forgetPassword(values).unwrap();
      console.log("API Success:", response);
      navigate("/confirm-password");
    } catch (err) {
      console.error("API Error:", err);
      // Optionally show error to user
      alert("Failed to send password reset link. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg w-full max-w-sm shadow-md">
        <div className="flex flex-col items-center">
          <img src={logo} alt="SSISM Logo" className="h-20 w-30" />
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            Forget Password
          </h2>
        </div>

        <ReusableForm
          initialValues={initialValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleSubmit}
        >
          {(values, handleChange) => (
            <>
              <div className="mt-4">
                <EmailField value={values.email} onChange={handleChange} />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition disabled:opacity-50"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? "Sending..." : "Get Link"}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">
                  Failed to send reset link. Please try again.
                </p>
              )}
            </>
          )}
        </ReusableForm>
      </div>
    </div>
  );
};

export default ForgetPassword;


// import logo from "../../../assets/images/logo-ssism.png";
// import ReusableForm from "../../../ReusableForm";
// import EmailField from "../common-feild/EmailField";
// import { loginValidationSchema } from "../../../validationSchema";
// import { useNavigate } from "react-router-dom";
// import {  useForgetPasswordMutation} from "../../../redux/api/authApi"
// const ForgetPassword = () => {
//   const navigate = useNavigate();
//   const initialValues = {
//     email: "",
//   };
//   const forgetpass = useForgetPasswordMutation;
// console.log(forgetpass);

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
