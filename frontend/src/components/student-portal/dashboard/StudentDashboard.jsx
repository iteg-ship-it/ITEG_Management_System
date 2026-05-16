import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MdEmail, MdPhone, MdCheckCircle, MdAccessTime,
    MdTableChart, MdSchool, MdWork, MdStar,
    MdClose, MdBadge, MdBusiness, MdCalendarToday,
    MdAccountTree, MdVerified, MdArrowUpward
} from "react-icons/md";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import {
    useGetMyStudentProfileQuery,
    useGetMyStudentTasksQuery,
    useGetMyStudentLevelHistoryQuery,
    useGetMyStudentSnapshotsQuery,
    useGetMyStudentEventLogQuery,
} from "../../../redux/api/studentApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const activityStyle = (type) => {
    switch (type) {
        case "task":       return { color: "bg-indigo-50 text-indigo-500", icon: "task" };
        case "promotion":  return { color: "bg-green-50 text-green-600",   icon: "promote" };
        case "document":   return { color: "bg-blue-50 text-blue-600",     icon: "document" };
        case "email":      return { color: "bg-sky-50 text-sky-600",       icon: "email" };
        default:           return { color: "bg-gray-50 text-gray-500",     icon: "note" };
    }
};

const statusColor = (s = "") => {
    const n = s.toLowerCase();
    if (["ready for interview", "ready", "completed", "approved"].includes(n)) return "text-green-600";
    if (["in progress", "pending", "scheduled"].includes(n)) return "text-orange-500";
    if (["not ready", "rejected"].includes(n)) return "text-gray-400";
    return "text-blue-600";
};

