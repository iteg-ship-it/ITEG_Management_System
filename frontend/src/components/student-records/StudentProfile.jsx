
/* eslint-disable react/prop-types */
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import profilePlaceholder from "../../assets/images/profile-img.png";
import back from "../../assets/icons/back-icon.png";
import attendence from "../../assets/icons/attendence-card-icon.png";
import level from "../../assets/icons/level-card-icon.png";
import permission from "../../assets/icons/permission-card-icon.png";
import placed from "../../assets/icons/placement-card-icon.png";
import company from "../../assets/icons/company-icon.png";
import position from "../../assets/icons/position-icon.png";
import loca from "../../assets/icons/location-icon.png";
import date from "../../assets/icons/calendar-icon.png";
import editbutton from "../../assets/icons/edit-icon.png";
import { Chart } from "react-google-charts";
import UserProfile from "../common-components/user-profile/UserProfile";

export default function StudentProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = location.state || {};
  const [studentData, setStudentData] = useState(student || {});
  const [latestLevel, setLatestLevel] = useState("1A");

  useEffect(() => {
    if (student) {
      setStudentData(student);

      // Calculate latest level
      const passedLevels = (student.level || []).filter(
        (lvl) => lvl.result === "Pass"
      );
      const recentLevel =
        passedLevels.length > 0
          ? passedLevels[passedLevels.length - 1].levelNo
          : "1A";

      setLatestLevel(recentLevel);
    }
  }, [student]);

  if (!studentData || Object.keys(studentData).length === 0) {
    return (
      <div className="w-full px-4 py-5 bg-gray-100 min-h-screen">
        <div className="flex items-center gap-5">
          <img
            className="h-5 cursor-pointer"
            src={back}
            alt="back"
            onClick={() => navigate(-1)}
          />
          <h3 className="text-xl font-bold">Student Profile</h3>
        </div>
        <p className="mt-4">No student data available.</p>
      </div>
    );
  }

  const rawGraphData = [
    ["Month", "Attendance"],
    ["Jan", 100],
    ["Feb", 90],
    ["Mar", 75],
    ["Apr", 80],
    ["May", 60],
    ["Jun", 50],
    ["Jul", 40],
    ["Aug", 30],
    ["Sep", 30],
    ["Oct", 20],
    ["Nov", 20],
    ["Dec", 10],
  ];

  const getColor = (attendance) => {
    if (attendance > 80) return "#4285F4";
    if (attendance >= 50) return "#FBBC05";
    return "#EA4335";
  };

  const graphData = [
    [
      "Month",
      "Attendance",
      { role: "style" },
      { role: "tooltip", type: "string" },
    ],
    ...rawGraphData
      .slice(1)
      .map(([month, attendance]) => [
        month,
        attendance,
        `color: ${getColor(attendance)}; stroke-color: none; stroke-width: 0;`,
        `Attendance: ${attendance}%`,
      ]),
  ];

  const options = {
    title: "Monthly Attendance",
    chartArea: { width: "70%" },
    bar: { groupWidth: "40%" },
    hAxis: { title: "Months" },
    vAxis: {
      title: "Attendance (%)",
      ticks: [0, 20, 40, 60, 80, 100],
      minValue: 0,
    },
    legend: { position: "none" },
    enableInteractivity: true,
  };

  return (
    <>
      <UserProfile showBackButton heading="Student Profile" />
      <button>get level datay</button>
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Right Section - Appears first on small screens */}
          <div className="flex flex-col gap-6 md:col-span-1 order-1 md:order-2">
            <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col">
              <span
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() =>
                  navigate(`/student/edit/${studentData._id}`, {
                    state: { student: studentData },
                  })
                }
              >
                <img src={editbutton} alt="edit button" />
              </span>
              <div className="flex flex-col items-center text-center">
                <img
                  src={studentData.profilePhoto || profilePlaceholder}
                  alt="Profile"
                  className="rounded-full w-24 h-24 mb-4 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profilePlaceholder;
                  }}
                />
                <h2 className="text-xl font-semibold">
                  {studentData.firstName} {studentData.lastName}
                </h2>
                <p className="text-gray-500">{studentData.email}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>📞 {studentData.studentMobile || "N/A"}</p>
                  <p>📍 {studentData.address || studentData.village || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Permission</h2>
              <p>
                <strong>Date</strong> - {studentData.permissionDate || "Nill"}
              </p>
              <p>
                <strong>Reason</strong> - {studentData.permissionReason || "Nill"}
              </p>
            </div>
          </div>

          {/* Left Section - Appears below on small screens */}
          <div className="md:col-span-2 flex flex-col gap-6 order-2 md:order-1">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard
                title="Attendance"
                icon={attendence}
                value="93%"
                bg="#9BAEF5"
              />
              <InfoCard
                title="Current Level"
                icon={level}
                value={latestLevel}
                bg="#F5B477"
              />
              <InfoCard
                title="Permission"
                icon={permission}
                value={studentData.permissionStatus || "Not"}
                bg="#C23F7E"
              />
              <InfoCard
                title="Placement Info"
                icon={placed}
                value={studentData.placementStatus || "Not Placed"}
                bg="#3FC260"
              />
            </div>

            {/* Placement + Graph */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-1">
                <h2 className="text-lg font-semibold mb-4">Placement Info</h2>
                <div className="space-y-3">
                  <InfoLine icon={company} label="Company" value={studentData.company} />
                  <InfoLine icon={position} label="Position" value={studentData.position} />
                  <InfoLine icon={loca} label="Location" value={studentData.location} />
                  <InfoLine icon={date} label="Date" value={studentData.placementDate} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
                <h2 className="text-lg font-semibold mb-2">Attendance</h2>
                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="260px"
                  data={graphData}
                  options={options}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable Card Component
const InfoCard = ({ title, icon, value, bg }) => (
  <div className={`p-4 text-white rounded-xl shadow-lg`} style={{ backgroundColor: bg }}>
    <div className="flex justify-between">
      <p className="font-medium">{title}</p>
      <img className="h-5" src={icon} alt={`${title}-icon`} />
    </div>
    <h3 className="text-2xl font-bold py-2">{value}</h3>
    <p className="text-sm">Overall from starting</p>
  </div>
);

// Reusable Line Display
const InfoLine = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <img className="h-5" src={icon} alt={`${label}-icon`} />
    <p className="text-gray-700">
      <span className="font-medium">{label}</span>: {value || "N/A"}
    </p>
  </div>
);



// /* eslint-disable react/prop-types */
// import { useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import profilePlaceholder from "../../../assets/images/profile-img.png";
// import back from "../../../assets/icons/back-icon.png";
// import attendence from "../../../assets/icons/attendence-card-icon.png";
// import level from "../../../assets/icons/level-card-icon.png";
// import permission from "../../../assets/icons/permission-card-icon.png";
// import placed from "../../../assets/icons/placement-card-icon.png";
// import company from "../../../assets/icons/company-icon.png";
// import position from "../../../assets/icons/position-icon.png";
// import loca from "../../../assets/icons/location-icon.png";
// import date from "../../../assets/icons/calendar-icon.png";
// import editbutton from "../../../assets/icons/edit-icon.png";
// import { Chart } from "react-google-charts";
// import UserProfile from "../../common-components/user-profile/UserProfile";

// export default function StudentProfile() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { student } = location.state || {};
//   const [studentData, setStudentData] = useState(student || {});
//   const [latestLevel, setLatestLevel] = useState("1A");

//   useEffect(() => {
//     if (student) {
//       setStudentData(student);

//       // Calculate latest level
//       const passedLevels = (student.level || []).filter(
//         (lvl) => lvl.result === "Pass"
//       );
//       const recentLevel =
//         passedLevels.length > 0
//           ? passedLevels[passedLevels.length - 1].levelNo
//           : "1A";

//       setLatestLevel(recentLevel);
//     }
//   }, [student]);

//   if (!studentData || Object.keys(studentData).length === 0) {
//     return (
//       <div className="w-full px-4 py-5 bg-gray-100 min-h-screen">
//         <div className="flex items-center gap-5">
//           <img
//             className="h-5 cursor-pointer"
//             src={back}
//             alt="back"
//             onClick={() => navigate(-1)}
//           />
//           <h3 className="text-xl font-bold">Student Profile</h3>
//         </div>
//         <p className="mt-4">No student data available.</p>
//       </div>
//     );
//   }

//   const rawGraphData = [
//     ["Month", "Attendance"],
//     ["Jan", 100],
//     ["Feb", 90],
//     ["Mar", 75],
//     ["Apr", 80],
//     ["May", 60],
//     ["Jun", 50],
//     ["Jul", 40],
//     ["Aug", 30],
//     ["Sep", 30],
//     ["Oct", 20],
//     ["Nov", 20],
//     ["Dec", 10],
//   ];

//   const getColor = (attendance) => {
//     if (attendance > 80) return "#4285F4";
//     if (attendance >= 50) return "#FBBC05";
//     return "#EA4335";
//   };

//   const graphData = [
//     [
//       "Month",
//       "Attendance",
//       { role: "style" },
//       { role: "tooltip", type: "string" },
//     ],
//     ...rawGraphData
//       .slice(1)
//       .map(([month, attendance]) => [
//         month,
//         attendance,
//         `color: ${getColor(attendance)}; stroke-color: none; stroke-width: 0;`,
//         `Attendance: ${attendance}%`,
//       ]),
//   ];

//   const options = {
//     title: "Monthly Attendance",
//     chartArea: { width: "70%" },
//     bar: { groupWidth: "40%" },
//     hAxis: { title: "Months" },
//     vAxis: {
//       title: "Attendance (%)",
//       ticks: [0, 20, 40, 60, 80, 100],
//       minValue: 0,
//     },
//     legend: { position: "none" },
//     enableInteractivity: true,
//   };

//   return (
//     <>
//       <UserProfile showBackButton heading="Student Profile" />
//       <div className="w-full">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
//           {/* Left Section */}
//           <div className="md:col-span-2 flex flex-col gap-6">
//             {/* Summary Cards */}
//             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
//               <InfoCard
//                 title="Attendance"
//                 icon={attendence}
//                 value="93%"
//                 bg="#9BAEF5"
//               />
//               <InfoCard
//                 title="Current Level"
//                 icon={level}
//                 value={latestLevel}
//                 bg="#F5B477"
//               />
//               <InfoCard
//                 title="Permission"
//                 icon={permission}
//                 value={studentData.permissionStatus || "Not"}
//                 bg="#C23F7E"
//               />
//               <InfoCard
//                 title="Placement Info"
//                 icon={placed}
//                 value={studentData.placementStatus || "Not Placed"}
//                 bg="#3FC260"
//               />
//             </div>

//             {/* Placement + Graph */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-1">
//                 <h2 className="text-lg font-semibold mb-4">Placement Info</h2>
//                 <div className="space-y-3">
//                   <InfoLine icon={company} label="Company" value={studentData.company} />
//                   <InfoLine icon={position} label="Position" value={studentData.position} />
//                   <InfoLine icon={loca} label="Location" value={studentData.location} />
//                   <InfoLine icon={date} label="Date" value={studentData.placementDate} />
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
//                 <h2 className="text-lg font-semibold mb-2">Attendance</h2>
//                 <Chart
//                   chartType="ColumnChart"
//                   width="100%"
//                   height="260px"
//                   data={graphData}
//                   options={options}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Right Section */}
//           <div className="flex flex-col gap-6 md:col-span-1">
//             <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col">
//               <span
//                 className="absolute top-4 right-4 cursor-pointer"
//                 onClick={() =>
//                   navigate(`/student/edit/${studentData._id}`, {
//                     state: { student: studentData },
//                   })
//                 }
//               >
//                 <img src={editbutton} alt="edit button" />
//               </span>
//               <div className="flex flex-col items-center text-center">
//                 <img
//                   src={studentData.profilePhoto || profilePlaceholder}
//                   alt="Profile"
//                   className="rounded-full w-24 h-24 mb-4 object-cover"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = profilePlaceholder;
//                   }}
//                 />
//                 <h2 className="text-xl font-semibold">
//                   {studentData.firstName} {studentData.lastName}
//                 </h2>
//                 <p className="text-gray-500">{studentData.email}</p>
//                 <div className="mt-4 space-y-2 text-sm text-gray-700">
//                   <p>📞 {studentData.studentMobile || "N/A"}</p>
//                   <p>📍 {studentData.address || studentData.village || "N/A"}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-lg p-6">
//               <h2 className="text-lg font-semibold mb-2">Permission</h2>
//               <p>
//                 <strong>Date</strong> - {studentData.permissionDate || "Nill"}
//               </p>
//               <p>
//                 <strong>Reason</strong> - {studentData.permissionReason || "Nill"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// // Reusable Card Component
// const InfoCard = ({ title, icon, value, bg }) => (
//   <div className={`p-4 text-white rounded-xl shadow-lg`} style={{ backgroundColor: bg }}>
//     <div className="flex justify-between">
//       <p className="font-medium">{title}</p>
//       <img className="h-5" src={icon} alt={`${title}-icon`} />
//     </div>
//     <h3 className="text-2xl font-bold py-2">{value}</h3>
//     <p className="text-sm">Overall from starting</p>
//   </div>
// );

// // Reusable Line Display
// const InfoLine = ({ icon, label, value }) => (
//   <div className="flex items-center gap-3 text-sm">
//     <img className="h-5" src={icon} alt={`${label}-icon`} />
//     <p className="text-gray-700">
//       <span className="font-medium">{label}</span>: {value || "N/A"}
//     </p>
//   </div>
// );


