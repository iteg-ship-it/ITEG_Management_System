/* eslint-disable react/prop-types */
// import { useParams, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import PermissionModal from "./PermissionModal";
import PlacementModal from "./PlacementModal";
import Loader from "../common-components/loader/Loader";

// Icons & Images
import profilePlaceholder from "../../assets/images/profile-img.png";
// import editbutton from "../../assets/icons/edit-icon.png";
import attendence from "../../assets/icons/attendence-card-icon.png";
import level from "../../assets/icons/level-card-icon.png";
import permission from "../../assets/icons/permission-card-icon.png";
import placed from "../../assets/icons/placement-card-icon.png";
import company from "../../assets/icons/company-icon.png";
import position from "../../assets/icons/position-icon.png";
import loca from "../../assets/icons/location-icon.png";
import date from "../../assets/icons/calendar-icon.png";

import { Chart } from "react-google-charts";

export default function StudentProfile() {
  const { id } = useParams();
  // const navigate = useNavigate();
console.log("StudentProfile ~ id:", import.meta.VITE_GET_ADMITTED_STUDENTS_BY_ID);
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const [latestLevel, setLatestLevel] = useState("1A");
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isPlacedModalOpen, setPlacedModalOpen] = useState(false);
  console.log(studentData);

  useEffect(() => {
    if (studentData?.level?.length > 0) {
      const passed = studentData.level.filter((lvl) => lvl.result === "Pass");
      setLatestLevel(passed.length > 0 ? passed[passed.length - 1].levelNo : "1A");
    }
  }, [studentData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }
  
  if (isError || !studentData) return <div className="p-4 text-red-500">Error loading student data.</div>;

  const graphData = [
    ["Month", "Attendance", { role: "style" }, { role: "tooltip", type: "string" }],
    ...[
      ["Jan", 100],
      ["Feb", 90],
      ["Mar", 75],
      ["Apr", 80],
      ["May", 60],
      ["Jun", 50],
      ["Jul", 45],
      ["Aug", 40],
      ["Sep", 38],
      ["Oct", 30],
      ["Nov", 30],
      ["Dec", 25],
    ].map(([month, att]) => [
      month,
      att,
      `color: ${att > 80 ? "#4285F4" : att >= 50 ? "#FBBC05" : "#EA4335"}`,
      `Attendance: ${att}%`,
    ]),
  ];

  const chartOptions = {
    chartArea: { width: "70%" },
    bar: { groupWidth: "40%" },
    hAxis: { title: "Months" },
    vAxis: { title: "Attendance (%)", minValue: 0, maxValue: 100 },
    legend: "none",
  };

  return (
    <>

      <div className="px-4 space-y-6 min-h-screen mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
          {/* Left Section */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={attendence} title="Attendance" value="93%" bg="#9BAEF5" />
              <InfoCard icon={level} title="Current Level" value={latestLevel} bg="#F5B477" />
              <InfoCard
                icon={permission}
                title="Permission"
                value={studentData.permissionStatus || "No"}
                bg="#C23F7E"
                onClick={() => setPermissionModalOpen(true)}
              />
              <InfoCard
                icon={placed}
                title="Placement Info"
                value={studentData.placementStatus || "Not Placed"}
                bg="#3FC260"
                onClick={() => setPlacedModalOpen(true)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Placement Info</h3>
                <InfoLine icon={company} label="Company" value={studentData.company} />
                <InfoLine icon={position} label="Position" value={studentData.position} />
                <InfoLine icon={loca} label="Location" value={studentData.location} />
                <InfoLine icon={date} label="Date" value={studentData.placementDate} />
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Student Progress State</h3>
                <div className="flex justify-around items-center">
                  <CircleStat title="Certificates" value="2" />
                  <CircleStat title="Success Rate" value="99%" color="text-green-600" />
                  <CircleStat title="Levels" value="6" bg="bg-yellow-400" textColor="text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Attendance</h3>
                <Chart
                  chartType="ColumnChart"
                  data={graphData}
                  options={chartOptions}
                  width="100%"
                  height="300px"
                />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Permission</h3>
                <InfoLine icon={date} label="Date" value={studentData?.permissionDetails?.date || "N/A"} />
                <InfoLine icon={permission} label="Reason" value={studentData?.permissionDetails?.reason || "N/A"} />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={studentData.profilePhoto || profilePlaceholder}
                  alt="Profile"
                  className="w-20 h-20 object-cover rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {studentData.firstName} {studentData.lastName}
                  </h2>
                  <p className="text-gray-500">{studentData.email}</p>
                  <p className="text-gray-600">📞 {studentData.studentMobile || "N/A"}</p>
                  <p className="text-gray-600">📍 {studentData.address || studentData.village || "N/A"}</p>
                </div>
              </div>
              {/* <img
                src={editbutton}
                alt="Edit"
                className="w-6 h-6 cursor-pointer"
                onClick={() =>
                  navigate(`/student/edit/${studentData._id}`, {
                    state: { student: studentData },
                  })
                }
              /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Modals with studentId */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        studentData={studentData}
        studentId={studentData._id}
      />
      <PlacementModal
        isOpen={isPlacedModalOpen}
        onClose={() => setPlacedModalOpen(false)}
        studentData={studentData}
        studentId={studentData._id}
      />
    </>
  );
}

// InfoCard Component
const InfoCard = ({ icon, title, value, bg, onClick }) => (
  <div
    className="p-4 rounded-xl shadow text-white cursor-pointer"
    style={{ backgroundColor: bg }}
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium">{title}</p>
      <img src={icon} className="h-5" alt={title} />
    </div>
    <h2 className="text-xl font-bold py-2">{value}</h2>
    <p className="text-xs">Overall From Starting</p>
  </div>
);

// InfoLine Component
const InfoLine = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-1">
    <img className="h-5" src={icon} alt={label} />
    <span className="text-sm">
      <strong>{label}</strong>: {value || "N/A"}
    </span>
  </div>
);

// CircleStat Component
const CircleStat = ({ title, value, bg = "bg-gray-100", textColor = "text-black", color = "" }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center ${bg} ${textColor} text-lg font-semibold ${color}`}
    >
      {value}
    </div>
    <p className="mt-2 text-sm">{title}</p>
  </div>
);

