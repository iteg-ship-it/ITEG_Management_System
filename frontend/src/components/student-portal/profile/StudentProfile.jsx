import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    MdEmail, MdPhone, MdCheckCircle, MdAccessTime,
    MdTableChart, MdSchool, MdWork,
    MdStar, MdMoreVert, MdClose, MdEdit,
    MdArrowUpward, MdBadge, MdBusiness, MdCalendarToday,
    MdAccountTree, MdVerified, MdWarning
} from "react-icons/md";
import { toast } from "react-toastify";
import {
    useGetMyStudentProfileQuery,
    useGetMyStudentTasksQuery,
    useGetMyStudentSnapshotsQuery,
    useGetMyStudentEventLogQuery,
    useUpdateMyStudentProfileImageMutation,
    useUploadMyExtraDocumentMutation,
} from "../../../redux/api/studentApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.$oid || "";
};

const formatShortDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getPerformanceLabel = (marks) => {
    const m = Number(marks);
    if (isNaN(m) || m === 0) return "Not Evaluated";
    if (m >= 4.5) return "Excellent";
    if (m >= 3.5) return "Good";
    if (m >= 2.5) return "Average";
    return "Needs Improvement";
};

const getPerformanceColor = (marks) => {
    const m = Number(marks);
    if (isNaN(m) || m === 0) return "text-gray-400";
    if (m >= 4.5) return "text-green-600";
    if (m >= 3.5) return "text-blue-600";
    if (m >= 2.5) return "text-orange-600";
    return "text-red-600";
};

const statusBadgeClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (["approved", "completed", "selected", "joined", "placed", "ready"].includes(normalized)) return "bg-green-50 text-green-600";
    if (["pending", "scheduled", "ongoing", "in progress", "ready for interview"].includes(normalized)) return "bg-blue-50 text-blue-600";
    if (["rejected", "overdue", "not ready"].includes(normalized)) return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
};

const taskStatusClass = (status) => {
    switch (status) {
        case "completed":  return "bg-green-50 text-green-600 border-green-100";
        case "inProgress": return "bg-blue-50 text-blue-600 border-blue-100";
        case "pending":    return "bg-orange-50 text-orange-600 border-orange-100";
        default:           return "bg-gray-50 text-gray-600 border-gray-100";
    }
};

const activityStyle = (type) => {
    switch (type) {
        case "task":       return { color: "bg-indigo-50 text-indigo-500", icon: "task" };
        case "promotion":  return { color: "bg-green-50 text-green-600", icon: "promote" };
        case "document":   return { color: "bg-blue-50 text-blue-600", icon: "document" };
        case "email":      return { color: "bg-sky-50 text-sky-600", icon: "email" };
        default:           return { color: "bg-gray-50 text-gray-500", icon: "note" };
    }
};

const openFile = (url) => {
    if (!url) { toast.info("No file available."); return; }
    window.open(url, "_blank", "noopener,noreferrer");
};

// ── Shared Sub-Components ──────────────────────────────────────────────────────

const HeroMetricCard = ({ title, children }) => (
    <div className="flex-1 min-h-[92px] flex flex-col items-center justify-center text-center p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
        <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{title}</p>
        {children}
    </div>
);

