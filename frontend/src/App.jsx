/* eslint-disable react/prop-types */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/common-components/login-page/LoginPage";
import ForgetPassword from "./components/common-components/forget-password/ForgetPassword";
import ConfirmPassword from "./components/common-components/confirm-password/ConfirmPassword";
import OtpVerification from "./components/common-components/otp-verfication/OtpVeriFication";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import OtpEnter from "./components/common-components/otp-verfication/OtpEnter";
import GoogleSuccess from './components/common-components/login-page/GoogleSuccess.jsx';
import Layout from "./components/dashboard/Layout.jsx";
import SessionTimeoutModal from "./components/common-components/SessionTimeoutModal";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import PageNotFound from "./components/common-components/error-pages/PageNotFound";
import ServerError from "./components/common-components/error-pages/ServerError";
import ErrorBoundary from "./components/common-components/ErrorBoundary";

// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const { showModal, handleContinue, handleLogout } = useSessionTimeout();

  return (
    <>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Root route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/*  Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/reset-password/:token" element={<ConfirmPassword />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/otp-enter" element={<OtpEnter />} />
            <Route path="/google-success" element={<GoogleSuccess />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/404" element={<PageNotFound />} />

            {/* ✅ Protected routes with sidebar */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="bg-white">
                    <Layout />
                  </div>
                </ProtectedRoute>
              }
            />

          </Routes>
        </Router>
      </ErrorBoundary>

      <SessionTimeoutModal
        isOpen={showModal}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;


