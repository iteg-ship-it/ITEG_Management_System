/* eslint-disable react/prop-types */
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { MdFilterList, MdCalendarToday, MdCheckCircle, MdDragIndicator } from "react-icons/md";
import * as XLSX from "xlsx";
import { taskAPI, studentAPI } from "../../services/taskService";
import Header from "../common-components/sidebar/Header";
import Loader from "../common-components/loader/Loader";

/* ─── Priority config ─── */
const PRIORITY_MAP = {
  "1st":  { label: "High",   cls: "bg-red-100 text-red-700 border border-red-200" },
  high:   { label: "High",   cls: "bg-red-100 text-red-700 border border-red-200" },
  "2nd":  { label: "Medium", cls: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  medium: { label: "Medium", cls: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  "3rd":  { label: "Low",    cls: "bg-green-100 text-green-700 border border-green-200" },
  low:    { label: "Low",    cls: "bg-green-100 text-green-700 border border-green-200" },
};
const getPriority = (p) => PRIORITY_MAP[p] || { label: p || "Medium", cls: "bg-gray-100 text-gray-600 border border-gray-200" };

/* ─── Column config ─── */
const COLUMNS = [
  { status: "pending",     label: "Pending",     dot: "bg-gray-400",  bg: "bg-gray-50",  border: "border-gray-200" },
  { status: "in-progress", label: "In Progress", dot: "bg-blue-400",  bg: "bg-blue-50",  border: "border-blue-200" },
  { status: "completed",   label: "Completed",   dot: "bg-green-400", bg: "bg-green-50", border: "border-green-200" },
];

/* ─── Avatar initials ─── */
const Avatar = ({ name = "" }) => {
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold border-2 border-white flex-shrink-0">
      {initials || "?"}
    </div>
  );
};

/* ─── Task Card ─── */
const TaskCard = ({ task, onStatusChange, onDragStart }) => {
  const priority   = getPriority(task.priority);
  const isComplete = task.status === "completed";
  const isProgress = task.status === "in-progress";
  const dueDate    = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

  return (
    <div
      draggable={!isComplete}
      onDragStart={(e) => !isComplete && onDragStart(e, task)}
      className={`bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 group ${
        isComplete
          ? "border-green-100 opacity-75"
          : "border-gray-100 hover:shadow-md cursor-grab active:cursor-grabbing hover:border-orange-200"
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${priority.cls}`}>
          {priority.label}
        </span>
        {isComplete ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
            <MdCheckCircle size={11} /> Verified
          </span>
        ) : (
          <MdDragIndicator size={16} className="text-gray-300 group-hover:text-gray-400" />
        )}
      </div>

      {/* Title */}
      <h4 className={`text-sm font-bold leading-snug mb-1 ${isComplete ? "text-gray-400 line-through" : "text-gray-800"}`}>
        {task.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{task.description}</p>

      {/* Subject tag */}
      {task.subject && (
        <span className="inline-block text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full mb-3">
          {task.subject}
        </span>
      )}

      {/* Progress bar — in-progress only */}
      {isProgress && (
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-gray-400">Progress</span>
            <span className="text-[11px] font-semibold text-orange-500">50%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full" style={{ width: "50%" }} />
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <MdCalendarToday size={11} /> {dueDate}
        </span>
        <div className="flex items-center gap-2">
          <Avatar name={task.assignedTo || "Student"} />
          {!isComplete && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] border border-gray-200 rounded-lg px-1.5 py-0.5 text-gray-600 bg-white focus:outline-none focus:border-orange-400"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Kanban Column ─── */
const KanbanColumn = ({ col, tasks, onStatusChange, onDragStart, onDragOver, onDragLeave, onDrop, isDragOver }) => {
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const tasksBySubject = tasks.reduce((acc, task) => {
    const s = task.subject || "General";
    if (!acc[s]) acc[s] = [];
    acc[s].push(task);
    return acc;
  }, {});

  const toggle = (subject) =>
    setExpandedSubjects((prev) => ({ ...prev, [subject]: prev[subject] === false ? true : false }));

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 transition-all duration-200 ${col.bg} ${col.border} ${
        isDragOver ? "border-orange-400 border-dashed scale-[1.01]" : ""
      }`}
      onDragOver={(e) => onDragOver(e, col.status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, col.status)}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${col.border}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
          <span className="text-sm font-bold text-gray-700">{col.label}</span>
          <span className="text-xs font-bold bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-380px)]">
        {Object.keys(tasksBySubject).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-2">
              <FaPlus className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400">No {col.label.toLowerCase()} tasks</p>
          </div>
        ) : (
          Object.entries(tasksBySubject).map(([subject, subjectTasks]) => {
            const isExpanded = expandedSubjects[subject] !== false;
            return (
              <div key={subject} className="space-y-2">
                <button
                  onClick={() => toggle(subject)}
                  className="flex items-center justify-between w-full p-2 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <FaChevronDown className="text-xs text-gray-400" /> : <FaChevronRight className="text-xs text-gray-400" />}
                    <span className="text-xs font-semibold text-gray-600">{subject}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{subjectTasks.length}</span>
                </button>
                {isExpanded && (
                  <div className="space-y-2 pl-2">
                    {subjectTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onDragStart={onDragStart} />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ─── Add Task Modal ─── */
const TaskModal = ({ isOpen, onClose, task, setTask, onSave, isEditing }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">{isEditing ? "Edit Task" : "New Task"}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Title *</label>
            <input type="text" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
              placeholder="Enter task title" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description *</label>
            <textarea value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50 resize-none"
              rows={3} placeholder="Enter task description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Subject *</label>
              <select value={task.subject} onChange={(e) => setTask({ ...task, subject: e.target.value, customSubject: "" })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50">
                <option value="">Select Subject</option>
                {["HTML/CSS","Java","JavaScript","React","Node.js","Database","Data Structures","System Design","Algorithms","Machine Learning","Project Work","Soft Skills","Interview Prep","Other"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {task.subject === "Other" && (
                <input type="text" value={task.customSubject || ""} onChange={(e) => setTask({ ...task, customSubject: e.target.value })}
                  className="w-full mt-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                  placeholder="Custom subject" />
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Priority</label>
              <select value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50">
                <option value="1st">High</option>
                <option value="2nd">Medium</option>
                <option value="3rd">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Due Date</label>
            <input type="date" value={task.dueDate} onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-gray-50" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onSave} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-orange-200">
            {isEditing ? "Update Task" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN — Task Board
═══════════════════════════════════════════════ */
export default function TaskList() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [studentInfo,    setStudentInfo]    = useState(null);
  const [draggedTask,    setDraggedTask]    = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isAddModalOpen, setAddModalOpen]   = useState(false);
  const [editingTask,    setEditingTask]    = useState(null);
  const fileInputRef = useRef(null);

  const [newTask, setNewTask] = useState({
    title: "", description: "", subject: "", customSubject: "",
    priority: "2nd", dueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchStudentTasks();
    fetchStudentInfo();
  }, [id]);

  const fetchStudentTasks = async () => {
    try {
      const result    = await taskAPI.getStudentTasks(id);
      const tasksData = result.tasks || result;
      setTasks(tasksData.map((st) => ({
        id:            st._id,
        title:         st.taskId?.title       || "Untitled Task",
        description:   st.taskId?.description || "No description",
        subject:       st.taskId?.subject     || "General",
        status:        st.status,
        priority:      st.taskId?.priority    || "medium",
        dueDate:       st.taskId?.dueDate ? st.taskId.dueDate.split("T")[0] : new Date().toISOString().split("T")[0],
        taskId:        st.taskId?._id,
        studentTaskId: st._id,
        notes:         st.notes || "",
        assignedTo:    "",
      })));
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInfo = async () => {
    try {
      const student = await studentAPI.getStudentById(id);
      setStudentInfo(student);
    } catch (e) {
      console.error("Error fetching student:", e);
    }
  };

  const resetModal = () => {
    setNewTask({ title: "", description: "", subject: "", customSubject: "", priority: "2nd", dueDate: new Date().toISOString().split("T")[0] });
    setEditingTask(null);
    setAddModalOpen(false);
  };

  const handleAddTask = async () => {
    const finalSubject = newTask.subject === "Other" ? newTask.customSubject : newTask.subject;
    if (!newTask.title.trim() || !newTask.description.trim() || !finalSubject.trim()) {
      alert("Please fill in title, description, and subject.");
      return;
    }
    try {
      const result = await taskAPI.createIndividualTask(id, { ...newTask, subject: finalSubject });
      const t = result.task;
      setTasks((prev) => [...prev, {
        id: t._id, title: t.taskId.title, description: t.taskId.description,
        subject: t.taskId.subject, status: t.status, priority: t.taskId.priority,
        dueDate: t.taskId.dueDate.split("T")[0], taskId: t.taskId._id,
        studentTaskId: t._id, notes: t.notes || "", assignedTo: "",
      }]);
      resetModal();
    } catch (e) {
      console.error("Error creating task:", e);
      alert("Error creating task. Please try again.");
    }
  };

  const handleUpdateTask = () => {
    if (newTask.title.trim()) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...newTask } : t)));
      resetModal();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      await taskAPI.updateStudentTaskStatus(id, task.taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Error updating task status");
    }
  };

  const handleDragStart   = (e, task)        => { setDraggedTask(task); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver    = (e, colStatus)   => { e.preventDefault(); setDragOverColumn(colStatus); };
  const handleDragLeave   = ()               => setDragOverColumn(null);
  const handleDrop        = async (e, status) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.status !== status) await handleStatusChange(draggedTask.id, status);
    setDraggedTask(null);
  };

  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result);
        const wb       = XLSX.read(data, { type: "array" });
        const ws       = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        const newTasks = jsonData.map((row, i) => ({
          id: Date.now() + i, title: row.Title || `Task ${i + 1}`,
          description: row.Description || "", subject: row.Subject || "General",
          priority: (row.Priority || "2nd").toLowerCase().trim(),
          dueDate: row.DueDate || new Date().toISOString().split("T")[0],
          status: "pending", assignedTo: "",
        }));
        setTasks((prev) => [...prev, ...newTasks]);
        event.target.value = "";
      } catch { alert("Error reading file."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const studentName = studentInfo ? `${studentInfo.firstName} ${studentInfo.lastName}` : "Student";
  const initials    = studentName.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const colTasks = {
    pending:      tasks.filter((t) => t.status === "pending"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    completed:    tasks.filter((t) => t.status === "completed"),
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader /></div>
  );

  return (
    <>
      {/* ── Existing Header component ── */}
      <Header
        title="Task Board"
        subtitle="Manage and track student tasks across all stages"
        breadcrumbs={[
          { label: "Student Records", path: "/student-detail-table" },
          { label: studentName,       path: `/student-profile/${id}` },
          { label: "Task Board" },
        ]}
      >
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200"
        >
          <FaPlus size={11} /> New Task
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          <MdFilterList size={16} /> Filter
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} className="hidden" />
      </Header>

      <div className="px-6 py-5" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>

        {/* ── Student Info Row ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-base font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900">{studentName}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {studentInfo?.course || "N/A"} • Level {studentInfo?.currentLevel || "—"}
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "Pending",     count: colTasks.pending.length,       cls: "bg-gray-100 text-gray-600" },
              { label: "In Progress", count: colTasks["in-progress"].length, cls: "bg-blue-100 text-blue-600" },
              { label: "Completed",   count: colTasks.completed.length,      cls: "bg-green-100 text-green-600" },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${cls}`}>
                <span className="text-base font-bold">{count}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kanban Board ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              col={col}
              tasks={colTasks[col.status]}
              onStatusChange={handleStatusChange}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isDragOver={dragOverColumn === col.status}
            />
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      <TaskModal
        isOpen={isAddModalOpen}
        onClose={resetModal}
        task={newTask}
        setTask={setNewTask}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        isEditing={!!editingTask}
      />
    </>
  );
}
<<<<<<< HEAD
=======

// Task Column Component
const TaskColumn = ({ title, tasks, color, status, onStatusChange, onEdit, onDelete, getPriorityColor, getStatusColor, onDragStart, onDragOver, onDragLeave, onDrop, dragOverColumn }) => {
  const [expandedSubjects, setExpandedSubjects] = useState({});

  const getColumnColor = (color) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50';
      case 'green': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const isDragOver = dragOverColumn === status;

  // Group tasks by subject
  const tasksBySubject = tasks.reduce((acc, task) => {
    const subject = task.subject || 'General';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(task);
    return acc;
  }, {});

  const toggleSubject = (subject) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  return (
    <div 
      className={`rounded-xl border-2 p-4 transition-all duration-200 flex flex-col h-[calc(100vh-300px)] ${
        getColumnColor(color)
      } ${isDragOver ? 'border-dashed border-4 border-blue-400 bg-blue-100' : ''}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      <h3 className="font-semibold text-lg mb-4 text-gray-800 flex-shrink-0">{title} ({tasks.length})</h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {Object.keys(tasksBySubject).length > 0 ? (
          Object.entries(tasksBySubject).map(([subject, subjectTasks]) => {
            const isExpanded = expandedSubjects[subject] !== false; // Default to expanded
            return (
              <div key={subject} className="space-y-2">
                <button
                  onClick={() => toggleSubject(subject)}
                  className="flex items-center justify-between w-full p-2 bg-white rounded-md border hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <FaChevronDown className="text-xs text-gray-500" />
                    ) : (
                      <FaChevronRight className="text-xs text-gray-500" />
                    )}
                    <span className="font-medium text-sm text-gray-700">
                      {subject}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {subjectTasks.length}
                  </span>
                </button>
                {isExpanded && (
                  <div className="space-y-3 pl-4">
                    {subjectTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={onStatusChange}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        getPriorityColor={getPriorityColor}
                        getStatusColor={getStatusColor}
                        onDragStart={onDragStart}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {title.toLowerCase()} tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onStatusChange, onEdit, onDelete, getPriorityColor, getStatusColor, onDragStart }) => {
  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-800 flex-1">{task.title}</h4>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {task.subject}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ isOpen, onClose, task, setTask, onSave, isEditing }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
              placeholder="Enter task title"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
              rows="3"
              placeholder="Enter task description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <select
              value={task.subject}
              onChange={(e) => setTask({ ...task, subject: e.target.value, customSubject: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
            >
              <option value="">Select Subject</option>
              <option value="HTML/CSS">HTML/CSS</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Database">Database</option>
              <option value="Data Structures">Data Structures</option>
              <option value="System Design">System Design</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Project Work">Project Work</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Interview Prep">Interview Prep</option>
              <option value="Other">Other</option>
            </select>
            {task.subject === 'Other' && (
              <input
                type="text"
                value={task.customSubject || ''}
                onChange={(e) => setTask({ ...task, customSubject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D] mt-2"
                placeholder="Enter custom subject"
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={task.priority}
              onChange={(e) => setTask({ ...task, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
            >
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={task.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-colors"
          >
            {isEditing ? 'Update' : 'Add'} Task
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
const BulkUploadModal = ({ isOpen, onClose, onUpload, onDownloadTemplate, fileInputRef }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Bulk Upload Tasks</h2>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Upload tasks in bulk using Excel or CSV files.</p>
            <p className="text-xs text-gray-500">Required columns: Title, Description, Subject, Priority (High/Medium/Low), DueDate (YYYY-MM-DD)</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-3">Click to upload or drag and drop</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg text-sm font-medium"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onUpload}
              className="hidden"
            />
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Download Template:</p>
            <div className="flex gap-2">
              <button
                onClick={() => onDownloadTemplate('excel')}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <FaFileExcel />
                Excel Template
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
>>>>>>> 0bfe625c7ff7ad560a131e366e5820d1645fa667
