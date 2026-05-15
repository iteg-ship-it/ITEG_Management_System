import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useLoginMutation, useStudentLoginMutation } from "../../../../redux/api/authApi";
import Loader from "../../../shared/loader/Loader";
import CompactFaceLogin from "../../face-auth/CompactFaceLogin";
import { toast } from 'react-toastify';

import ReusableForm from "../../../shared/forms/ReusableForm";
import { loginValidationSchema } from "../../../shared/forms/validationSchema";
import InputField from "../../../shared/form-fields/InputField";
import { buttonStyles } from "../../../../styles/buttonStyles";
import { Eye, EyeOff } from "lucide-react";

import logo from "../../../../assets/images/logo-ssism.png";
import bg from "../../../../assets/images/bgImg.png";
import googleLogo from "../../../../assets/icons/google-icon.png";
import mail from "../../../../assets/icons/gmail-icon.png";

const secretKey = "ITEG@123";
const encrypt = (data) => CryptoJS.AES.encrypt(data, secretKey).toString();

// ── Student Login Form ────────────────────────────────────────────────────────
const StudentLoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prkey: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [studentLogin, { isLoading }] = useStudentLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prkey.trim() || !form.password.trim()) {
      toast.error("PR Key and Password are required");
      return;
    }
    try {
      const res = await studentLogin(form).unwrap();
      localStorage.setItem("studentToken", encrypt(res.token));
      localStorage.setItem("studentRefreshToken", encrypt(res.refreshToken));
      localStorage.setItem("studentData", JSON.stringify(res.student));
      localStorage.setItem("role", "student");
      toast.success(`Welcome, ${res.student.firstName}!`);
      navigate("/student-portal/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PR Key</label>
        <input
          type="text"
          value={form.prkey}
          onChange={e => setForm(p => ({ ...p, prkey: e.target.value }))}
          placeholder="e.g. SS2025001"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
        />
      </div>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type={showPass ? "text" : "password"}
          value={form.password}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          placeholder="Enter your password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 pr-10"
        />
        <button type="button" onClick={() => setShowPass(p => !p)}
          className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button type="submit" disabled={isLoading}
        className={`w-full py-3 rounded-full mt-2 ${buttonStyles.primary}`}>
        {isLoading ? "Signing in..." : "Sign In as Student"}
      </button>
      <p className="text-center text-xs text-gray-400 mt-2">
        Contact admin if you don't have a password set.
      </p>
    </form>
  );
};

// ── Main Login Page ───────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("admin"); // "admin" | "student"

  const initialValues = { email: "", password: "" };

  const handleLoginSubmit = async (values) => {
    try {
      const response = await login(values).unwrap();
      localStorage.setItem("token", encrypt(response.token));
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("role", response.user.role);
      localStorage.setItem("positionRole", response.user.positionRole);
      navigate("/", { replace: true });
    } catch (error) {
      setLoginError(error?.data?.message || "Invalid email or password.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_LOGIN_WITH_GOOGLE}`;
  };

  const handleOtpLogin = () => navigate("/otp-verification");
  const handleFaceLogin = () => setShowFaceLogin(true);
  const handleFaceLoginSuccess = () => { setShowFaceLogin(false); navigate("/", { replace: true }); };
  const handleFaceLoginClose = () => setShowFaceLogin(false);

  return (
    <div
      className="flex justify-center items-center h-screen bg-gray-100"
      style={{ backgroundImage: `url(${bg})`, backgroundPosition: "center", backgroundSize: "cover" }}
    >
      {isLoading && <Loader />}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">

        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="SSISM Logo" className="h-20" />
          <h2 className="text-2xl font-bold mt-2">Login</h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-2">
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === "admin" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Admin / Faculty
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${activeTab === "student" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Student
          </button>
        </div>

        {/* Student Tab */}
        {activeTab === "student" && <StudentLoginForm />}

        {/* Admin Tab */}
        {activeTab === "admin" && (
          <ReusableForm
            initialValues={initialValues}
            onSubmit={handleLoginSubmit}
            validationSchema={loginValidationSchema}
          >
            {() => (
              <>
                <div className="mt-2 space-y-4">
                  <InputField name="email" type="email" label="Email" />
                  <div className="relative">
                    <InputField
                      name="password"
                      type={showPassword ? "text" : "password"}
                      label="Password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[38px] bottom-0 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {loginError && <p className="text-red-600 text-sm">{loginError}</p>}

                  <div className="text-right">
                    <Link to="/forget-password" className="text-sm text-gray-500 hover:underline">
                      Forgot Your Password?
                    </Link>
                  </div>
                </div>

                <button type="submit" className={`w-full py-3 rounded-full mt-4 ${buttonStyles.primary}`} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Sign in"}
                </button>

                <div className="flex items-center my-4">
                  <hr className="flex-grow border-gray-300" />
                  <span className="mx-2 text-gray-500">or</span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <div className="flex flex-col items-center space-y-4 px-5">
                  <button type="button" onClick={handleFaceLogin}
                    className="flex w-full justify-center items-center space-x-3 bg-white shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300">
                    <span className="text-sm">👤</span>
                    <span className="text-sm font-medium text-gray-800">Login with Face ID</span>
                  </button>
                  <button type="button" onClick={handleOtpLogin}
                    className="flex w-full justify-center items-center space-x-3 bg-white shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300">
                    <img className="h-5" src={mail} alt="OTP Login" />
                    <span className="text-sm font-medium text-gray-800">Login with Email OTP</span>
                  </button>
                  <button type="button" onClick={handleGoogleLogin}
                    className="flex w-full justify-center items-center space-x-3 bg-white shadow-md rounded-xl py-2.5 hover:shadow-lg transition border border-gray-300">
                    <img className="h-5" src={googleLogo} alt="Google" />
                    <span className="text-sm font-medium text-gray-800">Login With Google</span>
                  </button>
                </div>
              </>
            )}
          </ReusableForm>
        )}
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
