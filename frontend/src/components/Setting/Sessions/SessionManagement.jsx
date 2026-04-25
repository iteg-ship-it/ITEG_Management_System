import { useState } from "react";
import { MdCalendarMonth, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import {
  useGetAllSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
} from "../../../redux/api/authApi";
import Header from "../../common-components/sidebar/Header";
import Loader from "../../common-components/loader/Loader";

const SessionManagement = () => {
  const [showForm,       setShowForm]       = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [name,           setName]           = useState("");
  const [submitting,     setSubmitting]     = useState(false);

  const { data, isLoading, refetch } = useGetAllSessionsQuery();
  const sessions = data?.data || [];

  const [createSession] = useCreateSessionMutation();
  const [updateSession] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();

  const openAdd = () => { setEditingSession(null); setName(""); setShowForm(true); };
  const openEdit = (s) => { setEditingSession(s); setName(s.name); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditingSession(null); setName(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Session name is required"); return; }
    setSubmitting(true);
    try {
      if (editingSession) {
        await updateSession({ id: editingSession._id, name: name.trim() }).unwrap();
        toast.success("Session updated successfully!");
      } else {
        await createSession({ name: name.trim() }).unwrap();
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

  if (isLoading) return <Loader />;

  return (
    <>
      <Header
        title="Session Management"
        breadcrumbs={[{ label: "Settings" }, { label: "Sessions" }]}
      />

      <div className="px-6 py-6 max-w-3xl">

        {/* Add button */}
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition mb-6"
          >
            <MdAdd size={18} /> Add Session
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              {editingSession ? "Edit Session" : "Add New Session"}
            </h3>
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Session Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2024-25, Batch Jan 2025"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400"
                  autoFocus
                />
              </div>
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
            </form>
          </div>
        )}

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <MdCalendarMonth size={32} className="text-orange-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 mb-1">No sessions yet</h3>
            <p className="text-xs text-gray-400">Create your first session to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between px-5 py-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <MdCalendarMonth size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{session.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Created {new Date(session.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-600">Active</span>
                  <button onClick={() => openEdit(session)} className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition" title="Edit">
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(session._id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition" title="Delete">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionManagement;
