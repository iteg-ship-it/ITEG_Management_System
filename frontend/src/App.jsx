import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/dashboard/Layout.jsx";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import { PermissionProvider } from './contexts/PermissionContext';

// Lazy load components
const LoginPage = React.lazy(() => import("./components/common-components/login-page/LoginPage"));
const ForgetPassword = React.lazy(() => import("./components/common-components/forget-password/ForgetPassword"));
const ConfirmPassword = React.lazy(() => import("./components/common-components/confirm-password/ConfirmPassword"));
const OtpVerification = React.lazy(() => import("./components/common-components/otp-verfication/OtpVeriFication"));
const OtpEnter = React.lazy(() => import("./components/common-components/otp-verfication/OtpEnter"));
const GoogleSuccess = React.lazy(() => import('./components/common-components/login-page/GoogleSuccess.jsx'));
const ServerError = React.lazy(() => import("./components/common-components/error-pages/ServerError"));
const SessionTimeoutModal = React.lazy(() => import('./components/common-components/user-profile/SessionTimeoutModal'));


// ✅ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const { showModal, handleContinue, handleLogout } = useSessionTimeout();

  React.useEffect(() => {
    console.log('✅ App component mounted');
    const handleError = (error) => {
      console.error('❌ App Error:', error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <React.Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    }>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Navigate to={localStorage.getItem("token") ? "/" : "/login"} replace />} /> */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/reset-password/:token" element={<ConfirmPassword />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/otp-enter" element={<OtpEnter />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/server-error" element={<ServerError />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <PermissionProvider>
                  <div className="bg-white">
                    <Layout />
                  </div>
                </PermissionProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

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
    </React.Suspense>
  );
}

export default App;


