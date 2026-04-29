/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { MdMoreVert, MdDeleteOutline, MdVisibility, MdOutlineUploadFile, MdInsertDriveFile } from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi";
import { Search } from "lucide-react";
import Header from "../common-components/sidebar/Header";
import CommonTable from "../common-components/table/CommonTable";
import OrangeButton from "../common-components/sidebar/OrangeButton";
import InputField from "../common-components/common-feild/InputField";
import CustomDropdown from "../common-components/common-feild/CustomDropdown";
import RadioGroup from "../common-components/common-feild/RadioGroup";

/* ── Static curriculum data ── */
const CURRICULUM_DATA = [
  { id: 1, academicYear: "2023-2024", session: "Fall 2023",   department: "ITEG",   subDept: "UI/UX",   level: "1A", syllabusFile: "iteg_uiux_syllabus.pdf",   taskList: "iteg_uiux_tasks.xlsx"  },
  { id: 2, academicYear: "2023-2024", session: "Spring 2024", department: "ITEG",   subDept: "Testing", level: "1B", syllabusFile: "iteg_test_syllabus.pdf",   taskList: null                    },
  { id: 3, academicYear: "2023-2024", session: "Fall 2023",   department: "MEG",    subDept: "CA",      level: "1A", syllabusFile: "meg_ca_syllabus.pdf",      taskList: "meg_ca_tasks.xlsx"     },
  { id: 4, academicYear: "2024-2025", session: "Fall 2024",   department: "MEG",    subDept: "Other",   level: "2A", syllabusFile: "meg_other_syllabus.pdf",   taskList: null                    },
  { id: 5, academicYear: "2024-2025", session: "Spring 2025", department: "BEG",    subDept: "Lab",     level: "1C", syllabusFile: "beg_lab_syllabus.pdf",     taskList: "beg_lab_tasks.xlsx"    },
  { id: 6, academicYear: "2023-2024", session: "Spring 2024", department: "BEG",    subDept: "Other",   level: "2B", syllabusFile: "beg_other_syllabus.pdf",   taskList: null                    },
  { id: 7, academicYear: "2024-2025", session: "Fall 2024",   department: "B.Tech", subDept: "AI/ML",   level: "2A", syllabusFile: "btech_aiml_syllabus.pdf",  taskList: "btech_aiml_tasks.xlsx" },
  { id: 8, academicYear: "2024-2025", session: "Spring 2025", department: "B.Tech", subDept: "CSE",     level: "2C", syllabusFile: "btech_cse_syllabus.pdf",   taskList: "btech_cse_tasks.xlsx"  },
];

/* ── Dropdown options ── */
const YEAR_OPTIONS     = [{ value: "2023-2024", label: "2023-2024" }, { value: "2024-2025", label: "2024-2025" }];
const SESSION_OPTIONS  = [{ value: "Fall 2023", label: "Fall 2023" }, { value: "Spring 2024", label: "Spring 2024" }, { value: "Fall 2024", label: "Fall 2024" }, { value: "Spring 2025", label: "Spring 2025" }];
const DEPT_OPTIONS = [
  { value: "ITEG",   label: "ITEG"   },
  { value: "MEG",    label: "MEG"    },
  { value: "BEG",    label: "BEG"    },
  { value: "B.Tech", label: "B.Tech" },
];

const SUB_DEPT_MAP = {
  ITEG:   [{ value: "UI/UX",   label: "UI/UX"   }, { value: "Testing", label: "Testing" }],
  MEG:    [{ value: "CA",      label: "CA"      }, { value: "Other",   label: "Other"   }],
  BEG:    [{ value: "Lab",     label: "Lab"     }, { value: "Other",   label: "Other"   }],
  "B.Tech": [{ value: "AI/ML", label: "AI/ML"  }, { value: "CSE",     label: "CSE"     }],
};

const LEVEL_OPTIONS = [
  { value: "1A", label: "1A" },
  { value: "1B", label: "1B" },
  { value: "1C", label: "1C" },
  { value: "2A", label: "2A" },
  { value: "2B", label: "2B" },
  { value: "2C", label: "2C" },
];

/* ── Validation ── */
const curriculumSchema = Yup.object({
  academicYear: Yup.string().required("Academic year is required"),
  session:      Yup.string().required("Session is required"),
  department:   Yup.string().required("Department is required"),
  subDept:      Yup.string().required("Sub-department is required"),
  level:        Yup.string().required("Level is required"),
  syllabusFile: Yup.mixed().required("Syllabus file is required"),
  taskList:     Yup.mixed().nullable(),
  isActive:     Yup.boolean(),
});

