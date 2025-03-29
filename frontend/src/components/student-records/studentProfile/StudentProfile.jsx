// import company from "../../../assets/icons/company-icon.png";
// import position from "../../../assets/icons/position-icon.png";
// import loca from "../../../assets/icons/location-icon.png";
// import date from "../../../assets/icons/calendar-icon.png";
// import attendence from "../../../assets/icons/attendence-card-icon.png";
// import level from "../../../assets/icons/level-card-icon.png";
// import permission from "../../../assets/icons/permission-card-icon.png";
// import placed from "../../../assets/icons/placement-card-icon.png";
// import profile from "../../../assets/images/profile-img.png";
// import { Chart } from "react-google-charts";

// const graphData = [
//   ["Month", "Attendance", { role: "style" }],
//   ["Jan", 100, "#4285F4"],
//   ["Feb", 90, "#34A853"],
//   ["Mar", 90, "#FBBC05"],
//   ["Apr", 80, "#EA4335"],
//   ["May", 60, "#9C27B0"],
//   ["Jun", 50, "#FF5722"],
//   ["Jul", 40, "#03A9F4"],
//   ["Aug", 30, "#8BC34A"],
//   ["Sep", 30, "#FF9800"],
//   ["Oct", 20, "#795548"],
//   ["Nov", 20, "#607D8B"],
//   ["Dec", 10, "#000000"],
// ];

// const options = {
//   title: "Monthly Attendance",
//   chartArea: { width: "70%" },
//   hAxis: {
//     title: "Months",
//   },
//   vAxis: {
//     title: "Attendance (%)",
//     ticks: [0, 20, 40, 60, 80, 100],
//     minValue: 0,
//   },
//   legend: { position: "none" },
// };

// export default function StudentProfile() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-screen p-4">
//       {/* Left Column */}
//       <div className="md:col-span-2 space-y-6">
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//           {[
//             { label: "Attendance", icon: attendence, value: "93%" },
//             { label: "Current Level", icon: level, value: "93%" },
//             { label: "Permission", icon: permission, value: "93%" },
//             { label: "Placement Info", icon: placed, value: "93%" },
//           ].map((item, index) => (
//             <div
//               key={index}
//               className="p-4 bg-blue-500 text-white rounded-xl shadow"
//             >
//               <div className="flex justify-between">
//                 <p>{item.label}</p>
//                 <img className="h-5" src={item.icon} alt="icon" />
//               </div>
//               <h3 className="text-2xl py-3">{item.value}</h3>
//               <p>Overall from starting</p>
//             </div>
//           ))}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="p-4 bg-white rounded-xl shadow col-span-1">
//             <h2 className="text-lg font-semibold">Placement Info</h2>
//             <div className="py-6 space-y-2">
//               {[
//                 { icon: company, text: "Company: Google" },
//                 { icon: position, text: "Position: Full Stack Developer" },
//                 { icon: loca, text: "Location: Noida" },
//                 { icon: date, text: "Date: 01/03/2020" },
//               ].map((item, index) => (
//                 <div key={index} className="flex items-center space-x-3">
//                   <img className="h-5" src={item.icon} alt="icon" />
//                   <p className="text-gray-500 text-lg">{item.text}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="p-4 bg-white rounded-xl shadow col-span-1 md:col-span-2">
//             <h2 className="text-lg font-semibold">Attendance</h2>
//             <Chart
//               chartType="ColumnChart"
//               width="100%"
//               height="300px"
//               data={graphData}
//               options={options}
//             />
//           </div>
//         </div>
//       </div>
//       {/* Right Column */}
//       <div className="space-y-6">
//         <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
//           <img
//             src={profile}
//             alt="Profile"
//             className="rounded-full w-24 h-24 mb-4"
//           />
//           <h2 className="text-lg font-semibold">Anees Khan</h2>
//           <p className="text-gray-500">Anees@gmail.com</p>
//           <div className="mt-4 space-y-2">
//             <p className="text-gray-700">📞 +91 9131934421</p>
//             <p className="text-gray-700">📍 Gopi Krishna Colony, Harda</p>
//           </div>
//         </div>
//         <div className="bg-white rounded-2xl shadow p-6">
//           <h2 className="text-lg font-semibold">Permission</h2>
//           <p>Date - 01/03/2025</p>
//           <p>Reason - Health Issue</p>
//         </div>
//       </div>
//     </div>
//   );
// }

import company from "../../../assets/icons/company-icon.png";
import position from "../../../assets/icons/position-icon.png";
import loca from "../../../assets/icons/location-icon.png";
import date from "../../../assets/icons/calendar-icon.png";
import attendence from "../../../assets/icons/attendence-card-icon.png";
import level from "../../../assets/icons/level-card-icon.png";
import permission from "../../../assets/icons/permission-card-icon.png";
import placed from "../../../assets/icons/placement-card-icon.png";
// import address from "../../../assets/icons/company-icon.png"
// import reason from "../../../assets/icons/company-icon.png"
// import profileEdit from "../../../assets/icons/company-icon.png"
import profile from "../../../assets/images/profile-img.png";
import { Chart } from "react-google-charts";

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

