import { useState } from "react";
import { MdAdd, MdFilterList, MdEdit, MdVisibility, MdBlock, MdCheckCircle } from "react-icons/md";
import { useParams, useLocation } from "react-router-dom";
import Header from "../../common-components/sidebar/Header";
import CommonTable from "../../common-components/table/CommonTable";
import SearchBox from "../../common-components/seach-export/SearchBox";
import ExportDropdown from "../../common-components/seach-export/ExportDropdown";
import SyllabusTab, { TaskUploadDrawer, VersionTasksTable } from "./SyllabusTab";
import {
  useGetSyllabusVersionsBySubLevelQuery,
} from "../../../redux/api/authApi";

const LEVEL_TABS = ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"];
const SECTION_TABS = ["Students", "Tasks", "Syllabus", "Progress"];

const DUMMY_STUDENTS = [
  { _id: "1", name: "John Doe", fatherName: "Robert Doe", mobile: "+91 9876543210", course: "BCA", busRoute: "Route A", attempts: 1 },
  { _id: "2", name: "Jane Smith", fatherName: "Michael Smith", mobile: "+91 9123456780", course: "MCA", busRoute: "Route B", attempts: 2 },
  { _id: "3", name: "Aryan Gupta", fatherName: "Suresh Gupta", mobile: "+91 9988776655", course: "BCA", busRoute: "Route C", attempts: 3 },
  { _id: "4", name: "Priya Sharma", fatherName: "Ramesh Sharma", mobile: "+91 9871234560", course: "BSc", busRoute: "Route A", attempts: 1 },
  { _id: "5", name: "Rahul Verma", fatherName: "Anil Verma", mobile: "+91 9765432100", course: "MCA", busRoute: "Route D", attempts: 2 },
];

const DUMMY_TASKS = [
  { _id: "T001", title: "Complete Python Assignment", description: "Build a REST API using Flask", priority: "HIGH", assignedTo: "John Doe", type: "MANUAL", status: "ACTIVE" },
  { _id: "T002", title: "Database Design Project", description: "Design ER diagram for e-commerce system", priority: "MEDIUM", assignedTo: "Jane Smith", type: "BULK", status: "ACTIVE" },
  { _id: "T003", title: "React Component Development", description: "Create reusable UI components", priority: "HIGH", assignedTo: "Aryan Gupta", type: "MANUAL", status: "COMPLETED" },
  { _id: "T004", title: "Unit Testing", description: "Write test cases for authentication module", priority: "LOW", assignedTo: "Priya Sharma", type: "MANUAL", status: "ACTIVE" },
  { _id: "T005", title: "Code Review", description: "Review pull requests from team members", priority: "MEDIUM", assignedTo: "Rahul Verma", type: "BULK", status: "DISABLED" },
  { _id: "T006", title: "Documentation Update", description: "Update API documentation with new endpoints", priority: "LOW", assignedTo: "John Doe", type: "MANUAL", status: "COMPLETED" },
];

const PRIORITY_STYLES = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-green-100 text-green-700",
};
const TYPE_STYLES = {
  MANUAL: "bg-gray-100 text-gray-600",
  BULK:   "bg-blue-100 text-blue-700",
};
const STATUS_STYLES = {
  ACTIVE:    "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  DISABLED:  "bg-gray-100 text-gray-500",
};

