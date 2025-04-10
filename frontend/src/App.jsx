import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/common-components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import LoginPage from "./components/common-components/login&registration/LoginPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      {token ? (
        <div className="flex bg-gray-100">
          <Sidebar role="admin" />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;

// import { BrowserRouter as Router } from "react-router-dom";
// import Sidebar from "./components/common-components/sidebar/Sidebar";
// import Dashboard from "./components/dashboard/Dashboard";

// function App() {
//   return (
//     <>
//       <Router>
//         {/* <Login /> */}
//         <div className="flex bg-gray-100">
//           <Sidebar role="admin" />

//           <Dashboard />
//         </div>
//       </Router>
//     </>
//   );
// }

// export default App;
