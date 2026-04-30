/* eslint-disable react/prop-types */
import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
import { Search } from "lucide-react";
import Header from "../common-components/sidebar/Header";
import CommonTable from "../common-components/table/CommonTable";

/* ── Dummy Data ── */
const DUMMY_TASKS = [
  { id: 1, academicYear: "2023-24", session: "Fall 2023",   department: "Computer Science", subDept: "AI Lab",    level: "Undergraduate", subLevel: "Year 3", taskTitle: "Finalize Lab Report"    },
  { id: 2, academicYear: "2023-24", session: "Fall 2023",   department: "Mechanical Eng.",  subDept: "Workshop",  level: "Undergraduate", subLevel: "Year 2", taskTitle: "Safety Audit"           },
  { id: 3, academicYear: "2023-24", session: "Spring 2024", department: "Business Admin",   subDept: "Finance",   level: "Postgraduate",  subLevel: "Year 1", taskTitle: "Curriculum Review"      },
  { id: 4, academicYear: "2024-25", session: "Fall 2024",   department: "Computer Science", subDept: "Networks",  level: "Undergraduate", subLevel: "Year 2", taskTitle: "Network Config Task"    },
  { id: 5, academicYear: "2024-25", session: "Spring 2025", department: "Mechanical Eng.",  subDept: "CAD Lab",   level: "Undergraduate", subLevel: "Year 3", taskTitle: "3D Modelling Project"   },
  { id: 6, academicYear: "2024-25", session: "Fall 2024",   department: "Business Admin",   subDept: "Marketing", level: "Postgraduate",  subLevel: "Year 2", taskTitle: "Market Research Report" },
];

/* ── Filter Select ── */
const FilterSelect = ({ label, value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 min-w-[100px] h-9 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:border-orange-400 transition appearance-none cursor-pointer"
  >
    <option value="">{label}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ── 3-dot Action Menu ── */
const ActionMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex justify-end">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
      >
        <MdMoreVert size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 overflow-hidden">
            {["View", "Edit", "Delete"].map((item) => (
              <button
                key={item}
                onClick={() => setOpen(false)}
                className={`w-full px-4 py-2 text-sm text-left transition hover:bg-gray-50 ${item === "Delete" ? "text-red-500 hover:bg-red-50" : "text-gray-600"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const TaskManagement = () => {
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterYear,    setFilterYear]    = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterDept,    setFilterDept]    = useState("");
  const [filterSub,     setFilterSub]     = useState("");
  const [filterLevel,   setFilterLevel]   = useState("");
  const [filterSubLevel,setFilterSubLevel]= useState("");
  const [filterPriority,setFilterPriority]= useState("");
  const [filterStatus,  setFilterStatus]  = useState("");

  /* ── Filter options from data ── */
  const years     = [...new Set(DUMMY_TASKS.map((t) => t.academicYear))];
  const sessions  = [...new Set(DUMMY_TASKS.map((t) => t.session))];
  const depts     = [...new Set(DUMMY_TASKS.map((t) => t.department))];
  const subDepts  = [...new Set(DUMMY_TASKS.map((t) => t.subDept))];
  const levels    = [...new Set(DUMMY_TASKS.map((t) => t.level))];
  const subLevels = [...new Set(DUMMY_TASKS.map((t) => t.subLevel))];

  /* ── Filtered data ── */
  const filtered = DUMMY_TASKS.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || t.taskTitle.toLowerCase().includes(q) || t.department.toLowerCase().includes(q) || String(t.id).includes(q)) &&
      (!filterYear     || t.academicYear === filterYear) &&
      (!filterSession  || t.session      === filterSession) &&
      (!filterDept     || t.department   === filterDept) &&
      (!filterSub      || t.subDept      === filterSub) &&
      (!filterLevel    || t.level        === filterLevel) &&
      (!filterSubLevel || t.subLevel     === filterSubLevel)
    );
  });

  /* ── Table columns ── */
  const columns = [
    { key: "academicYear", label: "Academic Year",  render: (r) => <span className="text-sm font-semibold text-gray-800">{r.academicYear}</span> },
    { key: "session",      label: "Session",        render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">{r.session}</span> },
    { key: "department",   label: "Department",     render: (r) => <span className="text-sm text-gray-700">{r.department}</span> },
    { key: "subDept",      label: "Sub-Dept",       render: (r) => <span className="text-sm text-gray-600">{r.subDept}</span> },
    { key: "level",        label: "Level",          render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 whitespace-nowrap">{r.level}</span> },
    { key: "subLevel",     label: "Sub-Level",      render: (r) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">{r.subLevel}</span> },
    { key: "taskTitle",    label: "Task Title",     render: (r) => <span className="text-sm font-medium text-gray-800">{r.taskTitle}</span> },
  ];

  return (
    <>
      {/* ── Header ── */}
      <Header
        title="Task Management"
        subtitle="Manage and monitor sub-level tasks across departments and sessions"
        breadcrumbs={[{ label: "Academics" }, { label: "Task Management" }]}
      >
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200">
          + Add New Task
        </button>
      </Header>

      <div className="px-6 py-6 space-y-4" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>

        {/* ── ONE white card: filters top + search bottom ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">

          {/* Row 1 — Filter dropdowns */}
          <div className="flex gap-2 items-center w-full">
            <FilterSelect label="Academic Year"  value={filterYear}     onChange={setFilterYear}     options={years}     />
            <FilterSelect label="Session"        value={filterSession}  onChange={setFilterSession}  options={sessions}  />
            <FilterSelect label="Department"     value={filterDept}     onChange={setFilterDept}     options={depts}     />
            <FilterSelect label="Sub-Department" value={filterSub}      onChange={setFilterSub}      options={subDepts}  />
            <FilterSelect label="Level"          value={filterLevel}    onChange={setFilterLevel}    options={levels}    />
            <FilterSelect label="Sub-Level"      value={filterSubLevel} onChange={setFilterSubLevel} options={subLevels} />
            <FilterSelect label="Priority"       value={filterPriority} onChange={setFilterPriority} options={["High", "Medium", "Low"]} />
            <FilterSelect label="Status"         value={filterStatus}   onChange={setFilterStatus}   options={["Active", "Completed", "Pending"]} />
            {(filterYear || filterSession || filterDept || filterSub || filterLevel || filterSubLevel || filterPriority || filterStatus) && (
              <button
                onClick={() => { setFilterYear(""); setFilterSession(""); setFilterDept(""); setFilterSub(""); setFilterLevel(""); setFilterSubLevel(""); setFilterPriority(""); setFilterStatus(""); }}
                className="text-xs font-medium text-orange-500 hover:text-orange-600 transition whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          {/* Row 2 — Search */}
          <div className="flex items-center gap-2 w-full h-10 px-3 border border-gray-200 rounded-lg bg-white">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title, subject, or ID..."
              className="flex-1 h-full text-sm text-gray-600 bg-transparent placeholder-gray-400 outline-none border-none"
            />
          </div>

        </div>

        {/* ── Table Card ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Task Records
              <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Showing 1–{Math.min(10, filtered.length)} of {filtered.length} tasks
            </p>
          </div>

          <CommonTable
            data={filtered}
            columns={columns}
            editable={true}
            pagination={true}
            rowsPerPage={10}
            searchTerm=""
            actionButton={() => <ActionMenu />}
          />
        </div>

      </div>
    </>
  );
};

export default TaskManagement;
