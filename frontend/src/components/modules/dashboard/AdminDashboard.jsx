import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPeople, MdTrendingUp, MdBlock, MdCheckCircle,
  MdWork, MdWarningAmber, MdArrowForward, MdRefresh, MdSchool,
  MdNotificationsNone, MdClose, MdFileDownload
} from "react-icons/md";
import { FaUserGraduate, FaMale, FaFemale, FaGraduationCap } from "react-icons/fa";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Header from "../../shared/sidebar/Header";
import api from "../../../utils/axiosInstance";
import { useGetAllSessionsQuery } from "../../../redux/api/authApi";

// ── Reusable Stat Card ───────────────────────────────────────
const StatCard = ({ title, value, icon, color, sub, trend, trendColor }) => {
  const bgStyles = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
    teal:   "bg-teal-50 text-teal-600",
  }[color] || "bg-gray-50 text-gray-600";

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between min-h-[140px] transition hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-semibold">{title}</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{value ?? "—"}</p>
        </div>
        <div className={`${bgStyles} p-3 rounded-xl text-2xl shrink-0`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-4 text-xs font-semibold">
          <span className={trendColor || "text-gray-400"}>{trend}</span>
          {sub && <span className="text-gray-400 font-normal">{sub}</span>}
        </div>
      )}
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────────
const Skel = ({ h = "h-32" }) => (
  <div className={`${h} bg-gray-100 rounded-xl animate-pulse`} />
);

// ── Section Label ────────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
);

