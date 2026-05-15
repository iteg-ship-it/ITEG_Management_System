/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  MdDeleteOutline,
  MdInsertDriveFile,
  MdMoreVert,
  MdOutlineUploadFile,
  MdVisibility,
} from "react-icons/md";
import { HiOutlineBookOpen } from "react-icons/hi";
import { Search } from "lucide-react";
import Header from "../../../shared/sidebar/Header";
import CommonTable from "../../../shared/table/CommonTable";
import OrangeButton from "../../../shared/sidebar/OrangeButton";
import InputField from "../../../shared/form-fields/InputField";
import CustomDropdown from "../../../shared/form-fields/CustomDropdown";
import RadioGroup from "../../../shared/form-fields/RadioGroup";
import {
  useCreateSyllabusVersionMutation,
  useDeleteSyllabusVersionMutation,
  useGetAllDepartmentsQuery,
  useGetAllLevelsQuery,
  useGetAllSessionsQuery,
  useGetAllSubLevelsQuery,
  useGetAllSubdepartmentsQuery,
  useGetAllSyllabusVersionsQuery,
  useGetAllTasksQuery,
} from "../../../../redux/api/authApi";

const curriculumSchema = Yup.object({
  sessionId: Yup.string().required("Session is required"),
  departmentId: Yup.string().required("Department is required"),
  subDepartmentId: Yup.string().required("Sub-department is required"),
  levelId: Yup.string().required("Level is required"),
  subLevelId: Yup.string().required("Sub-level is required"),
  title: Yup.string().required("Curriculum title is required"),
  version: Yup.string(),
  syllabusFile: Yup.mixed().nullable(),
  taskList: Yup.mixed().nullable(),
  isActive: Yup.boolean(),
});

const INITIAL_VALUES = {
  sessionId: "",
  departmentId: "",
  subDepartmentId: "",
  levelId: "",
  subLevelId: "",
  title: "",
  version: "",
  syllabusFile: null,
  taskList: null,
  isActive: true,
};

const getId = (value) => (typeof value === "object" ? value?._id : value);

const formatAcademicYear = (session) => {
  if (!session?.startDate || !session?.endDate) return "-";
  const startYear = new Date(session.startDate).getFullYear();
  const endYear = new Date(session.endDate).getFullYear();
  if (!startYear || !endYear) return "-";
  return `${startYear}-${String(endYear).slice(-2)}`;
};

const toOptions = (items, getLabel = (item) => item.name) => (
  items
    .filter(Boolean)
    .map((item) => ({ value: item._id, label: getLabel(item) }))
);

const getOptionValues = (items, key) => (
  [...new Set(items.map((item) => item[key]).filter((value) => value && value !== "-"))]
    .sort((a, b) => String(a).localeCompare(String(b)))
);

const FileUploadField = ({ label, name, accept }) => {
  const { setFieldValue, values } = useFormikContext();
  const fileName = values[name]?.name || "";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <label className="flex items-center gap-3 w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:border-orange-400 hover:bg-white transition group">
        <MdOutlineUploadFile size={18} className="text-orange-400 flex-shrink-0" />
        <span className={`text-sm truncate flex-1 ${fileName ? "text-gray-800 font-medium" : "text-gray-400"}`}>
          {fileName || `Click to select ${label.toLowerCase()}`}
        </span>
        {fileName && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFieldValue(name, null);
            }}
            className="text-gray-400 hover:text-red-500 transition flex-shrink-0 text-lg leading-none"
          >
            x
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

const CurriculumDrawerForm = ({ sessions, departments, subDepartments, levels, subLevels }) => {
  const { values, setFieldValue } = useFormikContext();

  const sessionOptions = toOptions(sessions, (item) => `${item.name}${item.status ? ` (${item.status})` : ""}`);
  const departmentOptions = toOptions(departments);
  const subDepartmentOptions = toOptions(
    subDepartments.filter((item) => getId(item.departmentId) === values.departmentId)
  );
  const levelOptions = toOptions(
    levels.filter((item) => getId(item.subDepartmentId) === values.subDepartmentId),
    (item) => `${item.name}${item.order ? ` (${item.order})` : ""}`
  );
  const subLevelOptions = toOptions(
    subLevels.filter((item) => getId(item.levelId) === values.levelId),
    (item) => `${item.name}${item.order ? ` (${item.order})` : ""}`
  );

  return (
    <Form className="space-y-5">
      <InputField label="Curriculum Title" name="title" placeholder="Enter curriculum title" />
      <InputField label="Version" name="version" placeholder="Auto if blank, e.g. v1.0" />

      <CustomDropdown label="Session" name="sessionId" variant="card" options={sessionOptions} />
      <div className="grid grid-cols-2 gap-4">
        <CustomDropdown
          label="Department"
          name="departmentId"
          variant="card"
          options={departmentOptions}
        />
        <CustomDropdown
          label="Sub-Department"
          name="subDepartmentId"
          variant="card"
          disabled={!values.departmentId}
          options={subDepartmentOptions}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CustomDropdown
          label="Level"
          name="levelId"
          variant="card"
          disabled={!values.subDepartmentId}
          options={levelOptions}
        />
        <CustomDropdown
          label="Sub-Level"
          name="subLevelId"
          variant="card"
          disabled={!values.levelId}
          options={subLevelOptions}
        />
      </div>

      <FileUploadField label="Syllabus File Reference" name="syllabusFile" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv" />
      <FileUploadField label="Task List File Reference" name="taskList" accept=".xlsx,.xls,.csv" />

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-800">Active Status</p>
          <p className="text-xs text-gray-400 mt-0.5">Create this curriculum as an active record</p>
        </div>
        <RadioGroup label="" name="isActive" required={false} />
      </div>

      <SyncDependentFields setFieldValue={setFieldValue} values={values} />
    </Form>
  );
};

