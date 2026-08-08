import { useState, useMemo } from "react";
import { MdCalendarMonth, MdAdd, MdEdit, MdDelete, MdCheckCircle, MdRadioButtonUnchecked, MdSchedule, MdEventAvailable, MdArchive, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";
import {
  useGetAllSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useActivateSessionMutation,
  useUpdateSessionStatusMutation,
} from "../../../../redux/api/authApi";
import Header from "../../../shared/sidebar/Header";
import Loader from "../../../shared/loader/Loader";

const STATUS_TABS = [
  { id: "all", label: "All Sessions" },
  { id: "active", label: "Active" },
  { id: "upcoming", label: "Upcoming" },
  { id: "archived", label: "Archived" },
  { id: "completed", label: "Completed" },
];

const SessionManagement = () => {
  const [showForm,       setShowForm]       = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [formData,       setFormData]       = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  const [submitting,     setSubmitting]     = useState(false);

  // Pass all=true so admin can see all sessions (active, upcoming, archived, completed)
  const { data, isLoading, refetch } = useGetAllSessionsQuery(true);
  const sessions = data?.data || [];

  const [createSession]       = useCreateSessionMutation();
  const [updateSession]       = useUpdateSessionMutation();
  const [deleteSession]       = useDeleteSessionMutation();
  const [activateSession]     = useActivateSessionMutation();
  const [updateSessionStatus] = useUpdateSessionStatusMutation();

  const getComputedStatus = (session) => {
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
      } else {
        await updateSessionStatus({ id, status: newStatus }).unwrap();
      }
      toast.success(`Session status updated to ${newStatus}!`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Status update failed");
    }
  };

  const getStatusBadge = (session) => {
    const status = getComputedStatus(session);
    
    if (status === 'archived') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          <MdArchive size={13} /> Archived
        </span>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
          <MdSchedule size={13} /> Upcoming
        </span>
      );
    }
    
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-600 border border-green-200">
          <MdEventAvailable size={13} /> Active
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
        Completed
      </span>
    );
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <Header
        title="Session Management"
        badge={`${sessions.length} total sessions`}
        breadcrumbs={[{ label: "Settings" }, { label: "Sessions" }]}
      />

      <div className="px-6 py-6 max-w-4xl space-y-5">

        {/* Top bar with Add button and Search */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {!showForm && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              <MdAdd size={18} /> Add Session
            </button>
          )}

          {sessions.length > 0 && (
            <div className="relative flex-1 max-w-xs ml-auto">
              <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search session..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Status Tabs: All, Active, Upcoming, Archived, Completed */}
        <div className="flex gap-1.5 overflow-x-auto bg-gray-100/70 p-1.5 rounded-xl border border-gray-200/60 w-fit">
          {STATUS_TABS.map((tab) => {
            const count = tab.id === "all"
              ? sessions.length
              : sessions.filter(s => getComputedStatus(s) === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-white text-orange-500 shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === tab.id ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              {editingSession ? "Edit Session" : "Add New Session"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Session Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. 2024-25, Academic Year 2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
                >
                  {submitting ? "Saving..." : editingSession ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredSessions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <MdCalendarMonth size={32} className="text-orange-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">No sessions found</h3>
            <p className="text-xs text-gray-400">
              {searchQuery || statusFilter !== 'all' 
                ? "No sessions match your filter or search query" 
                : "Create your first session or import student data to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const currentStatus = getComputedStatus(session);
              return (
                <div
                  key={session._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between px-5 py-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <MdCalendarMonth size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        {session.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {session.startDate && session.endDate ? (
                            `${new Date(session.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} - ${new Date(session.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          ) : (
                            `Created ${new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          )}
                        </p>
                        {session.description && (
                          <span className="text-xs text-gray-400">• {session.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(session)}

                    {/* Status Dropdown to switch between Active, Upcoming, Archived, Completed */}
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(session._id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer focus:outline-none hover:border-orange-400 transition"
                      title="Change session status"
                    >
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="archived">Archived</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => openEdit(session)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition"
                      title="Edit"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionManagement;
