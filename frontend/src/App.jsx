// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./components/dashboard/Dashboard";
// import AdmissionDashboard from "./components/admitionProcess/AdmissionDashboard";
// import StudentProfile from "./components/student-records/studentProfile/StudentProfile";
// import PlacementRecords from "./components/placement/placementRecords/PlacementRecords";
// // import Login from "./components/common-components/login&registration/Login";
// // import { LogIn } from "lucide-react";

// function App() {
//   return (
//     <>
//       {/* <Login /> */}
//       <Router>
//         <div className="flex bg-gray-300 min-h-screen">
//           {/* <Sidebar role="teacher" /> */}
//           <div className="flex-1">
//             <Routes>
//               {/* <Route path="/" element={<LogIn />} /> */}
//               <Route path="/" element={<Dashboard />} />
//               <Route path="/admission" element={<AdmissionDashboard />} />
//               <Route path="/student-record" element={<StudentProfile />} />
//               <Route path="/placement" element={<PlacementRecords />} />
//             </Routes>
//           </div>
//           {/* <AdmissionDashboard /> */}
//         </div>
//       </Router>
//     </>
//   );
// }

// export default App;

import { BrowserRouter as Router } from "react-router-dom";
import Sidebar from "./components/common-components/sidebar/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
// import  { useSelector, useDispatch } from "react-redux";
// import { increment, decrement, incrementByAmount } from "./features/counterSlice";

function App() {
  return (
    <>
      <Router>
        <div className="flex bg-gray-100">
          <Sidebar role="admin" />

          <Dashboard />
        </div>
      </Router>
      {/* <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div> */}
    </>
  );
}

export default App;
