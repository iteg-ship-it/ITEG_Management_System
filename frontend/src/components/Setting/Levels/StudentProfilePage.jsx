import { useLocation, useNavigate } from "react-router-dom";
import {
    MdEmail, MdPhone, MdBook, MdArrowBack, MdCheckCircle,
    MdRadioButtonUnchecked, MdAccessTime, MdTableChart,
    MdPerson, MdSchool, MdWork, MdStar, MdStarBorder, MdStarHalf
} from "react-icons/md";
import Header from "../../common-components/sidebar/Header";

// ── Helpers ───────────────────────────────────────────────────
const Badge = ({ label, color = "orange" }) => {
    const map = {
        orange: "bg-orange-100 text-orange-600",
        green:  "bg-green-100 text-green-700",
        blue:   "bg-blue-100 text-blue-700",
        red:    "bg-red-100 text-red-600",
        purple: "bg-purple-100 text-purple-700",
        gray:   "bg-gray-100 text-gray-600",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${map[color] || map.gray}`}>{label}</span>;
};

const StatCard = ({ label, value, sub, accent = "text-gray-800", icon }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
        {icon && <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500">{icon}</div>}
        <div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className={`text-lg font-bold ${accent}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const ProgressBar = ({ label, value, color = "bg-orange-500", showValue = true }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">{label}</span>
            {showValue && <span className="text-xs font-semibold text-gray-700">{value}%</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const SectionCard = ({ title, icon, children, action }) => (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <span className="text-orange-500">{icon}</span>
                <h4 className="text-sm font-bold text-gray-800">{title}</h4>
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex items-start gap-2 py-1.5">
        <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value || "—"}</span>
    </div>
);

// ── Dummy Data ────────────────────────────────────────────────
const DUMMY = {
    tasks: { total: 24, completed: 18, inProgress: 4, pending: 2 },
    subjects: [
        { name: "JavaScript", completed: 8, total: 10 },
        { name: "React",      completed: 5, total: 8  },
        { name: "Node.js",    completed: 3, total: 6  },
    ],
    attendance: [
        { m: "Sep", v: 88 }, { m: "Oct", v: 92 }, { m: "Nov", v: 78 },
        { m: "Dec", v: 95 }, { m: "Jan", v: 85 }, { m: "Feb", v: 90 },
    ],
    timeline: [
        { title: "Promoted to SubLevel 1B",     sub: "Jan 2025",  status: "done"    },
        { title: "Completed JavaScript Module", sub: "Dec 2024",  status: "done"    },
        { title: "Joined Level 1",              sub: "Sep 2024",  status: "done"    },
        { title: "Enrolled in ITEG",            sub: "Aug 2024",  status: "done"    },
    ],
    reportCard: {
        technical:   82,
        softSkills:  75,
        discipline:  90,
        careerReady: 68,
    },
    recentTasks: [
        { title: "Q1 - Write 3 functions",   subject: "JavaScript", status: "completed",  marks: 4 },
        { title: "Q2 - Build REST API",       subject: "Node.js",    status: "inProgress", marks: null },
        { title: "Q1 - useState Counter",     subject: "React",      status: "pending",    marks: null },
    ],
};

const STATUS_STYLE = {
    completed:  "bg-green-100 text-green-700",
    inProgress: "bg-blue-100 text-blue-700",
    pending:    "bg-gray-100 text-gray-500",
};

// ── Stars ─────────────────────────────────────────────────────
const Stars = ({ marks, max = 5 }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
            i < marks
                ? <MdStar key={i} size={13} className="text-orange-400" />
                : <MdStarBorder key={i} size={13} className="text-gray-300" />
        ))}
    </div>
);

