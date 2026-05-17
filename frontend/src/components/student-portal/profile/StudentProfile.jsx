import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { MdVerified, MdEdit, MdClose, MdCheckCircle, MdVisibility, MdVisibilityOff } from "react-icons/md";
import {
    useGetMyStudentProfileQuery,
    useUpdateMyStudentProfileImageMutation,
    useChangeMyStudentPasswordMutation,
} from "../../../redux/api/studentApi";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── Change Password Modal ─────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ current: false, new: false, confirm: false });
    const [changePassword, { isLoading }] = useChangeMyStudentPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
            toast.error("All fields are required"); return;
        }
        if (form.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters"); return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error("New passwords do not match"); return;
        }
        try {
            await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }).unwrap();
            toast.success("Password changed successfully!");
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to change password");
        }
    };

    const ic = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 pr-10";
    const lc = "block text-xs font-semibold text-gray-600 mb-1.5";

    const PasswordField = ({ field, label, showKey }) => (
        <div>
            <label className={lc}>{label} <span className="text-red-400">*</span></label>
            <div className="relative">
                <input
                    type={show[showKey] ? "text" : "password"}
                    value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={label}
                    className={ic}
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show[showKey] ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Change Password</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MdClose size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                    <PasswordField field="currentPassword"  label="Current Password" showKey="current" />
                    <PasswordField field="newPassword"      label="New Password"     showKey="new" />
                    <PasswordField field="confirmPassword"  label="Confirm Password" showKey="confirm" />
                </form>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading}
                        className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 rounded-xl transition flex items-center justify-center gap-2">
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdCheckCircle size={15} />}
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentProfile() {
    const [pwdModal, setPwdModal] = useState(false);
    const fileRef = useRef(null);

    const { data, isLoading, refetch } = useGetMyStudentProfileQuery();
    const [updateImage, { isLoading: uploading }] = useUpdateMyStudentProfileImageMutation();

    const raw  = data?.data || {};
    const name = `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Student";
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
        if (file.size > 3 * 1024 * 1024)    { toast.error("Image must be under 3 MB"); return; }

        const image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
        });

        try {
            await updateImage({ image }).unwrap();
            toast.success("Profile image updated!");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Image update failed");
        }
    };

    if (isLoading) return (
        <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const personalFields = [
        { label: "PR Key",        value: raw.prkey },
        { label: "First Name",    value: raw.firstName },
        { label: "Last Name",     value: raw.lastName },
        { label: "Father Name",   value: raw.fatherName },
        { label: "Gender",        value: raw.gender },
        { label: "Date of Birth", value: formatDate(raw.dob) },
        { label: "Email",         value: raw.email },
        { label: "Mobile",        value: raw.studentMobile },
        { label: "Parent Mobile", value: raw.parentMobile },
        { label: "Village",       value: raw.village },
        { label: "Address",       value: raw.address },
    ];

    const academicFields = [
        { label: "Course",         value: raw.course },
        { label: "Stream",         value: raw.stream },
        { label: "Category",       value: raw.category },
        { label: "10th %",         value: raw.percent10 },
        { label: "12th %",         value: raw.percent12 },
        { label: "12th Subject",   value: raw.subject12 },
        { label: "12th Year",      value: raw.year12 },
        { label: "Current Level",  value: raw.currentLevelId?.name },
        { label: "Current SubLevel", value: raw.currentSubLevelId?.name },
        { label: "Session",        value: raw.sessionId?.name },
        { label: "Sub Department", value: raw.subDepartmentId?.name },
    ];

    return (
        <div className="space-y-5 max-w-2xl">
            {pwdModal && <ChangePasswordModal onClose={() => setPwdModal(false)} />}

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">My Profile</h2>
                <button onClick={() => setPwdModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition">
                    <MdEdit size={15} /> Change Password
                </button>
            </div>

            {/* Avatar Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="relative flex-shrink-0">
                        {raw.image ? (
                            <img src={raw.image} alt={name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl font-bold">{initials}</div>
                        )}
                        <button onClick={() => fileRef.current?.click()} disabled={uploading}
                            className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition">
                            {uploading
                                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <MdEdit size={14} />}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                            <MdVerified size={18} className="text-blue-500" />
                            {raw.isFTP && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">FTP</span>}
                        </div>
                        <p className="text-sm text-blue-600 font-semibold mt-0.5">
                            {raw.course} · {raw.currentLevelId?.name} · {raw.currentSubLevelId?.name}
                        </p>
                        <span className={`mt-2 inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            raw.status === "Active"  ? "bg-green-50 text-green-600" :
                            raw.status === "Placed"  ? "bg-purple-50 text-purple-600" :
                            raw.status === "Dropped" ? "bg-red-50 text-red-500" :
                            "bg-gray-50 text-gray-500"
                        }`}>{raw.status}</span>
                    </div>
                </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {personalFields.map(({ label, value }) => (
                        <div key={label} className="bg-white px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                            <p className="text-xs font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Academic Info */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800">Academic Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-100">
                    {academicFields.map(({ label, value }) => (
                        <div key={label} className="bg-white px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                            <p className="text-xs font-semibold text-gray-800 mt-0.5">{value || "—"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
