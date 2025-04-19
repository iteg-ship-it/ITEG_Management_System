
import  { useState } from "react";
import ReusableForm from "../../../ReusableForm";
import { loginValidationSchema } from "../../../validationSchema";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../redux/auth/authApiSlice";
import CryptoJS from "crypto-js";
import logo from "../../../assets/images/logo-ssism.png";
import googleLogo from "../../../assets/images/Google.png";
import linkedinLogo from "../../../assets/images/linkedin.png";
import facebookLogo from "../../../assets/images/FB.png";

import EmailField from "../../common-feild/EmailField";
import PasswordField from "../../common-feild/PasswordField";



const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const secretKey = "ITEG@123";

  const initialValues = {
    email: "",
    password: "",
  };

  const handleLoginSubmit = async (values) => {
    try {
      const response = await login(values).unwrap();
      const encryptedToken = CryptoJS.AES.encrypt(
        response.token,
        secretKey
      ).toString();
      localStorage.setItem("token", encryptedToken);
      navigate("/", { replace: true });
    } catch (error) {
      setLoginError(error?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ReusableForm
        initialValues={initialValues}
        onSubmit={handleLoginSubmit}
        validationSchema={loginValidationSchema}
      >
        {(values, handleChange) => (
          <>
            <div className="flex flex-col items-center">
              <img src={logo} alt="SSISM Logo" className="h-20" />
              <h2 className="text-2xl font-bold mt-2">Login</h2>
            </div>

            <div className="mt-6">
              {/* ✅ Use reusable EmailField */}
              <EmailField value={values.email} onChange={handleChange} />

              {/* ✅ Use reusable PasswordField */}
              <PasswordField value={values.password} onChange={handleChange} />

              {loginError && (
                <p className="text-red-600 text-sm mb-2">{loginError}</p>
              )}

              <p className="text-right text-sm text-gray-500 cursor-pointer hover:underline">
                Forgot Your Password?
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
            <p className="text-center mt-4 text-gray-600">Don&apos;t have an account?{" "}
              <Link
                to="/registration"
                className="text-orange-500 hover:text-orange-800 transition"
              >
                Sign Up
              </Link>
            </p>
          </>
        )}
      </ReusableForm>
    </div>
  );
};

export default LoginPage;





