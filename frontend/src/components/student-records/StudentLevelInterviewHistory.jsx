/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useGetAdmittedStudentsByIdQuery, useGetStudentLevelInterviewsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import Header from "../common-components/sidebar/Header";
import { MdCalendarToday, MdPerson, MdNotifications } from "react-icons/md";
import { HiAcademicCap } from "react-icons/hi";

/* ── Score Box ── */
const ScoreBox = ({ label, value, max, bg, text }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${bg}`}>
        <p className={`text-lg font-bold ${text}`}>
            {value}
            <span className="text-xs font-medium text-gray-400">/{max}</span>
        </p>
        <p className="text-xs text-gray-500 font-medium mt-0.5 text-center leading-tight">{label}</p>
    </div>
);

/* ── Interview Card ── */
const InterviewCard = ({ interview, isFirst }) => {
    const formatDate = (d) => {
        if (!d) return "N/A";
        try {
            return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        } catch {
            return d;
        }
    };

    const isPassed = interview.result?.toLowerCase() === "pass";
    const isFailed = interview.result?.toLowerCase() === "fail";

    const resultVariant = isPassed
        ? "bg-green-100 text-green-700 border border-green-200"
        : isFailed
        ? "bg-red-100 text-red-700 border border-red-200"
        : "bg-yellow-100 text-yellow-700 border border-yellow-200";

    return (
        <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md ${isFirst ? "border-orange-200" : "border-gray-200"}`}>

            {/* Card Header */}
            <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-bold text-sm">{interview.levelNo}</span>
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-800 leading-snug">
                            Level {interview.levelNo} Interview
                            {interview.Topic && (
                                <span className="text-gray-500 font-normal"> | Topic – {interview.Topic}</span>
                            )}
                        </h4>
                        <div className="flex items-center flex-wrap gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                <MdCalendarToday size={12} />
                                {formatDate(interview.date)}
                            </span>
                            {interview.interviewer && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <MdPerson size={12} />
                                    Interviewer: {interview.interviewer}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${resultVariant}`}>
                    {interview.result || "Pending"}
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-4" />

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <ScoreBox label="Theoretical"   value={interview.Theoretical_Marks  ?? 0} max={10} bg="bg-blue-50"   text="text-blue-600"   />
                <ScoreBox label="Practical"     value={interview.Practical_Marks    ?? 0} max={10} bg="bg-green-50"  text="text-green-600"  />
                <ScoreBox label="Communication" value={interview.Communication_Marks ?? 0} max={10} bg="bg-purple-50" text="text-purple-600" />
                <ScoreBox label="Total Score"   value={interview.marks              ?? 0} max={30} bg="bg-orange-50" text="text-orange-500"  />
            </div>

            {/* Remarks */}
            {interview.remark && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Remarks</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{interview.remark}</p>
                </div>
            )}
        </div>
    );
};

/* ── Pagination ── */
const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pages = useMemo(() => {
        const arr = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) arr.push(i);
        } else if (currentPage <= 3) {
            [1, 2, 3, 4, "...", totalPages].forEach(p => arr.push(p));
        } else if (currentPage >= totalPages - 2) {
            [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(p => arr.push(p));
        } else {
            [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages].forEach(p => arr.push(p));
        }
        return arr;
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center gap-1 mt-6 py-4">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                ← Prev
            </button>
            {pages.map((page, i) => (
                <button key={i} onClick={() => typeof page === "number" && onPageChange(page)} disabled={page === "..."}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                        page === currentPage ? "bg-orange-500 text-white shadow-sm"
                        : page === "..." ? "text-gray-400 cursor-default"
                        : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                    }`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-orange-500 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next →
            </button>
        </div>
    );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const StudentLevelInterviewHistory = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const { data: studentData, isLoading: studentLoading } = useGetAdmittedStudentsByIdQuery(studentId, { skip: !studentId });
    const { data: levelInterviewData, isLoading: interviewLoading } = useGetStudentLevelInterviewsQuery(studentId, { skip: !studentId });

    /* ── Resolve interviews ──
       getStudentLevels returns the level array directly: res.json(levels)
       getStudentById   returns the student directly:     res.json(student)
       So levelInterviewData IS the array, studentData IS the student object.
    ── */
    const apiInterviews = useMemo(() => {
        if (!levelInterviewData) return null;
        if (Array.isArray(levelInterviewData))            return levelInterviewData;          // direct array ✅
        if (Array.isArray(levelInterviewData?.level))     return levelInterviewData.level;    // { level: [] }
        if (Array.isArray(levelInterviewData?.data))      return levelInterviewData.data;     // { data: [] }
        return null;
    }, [levelInterviewData]);

    const interviews = apiInterviews || [];

    const { paginatedInterviews, totalPages, startIndex, endIndex } = useMemo(() => {
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx   = startIdx + itemsPerPage;
        return {
            paginatedInterviews: interviews.slice(startIdx, endIdx),
            totalPages:  Math.max(Math.ceil(interviews.length / itemsPerPage), 1),
            startIndex:  startIdx + 1,
            endIndex:    Math.min(endIdx, interviews.length),
        };
    }, [interviews, currentPage, itemsPerPage]);

    const breadcrumbs = [
        { label: "Academics",        path: "/student-detail-table" },
        { label: "Student Progress", path: "/student-detail-table" },
        { label: "Profile",          path: `/student-profile/${studentId}` },
        { label: "Level History" },
    ];

    /* ── Resolve student display info ──
       getStudentById returns student directly (no wrapper)
    ── */
    const resolvedStudent = studentData;
    const studentName = resolvedStudent
        ? `${resolvedStudent.firstName ?? ""} ${resolvedStudent.lastName ?? ""}`.trim() || "Student"
        : "Student";
    const initials = studentName
        .split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

    if (studentLoading || interviewLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    }

    return (
        <>
            {/* ── Header ── */}
            <Header
                title="Level Interview History"
                subtitle="Student level assessment records and progress tracking"
                breadcrumbs={breadcrumbs}
            >
                <button
                    onClick={() => navigate(`/student-profile/${studentId}`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                    ← Back to Profile
                </button>
                <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition">
                    <MdNotifications size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white" />
                </button>
            </Header>

            <div className="px-6 py-6 space-y-5" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>

                {/* ── Student Info Card ── */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-orange-100 border-2 border-orange-200 text-orange-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                            {resolvedStudent ? initials : <HiAcademicCap size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h2 className="text-base font-bold text-gray-900">{studentName}</h2>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                                    Level {resolvedStudent?.currentLevel || "1A"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {resolvedStudent?.course || resolvedStudent?.track || "N/A"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/student-profile/${studentId}`)}
                        className="flex-shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm"
                    >
                        View Full Profile
                    </button>
                </div>

                {/* ── Section Title Row ── */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">
                        Interview Records ({interviews.length})
                    </h3>
                    <p className="text-xs text-gray-400">
                        Showing {startIndex}–{endIndex} of {interviews.length} records
                    </p>
                </div>

                {/* ── Interview Cards / Empty State ── */}
                {interviews.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-20 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                            <HiAcademicCap size={32} className="text-orange-400" />
                        </div>
                        <p className="text-base font-semibold text-gray-700 mb-1">No Interview Records</p>
                        <p className="text-sm text-gray-400">This student hasn't taken any level interviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedInterviews.map((interview, index) => (
                            <InterviewCard
                                key={interview._id || index}
                                interview={interview}
                                isFirst={index === 0 && currentPage === 1}
                            />
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </>
    );
};

export default StudentLevelInterviewHistory;