// Function to assign colors dynamically
const getColor = (attendance) => {
  if (attendance > 80) return "#4285F4"; // Blue
  if (attendance >= 50) return "#FBBC05"; // Yellow
  return "#EA4335"; // Red
};

// Transform data to include color and tooltip
const graphData = [
  [
    "Month",
    "Attendance",
    { role: "style" },
    { role: "tooltip", type: "string" },
  ],
  ...rawGraphData.slice(1).map(([month, attendance]) => [
    month,
    attendance,
    `color: ${getColor(attendance)}; stroke-color: none; stroke-width: 0;`,
    `Attendance: ${attendance}%`, // Tooltip content
  ]),
];

const options = {
  title: "Monthly Attendance",
  chartArea: { width: "70%" },
  bar: {
    groupWidth: "40%", // Reduce bar width
  },
  hAxis: { title: "Months" },
  vAxis: {
    title: "Attendance (%)",
    ticks: [0, 20, 40, 60, 80, 100],
    minValue: 0,
  },
  legend: { position: "none" },
  enableInteractivity: true, // Enables hover tooltips
};

export default function StudentProfile() {
  return (
    <div className="grid grid-cols-3 gap-6 h-screen">
      {/* Left Column (75%) */}
      <div className="col-span-2 px-6 py-8">
        <div className="grid grid-cols-4  gap-4">
          <div className="p-4 bg-[#9BAEF5] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Attendance</p>
              <img className="h-5" src={attendence} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-2">
              93<span className="text-sm">%</span>
            </h3>
            <p>Overall from starting</p>
          </div>{" "}
          <div className="p-4 bg-[#F5B477] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Current Level</p>
              <img className="h-5" src={level} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-2">
              1A
              {/* <span className="text-sm">%</span> */}
            </h3>
            <p>Overall from starting</p>
          </div>
          <div className="p-4 bg-[#C23F7E] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Permission</p>
              <img className="h-5" src={permission} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-2">
              No
              {/* <span className="text-sm">%</span> */}
            </h3>
            <p>Overall from starting</p>
          </div>
          <div className="p-4 bg-[#3FC260] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Placement Info</p>
              <img className="h-5" src={placed} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-2">
              Not Placed
              {/* <span className="text-sm">%</span> */}
            </h3>
            <p>Overall from starting</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 border col-span-1 bg-white rounded-xl shadow">
            <h2 className="text-lg font-semibold">Placement Info</h2>
            <div className="py-6">
              <div className="flex h-10">
                <img className="h-5 pr-3" src={company} alt="company-icon" />{" "}
                <p className="text-gray-500 text-lg">Company: Google</p>
              </div>
              <div className="flex h-10">
                <img className="h-5 pr-3" src={position} alt="company-icon" />{" "}
                <p className="text-gray-500 text-lg">
                  Position: Full Stack Developer
                </p>
              </div>
              <div className="flex h-10">
                <img className="h-5 pr-3" src={loca} alt="company-icon" />{" "}
                <p className="text-gray-500 text-lg">Location: Noida</p>
              </div>
              <div className="flex h-10">
                <img className="h-5 pr-3" src={date} alt="company-icon" />{" "}
                <p className="text-gray-500 text-lg">Date: 01/03/2020</p>{" "}
              </div>{" "}
            </div>
          </div>

          <div className="p-4 border col-span-2 bg-white rounded-xl shadow">
            <h2 className="text-lg font-semibold">Attendance</h2>

            <Chart
              chartType="ColumnChart"
              width="100%"
              height="250px"
              data={graphData}
              options={options}
            />
          </div>
        </div>
      </div>

      {/* Right Column (25%) */}
      <div className="col-span-1 flex flex-col gap-6">
        {/* Profile Section (75% Height) */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">
          <img
            src={profile}
            alt="Profile"
            className="rounded-full w-24 h-24 mb-4"
          />
          <h2 className="text-lg font-semibold">Anees Khan</h2>
          <p className="text-gray-500">Anees@gmail.com</p>
          <div className="mt-4 space-y-2">
            <p className="text-gray-700">📞 +91 9131934421</p>
            <p className="text-gray-700">📍 Gopi Krishna Colony, Harda</p>
          </div>
        </div>

        {/* Permission Section (25% Height) */}
        <div className="h-1/4 bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold">Permission</h2>
          <p>Date - 01/03/3025</p>
          <p>Reason - Health Issue</p>
        </div>
      </div>
    </div>
  );
}