const Badge = ({ label, styleMap }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styleMap[label] || "bg-gray-100 text-gray-500"}`}>
    {label}
  </span>
);

const TASK_COLUMNS = [
  { key: "_id", label: "Task ID", render: (row) => <span className="text-xs font-mono text-gray-500">{row._id}</span> },
  {
    key: "title", label: "Task Details",
    render: (row) => (
      <div className="min-w-[160px]">
        <p className="font-semibold text-sm text-gray-800">{row.title}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{row.description}</p>
      </div>
    ),
  },
  { key: "priority", label: "Priority",  render: (row) => <Badge label={row.priority} styleMap={PRIORITY_STYLES} /> },
  {
    key: "assignedTo", label: "Assigned To",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        <span className="text-sm text-gray-700">{row.assignedTo}</span>
      </div>
    ),
  },
  { key: "type",   label: "Type",   render: (row) => <Badge label={row.type}   styleMap={TYPE_STYLES} /> },
  { key: "status", label: "Status", render: (row) => <Badge label={row.status} styleMap={STATUS_STYLES} /> },
];

const TaskActions = ({ row }) => (
  <div className="flex items-center gap-1">
    <button title="View"   className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"><MdVisibility size={16} /></button>
    <button title="Edit"   className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"><MdEdit size={16} /></button>
    {row.status === "DISABLED"
      ? <button title="Enable"  className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition"><MdCheckCircle size={16} /></button>
      : <button title="Disable" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"><MdBlock size={16} /></button>
    }
  </div>
);

const TABLE_COLUMNS = [
  {
    key: "name", label: "Full Name",
    render: (row) => {
      const initials = row.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{initials}</div>
          <span className="font-semibold text-gray-800 text-sm">{row.name}</span>
        </div>
      );
    },
  },
  { key: "fatherName", label: "Father's Name", render: (row) => <span className="text-sm text-gray-600">{row.fatherName}</span> },
  { key: "mobile", label: "Mobile No.", render: (row) => <span className="text-sm text-gray-600">{row.mobile}</span> },
  {
    key: "course", label: "Course",
    render: (row) => <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{row.course}</span>,
  },
  { key: "busRoute", label: "Bus Route", render: (row) => <span className="text-sm text-gray-600">{row.busRoute}</span> },
  {
    key: "attempts", label: "Attempts",
    render: (row) => (
      <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{row.attempts}</span>
    ),
  },
];

const SubLevelManagement = () => {
  const { id: subdepartmentId, levelId } = useParams();
  const location = useLocation();
  const level = location.state?.level;

  const [activeLevel, setActiveLevel] = useState("Level 1A");
  const [activeSection, setActiveSection] = useState("Students");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSectionChange = (tab) => {
    setActiveSection(tab);
    setSearchTerm("");
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "Departments", path: "/department-management" },
          { label: "Sub-Level Management", path: `/subdepartment/${subdepartmentId}/levels` },
          { label: level?.name || "Level Details" },
        ]}
      >
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
          <MdAdd size={18} /> Add Task
        </button>
      </Header>

      <div className="px-6 py-5 flex items-center justify-between border-b bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{level?.name || "Level Details"}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600">AY 2023–24</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Sub-Department: AI &amp; ML</p>
        </div>
      </div>
      <div className="pb-10">

        {/* Level Tabs */}
        <div className="px-6 border-b border-gray-100 bg-white">
          <div className="flex gap-1">
            {LEVEL_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLevel(tab)}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${activeLevel === tab
                    ? "border-orange-500 text-orange-500 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-gray-100 bg-white">
          <div className="flex gap-1 px-6">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleSectionChange(tab)}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeSection === tab
                    ? "border-orange-500 text-orange-500 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {activeSection === "Students" && (
            <div className="space-y-3">
              {/* Toolbar: Search + Filter + Export */}
              <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <div className="w-1/2">
                  <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
                <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                  <MdFilterList size={16} /> Filter
                </button>
                <div className="flex-shrink-0">
                  <ExportDropdown data={DUMMY_STUDENTS} sectionName="students" />
                </div>
              </div>
              {/* Table */}
              <CommonTable
                key={`students-${activeLevel}`}
                columns={TABLE_COLUMNS}
                data={DUMMY_STUDENTS}
                editable={true}
                pagination={true}
                rowsPerPage={10}
                searchTerm={searchTerm}
                actionButton={() => (
                  <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap flex-shrink-0">
                    Conduct Exam
                  </button>
                )}
              />
            </div>
          )}
          {activeSection === "Tasks" && (
            <TasksTab level={level} subLevel={level} />
          )}
          {activeSection === "Syllabus" && (
            <SyllabusTab level={level} subLevel={level} />
          )}
          {activeSection === "Progress" && (
            <div className="py-16 text-center text-gray-400 text-sm">Progress content coming soon</div>
          )}
        </div>
      </div>
    </>
  );
};

const TasksTab = ({ level, subLevel }) => {
  const subLevelId = subLevel?._id;
  const [selectedVersionId, setSelectedVersionId] = useState("");

  const { data: versionsData, refetch } = useGetSyllabusVersionsBySubLevelQuery(
    { subLevelId, sessionId: "" },
    { skip: !subLevelId }
  );
  const versions = versionsData?.data || [];

  const activeVersion = versions.find((v) => v._id === selectedVersionId) || versions[0];
  const versionId = activeVersion?._id || "";

  if (!versions.length) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">
        No syllabus found. Please upload a syllabus first from the Syllabus tab.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject selector */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Subject:</span>
        <select
          value={versionId}
          onChange={(e) => setSelectedVersionId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
        >
          {versions.map((v) => (
            <option key={v._id} value={v._id}>
              {v.subjectName} — {v.version} ({v.status})
            </option>
          ))}
        </select>
      </div>

      {/* Upload + Table */}
      {versionId && (
        <div className="space-y-4">
          <TaskUploadDrawer
            syllabusVersionId={versionId}
            subjectName={activeVersion?.subjectName || ""}
            version={activeVersion?.version || ""}
            onSaved={refetch}
          />
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <VersionTasksTable versionId={versionId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubLevelManagement;
