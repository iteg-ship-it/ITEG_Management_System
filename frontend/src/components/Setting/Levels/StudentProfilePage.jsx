import { useParams, useNavigate } from "react-router-dom";
import { MdEmail, MdPhone, MdBook, MdTrendingUp, MdCheckCircleOutline, MdWorkOutline, MdSchool } from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import Loader from "../../common-components/loader/Loader";
import { useGetNewStudentByIdQuery } from "../../../redux/api/authApi";

/* ── Sub-components ── */
const StatCard = ({ label, value, sub, accent, onClick }) => (
    <div
        className={`bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200 transition-all' : ''}`}
        onClick={onClick}
    >
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className={`text-xl font-bold ${accent || "text-gray-800"}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
);

const ProgressBar = ({ label, value, color = "bg-orange-500" }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">{label}</span>
            <span className="text-xs font-semibold text-gray-700">{value}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const TimelineItem = ({ icon, title, sub, last }) => (
    <div className="flex gap-3">
        <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-500">{icon}</div>
            {!last && <div className="w-px flex-1 bg-gray-100 my-1" />}
        </div>
        <div className="pb-4">
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const StudentProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: studentRaw, isLoading, isError } = useGetNewStudentByIdQuery(id, { skip: !id });
    const student = studentRaw?.data;

    if (isLoading) return <Loader />;

    if (isError || !student) {
        return (
            <div className="p-10 text-center text-gray-400">
                <p className="text-lg font-semibold">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Go Back</button>
            </div>
        );
    }

    const name     = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "-";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const levelName    = student.currentLevelId?.name || "-";
    const subLevelName = student.currentSubLevelId?.name || "-";
    const academicHistory = student.academicHistory || [];
    const passedCount = academicHistory.filter(h => h.result === "Pass").length;

    return (
        <>
            <Header
                showBack={true}
                breadcrumbs={[
                    { label: "Departments",  path: "/department-management" },
                    { label: "Sub-Level",    path: -1 },
                    { label: name },
                ]}
            />

            <div className="px-6 py-6 space-y-6">

                {/* ── Profile Card ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-5">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {student.image ? (
                                <img src={student.image} alt={name} className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
                                    {initials}
                                </div>
                            )}
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                    {student.prkey || "-"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{student.course || "-"} • {levelName} / {subLevelName}</p>
                            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-4 ${
                                student.status === "Placed"    ? "bg-green-100 text-green-700"  :
                                student.status === "Active"    ? "bg-blue-100 text-blue-700"    :
                                student.status === "Dropped"   ? "bg-red-100 text-red-700"      :
                                student.status === "Completed" ? "bg-purple-100 text-purple-700":
                                "bg-gray-100 text-gray-600"
                            }`}>
                                {student.status?.toUpperCase() || "-"}
                            </span>
                            <div className="flex flex-wrap gap-5">
                                <span className="flex items-center gap-1.5 text-xs text-gray-500"><MdEmail size={14} className="text-orange-400" /> {student.email || "-"}</span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500"><MdPhone size={14} className="text-orange-400" /> {student.studentMobile || "-"}</span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500"><MdBook size={14} className="text-orange-400" /> {student.course || "-"}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => navigate(`/student/${id}/task-list`)}
                                className="px-4 py-2 text-sm font-semibold border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition"
                            >
                                Task Board
                            </button>
                            <button
                                onClick={() => navigate(`/student/edit/${id}`)}
                                className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Level History"
                        value={levelName}
                        sub={subLevelName}
                        accent="text-orange-500"
                    />
                    <StatCard
                        label="Report"
                        value="View"
                        sub="Student Report card"
                        accent="text-blue-500"
                        onClick={() => navigate(`/student/${id}/task-list`)}
                    />
                    <StatCard
                        label="Readiness"
                        value={student.readinessStatus || "-"}
                        sub="Placement readiness"
                        accent="text-green-600"
                    />
                    <StatCard
                        label="Performance"
                        value={passedCount > 0 ? `${passedCount} Passed` : "-"}
                        sub={`of ${academicHistory.length} records`}
                        accent="text-purple-600"
                    />
                </div>

                {/* ── Attendance Trend + Task Completion ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Attendance Trend */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Attendance Trend</h4>
                                <p className="text-xs text-gray-400">Monthly average attendance across all modules</p>
                            </div>
                            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white">
                                <option>Semester 1</option>
                                <option>Semester 2</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 h-32">
                            {[
                                { m: "Sep", v: 88 }, { m: "Oct", v: 92 }, { m: "Nov", v: 78 },
                                { m: "Dec", v: 95 }, { m: "Jan", v: 85 }, { m: "Feb", v: 90 },
                            ].map(({ m, v }) => (
                                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-500">{v}%</span>
                                    <div className="w-full rounded-t-md bg-orange-400" style={{ height: `${v}px` }} />
                                    <span className="text-xs text-gray-400">{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Completion */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Task Completion</h4>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="3"
                                        strokeDasharray={`${75 * 0.942} 94.2`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-500">75%</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Practical Lab Reports</p>
                                <p className="text-xs text-gray-400">12 of 16 completed</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <ProgressBar label="Assignment Progress" value={parseFloat(student.percent12) || 82} />
                            <ProgressBar label="Quiz Participation"  value={parseFloat(student.percent10) || 68} color="bg-blue-400" />
                            <ProgressBar label="Module Feedback"     value={90} color="bg-green-400" />
                        </div>
                    </div>
                </div>

                {/* ── Exam Performance + Academic Timeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Exam Performance */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-1">Exam Performance</h4>
                        <div className="flex gap-4 mb-4">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" /> Final Exam</span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-orange-200 inline-block" /> Midterm</span>
                        </div>
                        <div className="space-y-4">
                            {academicHistory.length > 0 ? (
                                academicHistory.map(({ yearName, percentage }, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-gray-600">{yearName || `Year ${i + 1}`}</span>
                                            <span className="text-xs font-semibold text-gray-700">{percentage ?? "-"}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 relative">
                                            <div className="h-2 rounded-full bg-orange-200" style={{ width: `${Math.min((percentage ?? 0) * 0.9, 100)}%` }} />
                                            <div className="h-2 rounded-full bg-orange-500 absolute top-0 left-0" style={{ width: `${Math.min(percentage ?? 0, 100)}%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [
                                    { sub: "Data Structures",  final: 95, mid: 88 },
                                    { sub: "Machine Learning", final: 82, mid: 75 },
                                    { sub: "Web Engineering",  final: 90, mid: 84 },
                                    { sub: "Cyber Security",   final: 74, mid: 70 },
                                ].map(({ sub, final, mid }) => (
                                    <div key={sub}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-gray-600">{sub}</span>
                                            <span className="text-xs font-semibold text-gray-700">{final}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 relative">
                                            <div className="h-2 rounded-full bg-orange-200" style={{ width: `${mid}%` }} />
                                            <div className="h-2 rounded-full bg-orange-500 absolute top-0 left-0" style={{ width: `${final}%` }} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Academic Timeline */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Academic Timeline</h4>
                        {academicHistory.length > 0 ? (
                            academicHistory.slice().reverse().map((entry, i, arr) => (
                                <TimelineItem
                                    key={i}
                                    icon={entry.result === "Pass" ? <MdCheckCircleOutline size={16} /> : <MdSchool size={16} />}
                                    title={`${entry.yearName || `Year ${i + 1}`} — ${entry.result || "-"}`}
                                    sub={`${entry.percentage ?? "-"}% • ${entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "-"}`}
                                    last={i === arr.length - 1}
                                />
                            ))
                        ) : (
                            <>
                                <TimelineItem icon={<MdWorkOutline size={16} />}        title={`Enrolled — ${student.sessionId?.name || "-"}`}   sub={`Session • ${student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "-"}`} />
                                <TimelineItem icon={<MdSchool size={16} />}             title={`Level: ${levelName}`}                              sub={`Sub-Level: ${subLevelName}`} />
                                <TimelineItem icon={<MdCheckCircleOutline size={16} />} title={`Status: ${student.status || "-"}`}                 sub={student.readinessStatus || "-"} />
                                <TimelineItem icon={<MdTrendingUp size={16} />}         title={`Course: ${student.course || "-"}`}                 sub={student.subDepartmentId?.name || "-"} last />
                            </>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default StudentProfilePage;
