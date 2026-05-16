import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    MdEmail, MdPhone, MdCheckCircle, MdAccessTime,
    MdTableChart, MdSchool, MdWork,
    MdStar, MdMoreVert, MdClose, MdEdit,
    MdArrowUpward, MdBadge, MdBusiness, MdCalendarToday,
    MdAccountTree, MdVerified, MdWarning
} from "react-icons/md";
import { toast } from "react-toastify";
import Header from "../../../shared/sidebar/Header";
import {
    useGetNewStudentTasksQuery,
    useGetNewStudentByIdQuery,
    useGetStudentProgressSnapshotsQuery,
    useGetStudentTaskHistoryQuery,
    useGetStudentActivityQuery,
    useGetLevelsBySubdepartmentQuery,
    useGetAllSubLevelsQuery,
    usePromoteNewStudentMutation,
    useUpdateStudentByIdMutation,
    useUpdatePlacementReadinessMutation,
    useUploadDocumentMutation,
    useUploadExtraDocumentMutation,
    useMarkStudentDroppedMutation,
    useMarkStudentDummyMutation,
} from "../../../../redux/api/authApi";

// History helpers

const ProgressBar = ({ label, value, color = "bg-blue-500" }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-600">{label}</span>
            <span className="text-xs font-semibold text-gray-700">{value}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const HeroMetricCard = ({ title, children }) => (
    <div className="flex-1 min-h-[92px] flex flex-col items-center justify-center text-center p-4 border border-gray-100 rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <p className="text-[11px] font-semibold text-gray-500 mb-2">{title}</p>
        {children}
    </div>
);

const formatShortDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.$oid || "";
};

const getTime = (value) => {
    const date = new Date(value || 0);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatStatus = (status) => {
    if (status === "inProgress") return "In Progress";
    if (!status) return "Updated";
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const statusBadgeClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (["approved", "completed", "selected", "joined", "placed", "ready"].includes(normalized)) {
        return "bg-green-50 text-green-600";
    }
    if (["pending", "scheduled", "ongoing", "in progress", "ready for interview"].includes(normalized)) {
        return "bg-blue-50 text-blue-600";
    }
    if (["rejected", "overdue", "not ready"].includes(normalized)) {
        return "bg-red-50 text-red-600";
    }
    return "bg-gray-50 text-gray-600";
};

const openFile = (url) => {
    if (!url) {
        toast.info("No file available.");
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
};

const readUploadFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const activityStyle = (type) => {
    switch (type) {
        case "task":
            return { color: "bg-indigo-50 text-indigo-500", icon: "task" };
        case "promotion":
            return { color: "bg-green-50 text-green-600", icon: "promote" };
        case "document":
            return { color: "bg-blue-50 text-blue-600", icon: "document" };
        case "email":
            return { color: "bg-sky-50 text-sky-600", icon: "email" };
        case "note":
            return { color: "bg-orange-50 text-orange-500", icon: "note" };
        default:
            return { color: "bg-gray-50 text-gray-500", icon: "note" };
    }
};

const LevelJourneyBar = ({ items = [] }) => {
    const rawCurrentIndex = items.findIndex(item => item.status === "current");
    const progressIndex = rawCurrentIndex === -1
        ? items.filter(item => item.status === "completed").length - 1
        : rawCurrentIndex;

    return (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-sm font-bold text-gray-900">Level Progress <span className="font-medium text-gray-500">(Overall Journey)</span></h2>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Completed</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500" />Current</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />Upcoming</span>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-gray-500">No level structure found for this student.</p>
                </div>
            ) : (
            <div className="relative overflow-x-auto pb-1">
                <div className="absolute left-0 right-0 top-[42px] h-px bg-gray-200" />
                <div
                    className="absolute left-0 top-[42px] h-px bg-green-500"
                    style={{ width: `${items.length > 1 ? Math.max(0, (progressIndex / (items.length - 1)) * 100) : 0}%` }}
                />
                <div className="relative grid gap-4 min-w-[720px]" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(76px, 1fr))` }}>
                    {items.map((item, index) => {
                        const state = item.status;
                        return (
                            <div key={item.id || `${item.code}-${index}`} className="flex flex-col items-center text-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 mb-2 relative z-10 ${
                                    state === "completed" ? "bg-green-500 border-green-500 text-white" :
                                    state === "current" ? "bg-blue-50 border-blue-500 text-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.10)]" :
                                    "bg-white border-gray-300 text-gray-400"
                                }`}>
                                    {state === "completed" ? <MdCheckCircle size={12} /> : ""}
                                </div>
                                <p className={`text-xs font-bold ${state === "current" ? "text-blue-600" : state === "completed" ? "text-gray-900" : "text-gray-500"}`}>
                                    {item.code}
                                </p>
                                <p className="mt-1 text-[10px] text-gray-500 line-clamp-2">{item.label}</p>
                                <div className={`mt-3 h-1.5 w-full rounded-full ${
                                    state === "completed" ? "bg-green-500" :
                                    state === "current" ? "bg-blue-500" :
                                    "bg-gray-200"
                                }`} />
                            </div>
                        );
                    })}
                </div>
            </div>
            )}
        </section>
    );
};

const ModuleCard = ({ title, icon, summary, meta, action, accent = "blue", onClick }) => {
    const accentClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="group bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-sm hover:border-blue-100 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
            <div className="flex items-start justify-between gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${accentClasses[accent]}`}>
                    {icon}
                </div>
                <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">{action}</span>
            </div>
            <h3 className="mt-4 text-sm font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-500">{summary}</p>
            <p className="mt-3 text-[11px] font-semibold text-gray-400">{meta}</p>
        </button>
    );
};

const ActivityIcon = ({ item }) => (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
        {item.icon === "task"       && <MdTableChart size={15} />}
        {item.icon === "promote"    && <MdArrowUpward size={15} />}
        {item.icon === "email"      && <MdEmail size={15} />}
        {item.icon === "note"       && <MdAccessTime size={15} />}
        {item.icon === "document"   && <MdSchool size={15} />}
    </div>
);

const ActivityRow = ({ item }) => (
    <div className="flex items-start gap-3 relative z-10">
        <ActivityIcon item={item} />
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800">{item.title}</p>
            {item.sub && <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>}
            <p className="text-[10px] text-gray-400 mt-0.5">
                {formatDateTime(item.time)}
                {item.createdByName ? ` - ${item.createdByName}` : ""}
            </p>
        </div>
    </div>
);

