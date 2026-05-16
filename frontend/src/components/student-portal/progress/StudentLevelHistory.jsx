import { useGetMyStudentLevelHistoryQuery, useGetMyStudentSnapshotsQuery } from "../../../redux/api/studentApi";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function StudentLevelHistory() {
    const { data: historyData, isLoading } = useGetMyStudentLevelHistoryQuery();
    const { data: snapshotData } = useGetMyStudentSnapshotsQuery();

    const history  = historyData?.data  || [];
    const snapshots = snapshotData?.data || [];
    const overallSnapshots = snapshots.filter(s => s.snapshotScope === "overall");

    if (isLoading) return <div className="flex justify-center pt-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Level History</h2>
                <p className="text-sm text-gray-500 mt-0.5">{history.length} levels tracked</p>
            </div>

            {/* Level Timeline */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Level Journey</h3>
                {history.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No level history found yet.</p>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                        <div className="space-y-5">
                            {history.map((item, i) => {
                                const isCurrent = item.status === "in_progress";
                                const pct = item.totalTasks > 0 ? Math.round((item.completedTasksCount / item.totalTasks) * 100) : 0;
                                return (
                                    <div key={item._id || i} className="flex items-start gap-4 pl-1">
                                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-1
                                            ${isCurrent ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`} />
                                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className={`text-sm font-bold ${isCurrent ? "text-blue-600" : "text-gray-800"}`}>
                                                        {item.levelId?.name || "Level"} – {item.subLevelId?.name || "Sub Level"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {isCurrent
                                                            ? `Started ${formatDate(item.startedAt)}`
                                                            : `Completed ${formatDate(item.completedAt)}`}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                                                    ${isCurrent ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                    {isCurrent ? "Current" : "Completed"}
                                                </span>
                                            </div>
                                            {item.totalTasks > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                                                        <span>{item.completedTasksCount}/{item.totalTasks} tasks</span>
                                                        <span>{pct}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${isCurrent ? "bg-blue-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Snapshots */}
            {overallSnapshots.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">Progress Snapshots</h3>
                    <div className="space-y-3">
                        {overallSnapshots.slice(0, 10).map((snap, i) => (
                            <div key={snap._id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{snap.levelName} – {snap.subLevelName}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{snap.subjectName || "Overall"} · {formatDate(snap.changedAt)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">{snap.completedTasks}/{snap.totalTasks}</p>
                                    <p className="text-[11px] text-gray-500">Avg {snap.averageMarks || 0}/5</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
