// import React from "react";

// import {useFormik} from 'formik'

// function App() {
//   const formik = useFormik({
//     initialValues:{
//       username:"",
//       name:"",
//       email:""
//       },
//       onSubmit:values=>{
//         console.log("form submitted" ,values);
//         }
//   })

//   return (
//     <div className="App">
//       <form onSubmit={formik.handleSubmit}>
//         <input
//           type="text"
//           name="username"
//           onChange={formik.handleChange}
//           value={formik.values.username}
//           placeholder="username"
//         />

//         <input
//           type="text"
//           name=" name"
//           onChange={formik.handleChange}
//           value={formik.values.name}
//           placeholder=" Enter your name"
//         />

//         <input
//           type="text"
//          email =" email"
//           onChange={formik.handleChange}
//           value={formik.values.email}
//           placeholder=" Enter your email"
//         />

//         <button type="submit">Submit</button>

//       </form>

//     </div>
//   );
// }
// export default App;

// import React from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup"; // Yup import करना जरूरी है

// const MyForm = () => {
//   const formik = useFormik({
//     initialValues: {
//       name: "",
//       email: "",
//     },
//     validationSchema: Yup.object({
//       name: Yup.string()
//         .min(3, "कम से कम 3 अक्षर होने चाहिए")
//         .required("नाम आवश्यक है"),
//       email: Yup.string()
//         .email("Valid Email दर्ज करें")
//         .required("ईमेल आवश्यक है"),
//     }),
//     onSubmit: (values) => {
//       alert(JSON.stringify(values, null, 2));
//     },
//   });

//   return (
//     <form onSubmit={formik.handleSubmit}>
//       <label>Name:</label>
//       <input
//         type="text"
//         name="name"
//         value={formik.values.name}
//         onChange={formik.handleChange}
//         onBlur={formik.handleBlur}
//       />
//       {formik.touched.name && formik.errors.name ? (
//         <div style={{ color: "red" }}>{formik.errors.name}</div>
//       ) : null}
//       <br />

//       <label>Email:</label>
//       <input
//         type="email"
//         name="email"
//         value={formik.values.email}
//         onChange={formik.handleChange}
//         onBlur={formik.handleBlur}
//       />
//       {formik.touched.email && formik.errors.email ? (
//         <div style={{ color: "red" }}>{formik.errors.email}</div>
//       ) : null}
//       <br />

//       <button type="submit">Submit</button>
//     </form>
//   );
// };

// export default MyForm;

// import React from "react";

// import calendarIcon from "./assets/calendar.png";
// import locationIcon from "./assets/location.png";
// import briefcase from "./assets/briefcase.png";
// import office from "./assets/office.png";

// const PlacementInfoCard = () => {
//   return (
//     <div className="border border-blue-400 rounded-lg p-4 w-80 shadow-md max-w-full text-center">
//       <h2 className="text-lg font-semibold mb-4">Placement info</h2>
//       <div className="space-y-5">
//         <div className="flex items-center gap-2 justify-center">
//           <img src={office} alt="" />
//           <p className="text-gray-900">Company - Google</p>
//         </div>
//         <div className="flex items-center gap-2 justify-center">
//           <img src={briefcase} alt="" />
//           <p className="text-gray-900">Position - Full Stack </p>
//         </div>

//         <p>devloper</p>
//         <div className="flex items-center gap-2 justify-center">
//           <img src={locationIcon} alt="" />
//           <p className="text-gray-900">Location - Noida</p>
//         </div>
//         <div className="flex items-center gap-2 justify-center">
//           <img src={calendarIcon} alt="" />
//           <p className="text-gray-900">Date - 01/03/2020</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlacementInfoCard;

// import React from "react";
// import {
//   FaBuilding,
//   FaBriefcase,
//   FaMapMarkerAlt,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";

