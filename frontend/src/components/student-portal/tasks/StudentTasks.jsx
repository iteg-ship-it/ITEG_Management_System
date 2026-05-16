import { useGetMyStudentTasksQuery } from "../../../redux/api/studentApi";
import { MdCheckCircle, MdAccessTime, MdStar, MdStarBorder, MdFlag, MdTimeline } from "react-icons/md";

const STATUS_COLS = [
    { key: "pending",    label: "On Hold",      dot: "bg-slate-400",  bg: "bg-slate-50",    accent: "slate" },
    { key: "inProgress", label: "Active Ops",   dot: "bg-blue-600",   bg: "bg-blue-50/50",  accent: "blue"  },
    { key: "completed",  label: "Mission Done", dot: "bg-green-600",  bg: "bg-green-50/50", accent: "green" },
];

export default function StudentTasks() {
    const { data: taskRes, isLoading } = useGetMyStudentTasksQuery();
    const taskData = taskRes?.data || taskRes || {};

    const allTasks = Object.values(taskData.groupedBySubject || {}).flatMap(g => g.tasks || []);
    const byStatus = {
        pending:    allTasks.filter(t => t.status === "pending"),
        inProgress: allTasks.filter(t => t.status === "inProgress"),
        completed:  allTasks.filter(t => t.status === "completed"),
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center pt-32">
            <div className="w-16 h-16 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-600/20" />
            <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Mission Data</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Task Board</h2>
                    <p className="text-[11px] font-black text-blue-600 mt-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {taskData.totalTasks || 0} Total Assets Tracked
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completion rate</p>
                        <p className="text-xl font-black text-slate-900">{Math.round((taskData.completedTasks / taskData.totalTasks) * 100) || 0}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {STATUS_COLS.map(col => (
                    <div key={col.key} className={`rounded-[32px] p-5 min-h-[300px] border border-slate-100/50 ${col.bg} backdrop-blur-sm transition-all duration-300`}>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${col.dot} shadow-lg shadow-${col.accent}-600/20 animate-pulse`} />
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{col.label}</h3>
                            </div>
                            <span className="text-[10px] font-black px-4 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-600 uppercase tracking-widest">
                                {byStatus[col.key].length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {byStatus[col.key].length === 0 ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-white/50 backdrop-blur-sm">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center mb-4 text-slate-300">
                                        <MdFlag size={24} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone Clear</p>
                                </div>
                            ) : byStatus[col.key].map(task => (
                                <div key={task._id} className="bg-white rounded-[28px] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <MdTimeline size={18} />
                                        </div>
                                        <div className="px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            {task.subjectName?.slice(0, 10)}
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-slate-800 mb-2 leading-tight uppercase tracking-tight">{task.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 line-clamp-2 leading-relaxed italic">
                                        {task.topicName || "System generated operational objective"}
                                    </p>
                                    
                                    {(task.status === "completed" || task.marks != null) && (
                                        <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    i <= (task.marks || 0)
                                                        ? <MdStar key={i} size={14} className="text-yellow-400" />
                                                        : <MdStarBorder key={i} size={14} className="text-slate-200" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                {task.marks || 0}/{task.maxMarks || 5} <span className="text-slate-300 ml-1 font-bold">CR</span>
                                            </span>
                                        </div>
                                    )}

                                    {task.status !== "completed" && (
                                        <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-300 text-[9px] font-black uppercase tracking-widest">
                                                <MdAccessTime size={14} />
                                                In Queue
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
