import { useState } from "react";
import { toast } from "react-toastify";
import { MdClose, MdCheckCircle, MdAccessTime, MdWarning, MdArrowUpward } from "react-icons/md";
import {
    useGetMyPermissionsQuery,
    useApplyMyPermissionMutation,
} from "../../../redux/api/studentApi";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const statusBadge = (status = "") => {
    const s = status.toLowerCase();
    if (s === "approved") return "bg-green-50 text-green-600";
    if (s === "rejected") return "bg-red-50 text-red-500";
    return "bg-orange-50 text-orange-500";
};

const StatusIcon = ({ status }) => {
    if (status === "approved") return <MdCheckCircle size={14} className="text-green-500" />;
    if (status === "rejected") return <MdWarning size={14} className="text-red-500" />;
    return <MdAccessTime size={14} className="text-orange-500" />;
};

// ── Apply Permission Modal ────────────────────────────────────────────────────
const ApplyModal = ({ onClose }) => {
    const [form, setForm] = useState({ reason: "", fromDate: "", toDate: "" });
    const [file, setFile]   = useState(null);
    const [fileErr, setFileErr] = useState("");
    const [applyPermission, { isLoading }] = useApplyMyPermissionMutation();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
            setFileErr("Only image or PDF allowed"); return;
        }
        if (f.size > 5 * 1024 * 1024) { setFileErr("File must be under 5 MB"); return; }
        setFileErr("");
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reason.trim() || !form.fromDate || !form.toDate) {
            toast.error("Reason, From Date and To Date are required"); return;
        }
        if (new Date(form.toDate) < new Date(form.fromDate)) {
            toast.error("To Date must be after From Date"); return;
        }

        let imageURL = "";
        if (file) {
            imageURL = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.readAsDataURL(file);
            });
        }

        try {
            await applyPermission({ ...form, imageURL: imageURL || undefined }).unwrap();
            toast.success("Permission applied successfully!");
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to apply permission");
        }
    };

    const ic = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400";
    const lc = "block text-xs font-semibold text-gray-600 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-sm font-bold text-gray-800">Apply for Permission</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                    <div>
                        <label className={lc}>Reason <span className="text-red-400">*</span></label>
                        <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                            rows={3} placeholder="Enter reason for permission..."
                            className={`${ic} resize-none`} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>From Date <span className="text-red-400">*</span></label>
                            <input type="date" value={form.fromDate} onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))} className={ic} />
                        </div>
                        <div>
                            <label className={lc}>To Date <span className="text-red-400">*</span></label>
                            <input type="date" value={form.toDate} onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))} className={ic} />
                        </div>
                    </div>

                    <div>
                        <label className={lc}>
                            Supporting Document <span className="text-gray-400 font-normal">(optional — image or PDF)</span>
                        </label>
                        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
                            file ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}>
                            <MdArrowUpward size={18} className={file ? "text-green-500" : "text-gray-400"} />
                            <p className={`text-xs ${file ? "font-semibold text-green-700" : "text-gray-500"}`}>
                                {file ? file.name : "Click to upload document"}
                            </p>
                            <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                        </label>
                        {fileErr && <p className="text-[11px] text-red-500 mt-1">{fileErr}</p>}
                    </div>
                </form>

                <div className="flex gap-3 px-5 pb-5 flex-shrink-0">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-2">
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdCheckCircle size={15} />}
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentPermissions() {
    const [applyOpen, setApplyOpen] = useState(false);
    const { data, isLoading } = useGetMyPermissionsQuery();
    const permissions = data?.data || [];
    const pending  = permissions.filter(p => p.status === "pending").length;
    const approved = permissions.filter(p => p.status === "approved").length;

    return (
        <div className="space-y-5">
            {applyOpen && <ApplyModal onClose={() => setApplyOpen(false)} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Permissions</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{permissions.length} total · {pending} pending · {approved} approved</p>
                </div>
                <button onClick={() => setApplyOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition">
                    + Apply Permission
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total",    value: permissions.length, color: "text-gray-800" },
                    { label: "Pending",  value: pending,            color: "text-orange-500" },
                    { label: "Approved", value: approved,           color: "text-green-600" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm font-semibold text-gray-500">No permission requests yet.</p>
                        <button onClick={() => setApplyOpen(true)} className="mt-3 text-sm font-semibold text-orange-500 hover:underline">
                            Apply your first permission →
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {permissions.map((item, i) => (
                            <div key={item._id || i} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <StatusIcon status={item.status} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{item.reason || "Permission request"}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatDate(item.fromDate)} → {formatDate(item.toDate)}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Applied: {formatDate(item.uploadDate)}</p>
                                            {item.remark && (
                                                <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg px-2 py-1">
                                                    Remark: {item.remark}
                                                </p>
                                            )}
                                            {item.approvedBy && (
                                                <p className="text-[11px] text-green-600 mt-1">Approved by: {item.approvedBy}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                        {item.imageURL && (
                                            <button onClick={() => window.open(item.imageURL, "_blank")}
                                                className="text-[11px] font-semibold text-blue-600 hover:underline">
                                                View Doc
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