// const PlacementInfo = () => {
//   return (
//     <div className="border border-blue-400 rounded-lg p-4 w-80 shadow-md max-w-full text-center">
//       <h2 className="text-lg font-semibold mb-3">Placement Info</h2>
//       <div className="space-y-3">
//         <p className="flex items-center justify-center space-x-2">
//           <FaBuilding className="text-blue-500" />
//           <span>Company - Google</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaBriefcase className="text-brown-500" />
//           <span>Position - Full Stack Developer</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaMapMarkerAlt className="text-pink-500" />
//           <span>Location - Noida</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaCalendarAlt className="text-red-500" />
//           <span>Date - 01/03/2020</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// const AttendanceChart = () => {
//   const data = [
//     { name: "Jan", value: 100 },
//     { name: "Feb", value: 90 },
//     { name: "Mar", value: 80 },
//     { name: "Apr", value: 70 },
//     { name: "May", value: 60 },
//     { name: "Jun", value: 50 },
//     { name: "Jul", value: 40 },
//     { name: "Aug", value: 35 },
//     { name: "Sep", value: 30 },
//     { name: "Oct", value: 25 },
//     { name: "Nov", value: 20 },
//     { name: "Dec", value: 15 },
//   ];

//   return (
//     <div className="border rounded-lg p-4 shadow-md w-full max-w-md">
//       <h2 className="text-lg font-semibold mb-3">Attendance</h2>
//       <ResponsiveContainer width="100%" height={200}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="value" fill="#8884d8" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// const LevelInformation = () => {
//   return (
//     <div className="border rounded-lg p-4 shadow-md w-full overflow-auto mt-10 text-center">
//       <h2 className="text-lg font-semibold mb-3">Level Information</h2>
//       <table className="w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Iteg Levels</th>
//             <th className="border p-2">Date of Clear Each Level</th>
//             <th className="border p-2">Total Attempt</th>
//           </tr>
//         </thead>
//         <tbody>
//           {["1B", "1B", "1C", "2A", "2B", "2C"].map((level, index) => (
//             <tr key={index} className="border">
//               <td className="border p-2">{level}</td>
//               <td className="border p-2">12-03-2025</td>
//               <td className="border p-2">2</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const Dashboard1 = () => {
//   return (
//     <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center items-start">
//       <div className="flex flex-col gap-6">
//         <PlacementInfo />
//       </div>
//       <div className="flex flex-col gap-6">
//         <AttendanceChart />
//       </div>
//       <div className="col-span-3 flex justify-center">
//         <LevelInformation />
//       </div>
//     </div>
//   );
// };

// export default PlacementInfo;




// import React from "react";
// import {
//   FaBuilding,
//   FaBriefcase,
//   FaMapMarkerAlt,
//   FaCalendarAlt,
// } from "react-icons/fa";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";

// // ✅ Placement Info Component
// const PlacementInfo = () => {
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-4 w-80 shadow-md max-w-full text-center">
//       <h2 className="text-lg font-semibold mb-3 text-gray-700">
//         Placement Info
//       </h2>
//       <div className="space-y-3 text-gray-600">
//         <p className="flex items-center justify-center space-x-2">
//           <FaBuilding className="text-blue-500" />
//           <span>Company - Google</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaBriefcase className="text-brown-500" />
//           <span>Position - Full Stack Developer</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaMapMarkerAlt className="text-pink-500" />
//           <span>Location - Noida</span>
//         </p>
//         <p className="flex items-center justify-center space-x-2">
//           <FaCalendarAlt className="text-red-500" />
//           <span>Date - 01/03/2020</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// // ✅ Attendance Chart Component
// const AttendanceChart = () => {
//   const data = [
//     { name: "Jan", value: 100 },
//     { name: "Feb", value: 90 },
//     { name: "Mar", value: 80 },
//     { name: "Apr", value: 70 },
//     { name: "May", value: 60 },
//     { name: "Jun", value: 50 },
//     { name: "Jul", value: 40 },
//     { name: "Aug", value: 35 },
//     { name: "Sep", value: 30 },
//     { name: "Oct", value: 25 },
//     { name: "Nov", value: 20 },
//     { name: "Dec", value: 15 },
//   ];

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md w-full max-w-md">
//       <h2 className="text-lg font-semibold mb-3 text-gray-700">Attendance</h2>
//       <ResponsiveContainer width="100%" height={200}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="value" fill="#8884d8" />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// // ✅ Level Information Component
// const LevelInformation = () => {
//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md w-full overflow-auto mt-10 text-center">
//       <h2 className="text-lg font-semibold mb-3 text-gray-700">
//         Level Information
//       </h2>
//       <table className="w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200 text-gray-700">
//             <th className="border p-2">Iteg Levels</th>
//             <th className="border p-2">Date of Clear Each Level</th>
//             <th className="border p-2">Total Attempt</th>
//           </tr>
//         </thead>
//         <tbody>
//           {["1B", "1B", "1C", "2A", "2B", "2C"].map((level, index) => (
//             <tr key={index} className="border text-gray-600">
//               <td className="border p-2">{level}</td>
//               <td className="border p-2">12-03-2025</td>
//               <td className="border p-2">2</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// // ✅ Final Dashboard Component
// const Dashboard = () => {
//   return (
//     <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center items-start bg-gray-100">
//       {/* Placement Info Left Side */}
//       <div className="flex flex-col gap-6">
//         <PlacementInfo />
//       </div>