const INITIAL_VALUES = {
  academicYear: "", session: "", department: "", subDept: "",
  level: "", syllabusFile: null, taskList: null, isActive: true,
};

/* ── Drawer form ── */
const CurriculumDrawerForm = () => {
  const { values } = useFormikContext();
  const subDeptOptions = SUB_DEPT_MAP[values.department] || [];
  return (
    <Form className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <CustomDropdown label="Academic Year" name="academicYear" variant="card" options={YEAR_OPTIONS} />
        <CustomDropdown label="Session"       name="session"      variant="card" options={SESSION_OPTIONS} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CustomDropdown label="Department"     name="department" variant="card" options={DEPT_OPTIONS} />
        <CustomDropdown label="Sub-Department" name="subDept"    variant="card" options={subDeptOptions} />
      </div>
      <CustomDropdown label="Level" name="level" variant="card" options={LEVEL_OPTIONS} />
      <FileUploadField label="Syllabus File" name="syllabusFile" accept=".pdf,.doc,.docx" required />
      <FileUploadField label="Task List File (optional)" name="taskList" accept=".xlsx,.xls,.csv" />
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">Active Status</p>
          <p className="text-xs text-gray-400 mt-0.5">Make this curriculum visible to students</p>
        </div>
        <RadioGroup label="" name="isActive" required={false} />
      </div>
    </Form>
  );
};

/* ── File Upload Field ── */
const FileUploadField = ({ label, name, accept, required = false }) => {
  const { setFieldValue, values } = useFormikContext();
  const fileName = values[name]?.name || "";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label className="flex items-center gap-3 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:border-orange-400 hover:bg-white transition group">
        <MdOutlineUploadFile size={18} className="text-orange-400 flex-shrink-0" />
        <span className={`text-sm truncate flex-1 ${fileName ? "text-gray-800 font-medium" : "text-gray-400"}`}>
          {fileName || `Click to upload ${label.toLowerCase()}`}
        </span>
        {fileName && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setFieldValue(name, null); }}
            className="text-gray-400 hover:text-red-500 transition flex-shrink-0 text-lg leading-none"
          >
            ×
          </button>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0] || null;
            setFieldValue(name, file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
};

const FileCell = ({ fileName }) => {
  if (!fileName) return <span className="text-xs text-gray-400 italic">Not Uploaded</span>;
  return (
    <div className="flex items-center gap-1.5">
      <MdInsertDriveFile size={15} className="text-orange-400 flex-shrink-0" />
      <span className="text-xs font-medium text-orange-500 truncate max-w-[130px]">{fileName}</span>
    </div>
  );
};

