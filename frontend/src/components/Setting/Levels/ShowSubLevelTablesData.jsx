import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdFilterList, MdEdit, MdVisibility, MdBlock, MdCheckCircle } from "react-icons/md";
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

/* ── Static dummy data ── */
const DUMMY_STUDENTS = [
    { sno: 1, fullName: "Rahul Sharma",  fatherName: "Ramesh Sharma",   mobile: "9876543210", course: "B.Tech", busRoute: "Route 1", attempts: 2 },
    { sno: 2, fullName: "Priya Verma",   fatherName: "Suresh Verma",    mobile: "9812345678", course: "MCA",    busRoute: "Route 3", attempts: 1 },
    { sno: 3, fullName: "Amit Patel",    fatherName: "Dinesh Patel",    mobile: "9898765432", course: "BCA",    busRoute: "Route 2", attempts: 3 },
    { sno: 4, fullName: "Sneha Joshi",   fatherName: "Mahesh Joshi",    mobile: "9765432109", course: "B.Tech", busRoute: "Route 5", attempts: 1 },
    { sno: 5, fullName: "Vikram Singh",  fatherName: "Rajendra Singh",  mobile: "9654321098", course: "MBA",    busRoute: "Route 4", attempts: 2 },
];

const DUMMY_TASKS = [
    { _id: "T001", title: "Complete Python Assignment",    description: "Build a REST API using Flask",              priority: "HIGH",   assignedTo: "Rahul Sharma",  type: "MANUAL", status: "ACTIVE"    },
    { _id: "T002", title: "Database Design Project",       description: "Design ER diagram for e-commerce system",   priority: "MEDIUM", assignedTo: "Priya Verma",   type: "BULK",   status: "ACTIVE"    },
    { _id: "T003", title: "React Component Development",   description: "Create reusable UI components",             priority: "HIGH",   assignedTo: "Amit Patel",    type: "MANUAL", status: "COMPLETED" },
    { _id: "T004", title: "Unit Testing",                  description: "Write test cases for authentication module", priority: "LOW",    assignedTo: "Sneha Joshi",   type: "MANUAL", status: "ACTIVE"    },
    { _id: "T005", title: "Code Review",                   description: "Review pull requests from team members",    priority: "MEDIUM", assignedTo: "Vikram Singh",  type: "BULK",   status: "DISABLED"  },
    { _id: "T006", title: "Documentation Update",          description: "Update API docs with new endpoints",        priority: "LOW",    assignedTo: "Rahul Sharma",  type: "MANUAL", status: "COMPLETED" },
];

/* ── Badge style maps ── */
const PRIORITY_STYLES = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
const TYPE_STYLES     = { MANUAL: "bg-gray-100 text-gray-600", BULK: "bg-blue-100 text-blue-700" };
const STATUS_STYLES   = { ACTIVE: "bg-green-100 text-green-700", COMPLETED: "bg-blue-100 text-blue-700", DISABLED: "bg-gray-100 text-gray-500" };

const Badge = ({ label, styleMap }) => (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styleMap[label] || "bg-gray-100 text-gray-500"}`}>
        {label}
    </span>
);

/* ── Column definitions ── */
const STUDENT_COLUMNS = [
    { label: "S.No",        key: "sno" },
    { label: "Full Name",   key: "fullName" },
    { label: "Father Name", key: "fatherName" },
    { label: "Mobile No.",  key: "mobile" },
    {
        label: "Course", key: "course",
        render: (row) => <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{row.course}</span>,
    },
    { label: "Bus Route",   key: "busRoute" },
    {
        label: "Attempts", key: "attempts",
        render: (row) => (
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{row.attempts}</span>
        ),
    },
];

const TASK_COLUMNS = [
    { key: "_id",   label: "Task ID",      render: (row) => <span className="text-xs font-mono text-gray-500">{row._id}</span> },
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
        <button title="View"   className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"><MdVisibility size={16} /></button>
        <button title="Edit"   className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"><MdEdit size={16} /></button>
        {row.status === "DISABLED"
            ? <button title="Enable"  className="p-1.5 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 transition"><MdCheckCircle size={16} /></button>
            : <button title="Disable" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"><MdBlock size={16} /></button>
        }
    </div>
);

const SECTION_TABS = ["Students", "Tasks", "Syllabus", "Progress"];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const ShowSubLevelTablesData = () => {
    const location      = useLocation();
    const level         = location.state?.level;
    const subdepartment = location.state?.subdepartment;
    const departmentId  = location.state?.departmentId;
    const departmentName = location.state?.departmentName;
    const session       = location.state?.session || location.state?.sessionName;

    const [activeTab,     setActiveTab]     = useState("");
    const [activeSection, setActiveSection] = useState("Students");
    const [searchTerm,    setSearchTerm]    = useState("");

    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(level?._id, { skip: !level?._id });
    const subLevels  = subLevelsData?.data || [];
    const levelTabs  = subLevels.length > 0
        ? subLevels.map((sl) => sl.name)
        : ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"];

    const [addSubLevel] = useAddSubLevelMutation();

    const handleSectionChange = (tab) => {
        setActiveSection(tab);
        setSearchTerm("");
    };

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
                        <div className="py-16 text-center text-gray-400 text-sm">Syllabus content coming soon</div>
                    )}

                    {/* ── Progress ── */}
                    {activeSection === "Progress" && (
                        <div className="py-16 text-center text-gray-400 text-sm">Progress content coming soon</div>
                    )}

                </div>
            </div>
        </>
    );
};

export default ShowSubLevelTablesData;
