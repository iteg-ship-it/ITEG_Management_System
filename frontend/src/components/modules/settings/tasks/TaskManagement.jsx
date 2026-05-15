/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { MdMoreVert } from "react-icons/md";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import Header from "../../../shared/sidebar/Header";
import CommonTable from "../../../shared/table/CommonTable";
import {
  useDeleteTaskMutation,
  useGetAllTasksQuery,
} from "../../../../redux/api/authApi";

const getOptionValues = (items, key) => (
  [...new Set(items.map((item) => item[key]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)))
);

const formatValue = (value) => {
  if (!value) return "-";
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const FilterSelect = ({ label, value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 min-w-[100px] h-9 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:border-orange-400 transition appearance-none cursor-pointer"
  >
    <option value="">{label}</option>
    {options.map((o) => (
      <option key={o} value={o}>
        {formatValue(o)}
      </option>
    ))}
  </select>
);

const ActionMenu = ({ task, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
      >
        <MdMoreVert size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
            <button
              onClick={() => setOpen(false)}
              className="w-full px-4 py-2 text-sm text-left transition text-gray-400 cursor-not-allowed"
              disabled
            >
              Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete(task);
              }}
              className="w-full px-4 py-2 text-sm text-left transition text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TaskManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSubLevel, setFilterSubLevel] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: tasksResponse, isLoading, isFetching, isError, refetch } = useGetAllTasksQuery({ status: "all" });
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const taskRows = useMemo(() => {
    const tasks = tasksResponse?.data || [];
    return tasks.map((task) => {
      const context = task.context || {};
      return {
        id: task._id,
        academicYear: context.academicYear || "-",
        session: context.session?.name || "-",
        department: context.department?.name || "-",
        subDept: context.subDepartment?.name || "-",
        level: context.level?.name || "-",
        subLevel: context.subLevel?.name || "-",
        taskTitle: task.title || "-",
        subject: task.subjectName || "General",
        topic: task.topicName || "",
        priority: task.priority || "medium",
        status: task.isActive ? "active" : "inactive",
        type: task.type || "assignment",
        raw: task,
      };
    });
  }, [tasksResponse]);

  const years = getOptionValues(taskRows, "academicYear").filter((value) => value !== "-");
  const sessions = getOptionValues(taskRows, "session").filter((value) => value !== "-");
  const depts = getOptionValues(taskRows, "department").filter((value) => value !== "-");
  const subDepts = getOptionValues(taskRows, "subDept").filter((value) => value !== "-");
  const levels = getOptionValues(taskRows, "level").filter((value) => value !== "-");
  const subLevels = getOptionValues(taskRows, "subLevel").filter((value) => value !== "-");

  const filtered = taskRows.filter((task) => {
    const q = searchTerm.trim().toLowerCase();
    const searchable = [
      task.taskTitle,
      task.subject,
      task.topic,
      task.department,
      task.subDept,
      task.id,
    ].join(" ").toLowerCase();

    return (
      (!q || searchable.includes(q)) &&
      (!filterYear || task.academicYear === filterYear) &&
      (!filterSession || task.session === filterSession) &&
      (!filterDept || task.department === filterDept) &&
      (!filterSub || task.subDept === filterSub) &&
      (!filterLevel || task.level === filterLevel) &&
      (!filterSubLevel || task.subLevel === filterSubLevel) &&
      (!filterPriority || task.priority === filterPriority) &&
      (!filterStatus || task.status === filterStatus)
    );
  });

  const resetFilters = () => {
    setFilterYear("");
    setFilterSession("");
    setFilterDept("");
    setFilterSub("");
    setFilterLevel("");
    setFilterSubLevel("");
    setFilterPriority("");
    setFilterStatus("");
  };

  const handleDelete = async (task) => {
    if (!task?.id || deleting) return;
    if (!window.confirm(`Delete task "${task.taskTitle}"?`)) return;

    try {
      await deleteTask(task.id).unwrap();
      toast.success("Task deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete task");
    }
  };

  const columns = [
    { key: "academicYear", label: "Academic Year", render: (r) => <span className="text-sm font-semibold text-gray-800">{r.academicYear}</span> },
    { key: "session", label: "Session", render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">{r.session}</span> },
    { key: "department", label: "Department", render: (r) => <span className="text-sm text-gray-700">{r.department}</span> },
    { key: "subDept", label: "Sub-Dept", render: (r) => <span className="text-sm text-gray-600">{r.subDept}</span> },
    { key: "level", label: "Level", render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 whitespace-nowrap">{r.level}</span> },
    { key: "subLevel", label: "Sub-Level", render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">{r.subLevel}</span> },
    { key: "taskTitle", label: "Task Title", render: (r) => <span className="text-sm font-medium text-gray-800">{r.taskTitle}</span> },
    { key: "priority", label: "Priority", render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">{formatValue(r.priority)}</span> },
  ];

  const hasActiveFilters = filterYear || filterSession || filterDept || filterSub || filterLevel || filterSubLevel || filterPriority || filterStatus;

  return (
    <>
      <Header
        title="Task Management"
        subtitle="Manage and monitor sub-level tasks across departments and sessions"
        breadcrumbs={[{ label: "Academics" }, { label: "Task Management" }]}
      />

      <div className="px-6 py-6 space-y-4" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex gap-2 items-center w-full">
            <FilterSelect label="Academic Year" value={filterYear} onChange={setFilterYear} options={years} />
            <FilterSelect label="Session" value={filterSession} onChange={setFilterSession} options={sessions} />
            <FilterSelect label="Department" value={filterDept} onChange={setFilterDept} options={depts} />
            <FilterSelect label="Sub-Department" value={filterSub} onChange={setFilterSub} options={subDepts} />
            <FilterSelect label="Level" value={filterLevel} onChange={setFilterLevel} options={levels} />
            <FilterSelect label="Sub-Level" value={filterSubLevel} onChange={setFilterSubLevel} options={subLevels} />
            <FilterSelect label="Priority" value={filterPriority} onChange={setFilterPriority} options={["high", "medium", "low"]} />
            <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={["active", "inactive"]} />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-orange-500 hover:text-orange-600 transition whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full h-10 px-3 border border-gray-200 rounded-lg bg-white">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title, subject, department, or ID..."
              className="flex-1 h-full text-sm text-gray-600 bg-transparent placeholder-gray-400 outline-none border-none"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Task Records
              <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              {isFetching ? "Refreshing tasks..." : `Showing ${filtered.length ? 1 : 0}-${Math.min(10, filtered.length)} of ${filtered.length} tasks`}
            </p>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading tasks...</div>
          ) : isError ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-500">Failed to load tasks</p>
              <button onClick={refetch} className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600">
                Retry
              </button>
            </div>
          ) : (
            <CommonTable
              data={filtered}
              columns={columns}
              editable={true}
              pagination={true}
              rowsPerPage={10}
              searchTerm=""
              actionButton={(task) => <ActionMenu task={task} onDelete={handleDelete} />}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TaskManagement;
