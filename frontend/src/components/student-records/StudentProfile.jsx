/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";

// Icons & Images
import profilePlaceholder from "../../assets/images/profile-img.png";
import editbutton from "../../assets/icons/edit-icon.png";
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
  const navigate = useNavigate();

  const { data: studentData, isLoading, isError } = useGetAdmittedStudentsByIdQuery(id);
  const [latestLevel, setLatestLevel] = useState("1A");

  useEffect(() => {
    if (studentData?.level?.length > 0) {
      const passed = studentData.level.filter((lvl) => lvl.result === "Pass");
      setLatestLevel(passed.length > 0 ? passed[passed.length - 1].levelNo : "1A");
    }
  }, [studentData]);

  if (isLoading) return <div className="p-4">Loading...</div>;
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
    ].map(([month, att]) => [
      month,
      att,
      `color: ${att > 80 ? "#4285F4" : att >= 50 ? "#FBBC05" : "#EA4335"}`,
      `Attendance: ${att}%`,
    ]),
  ];

  const chartOptions = {
    title: "Monthly Attendance",
    chartArea: { width: "70%" },
    bar: { groupWidth: "40%" },
    hAxis: { title: "Months" },
    vAxis: { title: "Attendance (%)", minValue: 0, maxValue: 100 },
    legend: "none",
  };

  return (
    <>
      <UserProfile showBackButton heading="Student Profile" />
      <div className=" min-h-screen">

        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-2xl p-6 mt-6">
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
            <img
              src={editbutton}
              alt="Edit"
              className="w-6 h-6 cursor-pointer"
              onClick={() =>
                navigate(`/student/edit/${studentData._id}`, {
                  state: { student: studentData },
                })
              }
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <InfoCard icon={attendence} title="Attendance" value="93%" bg="#9BAEF5" />
          <InfoCard icon={level} title="Current Level" value={latestLevel} bg="#F5B477" />
          <InfoCard icon={permission} title="Permission" value={studentData.permissionStatus || "Not"} bg="#C23F7E" />
          <InfoCard icon={placed} title="Placement" value={studentData.placementStatus || "Not Placed"} bg="#3FC260" />
        </div>

        {/* Placement Info and Attendance Chart */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Placement Info</h3>
            <InfoLine icon={company} label="Company" value={studentData.company} />
            <InfoLine icon={position} label="Position" value={studentData.position} />
            <InfoLine icon={loca} label="Location" value={studentData.location} />
            <InfoLine icon={date} label="Date" value={studentData.placementDate} />
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Attendance Overview</h3>
            <Chart
              chartType="ColumnChart"
              data={graphData}
              options={chartOptions}
              width="100%"
              height="300px"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// InfoCard Component
const InfoCard = ({ icon, title, value, bg }) => (
  <div className="p-4 rounded-xl shadow text-white" style={{ backgroundColor: bg }}>
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium">{title}</p>
      <img src={icon} className="h-5" alt={title} />
    </div>
    <h2 className="text-xl font-bold py-2">{value}</h2>
    <p className="text-xs">Overall Summary</p>
  </div>
);

// InfoLine Component
const InfoLine = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-1">
    <img className="h-5" src={icon} alt={label} />
    <span className="text-sm"><strong>{label}</strong>: {value || "N/A"}</span>
  </div>
);