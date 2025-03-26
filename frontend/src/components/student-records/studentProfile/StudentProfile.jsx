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
import { Chart } from "react-google-charts";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const data = [
//   { month: "Jan", attendance: 100 },
//   { month: "Feb", attendance: 90 },
//   { month: "Mar", attendance: 90 },
//   { month: "Apr", attendance: 80 },
//   { month: "May", attendance: 60 },
//   { month: "Jun", attendance: 50 },
//   { month: "Jul", attendance: 40 },
//   { month: "Aug", attendance: 30 },
//   { month: "Sep", attendance: 30 },
//   { month: "Oct", attendance: 20 },
//   { month: "Nov", attendance: 20 },
//   { month: "Dec", attendance: 10 },
// ];

const graphData = [
  ["Month", "Attendance", { role: "style" }],
  ["Jan", 100, "#4285F4"], // Blue
  ["Feb", 90, "#34A853"], // Green
  ["Mar", 90, "#FBBC05"], // Yellow
  ["Apr", 80, "#EA4335"], // Red
  ["May", 60, "#9C27B0"], // Purple
  ["Jun", 50, "#FF5722"], // Orange
  ["Jul", 40, "#03A9F4"], // Light Blue
  ["Aug", 30, "#8BC34A"], // Lime Green
  ["Sep", 30, "#FF9800"], // Dark Orange
  ["Oct", 20, "#795548"], // Brown
  ["Nov", 20, "#607D8B"], // Blue Gray
  ["Dec", 10, "#000000"], // Black
];

const options = {
  title: "Monthly Attendance",
  chartArea: { width: "70%" },
  hAxis: {
    title: "Months", // X-axis label
  },
  vAxis: {
    title: "Attendance (%)", // Y-axis label
    ticks: [0, 20, 40, 60, 80, 100], // Ensures Y-axis has fixed points
    minValue: 0, // Starts Y-axis from 0
  },
  legend: { position: "none" }, // Hides legend
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
            <h3 className="text-2xl py-3">
              93<span className="text-sm">%</span>
            </h3>
            <p>Overall from starting</p>
          </div>{" "}
          <div className="p-4 bg-[#F5B477] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Current Level</p>
              <img className="h-5" src={level} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-3">
              93<span className="text-sm">%</span>
            </h3>
            <p>Overall from starting</p>
          </div>
          <div className="p-4 bg-[#C23F7E] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Permission</p>
              <img className="h-5" src={permission} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-3">
              93<span className="text-sm">%</span>
            </h3>
            <p>Overall from starting</p>
          </div>
          <div className="p-4 bg-[#3FC260] text-white rounded-xl shadow">
            <div className="flex  justify-between">
              <p>Placement Info</p>
              <img className="h-5" src={placed} alt="company-icon" />
            </div>
            <h3 className="text-2xl py-3">
              93<span className="text-sm">%</span>
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
              height="100%"
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
            src="https://via.placeholder.com/100"
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
