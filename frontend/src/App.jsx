// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// // import Sidebar from "./components/common-components/sidebar/Sidebar";
// // import Dashboard from "./components/dashboard/Dashboard";
// // import LoginPage from "./components/common-components/login&registration/LoginPage";
// import SignupPage from "./components/common-components/signup/SignupPage";


// function App() {
//   const token = localStorage.getItem("token");

//   return (
//     <Router>
//       <Routes>
//         {token ? (
//           <>
//             <Route
//               path="/*"
//               element={
//                 <div className="flex bg-gray-100">
//                   {/* <Sidebar role="admin" /> */}
//                   <div className="flex-1 p-4">
//                     {/* <Dashboard /> */}
//                   </div>
//                 </div>
//               }
//             />
//             <Route path="/login" element={<Navigate to="/" />} />
//           </>
//         ) : (
//           <>
//             {/* <Route path="/login" element={<LoginPage />} /> */}
//             {/* <Route path="*" element={<Navigate to="/login" />} /> */}
//           </>
//         )}
//         <Route path="/registration" element={<SignupPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// src/App.jsx
import React from "react";
import SignupPage from "./components/common-components/signup/SignupPage";

const App = () => {
  return (
    <div>
      <SignupPage />
    </div>
  );
};

export default App;