const LevelJourneyBar = ({ items = [] }) => {
    const rawCurrentIndex = items.findIndex(item => item.status === "current");
    const progressIndex = rawCurrentIndex === -1 ? items.filter(item => item.status === "completed").length - 1 : rawCurrentIndex;
    return (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-900">Level Progress <span className="font-medium text-gray-500">(Overall Journey)</span></h2>
                <div className="hidden sm:flex items-center gap-5 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Completed</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500" />Current</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />Upcoming</span>
                </div>
            </div>
            <div className="relative overflow-x-auto pb-1">
                <div className="absolute left-0 right-0 top-[42px] h-px bg-gray-100" />
                <div className="absolute left-0 top-[42px] h-px bg-green-500 transition-all duration-1000" style={{ width: `${items.length > 1 ? Math.max(0, (progressIndex / (items.length - 1)) * 100) : 0}%` }} />
                <div className="relative grid gap-4 min-w-[720px]" style={{ gridTemplateColumns: `repeat(${items.length || 1}, minmax(76px, 1fr))` }}>
                    {items.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 mb-2 relative z-10 transition-all ${
                                item.status === "completed" ? "bg-green-500 border-green-500 text-white" :
                                item.status === "current" ? "bg-blue-50 border-blue-500 text-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.10)]" :
                                "bg-white border-gray-300 text-gray-400"
                            }`}>{item.status === "completed" ? <MdCheckCircle size={12} /> : ""}</div>
                            <p className={`text-xs font-bold ${item.status === "current" ? "text-blue-600" : item.status === "completed" ? "text-gray-900" : "text-gray-500"}`}>{item.code}</p>
                            <p className="mt-1 text-[10px] text-gray-500 line-clamp-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ModuleCard = ({ title, icon, summary, meta, action, accent = "blue", onClick }) => {
    const accents = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    };
    return (
        <button onClick={onClick} className="group bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${accents[accent]}`}>{icon}</div>
                <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition">{action}</span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-500 line-clamp-1">{summary}</p>
            <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{meta}</p>
        </button>
    );
};