// ── Main ──────────────────────────────────────────────────────
const StudentProfilePage = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { student, level, subdepartment } = location.state || {};

    if (!student) {
        return (
            <div className="p-10 text-center text-gray-400">
                <p className="text-lg font-semibold">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Go Back</button>
            </div>
        );
    }

    const name     = student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const taskPct  = Math.round((DUMMY.tasks.completed / DUMMY.tasks.total) * 100);

    return (
        <>
            <Header
                showBack={true}
                breadcrumbs={[
                    { label: "Departments",       path: "/department-management" },
                    { label: subdepartment?.name || "Sub-Dept", path: -1 },
                    { label: level?.name || "Level", path: -1 },
                    { label: name },
                ]}
            />

            <div className="px-6 py-6 space-y-6 bg-[#F8F7F5] min-h-screen">

                {/* ── Hero Card ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-5">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">
                                {initials}
                            </div>
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                                <Badge label={`ID: ${student.prkey || "SS2025001"}`} color="orange" />
                                <Badge label="Active" color="green" />
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                                {student.course || "BCA"} &nbsp;•&nbsp;
                                {level?.name || "Level 1"} / {subdepartment?.name || "ITEG"}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MdEmail size={14} className="text-orange-400" />
                                    {student.raw?.email || "student@example.com"}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MdPhone size={14} className="text-orange-400" />
                                    {student.mobile || "9876543210"}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MdBook size={14} className="text-orange-400" />
                                    {student.course || "BCA"}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => navigate("/student/task-board", { state: { student: student.raw || student, level, subdepartment } })}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition"
                            >
                                <MdTableChart size={15} /> Task Board
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Tasks Completed"
                        value={`${DUMMY.tasks.completed}/${DUMMY.tasks.total}`}
                        sub={`${taskPct}% done`}
                        accent="text-orange-500"
                        icon={<MdCheckCircle size={18} />}
                    />
                    <StatCard
                        label="In Progress"
                        value={DUMMY.tasks.inProgress}
                        sub="Tasks ongoing"
                        accent="text-blue-500"
                        icon={<MdAccessTime size={18} />}
                    />
                    <StatCard
                        label="Attendance"
                        value="90%"
                        sub="This semester"
                        accent="text-green-600"
                        icon={<MdSchool size={18} />}
                    />
                    <StatCard
                        label="Placement"
                        value="Not Ready"
                        sub="Readiness status"
                        accent="text-gray-500"
                        icon={<MdWork size={18} />}
                    />
                </div>

                {/* ── Row 2: Task Progress + Subject Progress ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Task Completion */}
                    <SectionCard title="Task Completion" icon={<MdCheckCircle size={16} />}>
                        <div className="flex items-center gap-5 mb-5">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15" fill="none" stroke="#f97316" strokeWidth="3"
                                        strokeDasharray={`${taskPct * 0.942} 94.2`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-500">{taskPct}%</span>
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Completed</span>
                                    <span className="font-semibold text-green-600">{DUMMY.tasks.completed}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">In Progress</span>
                                    <span className="font-semibold text-blue-500">{DUMMY.tasks.inProgress}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Pending</span>
                                    <span className="font-semibold text-gray-400">{DUMMY.tasks.pending}</span>
                                </div>
                                <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-gray-700">{DUMMY.tasks.total}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {DUMMY.subjects.map(s => (
                                <ProgressBar
                                    key={s.name}
                                    label={s.name}
                                    value={Math.round((s.completed / s.total) * 100)}
                                />
                            ))}
                        </div>
                    </SectionCard>

                    {/* Attendance Trend */}
                    <SectionCard title="Attendance Trend" icon={<MdSchool size={16} />}>
                        <div className="flex items-end gap-2 h-28 mb-3">
                            {DUMMY.attendance.map(({ m, v }) => (
                                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-gray-400">{v}%</span>
                                    <div
                                        className={`w-full rounded-t-md ${v >= 90 ? "bg-green-400" : v >= 80 ? "bg-orange-400" : "bg-red-400"}`}
                                        style={{ height: `${(v / 100) * 96}px` }}
                                    />
                                    <span className="text-[10px] text-gray-400">{m}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" /> ≥90%</span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> 80–89%</span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> &lt;80%</span>
                        </div>
                    </SectionCard>
                </div>

                {/* ── Row 3: Report Card + Recent Tasks ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Report Card */}
                    <SectionCard title="Report Card" icon={<MdStar size={16} />}>
                        <div className="space-y-4">
                            <ProgressBar label="Technical Skills"  value={DUMMY.reportCard.technical}   color="bg-orange-500" />
                            <ProgressBar label="Soft Skills"       value={DUMMY.reportCard.softSkills}  color="bg-blue-400" />
                            <ProgressBar label="Discipline"        value={DUMMY.reportCard.discipline}  color="bg-green-400" />
                            <ProgressBar label="Career Readiness"  value={DUMMY.reportCard.careerReady} color="bg-purple-400" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-500">Overall Score</span>
                            <span className="text-sm font-bold text-orange-500">
                                {Math.round(Object.values(DUMMY.reportCard).reduce((a, b) => a + b, 0) / 4)}%
                            </span>
                        </div>
                    </SectionCard>

                    {/* Recent Tasks */}
                    <SectionCard
                        title="Recent Tasks"
                        icon={<MdBook size={16} />}
                        action={
                            <button
                                onClick={() => navigate("/student/task-board", { state: { student: student.raw || student, level, subdepartment } })}
                                className="text-xs text-orange-500 font-semibold hover:underline"
                            >
                                View All
                            </button>
                        }
                    >
                        <div className="space-y-3">
                            {DUMMY.recentTasks.map((t, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{t.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {t.marks != null && <Stars marks={t.marks} />}
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>
                                            {t.status === "inProgress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                {/* ── Row 4: Personal Info + Academic Timeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Personal Info */}
                    <SectionCard title="Personal Information" icon={<MdPerson size={16} />}>
                        <InfoRow label="Full Name"     value={name} />
                        <InfoRow label="Father Name"   value={student.fatherName || student.raw?.fatherName || "Ramesh Kumar"} />
                        <InfoRow label="Mobile"        value={student.mobile || "9876543210"} />
                        <InfoRow label="Parent Mobile" value={student.raw?.parentMobile || "9876543211"} />
                        <InfoRow label="Course"        value={student.course || "BCA"} />
                        <InfoRow label="Gender"        value={student.raw?.gender || "Male"} />
                        <InfoRow label="Address"       value={student.raw?.address || "Village Rampur, Dist. Sagar"} />
                        <InfoRow label="Aadhar"        value={student.raw?.aadharCard ? "••••••••" + student.raw.aadharCard.slice(-4) : "XXXX XXXX 1234"} />
                    </SectionCard>

                    {/* Academic Timeline */}
                    <SectionCard title="Academic Timeline" icon={<MdSchool size={16} />}>
                        <div className="space-y-0">
                            {DUMMY.timeline.map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                                            <MdCheckCircle size={14} className="text-orange-500" />
                                        </div>
                                        {i < DUMMY.timeline.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

            </div>
        </>
    );
};

export default StudentProfilePage;
