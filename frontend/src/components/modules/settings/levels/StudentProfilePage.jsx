import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    MdEmail, MdPhone, MdCheckCircle, MdAccessTime,
    MdTableChart, MdSchool, MdWork,
    MdStar, MdMoreVert, MdClose, MdEdit,
    MdArrowUpward, MdBadge, MdBusiness, MdCalendarToday,
    MdAccountTree, MdVerified, MdWarning, MdArrowForward,
    MdFileUpload, MdHistory, MdFolderSpecial, MdOpenInNew,
    MdBarChart, MdLightbulb, MdSearch, MdNotificationsNone,
    MdTrendingUp, MdCheck, MdFlag, MdAssignment, MdLocationOn,
    MdPerson
} from "react-icons/md";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { FiCamera, FiCheck } from "react-icons/fi";
import Header from "../../../shared/sidebar/Header";
import OrangeButton from "../../../shared/sidebar/OrangeButton";
import {
    useGetNewStudentTasksQuery,
    useGetNewStudentByIdQuery,
    useGetStudentProgressSnapshotsQuery,
    useGetStudentLevelHistoryQuery,
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

const SECRET_KEY = "ITEG@123";
const getToken = () => {
    try {
        const encryptedToken = localStorage.getItem("token");
        if (!encryptedToken) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        console.error("Error retrieving token:", e);
        return null;
    }
};

// Formatting helpers
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

// Modals
const FullStudentActivityModal = ({ isOpen, onClose, name, activityItems }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Student Activity Log</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <MdClose size={18} />
                    </button>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500">All recorded activity events</p>
                    <span className="rounded-full bg-orange-50 border border-orange-100 px-3 py-0.5 text-xs font-bold text-orange-600">{activityItems.length} events</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {activityItems.length > 0 ? activityItems.map(item => (
                            <div key={item._id} className="flex items-start gap-3 border-b border-gray-50 pb-3">
                                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MdAccessTime size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800">{item.title}</p>
                                    {item.sub && <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {formatDateTime(item.time)}{item.createdByName ? ` • ${item.createdByName}` : ""}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                                <p className="text-xs font-semibold text-gray-500">No student activity logged yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileSectionModal = ({ isOpen, onClose, title, subtitle, countLabel, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                        <MdClose size={18} />
                    </button>
                </div>

                {countLabel && (
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3 bg-gray-50/50">
                        <p className="text-xs font-semibold text-gray-500">Summary View</p>
                        <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-bold text-gray-600">{countLabel}</span>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>

                {footer && (
                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

const DocumentRow = ({ doc }) => (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm hover:border-gray-200 transition mb-2">
        <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                doc.fileType === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
            }`}>
                <MdBadge size={18} />
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{doc.title || "Document"}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                    {(doc.fileType || "file").toUpperCase()}{doc.uploadedAt ? ` • ${formatShortDate(doc.uploadedAt)}` : ""}
                </p>
                {doc.remark && <p className="mt-1 text-xs text-gray-600">{doc.remark}</p>}
                {doc.uploadedByName && <p className="mt-1 text-[10px] font-semibold text-gray-400">By {doc.uploadedByName}</p>}
            </div>
        </div>
        <button
            type="button"
            onClick={() => openFile(doc.fileURL)}
            className="flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-1"
        >
            <MdOpenInNew size={13} /> Open
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
        <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-4 mb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-bold text-gray-900">Upload {isExtra ? "Extra Document" : "Document"}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Image or PDF, max 5 MB</p>
                </div>
                <MdFileUpload size={20} className="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Document Title</label>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={isExtra ? "Resume, Certificate..." : "Aadhar card, Marksheet..."}
                        className="w-full !h-10 !border !border-gray-200 !rounded-xl bg-white !px-3 !py-2 text-xs focus:border-orange-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Select File</label>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFile}
                        className="w-full !h-10 !border !border-gray-200 !rounded-xl bg-white !px-3 !py-1.5 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-gray-600 focus:border-orange-400 focus:outline-none"
                    />
                </div>
                {isExtra && (
                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Remark</label>
                        <textarea
                            value={remark}
                            onChange={(event) => setRemark(event.target.value)}
                            rows={2}
                            placeholder="Add brief description or remark..."
                            className="w-full resize-none !border !border-gray-200 !rounded-xl bg-white !px-3 !py-2 text-xs focus:border-orange-400 focus:outline-none"
                        />
                    </div>
                )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <p className={`text-[11px] font-medium ${fileError ? "text-red-500" : "text-gray-500"}`}>
                    {fileError || (file ? file.name : "No file selected")}
                </p>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:bg-orange-300"
                >
                    {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <MdCheckCircle size={14} />}
                    Upload File
                </button>
            </div>
        </div>
    );
};

// Shift Readiness Modal
const ReadyStudentModal = ({ name, currentStatus, onConfirm, onCancel, loading }) => {
    const statuses = ["Not Ready", "In Progress", "Ready", "Ready for Interview"];
    const [selected, setSelected] = useState(currentStatus || "Ready");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Update Placement Readiness</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="p-6 space-y-2">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setSelected(s)}
                            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold border transition ${
                                selected === s
                                    ? "bg-orange-50 border-orange-300 text-orange-700 shadow-sm"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={() => onConfirm(selected)} disabled={loading}
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdCheckCircle size={15} />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditProfileModal = ({ raw, onConfirm, onCancel, loading }) => {
    const fileInputRef = useRef(null);
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
        image:         raw.image         || "",
    });
    const ic = "w-full !h-10 !border !border-gray-200 !rounded-xl !px-3 !py-2 text-xs focus:outline-none focus:border-orange-400 bg-white";
    const lc = "block text-xs font-semibold text-gray-600 mb-1";
    const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
    const triggerImageUpload = () => { fileInputRef.current?.click(); };

    return (
        <OrangeButton
            isOpen={true}
            onClose={onCancel}
            panelTitle="Edit Profile"
            panelSubtitle={raw.firstName && raw.lastName ? `${raw.firstName} ${raw.lastName}` : "Student"}
            leftBtnText="Cancel"
            rightBtnText={loading ? "Saving..." : "Save Changes"}
            onLeftClick={onCancel}
            onRightClick={() => onConfirm(form)}
            maxWidth="sm:max-w-lg"
            drawerContent={
                <div className="space-y-4">
                    {/* Profile Header & Image Upload */}
                    <div className="-mx-6 -mt-6 mb-6 p-6 flex flex-col items-center border-b border-gray-100 bg-white">
                        <div className="relative group flex flex-col items-center">
                            {/* Avatar Container */}
                            <div 
                                onClick={triggerImageUpload}
                                className="relative cursor-pointer group/avatar rounded-full p-1 transition-all duration-300 hover:scale-[1.02]"
                                title="Click to change profile picture"
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-400 shadow-md ring-4 ring-orange-500/10 group-hover/avatar:ring-orange-500/30 transition-all duration-300">
                                    {form.image ? (
                                        <img
                                            src={form.image}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold transition-transform duration-300 group-hover/avatar:scale-105">
                                            {(form.firstName?.[0] || "").toUpperCase()}{(form.lastName?.[0] || "").toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Floating Camera Badge */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerImageUpload();
                                    }}
                                    className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95"
                                    title="Upload new photo"
                                >
                                    <FiCamera className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Preview Selected Status */}
                            {form.image && form.image.startsWith("data:image/") && (
                                <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md animate-fade-in">
                                    <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>New photo selected</span>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    if (!file.type.startsWith("image/")) {
                                        toast.error("Please select a valid image file");
                                        return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error("Image size should be less than 5MB");
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        setForm(prev => ({ ...prev, image: reader.result }));
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />

                        {raw.email && (
                            <p className="text-xs text-gray-500 mt-3 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                {raw.email}
                            </p>
                        )}
                    </div>

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
            }
        />
    );
};

// Level History Drawer for Admin/Faculty
const LevelHistoryDrawer = ({ isOpen, onClose, levelHistory = [], student }) => {
    const history = levelHistory || [];
    const completedLevels = history.filter(h => h.status === "completed").length;

    return (
        <OrangeButton
            isOpen={isOpen}
            onClose={onClose}
            panelTitle="Level History"
            panelSubtitle={`${student.firstName || ""} ${student.lastName || ""}`}
            showFooter={false}
            maxWidth="sm:max-w-lg"
            drawerContent={
                <div className="space-y-6">
                    {/* Header stats bar */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Levels</p>
                            <p className="text-lg font-black text-slate-800 mt-1">{history.length}</p>
                        </div>
                        <div className="text-center border-l border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
                            <p className="text-lg font-black text-emerald-600 mt-1">{completedLevels}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-4">
                        <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-100" />
                        <div className="space-y-5">
                            {history.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-xs font-semibold text-slate-400">No level history recorded yet.</p>
                                </div>
                            ) : (
                                history.map((item, idx) => {
                                    const isCurrent = item.status === "in_progress";
                                    const pct = item.totalTasks > 0 
                                        ? Math.round((item.completedTasksCount / item.totalTasks) * 100)
                                        : 0;

                                    return (
                                        <div key={item._id || idx} className="flex items-start gap-4 relative">
                                            {/* dot indicator */}
                                            <div className={`relative z-10 w-4 h-4 rounded-full border-2 mt-1.5 flex-shrink-0 flex items-center justify-center ${
                                                isCurrent 
                                                    ? "bg-orange-500 border-orange-500 shadow-md ring-4 ring-orange-500/10" 
                                                    : "bg-white border-slate-350"
                                            }`}>
                                                {!isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-slate-350" />}
                                            </div>

                                            {/* card content */}
                                            <div className={`flex-1 rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
                                                isCurrent 
                                                    ? "border-orange-100 bg-orange-50/50" 
                                                    : "border-slate-100 bg-white hover:border-slate-200"
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                                                            {item.levelId?.name || "Level"}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                                            {item.subLevelId?.name || "Sub Level"}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                                                        isCurrent 
                                                            ? "bg-orange-50 text-orange-600 border-orange-100" 
                                                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    }`}>
                                                        {isCurrent ? "CURRENT" : "COMPLETED"}
                                                    </span>
                                                </div>

                                                {/* Stats progress bar */}
                                                {item.totalTasks > 0 && (
                                                    <div className="mt-3.5 space-y-1">
                                                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                            <span>{item.completedTasksCount} of {item.totalTasks} Tasks</span>
                                                            <span className={isCurrent ? "text-orange-500" : "text-emerald-500"}>{pct}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${isCurrent ? "bg-orange-500" : "bg-emerald-500"}`} 
                                                                style={{ width: `${pct}%` }} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-2.5 border-t border-slate-100">
                                                    <span>
                                                        {item.startedAt ? `Started: ${new Date(item.startedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                                                    </span>
                                                    <span>
                                                        {item.completedAt ? `Ended: ${new Date(item.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            }
        />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">{isDummy ? "Mark as Dummy" : "Mark as Dropped"}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="p-6 space-y-3.5">
                    <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${isDummy ? "bg-orange-50 border-orange-100 text-orange-700" : "bg-red-50 border-red-100 text-red-700"}`}>
                        <MdWarning size={18} className={`${isDummy ? "text-orange-500" : "text-red-500"} flex-shrink-0 mt-0.5`} />
                        <p className="text-xs">
                            This will mark the student as <strong>{isDummy ? "Dummy" : "Dropped"}</strong>.
                        </p>
                    </div>

                    {isDummy && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason <span className="text-red-400">*</span></label>
                            <input
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter dummy student reason..."
                                className="w-full !h-10 !border !border-gray-200 !rounded-xl !px-3 !py-2 text-xs focus:outline-none focus:border-orange-400 bg-white"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {isDummy ? "Remark" : "Reason"} {!isDummy && <span className="text-red-400">*</span>}
                        </label>
                        <textarea value={remark} onChange={e => setRemark(e.target.value)}
                            rows={3} placeholder={isDummy ? "Add remark..." : "Enter reason for dropping..."}
                            className="w-full !border !border-gray-200 !rounded-xl !px-3 !py-2 text-xs focus:outline-none focus:border-red-400 resize-none bg-white" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Application Document <span className="text-red-400">*</span>
                            <span className="text-gray-400 font-normal ml-1">(image/PDF max 5MB)</span>
                        </label>
                        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-3 cursor-pointer transition ${
                            fileData ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}>
                            <MdFileUpload size={18} className={fileData ? "text-green-500" : "text-gray-400"} />
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
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading}
                        className={`flex-1 py-2.5 text-xs font-semibold text-white rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-sm ${isDummy ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600"}`}>
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdWarning size={15} />}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Promote Student</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{name}</p>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <div className="p-6">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Remark <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea
                        value={remark} onChange={e => setRemark(e.target.value)}
                        rows={3} placeholder="Add a promotion remark..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-green-400 resize-none"
                    />
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onCancel} className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={() => onConfirm(remark)} disabled={loading}
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdArrowUpward size={15} />}
                        Promote
                    </button>
                </div>
            </div>
        </div>
    );
};

// MAIN STUDENT PROFILE PAGE (Clean 100% Dynamic API Data + Reference UI Template)
const StudentProfilePage = () => {
    const location   = useLocation();
    const navigate   = useNavigate();
    const { id }     = useParams();
    const { student, level, subdepartment } = location.state || {};
    const studentId  = student?._id || student?.raw?._id || id;

    const [moreOpen,      setMoreOpen]      = useState(false);
    const [promoteModal,  setPromoteModal]  = useState(false);
    const [readyModal,    setReadyModal]    = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [editModal,     setEditModal]     = useState(false);
    const [dropModal,     setDropModal]     = useState(false);
    const [dummyModal,    setDummyModal]    = useState(false);
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

    const { data: levelHistoryResponse } = useGetStudentLevelHistoryQuery(
        studentId,
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
                <p className="text-sm font-semibold">No student data found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">Go Back</button>
            </div>
        );
    }

    if (!studentFull && studentId && !student) {
        return (
            <div className="p-12 text-center text-gray-400">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <p className="text-xs font-semibold">Loading student record...</p>
            </div>
        );
    }

    const raw      = baseStudent;
    const name     = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const readinessStatus = raw.placement?.readinessStatus || "Not Ready";

    const totalTasks     = taskData?.totalTasks     || 0;
    const completedTasks = taskData?.completedTasks || 0;
    const pendingTasks   = taskData?.pendingTasks   || 0;
    const overdueTasks   = taskData?.overdueTasks   || taskData?.overDueTasks || 0;
    const subjectGroups  = taskData?.groupedBySubject || {};
    
    const subjects = Object.entries(subjectGroups).map(([sName, group]) => {
        const tasks = group.tasks || [];
        const done  = tasks.filter(t => t.status === "completed").length;
        return { 
            name: sName, 
            pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
            tasksCount: tasks.length,
            completedCount: done
        };
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const allSubjectTasks = Object.values(subjectGroups).flatMap(group => group.tasks || []);
    const evaluatedTasks = allSubjectTasks.filter(t => typeof t.marks === "number");
    const averageMarks = evaluatedTasks.length > 0
        ? (evaluatedTasks.reduce((sum, t) => sum + t.marks, 0) / evaluatedTasks.length).toFixed(1)
        : null;

    const currentSubLevelName = raw.currentSubLevelId?.name || level?.currentSubLevelName || "—";
    const currentLevelLabel   = raw.currentLevelId?.name || level?.name || "—";

    const activityItems = (activityResponse?.data || []).map((item) => ({
        ...item,
        time: item.createdAt,
    }));

    const documents = Array.isArray(raw.documents) ? raw.documents : [];
    const regularDocs = documents.filter(doc => !doc.isExtra);
    const extraDocs = documents.filter(doc => doc.isExtra);
    const permissionHistory = Array.isArray(raw.permissions) ? raw.permissions : [];
    const pendingPermissions = permissionHistory.filter(item => item.status === "pending").length;

    const goToTaskBoard = () => {
        navigate("/student/task-board", {
            state: {
                student: raw,
                level: level || raw.currentLevelId,
                subdepartment: subdepartment || raw.subDepartmentId,
            },
        });
    };

    const handlePromote = async (remark) => {
        try {
            await promoteStudent(raw._id).unwrap();
            toast.success(`${name} promoted successfully!`);
            setPromoteModal(false);
            navigate(-1);
        } catch (err) {
            toast.error(err?.data?.message || "Promotion failed");
        }
    };

    const handleFtpToggle = async () => {
        setFtpLoading(true);
        try {
            await updateStudent({ id: raw._id, data: { isFTP: !raw.isFTP } }).unwrap();
            toast.success(raw.isFTP ? "FTP status removed" : "Student shifted to FTP");
            navigate(0);
        } catch (err) {
            toast.error(err?.data?.message || "FTP update failed");
        } finally {
            setFtpLoading(false);
        }
    };

    const handleReadiness = async (status) => {
        setReadyLoading(true);
        try {
            await updatePlacementReadiness({ id: raw._id, readinessStatus: status }).unwrap();
            toast.success(`Placement status updated to "${status}"`);
            setReadyModal(false);
        } catch (err) {
            toast.error(err?.data?.message || "Update failed");
        } finally {
            setReadyLoading(false);
        }
    };

    const handleEditProfile = async (form) => {
        setEditLoading(true);
        try {
            if (form.image && form.image.startsWith("data:image/")) {
                const baseUrl = import.meta.env.VITE_API_URL;
                const url = `${baseUrl}/students/${raw._id}/profile-image`;
                const r = await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ image: form.image })
                });
                if (!r.ok) {
                    const errData = await r.json();
                    throw new Error(errData.message || "Failed to update profile photo");
                }
            }

            const { image, ...otherFields } = form;
            await updateStudent({ id: raw._id, data: otherFields }).unwrap();
            toast.success("Profile updated successfully");
            setEditModal(false);
            navigate(0);
        } catch (err) {
            toast.error(err?.message || err?.data?.message || "Update failed");
        } finally {
            setEditLoading(false);
        }
    };

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
            {historyDrawerOpen && (
                <LevelHistoryDrawer
                    isOpen={historyDrawerOpen}
                    onClose={() => setHistoryDrawerOpen(false)}
                    levelHistory={levelHistoryResponse?.data || []}
                    student={raw}
                />
            )}
            {dropModal && (
                <MarkDroppedModal name={name} onConfirm={handleMarkDropped} onCancel={() => setDropModal(false)} loading={dropLoading} />
            )}
            {dummyModal && (
                <MarkDroppedModal name={name} onConfirm={handleMarkDummy} onCancel={() => setDummyModal(false)} loading={dummyLoading} variant="dummy" />
            )}
            <FullStudentActivityModal
                isOpen={activityModal}
                onClose={() => setActivityModal(false)}
                name={name}
                activityItems={activityItems}
            />
            <ProfileSectionModal
                isOpen={sectionModal === "documents"}
                onClose={() => setSectionModal(null)}
                title="Core Documents"
                subtitle={name}
                countLabel={`${regularDocs.length} Documents`}
            >
                <DocumentUploadPanel type="document" loading={uploadingDocument} onUpload={handleDocumentUpload} />
                {regularDocs.map(doc => <DocumentRow key={doc._id || doc.fileURL} doc={doc} />)}
            </ProfileSectionModal>
            <ProfileSectionModal
                isOpen={sectionModal === "extraDocuments"}
                onClose={() => setSectionModal(null)}
                title="Extra Supporting Documents"
                subtitle={name}
                countLabel={`${extraDocs.length} Supporting Files`}
            >
                <DocumentUploadPanel type="extra" loading={uploadingExtraDocument} onUpload={handleExtraDocumentUpload} />
                {extraDocs.map(doc => <DocumentRow key={doc._id || doc.fileURL} doc={doc} />)}
            </ProfileSectionModal>

            {/* TOP TITLE BAR WITH SEARCH & ID */}
            <div className="bg-[#F8F9FA] min-h-screen px-8 py-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Record</h1>
                        {raw.prkey && (
                            <span className="bg-slate-200/70 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md border border-slate-300/50">
                                ID: {raw.prkey}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Bar Flex Container */}
                        <div className="flex items-center h-10 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-xl px-3.5 shadow-sm hover:border-slate-300 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all duration-200">
                            <MdSearch className="text-slate-400 flex-shrink-0 mr-2.5" size={18} />
                            <input
                                type="text"
                                placeholder="Search student records..."
                                className="w-full !h-full bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!outline-none focus:!border-none text-xs font-medium text-slate-800 placeholder-slate-400 !p-0 !shadow-none"
                            />
                        </div>

                        {/* Notification Button */}
                        <button
                            type="button"
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 relative flex-shrink-0"
                            title="Notifications"
                        >
                            <MdNotificationsNone size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
                        </button>
                    </div>
                </div>

                {/* HERO CARD */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            {/* Avatar with Status Ring */}
                            <div className="relative flex-shrink-0">
                                {raw.image ? (
                                    <img src={raw.image} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold border-4 border-slate-100 shadow-sm">
                                        {initials}
                                    </div>
                                )}
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>

                            {/* Info Section */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h2>
                                    <MdVerified size={20} className="text-orange-500" />
                                    {raw.isFTP && (
                                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                                            FTP
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-orange-500">
                                    {raw.course || "Course"} • {currentLevelLabel} ({currentSubLevelName})
                                </p>

                                {/* Placement Badge */}
                                <div className="pt-1">
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                        <MdCheckCircle size={14} /> PLACEMENT {readinessStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Buttons */}
                        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                            <button
                                onClick={goToTaskBoard}
                                className="flex items-center gap-2 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
                            >
                                <MdAssignment size={16} /> Task Board
                            </button>
                            <button
                                onClick={() => setEditModal(true)}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
                            >
                                <MdEdit size={16} /> Edit Profile
                            </button>

                            {/* Actions Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setMoreOpen(p => !p)}
                                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1 text-xs font-bold"
                                >
                                    Actions <MdMoreVert size={18} />
                                </button>
                                {moreOpen && (
                                    <>
                                        <div className="fixed inset-0 z-20" onClick={() => setMoreOpen(false)} />
                                        <div className="absolute right-0 top-11 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl w-52 py-1.5 text-slate-700 text-xs font-semibold">
                                            <button onClick={() => { setMoreOpen(false); setPromoteModal(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-emerald-600 flex items-center gap-2">
                                                <MdArrowUpward size={14} /> Promote Student
                                            </button>
                                            <button onClick={handleFtpToggle} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-orange-600 flex items-center gap-2">
                                                <MdArrowUpward size={14} /> {raw.isFTP ? "Remove FTP" : "Shift to FTP"}
                                            </button>
                                            <button onClick={() => { setMoreOpen(false); setReadyModal(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                                                <MdCheckCircle size={14} /> Shift Placement Status
                                            </button>
                                            <button onClick={() => { setMoreOpen(false); navigate(`/student/${raw._id}/report`); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2">
                                                <MdBarChart size={14} /> View Report Card
                                            </button>
                                            <div className="border-t border-slate-100 my-1" />
                                            <button onClick={() => { setMoreOpen(false); setDummyModal(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-amber-600 flex items-center gap-2">
                                                <MdWarning size={14} /> Mark Dummy
                                            </button>
                                            <button onClick={() => { setMoreOpen(false); setDropModal(true); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600 flex items-center gap-2">
                                                <MdWarning size={14} /> Mark Dropped
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Full Contact & Student Personal Info Row */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
                        {raw.email && (
                            <div className="flex items-center gap-2">
                                <MdEmail className="text-orange-500" size={16} />
                                <span>{raw.email}</span>
                            </div>
                        )}
                        {raw.studentMobile && (
                            <div className="flex items-center gap-2">
                                <MdPhone className="text-orange-500" size={16} />
                                <span>{raw.studentMobile}</span>
                            </div>
                        )}
                        {raw.parentMobile && (
                            <div className="flex items-center gap-2">
                                <MdPhone className="text-emerald-500" size={16} />
                                <span>Parent: {raw.parentMobile}</span>
                            </div>
                        )}
                        {raw.fatherName && (
                            <div className="flex items-center gap-2">
                                <MdPerson className="text-orange-500" size={16} />
                                <span>Father: {raw.fatherName}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <MdBusiness className="text-orange-500" size={16} />
                            <span>Dept: {raw.subDepartmentId?.departmentId?.name || "Dept"} / {subdepartment?.name || raw.subDepartmentId?.name || "Sub Dept"}</span>
                        </div>
                        {raw.sessionId?.name && (
                            <div className="flex items-center gap-2">
                                <MdCalendarToday className="text-orange-500" size={16} />
                                <span>Session: {raw.sessionId.name} <span className="text-emerald-600 font-bold">(Active)</span></span>
                            </div>
                        )}
                        {raw.village && (
                            <div className="flex items-center gap-2">
                                <MdLocationOn className="text-orange-500" size={16} />
                                <span>Village: {raw.village}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4 STAT CARDS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {/* Card 1: LEVEL HISTORY */}
                    <div 
                        onClick={() => setHistoryDrawerOpen(true)}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-2 cursor-pointer hover:border-orange-200 transition group"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-orange-500 transition">LEVEL HISTORY</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-500 transition">{currentLevelLabel}</h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPromoteModal(true);
                                }}
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full transition"
                            >
                                +1 Level Up
                            </button>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 pt-1">
                            <div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${completionRate}%` }} />
                        </div>
                    </div>

                    {/* Card 2: REPORT */}
                    <div
                        onClick={() => navigate(`/student/${raw._id}/report`)}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-1 cursor-pointer hover:border-orange-200 transition group"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REPORT</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-500 transition">View</h3>
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center">
                                <MdBarChart size={18} />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">Student Report card</p>
                    </div>

                    {/* Card 3: ATTENDANCE RATE */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATTENDANCE RATE</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">{raw.attendanceRate ? `${raw.attendanceRate}%` : "100%"}</h3>
                            <span className="bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <MdCheckCircle size={12} /> Active
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">Monthly attendance tracker</p>
                    </div>

                    {/* Card 4: OVERALL PERFORMANCE */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OVERALL PERFORMANCE</p>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">{averageMarks ? `${averageMarks}%` : `${completionRate}%`}</h3>
                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <MdTrendingUp size={12} /> Task Score
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">Rating: {averageMarks || "N/A"}</p>
                    </div>
                </div>

                {/* MIDDLE ROW (ATTENDANCE & TASK TREND + TASK COMPLETION) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Box: Attendance & Task Trend Chart (2 Cols) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Task & Attendance Trend</h3>
                                <p className="text-xs text-slate-400 font-medium">Monthly progress across assigned subjects</p>
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                                Active Level Progress
                            </span>
                        </div>

                        {/* Line Area Chart SVG */}
                        <div className="relative h-56 w-full pt-4">
                            <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 0 120 Q 80 80, 160 110 T 320 60 T 500 30 L 500 160 L 0 160 Z"
                                    fill="url(#orangeGrad)"
                                />
                                <path
                                    d="M 0 120 Q 80 80, 160 110 T 320 60 T 500 30"
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2 px-2">
                                <span>Level Start</span>
                                <span>Mid Progress</span>
                                <span>Current Level</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Box: Task Completion (1 Col) */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-black text-slate-900 mb-4">Task Completion</h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                                        <circle cx="60" cy="60" r="48" fill="none" stroke="#f97316" strokeWidth="14"
                                            strokeDasharray={`${(completionRate / 100) * 301.6} 301.6`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-black text-slate-900">{completionRate}%</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900">{currentSubLevelName} Tasks</h4>
                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{completedTasks} of {totalTasks} completed</p>
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-3.5">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700">Completed Tasks</span>
                                        <span className="text-emerald-500">{completionRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700">Pending Tasks</span>
                                        <span className="text-orange-500">{totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%` }} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-700">Overdue Tasks</span>
                                        <span className="text-rose-500">{totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-rose-500" style={{ width: `${totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW (SUBJECT PERFORMANCE + REAL ACADEMIC ACTIVITY TIMELINE) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Box: Subject Performance */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-black text-slate-900 mb-5">Subject Performance</h3>

                            {subjects.length > 0 ? (
                                <div className="space-y-4">
                                    {subjects.map((sub, idx) => (
                                        <div key={sub.name} className="flex items-center gap-4">
                                            <span className="w-36 text-xs font-bold text-slate-700 truncate">{sub.name}</span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${idx % 2 === 0 ? "bg-orange-500" : "bg-orange-400/80"}`}
                                                    style={{ width: `${sub.pct}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-xs font-black text-slate-900">{sub.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                    <p className="text-xs font-semibold text-slate-500">No subject tasks assigned yet.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-400">
                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Completed Tasks</span>
                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-300" /> Total Curriculum</span>
                        </div>
                    </div>

                    {/* Right Box: Academic Timeline & Real Activity Stream */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-black text-slate-900">Academic Timeline</h3>
                            <button onClick={() => setActivityModal(true)} className="text-xs font-bold text-orange-500 hover:text-orange-600">View All</button>
                        </div>

                        <div className="space-y-4 relative pl-2">
                            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100" />

                            {activityItems.length > 0 ? activityItems.slice(0, 4).map((item, idx) => (
                                <div key={item._id || idx} className="flex items-start gap-3.5 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                        <MdWork size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                                            {item.sub ? `${item.sub} • ` : ""}{formatDateTime(item.time)}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                    <p className="text-xs font-semibold text-slate-500">No activity events recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM QUICK ACCESS MODULE CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 pt-2 pb-6">
                    <div
                        onClick={() => setSectionModal("documents")}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-orange-200 transition cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center font-bold">
                                <MdBadge size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-slate-900 group-hover:text-orange-500 transition">Core Documents</p>
                                <p className="text-[11px] font-semibold text-slate-400">{regularDocs.length} files uploaded</p>
                            </div>
                        </div>
                        <MdArrowForward size={16} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                    </div>

                    <div
                        onClick={() => setSectionModal("extraDocuments")}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-orange-200 transition cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                                <MdFolderSpecial size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-slate-900 group-hover:text-orange-500 transition">Extra Documents</p>
                                <p className="text-[11px] font-semibold text-slate-400">{extraDocs.length} supporting files</p>
                            </div>
                        </div>
                        <MdArrowForward size={16} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                    </div>

                    <div
                        onClick={() => setReadyModal(true)}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-orange-200 transition cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
                                <MdWork size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-slate-900 group-hover:text-orange-500 transition">Placement Status</p>
                                <p className="text-[11px] font-semibold text-slate-400">{readinessStatus}</p>
                            </div>
                        </div>
                        <MdArrowForward size={16} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                    </div>

                    <div
                        onClick={() => navigate("/leave-requests")}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-orange-200 transition cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
                                <MdCalendarToday size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-slate-900 group-hover:text-orange-500 transition">Leave Permissions</p>
                                <p className="text-[11px] font-semibold text-slate-400">{pendingPermissions} pending requests</p>
                            </div>
                        </div>
                        <MdArrowForward size={16} className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
                    </div>
                </div>

            </div>
        </>
    );
};

export default StudentProfilePage;