//       {/* Attendance Right Side */}
//       <div className="flex flex-col gap-6">
//         <AttendanceChart />
//       </div>

//       {/* Level Information Centered Below */}
//       <div className="col-span-3 flex justify-center">
//         <LevelInformation />
//       </div>
//     </div>
//   );
// };

// // ✅ Correctly Exporting Dashboard Component
// export default Dashboard;



import React from "react";
import {
  FaBuilding,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ✅ Placement Info Component
const PlacementInfo = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md text-center">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">
        Placement Info
      </h2>
      <div className="space-y-3 text-gray-600">
        <p className="flex items-center justify-center space-x-2">
          <FaBuilding className="text-blue-500" />
          <span>Company - Google</span>
        </p>
        <p className="flex items-center justify-center space-x-2">
          <FaBriefcase className="text-brown-500" />
          <span>Position - Full Stack Developer</span>
        </p>
        <p className="flex items-center justify-center space-x-2">
          <FaMapMarkerAlt className="text-pink-500" />
          <span>Location - Noida</span>
        </p>
        <p className="flex items-center justify-center space-x-2">
          <FaCalendarAlt className="text-red-500" />
          <span>Date - 01/03/2020</span>
        </p>
      </div>
    </div>
  );
};

// ✅ Attendance Chart Component
const AttendanceChart = () => {
  const data = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 90 },
    { name: "Mar", value: 80 },
    { name: "Apr", value: 70 },
    { name: "May", value: 60 },
    { name: "Jun", value: 50 },
    { name: "Jul", value: 40 },
    { name: "Aug", value: 35 },
    { name: "Sep", value: 30 },
    { name: "Oct", value: 25 },
    { name: "Nov", value: 20 },
    { name: "Dec", value: 15 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Attendance</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ✅ Level Information Component
const LevelInformation = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md overflow-auto text-center">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">
        Level Information
      </h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="border p-2">Iteg Levels</th>
            <th className="border p-2">Date of Clear Each Level</th>
            <th className="border p-2">Total Attempt</th>
          </tr>
        </thead>
        <tbody>
          {["1B", "1B", "1C", "2A", "2B", "2C"].map((level, index) => (
            <tr key={index} className="border text-gray-600">
              <td className="border p-2">{level}</td>
              <td className="border p-2">12-03-2025</td>
              <td className="border p-2">2</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ✅ Final Dashboard Component Without Sidebar & Correct Grid Layout
const Dashboard = () => {
  return (
    <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-gray-100 min-h-screen">
      {/* Placement Info */}
      <PlacementInfo />

      {/* Attendance Chart */}
      <AttendanceChart />

      {/* Level Information - Full Width */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-3">
        <LevelInformation />
      </div>
    </div>
  );
};

// ✅ Exporting Dashboard
export default Dashboard;
