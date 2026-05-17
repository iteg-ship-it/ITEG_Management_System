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
    if (["approved", "completed", "selected", "joined", "placed", "ready"].includes(normalized)) return "bg-green-50 text-green-600 border-green-100";
    if (["pending", "scheduled", "ongoing", "in progress", "ready for interview"].includes(normalized)) return "bg-blue-50 text-blue-600 border-blue-100";
    if (["rejected", "overdue", "not ready"].includes(normalized)) return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
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

const CompactDetail = ({ icon: Icon, label, value, color = "gray" }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 text-${color}-500 shadow-sm`}><Icon size={16} /></div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-black text-gray-800 truncate uppercase tracking-tight">{value || "—"}</p>
        </div>
    </div>
);

const HeroMetricCard = ({ title, icon: Icon, value, status, color = "blue" }) => (
    <div className="flex-1 min-h-[90px] flex flex-col items-center justify-center text-center p-3 border border-gray-100 rounded-2xl bg-white shadow-sm transition active:scale-95">
        <p className="text-[9px] font-black text-gray-400 mb-2 uppercase tracking-widest">{title}</p>
        <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-tighter text-${color}-600`}>
            {Icon && <Icon size={18} />}
            {value}
        </div>
        {status && <p className="mt-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">{status}</p>}
    </div>
);

