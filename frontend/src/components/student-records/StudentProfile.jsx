/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import PermissionModal from "./PermissionModal";
import PlacementModal from "./PlacementModal";
import Loader from "../common-components/loader/Loader";
import UpdateTechnologyModal from "./UpdateTechnologyModal";


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
import { HiArrowNarrowLeft } from "react-icons/hi";

import { Chart } from "react-google-charts";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("StudentProfile ~ id:", import.meta.VITE_GET_ADMITTED_STUDENTS_BY_ID);
  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const [latestLevel, setLatestLevel] = useState("1A");
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [isPlacedModalOpen, setPlacedModalOpen] = useState(false);
  const [isTechModalOpen, setTechModalOpen] = useState(false);

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

  // Check permission status
  const hasPermission = studentData.permissionDetails && studentData.permissionDetails !== null && typeof studentData.permissionDetails === 'object' && Object.keys(studentData.permissionDetails).length > 0;
  const permissionStatus = hasPermission ? "Yes" : "No";

  // Check placement status
  const hasPlacement = studentData.placedinfo && studentData.placedinfo !== null && typeof studentData.placedinfo === 'object' && Object.keys(studentData.placedinfo).length > 0;
  const placementStatus = hasPlacement ? "Placed" : "Not Placed";

  // Calculate actual attendance data from API or use default
  const attendanceData = studentData.attendance || [
    ["Jan", 95], ["Feb", 92], ["Mar", 88], ["Apr", 90],
    ["May", 85], ["Jun", 87], ["Jul", 89], ["Aug", 91],
    ["Sep", 93], ["Oct", 88], ["Nov", 90], ["Dec", 92]
  ];

  const graphData = [
    ["Month", "Attendance", { role: "style" }, { role: "tooltip", type: "string" }],
    ...attendanceData.map(([month, att]) => [
      month,
      att,
      `color: ${att > 80 ? "#4285F4" : att >= 50 ? "#FBBC05" : "#EA4335"}`,
      `Attendance: ${att}%`,
    ]),
  ];

  // Calculate average attendance
  const avgAttendance = Math.round(
    attendanceData.reduce((sum, [, att]) => sum + att, 0) / attendanceData.length
  );

  const chartOptions = {
    chartArea: { width: "70%" },
    bar: { groupWidth: "40%" },
    hAxis: { title: "Months" },
    vAxis: { title: "Attendance (%)", minValue: 0, maxValue: 100 },
    legend: "none",
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-2xl text-[var(--text-color)] hover:text-gray-900"
        >
          <HiArrowNarrowLeft />
        </button>
        <h1 className="text-2xl py-4 font-bold">Student Profile</h1>
      </div>
      <div className="px-4 space-y-6 min-h-screen mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
          {/* Left Section */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={attendence} title="Attendance" value={`${avgAttendance}%`} bg="#9BAEF5" />
              <InfoCard 
                icon={level} 
                title="Current Level" 
                value={latestLevel} 
                bg="#F5B477" 
                onClick={() => navigate(`/student/${id}/level-interviews`)}
              />
              <InfoCard
                icon={permission}
                title="Permission"
                value={permissionStatus}
                bg="#C23F7E"
                onClick={() => setPermissionModalOpen(true)}
              />
              <InfoCard
                icon={placed}
                title="Placement Info"
                value={placementStatus}
                bg="#3FC260"
                onClick={() => setPlacedModalOpen(true)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Placement Info</h3>
                <InfoLine icon={company} label="Company" value={studentData.company || "Not Assigned"} />
                <InfoLine icon={position} label="Position" value={studentData.position || "Not Assigned"} />
                <InfoLine icon={loca} label="Location" value={studentData.location || "Not Assigned"} />
                <InfoLine icon={date} label="Date" value={studentData.placementDate || "Not Assigned"} />
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold mb-2">Student Progress State</h3>
                <div className="flex justify-around items-center">
                  <CircleStat title="Certificates" value={studentData.certificates?.length || "0"} />
                  <CircleStat title="Success Rate" value={`${avgAttendance}%`} color="text-green-600" />
                  <CircleStat title="Levels" value={studentData.level?.length || "0"} bg="bg-yellow-400" textColor="text-white" />
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
            <button
              onClick={() => setTechModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-4"
            >
              Update Technology
            </button>

          </div>
        </div>
      </div >

      {/* Modals with studentId */}
      < PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setPermissionModalOpen(false)
        }
        studentData={studentData}
        studentId={studentData._id}
      />
      <PlacementModal
        isOpen={isPlacedModalOpen}
        onClose={() => setPlacedModalOpen(false)}
        studentData={studentData}
        studentId={studentData._id}
      />
      <UpdateTechnologyModal
        isOpen={isTechModalOpen}
        onClose={() => setTechModalOpen(false)}
        studentId={studentData._id}
      />

    </>
  );
}

// InfoCard Component
const InfoCard = ({ icon, title, value, bg, onClick }) => (
  <div
    className={`bg-white p-4 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
      onClick ? 'hover:scale-105 transform transition-transform' : ''
    }`}
    onClick={onClick}
    style={{ backgroundColor: bg }}
  >
    <div className="flex items-center gap-3">
      <img src={icon} alt={title} className="w-8 h-8" />
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

// InfoLine Component
const InfoLine = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 mb-3">
    <img src={icon} alt={label} className="w-5 h-5" />
    <div className="flex-1">
      <span className="text-sm text-gray-600">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

// CircleStat Component
const CircleStat = ({ title, value, color = "text-blue-600", bg = "bg-blue-100", textColor = "text-gray-800" }) => (
  <div className="text-center">
    <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mb-2`}>
      <span className={`text-xl font-bold ${textColor}`}>{value}</span>
    </div>
    <p className={`text-sm ${color}`}>{title}</p>
  </div>
);

