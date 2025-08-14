// src/components/common-components/confirm-password/ConfirmPassword.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../../../redux/api/authApi";
import logo from "../../../assets/images/logo-ssism.png";
import bg from "../../../assets/images/bgImg.png";
import ReusableForm from "../../../ReusableForm";
import { resetPasswordValidationSchema } from "../../../validationSchema"; // ✅ Correct schema
import PasswordField from "../common-feild/PasswordField";

const ConfirmPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const initialValues = {
    password: "",
    confirmpassword: "",
  };
  const handleSubmit = async (values) => {
    try {
      const payload = {
        token,
        body: {
          newPassword: values.password,
          confirmPassword: values.confirmpassword,
        },
      };

      const response = await resetPassword(payload).unwrap();

      if (response) {
        // alert("Password reset successful!");
        navigate("/login");
      } else {
        alert("Password reset failed. Please try again.");
      }
    } catch (err) {
      console.error("Reset failed:", err);
      alert(err?.data?.message || "Something went wrong.");
    }
  };



  return (
    <div className="flex justify-center items-center h-screen bg-gray-100" style={{ backgroundImage: `url(${bg})`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img src={logo} alt="SSISM Logo" className="h-20 w-30" />
          <h2 className="text-xl font-bold text-gray-800 mt-2">Reset Password</h2>
        </div>

        <ReusableForm
          initialValues={initialValues}
          validationSchema={resetPasswordValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, errors, touched }) => (
            <>
              <div className="mt-4">
                <PasswordField
                  value={values.password}
                  onChange={handleChange}
                  name="password"
                  password="New Password"
                  error={touched.password && errors.password}
                />
              </div>
              <div className="mt-4">
                <PasswordField
                  value={values.confirmpassword}
                  onChange={handleChange}
                  name="confirmpassword"
                  password="Confirm Password"
                  error={touched.confirmpassword && errors.confirmpassword}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brandYellow text-white py-3 rounded-full mt-4 hover:bg-orange-600 transition"
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </>
          )}
        </ReusableForm>

      </div>
    </div>
  );
};

export default ConfirmPassword;

