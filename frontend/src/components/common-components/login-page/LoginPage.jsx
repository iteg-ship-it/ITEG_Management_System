import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useLoginMutation } from "../../../redux/api/authApi";
import Loader from "../loader/Loader";
import CompactFaceLogin from "../../face-auth/CompactFaceLogin";
import { toast } from 'react-toastify';

import ReusableForm from "../../../ReusableForm";
import { loginValidationSchema } from "../../../validationSchema";

import EmailField from "../common-feild/EmailField";
import PasswordField from "../common-feild/PasswordField";
import { buttonStyles } from "../../../styles/buttonStyles";

import logo from "../../../assets/images/logo-ssism.png";
import bg from "../../../assets/images/bgImg.png";
import googleLogo from "../../../assets/icons/google-icon.png";
import mail from "../../../assets/icons/gmail-icon.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [showFaceLogin, setShowFaceLogin] = useState(false);


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
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("role", response.user.role);
      localStorage.setItem("positionRole", response.user.positionRole);

      navigate("/", { replace: true });
    } catch (error) {
      setLoginError(error?.data?.message || "Invalid email or password.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}${
      import.meta.env.VITE_LOGIN_WITH_GOOGLE
    }`;
  };

  const handleOtpLogin = () => {
    navigate("/otp-verification");
  };

  const handleFaceLogin = () => {
    setShowFaceLogin(true);
  };

  const handleFaceLoginSuccess = () => {
    setShowFaceLogin(false);
    navigate("/", { replace: true });
  };

  const handleFaceLoginClose = () => {
    setShowFaceLogin(false);
  };



  return (
    <div
      className="flex justify-center items-center h-screen bg-gray-100 "
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {isLoading && <Loader />}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
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

              <div className="mt-6 space-y-4">
                <EmailField value={values.email} onChange={handleChange} />
                <PasswordField name="password" password="Password" />

                {loginError && (
                  <p className="text-red-600 text-sm">{loginError}</p>
                )}

                <div className="text-right">
                  <Link
                    to="/forget-password"
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Forgot Your Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-full mt-4 ${buttonStyles.primary}`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Sign in"}
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-2 text-gray-500">or</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <div className="flex flex-col items-center space-y-4 px-5">
                {/* Face ID Button - Android/iOS Style */}
                <button
                  type="button"
                  onClick={handleFaceLogin}
                  className="flex w-full justify-center items-center space-x-3 bg-white shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300"
                >
                  <span className="text-sm">👤</span>
                  <span className="text-sm font-medium text-gray-800">
                   Login with Face ID
                  </span>
                </button>

                {/* OTP Login Button */}
                <button
                  type="button"
                  onClick={handleOtpLogin}
                  className="flex w-full justify-center items-center space-x-3 bg-white shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300"
                >
                  <img className="h-5" src={mail} alt="OTP Login" />
                  <span className="text-sm font-medium text-gray-800">
                    Login with Email OTP
                  </span>
                </button>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled
                  className="flex w-full justify-center items-center space-x-3 bg-gray-100 shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300"
                >
                  <img className="h-5" src={googleLogo} alt="Google" />
                  <span className="text-sm font-medium text-gray-800">
                    Login With Google
                  </span>
                </button>
              </div>
            </>
          )}
        </ReusableForm>
      </div>
      
      {showFaceLogin && (
        <CompactFaceLogin
          onLoginSuccess={handleFaceLoginSuccess}
          onClose={handleFaceLoginClose}
          onNoFaceRegistered={() => {
            setShowFaceLogin(false);
            toast.error('Face not registered! Please login first with email/password to register your face.');
          }}
        />
      )}
      

    </div>
  );
};

export default LoginPage;