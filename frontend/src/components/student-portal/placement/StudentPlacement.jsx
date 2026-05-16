import { useGetMyPlacementQuery, useGetMyStudentProfileQuery } from "../../../redux/api/studentApi";
import { MdWork, MdCheckCircle, MdAccessTime, MdBusiness } from "react-icons/md";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusBadge = (s = "") => {
    const n = s.toLowerCase();
    if (["selected", "placed", "joined"].includes(n)) return "bg-green-50 text-green-600";
    if (["scheduled", "ongoing", "rescheduled"].includes(n)) return "bg-blue-50 text-blue-600";
    if (["rejectedbycompany", "rejectedbystudent"].includes(n)) return "bg-red-50 text-red-500";
    return "bg-gray-50 text-gray-600";
};

const readinessColor = (s = "") => {
    if (s === "Ready for Interview") return "text-green-600 bg-green-50 border-green-200";
    if (s === "Ready")               return "text-blue-600 bg-blue-50 border-blue-200";
    if (s === "In Progress")         return "text-orange-500 bg-orange-50 border-orange-200";
    return "text-gray-500 bg-gray-50 border-gray-200";
};

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs font-semibold text-gray-800">{value || "—"}</p>
    </div>
);

export default function StudentPlacement() {
    const { data: placementRes } = useGetMyPlacementQuery();
    const { data: profileRes }   = useGetMyStudentProfileQuery();

    const placement    = placementRes?.data || profileRes?.data?.placement || {};
    const placedInfo   = placement.placedInfo || {};
    const interviews   = placement.PlacementinterviewRecord || [];
    const readiness    = placement.readinessStatus || "Not Ready";
    const isPlaced     = !!placedInfo.companyName;

    return (
        <div className="space-y-5 max-w-2xl">
            <h2 className="text-lg font-bold text-gray-900">Placement</h2>

            {/* Readiness Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800">Placement Readiness</h3>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${readinessColor(readiness)}`}>
                        {readiness}
                    </span>
                </div>

                {/* Readiness Steps */}
                <div className="flex items-center gap-2">
                    {["Not Ready", "In Progress", "Ready", "Ready for Interview"].map((step, i, arr) => {
                        const steps = ["Not Ready", "In Progress", "Ready", "Ready for Interview"];
                        const currentIdx = steps.indexOf(readiness);
                        const stepIdx    = steps.indexOf(step);
                        const done       = stepIdx < currentIdx;
                        const active     = stepIdx === currentIdx;
                        return (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex-1 flex flex-col items-center`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                                        done   ? "bg-green-500 border-green-500 text-white" :
                                        active ? "bg-blue-500 border-blue-500 text-white" :
                                                 "bg-white border-gray-300 text-gray-400"
                                    }`}>
                                        {done ? <MdCheckCircle size={12} /> : i + 1}
                                    </div>
                                    <p className={`text-[9px] mt-1 text-center font-semibold ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                                        {step.replace("Ready for Interview", "Interview Ready")}
                                    </p>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className={`h-px flex-1 mx-1 ${stepIdx < currentIdx ? "bg-green-400" : "bg-gray-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Placed Info */}
            {isPlaced && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <MdWork size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-800">Placed at {placedInfo.companyName}</p>
                            <p className="text-xs text-green-600">{placedInfo.jobProfile} · {placedInfo.jobType}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <InfoRow label="Location"     value={placedInfo.location} />
                        <InfoRow label="Joining Date" value={formatDate(placedInfo.joiningDate)} />
                        <InfoRow label="Placed On"    value={formatDate(placedInfo.placedDate)} />
                    </div>
                </div>
            )}

            {/* Interview History */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Interview History</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{interviews.length} record{interviews.length !== 1 ? "s" : ""}</p>
                </div>

                {interviews.length === 0 ? (
                    <div className="text-center py-10">
                        <MdBusiness size={32} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">No interview records yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {interviews.map((rec, i) => (
                            <div key={rec._id || i} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{rec.jobProfile || "Interview"}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Scheduled: {formatDate(rec.scheduleDate)}
                                            {rec.rescheduleDate ? ` · Rescheduled: ${formatDate(rec.rescheduleDate)}` : ""}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusBadge(rec.status)}`}>
                                        {rec.status}
                                    </span>
                                </div>

                                {/* Rounds */}
                                {rec.rounds?.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        {rec.rounds.map((round, j) => (
                                            <div key={j} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700">{round.roundName}</p>
                                                    <p className="text-[11px] text-gray-400">{formatDate(round.date)} · {round.mode}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(round.result)}`}>
                                                    {round.result}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resume */}
            {placement.resumeURL && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-800">Resume</p>
                        <p className="text-xs text-gray-500 mt-0.5">Your uploaded resume</p>
                    </div>
                    <button onClick={() => window.open(placement.resumeURL, "_blank")}
                        className="text-sm font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition">
                        View Resume
                    </button>
                </div>
            )}
        </div>
    );
}
