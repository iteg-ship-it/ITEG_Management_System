import { useState } from "react";
import { MdPeople, MdCheckCircle, MdWork, MdTrendingUp, MdPercent } from "react-icons/md";
import StatsCard from "./StatsCard";
import DepartmentTable from "./DepartmentTable";
import PlacementFunnel from "./PlacementFunnel";
import TopCompanies from "./TopCompanies";
import AlertBox from "./AlertBox";


// ── Dummy Data ───────────────────────────────────────────────
const DUMMY_OVERVIEW = {
  totalStudents: 120,
  readyStudents: 45,
  interviewRunning: 18,
  totalPlaced: 85,
  placementPercentage: 70.83,
};


const DUMMY_DEPARTMENTS = [
  { subDepartmentId: "1", subDepartmentName: "Computer Applications", totalStudents: 40, placedStudents: 32, placementPercentage: 80.0 },
  { subDepartmentId: "2", subDepartmentName: "Information Technology",  totalStudents: 35, placedStudents: 25, placementPercentage: 71.4 },
  { subDepartmentId: "3", subDepartmentName: "Electronics",             totalStudents: 25, placedStudents: 18, placementPercentage: 72.0 },
  { subDepartmentId: "4", subDepartmentName: "Mechanical",              totalStudents: 20, placedStudents:  6, placementPercentage: 30.0 },
];


const DUMMY_FUNNEL = { ready: 45, interview: 18, selected: 10, placed: 85 };


const DUMMY_COMPANIES = [
  { companyName: "TCS Pvt Ltd",       totalHires: 22, avgSalary: 450000 },
  { companyName: "Infosys",           totalHires: 18, avgSalary: 420000 },
  { companyName: "Wipro",             totalHires: 15, avgSalary: 400000 },
  { companyName: "HCL Technologies",  totalHires: 12, avgSalary: 380000 },
  { companyName: "Tech Mahindra",     totalHires:  8, avgSalary: 360000 },
];


const DUMMY_ALERTS = {
  studentsReadyButNoInterview: 12,
  lowestPerformingDepartment: { subDepartmentId: "4", name: "Mechanical", placementPercentage: 30.0 },
};
// ────────────────────────────────────────────────────────────


const PlacementDashboard = () => {
  const [loading] = useState(false);


  const overview    = DUMMY_OVERVIEW;
  const departments = DUMMY_DEPARTMENTS;
  const funnel      = DUMMY_FUNNEL;
  const companies   = DUMMY_COMPANIES;
  const alerts      = DUMMY_ALERTS;


  const STATS = [
    { title: "Total Students",     value: overview.totalStudents,                    icon: <MdPeople />,      color: "blue"   },
    { title: "Ready Students",     value: overview.readyStudents,                    icon: <MdCheckCircle />, color: "green"  },
    { title: "Interviews Running", value: overview.interviewRunning,                 icon: <MdWork />,        color: "orange" },
    { title: "Total Placed",       value: overview.totalPlaced,                      icon: <MdTrendingUp />,  color: "purple" },
    { title: "Placement %",        value: `${overview.placementPercentage}%`,        icon: <MdPercent />,     color: "orange" },
  ];


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Placement Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview of placement activity across all departments</p>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>


      {/* Funnel */}
      <PlacementFunnel data={funnel} loading={loading} />


      {/* Department Table + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DepartmentTable data={departments} loading={loading} />
        </div>
        <AlertBox data={alerts} loading={loading} />
      </div>


      {/* Top Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCompanies data={companies} loading={loading} />
      </div>
    </div>
  );
};


export default PlacementDashboard;