import { useNavigate } from "react-router-dom";
import { useGetMyStudentTasksQuery } from "../../../redux/api/studentApi";
import { MdCheckCircle, MdAccessTime, MdStar, MdStarBorder } from "react-icons/md";

const STATUS_COLS = [
    { key: "pending",    label: "Pending",     dot: "bg-gray-400",  bg: "bg-gray-50"  },
    { key: "inProgress", label: "In Progress", dot: "bg-blue-400",  bg: "bg-blue-50"  },
    { key: "completed",  label: "Completed",   dot: "bg-green-400", bg: "bg-green-50" },
];

export default function StudentTasks() {
    const { data: taskData, isLoading } = useGetMyStudentTasksQuery();

    const allTasks = Object.values(taskData?.groupedBySubject || {}).flatMap(g => g.tasks || []);
    const byStatus = {
        pending:    allTasks.filter(t => t.status === "pending"),
        inProgress: allTasks.filter(t => t.status === "inProgress"),
        completed:  allTasks.filter(t => t.status === "completed"),
    };

    if (isLoading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900">My Tasks</h2>
                <p className="text-sm text-gray-500 mt-0.5">{taskData?.totalTasks || 0} total · {taskData?.completedTasks || 0} completed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_COLS.map(col => (
                    <div key={col.key} className={`rounded-2xl p-3 min-h-[200px] ${col.bg}`}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                            <h3 className="text-sm font-bold text-gray-700">{col.label}</h3>
                            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-sm text-gray-600">{byStatus[col.key].length}</span>
                        </div>
                        <div className="space-y-3">
                            {byStatus[col.key].length === 0 ? (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-white/50">
                                    <p className="text-xs text-gray-400">No {col.label.toLowerCase()} tasks</p>
                                </div>
                            ) : byStatus[col.key].map(task => (
                                <div key={task._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                    <p className="text-sm font-bold text-gray-800 mb-1">{task.title}</p>
                                    {task.subjectName && <p className="text-xs text-gray-400 mb-2">{task.subjectName}{task.topicName ? ` › ${task.topicName}` : ""}</p>}
                                    {task.status === "completed" && task.marks != null && (
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: task.maxMarks || 5 }, (_, i) => (
                                                i < task.marks
                                                    ? <MdStar key={i} size={14} className="text-orange-400" />
                                                    : <MdStarBorder key={i} size={14} className="text-gray-300" />
                                            ))}
                                            <span className="ml-1 text-xs text-gray-500">{task.marks}/{task.maxMarks || 5}</span>
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