const FullStudentActivityModal = ({ isOpen, onClose, name, activityItems }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Student Activity</h2>
                        <p className="mt-1 text-xs font-medium text-gray-500">{name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <MdClose size={20} />
                    </button>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
                    <p className="text-xs font-semibold text-gray-500">All logged lifecycle events</p>
                    <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">{activityItems.length} events</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4 pr-1">
                            {activityItems.length > 0 ? activityItems.map(item => (
                                <ActivityRow key={item._id} item={item} />
                            )) : (
                                <div className="relative z-10 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                                    <p className="text-sm font-semibold text-gray-500">No student activity found yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileSectionModal = ({ isOpen, onClose, title, subtitle, countLabel, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <MdClose size={20} />
                    </button>
                </div>

                {countLabel && (
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
                        <p className="text-xs font-semibold text-gray-500">Summary-first view</p>
                        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">{countLabel}</span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-gray-100 px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptySectionState = ({ text }) => (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
        <p className="text-sm font-semibold text-gray-500">{text}</p>
    </div>
);

const DocumentRow = ({ doc }) => (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                doc.fileType === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
            }`}>
                <MdBadge size={16} />
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{doc.title || "Document"}</p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                    {(doc.fileType || "file").toUpperCase()}{doc.uploadedAt ? ` - ${formatShortDate(doc.uploadedAt)}` : ""}
                </p>
                {doc.remark && <p className="mt-1 text-xs text-gray-500">{doc.remark}</p>}
                {doc.uploadedByName && <p className="mt-1 text-[10px] font-semibold text-gray-400">Uploaded by {doc.uploadedByName}</p>}
            </div>
        </div>
        <button
            type="button"
            onClick={() => openFile(doc.fileURL)}
            className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
            Open
        </button>
    </div>
);

const DocumentUploadPanel = ({ type = "document", loading, onUpload }) => {
    const isExtra = type === "extra";
    const [title, setTitle] = useState("");
    const [remark, setRemark] = useState("");
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");

    const handleFile = (event) => {
        const selected = event.target.files?.[0];
        if (!selected) return;

        const isPdf = selected.type === "application/pdf";
        const isImage = selected.type.startsWith("image/");
        if (!isPdf && !isImage) {
            setFile(null);
            setFileError("Only image or PDF files are allowed.");
            return;
        }
        if (selected.size > 5 * 1024 * 1024) {
            setFile(null);
            setFileError("File must be under 5 MB.");
            return;
        }

        setFileError("");
        setFile(selected);
        if (!title.trim()) {
            setTitle(selected.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Document title is required");
            return;
        }
        if (!file) {
            toast.error("Please select a document file");
            return;
        }

        try {
            const fileData = await readUploadFile(file);
            await onUpload({
                title: title.trim(),
                fileData,
                fileType: file.type === "application/pdf" ? "pdf" : "image",
                remark: isExtra ? remark.trim() : undefined,
            });
            setTitle("");
            setRemark("");
            setFile(null);
            setFileError("");
        } catch (error) {
            setFileError(error?.data?.message || "Upload failed. Please try again.");
        }
    };

    return (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-gray-900">Add {isExtra ? "Extra Document" : "Document"}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-gray-500">Image or PDF, max 5 MB</p>
                </div>
                <MdArrowUpward size={18} className="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Title</label>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={isExtra ? "Resume, certificate..." : "Aadhar card, marksheet..."}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">File</label>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFile}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gray-600 focus:border-blue-400 focus:outline-none"
                    />
                </div>
                {isExtra && (
                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Remark</label>
                        <textarea
                            value={remark}
                            onChange={(event) => setRemark(event.target.value)}
                            rows={2}
                            placeholder="Short context for this supporting file..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                        />
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-[11px] font-medium ${fileError ? "text-red-500" : "text-gray-500"}`}>
                    {fileError || (file ? file.name : "No file selected")}
                </p>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <MdCheckCircle size={14} />}
                    Upload
                </button>
            </div>
        </div>
    );
};

const DetailPill = ({ label, value }) => (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 truncate text-xs font-semibold text-gray-800">{value || "N/A"}</p>
    </div>
);

const PermissionRow = ({ item }) => (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{item.reason || "Leave permission request"}</p>
                <p className="mt-1 text-[11px] font-medium text-gray-500">
                    {formatShortDate(item.fromDate) || "Start date"} to {formatShortDate(item.toDate) || "End date"}
                </p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadgeClass(item.status)}`}>
                {formatStatus(item.status)}
            </span>
        </div>
        {(item.remark || item.approvedBy || item.imageURL) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.remark && <span className="rounded-full bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500">{item.remark}</span>}
                {item.approvedBy && <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600">By {item.approvedBy}</span>}
                {item.imageURL && (
                    <button type="button" onClick={() => openFile(item.imageURL)} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                        Attachment
                    </button>
                )}
            </div>
        )}
    </div>
);

// Shift to Ready Student Modal
const ReadyStudentModal = ({ name, currentStatus, onConfirm, onCancel, loading }) => {
    const statuses = ["Not Ready", "In Progress", "Ready", "Ready for Interview"];
    const [selected, setSelected] = useState(currentStatus || "Ready");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Update Placement Readiness</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="px-5 py-4 space-y-2">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setSelected(s)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                                selected === s
                                    ? "bg-blue-50 border-blue-400 text-blue-700"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={() => onConfirm(selected)} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-xl transition flex items-center justify-center gap-2">
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdCheckCircle size={15} />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// Edit Profile Modal
const EditProfileModal = ({ raw, onConfirm, onCancel, loading }) => {
    const [form, setForm] = useState({
        firstName:     raw.firstName     || "",
        lastName:      raw.lastName      || "",
        email:         raw.email         || "",
        studentMobile: raw.studentMobile || "",
        parentMobile:  raw.parentMobile  || "",
        fatherName:    raw.fatherName    || "",
        village:       raw.village       || "",
        address:       raw.address       || "",
        course:        raw.course        || "",
        gender:        raw.gender        || "",
    });
    const ic = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400";
    const lc = "block text-xs font-semibold text-gray-600 mb-1";
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-sm font-bold text-gray-800">Edit Profile</h3>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[{k:"firstName",l:"First Name"},{k:"lastName",l:"Last Name"},{k:"fatherName",l:"Father Name"},{k:"email",l:"Email"},{k:"studentMobile",l:"Student Mobile"},{k:"parentMobile",l:"Parent Mobile"},{k:"village",l:"Village"},{k:"course",l:"Course"}].map(({k,l}) => (
                            <div key={k}>
                                <label className={lc}>{l}</label>
                                <input className={ic} value={form[k]} onChange={set(k)} placeholder={l} />
                            </div>
                        ))}
                        <div className="col-span-2">
                            <label className={lc}>Address</label>
                            <textarea className={`${ic} resize-none`} rows={2} value={form.address} onChange={set("address")} />
                        </div>
                        <div>
                            <label className={lc}>Gender</label>
                            <select className={ic} value={form.gender} onChange={set("gender")}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 px-5 pb-5 flex-shrink-0">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={() => onConfirm(form)} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-2">
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdEdit size={15} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Mark Dropped / Dummy Modal
const MarkDroppedModal = ({ name, onConfirm, onCancel, loading, variant = "dropped" }) => {
    const isDummy = variant === "dummy";
    const [reason,   setReason]   = useState("");
    const [remark,   setRemark]   = useState("");
    const [fileData, setFileData] = useState(null);
    const [fileType, setFileType] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileErr,  setFileErr]  = useState("");

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isPdf = file.type === "application/pdf";
        const isImg = file.type.startsWith("image/");
        if (!isPdf && !isImg) { setFileErr("Only image or PDF allowed"); return; }
        if (file.size > 5 * 1024 * 1024) { setFileErr("File must be under 5 MB"); return; }
        setFileErr("");
        setFileName(file.name);
        setFileType(isPdf ? "pdf" : "image");
        const reader = new FileReader();
        reader.onload = (ev) => setFileData(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (isDummy && !reason.trim()) { toast.error("Reason is required"); return; }
        if (!isDummy && !remark.trim()) { toast.error("Reason is required"); return; }
        if (!fileData)       { toast.error("Application document is required"); return; }
        onConfirm({ reason, remark, fileData, fileType, fileName });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">{isDummy ? "Mark as Dummy" : "Mark as Dropped"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="px-5 py-4 space-y-4">
                    <div className={`flex items-start gap-3 p-3 border rounded-xl ${isDummy ? "bg-orange-50 border-orange-100" : "bg-red-50 border-red-100"}`}>
                        <MdWarning size={18} className={`${isDummy ? "text-orange-500" : "text-red-500"} flex-shrink-0 mt-0.5`} />
                        <p className={`text-xs ${isDummy ? "text-orange-600" : "text-red-600"}`}>
                            This will mark the student as <strong>{isDummy ? "Dummy" : "Dropped"}</strong>. This action can be reversed later.
                        </p>
                    </div>

                    {isDummy && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason <span className="text-red-400">*</span></label>
                            <input
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter dummy student reason..."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            {isDummy ? "Remark" : "Reason"} {!isDummy && <span className="text-red-400">*</span>}
                        </label>
                        <textarea value={remark} onChange={e => setRemark(e.target.value)}
                            rows={3} placeholder={isDummy ? "Add remark..." : "Enter reason for dropping..."}
                            className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none ${isDummy ? "focus:border-orange-400" : "focus:border-red-400"}`} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Application Document <span className="text-red-400">*</span>
                            <span className="text-gray-400 font-normal ml-1">(image or PDF)</span>
                        </label>
                        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
                            fileData ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}>
                            <MdArrowUpward size={18} className={fileData ? "text-green-500" : "text-gray-400"} />
                            <div className="flex-1 min-w-0">
                                {fileData ? (
                                    <p className="text-xs font-semibold text-green-700 truncate">{fileName}</p>
                                ) : (
                                    <p className="text-xs text-gray-500">Click to upload application</p>
                                )}
                            </div>
                            <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                        </label>
                        {fileErr && <p className="text-[11px] text-red-500 mt-1">{fileErr}</p>}
                    </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading}
                        className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 ${isDummy ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600"}`}>
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdWarning size={15} />}
                        {isDummy ? "Confirm Dummy" : "Confirm Drop"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Promote Modal
const PromoteModal = ({ name, onConfirm, onCancel, loading }) => {
    const [remark, setRemark] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Promote Student</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="px-5 py-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remark <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea
                        value={remark} onChange={e => setRemark(e.target.value)}
                        rows={3} placeholder="Add a promotion remark..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
                    />
                </div>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={() => onConfirm(remark)} disabled={loading}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-xl transition flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Promoting...</> : <><MdArrowUpward size={15} /> Promote</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helpers
const taskStatusClass = (status) => {
    switch (status) {
        case "completed":
            return "bg-green-50 text-green-600 border-green-100";
        case "inProgress":
            return "bg-blue-50 text-blue-600 border-blue-100";
        case "pending":
            return "bg-orange-50 text-orange-600 border-orange-100";
        default:
            return "bg-gray-50 text-gray-600 border-gray-100";
    }
};

const HistoryStatPill = ({ label, value, color = "text-gray-700" }) => (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
        <p className="text-[10px] font-semibold uppercase text-gray-400">{label}</p>
        <p className={`mt-0.5 text-sm font-bold ${color}`}>{value ?? 0}</p>
    </div>
);

const SnapshotStats = ({ title, snapshot }) => {
    if (!snapshot) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3">
                <p className="text-[11px] font-semibold text-gray-400">{title}</p>
                <p className="mt-1 text-xs text-gray-500">Stats unavailable for this event</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-gray-600">{title}</p>
                <span className="text-[10px] font-semibold text-gray-400">{snapshot.averageMarks || 0}/5 avg</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
                <HistoryStatPill label="Total" value={snapshot.totalTasks} />
                <HistoryStatPill label="Done" value={snapshot.completedTasks} color="text-green-600" />
                <HistoryStatPill label="Pending" value={snapshot.pendingTasks} color="text-orange-600" />
                <HistoryStatPill label="Progress" value={snapshot.inProgressTasks} color="text-blue-600" />
            </div>
        </div>
    );
};

const FullLevelHistoryModal = ({
    isOpen,
    onClose,
    name,
    completedLevelSnapshots,
    subjectSnapshots,
    currentLevelLabel,
    currentSubLevelName,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    currentSubjectGroups,
    taskHistoryEvents,
}) => {
    if (!isOpen) return null;

    const subjectsBySubLevel = subjectSnapshots.reduce((acc, item) => {
        const key = getId(item.subLevelId);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const currentSubjects = Object.entries(currentSubjectGroups || {}).map(([subjectName, group]) => {
        const tasks = group.tasks || [];
        const done = tasks.filter(task => task.status === "completed").length;
        return {
            subjectName,
            tasks,
            pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
        };
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Full Level History</h2>
                        <p className="mt-1 text-xs font-medium text-gray-500">{name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <MdClose size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 md:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[11px] font-semibold text-gray-400">Completed Levels</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{completedLevelSnapshots.length}</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="text-[11px] font-semibold text-blue-500">Current Level</p>
                        <p className="mt-1 truncate text-sm font-bold text-blue-700">{currentLevelLabel}</p>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                        <p className="text-[11px] font-semibold text-green-600">Current Completed</p>
                        <p className="mt-1 text-xl font-bold text-green-700">{completedTasks}/{totalTasks}</p>
                    </div>
                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                        <p className="text-[11px] font-semibold text-orange-600">Pending/In Progress</p>
                        <p className="mt-1 text-xl font-bold text-orange-700">{pendingTasks}/{inProgressTasks}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-5">
                        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Task Change Timeline</h3>
                                    <p className="mt-1 text-xs text-gray-500">Each card shows the task change and nearest statistics captured at that time.</p>
                                </div>
                                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-500">{taskHistoryEvents.length} events</span>
                            </div>

                            <div className="mt-4 space-y-3">
                                {taskHistoryEvents.length > 0 ? taskHistoryEvents.map((event) => (
                                    <div key={event._id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-gray-400">{formatDateTime(event.changedAt)}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-600">
                                                        Task Status Changed
                                                    </span>
                                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${taskStatusClass(event.status)}`}>
                                                        {event.previousStatus ? `${formatStatus(event.previousStatus)} -> ${formatStatus(event.status)}` : `Updated to ${formatStatus(event.status)}`}
                                                    </span>
                                                    {typeof event.marks === "number" && (
                                                        <span className="rounded-full border border-yellow-100 bg-yellow-50 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
                                                            Marks {event.marks}/{event.maxMarks || 5}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="mt-3 text-sm font-bold text-gray-900">{event.taskTitle || "Task"}</h4>
                                                {event.taskDescription && <p className="mt-1 text-xs text-gray-500">{event.taskDescription}</p>}
                                                <p className="mt-2 text-xs text-gray-500">
                                                    <span className="font-semibold text-gray-700">{event.subjectName || "Subject"}</span>
                                                    {event.topicName ? ` / ${event.topicName}` : ""}
                                                    {event.subTopicName ? ` / ${event.subTopicName}` : ""}
                                                </p>
                                                {(event.changedByName || event.changedByRole) && (
                                                    <p className="mt-1 text-[11px] text-gray-400">Changed by {event.changedByName || "User"}{event.changedByRole ? ` (${event.changedByRole})` : ""}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                            <SnapshotStats title="Overall stats at this time" snapshot={event.overallSnapshot} />
                                            <SnapshotStats title={`${event.subjectName || "Subject"} stats at this time`} snapshot={event.subjectSnapshot} />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                                        <p className="text-sm font-semibold text-gray-500">No task change history found yet.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                <div>
                                    <div className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">Current</div>
                                    <h3 className="mt-2 text-sm font-bold text-gray-900">{currentLevelLabel} - {currentSubLevelName}</h3>
                                    <p className="mt-1 text-xs text-gray-500">Current level work completed so far</p>
                                </div>
                                <div className="min-w-[180px]">
                                    <ProgressBar
                                        label={`${completedTasks}/${totalTasks} tasks`}
                                        value={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
                                        color="bg-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                {currentSubjects.length > 0 ? currentSubjects.map(subject => (
                                    <div key={subject.subjectName} className="rounded-xl border border-gray-100 bg-white p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-xs font-bold text-gray-800">{subject.subjectName}</p>
                                            <span className="text-[11px] font-bold text-blue-600">{subject.pct}%</span>
                                        </div>
                                        <div className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
                                            {subject.tasks.slice(0, 8).map(task => (
                                                <div key={task._id} className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] font-semibold text-gray-700">{task.taskName || task.title || task.topicName || "Task"}</p>
                                                        <p className="truncate text-[10px] text-gray-400">{task.topicName || task.subTopicName || "Task activity"}</p>
                                                    </div>
                                                    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${taskStatusClass(task.status)}`}>
                                                        {task.status || "pending"}{typeof task.marks === "number" ? ` - ${task.marks}` : ""}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center md:col-span-2">
                                        <p className="text-xs font-semibold text-gray-500">No current level task activity found.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {completedLevelSnapshots.length > 0 ? completedLevelSnapshots.map(level => {
                            const levelSubjects = subjectsBySubLevel[getId(level.subLevelId)] || [];
                            const pct = level.totalTasks > 0 ? Math.round((level.completedTasks / level.totalTasks) * 100) : 0;

                            return (
                                <section key={level._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                                        <div>
                                            <div className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600">Completed</div>
                                            <h3 className="mt-2 text-sm font-bold text-gray-900">{level.levelName || "Level"} - {level.subLevelName || "Sub Level"}</h3>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Completed on {formatShortDate(level.changedAt || level.createdAt) || "N/A"} - Syllabus {level.syllabusVersionCode || level.syllabusVersionTitle || "N/A"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <p className="text-[10px] font-semibold text-gray-400">Tasks</p>
                                                <p className="text-sm font-bold text-gray-800">{level.completedTasks}/{level.totalTasks}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <p className="text-[10px] font-semibold text-gray-400">Marks</p>
                                                <p className="text-sm font-bold text-gray-800">{level.averageMarks || 0}/5</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <p className="text-[10px] font-semibold text-gray-400">Done</p>
                                                <p className="text-sm font-bold text-gray-800">{pct}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {levelSubjects.length > 0 ? levelSubjects.map(subject => {
                                            const subjectPct = subject.totalTasks > 0 ? Math.round((subject.completedTasks / subject.totalTasks) * 100) : 0;
                                            return (
                                                <div key={subject._id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="truncate text-xs font-bold text-gray-800">{subject.subjectName || "Subject"}</p>
                                                        <span className="text-[11px] font-bold text-green-600">{subjectPct}%</span>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                                                        <span>{subject.completedTasks}/{subject.totalTasks} tasks</span>
                                                        <span>Avg {subject.averageMarks || 0}/5</span>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center md:col-span-2">
                                                <p className="text-xs font-semibold text-gray-500">No subject-wise snapshot found for this level.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        }) : (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                                <p className="text-sm font-semibold text-gray-500">No completed level history found yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MissionHeroSection = ({ raw, name, initials, level, subdepartment, readinessStatus, taskRating, goToTaskBoard, moreOpen, setMoreOpen, onPromote, onFtpToggle, ftpLoading, onReadyStudent, onViewReport, onEditProfile, onMarkDropped, onMarkDummy }) => (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col xl:flex-row xl:items-start gap-5">
            <div className="relative flex-shrink-0">
                {raw.image ? (
                    <img src={raw.image} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-2xl font-bold">{initials}</div>
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{name}</h1>
                            <MdVerified size={20} className="text-blue-500" />
                            {raw.isFTP && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">FTP</span>}
                        </div>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                            {raw.course || "BCA"}
                            <span className="text-gray-400 font-normal mx-1.5">/</span>
                            {level?.name || raw.currentLevelId?.name || "Level"}
                            <span className="text-gray-400 font-normal mx-1.5">/</span>
                            {subdepartment?.name || raw.subDepartmentId?.name || "Sub Dept"}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <button onClick={onPromote} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-green-500 text-green-600 hover:bg-green-50 rounded-xl transition">
                            <MdArrowUpward size={13} /> Promote
                        </button>
                        <button onClick={onFtpToggle} disabled={ftpLoading}
                            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition border ${raw.isFTP ? "border-red-300 text-red-500 hover:bg-red-50" : "border-blue-400 text-blue-600 hover:bg-blue-50"}`}>
                            <MdArrowUpward size={13} /> {raw.isFTP ? "Remove FTP" : "FTP Shift"}
                        </button>
                        <button onClick={goToTaskBoard} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-purple-400 text-purple-600 hover:bg-purple-50 rounded-xl transition">
                            <MdTableChart size={13} /> Assign Task
                        </button>
                        <div className="relative">
                            <button onClick={() => setMoreOpen(p => !p)} className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition">
                                More <MdMoreVert size={13} />
                            </button>
                            {moreOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                                    <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-48 py-1">
                                        <button onClick={onReadyStudent} className="w-full text-left px-4 py-2 text-xs text-blue-600 font-semibold hover:bg-blue-50 transition">Shift to Ready Student</button>
                                        <button onClick={onViewReport} className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">View Report Card</button>
                                        <button onClick={onEditProfile} className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">Edit Profile</button>
                                        <div className="border-t border-gray-100 my-1" />
                                        <button onClick={onMarkDummy} className="w-full text-left px-4 py-2 text-xs text-orange-500 font-semibold hover:bg-orange-50 transition">Mark Dummy</button>
                                        <button onClick={onMarkDropped} className="w-full text-left px-4 py-2 text-xs text-red-500 font-semibold hover:bg-red-50 transition">Mark Dropped</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_260px_1fr] gap-5">
                    <div className="space-y-2">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBadge size={10} /> PR Key</p>
                            <p className="text-xs font-bold text-gray-800">{raw.prkey || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdEmail size={10} /> Email</p>
                            <p className="text-xs font-bold text-gray-800">{raw.email || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdPhone size={10} /> Mobile</p>
                            <p className="text-xs font-bold text-gray-800">{raw.studentMobile || "N/A"}</p>
                        </div>
                    </div>

                    <div className="space-y-2 lg:border-l lg:border-gray-100 lg:pl-5">
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdBusiness size={10} /> Department</p>
                            <p className="text-xs font-bold text-gray-800">{raw.subDepartmentId?.departmentId?.name || "ITEG"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdAccountTree size={10} /> Sub Department</p>
                            <p className="text-xs font-bold text-gray-800">{subdepartment?.name || raw.subDepartmentId?.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5"><MdCalendarToday size={10} /> Session</p>
                            <p className="text-xs font-bold text-gray-800">{raw.sessionId?.name || "N/A"} <span className="text-green-500">(Active)</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:border-l lg:border-gray-100 lg:pl-5">
                        <HeroMetricCard title="Placement Ready">
                            <div className={`flex items-center gap-1 font-bold text-sm ${
                                readinessStatus === "Ready for Interview" ? "text-green-600" :
                                readinessStatus === "Ready" ? "text-blue-600" :
                                readinessStatus === "In Progress" ? "text-orange-500" :
                                "text-gray-400"
                            }`}>
                                <MdCheckCircle size={15} />
                                {readinessStatus}
                            </div>
                        </HeroMetricCard>

                        <HeroMetricCard title="Attendance (This Month)">
                            <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                <MdSchool size={15} /> N/A
                            </div>
                        </HeroMetricCard>

                        <HeroMetricCard title="Taskwise Rating">
                            {taskRating === "N/A" ? (
                                <>
                                    <p className="text-2xl font-bold text-gray-400">N/A</p>
                                    <span className="mt-2 inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500">Not rated</span>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-gray-900">{taskRating} <span className="text-base text-gray-400">/ 5</span></p>
                                    <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(item => (
                                            <MdStar key={item} size={16} className={item <= Math.round(Number(taskRating)) ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <span className="mt-2 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">Rated</span>
                                </>
                            )}
                        </HeroMetricCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const StudentProfilePage = () => {
    const location   = useLocation();
    const navigate   = useNavigate();
    const { id }     = useParams();
    const { student, level, subdepartment } = location.state || {};
    const studentId  = student?._id || student?.raw?._id || id;

    const [moreOpen,      setMoreOpen]      = useState(false);
    const [promoteModal,  setPromoteModal]  = useState(false);
    const [readyModal,    setReadyModal]    = useState(false);
    const [editModal,     setEditModal]     = useState(false);
    const [dropModal,     setDropModal]     = useState(false);
    const [dummyModal,    setDummyModal]    = useState(false);
    const [historyModal,  setHistoryModal]  = useState(false);
    const [activityModal, setActivityModal] = useState(false);
    const [sectionModal,  setSectionModal]  = useState(null);
    const [ftpLoading,    setFtpLoading]    = useState(false);
    const [readyLoading,  setReadyLoading]  = useState(false);
    const [editLoading,   setEditLoading]   = useState(false);
    const [dropLoading,   setDropLoading]   = useState(false);
    const [dummyLoading,  setDummyLoading]  = useState(false);

    const [promoteStudent,          { isLoading: promoting }]  = usePromoteNewStudentMutation();
    const [updateStudent]                                       = useUpdateStudentByIdMutation();
    const [updatePlacementReadiness]                            = useUpdatePlacementReadinessMutation();
    const [uploadDocument,          { isLoading: uploadingDocument }] = useUploadDocumentMutation();
    const [uploadExtraDocument,     { isLoading: uploadingExtraDocument }] = useUploadExtraDocumentMutation();
    const [markStudentDropped]                                  = useMarkStudentDroppedMutation();
    const [markStudentDummy]                                    = useMarkStudentDummyMutation();

    const { data: taskData } = useGetNewStudentTasksQuery(
        { id: studentId },
        { skip: !studentId }
    );

    // Fresh student data with placement + overallProgress
    const { data: studentFull } = useGetNewStudentByIdQuery(
        studentId,
        { skip: !studentId }
    );

    const baseStudent = studentFull || student?.raw || student;
    const subDepartmentId = getId(baseStudent?.subDepartmentId);

    const { data: progressSnapshotsResponse } = useGetStudentProgressSnapshotsQuery(
        { id: studentId, limit: 100 },
        { skip: !studentId }
    );

    const { data: taskHistoryResponse } = useGetStudentTaskHistoryQuery(
        { id: studentId, limit: 100 },
        { skip: !studentId }
    );

    const { data: activityResponse } = useGetStudentActivityQuery(
        { id: studentId, limit: 100 },
        { skip: !studentId }
    );

    const { data: levelsResponse } = useGetLevelsBySubdepartmentQuery(
        subDepartmentId,
        { skip: !subDepartmentId }
    );

    const { data: subLevelsResponse } = useGetAllSubLevelsQuery(undefined, {
        skip: !subDepartmentId,
    });

    if (!student && !studentId) {
        return (
            <div className="p-10 text-center text-gray-400">
                <p className="text-lg font-semibold">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">Go Back</button>
            </div>
        );
    }

    if (!studentFull && studentId && !student) {
        return (
            <div className="p-10 text-center text-gray-400">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <p className="text-sm font-semibold">Loading student profile...</p>
            </div>
        );
    }

    const raw      = baseStudent;
    const name     = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    // Placement readiness from StudentPlacement (via getStudentById)
    const readinessStatus = raw.placement?.readinessStatus || "Not Ready";

    const totalTasks     = taskData?.totalTasks     || 0;
    const completedTasks = taskData?.completedTasks || 0;
    const pendingTasks   = taskData?.pendingTasks   || 0;
    const overdueTasks   = taskData?.overdueTasks   || taskData?.overDueTasks || 0;
    const subjectGroups = taskData?.groupedBySubject || {};
    const subjects = Object.entries(subjectGroups).map(([sName, group]) => {
        const tasks = group.tasks || [];
        const done  = tasks.filter(t => t.status === "completed").length;
        return { name: sName, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    });
    const allSubjectTasks = Object.values(subjectGroups).flatMap(group => group.tasks || []);
    const evaluatedTasks = allSubjectTasks.filter(t => typeof t.marks === "number");
    const averageMarks = evaluatedTasks.length > 0
        ? (evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length).toFixed(1)
        : "N/A";
    const taskRating = averageMarks;
    const currentSubLevelName = raw.currentSubLevelId?.name || level?.currentSubLevelName || "Current Sub Level";
    const snapshots = progressSnapshotsResponse?.data || [];
    const taskHistory = taskHistoryResponse?.data || [];
    const completedLevelSnapshots = snapshots
        .filter(item => item.snapshotScope === "overall")
        .sort((a, b) => new Date(b.changedAt || b.createdAt) - new Date(a.changedAt || a.createdAt));
    const subjectSnapshots = snapshots
        .filter(item => item.snapshotScope === "subject")
        .sort((a, b) => new Date(b.changedAt || b.createdAt) - new Date(a.changedAt || a.createdAt));
    const levelSnapshots = snapshots
        .filter(item => ["overall", "promotion"].includes(item.snapshotScope))
        .sort((a, b) => new Date(a.changedAt || a.createdAt) - new Date(b.changedAt || b.createdAt));
    const findNearestSnapshot = (event, scope) => {
        const eventTime = getTime(event.changedAt || event.createdAt);
        const candidates = snapshots.filter((snapshot) => {
            if (snapshot.snapshotScope !== scope) return false;
            if (getId(snapshot.subLevelId) !== getId(event.subLevelId)) return false;
            if (scope === "subject" && getId(snapshot.subjectId) !== getId(event.subjectId)) return false;
            return Math.abs(getTime(snapshot.changedAt || snapshot.createdAt) - eventTime) <= 10000;
        });

        return candidates.sort((a, b) =>
            Math.abs(getTime(a.changedAt || a.createdAt) - eventTime) -
            Math.abs(getTime(b.changedAt || b.createdAt) - eventTime)
        )[0] || null;
    };
    const taskHistoryEvents = taskHistory
        .slice()
        .sort((a, b) => getTime(b.changedAt || b.createdAt) - getTime(a.changedAt || a.createdAt))
        .map(event => ({
            ...event,
            overallSnapshot: findNearestSnapshot(event, "overall"),
            subjectSnapshot: findNearestSnapshot(event, "subject"),
        }));
    const completedSubLevelIds = new Set(
        levelSnapshots
            .filter(item => {
                const total = Number(item.totalTasks || 0);
                return item.snapshotScope === "overall" && total > 0 && Number(item.completedTasks || 0) >= total;
            })
            .map(item => getId(item.subLevelId))
            .filter(Boolean)
    );
    const currentLevelId = getId(raw.currentLevelId);
    const currentSubLevelId = getId(raw.currentSubLevelId);
    const currentLevelLabel = raw.currentLevelId?.name || level?.name || "Current Level";
    const levels = (levelsResponse?.data || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const levelOrderMap = new Map(levels.map(item => [getId(item), item.order || 0]));
    const levelNameMap = new Map(levels.map(item => [getId(item), item.name || "Level"]));
    const subLevels = (subLevelsResponse?.data || [])
        .filter(item => levelOrderMap.has(getId(item.levelId)))
        .sort((a, b) => {
            const levelDiff = (levelOrderMap.get(getId(a.levelId)) || 0) - (levelOrderMap.get(getId(b.levelId)) || 0);
            return levelDiff || ((a.order || 0) - (b.order || 0));
        });
    const subLevelNameMap = new Map(subLevels.map(item => [getId(item), item.name || "Sub Level"]));
    if (currentSubLevelId) {
        subLevelNameMap.set(currentSubLevelId, currentSubLevelName);
    }
    const getSubLevelName = (value, fallback = "Sub Level") => {
        const id = getId(value);
        return subLevelNameMap.get(id) || value?.name || fallback;
    };
    const activityItems = (activityResponse?.data || []).map((item) => {
        const style = activityStyle(item.type);
        const meta = item.meta || {};
        const prevSubLevelName = getSubLevelName(meta.prevSubLevelId, "Previous Sub Level");
        const newSubLevelName = getSubLevelName(meta.newSubLevelId, "New Sub Level");
        const promotionSub = item.type === "promotion"
            ? [
                meta.prevSubLevelId || meta.newSubLevelId ? `${prevSubLevelName} to ${newSubLevelName}` : "",
                meta.tasksAssigned !== undefined ? `${meta.tasksAssigned} tasks assigned` : "",
            ].filter(Boolean).join(" - ")
            : "";
        const sub = promotionSub ||
            item.description ||
            (item.type === "task" && meta.status ? `Status: ${formatStatus(meta.status)}` : "");

        return {
            ...item,
            icon: style.icon,
            color: style.color,
            sub,
            time: item.createdAt,
        };
    });
    const journeyItems = (subLevels.length > 0 ? subLevels : [{
        _id: currentSubLevelId,
        name: currentSubLevelName,
        order: raw.currentSubLevelId?.order || 1,
        levelId: raw.currentLevelId,
    }]).map((item) => {
        const itemId = getId(item);
        const itemLevelId = getId(item.levelId);
        const isCurrent = itemId === currentSubLevelId;
        const isCompleted = completedSubLevelIds.has(itemId) ||
            (levelOrderMap.get(itemLevelId) < levelOrderMap.get(currentLevelId)) ||
            (itemLevelId === currentLevelId && (item.order || 0) < (raw.currentSubLevelId?.order || 0));

        return {
            id: itemId,
            code: `${levelNameMap.get(itemLevelId) || raw.currentLevelId?.name || "Level"}-${item.name || "Sub Level"}`,
            label: item.name || "Sub Level",
            status: isCurrent ? "current" : isCompleted ? "completed" : "upcoming",
        };
    });
    const levelHistoryItems = [
        ...levelSnapshots
            .filter(item => item.snapshotScope === "overall")
            .map(item => ({
                id: item._id,
                label: `${item.levelName || "Level"} - ${item.subLevelName || "Sub Level"}`,
                date: item.changedAt || item.createdAt,
                status: "completed",
                meta: `${item.completedTasks || 0}/${item.totalTasks || 0} tasks completed`,
            })),
        {
            id: currentSubLevelId || "current",
            label: `${currentLevelLabel} - ${currentSubLevelName}`,
            date: raw.updatedAt || raw.createdAt,
            status: "current",
            meta: `${completedTasks}/${totalTasks} current tasks completed`,
        },
    ].filter((item, index, arr) => {
        const key = `${item.label}-${item.status}`;
        return arr.findIndex(row => `${row.label}-${row.status}` === key) === index;
    }).sort((a, b) => {
        if (a.status === "current") return -1;
        if (b.status === "current") return 1;
        return new Date(b.date || 0) - new Date(a.date || 0);
    });
    const documents = Array.isArray(raw.documents) ? raw.documents : [];
    const regularDocs = documents.filter(doc => !doc.isExtra);
    const extraDocs = documents.filter(doc => doc.isExtra);
    const permissionHistory = (Array.isArray(raw.permissions) ? raw.permissions : [])
        .slice()
        .sort((a, b) => getTime(b.uploadDate || b.createdAt) - getTime(a.uploadDate || a.createdAt));
    const pendingPermissions = permissionHistory.filter(item => item.status === "pending").length;
    const latestPermissionStatus = pendingPermissions > 0
        ? "Pending"
        : permissionHistory[0]?.status
            ? permissionHistory[0].status
            : "No Active";
    const placement = raw.placement || {};
    const interviewRecords = (Array.isArray(placement.PlacementinterviewRecord) ? placement.PlacementinterviewRecord : [])
        .slice()
        .sort((a, b) => getTime(b.rescheduleDate || b.scheduleDate || b.createdAt) - getTime(a.rescheduleDate || a.scheduleDate || a.createdAt));
    const latestInterview = interviewRecords[0];
    const placedInfo = placement.placedInfo || {};
    const latestInterviewCompany = latestInterview?.companyName || latestInterview?.companyRef?.name || latestInterview?.companyRef?.companyName || "";
    const latestInterviewDate = latestInterview?.rescheduleDate || latestInterview?.scheduleDate;
    const placementCompany = placedInfo.companyName || latestInterviewCompany || "No company assigned";
    const placementRole = placedInfo.jobProfile || latestInterview?.jobProfile || latestInterview?.position || "";
    const placementDocumentsCount = [placement.resumeURL, placement.offerLetter, placement.commitmentApplication, placedInfo.offerLetterURL, placedInfo.applicationURL]
        .filter(Boolean).length;

    const goToTaskBoard = () => {
        navigate("/student/task-board", {
            state: {
                student: raw,
                level: level || raw.currentLevelId,
                subdepartment: subdepartment || raw.subDepartmentId,
            },
        });
    };

    // Promote handler
    const handlePromote = async () => {
        try {
            await promoteStudent(raw._id).unwrap();
            toast.success(`${name} promoted successfully!`);
            setPromoteModal(false);
            navigate(-1);
        } catch (err) {
            toast.error(err?.data?.message || "Promotion failed");
        }
    };

    // FTP toggle handler
    const handleFtpToggle = async () => {
        setFtpLoading(true);
        try {
            await updateStudent({ id: raw._id, data: { isFTP: !raw.isFTP } }).unwrap();
            toast.success(raw.isFTP ? "FTP removed" : "Student shifted to FTP");
            navigate(0);
        } catch (err) {
            toast.error(err?.data?.message || "FTP update failed");
        } finally {
            setFtpLoading(false);
        }
    };

    // Readiness handler
    const handleReadiness = async (readinessStatus) => {
        setReadyLoading(true);
        try {
            await updatePlacementReadiness({ id: raw._id, readinessStatus }).unwrap();
            toast.success(`Placement status updated to "${readinessStatus}"`);
            setReadyModal(false);
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        } finally {
            setReadyLoading(false);
        }
    };

    // Edit profile handler
    const handleEditProfile = async (form) => {
        setEditLoading(true);
        try {
            await updateStudent({ id: raw._id, data: form }).unwrap();
            toast.success("Profile updated successfully");
            setEditModal(false);
            navigate(0);
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        } finally {
            setEditLoading(false);
        }
    };

    // Mark dropped handler
    const handleMarkDropped = async ({ remark, fileData, fileType }) => {
        setDropLoading(true);
        try {
            await markStudentDropped({ id: raw._id, remark, fileData, fileType }).unwrap();
            toast.success(`${name} marked as Dropped`);
            setDropModal(false);
            navigate(-1);
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        } finally {
            setDropLoading(false);
        }
    };

    const handleMarkDummy = async ({ reason, remark, fileData, fileType }) => {
        setDummyLoading(true);
        try {
            await markStudentDummy({ id: raw._id, reason, remark, fileData, fileType }).unwrap();
            toast.success(`${name} marked as Dummy`);
            setDummyModal(false);
            navigate("/student-permission");
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        } finally {
            setDummyLoading(false);
        }
    };

    const handleDocumentUpload = async (payload) => {
        try {
            await uploadDocument({ id: raw._id, ...payload }).unwrap();
            toast.success("Document uploaded successfully");
        } catch (err) {
            toast.error(err?.data?.message || "Document upload failed");
            throw err;
        }
    };

    const handleExtraDocumentUpload = async (payload) => {
        try {
            await uploadExtraDocument({ id: raw._id, ...payload }).unwrap();
            toast.success("Extra document uploaded successfully");
        } catch (err) {
            toast.error(err?.data?.message || "Extra document upload failed");
            throw err;
        }
    };

    return (
        <>
            {promoteModal && (
                <PromoteModal name={name} onConfirm={handlePromote} onCancel={() => setPromoteModal(false)} loading={promoting} />
            )}
            {readyModal && (
                <ReadyStudentModal name={name} currentStatus={readinessStatus} onConfirm={handleReadiness} onCancel={() => setReadyModal(false)} loading={readyLoading} />
            )}
            {editModal && (
                <EditProfileModal raw={raw} onConfirm={handleEditProfile} onCancel={() => setEditModal(false)} loading={editLoading} />
            )}
            {dropModal && (
                <MarkDroppedModal name={name} onConfirm={handleMarkDropped} onCancel={() => setDropModal(false)} loading={dropLoading} />
            )}
            {dummyModal && (
                <MarkDroppedModal name={name} onConfirm={handleMarkDummy} onCancel={() => setDummyModal(false)} loading={dummyLoading} variant="dummy" />
            )}
            <FullLevelHistoryModal
                isOpen={historyModal}
                onClose={() => setHistoryModal(false)}
                name={name}
                completedLevelSnapshots={completedLevelSnapshots}
                subjectSnapshots={subjectSnapshots}
                currentLevelLabel={currentLevelLabel}
                currentSubLevelName={currentSubLevelName}
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                pendingTasks={pendingTasks}
                inProgressTasks={taskData?.inProgressTasks || 0}
                currentSubjectGroups={subjectGroups}
                taskHistoryEvents={taskHistoryEvents}
            />
            <FullStudentActivityModal
                isOpen={activityModal}
                onClose={() => setActivityModal(false)}
                name={name}
                activityItems={activityItems}
            />
            <ProfileSectionModal
                isOpen={sectionModal === "documents"}
                onClose={() => setSectionModal(null)}
                title="Documents"
                subtitle={name}
                countLabel={`${regularDocs.length} core file${regularDocs.length === 1 ? "" : "s"}`}
                footer={(
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setSectionModal(null)}
                            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                )}
            >
                <div className="space-y-3">
                    <DocumentUploadPanel
                        type="document"
                        loading={uploadingDocument}
                        onUpload={handleDocumentUpload}
                    />
                    {regularDocs.length > 0 ? regularDocs.map(doc => (
                        <DocumentRow key={doc._id || doc.fileURL || doc.title} doc={doc} />
                    )) : (
                        <EmptySectionState text="No core documents uploaded yet." />
                    )}
                </div>
            </ProfileSectionModal>
            <ProfileSectionModal
                isOpen={sectionModal === "extraDocuments"}
                onClose={() => setSectionModal(null)}
                title="Extra Documents"
                subtitle={name}
                countLabel={`${extraDocs.length} supporting file${extraDocs.length === 1 ? "" : "s"}`}
                footer={(
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-medium text-gray-500">Extra documents are saved as supporting profile files.</p>
                        <button
                            type="button"
                            onClick={() => setSectionModal(null)}
                            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                )}
            >
                <div className="space-y-3">
                    <DocumentUploadPanel
                        type="extra"
                        loading={uploadingExtraDocument}
                        onUpload={handleExtraDocumentUpload}
                    />
                    {extraDocs.length > 0 ? extraDocs.map(doc => (
                        <DocumentRow key={doc._id || doc.fileURL || doc.title} doc={doc} />
                    )) : (
                        <EmptySectionState text="No extra documents uploaded yet." />
                    )}
                </div>
            </ProfileSectionModal>
            <ProfileSectionModal
                isOpen={sectionModal === "placement"}
                onClose={() => setSectionModal(null)}
                title="Placement"
                subtitle={name}
                countLabel={`${interviewRecords.length} interview record${interviewRecords.length === 1 ? "" : "s"}`}
                footer={(
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => { setSectionModal(null); setReadyModal(true); }}
                            className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Update Readiness
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSectionModal(null); navigate("/readiness-status"); }}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                            Open Placement Module
                        </button>
                    </div>
                )}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <DetailPill label="Readiness" value={readinessStatus} />
                        <DetailPill label="Company" value={placementCompany} />
                        <DetailPill label="Role" value={placementRole || "Not assigned"} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <DetailPill label="Stage" value={placedInfo.companyName ? "Placed" : latestInterview?.status || readinessStatus} />
                        <DetailPill label="Latest Interview" value={latestInterviewDate ? formatShortDate(latestInterviewDate) : "Not scheduled"} />
                        <DetailPill label="Documents" value={`${placementDocumentsCount} ready`} />
                    </div>

                    {placedInfo.companyName ? (
                        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                            <p className="text-sm font-bold text-green-700">Placed at {placedInfo.companyName}</p>
                            <p className="mt-1 text-xs text-green-600">
                                {[placedInfo.jobProfile, placedInfo.jobType, placedInfo.location].filter(Boolean).join(" - ") || "Placement details available"}
                            </p>
                            {placedInfo.joiningDate && <p className="mt-1 text-[11px] font-semibold text-green-600">Joining: {formatShortDate(placedInfo.joiningDate)}</p>}
                        </div>
                    ) : latestInterview ? (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-blue-700">{latestInterviewCompany || "Interview scheduled"}</p>
                                    <p className="mt-1 text-xs text-blue-600">{latestInterview.status || "Scheduled"}{latestInterviewDate ? ` - ${formatShortDate(latestInterviewDate)}` : ""}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadgeClass(latestInterview.status)}`}>
                                    {formatStatus(latestInterview.status)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <EmptySectionState text="No placement interview activity yet." />
                    )}
                </div>
            </ProfileSectionModal>
            <ProfileSectionModal
                isOpen={sectionModal === "permissions"}
                onClose={() => setSectionModal(null)}
                title="Leave Permissions"
                subtitle={name}
                countLabel={`${permissionHistory.length} request${permissionHistory.length === 1 ? "" : "s"}`}
                footer={(
                    <p className="text-xs font-medium text-gray-500">Leave permission history is separate from dummy and dropped student workflows.</p>
                )}
            >
                <div className="space-y-3">
                    {permissionHistory.length > 0 ? permissionHistory.map(item => (
                        <PermissionRow key={item._id || `${item.reason}-${item.uploadDate}`} item={item} />
                    )) : (
                        <EmptySectionState text="No permission requests found yet." />
                    )}
                </div>
            </ProfileSectionModal>

            <Header
                showBack
                breadcrumbs={[
                    { label: "Departments", path: "/department-management" },
                    { label: subdepartment?.name || raw.subDepartmentId?.name || "Student Progress", path: "/student-detail-table" },
                    { label: level?.name || raw.currentLevelId?.name || "Profile", path: -1 },
                    { label: name },
                ]}
            />

            <div className="px-6 py-5 space-y-5 bg-[#F8F7F5] min-h-screen">

                <MissionHeroSection
                    raw={raw} name={name} initials={initials}
                    level={level} subdepartment={subdepartment}
                    readinessStatus={readinessStatus}
                    taskRating={taskRating}
                    goToTaskBoard={goToTaskBoard}
                    moreOpen={moreOpen} setMoreOpen={setMoreOpen}
                    onPromote={() => setPromoteModal(true)}
                    onFtpToggle={handleFtpToggle}
                    ftpLoading={ftpLoading}
                    onReadyStudent={() => { setMoreOpen(false); setReadyModal(true); }}
                    onViewReport={() => { setMoreOpen(false); navigate(`/student/${raw._id}/report`); }}
                    onEditProfile={() => { setMoreOpen(false); setEditModal(true); }}
                    onMarkDummy={() => { setMoreOpen(false); setDummyModal(true); }}
                    onMarkDropped={() => { setMoreOpen(false); setDropModal(true); }}
                />

                {/* Level journey */}
                <LevelJourneyBar items={journeyItems} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-5">

                    {/* Col 1: Donut + Subject Bars */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Current Level Task Progress</h3>
                                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" />
                                    {currentSubLevelName}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Donut */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14"
                                        strokeDasharray={`${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0} 301.6`} strokeLinecap="butt" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="14"
                                        strokeDasharray={`${totalTasks > 0 ? (pendingTasks/totalTasks)*301.6 : 0} 301.6`}
                                        strokeDashoffset={`-${totalTasks > 0 ? (completedTasks/totalTasks)*301.6 : 0}`} strokeLinecap="butt" />
                                    <circle cx="60" cy="60" r="48" fill="none" stroke="#ef4444" strokeWidth="14"
                                        strokeDasharray={`12 301.6`}
                                        strokeDashoffset={`-${totalTasks > 0 ? ((completedTasks+pendingTasks)/totalTasks)*301.6 : 289}`} strokeLinecap="butt" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-[10px] text-gray-400">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
                                </div>
                            </div>

                            {/* Subject bars */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-700">Subject Wise Progress</p>
                                <div className="mt-2 space-y-2.5 max-h-32 overflow-y-auto pr-1">
                                    {subjects.length > 0 ? subjects.map(s => (
                                        <div key={s.name}>
                                            <div className="flex justify-between mb-1 gap-3">
                                                <span className="text-[11px] text-gray-600 truncate">{s.name}</span>
                                                <span className="text-[11px] font-semibold text-gray-700 flex-shrink-0">{s.pct}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${s.pct}%` }} />
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-5 text-center">
                                            <p className="text-[11px] font-semibold text-gray-500">No subject progress available yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 pt-3 mt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[11px] text-gray-600">Completed ({completedTasks})</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[11px] text-gray-600">Pending ({pendingTasks})</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[11px] text-gray-600">Overdue ({overdueTasks})</span></div>
                        </div>

                        <button onClick={goToTaskBoard} className="mt-3 w-full py-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition">
                            View Task Board
                        </button>
                    </div>

                    {/* Col 2: Level History */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Level History</h3>
                            <button onClick={() => setHistoryModal(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full History</button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                            <div className="space-y-5 max-h-[300px] overflow-y-auto pr-1">
                                {levelHistoryItems.length > 0 ? levelHistoryItems.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 pl-1">
                                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5
                                            ${item.status === "current" ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`} />
                                        <div className="flex-1 flex items-start justify-between">
                                            <div>
                                                <p className={`text-xs font-bold ${item.status === "current" ? "text-blue-600" : "text-gray-700"}`}>
                                                    {item.label} {item.status === "current" && <span className="text-blue-400 font-normal text-[11px]">(Current)</span>}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {item.status === "current" ? "Current level" : "Completed"}{formatShortDate(item.date) ? ` on ${formatShortDate(item.date)}` : ""}
                                                    {item.meta ? ` - ${item.meta}` : ""}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2
                                                ${item.status === "current" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                                                {item.status === "current" ? "Current" : "Completed"}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                                        <p className="text-xs font-semibold text-gray-500">No level history available yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 3: Student Activity */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Student Activity</h3>
                            <button onClick={() => setActivityModal(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Activity</button>
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                {activityItems.length > 0 ? activityItems.map((item) => (
                                    <ActivityRow key={item._id} item={item} />
                                )) : (
                                    <div className="relative z-10 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                                        <p className="text-xs font-semibold text-gray-500">No student activity found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Compact module entry points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-6">
                    <ModuleCard
                        title="Documents"
                        icon={<MdBadge size={18} />}
                        summary={`${regularDocs.length} core document${regularDocs.length === 1 ? "" : "s"}`}
                        meta="ID, marksheets, admission files"
                        action="View"
                        accent="blue"
                        onClick={() => setSectionModal("documents")}
                    />
                    <ModuleCard
                        title="Extra Documents"
                        icon={<MdSchool size={18} />}
                        summary={`${extraDocs.length} supporting file${extraDocs.length === 1 ? "" : "s"}`}
                        meta="Resume, certificates, achievements"
                        action="Manage"
                        accent="green"
                        onClick={() => setSectionModal("extraDocuments")}
                    />
                    <ModuleCard
                        title="Placement"
                        icon={<MdWork size={18} />}
                        summary={readinessStatus}
                        meta={placementCompany}
                        action="Open"
                        accent="purple"
                        onClick={() => setSectionModal("placement")}
                    />
                    <ModuleCard
                        title="Leave Permissions"
                        icon={<MdAccessTime size={18} />}
                        summary={`${pendingPermissions} pending request${pendingPermissions === 1 ? "" : "s"}`}
                        meta={latestPermissionStatus}
                        action="View"
                        accent="orange"
                        onClick={() => setSectionModal("permissions")}
                    />
                </div>
            </div>
        </>
    );
};

export default StudentProfilePage;
