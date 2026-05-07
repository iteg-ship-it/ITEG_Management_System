import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPeople, MdTrendingUp, MdBlock, MdCheckCircle,
  MdWork, MdWarningAmber, MdArrowForward, MdRefresh, MdSchool,
} from "react-icons/md";
import { FaUserGraduate, FaMale, FaFemale } from "react-icons/fa";
import Header from "../common-components/sidebar/Header";
import api from "../../utils/axiosInstance";

// ── Reusable Stat Card ───────────────────────────────────────
const StatCard = ({ title, value, icon, color, sub }) => {
  const c = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
    teal:   "bg-teal-50 text-teal-600",
  }[color] || "bg-gray-50 text-gray-600";

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
      <div className={`${c} p-3 rounded-lg text-2xl shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{title}</p>
        <p className={`text-2xl font-bold ${c.split(" ")[1]}`}>{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────
const Skel = ({ h = "h-24" }) => (
  <div className={`${h} bg-gray-100 rounded-xl animate-pulse`} />
);

// ── Section Label ────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
);

// ── Main ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/overview");
      setData(res.data.data);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const s  = data?.studentStats     || {};
  const g  = data?.genderBreakdown  || {};
  const p  = data?.placementSummary || {};
  const depts = data?.departments   || [];

  const totalGender = (g.male || 0) + (g.female || 0);
  const malePct   = totalGender > 0 ? Math.round((g.male   / totalGender) * 100) : 0;
  const femalePct = totalGender > 0 ? Math.round((g.female / totalGender) * 100) : 0;

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of students, academics and placement"
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300"
        >
          <MdRefresh className={loading ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </Header>

      <div className="p-4 md:p-6 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ── Student Stats ── */}
        <div>
          <SectionLabel label="Students" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {loading ? Array(6).fill(0).map((_, i) => <Skel key={i} />) : (
              <>
                <StatCard title="Total"     value={s.total}       icon={<MdPeople />}       color="blue"   />
                <StatCard title="Active"    value={s.active}      icon={<FaUserGraduate />} color="green"  />
                <StatCard title="Placed"    value={s.placed}      icon={<MdTrendingUp />}   color="purple" />
                <StatCard title="Completed" value={s.completed}   icon={<MdSchool />}       color="teal"   />
                <StatCard title="Dropped"   value={s.dropped}     icon={<MdBlock />}        color="red"    />
                <StatCard title="On Leave"  value={s.onPermission} icon={<MdWarningAmber />} color="orange"
                  sub={s.onPermission > 0 ? "Needs attention" : "All clear"}
                />
              </>
            )}
          </div>
        </div>

        {/* ── Placement Summary + Gender ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Placement */}
          <div className="xl:col-span-2">
            <SectionLabel label="Placement Summary" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {loading ? Array(4).fill(0).map((_, i) => <Skel key={i} />) : (
                <>
                  <StatCard title="Ready"            value={p.readyForPlacement} icon={<MdCheckCircle />} color="green"  />
                  <StatCard title="Interviews On"    value={p.interviewRunning}  icon={<MdWork />}        color="orange" />
                  <StatCard title="Total Placed"     value={p.totalPlaced}       icon={<MdTrendingUp />}  color="purple" />
                  <StatCard
                    title="Placement Rate"
                    value={`${p.placementRate ?? 0}%`}
                    icon={<MdSchool />}
                    color="blue"
                    sub={`${p.totalPlaced ?? 0} of ${s.total ?? 0}`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Gender */}
          <div>
            <SectionLabel label="Gender Breakdown" />
            <div className="bg-white rounded-xl border shadow-sm p-5 h-full">
              {loading ? <Skel h="h-full" /> : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <FaMale size={20} />
                      <span className="text-sm font-medium text-gray-700">Male</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{g.male ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${malePct}%` }} />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-pink-500">
                      <FaFemale size={20} />
                      <span className="text-sm font-medium text-gray-700">Female</span>
                    </div>
                    <span className="text-lg font-bold text-pink-500">{g.female ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-pink-400 h-2 rounded-full transition-all" style={{ width: `${femalePct}%` }} />
                  </div>

                  <p className="text-xs text-gray-400 text-center pt-1">
                    {malePct}% Male · {femalePct}% Female
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Department Table ── */}
        <div>
          <SectionLabel label="Department-wise Overview" />
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 text-sm">All Departments</h3>
              {!loading && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                  {depts.length} departments
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Active</th>
                    <th className="px-5 py-3 text-center">Placed</th>
                    <th className="px-5 py-3 text-center">Dropped</th>
                    <th className="px-5 py-3 text-left">Placement Rate</th>
                    {(role === "superadmin" || role === "admin") && (
                      <th className="px-5 py-3 text-center"></th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} className="px-5 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : depts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                        No department data available
                      </td>
                    </tr>
                  ) : (
                    depts.map((d) => {
                      const pct = d.placementRate;
                      const barColor = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-orange-400" : "bg-red-400";
                      const textColor = pct >= 70 ? "text-green-600" : pct >= 40 ? "text-orange-500" : "text-red-500";
                      return (
                        <tr
                          key={d.subDepartmentId}
                          className={`transition ${(role === "superadmin" || role === "admin") ? "hover:bg-orange-50 cursor-pointer" : ""}`}
                          onClick={() => (role === "superadmin" || role === "admin") && navigate(`/placements/department/${d.subDepartmentId}`)}
                        >
                          <td className="px-5 py-3 font-medium text-gray-800">{d.name}</td>
                          <td className="px-5 py-3 text-center text-gray-600">{d.total}</td>
                          <td className="px-5 py-3 text-center text-green-600 font-medium">{d.active}</td>
                          <td className="px-5 py-3 text-center text-purple-600 font-medium">{d.placed}</td>
                          <td className="px-5 py-3 text-center text-red-500">{d.dropped}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                                <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className={`text-xs font-semibold w-10 text-right ${textColor}`}>{pct}%</span>
                            </div>
                          </td>
                          {(role === "superadmin" || role === "admin") && (
                            <td className="px-5 py-3 text-center">
                              <MdArrowForward className="text-gray-400 mx-auto" />
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <SectionLabel label="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Student Progress",     path: "/student-detail-table", border: "border-blue-200   hover:bg-blue-50"   },
              { label: "Placement Candidates", path: "/readiness-status",     border: "border-green-200  hover:bg-green-50"  },
              { label: "Dummy Students",       path: "/student-permission",   border: "border-orange-200 hover:bg-orange-50" },
              { label: "User Management",      path: "/user-management",      border: "border-purple-200 hover:bg-purple-50" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`border-2 ${item.border} bg-white rounded-xl px-4 py-3 text-sm font-medium text-gray-700 flex items-center justify-between transition`}
              >
                {item.label}
                <MdArrowForward className="text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;