const SyncDependentFields = ({ values, setFieldValue }) => {
  useEffect(() => {
    if (!values.departmentId) setFieldValue("subDepartmentId", "");
    if (!values.subDepartmentId) setFieldValue("levelId", "");
    if (!values.levelId) setFieldValue("subLevelId", "");
  }, [values.departmentId, values.subDepartmentId, values.levelId, setFieldValue]);
  return null;
};

const FileCell = ({ fileName }) => {
  if (!fileName) return <span className="text-xs text-gray-400 italic">Not Uploaded</span>;
  return (
    <div className="flex items-center gap-1.5">
      <MdInsertDriveFile size={15} className="text-orange-400 flex-shrink-0" />
      <span className="text-xs font-medium text-orange-500 truncate max-w-[150px]">{fileName}</span>
    </div>
  );
};

const ActionMenu = ({ row, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
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
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1 overflow-hidden">
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              <MdVisibility size={15} /> View
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete?.(row);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              <MdDeleteOutline size={15} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const CurriculumManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSub, setFilterSub] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: versionsData, isLoading, isFetching, isError, refetch } = useGetAllSyllabusVersionsQuery();
  const { data: sessionsData } = useGetAllSessionsQuery(true);
  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const { data: subDepartmentsData } = useGetAllSubdepartmentsQuery();
  const { data: levelsData } = useGetAllLevelsQuery();
  const { data: subLevelsData } = useGetAllSubLevelsQuery();
  const { data: tasksData } = useGetAllTasksQuery({ status: "all" });
  const [createSyllabusVersion] = useCreateSyllabusVersionMutation();
  const [deleteSyllabusVersion] = useDeleteSyllabusVersionMutation();

  const sessions = sessionsData?.data || [];
  const departments = departmentsData?.data || [];
  const subDepartments = subDepartmentsData?.data || [];
  const levels = levelsData?.data || [];
  const subLevels = subLevelsData?.data || [];
  const tasks = tasksData?.data || [];

  const taskCountByVersion = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const versionId = getId(task.syllabusVersionId);
      if (versionId) acc[versionId] = (acc[versionId] || 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  const curriculumRows = useMemo(() => {
    return (versionsData?.data || []).map((version) => {
      const level = version.levelId || {};
      const subDepartment = level.subDepartmentId || {};
      const department = subDepartment.departmentId || {};
      const taskCount = taskCountByVersion[version._id] || 0;

      return {
        id: version._id,
        academicYear: formatAcademicYear(version.sessionId),
        session: version.sessionId?.name || "-",
        department: department.name || "-",
        subDept: subDepartment.name || "-",
        level: level.name || "-",
        subLevel: version.subLevelId?.name || "-",
        syllabusFile: version.title || version.version || "Syllabus Version",
        taskList: taskCount ? `${taskCount} task${taskCount > 1 ? "s" : ""}` : null,
        status: version.status || "draft",
        raw: version,
      };
    });
  }, [versionsData, taskCountByVersion]);

  const filtered = useMemo(() => curriculumRows.filter((row) => {
    const q = searchTerm.trim().toLowerCase();
    const searchable = [
      row.syllabusFile,
      row.department,
      row.subDept,
      row.level,
      row.subLevel,
      row.session,
      row.id,
    ].join(" ").toLowerCase();

    return (
      (!q || searchable.includes(q)) &&
      (!filterYear || row.academicYear === filterYear) &&
      (!filterSession || row.session === filterSession) &&
      (!filterDept || row.department === filterDept) &&
      (!filterSub || row.subDept === filterSub) &&
      (!filterLevel || row.level === filterLevel) &&
      (!filterStatus || row.status === filterStatus)
    );
  }), [curriculumRows, searchTerm, filterYear, filterSession, filterDept, filterSub, filterLevel, filterStatus]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterYear("");
    setFilterSession("");
    setFilterDept("");
    setFilterSub("");
    setFilterLevel("");
    setFilterStatus("");
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    if (!window.confirm(`Delete curriculum "${row.syllabusFile}"?`)) return;

    try {
      await deleteSyllabusVersion(row.id).unwrap();
      toast.success("Curriculum deleted successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete curriculum");
    }
  };

  const handleUpload = async (values, { setSubmitting, resetForm }) => {
    try {
      const subjectName = values.syllabusFile?.name
        ? values.syllabusFile.name.replace(/\.[^.]+$/, "")
        : values.title;

      await createSyllabusVersion({
        sessionId: values.sessionId,
        levelId: values.levelId,
        subLevelId: values.subLevelId,
        title: values.title,
        version: values.version || undefined,
        subjects: [{ name: subjectName, topics: [] }],
      }).unwrap();

      toast.success("Curriculum created successfully");
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create curriculum");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "academicYear", label: "Academic Year", render: (row) => <span className="text-sm font-semibold text-gray-800">{row.academicYear}</span> },
    { key: "session", label: "Session", render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 whitespace-nowrap">{row.session}</span> },
    { key: "department", label: "Department", render: (row) => <span className="text-sm font-semibold text-gray-800">{row.department}</span> },
    { key: "subDept", label: "Sub-Department", render: (row) => <span className="text-sm text-gray-600">{row.subDept}</span> },
    { key: "level", label: "Level", render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">{row.level}</span> },
    { key: "subLevel", label: "Sub-Level", render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 whitespace-nowrap">{row.subLevel}</span> },
    { key: "syllabusFile", label: "Syllabus", render: (row) => <FileCell fileName={row.syllabusFile} /> },
    { key: "taskList", label: "Task List", render: (row) => <FileCell fileName={row.taskList} /> },
    { key: "status", label: "Status", render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">{row.status}</span> },
  ];

  const years = getOptionValues(curriculumRows, "academicYear");
  const sessionNames = getOptionValues(curriculumRows, "session");
  const depts = getOptionValues(curriculumRows, "department");
  const subs = getOptionValues(curriculumRows, "subDept");
  const levelNames = getOptionValues(curriculumRows, "level");
  const statuses = getOptionValues(curriculumRows, "status");

  return (
    <>
      <Formik initialValues={INITIAL_VALUES} validationSchema={curriculumSchema} onSubmit={handleUpload}>
        {({ isSubmitting, submitForm, resetForm }) => (
          <Header
            title="Curriculum Management"
            subtitle="Manage syllabus versions and task lists across departments, sessions, and levels"
            breadcrumbs={[{ label: "Academics" }, { label: "Curriculum Management" }]}
          >
            <OrangeButton
              buttonTitle="+ Upload Curriculum"
              panelTitle="Upload Curriculum"
              panelSubtitle="Create a syllabus-version record for a department, session, level, and sub-level"
              drawerContent={
                <CurriculumDrawerForm
                  sessions={sessions}
                  departments={departments}
                  subDepartments={subDepartments}
                  levels={levels}
                  subLevels={subLevels}
                />
              }
              leftBtnText="Cancel"
              rightBtnText={isSubmitting ? "Uploading..." : "Upload"}
              onLeftClick={resetForm}
              onRightClick={submitForm}
            />
          </Header>
        )}
      </Formik>

      <div className="px-6 py-6 space-y-5" style={{ backgroundColor: "#F8F7F5", minHeight: "calc(100vh - 80px)" }}>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <div className="flex gap-2 items-center w-full">
            {[
              { label: "Academic Year", value: filterYear, setter: setFilterYear, options: years },
              { label: "Session", value: filterSession, setter: setFilterSession, options: sessionNames },
              { label: "Department", value: filterDept, setter: setFilterDept, options: depts },
              { label: "Sub-Dept", value: filterSub, setter: setFilterSub, options: subs },
              { label: "Level", value: filterLevel, setter: setFilterLevel, options: levelNames },
              { label: "Status", value: filterStatus, setter: setFilterStatus, options: statuses },
            ].map(({ label, value, setter, options }) => (
              <select
                key={label}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="flex-1 min-w-[100px] h-9 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 bg-white focus:outline-none focus:border-orange-400 transition appearance-none cursor-pointer"
              >
                <option value="">{label}</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ))}
            {(filterYear || filterSession || filterDept || filterSub || filterLevel || filterStatus || searchTerm) && (
              <button onClick={resetFilters} className="text-xs font-medium text-orange-500 hover:text-orange-600 transition whitespace-nowrap">
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
              placeholder="Search by department, sub-dept, level, session, or syllabus..."
              className="flex-1 h-full text-sm text-gray-600 bg-transparent placeholder-gray-400 outline-none border-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Curriculum Records
              <span className="ml-2 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
            </h3>
            <p className="text-xs text-gray-400">
              {isFetching ? "Refreshing records..." : `Showing ${filtered.length ? 1 : 0}-${Math.min(10, filtered.length)} of ${filtered.length} results`}
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-sm text-gray-400">Loading curriculum records...</div>
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="text-sm text-red-500">Failed to load curriculum records</p>
              <button onClick={refetch} className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
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