const LevelJourneyBar = ({ items = [] }) => {
    const rawCurrentIndex = items.findIndex(item => item.status === "current");
    const progressIndex = rawCurrentIndex === -1 ? items.filter(item => item.status === "completed").length - 1 : rawCurrentIndex;
    const progressPercent = items.length > 1 ? (progressIndex / (items.length - 1)) * 100 : 0;

    return (
        <section className="bg-white border border-gray-100 rounded-[32px] shadow-sm px-6 py-7 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Academic Journey</h2>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Level {progressIndex + 1}</span>
                </div>
            </div>
            
            <div className="relative pt-2 pb-2">
                <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                    <div className="relative flex justify-between min-w-[550px] sm:min-w-0 sm:w-full gap-2">
                        
                        {/* Background Line */}
                        <div className="absolute left-[16px] right-[16px] top-[14.5px] h-[3px] bg-gray-50 rounded-full" />
                        
                        {/* Progress Line */}
                        <div 
                            className="absolute left-[16px] top-[14.5px] h-[3px] bg-green-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                            style={{ width: `calc(${progressPercent}% - 0px)` }} 
                        />

                        {items.map((item, idx) => {
                            const isCompleted = item.status === "completed";
                            const isCurrent = item.status === "current";
                            return (
                                <div key={idx} className="relative z-10 flex flex-col items-center flex-1 text-center">
                                    <div className={`
                                        w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-500 border-[3px]
                                        ${isCompleted ? "bg-green-500 border-white shadow-lg shadow-green-100" : 
                                          isCurrent ? "bg-blue-600 border-white shadow-xl shadow-blue-100 scale-110" : 
                                          "bg-white border-gray-100"}
                                    `}>
                                        {isCompleted ? <MdCheckCircle className="text-white" size={16} /> : 
                                         isCurrent ? <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : 
                                         <div className="w-1 h-1 bg-gray-200 rounded-full" />}
                                    </div>

                                    <div className="mt-4 space-y-1 px-1">
                                        <p className={`text-[10px] font-black uppercase tracking-tighter ${isCurrent ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                                            {item.code}
                                        </p>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-tight opacity-70 line-clamp-1">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
        <button onClick={onClick} className="active:scale-95 group bg-white border border-gray-100 rounded-[28px] p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${accents[accent]} shadow-sm`}>{icon}</div>
                <div className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">{action}</div>
            </div>
            <h3 className="mt-5 text-[14px] font-black text-gray-900 uppercase tracking-tight">{title}</h3>
            <p className="mt-1 text-[11px] font-bold text-gray-500 line-clamp-1">{summary}</p>
            <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{meta}</p>
            </div>
        </button>
    );
};

const ActivityRow = ({ item }) => (
    <div className="flex items-start gap-4 relative z-10 py-2">
        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm border border-white/50 ${item.color}`}>
            {item.icon === "task" && <MdTableChart size={18} />}
            {item.icon === "promote" && <MdArrowUpward size={18} />}
            {item.icon === "email" && <MdEmail size={18} />}
            {item.icon === "document" && <MdSchool size={18} />}
            {item.icon === "note" && <MdAccessTime size={18} />}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                <p className="text-[13px] font-black text-gray-800 leading-tight uppercase tracking-tight">{item.title}</p>
            </div>
            {item.sub && <p className="text-[11px] font-bold text-gray-500 mt-1.5 leading-relaxed">{item.sub}</p>}
            <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-1.5"><MdAccessTime size={10}/> {formatDateTime(item.time)}</p>
        </div>
    </div>
);

const SectionModal = ({ isOpen, onClose, title, subtitle, countLabel, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4">
            <div className="flex max-h-[95vh] sm:max-h-[90vh] w-full max-w-2xl flex-col rounded-t-[36px] sm:rounded-[36px] bg-white shadow-2xl overflow-hidden animate-slide-up">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
                <div className="flex items-start justify-between gap-4 border-b border-gray-50 px-6 py-7 sm:px-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">{title}</h2>
                        {subtitle && <p className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="rounded-2xl p-3 bg-gray-50 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-90"><MdClose size={24} /></button>
                </div>
                {countLabel && (
                    <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 sm:px-8 bg-gray-50/20">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Records</p>
                        <span className="rounded-xl bg-white border border-gray-100 px-4 py-1.5 text-[10px] font-black text-gray-600 uppercase shadow-sm">{countLabel}</span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 pb-12 sm:pb-10">{children}</div>
                {footer && <div className="border-t border-gray-50 px-6 py-6 sm:px-10 bg-white">{footer}</div>}
            </div>
        </div>
    );
};

const SnapshotStats = ({ title, snapshot }) => {
    if (!snapshot) return null;
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/30 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm ${getPerformanceColor(snapshot.averageMarks)}`}>
                    {getPerformanceLabel(snapshot.averageMarks)}
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { l: "Tasks", v: snapshot.totalTasks },
                    { l: "Done", v: snapshot.completedTasks, c: "text-green-600" },
                    { l: "Wait", v: snapshot.pendingTasks, c: "text-orange-600" },
                    { l: "Grade", v: getPerformanceLabel(snapshot.averageMarks), c: getPerformanceColor(snapshot.averageMarks) }
                ].map((s, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-gray-50 p-3 text-center shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{s.l}</p>
                        <p className={`text-[11px] font-black uppercase truncate ${s.c || "text-gray-900"}`}>{s.v ?? 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main Dashboard / Profile ─────────────────────────────────────────────────

export default function StudentDashboard() {
    const navigate = useNavigate();
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
        <div className="flex items-center justify-center h-[100dvh] bg-[#F8F7F5]">
            <div className="w-14 h-14 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const raw = profileRes?.data || {};
    const name = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const taskData = taskRes?.data || taskRes || {};
    const totalTasks = taskData.totalTasks || 0;
    const completedTasks = taskData.completedTasks || 0;
    const pendingTasks = taskData.pendingTasks || 0;
    const overdueTasks = taskData.overdueTasks || taskData.overDueTasks || 0;
    
    // Calculate Rating like Admin Side (Robust version)
    const subjectGroups = taskData.groupedBySubject || {};
    const allSubjectTasks = Object.values(subjectGroups).flatMap(group => group.tasks || []);
    const evaluatedTasks = allSubjectTasks.filter(t => t.marks !== undefined && t.marks !== null && !isNaN(Number(t.marks)) && Number(t.marks) > 0);
    const averageMarks = evaluatedTasks.length > 0
        ? (evaluatedTasks.reduce((sum, t) => sum + Number(t.marks), 0) / evaluatedTasks.length).toFixed(1)
        : "N/A";
    const taskRating = averageMarks;
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
            try { await updateImage({ image: ev.target.result }).unwrap(); toast.success("Photo Updated!"); refetch(); } 
            catch (err) { toast.error("Failed"); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-5 bg-[#F8F7F5] min-h-[100dvh] font-sans text-gray-800 pb-24 sm:pb-10">
            
            {/* Redesigned Premium Hero Section */}
            <div className="bg-white border border-gray-100 rounded-[36px] shadow-sm p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50/50 rounded-full blur-3xl -ml-20 -mb-20" />
                
                <div className="relative flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-6">
                        {raw.image ? (
                            <img src={raw.image} alt={name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-[40px] object-cover border-4 border-white shadow-2xl ring-1 ring-gray-100" />
                        ) : (
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[40px] bg-gray-50 text-gray-300 flex items-center justify-center text-5xl font-black border-4 border-white shadow-2xl ring-1 ring-gray-100">{initials}</div>
                        )}
                        <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all border-4 border-white"><MdEdit size={18} /></button>
                        <input ref={fileRef} type="file" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Name & Basic Info */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900">{name}</h1>
                            <MdVerified size={24} className="text-blue-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-black text-blue-600 mt-2 uppercase tracking-[0.2em]">{raw.course || "N/A"} • LEVEL {raw.currentLevelId?.name?.slice(-1) || "1"} • {raw.subDepartmentId?.name || "ITEG"}</p>
                    </div>

                    {/* Metrics Dashboard */}
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        <HeroMetricCard title="Placement" icon={MdCheckCircle} value={readinessStatus} color="blue" />
                        <HeroMetricCard title="Attendance" icon={MdSchool} value="N/A" color="indigo" />
                        <div className="col-span-2 sm:col-span-1 min-h-[90px] flex flex-col items-center justify-center p-3 border border-gray-100 rounded-2xl bg-white shadow-sm transition active:scale-95">
                            <p className="text-[9px] font-black text-gray-400 mb-2 uppercase tracking-widest">Task Rating</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{taskRating}</p>
                            <div className="mt-2 flex items-center justify-center gap-0.5 text-yellow-400">{[1,2,3,4,5].map(i=><MdStar key={i} size={14} className={i<=Math.round(Number(taskRating))?"":"text-gray-100"}/>)}</div>
                        </div>
                    </div>

                    {/* Details Grid - Proper Format */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <CompactDetail icon={MdBadge} label="PR Key" value={raw.prkey} color="blue" />
                        <CompactDetail icon={MdEmail} label="Email Address" value={raw.email} color="indigo" />
                        <CompactDetail icon={MdPhone} label="Mobile" value={raw.studentMobile} color="orange" />
                        <CompactDetail icon={MdBusiness} label="Department" value={raw.subDepartmentId?.departmentId?.name} color="green" />
                        <CompactDetail icon={MdAccountTree} label="Sub Dept" value={raw.subDepartmentId?.name} color="purple" />
                        <CompactDetail icon={MdCalendarToday} label="Active Session" value={raw.sessionId?.name} color="sky" />
                    </div>
                </div>
            </div>

            {/* Journey Roadmap */}
            <LevelJourneyBar items={journeyItems} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr] gap-5">
                
                {/* Column 1: Task Progress */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full blur-2xl -mr-12 -mt-12" />
                    <div className="mb-8"><h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Active Progress</h3><div className="mt-3 inline-flex items-center gap-2.5 rounded-2xl bg-blue-50 px-4 py-2 text-[10px] font-black text-blue-700 uppercase tracking-widest border border-blue-100"><span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/> {currentSubLevelName}</div></div>
                    <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-14">
                        <div className="relative w-44 h-44 flex-shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#F8F7F5" strokeWidth="18" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="18" strokeDasharray={`${totalTasks>0?(completedTasks/totalTasks)*301.6:0} 301.6`} strokeLinecap="round" className="transition-all duration-1000" />
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="18" strokeDasharray={`${totalTasks>0?(pendingTasks/totalTasks)*301.6:0} 301.6`} strokeDashoffset={`-${totalTasks>0?(completedTasks/totalTasks)*301.6:0}`} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tasks</p><p className="text-4xl font-black text-gray-900">{totalTasks}</p></div>
                        </div>
                        <div className="flex-1 w-full min-w-0">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Performance Matrix</p>
                            <div className="space-y-5 max-h-52 overflow-y-auto pr-1 scrollbar-hide pb-2">
                                {subjects.map(s=><div key={s.name} className="group"><div className="flex justify-between mb-2"><span className="text-[12px] font-black text-gray-700 truncate uppercase tracking-tight">{s.name}</span><span className="text-[11px] font-black text-gray-900">{s.pct}%</span></div><div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100 shadow-inner"><div className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-700" style={{width:`${s.pct}%`}}/></div></div>)}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-8 mt-8 border-t border-gray-50">
                        <div className="flex flex-col items-center gap-1.5"><span className="w-full h-1.5 rounded-full bg-green-500 mb-1 shadow-sm"/><span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Done ({completedTasks})</span></div>
                        <div className="flex flex-col items-center gap-1.5"><span className="w-full h-1.5 rounded-full bg-orange-500 mb-1 shadow-sm"/><span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Wait ({pendingTasks})</span></div>
                        <div className="flex flex-col items-center gap-1.5"><span className="w-full h-1.5 rounded-full bg-red-500 mb-1 shadow-sm"/><span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Late ({overdueTasks})</span></div>
                    </div>
                    <button onClick={()=>navigate("/student-portal/tasks")} className="active:scale-95 mt-8 w-full py-4 text-[12px] font-black uppercase tracking-widest text-blue-600 border-2 border-blue-50 bg-blue-50/30 rounded-[24px] hover:bg-blue-50 transition-all shadow-sm">Explore Task Board</button>
                </div>

                {/* Column 2: Timeline */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Timeline</h3><button onClick={()=>setHistoryModal(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-2xl active:scale-90 transition-all border border-blue-100">Full Log</button></div>
                    <div className="relative">
                        <div className="absolute left-[18px] top-2 bottom-2 w-1 bg-gray-50 rounded-full" />
                        <div className="space-y-10 max-h-[380px] overflow-y-auto pr-1 scrollbar-hide pb-6">
                            {levelHistoryItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-6 pl-1 relative">
                                    <div className={`relative z-10 w-4 h-4 rounded-full border-[4px] mt-0.5 transition-all duration-300 ${item.status==="current"?"bg-blue-600 border-blue-100 shadow-[0_0_0_6px_rgba(37,99,235,0.1)]":"bg-white border-gray-200"}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className={`text-[14px] font-black truncate uppercase tracking-tight ${item.status==="current"?"text-blue-600":"text-gray-800"}`}>{item.label}</p>
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider flex-shrink-0 border-2 ${item.status==="current"?"bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100":"bg-green-50 text-green-600 border-green-100"}`}>{item.status==="current"?"Live":"Done"}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 font-black italic tracking-[0.15em] uppercase">{item.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Activity */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8"><h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Stream</h3><button onClick={()=>setActivityModal(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-2xl active:scale-90 transition-all border border-blue-100">Recent</button></div>
                    <div className="relative">
                        <div className="absolute left-[20px] top-0 bottom-0 w-1 bg-gray-50 rounded-full" />
                        <div className="space-y-8 max-h-[380px] overflow-y-auto pr-1 scrollbar-hide pb-6">
                            {activityItems.length > 0 ? activityItems.slice(0, 10).map((item, idx) => <ActivityRow key={idx} item={item} />) : <div className="py-24 text-center text-[11px] font-black text-gray-300 uppercase tracking-widest italic">Waiting for activity...</div>}
                        </div>
                    </div>
                </div>

            </div>

            {/* Module Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                <ModuleCard title="Documents" icon={<MdBadge size={24}/>} summary="Academic Vault" meta="Verified Files" action="Open" accent="blue" onClick={()=>setSectionModal("docs")} />
                <ModuleCard title="Extra Files" icon={<MdSchool size={24}/>} summary="Achievements" meta="Portfolio" action="Manage" accent="green" onClick={()=>setSectionModal("extra")} />
                <ModuleCard title="Placement" icon={<MdWork size={24}/>} summary={readinessStatus} meta="Career" action="Details" accent="purple" onClick={()=>setSectionModal("placement")} />
                <ModuleCard title="Permissions" icon={<MdAccessTime size={24}/>} summary="Presence" meta="Attendance" action="View" accent="orange" onClick={()=>setSectionModal("permissions")} />
            </div>

            {/* Modals Refined */}
            <SectionModal isOpen={historyModal} onClose={()=>setHistoryModal(false)} title="Full Academic History" subtitle={name} countLabel={`${snapshots.length} PASSED`}>
                <div className="space-y-8">
                    {levelHistoryItems.map((item, idx) => (
                        <div key={idx} className={`p-6 rounded-[32px] border-2 transition-all duration-300 ${item.status==="current"?"bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-50":"bg-white border-gray-50 shadow-sm hover:shadow-md"}`}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${item.status==="current"?"bg-blue-600 text-white":"bg-gray-50 text-gray-400 border border-gray-100"}`}>{idx+1}</div>
                                    <div><p className="text-base font-black text-gray-900 uppercase tracking-tight">{item.label}</p><p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{formatShortDate(item.date)}</p></div>
                                </div>
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border-2 shadow-sm ${item.status==="current"?"bg-blue-600 text-white border-blue-600":"bg-green-100 text-green-700 border-green-200"}`}>{item.status==="current"?"Ongoing":"Passed"}</span>
                            </div>
                            <SnapshotStats title="Performance Snapshot" snapshot={item.snapshot || { totalTasks, completedTasks, pendingTasks, averageMarks: taskRating }} />
                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Course Performance Detail</p>
                                <div className="space-y-6">
                                    {subjects.map(s => (
                                        <div key={s.name} className="space-y-3">
                                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2.5"><span className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"/> {s.name}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {s.tasks.map((t, ti) => (
                                                    <div key={ti} className="flex items-center justify-between p-5 bg-gray-50/40 rounded-[24px] border border-gray-100 active:bg-gray-100 transition-all hover:bg-white group">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[12px] font-black text-gray-800 truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">{t.taskName || t.title}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate mt-1">{t.topicName || "Core Concept"}</p>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <span className={`text-[11px] font-black italic block mb-1.5 ${getPerformanceColor(t.marks)}`}>{getPerformanceLabel(t.marks)}</span>
                                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${t.status==="completed"?"bg-green-50 text-green-600 border-green-100":"bg-orange-50 text-orange-600 border-orange-100"}`}>{t.status}</span>
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

            {/* Other Modals (Activity, Docs, Extra, Placement, Permissions) ... keeping simplified for mobile performance */}
            <SectionModal isOpen={activityModal} onClose={()=>setActivityModal(false)} title="Activity Stream" subtitle="Student Lifecycle Log" countLabel="LIVE">
                <div className="relative pl-2">
                    <div className="absolute left-[26px] top-0 bottom-0 w-1.5 bg-gray-50 rounded-full" />
                    <div className="space-y-10">
                        {activityItems.map((item, idx) => <ActivityRow key={idx} item={item} />)}
                    </div>
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="docs"} onClose={()=>setSectionModal(null)} title="Core Documents" subtitle="Verified Academic Profile">
                <div className="space-y-4">
                    {(raw.documents||[]).filter(d=>!d.isExtra).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-[28px] shadow-sm active:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100"><MdSchool size={24} /></div>
                                <div><p className="text-[14px] font-black text-gray-900 uppercase tracking-tight">{doc.title || "File"}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatShortDate(doc.uploadedAt)} • {(doc.fileType||"FILE").toUpperCase()}</p></div>
                            </div>
                            <button onClick={()=>openFile(doc.fileURL)} className="px-6 py-2.5 text-[11px] font-black bg-gray-900 text-white rounded-2xl uppercase tracking-widest shadow-lg active:scale-90 transition-all">Open</button>
                        </div>
                    ))}
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="extra"} onClose={()=>setSectionModal(null)} title="Portfolios" subtitle="Skills & Extra-Curricular">
                <div className="space-y-5">
                    <div className="p-8 bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[32px] text-center shadow-inner">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100 text-blue-600"><MdArrowUpward size={24} /></div>
                        <p className="text-[12px] font-black text-blue-700 uppercase tracking-[0.1em] mb-5">Upload Achievement</p>
                        <input type="file" className="hidden" id="extra-up-apk-dash" onChange={async (e)=>{
                            const f = e.target.files[0]; if(!f) return;
                            const r = new FileReader(); r.onload=async(ev)=>{
                                try { await uploadExtraDoc({ title: f.name, fileData: ev.target.result, fileType: f.type.includes("pdf")?"pdf":"image" }).unwrap(); toast.success("Achievement Saved!"); refetch(); } 
                                catch(err){ toast.error("Upload Failed"); }
                            }; r.readAsDataURL(f);
                        }} />
                        <label htmlFor="extra-up-apk-dash" className="block w-full py-4 bg-blue-600 text-white text-[12px] font-black rounded-2xl cursor-pointer active:scale-95 transition-all uppercase tracking-widest shadow-xl shadow-blue-200">Select Document</label>
                    </div>
                    {(raw.documents||[]).filter(d=>d.isExtra).map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-[28px] shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner border border-green-100"><MdBadge size={24} /></div>
                                <div><p className="text-[14px] font-black text-gray-900 uppercase tracking-tight">{doc.title}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatShortDate(doc.uploadedAt)}</p></div>
                            </div>
                            <button onClick={()=>openFile(doc.fileURL)} className="px-6 py-2.5 text-[11px] font-black border-2 border-gray-100 rounded-2xl uppercase tracking-widest bg-gray-50 active:bg-gray-100 shadow-sm">View</button>
                        </div>
                    ))}
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="placement"} onClose={()=>setSectionModal(null)} title="Career Roadmap" subtitle="Placement & Industrial Ties">
                <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-8">Professional Profile</p>
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-20 h-20 rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl"><MdWork size={36} className="text-white" /></div>
                        <div><p className="text-2xl font-black uppercase tracking-tight leading-tight">{raw.placement?.placedInfo?.companyName || "SEEKING PLACEMENT"}</p><p className="text-[12px] font-bold text-indigo-100 uppercase tracking-widest mt-2">{raw.placement?.placedInfo?.jobProfile || "Career Roadmap Active"}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md"><p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Package</p><p className="text-xl font-black">{raw.placement?.placedInfo?.ctc ? `${raw.placement.placedInfo.ctc} LPA` : "—"}</p></div>
                        <div className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md"><p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Join Date</p><p className="text-xl font-black">{formatShortDate(raw.placement?.placedInfo?.joiningDate) || "—"}</p></div>
                    </div>
                </div>
            </SectionModal>

            <SectionModal isOpen={sectionModal==="permissions"} onClose={()=>setSectionModal(null)} title="Leaves & Presence" subtitle="Attendance & Permission Log">
                <div className="space-y-4">
                    {(raw.permissions||[]).map((item, i) => (
                        <div key={i} className="p-6 border-2 border-gray-50 rounded-[32px] bg-white shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start gap-5 mb-4">
                                <div className="min-w-0"><p className="text-[15px] font-black text-gray-900 uppercase tracking-tight truncate">{item.reason || "Leave Request"}</p><p className="text-[11px] font-bold text-gray-400 mt-1.5 uppercase tracking-widest">{formatShortDate(item.fromDate)} - {formatShortDate(item.toDate)}</p></div>
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border-2 shadow-sm flex-shrink-0 ${statusBadgeClass(item.status)}`}>{item.status}</span>
                            </div>
                            {item.remark && <div className="mt-5 p-5 bg-gray-50 rounded-[24px] border-l-4 border-gray-200 italic text-[12px] font-bold text-gray-600 leading-relaxed shadow-inner">"{item.remark}"</div>}
                        </div>
                    ))}
                    {(raw.permissions||[]).length === 0 && <div className="py-24 text-center text-[11px] font-black text-gray-300 uppercase tracking-widest italic">No leave history on file</div>}
                </div>
            </SectionModal>

            {/* APK Optimization Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
            `}} />
        </div>
    );
}