const ActivityRow = ({ item }) => (
    <div className="flex items-start gap-3 relative z-10">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
            {item.icon === "task" && <MdTableChart size={15} />}
            {item.icon === "promote" && <MdArrowUpward size={15} />}
            {item.icon === "email" && <MdEmail size={15} />}
            {item.icon === "document" && <MdSchool size={15} />}
            {item.icon === "note" && <MdAccessTime size={15} />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800">{item.title}</p>
            {item.sub && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{item.sub}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{formatDateTime(item.time)}</p>
        </div>
    </div>
);

const SectionModal = ({ isOpen, onClose, title, subtitle, countLabel, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"><MdClose size={20} /></button>
                </div>
                {countLabel && (
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
                        <p className="text-xs font-semibold text-gray-500">Summary-first view</p>
                        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">{countLabel}</span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
                {footer && <div className="border-t border-gray-100 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
};

const SnapshotStats = ({ title, snapshot }) => {
    if (!snapshot) return null;
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{title}</p>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getPerformanceColor(snapshot.averageMarks)}`}>
                        {getPerformanceLabel(snapshot.averageMarks)}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[
                    { l: "Total", v: snapshot.totalTasks },
                    { l: "Done", v: snapshot.completedTasks, c: "text-green-600" },
                    { l: "Wait", v: snapshot.pendingTasks, c: "text-orange-600" },
                    { l: "Performance", v: getPerformanceLabel(snapshot.averageMarks), c: getPerformanceColor(snapshot.averageMarks), isLabel: true }
                ].map((s, i) => (
                    <div key={i} className="rounded-lg bg-white border border-gray-100 p-2 text-center">
                        <p className="text-[8px] font-bold text-gray-400 uppercase">{s.l}</p>
                        <p className={`text-[10px] font-black uppercase truncate ${s.c || "text-gray-800"}`}>{s.v ?? 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main Dashboard / Profile ─────────────────────────────────────────────────

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);
    const [historyModal, setHistoryModal] = useState(false);
    const [activityModal, setActivityModal] = useState(false);
    const [sectionModal, setSectionModal] = useState(null);
    const fileRef = useRef(null);

    const { data: profileRes, isLoading: profileLoading, refetch } = useGetMyStudentProfileQuery();
    const { data: taskRes } = useGetMyStudentTasksQuery();
    const { data: snapshotRes } = useGetMyStudentSnapshotsQuery("limit=100");
    const { data: activityRes } = useGetMyStudentEventLogQuery("limit=100");
    const [updateImage, { isLoading: uploading }] = useUpdateMyStudentProfileImageMutation();
    const [uploadExtraDoc, { isLoading: uploadingDoc }] = useUploadMyExtraDocumentMutation();

    if (profileLoading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const raw = profileRes?.data || {};
    const name = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const taskData = taskRes || {};
    const totalTasks = taskData.totalTasks || 0;
    const completedTasks = taskData.completedTasks || 0;
    const pendingTasks = taskData.pendingTasks || 0;
    const overdueTasks = taskData.overdueTasks || taskData.overDueTasks || 0;
    const taskRating = taskData.averageMarks || "N/A";
    const readinessStatus = raw.placement?.readinessStatus || "Not Ready";
    const currentSubLevelName = raw.currentSubLevelId?.name || "Current Level";

    const subjects = Object.entries(taskData.groupedBySubject || {}).map(([sName, group]) => {
        const tasks = group.tasks || [];
        const done = tasks.filter(t => t.status === "completed").length;
        return { name: sName, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0, tasks };
    });

    const snapshots = (snapshotRes?.data || []).filter(s => s.snapshotScope === "overall");
    const activityItems = (activityRes?.data || []).map(item => ({
        ...item,
        ...activityStyle(item.type),
        sub: item.description,
        time: item.createdAt
    }));

    const journeyItems = [
        { code: "1-1A", label: "Foundation", status: "completed" },
        { code: "1-1B", label: "Basics", status: "completed" },
        { code: "2-2A", label: "Intermediate", status: "current" },
        { code: "2-2B", label: "Advanced", status: "upcoming" },
        { code: "3-3A", label: "Professional", status: "upcoming" },
        { code: "3-3B", label: "Specialist", status: "upcoming" },
    ].map(item => {
        if (raw.currentSubLevelId?.name?.includes(item.code)) return { ...item, status: "current" };
        return item;
    });

    const levelHistoryItems = [
        ...snapshots.map(s => ({
            id: s._id,
            label: `${s.levelName} - ${s.subLevelName}`,
            date: s.createdAt,
            status: "completed",
            meta: `${s.completedTasks}/${s.totalTasks} tasks completed`,
            snapshot: s
        })),
        {
            id: "current",
            label: `${raw.currentLevelId?.name || "Level"} - ${currentSubLevelName}`,
            date: raw.updatedAt,
            status: "current",
            meta: `${completedTasks}/${totalTasks} tasks completed`
        }
    ].sort((a, b) => (a.status === "current" ? -1 : 1));

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try { await updateImage({ image: ev.target.result }).unwrap(); toast.success("Updated!"); refetch(); } 
            catch (err) { toast.error("Failed"); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="px-6 py-5 space-y-5 bg-[#F8F7F5] min-h-screen font-sans text-gray-800">
            
            {/* Hero Section */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
                <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                    <div className="relative flex-shrink-0 self-center xl:self-start">
                        {raw.image ? (
                            <img src={raw.image} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md">{initials}</div>
                        )}
                        <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow hover:scale-110 transition"><MdEdit size={16} /></button>
                        <input ref={fileRef} type="file" onChange={handleImageChange} className="hidden" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                            <div className="text-center lg:text-left">
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
                                    <MdVerified size={20} className="text-blue-500" />
                                    {raw.isFTP && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">FTP</span>}
                                </div>
                                <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">{raw.course || "BCA"} / {raw.currentLevelId?.name || "Level"} / {raw.subDepartmentId?.name || "ITEG"}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2 relative">
                                <button onClick={() => navigate(`/student/${raw._id}/report`)} className="px-5 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-sm uppercase tracking-widest">View Report</button>
                                <button onClick={() => setMoreOpen(!moreOpen)} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition"><MdMoreVert size={18} /></button>
                                {moreOpen && (
                                    <div className="absolute right-0 top-11 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                        <button onClick={() => { navigate("/student-portal/profile"); setMoreOpen(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 font-bold uppercase tracking-wider">Edit Profile</button>
                                        <button onClick={() => { setMoreOpen(false); }} className="w-full px-4 py-2 text-xs text-left hover:bg-gray-50 font-bold text-red-600 uppercase tracking-wider">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-[240px_260px_1fr] gap-6">
                            <div className="space-y-4">
                                {[{i:<MdBadge/>,l:"PR Key",v:raw.prkey},{i:<MdEmail/>,l:"Email",v:raw.email},{i:<MdPhone/>,l:"Mobile",v:raw.studentMobile}].map((d,i)=>(
                                    <div key={i}><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">{d.i} {d.l}</p><p className="text-xs font-bold truncate">{d.v || "—"}</p></div>
                                ))}
                            </div>
                            <div className="space-y-4 lg:border-l lg:border-gray-100 lg:pl-6">
                                {[{i:<MdBusiness/>,l:"Department",v:raw.subDepartmentId?.departmentId?.name},{i:<MdAccountTree/>,l:"Sub Dept",v:raw.subDepartmentId?.name},{i:<MdCalendarToday/>,l:"Session",v:raw.sessionId?.name}].map((d,i)=>(
                                    <div key={i}><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">{d.i} {d.l}</p><p className="text-xs font-bold">{d.v || "—"} {d.l==="Session" && <span className="text-green-500 font-normal ml-1">(Active)</span>}</p></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:border-l lg:border-gray-100 lg:pl-6">
                                <HeroMetricCard title="Placement Ready"><div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-widest text-blue-600"><MdCheckCircle size={15}/> {readinessStatus}</div></HeroMetricCard>
                                <HeroMetricCard title="Attendance"><div className="flex items-center gap-1.5 text-blue-600 font-black text-xs uppercase tracking-widest"><MdSchool size={15}/> N/A</div></HeroMetricCard>
                                <HeroMetricCard title="Task Rating">
                                    <p className="text-2xl font-black">{taskRating} <span className="text-base text-gray-400 font-normal">/ 5</span></p>
                                    <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-400">{[1,2,3,4,5].map(i=><MdStar key={i} size={16} className={i<=Math.round(Number(taskRating))?"":"text-gray-100"}/>)}</div>
                                </HeroMetricCard>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Journey Roadmap */}
            <LevelJourneyBar items={journeyItems} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr_0.9fr] gap-5">
                
                {/* Column 1: Task Progress */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="mb-4"><h3 className="text-sm font-bold text-gray-900">Current Level Task Progress</h3><div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"/> {currentSubLevelName}</div></div>
                    <div className="flex items-center gap-6">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14" strokeDasharray={`${totalTasks>0?(completedTasks/totalTasks)*301.6:0} 301.6`} strokeLinecap="round" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="14" strokeDasharray={`${totalTasks>0?(pendingTasks/totalTasks)*301.6:0} 301.6`} strokeDashoffset={`-${totalTasks>0?(completedTasks/totalTasks)*301.6:0}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Tasks</p><p className="text-2xl font-black">{totalTasks}</p></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Subject Wise Progress</p>
                            <div className="space-y-3.5 max-h-32 overflow-y-auto pr-1">
                                {subjects.map(s=><div key={s.name}><div className="flex justify-between mb-1"><span className="text-[10px] font-bold text-gray-600 truncate">{s.name}</span><span className="text-[10px] font-bold text-gray-900">{s.pct}%</span></div><div className="w-full bg-gray-50 rounded-full h-1.5"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width:`${s.pct}%`}}/></div></div>)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 pt-4 mt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Done ({completedTasks})</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wait ({pendingTasks})</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Late ({overdueTasks})</span></div>
                    </div>
                    <button onClick={()=>navigate("/student-portal/tasks")} className="mt-4 w-full py-2.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition">View Task Board</button>
                </div>

                {/* Column 2: Level History */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5"><h3 className="text-sm font-bold text-gray-900">Level History</h3><button onClick={()=>setHistoryModal(true)} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline transition">View Full</button></div>
                    <div className="relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
                        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-1">
                            {levelHistoryItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 pl-1">
                                    <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 mt-0.5 transition-all ${item.status==="current"?"bg-blue-500 border-blue-500 shadow-md":"bg-white border-gray-300"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-xs font-bold truncate ${item.status==="current"?"text-blue-600":"text-gray-800"}`}>{item.label} {item.status==="current" && <span className="font-normal text-blue-400 text-[10px] ml-1">(Current)</span>}</p>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${item.status==="current"?"bg-blue-50 text-blue-600":"bg-green-50 text-green-600"}`}>{item.status==="current"?"Live":"Done"}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 font-bold italic tracking-wide">{item.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Activity */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5"><h3 className="text-sm font-bold text-gray-900">Recent Activity</h3><button onClick={()=>setActivityModal(true)} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline transition">View All</button></div>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-50" />
                        <div className="space-y-5 max-h-[300px] overflow-y-auto pr-1">
                            {activityItems.length > 0 ? activityItems.slice(0, 10).map((item, idx) => <ActivityRow key={idx} item={item} />) : <div className="py-10 text-center text-[11px] font-bold text-gray-300 uppercase tracking-widest italic">No activity yet</div>}
                        </div>
                    </div>
                </div>

            </div>

            {/* Module Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                <ModuleCard title="Documents" icon={<MdBadge size={18}/>} summary={`${(raw.documents||[]).filter(d=>!d.isExtra).length} core files`} meta="ID, marksheets, certificates" action="Open" accent="blue" onClick={()=>setSectionModal("docs")} />
                <ModuleCard title="Extra Files" icon={<MdSchool size={18}/>} summary={`${(raw.documents||[]).filter(d=>d.isExtra).length} supporting files`} meta="Resume, awards, projects" action="Manage" accent="green" onClick={()=>setSectionModal("extra")} />
                <ModuleCard title="Placement" icon={<MdWork size={18}/>} summary={readinessStatus} meta={raw.placement?.placedInfo?.companyName || "Not Placed"} action="Details" accent="purple" onClick={()=>setSectionModal("placement")} />
                <ModuleCard title="Permissions" icon={<MdAccessTime size={18}/>} summary={`${(raw.permissions||[]).filter(p=>p.status==="pending").length} pending`} meta="Leave & dummy requests" action="View" accent="orange" onClick={()=>setSectionModal("permissions")} />
            </div>

            {/* Modals Implementation */}

            {/* Level History Full View */}
            <SectionModal isOpen={historyModal} onClose={()=>setHistoryModal(false)} title="Detailed Academic History" subtitle={name} countLabel={`${snapshots.length} levels completed`}>
                <div className="space-y-6">
                    {levelHistoryItems.map((item, idx) => (
                        <div key={idx} className={`p-5 border rounded-2xl transition-all ${item.status==="current"?"bg-blue-50/40 border-blue-100 shadow-md":"bg-white border-gray-100 shadow-sm"}`}>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${item.status==="current"?"bg-blue-600 text-white":"bg-gray-100 text-gray-600"}`}>{idx+1}</div>
                                    <div><p className="text-sm font-black text-gray-900">{item.label}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatShortDate(item.date)}</p></div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${item.status==="current"?"bg-blue-100 text-blue-600 border-blue-200":"bg-green-100 text-green-600 border-green-200"}`}>{item.status==="current"?"Ongoing":"Passed"}</span>
                                    {item.status !== "current" && <p className="mt-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Graduated</p>}
                                </div>
                            </div>
                            
                            <SnapshotStats title="Academic Performance Summary" snapshot={item.snapshot || { totalTasks, completedTasks, pendingTasks, averageMarks: taskRating }} />

                            {/* Detailed Task Wise Performance */}
                            <div className="mt-5 pt-5 border-t border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Task Wise Performance Details</p>
                                <div className="space-y-3">
                                    {subjects.map(s => (
                                        <div key={s.name} className="space-y-2">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{s.name}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {s.tasks.map((t, ti) => (
                                                    <div key={ti} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] font-bold text-gray-800 truncate">{t.taskName || t.title || "Untitled Task"}</p>
                                                            <p className="text-[9px] text-gray-400 font-medium uppercase">{t.topicName || "General Task"}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 ml-3">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.status==="completed"?"bg-green-100 text-green-700":"bg-orange-100 text-orange-700"}`}>{t.status}</span>
                                                            <span className={`text-[10px] font-black italic ${getPerformanceColor(t.marks)}`}>{getPerformanceLabel(t.marks)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionModal>

            {/* Activity Full View */}
            <SectionModal isOpen={activityModal} onClose={()=>setActivityModal(false)} title="Activity Log" subtitle={name} countLabel={`${activityItems.length} events logged`}>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-50" />
                    <div className="space-y-6">
                        {activityItems.map((item, idx) => <ActivityRow key={idx} item={item} />)}
                    </div>
                </div>
            </SectionModal>

            {/* Section Modals (Docs, Extra, Placement, Permissions) */}
            <SectionModal isOpen={sectionModal==="docs"} onClose={()=>setSectionModal(null)} title="Core Documents" subtitle={name} countLabel={`${(raw.documents||[]).filter(d=>!d.isExtra).length} files`}>
                <div className="space-y-3">
                    {(raw.documents||[]).filter(d=>!d.isExtra).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <MdSchool size={20} className="text-blue-500" />
                                <div><p className="text-xs font-bold text-gray-800">{doc.title || "File"}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.fileType || "doc"} • {formatShortDate(doc.uploadedAt)}</p></div>
                            </div>
                            <button onClick={()=>openFile(doc.fileURL)} className="px-4 py-1.5 text-[10px] font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 uppercase tracking-widest">Open</button>
                        </div>
                    ))}
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="extra"} onClose={()=>setSectionModal(null)} title="Extra Documents" subtitle={name} countLabel={`${(raw.documents||[]).filter(d=>d.isExtra).length} files`}>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl">
                        <p className="text-xs font-bold text-blue-700 mb-3">Upload Supporting File</p>
                        <div className="flex gap-2">
                            <input type="file" className="hidden" id="extra-file-up" onChange={async (e)=>{
                                const f = e.target.files[0]; if(!f) return;
                                const r = new FileReader(); r.onload=async(ev)=>{
                                    try { await uploadExtraDoc({ title: f.name, fileData: ev.target.result, fileType: f.type.includes("pdf")?"pdf":"image" }).unwrap(); toast.success("Uploaded!"); refetch(); } 
                                    catch(err){ toast.error("Failed"); }
                                }; r.readAsDataURL(f);
                            }} />
                            <label htmlFor="extra-file-up" className="flex-1 px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-xl text-center cursor-pointer hover:bg-blue-700 transition uppercase tracking-widest">Select & Upload</label>
                        </div>
                    </div>
                    {(raw.documents||[]).filter(d=>d.isExtra).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <MdBadge size={20} className="text-green-500" />
                                <div><p className="text-xs font-bold text-gray-800">{doc.title}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatShortDate(doc.uploadedAt)}</p></div>
                            </div>
                            <button onClick={()=>openFile(doc.fileURL)} className="px-4 py-1.5 text-[10px] font-bold border border-gray-200 rounded-lg hover:bg-gray-50 uppercase tracking-widest">View</button>
                        </div>
                    ))}
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="placement"} onClose={()=>setSectionModal(null)} title="Placement Details" subtitle={name}>
                <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Company Information</p>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-500"><MdWork size={24} /></div>
                            <div><p className="text-base font-black text-gray-900">{raw.placement?.placedInfo?.companyName || "No Company Assigned"}</p><p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{raw.placement?.placedInfo?.jobProfile || "N/A"}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-indigo-50"><p className="text-[9px] font-bold text-gray-400 uppercase">Package</p><p className="text-sm font-black text-indigo-600">{raw.placement?.placedInfo?.ctc ? `${raw.placement.placedInfo.ctc} LPA` : "—"}</p></div>
                            <div className="p-3 bg-white rounded-xl border border-indigo-50"><p className="text-[9px] font-bold text-gray-400 uppercase">Join Date</p><p className="text-sm font-black text-gray-800">{formatShortDate(raw.placement?.placedInfo?.joiningDate) || "—"}</p></div>
                        </div>
                    </div>
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="permissions"} onClose={()=>setSectionModal(null)} title="Leave & Permission Status" subtitle={name}>
                <div className="space-y-3">
                    {(raw.permissions||[]).map((item, i) => (
                        <div key={i} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                                <div><p className="text-xs font-bold text-gray-900">{item.reason || "Permission Request"}</p><p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{formatShortDate(item.fromDate)} - {formatShortDate(item.toDate)}</p></div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusBadgeClass(item.status)}`}>{item.status}</span>
                            </div>
                            {item.remark && <p className="text-[11px] text-gray-500 font-bold bg-gray-50 px-2.5 py-1.5 rounded-lg mt-3 italic border-l-2 border-gray-200">"{item.remark}"</p>}
                        </div>
                    ))}
                </div>
            </SectionModal>
        </div>
    );
}