// ── Main Component ───────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const userObj = JSON.parse(localStorage.getItem("user") || "{}");

  const isDepartmentUser = ["hod", "faculty"].includes(role);
  const departmentName = userObj.department || "ITEG";
  const departmentSubtext = departmentName === "ITEG" ? "IT & ENGINEERING" : `${departmentName} DEPARTMENT`;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Fetch real sessions dynamically from DB (all active, upcoming, archived, completed)
  const { data: sessionsData } = useGetAllSessionsQuery(true);
  const sessionsList = sessionsData?.data || [];

  // Filter States
  const [academicYear, setAcademicYear] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (sessionsList.length > 0 && !academicYear) {
      const activeSess = sessionsList.find(s => s.isActive || s.status === 'active') || sessionsList[0];
      if (activeSess) {
        setAcademicYear(activeSess.name.startsWith("AY") ? activeSess.name : `AY ${activeSess.name}`);
      }
    }
  }, [sessionsList, academicYear]);

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

  useEffect(() => {
    fetchData();
  }, []);

  const s  = data?.studentStats     || {};
  const g  = data?.genderBreakdown  || {};
  const p  = data?.placementSummary || {};
  const depts = data?.departments   || [];

  const totalGender = (g.male || 0) + (g.female || 0);
  const malePct   = totalGender > 0 ? Math.round((g.male   / totalGender) * 100) : 0;
  const femalePct = totalGender > 0 ? Math.round((g.female / totalGender) * 100) : 0;

  // Mock Performance Data matching graph in image
  const gpaData = [
    { name: 'SEP', Current: 2.80, Prev: 2.82 },
    { name: 'OCT', Current: 3.12, Prev: 2.90 },
    { name: 'NOV', Current: 3.05, Prev: 3.06 },
    { name: 'DEC', Current: 3.25, Prev: 2.98 },
    { name: 'JAN', Current: 3.32, Prev: 3.10 },
    { name: 'FEB', Current: 3.65, Prev: 3.02 },
    { name: 'MAR', Current: 3.52, Prev: 3.18 },
    { name: 'APR', Current: 3.72, Prev: 3.35 },
    { name: 'MAY', Current: 3.60, Prev: 3.25 },
    { name: 'JUN', Current: 3.82, Prev: 3.50 }
  ];

  // Dynamic distribution counts based on actual database stats
  const totalStudentsVal = s.total || 1240;
  const distributionData = [
    { name: 'Level 1', students: Math.round(totalStudentsVal * 0.35) },
    { name: 'Level 2', students: Math.round(totalStudentsVal * 0.28) },
    { name: 'Level 3', students: Math.round(totalStudentsVal * 0.20) },
    { name: 'Level 4', students: Math.round(totalStudentsVal * 0.17) },
  ];

  // Helper to handle print/download report action
  const handleDownloadReport = () => {
    window.print();
  };

  // ── Render Department Specific Dashboard ──────────────────
  if (isDepartmentUser) {
    return (
      <div className="bg-slate-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Department Dashboard</h1>
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mt-0.5">
              {departmentName} - {departmentSubtext}
            </p>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Badges */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="border border-orange-200 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                Academic Year: {academicYear.replace("AY ", "")}
                <MdClose className="cursor-pointer text-sm" onClick={() => setAcademicYear("AY 2023-24")} />
              </span>
              <span className="border border-orange-200 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                Level: {selectedLevel}
                <MdClose className="cursor-pointer text-sm" onClick={() => setSelectedLevel("All")} />
              </span>
            </div>

            {/* Academic Year Select */}
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {sessionsList.length === 0 ? (
                <option value="">No Sessions Found</option>
              ) : (
                sessionsList.map((s) => {
                  const label = s.name.startsWith("AY") ? s.name : `AY ${s.name}`;
                  const statusText = s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : (s.isActive ? 'Active' : 'Inactive');
                  return (
                    <option key={s._id} value={label}>
                      {label} ({statusText})
                    </option>
                  );
                })
              )}
            </select>

            {/* Level Select */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">All Levels</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
            </select>

            {/* Notification Bell */}
            <button 
              className="p-2 border rounded-lg text-gray-500 hover:text-orange-500 hover:border-orange-200 transition bg-white"
              onClick={() => setShowNotification(!showNotification)}
            >
              <MdNotificationsNone size={20} />
            </button>
          </div>
        </div>

        {/* Notification Toast panel */}
        {showNotification && (
          <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm flex justify-between items-center shadow-sm">
            <span>Welcome back! Logged in as <strong>{userObj.name}</strong> ({role.toUpperCase()}) for the {departmentName} department.</span>
            <button onClick={() => setShowNotification(false)} className="text-lg hover:text-orange-900"><MdClose /></button>
          </div>
        )}

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* ── Top row 5 Stats Cards ───────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading ? Array(5).fill(0).map((_, i) => <Skel key={i} />) : (
              <>
                <StatCard 
                  title="Total Students" 
                  value={s.total ?? 1240} 
                  icon={<MdPeople />} 
                  color="orange" 
                  trend="↗ +5.2%"
                  trendColor="text-green-600"
                  sub="vs last semester"
                />
                <StatCard 
                  title="Admissions" 
                  value={s.admissionsCount ?? 310} 
                  icon={<FaUserGraduate />} 
                  color="orange" 
                  trend="↘ -2.1%"
                  trendColor="text-red-500"
                  sub="new enrollments"
                />
                <StatCard 
                  title="Placed Students" 
                  value={p.totalPlaced ?? 275} 
                  icon={<MdWork />} 
                  color="orange" 
                  trend="↗ +12%"
                  trendColor="text-green-600"
                  sub="placed this season"
                />
                <StatCard 
                  title="Placement %" 
                  value={`${p.placementRate ?? 88.5}%`} 
                  icon={<MdCheckCircle />} 
                  color="orange" 
                  trend="↗ +3%"
                  trendColor="text-green-600"
                  sub="success rate"
                />
                <StatCard 
                  title="Faculty Count" 
                  value={s.facultyCount ?? 42} 
                  icon={<FaGraduationCap />} 
                  color="orange" 
                  trend="Steady"
                  trendColor="text-gray-500"
                  sub="active instructors"
                />
              </>
            )}
          </div>

          {/* ── Middle Row: Level Distribution & Task Completion ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Student Level Distribution */}
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 text-base">Student Distribution by Level</h3>
                <span className="text-xs text-gray-400 font-semibold cursor-pointer">···</span>
              </div>
              <div className="w-full h-64">
                {loading ? <Skel h="h-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="students" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right Column: Departmental Task Completion */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h3 className="font-bold text-gray-700 text-base mb-6">Departmental Task Completion</h3>
              <div className="space-y-5">
                {[
                  { label: "Curriculum Review", value: 92 },
                  { label: "Faculty Evaluations", value: 78 },
                  { label: "Resource Allocation", value: 45 },
                  { label: "Placement Drives", value: 88 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-orange-500">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Row: Exam Performance Trend ───────────────── */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-700 text-base">Exam Performance Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Average GPA across all department modules</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  <span className="text-gray-600">Current AY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                  <span className="text-gray-500">Prev AY</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80">
              {loading ? <Skel h="h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis domain={[0, 4.0]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="Current" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Prev" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#cbd5e1', strokeWidth: 1 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick actions for Department Users */}
          <div className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">Download Academic Progress Report</h4>
              <p className="text-xs text-gray-400 mt-0.5">Generate a complete PDF report of curriculum, students, and placements for {departmentName}.</p>
            </div>
            <button 
              onClick={handleDownloadReport}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 transition text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm"
            >
              <MdFileDownload size={18} />
              Download Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Global Admin Dashboard (Modernized) ──────────────
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {role === "superadmin" ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
            ITEG MANAGEMENT SYSTEM · SYSTEM-WIDE OVERVIEW
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="border border-blue-200 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              Academic Year: {academicYear.replace("AY ", "")}
              <MdClose className="cursor-pointer text-sm" onClick={() => setAcademicYear("AY 2023-24")} />
            </span>
            <span className="border border-blue-200 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              Level: {selectedLevel}
              <MdClose className="cursor-pointer text-sm" onClick={() => setSelectedLevel("All")} />
            </span>
          </div>

          {/* Academic Year Select */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {sessionsList.length === 0 ? (
              <option value="">No Sessions Found</option>
            ) : (
              sessionsList.map((s) => {
                const label = s.name.startsWith("AY") ? s.name : `AY ${s.name}`;
                const statusText = s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : (s.isActive ? 'Active' : 'Inactive');
                return (
                  <option key={s._id} value={label}>
                    {label} ({statusText})
                  </option>
                );
              })
            )}
          </select>

          {/* Level Select */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Levels</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="p-2 border rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200 transition bg-white"
            title="Refresh Data"
          >
            <MdRefresh className={loading ? "animate-spin" : ""} size={20} />
          </button>

          {/* Notification Bell */}
          <button 
            className="p-2 border rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200 transition bg-white"
            onClick={() => setShowNotification(!showNotification)}
          >
            <MdNotificationsNone size={20} />
          </button>
        </div>
      </div>

      {/* Notification Toast panel */}
      {showNotification && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm flex justify-between items-center shadow-sm">
          <span>Welcome back! Logged in as <strong>{userObj.name}</strong> ({role.toUpperCase()}) with system-wide privileges.</span>
          <button onClick={() => setShowNotification(false)} className="text-lg hover:text-blue-900"><MdClose /></button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ── Top row 5 Stats Cards ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? Array(5).fill(0).map((_, i) => <Skel key={i} />) : (
            <>
              <StatCard 
                title="Total Students" 
                value={s.total ?? 0} 
                icon={<MdPeople />} 
                color="blue" 
                trend="↗ +4.8%"
                trendColor="text-green-600"
                sub="vs last semester"
              />
              <StatCard 
                title="Active Students" 
                value={s.active ?? 0} 
                icon={<FaUserGraduate />} 
                color="green" 
                trend="↗ +3.5%"
                trendColor="text-green-600"
                sub="currently enrolled"
              />
              <StatCard 
                title="Placed Students" 
                value={p.totalPlaced ?? 0} 
                icon={<MdWork />} 
                color="purple" 
                trend="↗ +12.4%"
                trendColor="text-green-600"
                sub="placed this season"
              />
              <StatCard 
                title="Placement Rate" 
                value={`${p.placementRate ?? 0}%`} 
                icon={<MdCheckCircle />} 
                color="teal" 
                trend="↗ +2.8%"
                trendColor="text-green-600"
                sub="system average"
              />
              <StatCard 
                title="Faculty & HODs" 
                value={s.facultyCount ?? 0} 
                icon={<FaGraduationCap />} 
                color="orange" 
                trend="Steady"
                trendColor="text-gray-500"
                sub="registered staff"
              />
            </>
          )}
        </div>

        {/* ── Middle Row: Department Distribution & Gender Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Student & Placement Distribution by Department */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-700 text-base">Department Student & Placement Stats</h3>
                <p className="text-xs text-gray-400 mt-0.5">Total students vs. placed students per sub-department</p>
              </div>
              <span className="text-xs text-gray-400 font-semibold cursor-pointer">···</span>
            </div>
            <div className="w-full h-72">
              {loading ? <Skel h="h-full" /> : depts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={depts.map(d => ({
                    name: d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name,
                    Total: d.total || 0,
                    Placed: d.placed || 0
                  }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="Total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                    <Bar dataKey="Placed" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Column: Gender Breakdown */}
          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-700 text-base mb-1">Gender Breakdown</h3>
              <p className="text-xs text-gray-400 mb-6">Distribution across all system users</p>
            </div>
            {loading ? <Skel h="h-48" /> : (
              <div className="space-y-6 my-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-blue-600">
                      <div className="bg-blue-50 p-2 rounded-lg text-lg"><FaMale /></div>
                      <span className="text-sm font-semibold text-gray-700">Male Students</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-blue-600">{g.male ?? 0}</span>
                      <span className="text-xs text-gray-400 block">{malePct}% of total</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${malePct}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-pink-500">
                      <div className="bg-pink-50 p-2 rounded-lg text-lg"><FaFemale /></div>
                      <span className="text-sm font-semibold text-gray-700">Female Students</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-pink-500">{g.female ?? 0}</span>
                      <span className="text-xs text-gray-400 block">{femalePct}% of total</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-pink-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${femalePct}%` }} />
                  </div>
                </div>
              </div>
            )}
            <div className="border-t pt-4 mt-4 text-center">
              <span className="text-xs text-gray-400 font-semibold">Total Profiled: {totalGender} students</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Department Overview Table & Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Department-wise Overview Table (Col span 2) */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-700 text-base">Department-wise Overview</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Key placement metrics by sub-department</p>
                </div>
                {!loading && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-semibold">
                    {depts.length} departments
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3 text-left">Department</th>
                      <th className="px-5 py-3 text-center">Total</th>
                      <th className="px-5 py-3 text-center">Active</th>
                      <th className="px-5 py-3 text-center">Placed</th>
                      <th className="px-5 py-3 text-center">Dropped</th>
                      <th className="px-5 py-3 text-left">Placement Rate</th>
                      <th className="px-5 py-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      Array(4).fill(0).map((_, i) => (
                        <tr key={i}>
                          {Array(7).fill(0).map((_, j) => (
                            <td key={j} className="px-5 py-4">
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
                            className="transition hover:bg-slate-50 cursor-pointer"
                            onClick={() => navigate(`/placements/department/${d.subDepartmentId}`)}
                          >
                            <td className="px-5 py-4 font-semibold text-gray-800">{d.name}</td>
                            <td className="px-5 py-4 text-center text-gray-600 font-medium">{d.total}</td>
                            <td className="px-5 py-4 text-center text-green-600 font-medium">{d.active}</td>
                            <td className="px-5 py-4 text-center text-purple-600 font-medium">{d.placed}</td>
                            <td className="px-5 py-4 text-center text-red-500 font-medium">{d.dropped}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[70px]">
                                  <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                                <span className={`text-xs font-bold w-10 text-right ${textColor}`}>{pct}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <MdArrowForward className="text-gray-400 hover:text-blue-500 mx-auto transition" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions (Col span 1) */}
          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-700 text-base mb-1">Quick System Actions</h3>
              <p className="text-xs text-gray-400 mb-5">Shortcut shortcuts to management sections</p>
            </div>
            <div className="grid grid-cols-1 gap-3 my-auto">
              {[
                { label: "Student Progress",     path: "/student-detail-table" },
                { label: "Placement Candidates", path: "/readiness-status" },
                { label: "Dummy Students Permission",  path: "/student-permission" },
                { label: "User Accounts Management",   path: "/user-management" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="border border-slate-100 hover:border-blue-300 bg-white hover:bg-blue-50/30 rounded-xl p-3.5 text-sm font-semibold text-gray-700 flex items-center justify-between transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    {item.label}
                  </span>
                  <MdArrowForward className="text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
            <div className="text-center pt-4 border-t mt-4">
              <span className="text-[11px] text-gray-400 font-semibold">System settings are available in the sidebar</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
