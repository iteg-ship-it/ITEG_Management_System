import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdFilterList, MdEdit, MdVisibility, MdBlock, MdCheckCircle, MdDownload, MdPictureAsPdf, MdDescription, MdTableChart, MdCloudUpload } from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { useGetSubLevelsByLevelQuery, useAddSubLevelMutation } from "../../../redux/api/authApi";
import SearchBox from "../../common-components/seach-export/SearchBox";
import ExportDropdown from "../../common-components/seach-export/ExportDropdown";
import CommonTable from "../../common-components/table/CommonTable";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";

/* ── Validation ── */
const validationSchema = Yup.object({
    name: Yup.string().required("SubLevel name is required"),
    order: Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean(),
});

/* ── Students ── */
const DUMMY_STUDENTS = [
    { sno: 1, fullName: "Rahul Sharma",  fatherName: "Ramesh Sharma",  mobile: "9876543210", course: "B.Tech", busRoute: "Route 1", attempts: 2 },
    { sno: 2, fullName: "Priya Verma",   fatherName: "Suresh Verma",   mobile: "9812345678", course: "MCA",    busRoute: "Route 3", attempts: 1 },
    { sno: 3, fullName: "Amit Patel",    fatherName: "Dinesh Patel",   mobile: "9898765432", course: "BCA",    busRoute: "Route 2", attempts: 3 },
    { sno: 4, fullName: "Sneha Joshi",   fatherName: "Mahesh Joshi",   mobile: "9765432109", course: "B.Tech", busRoute: "Route 5", attempts: 1 },
    { sno: 5, fullName: "Vikram Singh",  fatherName: "Rajendra Singh", mobile: "9654321098", course: "MBA",    busRoute: "Route 4", attempts: 2 },
];

const STUDENT_COLUMNS = [
    { label: "S.No",        key: "sno" },
    { label: "Full Name",   key: "fullName" },
    { label: "Father Name", key: "fatherName" },
    { label: "Mobile No.",  key: "mobile" },
    {
        label: "Course", key: "course",
        render: (row) => <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{row.course}</span>,
    },
    { label: "Bus Route", key: "busRoute" },
    {
        label: "Attempts", key: "attempts",
        render: (row) => (
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{row.attempts}</span>
        ),
    },
];

/* ── Tasks ── */
const DUMMY_TASKS = [
    { _id: "T001", title: "Complete Python Assignment",  description: "Build a REST API using Flask",              priority: "HIGH",   assignedTo: "Rahul Sharma", type: "MANUAL", status: "ACTIVE"    },
    { _id: "T002", title: "Database Design Project",     description: "Design ER diagram for e-commerce system",  priority: "MEDIUM", assignedTo: "Priya Verma",  type: "BULK",   status: "ACTIVE"    },
    { _id: "T003", title: "React Component Development", description: "Create reusable UI components",            priority: "HIGH",   assignedTo: "Amit Patel",   type: "MANUAL", status: "COMPLETED" },
    { _id: "T004", title: "Unit Testing",                description: "Write test cases for auth module",         priority: "LOW",    assignedTo: "Sneha Joshi",  type: "MANUAL", status: "ACTIVE"    },
    { _id: "T005", title: "Code Review",                 description: "Review pull requests from team members",   priority: "MEDIUM", assignedTo: "Vikram Singh", type: "BULK",   status: "DISABLED"  },
    { _id: "T006", title: "Documentation Update",        description: "Update API docs with new endpoints",       priority: "LOW",    assignedTo: "Rahul Sharma", type: "MANUAL", status: "COMPLETED" },
];

