import { useState } from "react";
import { toast } from "react-toastify";
import { MdArrowUpward, MdCheckCircle, MdInsertDriveFile } from "react-icons/md";
import {
    useGetMyStudentProfileQuery,
    useGetMyExtraDocumentsQuery,
    useUploadMyExtraDocumentMutation,
} from "../../../redux/api/studentApi";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const DocRow = ({ doc }) => (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                doc.fileType === "pdf" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
            }`}>
                <MdInsertDriveFile size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.title || "Document"}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                    {(doc.fileType || "file").toUpperCase()} · {formatDate(doc.uploadedAt)}
                </p>
                {doc.remark && <p className="text-xs text-gray-500 mt-0.5">{doc.remark}</p>}
            </div>
        </div>
        <button onClick={() => window.open(doc.fileURL, "_blank", "noopener,noreferrer")}
            className="flex-shrink-0 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
            Open
        </button>
    </div>
);

// ── Upload Panel ──────────────────────────────────────────────────────────────
const UploadPanel = ({ onSuccess }) => {
    const [title,   setTitle]   = useState("");
    const [remark,  setRemark]  = useState("");
    const [file,    setFile]    = useState(null);
    const [fileErr, setFileErr] = useState("");
    const [uploadDoc, { isLoading }] = useUploadMyExtraDocumentMutation();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
            setFileErr("Only image or PDF allowed"); return;
        }
        if (f.size > 5 * 1024 * 1024) { setFileErr("File must be under 5 MB"); return; }
        setFileErr("");
        setFile(f);
        if (!title.trim()) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    };

    const handleUpload = async () => {
        if (!title.trim()) { toast.error("Title is required"); return; }
        if (!file)         { toast.error("Please select a file"); return; }

        const fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
        });

        try {
            await uploadDoc({
                title: title.trim(),
                fileData,
                fileType: file.type === "application/pdf" ? "pdf" : "image",
                remark: remark.trim() || undefined,
            }).unwrap();
            toast.success("Document uploaded successfully!");
            setTitle(""); setRemark(""); setFile(null); setFileErr("");
            onSuccess?.();
        } catch (err) {
            toast.error(err?.data?.message || "Upload failed");
        }
    };

    const ic = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400";

    return (
        <div className="bg-orange-50/40 border border-dashed border-orange-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Upload Extra Document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title <span className="text-red-400">*</span></label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Resume, certificate..." className={ic} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">File <span className="text-red-400">*</span></label>
                    <input type="file" accept="image/*,.pdf" onChange={handleFile}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gray-600 focus:outline-none" />
                    {fileErr && <p className="text-[11px] text-red-500 mt-1">{fileErr}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Remark <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="Short description..." className={ic} />
                </div>
            </div>
            <div className="flex justify-end">
                <button onClick={handleUpload} disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition">
                    {isLoading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <MdArrowUpward size={15} />}
                    Upload
                </button>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentDocuments() {
    const { data: profileData } = useGetMyStudentProfileQuery();
    const { data: extraData, refetch } = useGetMyExtraDocumentsQuery();

    const allDocs   = profileData?.data?.documents || [];
    const coreDocs  = allDocs.filter(d => !d.isExtra);
    const extraDocs = extraData?.data || allDocs.filter(d => d.isExtra);

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-bold text-gray-900">My Documents</h2>
                <p className="text-sm text-gray-500 mt-0.5">{coreDocs.length} core · {extraDocs.length} extra</p>
            </div>

            {/* Core Documents */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Core Documents</h3>
                    <p className="text-xs text-gray-500 mt-0.5">ID proof, marksheets, admission documents</p>
                </div>
                {coreDocs.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-400">No core documents uploaded yet.</p>
                        <p className="text-xs text-gray-400 mt-1">Contact admin to upload your documents.</p>
                    </div>
                ) : coreDocs.map((doc, i) => <DocRow key={doc._id || i} doc={doc} />)}
            </div>

            {/* Extra Documents */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Extra Documents</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Resume, certificates, achievements</p>
                </div>
                <div className="p-5 space-y-4">
                    <UploadPanel onSuccess={refetch} />
                    {extraDocs.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-400">No extra documents yet. Upload your first one above.</p>
                        </div>
                    ) : extraDocs.map((doc, i) => <DocRow key={doc._id || i} doc={doc} />)}
                </div>
            </div>
        </div>
    );
}
