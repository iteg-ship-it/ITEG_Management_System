import { useParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../../../redux/api/authApi";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { buttonStyles } from "../../../styles/buttonStyles";
import InputField from "../common-feild/InputField";
import logo from "../../../assets/images/logo-ssism.png";
import bg from "../../../assets/images/bgImg.png";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

const PasswordField = ({ name, label, show, onToggle }) => (
  <div className="relative">
    <InputField name={name} type={show ? "text" : "password"} label={label} />
    <div
      className="absolute bottom-[10px] right-3 text-gray-500 cursor-pointer z-10"
      onClick={onToggle}
    >
      {show ? <EyeOff size={20} /> : <Eye size={20} />}
    </div>
  </div>
);

const ConfirmPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className="flex justify-center items-center h-screen bg-gray-100"
      style={{ backgroundImage: `url(${bg})`, backgroundPosition: "center", backgroundSize: "cover" }}
    >
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="SSISM Logo" className="h-20 w-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1 text-center">Enter your new password below</p>
        </div>

        <Formik
          initialValues={{ password: "", confirmpassword: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              await resetPassword({
                token,
                body: { newPassword: values.password, confirmPassword: values.confirmpassword },
              }).unwrap();
              toast.success("Password reset successful!");
              navigate("/login");
            } catch (err) {
              toast.error(err?.data?.message || "Something went wrong.");
            }
          }}
        >
          {() => (
            <Form className="space-y-4">
              <PasswordField
                name="password"
                label="New Password"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
              <PasswordField
                name="confirmpassword"
                label="Confirm Password"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-full mt-2 ${buttonStyles.primary}`}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ConfirmPassword;