const PRIORITY_STYLES = { HIGH: "bg-red-100 text-red-700",    MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
const TYPE_STYLES     = { MANUAL: "bg-gray-100 text-gray-600", BULK: "bg-blue-100 text-blue-700" };
const STATUS_STYLES   = { ACTIVE: "bg-green-100 text-green-700", COMPLETED: "bg-blue-100 text-blue-700", DISABLED: "bg-gray-100 text-gray-500" };

const Badge = ({ label, styleMap }) => (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styleMap[label] || "bg-gray-100 text-gray-500"}`}>
        {label}
    </span>
);

const TASK_COLUMNS = [
    { key: "_id",  label: "Task ID",     render: (row) => <span className="text-xs font-mono text-gray-500">{row._id}</span> },
    {
        key: "title", label: "Task Details",
        render: (row) => (
            <div className="min-w-[160px]">
                <p className="font-semibold text-sm text-gray-800">{row.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{row.description}</p>
            </div>
        ),
    },
    { key: "priority",   label: "Priority",    render: (row) => <Badge label={row.priority}   styleMap={PRIORITY_STYLES} /> },
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
        <button title="View"  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"><MdVisibility size={16} /></button>
        <button title="Edit"  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"><MdEdit size={16} /></button>
        {row.status === "DISABLED"
            ? <button title="Enable"  className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition"><MdCheckCircle size={16} /></button>
            : <button title="Disable" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"><MdBlock size={16} /></button>
        }
    </div>
);

/* ── Syllabus ── */
const DUMMY_SYLLABUS = [];

const FILE_ICON = {
    PDF:  <MdPictureAsPdf size={28} className="text-red-500" />,
    DOCX: <MdDescription  size={28} className="text-blue-500" />,
    XLSX: <MdTableChart   size={28} className="text-green-600" />,
};

const SYLLABUS_COLUMNS = [
    {
        key: "fileName", label: "Syllabus File Name",
        render: (row) => (
            <div className="flex items-center gap-3 min-w-[200px]">
                <div className="flex-shrink-0">{FILE_ICON[row.ext] || <MdDescription size={28} className="text-gray-400" />}</div>
                <div>
                    <p className="font-semibold text-sm text-gray-800">{row.fileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.size} • {row.description}</p>
                </div>
            </div>
        ),
    },
    { key: "uploadDate",   label: "Upload Date",   render: (row) => <span className="text-sm text-gray-600">{row.uploadDate}</span> },
    {
        key: "academicYear", label: "Academic Year",
        render: (row) => <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">{row.academicYear}</span>,
    },
];

const SyllabusActions = () => (
    <div className="flex items-center gap-1">
        <button title="View"     className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"><MdVisibility size={16} /></button>
        <button title="Download" className="p-1.5 rounded-lg text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition"><MdDownload size={16} /></button>
    </div>
);

/* ── Progress ── */
const DUMMY_PROGRESS = [
    { _id: "P001", name: "Alex Harrison",   level: "2A", taskDone: 4, taskTotal: 8, subjectDone: 3, subjectInProgress: 2, subjectTotal: 8, pending: 2, inProgress: 2, done: 4, status: "ACTIVE"  },
    { _id: "P002", name: "Sarah Miller",    level: "2B", taskDone: 6, taskTotal: 8, subjectDone: 5, subjectInProgress: 1, subjectTotal: 8, pending: 1, inProgress: 1, done: 6, status: "ACTIVE"  },
    { _id: "P003", name: "David Chen",      level: "1A", taskDone: 2, taskTotal: 8, subjectDone: 1, subjectInProgress: 2, subjectTotal: 8, pending: 4, inProgress: 2, done: 2, status: "ON HOLD" },
    { _id: "P004", name: "Elena Rodriguez", level: "1B", taskDone: 8, taskTotal: 8, subjectDone: 8, subjectInProgress: 0, subjectTotal: 8, pending: 0, inProgress: 0, done: 8, status: "ACTIVE"  },
    { _id: "P005", name: "James Wilson",    level: "2A", taskDone: 3, taskTotal: 8, subjectDone: 2, subjectInProgress: 3, subjectTotal: 8, pending: 3, inProgress: 3, done: 2, status: "ON HOLD" },
];

const PROGRESS_STATUS_STYLES = { "ACTIVE": "bg-green-100 text-green-700", "ON HOLD": "bg-yellow-100 text-yellow-700" };

const TaskProgressBar = ({ done, total }) => {
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return (
        <div className="min-w-[120px]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{done}/{total}</span>
                <span className="text-xs font-semibold text-orange-500">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const SubjectProgressBar = ({ done, inProgress, total }) => {
    const donePct   = total > 0 ? (done / total) * 100 : 0;
    const inProgPct = total > 0 ? (inProgress / total) * 100 : 0;
    return (
        <div className="min-w-[120px]">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500 transition-all"  style={{ width: `${donePct}%` }} />
                <div className="h-full bg-orange-400 transition-all" style={{ width: `${inProgPct}%` }} />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{done} Done</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />{inProgress} In Progress</span>
            </div>
        </div>
    );
};

const PROGRESS_COLUMNS = [
    {
        key: "name", label: "Student Name",
        render: (row) => <span className="font-semibold text-sm text-orange-500 cursor-pointer hover:text-orange-600">{row.name}</span>,
    },
    {
        key: "level", label: "Level",
        render: (row) => (
            <div>
                <p className="text-xs text-gray-400">Level</p>
                <p className="text-sm font-semibold text-gray-700">{row.level}</p>
            </div>
        ),
    },
    {
        key: "taskDone", label: "Task Progress",
        render: (row) => <TaskProgressBar done={row.taskDone} total={row.taskTotal} />,
    },
    {
        key: "subjectDone", label: "Subject Progress",
        render: (row) => <SubjectProgressBar done={row.subjectDone} inProgress={row.subjectInProgress} total={row.subjectTotal} />,
    },
    {
        key: "pending", label: "Status Counters",
        render: (row) => (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit">{row.pending} Pending</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100   text-blue-700   w-fit">{row.inProgress} In Progress</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100  text-green-700  w-fit">{row.done} Done</span>
            </div>
        ),
    },
    {
        key: "status", label: "Current Status",
        render: (row) => (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${PROGRESS_STATUS_STYLES[row.status] || "bg-gray-100 text-gray-500"}`}>
                {row.status}
            </span>
        ),
    },
];

