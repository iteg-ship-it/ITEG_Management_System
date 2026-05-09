import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    MdCheckCircle, MdRadioButtonUnchecked, MdAccessTime,
    MdCalendarToday, MdArrowBack, MdClose, MdStar, MdStarBorder
} from "react-icons/md";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { useGetNewStudentTasksQuery } from "../../../redux/api/authApi";
import Loader from "../../common-components/loader/Loader";

const SECRET_KEY = "ITEG@123";
const getToken = () => {
    try {
        const enc = localStorage.getItem("token");
        if (!enc) return "";
        return CryptoJS.AES.decrypt(enc, SECRET_KEY).toString(CryptoJS.enc.Utf8) || "";
    } catch { return ""; }
};

const PRIORITY_STYLES = {
    high:   "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-600",
    low:    "bg-green-100 text-green-600",
};

const STATUS_COLUMNS = [
    { key: "pending",    label: "Pending",     color: "text-gray-700",  dot: "bg-gray-400",  bg: "bg-gray-50"   },
    { key: "inProgress", label: "In Progress", color: "text-blue-700",  dot: "bg-blue-400",  bg: "bg-blue-50"   },
    { key: "completed",  label: "Completed",   color: "text-green-700", dot: "bg-green-400", bg: "bg-green-50"  },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">Complete Task</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.title}</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                        <MdClose size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Marks */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Marks <span className="text-red-400">*</span>
                            <span className="ml-1 text-xs font-normal text-gray-400">(out of {maxMarks})</span>
                        </label>

                        {/* Star Rating for maxMarks <= 5 */}
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
                                            ? <MdStar size={32} className="text-orange-400" />
                                            : <MdStarBorder size={32} className="text-gray-300" />
                                        }
                                    </button>
                                ))}
                                {marks !== "" && (
                                    <span className="ml-2 text-sm font-bold text-orange-500">{marks}/{maxMarks}</span>
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
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                            />
                        )}
                    </div>

                    {/* Remark */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Remark <span className="text-xs font-normal text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                            placeholder="Add a remark about this task..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 pb-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || marks === ""}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                        ) : (
                            <><MdCheckCircle size={16} /> Mark Complete</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onDragStart }) => {
    const priority    = task.priority || "medium";
    const isCompleted = task.status === "completed";

    return (
        <div
            draggable
            onDragStart={() => onDragStart(task)}
            className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing select-none
                ${isCompleted ? "border-green-200" : "border-gray-200"}`}
        >
            {/* Priority + Status */}
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}`}>
                    {priority}
                </span>
                {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <MdCheckCircle size={13} /> Done
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                        <MdRadioButtonUnchecked size={13} />
                        {task.status === "inProgress" ? "In Progress" : "Pending"}
                    </span>
                )}
            </div>

            {/* Title */}
            <h4 className={`text-sm font-bold text-gray-800 mb-1 leading-snug ${isCompleted ? "line-through text-gray-400" : ""}`}>
                {task.title}
            </h4>

            {/* Subject › Topic */}
            {(task.subjectName || task.topicName) && (
                <p className="text-xs text-gray-400 mb-2">
                    {task.subjectName}{task.topicName ? ` › ${task.topicName}` : ""}
                </p>
            )}

            {/* Description */}
            {task.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
            )}

            {/* Marks stars for completed */}
            {isCompleted && task.marks != null && (
                <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: task.maxMarks || 5 }, (_, i) => (
                        i < task.marks
                            ? <MdStar key={i} size={14} className="text-orange-400" />
                            : <MdStarBorder key={i} size={14} className="text-gray-300" />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">{task.marks}/{task.maxMarks || 5}</span>
                </div>
            )}

            {/* Remark for completed */}
            {isCompleted && task.notes && (
                <p className="text-xs text-gray-400 italic mb-2 line-clamp-1">"{task.notes}"</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    {task.dueDate ? (
                        <><MdCalendarToday size={11} /> {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                    ) : task.timeDays ? (
                        <><MdAccessTime size={11} /> {task.timeDays}d</>
                    ) : <span className="text-gray-300">No deadline</span>}
                </div>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                    ${isCompleted ? "bg-green-400" : task.status === "inProgress" ? "bg-blue-400" : "bg-gray-300"}`}>
                    {task.type?.[0]?.toUpperCase() || "T"}
                </span>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const StudentTaskBoard = () => {
    const location   = useLocation();
    const navigate   = useNavigate();
    const { student, level, subdepartment } = location.state || {};

    const [search,       setSearch]       = useState("");
    const [tasks,        setTasks]        = useState(null);
    const [dragTask,     setDragTask]     = useState(null);
    const [dragOver,     setDragOver]     = useState(null);
    const [modal,        setModal]        = useState(null);
    const [saving,       setSaving]       = useState(false);

    const { data, isLoading, refetch } = useGetNewStudentTasksQuery(
        { id: student?._id },
        { skip: !student?._id }
    );

    // Use local tasks if set (optimistic), else from API
    const allTasks = tasks
        ?? Object.values(data?.groupedBySubject || {}).flatMap(g => g.tasks || []);

    const filtered = allTasks.filter(t =>
        !search ||
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
        t.topicName?.toLowerCase().includes(search.toLowerCase())
    );

    const byStatus = {
        pending:    filtered.filter(t => t.status === "pending"),
        inProgress: filtered.filter(t => t.status === "inProgress"),
        completed:  filtered.filter(t => t.status === "completed"),
    };

    const total     = allTasks.length;
    const completed = allTasks.filter(t => t.status === "completed").length;
    const percent   = total > 0 ? Math.round((completed / total) * 100) : 0;

    // ── Drag handlers ──
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
            // Show modal for marks + remark
            setModal({ task: dragTask, targetStatus });
        } else {
            // Direct status change (pending ↔ inProgress)
            applyStatusChange(dragTask, targetStatus, {});
        }
        setDragTask(null);
    };

    // ── API call ──
    const applyStatusChange = async (task, newStatus, extra) => {
        const studentId = student._id;
        const taskId    = task.taskId || task._id;

        // Optimistic update
        const updated = allTasks.map(t =>
            t._id === task._id ? { ...t, status: newStatus, ...extra } : t
        );
        setTasks(updated);

        setSaving(true);
        try {
            const body = { status: newStatus, ...extra };
            await fetch(
                `${import.meta.env.VITE_API_URL}/syllabus/versions/students/${studentId}/tasks/${taskId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(body)
                }
            ).then(async r => {
                if (!r.ok) {
                    const err = await r.json();
                    throw new Error(err.message || "Update failed");
                }
                return r.json();
            });

            toast.success(`Task moved to ${newStatus === "inProgress" ? "In Progress" : newStatus}`);
            // Refetch to sync
            const fresh = await refetch();
            if (fresh?.data) setTasks(null); // clear optimistic, use fresh
        } catch (err) {
            toast.error(err.message || "Failed to update task");
            setTasks(null); // revert optimistic
        } finally {
            setSaving(false);
        }
    };

    // ── Modal confirm ──
    const handleModalConfirm = async ({ marks, notes }) => {
        setSaving(true);
        await applyStatusChange(modal.task, "completed", { marks, notes });
        setModal(null);
        setSaving(false);
    };

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-3 text-orange-500 text-sm font-semibold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F7F5]">

            {/* Completion Modal */}
            {modal && (
                <CompletionModal
                    task={modal.task}
                    onConfirm={handleModalConfirm}
                    onCancel={() => { setModal(null); setDragTask(null); }}
                    loading={saving}
                />
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                            <MdArrowBack size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-800">{student.firstName} {student.lastName}</h1>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-500">ID: {student.prkey}</span>
                                    <span className="text-xs text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">{level?.name || "Level"}</span>
                                    {subdepartment?.name && (
                                        <>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{subdepartment.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 h-9 px-3 border border-gray-200 rounded-lg bg-white w-56">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="flex-1 text-sm bg-transparent outline-none text-gray-600 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {completed}/{total} completed ({percent}%)
                    </span>
                </div>

                {saving && (
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        Saving changes...
                    </p>
                )}
            </div>

            {/* Drag hint */}
            <div className="px-6 pt-4">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                    💡 Drag and drop tasks between columns to update status. Completing a task requires marks.
                </p>
            </div>

            {/* Board */}
            {isLoading ? (
                <div className="flex justify-center pt-20"><Loader /></div>
            ) : (
                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {STATUS_COLUMNS.map(col => (
                        <div
                            key={col.key}
                            onDragOver={e => handleDragOver(e, col.key)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => handleDrop(e, col.key)}
                            className={`rounded-2xl p-3 min-h-[200px] transition-all duration-200
                                ${dragOver === col.key ? "ring-2 ring-orange-400 bg-orange-50/60" : col.bg}`}
                        >
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-4 px-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                                <h3 className={`text-sm font-bold ${col.color}`}>{col.label}</h3>
                                <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-sm text-gray-600">
                                    {byStatus[col.key].length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3">
                                {byStatus[col.key].length === 0 ? (
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition
                                        ${dragOver === col.key ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white/50"}`}>
                                        <p className="text-xs text-gray-400">
                                            {dragOver === col.key ? "Drop here" : `No ${col.label.toLowerCase()} tasks`}
                                        </p>
                                    </div>
                                ) : (
                                    byStatus[col.key].map(task => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            onDragStart={handleDragStart}
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
