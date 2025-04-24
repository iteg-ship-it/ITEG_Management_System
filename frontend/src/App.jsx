import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/common-components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import LoginPage from "./components/common-components/login-page/LoginPage";
import SignupPage from "./components/common-components/signup/SignupPage";
import AdmissionDashboard from "./components/admition-process/admission-dashboard/AdmissionDashboard";
import ForgetPassword from "./components/common-components/forget-password/ForgetPassword";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {token ? (
          <>
            <Route
              path="/*"
              element={
                <div className="flex bg-gray-100">
                  <Sidebar role="Superadmin" />
                  <div className="flex-1 p-4">
                    <Dashboard />
                  </div>
                </div>
              }
            />
            {/* <Route path="/login" element={<Navigate to="/" />} /> */}
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            {/* <Route path="*" element={<Navigate to="/login" />} /> */}
            <Route path="/" element={<AdmissionDashboard />} />
          </>
        )}
        <Route path="/registration" element={<SignupPage />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