// ── Hero Card ─────────────────────────────────────────────────────────────────
const HeroCard = ({ raw, name, initials, readinessStatus, overallPct }) => (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
                {raw.image ? (
                    <img src={raw.image} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">{initials}</div>
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                    <MdVerified size={18} className="text-blue-500" />
                    {raw.isFTP && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">FTP</span>}
                </div>
                <p className="text-sm font-semibold text-blue-600 mb-4">
                    {raw.course || "—"}
                    <span className="text-gray-400 font-normal mx-1.5">•</span>
                    {raw.currentLevelId?.name || "—"}
                    <span className="text-gray-400 font-normal mx-1.5">•</span>
                    {raw.currentSubLevelId?.name || "—"}
                </p>

                <div className="flex items-start gap-5">
                    {/* LEFT */}
                    <div className="space-y-2 min-w-[150px]">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBadge size={10} /> PR Key</p>
                            <p className="text-xs font-bold text-gray-800">{raw.prkey || "—"}</p>
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

                    {/* CENTER */}
                    <div className="space-y-2 min-w-[180px]">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBusiness size={10} /> Department</p>
                            <p className="text-xs font-bold text-gray-800">{raw.subDepartmentId?.name || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdAccountTree size={10} /> Sub Department</p>
                            <p className="text-xs font-bold text-gray-800">{raw.subDepartmentId?.name || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdCalendarToday size={10} /> Session</p>
                            <p className="text-xs font-bold text-gray-800">{raw.sessionId?.name || "—"} <span className="text-green-500">(Active)</span></p>
                        </div>
                    </div>

                    <div className="w-px self-stretch bg-gray-100" />

                    {/* RIGHT: Status Cards */}
                    <div className="flex items-stretch gap-3 flex-1">
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Placement Ready</p>
                            <div className={`flex items-center gap-1 font-bold text-xs ${statusColor(readinessStatus)}`}>
                                <MdCheckCircle size={13} /> {readinessStatus}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Attendance</p>
                            <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                <MdSchool size={15} /> —
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-xl">
                            <p className="text-[10px] text-gray-400 mb-1.5">Overall Progress</p>
                            <div className="relative w-12 h-12">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" strokeWidth="3.5"
                                        strokeDasharray={`${overallPct * 0.879} 87.9`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{overallPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const navigate = useNavigate();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [activityOpen, setActivityOpen] = useState(false);

    const { data: profileData, isLoading: profileLoading } = useGetMyStudentProfileQuery();
    const { data: taskData }    = useGetMyStudentTasksQuery();
    const { data: historyData } = useGetMyStudentLevelHistoryQuery();
    const { data: snapshotData }= useGetMyStudentSnapshotsQuery();
    const { data: eventData }   = useGetMyStudentEventLogQuery();

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const raw      = profileData?.data || {};
    const name     = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const readinessStatus = raw.placement?.readinessStatus || "Not Ready";

    const totalTasks     = taskData?.totalTasks     || 0;
    const completedTasks = taskData?.completedTasks || 0;
    const pendingTasks   = taskData?.pendingTasks   || 0;
    const taskPct        = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overallPct     = raw.overallProgress?.percentage ?? taskPct;

    const subjectGroups = taskData?.groupedBySubject || {};
    const subjects = Object.entries(subjectGroups).map(([sName, group]) => {
        const tasks = group.tasks || [];
        const done  = tasks.filter(t => t.status === "completed").length;
        return { name: sName, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    });

    // Average marks
    const allTasks = Object.values(subjectGroups).flatMap(g => g.tasks || []);
    const evaluated = allTasks.filter(t => typeof t.marks === "number");
    const avgMarks = evaluated.length > 0
        ? (evaluated.reduce((s, t) => s + t.marks, 0) / evaluated.length).toFixed(1)
        : null;

    // Level history
    const levelHistory = historyData?.data || [];

    // Activity
    const activityItems = (eventData?.data || []).map(item => ({
        ...item,
        ...activityStyle(item.type),
        time: item.createdAt,
    }));

    return (
        <div className="space-y-5">

            {/* Hero */}
            <HeroCard raw={raw} name={name} initials={initials} readinessStatus={readinessStatus} overallPct={overallPct} />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                            <p className="text-xs font-bold text-gray-800">{raw.currentLevelId?.name || "—"} - {raw.currentSubLevelId?.name || "—"}</p>
                            <p className="text-[11px] text-green-500 font-semibold mt-0.5">
                                {taskPct >= 80 ? "Excellent" : taskPct >= 50 ? "Good Progress" : "Keep Going"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Subjects Progress</p>
                    <p className="text-2xl font-bold text-gray-800 mb-1">{subjects.length}</p>
                    <p className="text-[10px] text-gray-400 mb-1.5">Total Subjects</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${taskPct}%` }} />
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Average Marks</p>
                    <div className="flex items-center gap-2 mb-1">
                        <MdSchool size={20} className="text-blue-400" />
                        <p className="text-xl font-bold text-gray-800">
                            {avgMarks ?? "—"} <span className="text-sm text-gray-400">/ 5</span>
                        </p>
                        {avgMarks && <MdStar size={16} className="text-yellow-400" />}
                    </div>
                    <p className="text-[10px] text-gray-400">Current Average</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Placement Status</p>
                    <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <MdWork size={16} className="text-purple-500" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold ${statusColor(readinessStatus)}`}>{readinessStatus}</p>
                            {raw.placement?.placedInfo?.companyName && (
                                <p className="text-[10px] text-gray-500 mt-0.5">{raw.placement.placedInfo.companyName}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-col section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Task Progress + Subject Bars */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Current Level Task Progress</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{raw.currentLevelId?.name || "—"} - {raw.currentSubLevelId?.name || "—"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14"
                                    strokeDasharray={`${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0} 301.6`} strokeLinecap="butt" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="14"
                                    strokeDasharray={`${totalTasks > 0 ? (pendingTasks/totalTasks)*301.6 : 0} 301.6`}
                                    strokeDashoffset={`-${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0}`} strokeLinecap="butt" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-[10px] text-gray-400">Total Tasks</p>
                                <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2.5">
                            <p className="text-xs font-bold text-gray-700">Subject Wise Progress</p>
                            {subjects.length > 0 ? subjects.slice(0, 5).map(s => (
                                <div key={s.name}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[11px] text-gray-600 truncate max-w-[110px]">{s.name}</span>
                                        <span className="text-[11px] font-semibold text-gray-700">{s.pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.pct}%` }} />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400">No subjects found</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-3 mt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[11px] text-gray-600">Completed ({completedTasks})</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[11px] text-gray-600">Pending ({pendingTasks})</span></div>
                    </div>

                    <button onClick={() => navigate("/student-portal/tasks")}
                        className="mt-3 w-full py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
                        View My Tasks →
                    </button>
                </div>

                {/* Level History */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">Level History</h3>
                        <button onClick={() => navigate("/student-portal/progress")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full →</button>
                    </div>
                    <div className="relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                        <div className="space-y-5">
                            {levelHistory.length > 0 ? levelHistory.slice(0, 5).map((item, i) => {
                                const isCurrent = item.status === "in_progress";
                                return (
                                    <div key={item._id || i} className="flex items-start gap-4 pl-1">
                                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5
                                            ${isCurrent ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`} />
                                        <div className="flex-1 flex items-start justify-between">
                                            <div>
                                                <p className={`text-xs font-bold ${isCurrent ? "text-blue-600" : "text-gray-700"}`}>
                                                    {item.levelId?.name || "Level"} – {item.subLevelId?.name || "Sub Level"}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {isCurrent ? "Current" : `Completed ${formatDate(item.completedAt)}`}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2
                                                ${isCurrent ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                {isCurrent ? "Current" : "Completed"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-xs text-gray-400 pl-5">No level history yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-800">My Activity</h3>
                        <button onClick={() => setActivityOpen(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All →</button>
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                            {activityItems.length > 0 ? activityItems.slice(0, 5).map((item, i) => (
                                <div key={item._id || i} className="flex items-start gap-3 relative z-10">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        {item.icon === "task"      && <MdTableChart size={15} />}
                                        {item.icon === "promote"   && <MdArrowUpward size={15} />}
                                        {item.icon === "document"  && <MdSchool size={15} />}
                                        {item.icon === "email"     && <MdEmail size={15} />}
                                        {item.icon === "note"      && <MdAccessTime size={15} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800">{item.title}</p>
                                        {item.description && <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>}
                                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(item.time)}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-gray-400 pl-10">No activity yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Modal */}
            {activityOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-800">All Activity</h3>
                            <button onClick={() => setActivityOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                            {activityItems.map((item, i) => (
                                <div key={item._id || i} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                        {item.icon === "task"     && <MdTableChart size={15} />}
                                        {item.icon === "promote"  && <MdArrowUpward size={15} />}
                                        {item.icon === "document" && <MdSchool size={15} />}
                                        {item.icon === "email"    && <MdEmail size={15} />}
                                        {item.icon === "note"     && <MdAccessTime size={15} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{item.title}</p>
                                        {item.description && <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>}
                                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(item.time)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
