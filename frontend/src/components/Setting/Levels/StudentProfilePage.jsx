import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    MdEmail, MdPhone, MdCheckCircle, MdAccessTime,
    MdTableChart, MdSchool, MdWork,
    MdStar, MdMoreVert,
    MdArrowUpward, MdBadge, MdBusiness, MdCalendarToday,
    MdMenuBook, MdAccountTree, MdVerified
} from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import { useGetNewStudentTasksQuery } from "../../../redux/api/authApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, color = "bg-blue-500" }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">{label}</span>
            <span className="text-xs font-semibold text-gray-700">{value}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

// ── Hero Section ──────────────────────────────────────────────────────────────
const HeroSection = ({ raw, name, initials, level, subdepartment, taskPct, goToTaskBoard, moreOpen, setMoreOpen }) => (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-start gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
                {raw.image ? (
                    <img src={raw.image} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-2xl font-bold">
                        {initials}
                    </div>
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

                {/* Name + Actions row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                            <MdVerified size={20} className="text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5">
                            {raw.course || "BCA"}
                            <span className="text-gray-400 font-normal mx-1.5">•</span>
                            {level?.name || "Level 1"}
                            <span className="text-gray-400 font-normal mx-1.5">•</span>
                            {subdepartment?.name || "Sub Level 1"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-green-500 text-green-600 hover:bg-green-50 rounded-lg transition">
                            <MdArrowUpward size={13} /> Promote
                        </button>
                        <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <MdArrowUpward size={13} /> FTP Shift
                        </button>
                        <button
                            onClick={goToTaskBoard}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold border border-purple-400 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                            <MdTableChart size={13} /> Assign Task
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setMoreOpen(p => !p)}
                                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            >
                                More <MdMoreVert size={13} />
                            </button>
                            {moreOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                                    <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-1">
                                        {["Shift to Ready Student", "View Report Card", "Edit Profile", "Mark Dropped"].map(item => (
                                            <button key={item} onClick={() => setMoreOpen(false)}
                                                className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details: LEFT | CENTER | RIGHT */}
                <div className="flex items-start gap-5">

                    {/* LEFT: PR Key, Email, Mobile */}
                    <div className="space-y-2 min-w-[155px]">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBadge size={10} /> PR Key</p>
                            <p className="text-xs font-bold text-gray-800">{raw.prkey || "SS2025001"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdEmail size={10} /> Email</p>
                            <p className="text-xs font-bold text-gray-800">{raw.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdPhone size={10} /> Mobile</p>
                            <p className="text-xs font-bold text-gray-800">{raw.studentMobile || "—"}</p>
                        </div>
                    </div>

                    <div className="w-px self-stretch bg-gray-100" />

                    {/* CENTER: Dept, SubDept, Session, Syllabus */}
                    <div className="space-y-2 min-w-[195px]">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBusiness size={10} /> Department</p>
                            <p className="text-xs font-bold text-gray-800">Information Technology Excellence Group</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdAccountTree size={10} /> Sub Department</p>
                            <p className="text-xs font-bold text-gray-800">{subdepartment?.name || "ITEG"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdCalendarToday size={10} /> Session</p>
                            <p className="text-xs font-bold text-gray-800">2025-26 <span className="text-green-500">(Active)</span></p>
                        </div>
                    </div>

                    <div className="w-px self-stretch bg-gray-100" />

                    {/* RIGHT: 4 Status Mini Cards */}
                    <div className="flex items-stretch gap-3 flex-1">

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Placement Ready</p>
                            <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                                <MdCheckCircle size={15} /> Yes
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Dummy Status</p>
                            <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                                <MdAccessTime size={15} /> Pending
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Attendance (This Month)</p>
                            <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                <MdSchool size={15} /> 87%
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Overall Progress</p>
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="3.5"
                                        strokeDasharray={`${taskPct * 0.879} 87.9`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{taskPct}%</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const StudentProfilePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { student, level, subdepartment } = location.state || {};

    const [moreOpen, setMoreOpen] = useState(false);

    const { data: taskData } = useGetNewStudentTasksQuery(
        { id: student?._id },
        { skip: !student?._id }
    );

    if (!student) {
        return (
            <div className="p-10 text-center text-gray-400">
                <p className="text-lg font-semibold">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Go Back</button>
            </div>
        );
    }

    const raw      = student.raw || student;
    const name     = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const totalTasks      = taskData?.totalTasks      || 0;
    const completedTasks  = taskData?.completedTasks  || 0;
    const pendingTasks    = taskData?.pendingTasks    || 0;
    const taskPct         = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const subjectGroups = taskData?.groupedBySubject || {};
    const subjects = Object.entries(subjectGroups).map(([sName, group]) => {
        const tasks = group.tasks || [];
        const done  = tasks.filter(t => t.status === "completed").length;
        return { name: sName, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    });

    const goToTaskBoard = () => navigate("/student/task-board", { state: { student: raw, level, subdepartment } });

    return (
        <>
            <Header
                showBack
                breadcrumbs={[
                    { label: "Departments", path: "/department-management" },
                    { label: subdepartment?.name || "Sub-Dept", path: -1 },
                    { label: level?.name || "Level", path: -1 },
                    { label: name },
                ]}
            />

            <div className="px-6 py-5 space-y-5 bg-[#F8F7F5] min-h-screen">

                {/* PHASE 1: Hero */}
                <HeroSection
                    raw={raw} name={name} initials={initials}
                    level={level} subdepartment={subdepartment}
                    taskPct={taskPct} goToTaskBoard={goToTaskBoard}
                    moreOpen={moreOpen} setMoreOpen={setMoreOpen}
                />

                {/* Sections will be added here one by one */}

                {/* ── ROW 1: 6 STAT CARDS ─────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                    {/* 1. Current Level Progress */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Current Level Progress</p>
                        <div className="flex items-center gap-3">
                            <div className="relative w-14 h-14 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="3"
                                        strokeDasharray={`${taskPct * 0.879} 87.9`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{taskPct}%</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">{level?.name || "Level 3"} - Sub Level 1</p>
                                <p className="text-[11px] text-green-500 font-semibold mt-0.5">Good Progress</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Subjects Progress */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Subjects Progress</p>
                        <div className="flex items-end justify-between mb-2">
                            <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
                            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Good</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-1.5">Total Subjects</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${taskPct}%` }} />
                        </div>
                    </div>

                    {/* 4. Average Marks */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Average Marks</p>
                        <div className="flex items-center gap-2 mb-1">
                            <MdSchool size={20} className="text-blue-400" />
                            <p className="text-xl font-bold text-gray-800">4.2 <span className="text-sm text-gray-400">/ 5</span></p>
                            <MdStar size={16} className="text-yellow-400" />
                        </div>
                        <p className="text-[10px] text-gray-400">Current Average</p>
                    </div>

                    {/* 5. Placement Status */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Placement Status</p>
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <MdWork size={16} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-600">Interview Round 1</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">TechNova Solutions</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── SECTION 3: Task Progress | Level History | Academic Timeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Col 1: Donut + Subject Bars */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Current Level Task Progress</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{level?.name || "Level 3"} - Sub Level 1</p>
                            </div>
                            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                                <option>All Subjects</option>
                                {subjects.map(s => <option key={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Donut */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14"
                                        strokeDasharray={`${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0} 301.6`} strokeLinecap="butt" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="14"
                                        strokeDasharray={`${totalTasks > 0 ? (pendingTasks/totalTasks)*301.6 : 0} 301.6`}
                                        strokeDashoffset={`-${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0}`} strokeLinecap="butt" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#ef4444" strokeWidth="14"
                                        strokeDasharray={`12 301.6`}
                                        strokeDashoffset={`-${totalTasks > 0 ? ((completedTasks+pendingTasks)/totalTasks)*301.6 : 289}`} strokeLinecap="butt" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-[10px] text-gray-400">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalTasks || 120}</p>
                                </div>
                            </div>

                            {/* Subject bars */}
                            <div className="flex-1 space-y-2.5">
                                <p className="text-xs font-bold text-gray-700">Subject Wise Progress</p>
                                {(subjects.length > 0 ? subjects : [
                                    { name: "Data Structures", pct: 85 },
                                    { name: "Web Development", pct: 72 },
                                    { name: "Database Mgmt",   pct: 65 },
                                    { name: "Soft. Engineering",pct: 60 },
                                    { name: "AI",              pct: 50 },
                                ]).slice(0, 5).map(s => (
                                    <div key={s.name}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[11px] text-gray-600 truncate max-w-[110px]">{s.name}</span>
                                            <span className="text-[11px] font-semibold text-gray-700">{s.pct}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[11px] text-gray-600">Completed ({completedTasks || 82})</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[11px] text-gray-600">Pending ({pendingTasks || 28})</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[11px] text-gray-600">Overdue (0)</span></div>
                        </div>

                        <button onClick={goToTaskBoard} className="mt-3 w-full py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
                            View Task Board →
                        </button>
                    </div>

                    {/* Col 2: Level History */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Level History</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full History →</button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                            <div className="space-y-5">
                                {[
                                    { label: `${level?.name || "Level 3"} – Sub Level 1`, sub: "(Current)", date: "Promoted on 10 May 2025", status: "current" },
                                    { label: "Level 2 – Sub Level 2", date: "Promoted on 15 Dec 2024", status: "completed" },
                                    { label: "Level 2 – Sub Level 1", date: "Promoted on 20 Aug 2024", status: "completed" },
                                    { label: "Level 1 – Sub Level 2", date: "Promoted on 10 Apr 2024", status: "completed" },
                                    { label: "Level 1 – Sub Level 1", date: "Started on 01 Jan 2024",  status: "completed" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 pl-1">
                                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5
                                            ${item.status === "current" ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`} />
                                        <div className="flex-1 flex items-start justify-between">
                                            <div>
                                                <p className={`text-xs font-bold ${item.status === "current" ? "text-blue-600" : "text-gray-700"}`}>
                                                    {item.label} {item.sub && <span className="text-blue-400 font-normal text-[11px]">{item.sub}</span>}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{item.date}</p>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2
                                                ${item.status === "current" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                {item.status === "current" ? "Current" : "Completed"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Academic Timeline */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Academic Timeline</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Activity →</button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                            <div className="space-y-4">
                                {[
                                    { icon: "task",       color: "bg-indigo-50 text-indigo-500",  title: "Task Submitted",                    sub: "Web Development - Assignment 4",  time: "10 May 2025, 11:30 AM" },
                                    { icon: "promote",    color: "bg-indigo-50 text-indigo-500",  title: "Promoted to Level 3 – Sub Level 1", sub: "",                               time: "10 May 2025, 09:15 AM" },
                                    { icon: "interview",  color: "bg-indigo-50 text-indigo-500",  title: "Interview Scheduled",               sub: "TechNova Solutions - Round 1",    time: "08 May 2025, 04:00 PM" },
                                    { icon: "permission", color: "bg-orange-50 text-orange-500",  title: "Permission Requested",              sub: "Leave Application",              time: "05 May 2025, 10:20 AM" },
                                    { icon: "document",   color: "bg-orange-50 text-orange-500",  title: "Certificate Uploaded",              sub: "Data Structures Certificate",    time: "03 May 2025, 02:10 PM" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 relative z-10">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                            {item.icon === "task"       && <MdTableChart size={15} />}
                                            {item.icon === "promote"    && <MdArrowUpward size={15} />}
                                            {item.icon === "interview"  && <MdWork size={15} />}
                                            {item.icon === "permission" && <MdAccessTime size={15} />}
                                            {item.icon === "document"   && <MdSchool size={15} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800">{item.title}</p>
                                            {item.sub && <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>}
                                            <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── SECTION 5: Documents | Extra Docs | Permissions | Placement Overview ── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 pb-6">

                    {/* Documents */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Documents</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "Aadhar Card",         size: "PDF • 1.2 MB", date: "20 Jan 2025" },
                                { name: "10th Marksheet",      size: "PDF • 1.5 MB", date: "20 Jan 2025" },
                                { name: "12th Marksheet",      size: "PDF • 1.3 MB", date: "20 Jan 2025" },
                                { name: "BCA Admission Letter",size: "PDF • 1.1 MB", date: "20 Jan 2025" },
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                        <MdSchool size={15} className="text-red-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
                                        <p className="text-[10px] text-gray-400">{doc.size}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{doc.date}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                            <MdArrowUpward size={13} /> Upload Document
                        </button>
                    </div>

                    {/* Extra Documents */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Extra Documents</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "Resume",           size: "PDF • 2.4 MB", date: "15 Feb 2025" },
                                { name: "Python Certificate",size: "PDF • 1.8 MB", date: "10 Feb 2025" },
                                { name: "NCC Certificate",  size: "PDF • 1.2 MB", date: "05 Feb 2025" },
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <MdSchool size={15} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
                                        <p className="text-[10px] text-gray-400">{doc.size}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{doc.date}</span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                            <MdArrowUpward size={13} /> Upload Extra Document
                        </button>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Permissions</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                        </div>
                        <div className="space-y-3">
                            {/* Active permission */}
                            <div className="border border-orange-100 rounded-xl p-3 bg-orange-50/40">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-800">Leave Application</p>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Pending</span>
                                </div>
                                <p className="text-[10px] text-gray-500">From: <span className="font-semibold">20 May 2025</span> &nbsp; To: <span className="font-semibold">25 May 2025</span></p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Reason: Personal Work</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Applied On: 18 May 2025</p>
                            </div>
                            {/* Past permissions */}
                            {[
                                { label: "Medical Leave",   status: "Approved", date: "05 Apr 2025" },
                                { label: "Event Permission",status: "Approved", date: "12 Mar 2025" },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <p className="text-xs text-gray-700">{p.label}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-semibold text-green-600">{p.status}</span>
                                        <span className="text-[10px] text-gray-400">{p.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            Apply for Permission
                        </button>
                    </div>

                    {/* Placement Overview */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Placement Overview</h3>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "Current Status", value: "Interview Round 1", highlight: true },
                                { label: "Company",        value: "TechNova Solutions" },
                                { label: "Job Role",       value: "Software Developer" },
                                { label: "Interview Date", value: "20 May 2025" },
                                { label: "Rounds Completed", value: "0 / 3" },
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <p className="text-[11px] text-gray-500">{row.label}</p>
                                    {row.highlight ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{row.value}</span>
                                    ) : (
                                        <p className="text-xs font-semibold text-gray-800">{row.value}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition">
                            View Placement Details →
                        </button>
                    </div>

                </div>

            </div>
        </>
    );
};

export default StudentProfilePage;
