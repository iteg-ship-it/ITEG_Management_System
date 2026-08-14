import { useState, useMemo } from "react";
import { MdCalendarMonth, MdAdd, MdEdit, MdDelete, MdCheckCircle, MdRadioButtonUnchecked, MdSchedule, MdEventAvailable, MdArchive, MdSearch, MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import {
  useGetAllSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useActivateSessionMutation,
  useDeactivateSessionMutation,
  useUpdateSessionStatusMutation,
} from "../../../../redux/api/authApi";
import Header from "../../../shared/sidebar/Header";
import Loader from "../../../shared/loader/Loader";
import SelectDropdown from "../../../shared/form-fields/SelectDropdown";

const STATUS_TABS = [
  { id: "all", label: "All Sessions" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "archived", label: "Archived" },
  { id: "completed", label: "Completed" },
];

const SessionManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Pass all=true so admin can see all sessions (active, upcoming, archived, completed)
  const { data, isLoading, refetch } = useGetAllSessionsQuery(true);
  const sessions = data?.data || [];

  const [createSession] = useCreateSessionMutation();
  const [updateSession] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [activateSession] = useActivateSessionMutation();
  const [deactivateSession] = useDeactivateSessionMutation();
  const [updateSessionStatus] = useUpdateSessionStatusMutation();

  const getComputedStatus = (session) => {
    if (session.isActive) return 'active';
    if (session.status) return session.status;
    const now = new Date();
    const start = new Date(session.startDate);
    const end = new Date(session.endDate);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const computedStatus = getComputedStatus(s);
      const matchStatus = statusFilter === "all" || computedStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [sessions, searchQuery, statusFilter]);

  const openAdd = () => {
    setEditingSession(null);
    setFormData({ name: "", startDate: "", endDate: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditingSession(s);
    setFormData({
      name: s.name,
      startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : "",
      endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : "",
      description: s.description || ""
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({ name: "", startDate: "", endDate: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      toast.error("Name, start date, and end date are required");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSession) {
        await updateSession({ id: editingSession._id, ...formData }).unwrap();
        toast.success("Session updated successfully!");
      } else {
        await createSession(formData).unwrap();
        toast.success("Session created successfully!");
      }
      handleCancel();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(id).unwrap();
      toast.success("Session deleted!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'active') {
        await activateSession(id).unwrap();
        try { await updateSessionStatus({ id, status: 'active' }).unwrap(); } catch (_) { }
      } else {
        await updateSessionStatus({ id, status: newStatus }).unwrap();
        try { await deactivateSession(id).unwrap(); } catch (_) { }
      }
      toast.success(`Session status updated to ${newStatus}!`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Status update failed");
    }
  };

  const getStatusSelectClass = (status) => {
    const base = "w-full text-[11px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-all duration-200 shadow-2xs hover:shadow-xs";
    if (status === 'active') return `${base} bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300`;
    if (status === 'upcoming') return `${base} bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300`;
    if (status === 'archived') return `${base} bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300`;
    return `${base} bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300`;
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <Header
        title="Session Management"
        badge={`${sessions.length} total sessions`}
        breadcrumbs={[{ label: "Settings" }, { label: "Sessions" }]}
      />

      <div className="px-6 py-6 w-full space-y-6">

        {/* Top actions layout */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs">
          {sessions.length > 0 && (
            <div className="relative w-72 sm:w-80">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions by name or details..."
                className="w-full pl-9 pr-3.5 h-10 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-slate-50/50 hover:bg-white text-slate-800 placeholder-slate-455 transition-all duration-200 shadow-3xs"
              />
            </div>
          )}

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <MdAdd size={16} /> Add New Session
          </button>

        </div>

        {/* Status Tabs with styled count badges */}
        <div className="flex gap-1.5 overflow-x-auto bg-slate-100/70 p-1 rounded-xl border border-slate-200/50 w-fit">
          {STATUS_TABS.map((tab) => {
            const count = tab.id === "all"
              ? sessions.length
              : sessions.filter(s => getComputedStatus(s) === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${statusFilter === tab.id
                  ? "bg-white text-orange-500 shadow-3xs font-extrabold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusFilter === tab.id ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-500"
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of filtered session cards */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center py-20 text-center shadow-3xs">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
              <MdCalendarMonth size={28} className="text-orange-550" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">No sessions match filters</h3>
            <p className="text-xs text-slate-400 font-medium">
              Try adjusting your query or create a new academic session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSessions.map((session) => {
              const currentStatus = getComputedStatus(session);
              const isActive = currentStatus === 'active';
              return (
                <div
                  key={session._id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group ${isActive ? "border-orange-300 ring-1 ring-orange-400/20" : "border-slate-200 hover:border-orange-200"
                    }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon Badge & Status Dropdown */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${isActive
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                        : "bg-orange-50 text-orange-500 border border-orange-100"
                        }`}>
                        <MdCalendarMonth size={20} />
                      </div>

                      <SelectDropdown
                        value={currentStatus}
                        onChange={(val) => handleStatusChange(session._id, val)}
                        options={[
                          { value: "active", label: "Active" },
                          { value: "upcoming", label: "Upcoming" },
                          { value: "archived", label: "Archived" },
                          { value: "completed", label: "Completed" }
                        ]}
                        className="min-w-[110px] w-auto"
                        buttonClassName={getStatusSelectClass(currentStatus)}
                      />
                    </div>

                    {/* Session Details */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {session.name}
                      </h3>
                      {session.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {session.description}
                        </p>
                      )}
                    </div>

                    {/* Date info card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <MdSchedule size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                          {session.startDate && session.endDate ? (
                            `${new Date(session.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(session.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          ) : (
                            `Created ${new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}>
                      {isActive ? "Active Session" : currentStatus}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(session)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition cursor-pointer"
                        title="Edit Session"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(session._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                        title="Delete Session"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Overlay Form to keep workspace clean */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5">
                {editingSession ? "Edit Session Records" : "Create New Session"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">
                    Session Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. AY 2025-26"
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700 transition"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional details..."
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-700 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-650 transition cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5">
                      End Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-655 transition cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer"
                  >
                    {submitting ? "Saving Records..." : editingSession ? "Update Session" : "Create Session"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 h-11 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center justify-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default SessionManagement;
