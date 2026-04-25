import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
    MdCheckCircle,
    MdCloudUpload,
    MdEmail,
    MdPhone,
    MdSchool,
    MdTimeline,
    MdTrendingUp,
    MdUploadFile,
} from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import {
    useDeactivateTaskBasedStudentDocumentMutation,
    useGetTaskBasedStudentProfileQuery,
    useGetTaskBasedStudentPromotionHistoryQuery,
    useGetTaskBasedStudentPromotionPreviewQuery,
    usePromoteTaskBasedStudentMutation,
    useRecalculateTaskBasedStudentReadinessMutation,
    useUpdateTaskBasedStudentTaskStatusMutation,
    useUploadTaskBasedStudentDocumentMutation,
} from "../../../redux/api/authApi";

const formatDate = (value) => {
    if (!value) return "NA";

    try {
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "NA";
    }
};

const getFullName = (student) =>
    [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() || "Student";

const getInitials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    inProgress: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    Active: "bg-green-100 text-green-700 border-green-200",
    Completed: "bg-blue-100 text-blue-700 border-blue-200",
    Dropped: "bg-red-100 text-red-700 border-red-200",
    Placed: "bg-purple-100 text-purple-700 border-purple-200",
    NotReady: "bg-gray-100 text-gray-700 border-gray-200",
    ReadyForPlacement: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const documentCategoryOptions = [
    { value: "resume", label: "Resume" },
    { value: "profileImage", label: "Profile Image" },
    { value: "extra", label: "Extra Document" },
    { value: "milestone", label: "Milestone Document" },
    { value: "placement", label: "Placement Document" },
];

const StatCard = ({ label, value, sub, accent = "text-slate-900" }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
        <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
);

const EmptyState = ({ title, subtitle }) => (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-800">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
);

const StudentProfilePage = () => {
    const { studentId: routeStudentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const stateStudent = location.state?.student;
    const studentId = routeStudentId || stateStudent?._id || "";

    const [promotionRemark, setPromotionRemark] = useState("");
    const [taskDrafts, setTaskDrafts] = useState({});
    const [documentForm, setDocumentForm] = useState({
        category: "extra",
        label: "",
        remark: "",
        file: null,
    });

    const {
        data: profileResponse,
        isLoading,
        isFetching,
        refetch: refetchProfile,
    } = useGetTaskBasedStudentProfileQuery(
        { studentId },
        { skip: !studentId }
    );
    const { data: previewResponse, refetch: refetchPreview } = useGetTaskBasedStudentPromotionPreviewQuery(studentId, {
        skip: !studentId,
    });
    const { data: promotionHistoryResponse, refetch: refetchPromotionHistory } = useGetTaskBasedStudentPromotionHistoryQuery(studentId, {
        skip: !studentId,
    });

    const [updateTaskStatus, { isLoading: isUpdatingTask }] = useUpdateTaskBasedStudentTaskStatusMutation();
    const [uploadDocument, { isLoading: isUploadingDocument }] = useUploadTaskBasedStudentDocumentMutation();
    const [deactivateDocument, { isLoading: isDeactivatingDocument }] = useDeactivateTaskBasedStudentDocumentMutation();
    const [promoteStudent, { isLoading: isPromotingStudent }] = usePromoteTaskBasedStudentMutation();
    const [recalculateReadiness, { isLoading: isRecalculatingReadiness }] = useRecalculateTaskBasedStudentReadinessMutation();

    const payload = profileResponse?.data?.data;
    const student = payload?.student;
    const tasks = payload?.tasks || [];
    const taskSummary = payload?.taskSummary || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        progressPercent: 0,
    };
    const documents = payload?.documents?.all || [];
    const taskSnapshots = payload?.taskSnapshots || [];
    const eventHistory = payload?.eventHistory || [];
    const promotionHistory = promotionHistoryResponse?.data?.data || payload?.promotionHistory || [];
    const promotionPreview = previewResponse?.data?.data;

    const studentName = getFullName(student);
    const profileImage = payload?.documents?.profileImage?.url || student?.image || "";
    const initials = getInitials(studentName);

    const handleTaskDraftChange = (taskId, field, value) => {
        setTaskDrafts((current) => ({
            ...current,
            [taskId]: {
                status: current[taskId]?.status,
                marks: current[taskId]?.marks,
                notes: current[taskId]?.notes,
                [field]: value,
            },
        }));
    };

    const handleTaskUpdate = async (task) => {
        const draft = taskDrafts[task.taskId] || {};
        const nextPayload = {};

        if (draft.status && draft.status !== task.status) {
            nextPayload.status = draft.status;
        }

        if (draft.notes !== undefined && draft.notes !== task.notes) {
            nextPayload.notes = draft.notes;
        }

        if (draft.marks !== undefined && draft.marks !== "" && Number(draft.marks) !== task.marks) {
            nextPayload.marks = Number(draft.marks);
        }

        if (Object.keys(nextPayload).length === 0) {
            toast.info("No task changes to save.");
            return;
        }

        try {
            await updateTaskStatus({
                studentId,
                taskId: task.taskId,
                ...nextPayload,
            }).unwrap();
            toast.success("Task updated successfully.");
            await refetchProfile();
        } catch (error) {
            toast.error(error?.data?.message || "Unable to update task.");
        }
    };

    const handleDocumentUpload = async (event) => {
        event.preventDefault();

        if (!documentForm.file || !documentForm.label.trim()) {
            toast.error("Label and file are required.");
            return;
        }

        try {
            const fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(documentForm.file);
            });

            await uploadDocument({
                studentId,
                category: documentForm.category,
                label: documentForm.label.trim(),
                fileName: documentForm.file.name,
                mimeType: documentForm.file.type,
                fileData,
                remark: documentForm.remark.trim(),
            }).unwrap();

            toast.success("Document uploaded successfully.");
            setDocumentForm({
                category: "extra",
                label: "",
                remark: "",
                file: null,
            });
            await refetchProfile();
        } catch (error) {
            toast.error(error?.data?.message || "Unable to upload document.");
        }
    };

    const handleDeactivateDocument = async (documentId) => {
        try {
            await deactivateDocument({ studentId, documentId }).unwrap();
            toast.success("Document removed successfully.");
            await refetchProfile();
        } catch (error) {
            toast.error(error?.data?.message || "Unable to remove document.");
        }
    };

    const handlePromoteStudent = async () => {
        try {
            await promoteStudent({
                studentId,
                remark: promotionRemark.trim(),
            }).unwrap();
            toast.success("Student promoted successfully.");
            setPromotionRemark("");
            await Promise.all([refetchProfile(), refetchPreview(), refetchPromotionHistory()]);
        } catch (error) {
            toast.error(error?.data?.message || "Unable to promote student.");
        }
    };

    const handleReadinessSync = async () => {
        try {
            await recalculateReadiness(studentId).unwrap();
            toast.success("Readiness recalculated.");
            await refetchProfile();
        } catch (error) {
            toast.error(error?.data?.message || "Unable to recalculate readiness.");
        }
    };

    if (!studentId) {
        return (
            <div className="p-10 text-center text-slate-500">
                <p className="text-lg font-semibold">Student not selected.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-8 text-sm text-slate-500">Loading student profile...</div>;
    }

    if (!student) {
        return <div className="p-8 text-sm text-red-500">Unable to load student profile.</div>;
    }

    return (
        <>
            <Header
                showBack={true}
                breadcrumbs={[
                    { label: "Departments", path: "/department-management" },
                    { label: "Student Profile", path: -1 },
                    { label: studentName },
                ]}
            />

            <div className="space-y-6 px-6 py-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-orange-100 text-2xl font-bold text-orange-600">
                                {profileImage ? (
                                    <img src={profileImage} alt={studentName} className="h-full w-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-bold text-slate-900">{studentName}</h1>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[student.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                            {student.status}
                                        </span>
                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[student.readinessStatus] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                            {student.readinessStatus}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {student.selectedCourse || "Course not set"} • {student.subDepartmentId?.name || "Sub-department not set"}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <MdEmail className="text-orange-500" />
                                        {student.email || "Email not set"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MdPhone className="text-orange-500" />
                                        {student.studentMobile || "Phone not set"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MdSchool className="text-orange-500" />
                                        {student.currentLevelId?.name || "Level"} / {student.currentSubLevelId?.name || "Sub-level"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleReadinessSync}
                                disabled={isRecalculatingReadiness}
                                className="rounded-xl border border-orange-300 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isRecalculatingReadiness ? "Syncing..." : "Sync Readiness"}
                            </button>
                            <button
                                onClick={() => refetchProfile()}
                                disabled={isFetching}
                                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isFetching ? "Refreshing..." : "Refresh Profile"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total Tasks" value={taskSummary.total} sub="Assigned through active syllabus" />
                    <StatCard label="Completed" value={taskSummary.completed} sub="Tasks closed by faculty or student flow" accent="text-green-600" />
                    <StatCard label="In Progress" value={taskSummary.inProgress} sub="Tasks currently being worked on" accent="text-blue-600" />
                    <StatCard label="Pending" value={taskSummary.pending} sub="Tasks still waiting to start" accent="text-yellow-600" />
                    <StatCard label="Progress" value={`${taskSummary.progressPercent}%`} sub={student.readyForPlacementAt ? `Ready since ${formatDate(student.readyForPlacementAt)}` : "Readiness driven by task completion"} accent="text-orange-600" />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Assigned Tasks</h2>
                                    <p className="text-sm text-slate-500">Topic and subtopic tasks are managed from the student profile itself.</p>
                                </div>
                            </div>

                            {!tasks.length ? (
                                <EmptyState title="No tasks assigned yet" subtitle="Once a syllabus is assigned, tasks will appear here." />
                            ) : (
                                <div className="space-y-4">
                                    {tasks.map((task) => {
                                        const draft = taskDrafts[task.taskId] || {};

                                        return (
                                            <div key={task._id} className="rounded-2xl border border-slate-200 p-4">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[task.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                                                {task.status}
                                                            </span>
                                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                {task.taskNodeType === "topic" ? "Topic Task" : "Subtopic Task"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500">
                                                            {task.subjectName} • {task.topicName}{task.subTopicName ? ` • ${task.subTopicName}` : ""}
                                                        </p>
                                                        {task.description ? (
                                                            <p className="text-sm text-slate-600">{task.description}</p>
                                                        ) : null}
                                                        <p className="text-xs text-slate-400">
                                                            Marks: {task.marks ?? 0}/{task.maxMarks || 5} • Type: {task.type}
                                                        </p>
                                                    </div>

                                                    <div className="grid min-w-full gap-3 lg:min-w-[360px] lg:max-w-[420px] lg:grid-cols-2">
                                                        <select
                                                            value={draft.status ?? task.status}
                                                            onChange={(event) => handleTaskDraftChange(task.taskId, "status", event.target.value)}
                                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="inProgress">In Progress</option>
                                                            <option value="completed">Completed</option>
                                                        </select>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={task.maxMarks || 5}
                                                            value={draft.marks ?? task.marks ?? ""}
                                                            onChange={(event) => handleTaskDraftChange(task.taskId, "marks", event.target.value)}
                                                            placeholder={`Marks / ${task.maxMarks || 5}`}
                                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                                        />

                                                        <textarea
                                                            rows="2"
                                                            value={draft.notes ?? task.notes ?? ""}
                                                            onChange={(event) => handleTaskDraftChange(task.taskId, "notes", event.target.value)}
                                                            placeholder="Faculty notes"
                                                            className="lg:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                                        />

                                                        <button
                                                            onClick={() => handleTaskUpdate(task)}
                                                            disabled={isUpdatingTask}
                                                            className="lg:col-span-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            Save Task Update
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <MdCloudUpload className="text-orange-500" size={20} />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Documents</h2>
                                    <p className="text-sm text-slate-500">Resume, extra documents, milestone proofs and profile image can be managed here.</p>
                                </div>
                            </div>

                            <form onSubmit={handleDocumentUpload} className="grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 md:grid-cols-2">
                                <select
                                    value={documentForm.category}
                                    onChange={(event) => setDocumentForm((current) => ({ ...current, category: event.target.value }))}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                >
                                    {documentCategoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={documentForm.label}
                                    onChange={(event) => setDocumentForm((current) => ({ ...current, label: event.target.value }))}
                                    placeholder="Document label"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                />

                                <textarea
                                    rows="2"
                                    value={documentForm.remark}
                                    onChange={(event) => setDocumentForm((current) => ({ ...current, remark: event.target.value }))}
                                    placeholder="Remark"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none md:col-span-2"
                                />

                                <label className="md:col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                                    <MdUploadFile size={18} className="text-orange-500" />
                                    <span>{documentForm.file ? documentForm.file.name : "Choose a file"}</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(event) =>
                                            setDocumentForm((current) => ({
                                                ...current,
                                                file: event.target.files?.[0] || null,
                                            }))
                                        }
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={isUploadingDocument}
                                    className="md:col-span-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isUploadingDocument ? "Uploading..." : "Upload Document"}
                                </button>
                            </form>

                            <div className="mt-4 space-y-3">
                                {!documents.length ? (
                                    <EmptyState title="No documents uploaded" subtitle="Upload the first student document to start tracking profile assets." />
                                ) : (
                                    documents.map((document) => (
                                        <div key={document._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-slate-900">{document.label}</p>
                                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                        {document.category}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {document.fileName || "Uploaded file"} • {formatDate(document.uploadedAt)}
                                                </p>
                                                {document.remark ? <p className="mt-1 text-sm text-slate-600">{document.remark}</p> : null}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <a
                                                    href={document.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Open
                                                </a>
                                                <button
                                                    onClick={() => handleDeactivateDocument(document._id)}
                                                    disabled={isDeactivatingDocument}
                                                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <MdTrendingUp className="text-orange-500" size={20} />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Promotion</h2>
                                    <p className="text-sm text-slate-500">Faculty can promote the student only through task-based level progression.</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                {promotionPreview?.next ? (
                                    <>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Next: {promotionPreview.next.level?.name} / {promotionPreview.next.subLevel?.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Transition type: {promotionPreview.next.transitionType}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Syllabus: {promotionPreview.next.syllabusVersion?.title || "No active syllabus"}
                                        </p>

                                        <textarea
                                            rows="3"
                                            value={promotionRemark}
                                            onChange={(event) => setPromotionRemark(event.target.value)}
                                            placeholder="Promotion remark"
                                            className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                        />

                                        <button
                                            onClick={handlePromoteStudent}
                                            disabled={isPromotingStudent || !promotionPreview.next.syllabusVersion}
                                            className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isPromotingStudent ? "Promoting..." : "Promote Student"}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">Student is already at the final stage or preview is not available.</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <MdTimeline className="text-orange-500" size={20} />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Promotion History</h2>
                                    <p className="text-sm text-slate-500">Every promotion stays visible for audit and review.</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                {!promotionHistory.length ? (
                                    <p className="text-sm text-slate-500">No promotions recorded yet.</p>
                                ) : (
                                    promotionHistory.map((item) => (
                                        <div key={item._id} className="rounded-2xl border border-slate-200 p-4">
                                            <p className="font-semibold text-slate-900">
                                                {item.fromLevelId?.name || "Level"} / {item.fromSubLevelId?.name || "Sub-level"} to {item.toLevelId?.name || "Level"} / {item.toSubLevelId?.name || "Sub-level"}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatDate(item.promotedAt)} • {item.promotedByName || item.promotedBy?.name || "Faculty"}
                                            </p>
                                            {item.remark ? <p className="mt-2 text-sm text-slate-600">{item.remark}</p> : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <MdCheckCircle className="text-orange-500" size={20} />
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Task Snapshot Timeline</h2>
                                    <p className="text-sm text-slate-500">Every task change is stored for progress analysis.</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {!taskSnapshots.length ? (
                                    <p className="text-sm text-slate-500">No task snapshots yet.</p>
                                ) : (
                                    taskSnapshots.slice(0, 8).map((snapshot) => (
                                        <div key={snapshot._id} className="rounded-2xl border border-slate-200 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-semibold text-slate-900">{snapshot.status}</p>
                                                <span className="text-xs text-slate-400">{formatDate(snapshot.changedAt)}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Marks: {snapshot.marks ?? 0}/{snapshot.maxMarks || 5}
                                            </p>
                                            {snapshot.notes ? <p className="mt-1 text-sm text-slate-600">{snapshot.notes}</p> : null}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">Recent Events</h2>
                            <div className="mt-4 space-y-3">
                                {!eventHistory.length ? (
                                    <p className="text-sm text-slate-500">No events recorded yet.</p>
                                ) : (
                                    eventHistory.slice(0, 8).map((event) => (
                                        <div key={event._id} className="rounded-2xl border border-slate-200 p-4">
                                            <p className="font-semibold text-slate-900">{event.title}</p>
                                            <p className="mt-1 text-sm text-slate-600">{event.description || event.action}</p>
                                            <p className="mt-2 text-xs text-slate-400">
                                                {event.createdByName || "System"} • {formatDate(event.createdAt)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentProfilePage;