/* ── 3-dot Action Menu ── */
const ActionMenu = ({ row, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
        <MdMoreVert size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1 overflow-hidden">
            <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
              <MdVisibility size={15} className="text-blue-500" /> View
            </button>
            <button onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
              <MdOutlineUploadFile size={15} className="text-orange-500" /> Re-upload
            </button>
            <button onClick={() => { setOpen(false); onDelete?.(row); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">
              <MdDeleteOutline size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const CurriculumManagement = () => {
  const [curricula,     setCurricula]     = useState(CURRICULUM_DATA);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterYear,    setFilterYear]    = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterDept,    setFilterDept]    = useState("");
  const [filterSub,     setFilterSub]     = useState("");
  const [filterLevel,   setFilterLevel]   = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");

  const filtered = useMemo(() => curricula.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || c.syllabusFile.toLowerCase().includes(q) || c.department.toLowerCase().includes(q) || c.subDept.toLowerCase().includes(q)) &&
      (!filterYear    || c.academicYear === filterYear) &&
      (!filterSession || c.session      === filterSession) &&
      (!filterDept    || c.department   === filterDept) &&
      (!filterSub     || c.subDept      === filterSub) &&
      (!filterLevel   || c.level        === filterLevel) &&
      (!filterStatus  || (filterStatus === "Uploaded" ? !!c.taskList : !c.taskList))
    );
  }), [curricula, searchTerm, filterYear, filterSession, filterDept, filterSub, filterLevel, filterStatus]);

  const resetFilters = () => {
    setSearchTerm(""); setFilterYear(""); setFilterSession("");
    setFilterDept(""); setFilterSub(""); setFilterLevel(""); setFilterStatus("");
  };

  const handleDelete = (row) => {
    if (window.confirm(`Delete curriculum for "${row.department} – ${row.subDept}"?`))
      setCurricula((prev) => prev.filter((c) => c.id !== row.id));
  };

  const handleUpload = (values, { setSubmitting, resetForm }) => {
    setCurricula((prev) => [...prev, {
      id:           Date.now(),
      academicYear: values.academicYear,
      session:      values.session,
      department:   values.department,
      subDept:      values.subDept,
      level:        values.level,
      syllabusFile: values.syllabusFile?.name || null,
      taskList:     values.taskList?.name     || null,
    }]);
    resetForm();
    setSubmitting(false);
  };

  const columns = [
    { key: "academicYear", label: "Academic Year",
      render: (row) => <span className="text-sm font-semibold text-gray-800">{row.academicYear}</span> },
    { key: "session", label: "Session",
      render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">{row.session}</span> },
    { key: "department", label: "Department",
      render: (row) => <span className="text-sm font-semibold text-gray-800">{row.department}</span> },
    { key: "subDept", label: "Sub-Department",
      render: (row) => <span className="text-sm text-gray-600">{row.subDept}</span> },
    { key: "level", label: "Level",
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-orange-100 text-orange-600">
          {row.level}
        </span>
      ) },
    { key: "syllabusFile", label: "Syllabus File",
      render: (row) => <FileCell fileName={row.syllabusFile} /> },
    { key: "taskList", label: "Task List",
      render: (row) => <FileCell fileName={row.taskList} /> },
  ];

  const years    = [...new Set(CURRICULUM_DATA.map((c) => c.academicYear))];
  const sessions = [...new Set(CURRICULUM_DATA.map((c) => c.session))];
  const depts    = ["ITEG", "MEG", "BEG", "B.Tech"];
  const subs     = [...new Set(Object.values(SUB_DEPT_MAP).flat().map(o => o.value))];
  const levels   = ["1A", "1B", "1C", "2A", "2B", "2C"];

  return (
    <>
      {/* ── Header ── */}
      <Formik initialValues={INITIAL_VALUES} validationSchema={curriculumSchema} onSubmit={handleUpload}>
        {({ isSubmitting, submitForm, resetForm }) => (
          <Header
            title="Curriculum Management"
            subtitle="Manage syllabus and task lists across departments, sessions, and levels"
            breadcrumbs={[{ label: "Academics" }, { label: "Curriculum Management" }]}
          >
            <OrangeButton
              buttonTitle="+ Upload Curriculum"
              panelTitle="Upload Curriculum"
              panelSubtitle="Add a new syllabus or task list for a department and session"
              drawerContent={<CurriculumDrawerForm />}
              leftBtnText="Cancel"
              rightBtnText={isSubmitting ? "Uploading..." : "Upload"}
              onLeftClick={resetForm}
              onRightClick={submitForm}
            />
          </Header>
        )}
      </Formik>

      <div className="px-6 py-6 space-y-5" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>

        {/* ── Filters Card ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">

          {/* Row 1 — Dropdowns */}
          <div className="flex gap-2 items-center w-full">
            {[
              { label: "Academic Year", value: filterYear,    setter: setFilterYear,    options: years    },
              { label: "Session",       value: filterSession, setter: setFilterSession, options: sessions },
              { label: "Department",    value: filterDept,    setter: setFilterDept,    options: depts    },
              { label: "Sub-Dept",      value: filterSub,     setter: setFilterSub,     options: subs     },
              { label: "Level",         value: filterLevel,   setter: setFilterLevel,   options: levels   },
              { label: "Status",        value: filterStatus,  setter: setFilterStatus,  options: ["Uploaded", "Not Uploaded"] },
            ].map(({ label, value, setter, options }) => (
              <select key={label} value={value} onChange={(e) => setter(e.target.value)}
                className="flex-1 min-w-[100px] h-9 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:border-orange-400 transition appearance-none cursor-pointer">
                <option value="">{label}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {(filterYear || filterSession || filterDept || filterSub || filterLevel || filterStatus) && (
              <button onClick={resetFilters} className="text-xs font-medium text-orange-500 hover:text-orange-600 transition whitespace-nowrap">
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
              placeholder="Search by department, sub-dept, or file name..."
              className="flex-1 h-full text-sm text-gray-600 bg-transparent placeholder-gray-400 outline-none border-none"
            />
          </div>

        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Curriculum Records
              <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
            </h3>
            <p className="text-xs text-gray-400">
              Showing 1–{Math.min(10, filtered.length)} of {filtered.length} results
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <HiOutlineBookOpen size={32} className="text-orange-400" />
              </div>
              <p className="text-base font-semibold text-gray-700 mb-1">No curriculum records found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or upload a new curriculum.</p>
            </div>
          ) : (
            <CommonTable
              data={filtered}
              columns={columns}
              editable={true}
              pagination={true}
              rowsPerPage={10}
              searchTerm=""
              actionButton={(row) => <ActionMenu row={row} onDelete={handleDelete} />}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CurriculumManagement;
