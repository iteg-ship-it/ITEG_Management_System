import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    MdCheckCircle, MdRadioButtonUnchecked, MdAccessTime,
    MdCalendarToday, MdArrowBack, MdClose, MdStar, MdStarBorder, MdAdd,
    MdSearch, MdNotificationsNone, MdFilterList, MdMoreHoriz, MdVerified
} from "react-icons/md";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { useGetNewStudentTasksQuery, useAssignExtraTaskMutation, useGetSyllabusVersionWithHierarchyQuery } from "../../../../redux/api/authApi";
import Loader from "../../../shared/loader/Loader";

const SECRET_KEY = "ITEG@123";
const getToken = () => {
    try {
        const enc = localStorage.getItem("token");
        if (!enc) return "";
        return CryptoJS.AES.decrypt(enc, SECRET_KEY).toString(CryptoJS.enc.Utf8) || "";
    } catch { return ""; }
};

const PRIORITY_BADGES = {
    high:   "bg-rose-50 text-rose-600 border border-rose-100",
    medium: "bg-amber-50 text-amber-600 border border-amber-100",
    low:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

const STATUS_COLUMNS = [
    { key: "pending",    label: "Pending",     badgeBg: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
    { key: "inProgress", label: "In Progress", badgeBg: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    { key: "completed",  label: "Completed",   badgeBg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
];

// ── Completion Modal ──────────────────────────────────────────────────────────
const CompletionModal = ({ task, onConfirm, onCancel, loading }) => {
    const [marks,  setMarks]  = useState(task.marks ?? "");
    const [remark, setRemark] = useState(task.notes || "");
    const maxMarks = task.maxMarks || 5;

    const handleSubmit = () => {
        const m = Number(marks);
        if (marks === "" || isNaN(m) || m < 0 || m > maxMarks) {
            toast.error(`Marks must be between 0 and ${maxMarks}`);
            return;
        }
        onConfirm({ marks: m, notes: remark });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Complete Task</h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.title}</p>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <MdClose size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Marks / Rating <span className="text-rose-500">*</span>
                            <span className="ml-1 text-[11px] font-normal text-slate-400">(out of {maxMarks})</span>
                        </label>

                        {maxMarks <= 5 ? (
                            <div className="flex items-center gap-2">
                                {Array.from({ length: maxMarks }, (_, i) => i + 1).map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setMarks(star)}
                                        className="transition hover:scale-110"
                                    >
                                        {star <= Number(marks)
                                            ? <MdStar size={30} className="text-orange-400" />
                                            : <MdStarBorder size={30} className="text-slate-300" />
                                        }
                                    </button>
                                ))}
                                {marks !== "" && (
                                    <span className="ml-2 text-xs font-bold text-orange-500">{marks}/{maxMarks}</span>
                                )}
                            </div>
                        ) : (
                            <input
                                type="number"
                                min={0}
                                max={maxMarks}
                                value={marks}
                                onChange={e => setMarks(e.target.value)}
                                placeholder={`0 - ${maxMarks}`}
                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-400"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Remark <span className="text-[11px] font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                            placeholder="Add a remark about task completion..."
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-400 resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || marks === ""}
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><MdCheckCircle size={15} /> Mark Complete</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Task Card (Reference UI Replica) ──────────────────────────────────────────
const TaskCard = ({ task, onDragStart, onStatusChange }) => {
    const priority    = task.priority || "medium";
    const isCompleted = task.status === "completed";
    const isInProgress = task.status === "inProgress";

    return (
        <div
            draggable
            onDragStart={() => onDragStart(task)}
            className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing select-none space-y-3"
        >
            {/* Header: Priority Badge + Status Dropdown */}
            <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isCompleted ? "bg-slate-100 text-slate-500 border border-slate-200" : (PRIORITY_BADGES[priority] || PRIORITY_BADGES.medium)
                }`}>
                    {isCompleted ? "COMPLETED" : `${priority} PRIORITY`}
                </span>

                <select
                    value={task.status || "pending"}
                    onChange={(e) => onStatusChange(task, e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 bg-transparent border-none outline-none focus:outline-none cursor-pointer"
                >
                    <option value="pending">PENDING ▾</option>
                    <option value="inProgress">IN PROGRESS ▾</option>
                    <option value="completed">DONE ▾</option>
                </select>
            </div>

            {/* Title */}
            <div>
                <h4 className={`text-xs font-bold text-slate-900 leading-snug ${isCompleted ? "line-through text-slate-400" : ""}`}>
                    {task.title}
                </h4>
                {(task.subjectName || task.description) && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-medium">
                        {task.description || (task.subjectName ? `${task.subjectName}${task.topicName ? ` › ${task.topicName}` : ""}` : "")}
                    </p>
                )}
            </div>

            {/* In Progress Progress Bar */}
            {isInProgress && (
                <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Progress</span>
                        <span className="text-orange-500 font-extrabold">65%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-orange-500" style={{ width: "65%" }} />
                    </div>
                </div>
            )}

            {/* Marks & Verified Badge for Completed */}
            {isCompleted && (
                <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[11px]">
                        <MdVerified size={14} /> VERIFIED
                    </span>
                    {task.marks != null && (
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: task.maxMarks || 5 }, (_, i) => (
                                i < task.marks
                                    ? <MdStar key={i} size={12} className="text-orange-400" />
                                    : <MdStarBorder key={i} size={12} className="text-slate-300" />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Footer Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                    <MdCalendarToday size={12} />
                    <span>
                        {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : task.timeDays ? `${task.timeDays} Days` : "No deadline"
                        }
                    </span>
                </div>

                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-[10px]">
                    {task.type?.[0]?.toUpperCase() || "T"}
                </div>
            </div>
        </div>
    );
};

// ── Extra Task Modal ──────────────────────────────────────────────────────────
const TASK_TYPES = ["assignment", "writtenExam", "interview", "project", "presentation", "learning", "assessment"];
const PRIORITIES = ["low", "medium", "high"];
const EMPTY_EXTRA = { title: "", description: "", type: "assessment", priority: "medium", maxMarks: 5, timeDays: "", dueDate: "", measurablePoints: "", subjectName: "" };

const ExtraTaskModal = ({ student, onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_EXTRA);
    const [assignExtraTask, { isLoading }] = useAssignExtraTaskMutation();

    const { data: versionData } = useGetSyllabusVersionWithHierarchyQuery(
        student?.syllabusVersionId,
        { skip: !student?.syllabusVersionId }
    );
    const subjects = versionData?.data?.subjects || [];

    const ic = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-400 bg-white";
    const lc = "block text-xs font-semibold text-slate-700 mb-1";
    const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error("Task title is required"); return; }
        try {
            await assignExtraTask({
                id: student._id,
                title: form.title,
                description: form.description || undefined,
                type: form.type,
                maxMarks: Number(form.maxMarks),
                subjectName: form.subjectName || undefined,
                measurablePoints: form.measurablePoints || undefined,
                timeDays: form.timeDays ? Number(form.timeDays) : undefined,
                dueDate: form.dueDate || undefined,
                priority: form.priority,
            }).unwrap();
            toast.success("Extra task assigned successfully!");
            onSuccess();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to assign task");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Assign New Task</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{student.firstName} {student.lastName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <MdClose size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
                    <div>
                        <label className={lc}>Task Title <span className="text-rose-500">*</span></label>
                        <input className={ic} value={form.title} onChange={set("title")} placeholder="Enter task title..." />
                    </div>

                    <div>
                        <label className={lc}>Description</label>
                        <textarea className={`${ic} resize-none`} rows={2} value={form.description} onChange={set("description")} placeholder="Task description..." />
                    </div>

                    <div>
                        <label className={lc}>Subject</label>
                        <select className={ic} value={form.subjectName} onChange={set("subjectName")}>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Type</label>
                            <select className={ic} value={form.type} onChange={set("type")}>
                                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={lc}>Priority</label>
                            <select className={ic} value={form.priority} onChange={set("priority")}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Max Marks</label>
                            <input type="number" min={1} max={10} className={ic} value={form.maxMarks} onChange={set("maxMarks")} />
                        </div>
                        <div>
                            <label className={lc}>Time (Days)</label>
                            <input type="number" min={1} className={ic} value={form.timeDays} onChange={set("timeDays")} placeholder="Optional" />
                        </div>
                    </div>

                    <div>
                        <label className={lc}>Due Date</label>
                        <input type="date" className={ic} value={form.dueDate} onChange={set("dueDate")} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-1 py-2.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                            {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdAdd size={16} />}
                            Assign Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentTaskBoard = () => {
    const location   = useLocation();
    const navigate   = useNavigate();
    const { student, level, subdepartment } = location.state || {};

    const [search,          setSearch]          = useState("");
    const [subjectFilter,   setSubjectFilter]   = useState("");
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [tasks,           setTasks]           = useState(null);
    const [dragTask,        setDragTask]        = useState(null);
    const [dragOver,        setDragOver]        = useState(null);
    const [modal,           setModal]           = useState(null);
    const [saving,          setSaving]          = useState(false);
    const [showExtraModal,  setShowExtraModal]  = useState(false);

    const { data, isLoading, refetch } = useGetNewStudentTasksQuery(
        { id: student?._id },
        { skip: !student?._id }
    );

    const allTasks = tasks
        ?? Object.values(data?.groupedBySubject || {}).flatMap(g => g.tasks || []);

    const subjects = Object.keys(data?.groupedBySubject || {});

    const filtered = allTasks.filter(t => {
        const matchSearch = !search ||
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
            t.topicName?.toLowerCase().includes(search.toLowerCase());
        const matchSubject = !subjectFilter || t.subjectName === subjectFilter;
        return matchSearch && matchSubject;
    });

    const byStatus = {
        pending:    filtered.filter(t => t.status === "pending"),
        inProgress: filtered.filter(t => t.status === "inProgress"),
        completed:  filtered.filter(t => t.status === "completed"),
    };

    const total     = allTasks.length;
    const completed = allTasks.filter(t => t.status === "completed").length;
    const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

    const handleDragStart = (task) => setDragTask(task);

    const handleDragOver = (e, colKey) => {
        e.preventDefault();
        setDragOver(colKey);
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        setDragOver(null);
        if (!dragTask || dragTask.status === targetStatus) { setDragTask(null); return; }

        if (targetStatus === "completed") {
            setModal({ task: dragTask, targetStatus });
        } else {
            applyStatusChange(dragTask, targetStatus, {});
        }
        setDragTask(null);
    };

    const applyStatusChange = async (task, newStatus, extra) => {
        const studentId = student._id;
        const taskId    = task.taskId || task._id;

        const mongoIdRegex = /^[a-f\d]{24}$/i;
        if (!mongoIdRegex.test(studentId) || !mongoIdRegex.test(taskId)) {
            toast.error("Invalid task or student ID");
            return;
        }

        const updated = allTasks.map(t =>
            t._id === task._id ? { ...t, status: newStatus, ...extra } : t
        );
        setTasks(updated);

        setSaving(true);
        try {
            const body = { status: newStatus, ...extra };
            const baseUrl = import.meta.env.VITE_API_URL;
            const url = `${baseUrl}/syllabus/versions/students/${studentId}/tasks/${taskId}`;

            const r = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify(body)
            });

            if (!r.ok) {
                const errData = await r.json();
                throw new Error(errData.message || "Update failed");
            }

            toast.success(`Task moved to ${newStatus === "inProgress" ? "In Progress" : newStatus}`);
            const fresh = await refetch();
            if (fresh?.data) setTasks(null);
        } catch (err) {
            toast.error(err.message || "Failed to update task");
            setTasks(null);
        } finally {
            setSaving(false);
        }
    };

    const handleModalConfirm = async ({ marks, notes }) => {
        setSaving(true);
        await applyStatusChange(modal.task, "completed", { marks, notes });
        setModal(null);
        setSaving(false);
    };

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
                <p className="text-slate-500 font-semibold text-sm">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">Go Back</button>
            </div>
        );
    }

    const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
    const initials = studentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-[#F8F9FA] px-8 py-6 space-y-6">

            {/* Modals */}
            {modal && (
                <CompletionModal
                    task={modal.task}
                    onConfirm={handleModalConfirm}
                    onCancel={() => { setModal(null); setDragTask(null); }}
                    loading={saving}
                />
            )}
            {showExtraModal && (
                <ExtraTaskModal
                    student={student}
                    onClose={() => setShowExtraModal(false)}
                    onSuccess={() => { setShowExtraModal(false); refetch(); }}
                />
            )}

            {/* TOP TITLE BAR WITH SEARCH & ID (REFERENCE REPLICA) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Record</h1>
                    {student.prkey && (
                        <span className="bg-slate-200/70 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md border border-slate-300/50">
                            ID: {student.prkey}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center h-10 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-xl px-3.5 shadow-sm hover:border-slate-300 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all duration-200">
                        <MdSearch className="text-slate-400 flex-shrink-0 mr-2.5" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full h-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-xs font-medium text-slate-800 placeholder-slate-400 p-0 shadow-none"
                        />
                    </div>

                    <button
                        type="button"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 relative flex-shrink-0"
                        title="Notifications"
                    >
                        <MdNotificationsNone size={18} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
                    </button>
                </div>
            </div>

            {/* BREADCRUMB & HEADER CONTAINER (REFERENCE REPLICA) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                {/* Breadcrumb Row */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <button onClick={() => navigate(-1)} className="hover:text-slate-700 transition flex items-center gap-1">
                        ← Student Record
                    </button>
                    <span>/</span>
                    <span className="text-slate-600 font-bold">{studentName}</span>
                    <span>/</span>
                    <span className="text-slate-900 font-black">Task Board</span>
                </div>

                {/* Student Tag Line */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center border border-orange-200">
                        {initials}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                        <span className="text-slate-900">{studentName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">{student.course || "BCA"} - {level?.name || "3rd Year"}</span>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                            ACTIVE
                        </span>
                    </div>
                </div>

                {/* Title & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Task Board</h2>

                    <div className="flex items-center gap-3">
                        {/* + New Task Button */}
                        <button
                            onClick={() => setShowExtraModal(true)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
                        >
                            <MdAdd size={16} /> New Task
                        </button>

                        {/* Filter Button / Subject Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDrawer(p => !p)}
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
                            >
                                <MdFilterList size={16} /> {subjectFilter || "Filter"}
                            </button>
                            {showFilterDrawer && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setShowFilterDrawer(false)} />
                                    <div className="absolute right-0 top-11 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl w-52 py-2 text-slate-700 text-xs font-semibold">
                                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Filter by Subject</div>
                                        <button
                                            onClick={() => { setSubjectFilter(""); setShowFilterDrawer(false); }}
                                            className={`w-full text-left px-4 py-2 hover:bg-slate-50 ${!subjectFilter ? "text-orange-500 font-bold" : ""}`}
                                        >
                                            All Subjects
                                        </button>
                                        {subjects.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setSubjectFilter(s); setShowFilterDrawer(false); }}
                                                className={`w-full text-left px-4 py-2 hover:bg-slate-50 ${subjectFilter === s ? "text-orange-500 font-bold" : ""}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* KANBAN BOARD 3 COLUMNS (REFERENCE REPLICA) */}
            {isLoading ? (
                <div className="flex justify-center pt-20"><Loader /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STATUS_COLUMNS.map(col => (
                        <div
                            key={col.key}
                            onDragOver={e => handleDragOver(e, col.key)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => handleDrop(e, col.key)}
                            className={`space-y-4 rounded-3xl p-2 transition-all duration-200 ${
                                dragOver === col.key ? "ring-2 ring-orange-400 bg-orange-50/50" : ""
                            }`}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900">{col.label}</h3>
                                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                                        {byStatus[col.key].length}
                                    </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                                    <MdMoreHoriz size={18} />
                                </button>
                            </div>

                            {/* Task Cards List */}
                            <div className="space-y-3.5 min-h-[300px]">
                                {byStatus[col.key].length === 0 ? (
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white/60">
                                        <p className="text-xs font-bold text-slate-400">
                                            {dragOver === col.key ? "Drop task here" : `No ${col.label.toLowerCase()} tasks`}
                                        </p>
                                    </div>
                                ) : (
                                    byStatus[col.key].map(task => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onDragStart={handleDragStart}
                                            onStatusChange={(t, st) => {
                                                if (st === "completed") {
                                                    setModal({ task: t, targetStatus: st });
                                                } else {
                                                    applyStatusChange(t, st, {});
                                                }
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentTaskBoard;
