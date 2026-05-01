import { useParams, useNavigate } from "react-router-dom";
import { MdPeople, MdCheckCircle, MdWork, MdTrendingUp, MdPercent, MdWarningAmber, MdTrendingDown, MdBlock } from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import StatsCard from "./StatsCard";
import PlacementFunnel from "./PlacementFunnel";
import StatusBreakdown from "./StatusBreakdown";
import TopCompanies from "./TopCompanies";

// ── Dummy Data ───────────────────────────────────────────────
const DUMMY = {
  overview:   { totalStudents: 40, readyStudents: 15, interviewRunning: 6, placedStudents: 28, placementPercentage: 70.0 },
  funnel:     { ready: 15, interview: 6, selected: 4, placed: 28 },
  breakdown:  { notReady: 8, inProgress: 5, ready: 10, readyForInterview: 5, interview: 6, selected: 4, placed: 28 },
  alerts:     { readyButNoInterview: 7, multipleRejections: 3, placementPercentage: 70.0 },
  readyStudents: [
    { studentId: "1", name: "Rahul Sharma",   prkey: "SS001", readinessStatus: "Ready",              hasInterview: false, interviewStatus: null,        lastActivity: "2025-01-10" },
    { studentId: "2", name: "Priya Verma",    prkey: "SS002", readinessStatus: "Ready for Interview", hasInterview: true,  interviewStatus: "Scheduled",  lastActivity: "2025-01-12" },
    { studentId: "3", name: "Amit Patel",     prkey: "SS003", readinessStatus: "Ready",              hasInterview: false, interviewStatus: null,        lastActivity: "2025-01-08" },
    { studentId: "4", name: "Sneha Joshi",    prkey: "SS004", readinessStatus: "Ready",              hasInterview: true,  interviewStatus: "Ongoing",    lastActivity: "2025-01-14" },
    { studentId: "5", name: "Vikram Singh",   prkey: "SS005", readinessStatus: "Ready for Interview", hasInterview: false, interviewStatus: null,        lastActivity: "2025-01-09" },
  ],
  recentPlacements: [
    { studentId: "6",  studentName: "Anjali Gupta",   companyName: "TCS Pvt Ltd",      salary: 450000, placedDate: "2025-01-05" },
    { studentId: "7",  studentName: "Rohan Mehta",    companyName: "Infosys",          salary: 420000, placedDate: "2025-01-03" },
    { studentId: "8",  studentName: "Kavya Nair",     companyName: "Wipro",            salary: 400000, placedDate: "2024-12-28" },
    { studentId: "9",  studentName: "Arjun Yadav",    companyName: "HCL Technologies", salary: 380000, placedDate: "2024-12-20" },
    { studentId: "10", studentName: "Pooja Sharma",   companyName: "Tech Mahindra",    salary: 360000, placedDate: "2024-12-15" },
  ],
  topCompanies: [
    { companyName: "TCS Pvt Ltd",       hires: 10, avgSalary: 450000 },
    { companyName: "Infosys",           hires: 8,  avgSalary: 420000 },
    { companyName: "Wipro",             hires: 6,  avgSalary: 400000 },
    { companyName: "HCL Technologies",  hires: 4,  avgSalary: 380000 },
  ],
};
// ────────────────────────────────────────────────────────────

const formatSalary = (n) => n ? `₹${(n / 100000).toFixed(1)}L` : "—";
const formatDate   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const DepartmentPlacementDetail = () => {
  const { subDepartmentId } = useParams();
  const navigate = useNavigate();
  const loading = false;

  const { overview, funnel, breakdown, alerts, readyStudents, recentPlacements, topCompanies } = DUMMY;

  const STATS = [
    { title: "Total Students",     value: overview.totalStudents,       icon: <MdPeople />,      color: "blue"   },
    { title: "Ready Students",     value: overview.readyStudents,        icon: <MdCheckCircle />, color: "green"  },
    { title: "Interviews Running", value: overview.interviewRunning,     icon: <MdWork />,        color: "orange" },
    { title: "Placed Students",    value: overview.placedStudents,       icon: <MdTrendingUp />,  color: "purple" },
    { title: "Placement %",        value: `${overview.placementPercentage}%`, icon: <MdPercent />, color: "orange" },
  ];

  return (
    <>
      <Header
        title="Department Placement Detail"
        breadcrumbs={[
          { label: "Placements", path: "/placements/dashboard" },
          { label: "Dashboard",  path: "/placements/dashboard" },
          { label: "Department Detail" },
        ]}
      />

      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {STATS.map((s) => (
            <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} />
          ))}
        </div>

        {/* Funnel */}
        <PlacementFunnel data={funnel} loading={loading} />

        {/* Status Breakdown */}
        <StatusBreakdown data={breakdown} loading={loading} />

        {/* Alerts + Top Companies */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Alerts */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Alerts & Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <MdWarningAmber className="text-orange-500 text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Ready but no interview scheduled</p>
                  <p className="text-2xl font-bold text-orange-500 mt-0.5">
                    {alerts.readyButNoInterview}
                    <span className="text-xs font-normal text-gray-400 ml-1">students</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <MdBlock className="text-red-500 text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Students with multiple rejections</p>
                  <p className="text-2xl font-bold text-red-500 mt-0.5">
                    {alerts.multipleRejections}
                    <span className="text-xs font-normal text-gray-400 ml-1">students</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <MdTrendingDown className="text-yellow-600 text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Department placement rate</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-0.5">
                    {alerts.placementPercentage}%
                    <span className="text-xs font-normal text-gray-400 ml-1">placed</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Companies */}
          <TopCompanies data={topCompanies} loading={loading} />
        </div>

        {/* Ready Students - Needs Attention */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 text-sm">Ready Students — Needs Attention</h3>
              <p className="text-xs text-gray-400 mt-0.5">Students ready for placement interviews</p>
            </div>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
              {readyStudents.length} students
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Readiness</th>
                  <th className="px-5 py-3 text-left">Interview Status</th>
                  <th className="px-5 py-3 text-left">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {readyStudents.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No ready students</td></tr>
                ) : (
                  readyStudents.map((s) => (
                    <tr
                      key={s.studentId}
                      onClick={() => navigate(`/student-profile/${s.studentId}`)}
                      className="hover:bg-orange-50 cursor-pointer transition"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.prkey}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.readinessStatus === "Ready for Interview"
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                          {s.readinessStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {s.hasInterview ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.interviewStatus === "Ongoing"   ? "bg-green-100 text-green-600"
                            : s.interviewStatus === "Selected" ? "bg-purple-100 text-purple-600"
                            : "bg-orange-100 text-orange-600"
                          }`}>
                            {s.interviewStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                            ❗ No Interview
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(s.lastActivity)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Placements */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-700 text-sm">Recent Placements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Company</th>
                  <th className="px-5 py-3 text-left">Salary</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPlacements.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No placements yet</td></tr>
                ) : (
                  recentPlacements.map((p) => (
                    <tr
                      key={p.studentId}
                      onClick={() => navigate(`/student-profile/${p.studentId}`)}
                      className="hover:bg-orange-50 cursor-pointer transition"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{p.studentName}</p>
                        <p className="text-xs text-gray-400">{p.prkey}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{p.companyName}</td>
                      <td className="px-5 py-3">
                        <span className="text-green-600 font-semibold">{formatSalary(p.salary)}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(p.placedDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default DepartmentPlacementDetail;