const ProgressTab = () => {
    const [progressSearch, setProgressSearch] = useState("");
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <SearchBox searchTerm={progressSearch} setSearchTerm={setProgressSearch} />
                <div className="ml-auto flex items-center gap-3">
                    <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                        <MdFilterList size={16} /> Filter
                    </button>
                    <ExportDropdown data={DUMMY_PROGRESS} sectionName="progress" />
                </div>
            </div>
            <CommonTable
                columns={PROGRESS_COLUMNS}
                data={DUMMY_PROGRESS}
                editable={false}
                pagination={true}
                rowsPerPage={10}
                searchTerm={progressSearch}
            />
        </div>
    );
};

const SECTION_TABS = ["Students", "Tasks", "Syllabus", "Progress"];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ShowSubLevelTablesData = () => {
    const location       = useLocation();
    const navigate       = useNavigate();
    const level          = location.state?.level;
    const subdepartment  = location.state?.subdepartment;
    const departmentId   = location.state?.departmentId;
    const departmentName = location.state?.departmentName;
    const session        = location.state?.session || location.state?.sessionName;

    const [activeTab,     setActiveTab]     = useState("");
    const [activeSection, setActiveSection] = useState("Students");
    const [searchTerm,    setSearchTerm]    = useState("");

    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(level?._id, { skip: !level?._id });
    const subLevels = subLevelsData?.data || [];
    const levelTabs = subLevels.length > 0
        ? subLevels.map((sl) => sl.name)
        : ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"];

    const [addSubLevel] = useAddSubLevelMutation();

    const handleSectionChange = (tab) => { setActiveSection(tab); setSearchTerm(""); };

    const breadcrumbs = [
        { label: "Departments", path: "/department-management" },
        { label: session ? `${departmentName || "Department"} • ${session}` : departmentName || "Department", path: `/department-details/${departmentId}`, state: { department: subdepartment?.departmentId } },
        { label: subdepartment?.name || "Subdepartment", path: "/subdepartment-details", state: { subdepartment, departmentId, departmentName } },
        { label: level?.name || "Level" },
    ];

    return (
        <>
            <Header
                title={level?.name || "SubLevel Tables"}
                badge={session || undefined}
                subtitle={subdepartment?.name ? `Sub-Department: ${subdepartment.name}` : undefined}
                showBack={true}
                breadcrumbs={breadcrumbs}
                bottomRow={
                    <div className="flex gap-1 overflow-x-auto">
                        {levelTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                                    activeTab === tab
                                        ? "border-orange-500 text-orange-500 font-semibold"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                }
            >
                {activeSection === "Progress" && (
                    <button
                        onClick={() => {}}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-500 bg-white border border-orange-500 rounded-md hover:bg-orange-50 transition flex-shrink-0"
                    >
                        <MdTableChart size={16} /> Upload Excel
                    </button>
                )}
                {activeSection === "Tasks" ? (
                    <Formik
                        initialValues={{ title: "", description: "", subject: "", priority: "", dueDate: "", assignTo: "selected", studentSearch: "", selectedStudents: [] }}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            toast.success("Task added successfully!");
                            resetForm();
                            setSubmitting(false);
                        }}
                    >
                        {({ values, setFieldValue, submitForm, resetForm }) => (
                            <OrangeButton
                                buttonTitle="+ Add Task"
                                panelTitle="Add New Task"
                                panelSubtitle={`Assign tasks to students in ${level?.name || "this level"}`}
                                drawerContent={
                                    <Form className="space-y-5">

                                        {/* ── Action Cards ── */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                                                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <MdTableChart size={20} className="text-orange-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">Upload Excel</p>
                                                <p className="text-xs text-gray-400">Upload up to 50 tasks via Excel sheet</p>
                                                <button type="button" className="mt-1 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition">CHOOSE FILE</button>
                                            </div>
                                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                                                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                                    <MdCheckCircle size={20} className="text-green-500" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800">Add Manually</p>
                                                <p className="text-xs text-gray-400">Create a single task manually here</p>
                                                <button type="button" className="mt-1 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition">ADD TASK</button>
                                            </div>
                                        </div>

                                        {/* ── Task Details ── */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Task Details</p>
                                            <div className="space-y-3">
                                                <InputField label="Task Title" name="title" placeholder="Enter task title" />
                                                <InputField label="Description" name="description" type="textarea" placeholder="Enter task description" />
                                                <InputField label="Subject" name="subject" type="select" placeholder="Select subject" options={[
                                                    { value: "math", label: "Mathematics" },
                                                    { value: "science", label: "Science" },
                                                    { value: "english", label: "English" },
                                                    { value: "cs", label: "Computer Science" },
                                                ]} />
                                                <InputField label="Priority" name="priority" type="select" placeholder="Select priority" options={[
                                                    { value: "HIGH", label: "High" },
                                                    { value: "MEDIUM", label: "Medium" },
                                                    { value: "LOW", label: "Low" },
                                                ]} />
                                                <InputField label="Due Date" name="dueDate" type="date" />
                                            </div>
                                        </div>

                                        {/* ── Task Assignment ── */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Task Assignment</p>
                                            <div className="space-y-3">
                                                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                                                    {["selected", "all"].map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setFieldValue("assignTo", opt)}
                                                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                                                                values.assignTo === opt
                                                                    ? "bg-white text-orange-500 shadow"
                                                                    : "text-gray-500 hover:text-gray-700"
                                                            }`}
                                                        >
                                                            {opt === "selected" ? "Selected Students" : "All Students"}
                                                        </button>
                                                    ))}
                                                </div>
                                                {values.assignTo === "selected" && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            placeholder="Search students..."
                                                            value={values.studentSearch}
                                                            onChange={(e) => setFieldValue("studentSearch", e.target.value)}
                                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:bg-white transition"
                                                        />
                                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                                            {DUMMY_STUDENTS
                                                                .filter((s) => s.fullName.toLowerCase().includes(values.studentSearch.toLowerCase()))
                                                                .map((s) => (
                                                                    <label key={s.sno} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="w-4 h-4 accent-orange-500"
                                                                            checked={values.selectedStudents.includes(s.sno)}
                                                                            onChange={(e) => {
                                                                                const updated = e.target.checked
                                                                                    ? [...values.selectedStudents, s.sno]
                                                                                    : values.selectedStudents.filter((id) => id !== s.sno);
                                                                                setFieldValue("selectedStudents", updated);
                                                                            }}
                                                                        />
                                                                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                                            {s.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-800">{s.fullName}</p>
                                                                            <p className="text-xs text-gray-400">{s.mobile}</p>
                                                                        </div>
                                                                    </label>
                                                                ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                    </Form>
                                }
                                leftBtnText="Cancel"
                                rightBtnText="Save Task"
                                onLeftClick={resetForm}
                                onRightClick={submitForm}
                            />
                        )}
                    </Formik>
                ) : (
                <Formik
                    initialValues={{ name: "", order: "", isActive: true }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            await addSubLevel({ name: values.name, order: Number(values.order), levelId: level?._id, isActive: values.isActive }).unwrap();
                            toast.success("SubLevel added successfully!");
                            resetForm();
                        } catch (error) {
                            toast.error(error?.data?.message || "Error adding sublevel");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, submitForm, resetForm }) => (
                        <OrangeButton
                            buttonTitle="+ Add Sub Level"
                            panelTitle="Add New Sub Level"
                            drawerContent={
                                <Form className="space-y-4">
                                    <InputField label="SubLevel Name" name="name" placeholder="Enter sublevel name" />
                                    <InputField label="Order" name="order" type="number" placeholder="Enter order number" />
                                    <RadioGroup label="Status" name="isActive" required={false} />
                                </Form>
                            }
                            leftBtnText="Cancel"
                            rightBtnText={isSubmitting ? "Adding..." : "Add Sub Level"}
                            onLeftClick={resetForm}
                            onRightClick={submitForm}
                        />
                    )}
                </Formik>
                )}
            </Header>

            <div className="px-6 pb-10">

                {/* Section Tabs */}
                <div className="flex gap-2 w-fit bg-[#E2E8F080] border border-gray-200 p-1.5 rounded-xl mt-5">
                    {SECTION_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleSectionChange(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeSection === tab
                                    ? "bg-white text-orange-500 shadow"
                                    : "text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="py-6">

                    {/* ── Students ── */}
                    {activeSection === "Students" && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                <div className="ml-auto flex items-center gap-3">
                                    <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                                        <MdFilterList size={16} /> Filter
                                    </button>
                                    <ExportDropdown data={DUMMY_STUDENTS} sectionName="students" />
                                </div>
                            </div>
                            <CommonTable
                                key={`students-${activeTab}`}
                                columns={STUDENT_COLUMNS}
                                data={DUMMY_STUDENTS}
                                editable={false}
                                pagination={true}
                                rowsPerPage={10}
                                searchTerm={searchTerm}
                                onRowClick={(row) => navigate("/setting/student-profile", { state: { student: row } })}
                            />
                        </div>
                    )}

                    {/* ── Tasks ── */}
                    {activeSection === "Tasks" && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                <div className="ml-auto flex items-center gap-3">
                                    <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                                        <MdFilterList size={16} /> Filter
                                    </button>
                                    <ExportDropdown data={DUMMY_TASKS} sectionName="tasks" />
                                </div>
                            </div>
                            <CommonTable
                                key={`tasks-${activeTab}`}
                                columns={TASK_COLUMNS}
                                data={DUMMY_TASKS}
                                editable={true}
                                pagination={true}
                                rowsPerPage={10}
                                searchTerm={searchTerm}
                                actionButton={(row) => <TaskActions row={row} />}
                            />
                        </div>
                    )}

                    {/* ── Syllabus ── */}
                    {activeSection === "Syllabus" && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                <div className="ml-auto flex items-center gap-3">
                                    <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                                        <MdFilterList size={16} /> Filter
                                    </button>
                                    <ExportDropdown data={DUMMY_SYLLABUS} sectionName="syllabus" />
                                </div>
                            </div>
                            {DUMMY_SYLLABUS.length === 0 ? (
                                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 px-8 text-center">
                                    <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                                        <MdCloudUpload size={44} className="text-orange-400" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800 mb-2">No syllabus uploaded for this level.</h3>
                                    <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
                                        Upload the academic syllabus to get started. Once uploaded, you can assign lessons to specific weeks and track coverage.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
                                            <MdCloudUpload size={16} /> Upload Syllabus
                                        </button>
                                        <button className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                                            Browse Template
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <CommonTable
                                    key={`syllabus-${activeTab}`}
                                    columns={SYLLABUS_COLUMNS}
                                    data={DUMMY_SYLLABUS}
                                    editable={true}
                                    pagination={true}
                                    rowsPerPage={10}
                                    searchTerm={searchTerm}
                                    actionButton={() => <SyllabusActions />}
                                />
                            )}
                        </div>
                    )}

                    {/* ── Progress ── */}
                    {activeSection === "Progress" && <ProgressTab />}

                </div>
            </div>
        </>
    );
};

export default ShowSubLevelTablesData;
