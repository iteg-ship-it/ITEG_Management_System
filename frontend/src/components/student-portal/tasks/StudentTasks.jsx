import { useState } from "react";
import { useGetMyStudentTasksQuery } from "../../../redux/api/studentApi";
import { MdStar, MdStarBorder, MdAssignment, MdCheckCircle, MdAccessTime, MdSearch } from "react-icons/md";

const STATUS_COLS = [
    { key: "pending",    label: "Pending",     dot: "bg-gray-400",   colBg: "bg-gray-50",   border: "border-gray-200",  badge: "bg-gray-100 text-gray-600",   emptyIcon: "text-gray-300" },
    { key: "inProgress", label: "In Progress", dot: "bg-blue-400",   colBg: "bg-blue-50",   border: "border-blue-100",  badge: "bg-blue-100 text-blue-600",   emptyIcon: "text-blue-200" },
    { key: "completed",  label: "Completed",   dot: "bg-green-400",  colBg: "bg-green-50",  border: "border-green-100", badge: "bg-green-100 text-green-600", emptyIcon: "text-green-200" },
];

export default function StudentTasks() {
    const { data: taskData, isLoading } = useGetMyStudentTasksQuery();
    const [search, setSearch] = useState("");
    const [activeSubject, setActiveSubject] = useState("All");

    const subjectGroups = taskData?.groupedBySubject || {};
    const allSubjects   = Object.keys(subjectGroups);
    const allTasks      = Object.values(subjectGroups).flatMap(g => g.tasks || []);

    const filtered = allTasks.filter(t => {
        const matchSearch  = t.title?.toLowerCase().includes(search.toLowerCase()) ||
                             t.subjectName?.toLowerCase().includes(search.toLowerCase());
        const matchSubject = activeSubject === "All" || t.subjectName === activeSubject;
        return matchSearch && matchSubject;
    });

    const byStatus = {
        pending:    filtered.filter(t => t.status === "pending"),
        inProgress: filtered.filter(t => t.status === "inProgress"),
        completed:  filtered.filter(t => t.status === "completed"),
    };

    const totalTasks     = taskData?.totalTasks     || 0;
    const completedTasks = taskData?.completedTasks || 0;
    const pendingTasks   = taskData?.pendingTasks   || 0;
    const taskPct        = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const evaluated = allTasks.filter(t => typeof t.marks === "number");
    const avgMarks  = evaluated.length > 0
        ? (evaluated.reduce((s, t) => s + t.marks, 0) / evaluated.length).toFixed(1)
        : null;

    if (isLoading) return (
        <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1.5 w-full bg-orange-500" />
                <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">My Tasks</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{totalTasks} total · {completedTasks} completed · {pendingTasks} pending</p>
                        </div>
                        {/* search */}
                        <div className="relative">
                            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search tasks..."
                                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50 w-56 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Stat pills */}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span className="text-xs font-bold text-orange-600">{taskPct}% Complete</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100">
                            <MdCheckCircle size={12} className="text-green-500" />
                            <span className="text-xs font-bold text-green-600">{completedTasks} Done</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                            <MdAccessTime size={12} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">{pendingTasks} Pending</span>
                        </div>
                        {avgMarks && (
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-50 border border-yellow-100">
                                <MdStar size={12} className="text-yellow-500" />
                                <span className="text-xs font-bold text-yellow-600">Avg {avgMarks}/5</span>
                            </div>
                        )}
                        {/* progress bar */}
                        <div className="flex-1 min-w-[120px]">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-orange-400 transition-all duration-700" style={{ width: `${taskPct}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Subject Filter ── */}
            {allSubjects.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {["All", ...allSubjects].map(subj => (
                        <button
                            key={subj}
                            onClick={() => setActiveSubject(subj)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-150 ${
                                activeSubject === subj
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                            }`}
                        >
                            {subj}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Kanban Columns ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_COLS.map(col => (
                    <div key={col.key} className={`rounded-2xl border ${col.border} ${col.colBg} p-3`}>

                        {/* Column header */}
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                            <h3 className="text-sm font-bold text-gray-700">{col.label}</h3>
                            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                                {byStatus[col.key].length}
                            </span>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2.5">
                            {byStatus[col.key].length === 0 ? (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-8 bg-white/60">
                                    <MdAssignment size={24} className={col.emptyIcon} />
                                    <p className="text-xs text-gray-400 mt-2">No {col.label.toLowerCase()} tasks</p>
                                </div>
                            ) : byStatus[col.key].map(task => (
                                <TaskCard key={task._id} task={task} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TaskCard({ task }) {
    const max = task.maxMarks || 5;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200">
            {/* Subject tag */}
            {task.subjectName && (
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 mb-2">
                    {task.subjectName}
                </span>
            )}

            <p className="text-sm font-bold text-gray-800 leading-snug">{task.title}</p>

            {task.topicName && (
                <p className="text-[11px] text-gray-400 mt-1">
                    › {task.topicName}
                </p>
            )}

            {/* Marks */}
            {task.status === "completed" && task.marks != null && (
                <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-50">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: max }, (_, i) => (
                            i < task.marks
                                ? <MdStar key={i} size={13} className="text-orange-400" />
                                : <MdStarBorder key={i} size={13} className="text-gray-200" />
                        ))}
                    </div>
                    <span className="ml-1.5 text-xs font-bold text-gray-600">{task.marks}<span className="text-gray-400 font-normal">/{max}</span></span>
                </div>
            )}
        </div>
    );
}
