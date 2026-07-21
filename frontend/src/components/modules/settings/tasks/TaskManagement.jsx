import { useMemo, useState } from "react";
import {
    MdMoreVert, MdSearch, MdNotificationsNone, MdAdd, MdRefresh,
    MdCheckCircle, MdCancel, MdChevronLeft, MdChevronRight, MdFilterList
} from "react-icons/md";
import { toast } from "react-toastify";
import Header from "../../../shared/sidebar/Header";
import {
    useDeleteTaskMutation,
    useGetAllTasksQuery,
} from "../../../../redux/api/authApi";

const getOptionValues = (items, key) => (
    [...new Set(items.map((item) => item[key]).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b)))
);

const formatValue = (value) => {
    if (!value) return "-";
    return String(value)
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const PriorityPill = ({ priority }) => {
    const p = String(priority).toLowerCase();
    let cls = "bg-slate-100 text-slate-600 border-slate-200";
    if (p === "high") cls = "bg-rose-50 text-rose-600 border-rose-100 font-extrabold";
    if (p === "medium") cls = "bg-amber-50 text-amber-600 border-amber-100 font-bold";
    if (p === "low") cls = "bg-emerald-50 text-emerald-600 border-emerald-100 font-bold";

    return (
        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cls}`}>
            {formatValue(priority)}
        </span>
    );
};

const ActionMenu = ({ task, onDelete }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative flex justify-end">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((p) => !p);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
                <MdMoreVert size={18} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-8 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl w-36 py-1.5 overflow-hidden text-xs font-semibold text-slate-700">
                        <button
                            onClick={() => setOpen(false)}
                            className="w-full px-4 py-2 text-left transition text-slate-300 cursor-not-allowed"
                            disabled
                        >
                            Edit Task
                        </button>
                        <button
                            onClick={() => {
                                setOpen(false);
                                onDelete(task);
                            }}
                            className="w-full px-4 py-2 text-left transition text-rose-600 hover:bg-rose-50 font-bold"
                        >
                            Delete Task
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const TaskManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterSession, setFilterSession] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [filterSub, setFilterSub] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [filterSubLevel, setFilterSubLevel] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const { data: tasksResponse, isLoading, isFetching, isError, refetch } = useGetAllTasksQuery({ status: "all" });
    const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

    const taskRows = useMemo(() => {
        const tasks = tasksResponse?.data || [];
        return tasks.map((task) => {
            const context = task.context || {};
            return {
                id: task._id,
                academicYear: context.academicYear || "-",
                session: context.session?.name || "-",
                department: context.department?.name || "-",
                subDept: context.subDepartment?.name || "-",
                level: context.level?.name || "-",
                subLevel: context.subLevel?.name || "-",
                taskTitle: task.title || "-",
                subject: task.subjectName || "General",
                topic: task.topicName || "",
                priority: task.priority || "medium",
                status: task.isActive ? "active" : "inactive",
                type: task.type || "assignment",
                createdAt: task.createdAt,
                raw: task,
            };
        });
    }, [tasksResponse]);

    const years = getOptionValues(taskRows, "academicYear").filter((v) => v !== "-");
    const sessions = getOptionValues(taskRows, "session").filter((v) => v !== "-");
    const depts = getOptionValues(taskRows, "department").filter((v) => v !== "-");
    const subDepts = getOptionValues(taskRows, "subDept").filter((v) => v !== "-");
    const levels = getOptionValues(taskRows, "level").filter((v) => v !== "-");
    const subLevels = getOptionValues(taskRows, "subLevel").filter((v) => v !== "-");

    const filtered = useMemo(() => {
        return taskRows.filter((task) => {
            const q = searchTerm.trim().toLowerCase();
            const searchable = [
                task.taskTitle,
                task.subject,
                task.topic,
                task.department,
                task.subDept,
                task.id,
            ].join(" ").toLowerCase();

            return (
                (!q || searchable.includes(q)) &&
                (!filterYear || task.academicYear === filterYear) &&
                (!filterSession || task.session === filterSession) &&
                (!filterDept || task.department === filterDept) &&
                (!filterSub || task.subDept === filterSub) &&
                (!filterLevel || task.level === filterLevel) &&
                (!filterSubLevel || task.subLevel === filterSubLevel) &&
                (!filterPriority || task.priority === filterPriority) &&
                (!filterStatus || task.status === filterStatus)
            );
        });
    }, [taskRows, searchTerm, filterYear, filterSession, filterDept, filterSub, filterLevel, filterSubLevel, filterPriority, filterStatus]);

    const resetFilters = () => {
        setSearchTerm("");
        setFilterYear("");
        setFilterSession("");
        setFilterDept("");
        setFilterSub("");
        setFilterLevel("");
        setFilterSubLevel("");
        setFilterPriority("");
        setFilterStatus("");
        setCurrentPage(1);
    };

    const handleDelete = async (task) => {
        if (!task?.id || deleting) return;
        if (!window.confirm(`Delete task "${task.taskTitle}"?`)) return;

        try {
            await deleteTask(task.id).unwrap();
            toast.success("Task deleted successfully");
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete task");
        }
    };

    const hasActiveFilters = Boolean(
        searchTerm || filterYear || filterSession || filterDept || filterSub || filterLevel || filterSubLevel || filterPriority || filterStatus
    );

    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="bg-[#F8F9FA] min-h-screen px-8 py-6 space-y-6">

            {/* TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Management</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Manage all exams & tasks across departments and levels
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refetch}
                        className="h-10 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
                    >
                        <MdRefresh size={18} className={isFetching ? "animate-spin" : ""} /> Refresh Tasks
                    </button>
                    <button
                        type="button"
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all relative flex-shrink-0"
                        title="Notifications"
                    >
                        <MdNotificationsNone size={19} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
                    </button>
                </div>
            </div>

            {/* FILTER CARD CONTAINER (EXACT REFERENCE UI REPLICA) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                {/* Row 1 Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* SEARCH INPUT */}
                    <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SEARCH</label>
                        <div className="flex items-center h-10 w-full bg-slate-100/60 border border-slate-200/80 rounded-xl px-3.5 shadow-sm hover:border-slate-300 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
                            <MdSearch className="text-slate-400 flex-shrink-0 mr-2" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                placeholder="Search exams or subjects..."
                                className="w-full h-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus:border-none text-xs font-medium text-slate-800 placeholder-slate-400 p-0 shadow-none"
                            />
                        </div>
                    </div>

                    {/* ACADEMIC YEAR */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">ACADEMIC YEAR</label>
                        <select
                            value={filterYear}
                            onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Years</option>
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* DEPARTMENT */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">DEPARTMENT</label>
                        <select
                            value={filterDept}
                            onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Departments</option>
                            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* LEVEL */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">LEVEL</label>
                        <select
                            value={filterLevel}
                            onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Levels</option>
                            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* STATUS */}
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">STATUS</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Disabled</option>
                        </select>
                    </div>
                </div>

                {/* Row 2 Secondary Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-slate-100">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SUB-DEPARTMENT</label>
                        <select
                            value={filterSub}
                            onChange={(e) => { setFilterSub(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Sub-Depts</option>
                            {subDepts.map((sd) => <option key={sd} value={sd}>{sd}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SUB-LEVEL</label>
                        <select
                            value={filterSubLevel}
                            onChange={(e) => { setFilterSubLevel(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Sub-Levels</option>
                            {subLevels.map((sl) => <option key={sl} value={sl}>{sl}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">SESSION</label>
                        <select
                            value={filterSession}
                            onChange={(e) => { setFilterSession(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Sessions</option>
                            {sessions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">PRIORITY</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                            className="w-full h-10 px-3 bg-slate-100/60 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:bg-white shadow-sm cursor-pointer transition"
                        >
                            <option value="">All Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                {/* Reset Filters Link */}
                <div className="pt-1 flex items-center">
                    <button
                        onClick={resetFilters}
                        className="text-xs font-extrabold text-orange-500 hover:text-orange-600 transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <MdRefresh size={16} /> Reset Filters
                    </button>
                </div>
            </div>

            {/* DATA TABLE CONTAINER (EXACT REFERENCE REPLICA) */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-20 text-center text-xs font-semibold text-slate-400">Loading tasks database...</div>
                ) : isError ? (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-xs font-bold text-rose-500">Failed to load tasks records</p>
                        <button onClick={refetch} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm">
                            Retry Loading
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                        <th className="py-4 px-6">DEPARTMENT & SUB</th>
                                        <th className="py-4 px-4">LEVEL</th>
                                        <th className="py-4 px-6">TASK TITLE</th>
                                        <th className="py-4 px-6">TYPE / SUBJECT</th>
                                        <th className="py-4 px-4">PRIORITY</th>
                                        <th className="py-4 px-4">SESSION</th>
                                        <th className="py-4 px-4">STATUS</th>
                                        <th className="py-4 px-6 text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50/80 transition">
                                                {/* Dept & Sub */}
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-900">{r.department}</div>
                                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{r.subDept}</div>
                                                </td>

                                                {/* Level Badge */}
                                                <td className="py-4 px-4">
                                                    <span className="inline-block bg-blue-50 text-blue-600 border border-blue-100 font-extrabold text-[10px] px-2.5 py-1 rounded-md uppercase text-center whitespace-nowrap">
                                                        {r.level} ({r.subLevel})
                                                    </span>
                                                </td>

                                                {/* Task Title */}
                                                <td className="py-4 px-6">
                                                    <div className="font-extrabold text-slate-900 text-sm line-clamp-1">{r.taskTitle}</div>
                                                </td>

                                                {/* Type / Subject */}
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-800">{formatValue(r.type)}</div>
                                                    <div className="text-[11px] font-extrabold text-orange-500 mt-0.5">{r.subject}</div>
                                                </td>

                                                {/* Priority */}
                                                <td className="py-4 px-4">
                                                    <PriorityPill priority={r.priority} />
                                                </td>

                                                {/* Session */}
                                                <td className="py-4 px-4 text-slate-500 font-medium">
                                                    {r.session}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-4">
                                                    {r.status === "active" ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-[11px] px-3 py-1 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[11px] px-3 py-1 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Disabled
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action Menu */}
                                                <td className="py-4 px-6 text-right">
                                                    <ActionMenu task={r} onDelete={handleDelete} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400">
                                                No task records matching selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TABLE FOOTER / PAGINATION ROW */}
                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                            <div>
                                Showing {filtered.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length} entries
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 font-bold"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        onClick={() => setCurrentPage(pg)}
                                        className={`w-8 h-8 rounded-xl font-bold transition text-xs ${
                                            currentPage === pg
                                                ? "bg-orange-500 text-white shadow-sm"
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-700 font-bold"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default TaskManagement;
