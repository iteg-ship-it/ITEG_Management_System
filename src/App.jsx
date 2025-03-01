import React from "react";
// import RegistrationForm from './RegistrationForm ';

import Sidebar from "./Sidebar";
import StudentRecord from "./studentRecord";
import StudentProfile from "./StudentProfile";

function App() {
  return (
    <div>
      {/* <RegistrationForm /> */}
      {/* <ProfilePage/> */}
      <Sidebar />
    </div>
  );
}

export default App;

// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./Dashboard";
// //import Sidebar from "./components/sidebar/Sidebar";

// const Admission = () => (
//   <h2 className="text-2xl p-4">Admission Process Page</h2>
// );
// const StudentRecord = () => (
//   <h2 className="text-2xl p-4">Student Record Page</h2>
// );
// const Placement = () => (
//   <h2 className="text-2xl p-4">Placement Information Page</h2>
// );

// function App() {
//   return (
//     <Router>
//       <div className="flex bg-gray-300 min-h-screen">
//         {/* <Sidebar role="teacher" /> */}
//         <div className="flex-1">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/admission" element={<Admission />} />
//             <Route path="/student-record" element={<StudentRecord />} />
//             <Route path="/placement" element={<Placement />} />
//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;
