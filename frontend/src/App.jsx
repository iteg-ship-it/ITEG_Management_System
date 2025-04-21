import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CryptoJS from "crypto-js";

import Sidebar from "./components/common-components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import LoginPage from "./components/common-components/login-page/LoginPage";
import SignupPage from "./components/common-components/signup/SignupPage";
import AdmissionDashboard from "./components/admition-process/admission-dashboard/AdmissionDashboard";
import StudentDashboard from "./components/student-records/student-dashboard/StudentDashboard";

function App() {
  const secretKey = "ITEG@123";

  const encryptedToken = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Decrypt token
  const token = encryptedToken
    ? CryptoJS.AES.decrypt(encryptedToken, secretKey).toString(
        CryptoJS.enc.Utf8
      )
    : null;

  return (
    <Router>
      <Routes>
        {/* ✅ If token exists */}
        {token ? (
          user?.role === "Faculty" ? (
            <>
              <Route
                path="/student-dashboard"
                element={
                  <div className="flex bg-gray-100">
                    <Sidebar role="faculty" />
                    <div className="flex-1 p-4">
                      <StudentDashboard />
                    </div>
                  </div>
                }
              />
              {/* Redirect all other paths to student-dashboard */}
              <Route
                path="*"
                element={<Navigate to="/student-dashboard" replace />}
              />
            </>
          ) : (
            <>
              <Route
                path="/*"
                element={
                  <div className="flex bg-gray-100">
                    <Sidebar role={user?.role === "admin" || "superadmin"} />
                    <div className="flex-1 p-4">
                      <Dashboard />
                    </div>
                  </div>
                }
              />
            </>
          )
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AdmissionDashboard />} />
          </>
        )}

        {/* ✅ Always available */}
        <Route path="/registration" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar from "./components/common-components/sidebar/Sidebar";
// import Dashboard from "./components/dashboard/Dashboard";
// import LoginPage from "./components/common-components/login&registration/LoginPage";
// import SignupPage from "./components/common-components/signup/SignupPage";
// import AdmissionDashboard from "./components/admition-process/admission-dashboard/AdmissionDashboard";

// function App() {
//   const token = localStorage.getItem("token");

//   return (
//     <>
//       <Router>
//         <Routes>
//           {token ? (
//             <>
//               <Route
//                 path="/*"
//                 element={
//                   <div className="flex bg-gray-100">
//                     <Sidebar role="admin" />
//                     <div className="flex-1 p-4">
//                       <Dashboard />
//                     </div>
//                   </div>
//                 }
//               />
//             </>
//           ) : (
//             <>
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/" element={<AdmissionDashboard />} />
//             </>
//           )}
//           <Route path="/registration" element={<SignupPage />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }

// export default App;
