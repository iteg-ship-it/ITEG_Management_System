import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdFilterList, MdCloudUpload } from "react-icons/md";
import Header from "../../common-components/sidebar/Header";
import OrangeButton from "../../common-components/sidebar/OrangeButton";
import { useGetSubLevelsByLevelQuery, useAddSubLevelMutation, useGetSyllabusVersionsBySubLevelQuery, useGetTasksBySyllabusVersionQuery } from "../../../redux/api/authApi";
import SearchBox from "../../common-components/seach-export/SearchBox";
import ExportDropdown from "../../common-components/seach-export/ExportDropdown";
import CommonTable from "../../common-components/table/CommonTable";
import InputField from "../../common-components/common-feild/InputField";
import RadioGroup from "../../common-components/common-feild/RadioGroup";
import SyllabusTab, { SyllabusUploadDrawer, TaskUploadDrawer, VersionTasksTable } from "./SyllabusTab";

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

    const [activeTab,     setActiveTab]     = useState(null);
    const [activeSection, setActiveSection] = useState("Students");
    const [searchTerm,    setSearchTerm]    = useState("");
    const [activeTaskVersionId, setActiveTaskVersionId] = useState("");
    const syllabusDrawerRef = useRef(null);

    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(level?._id, { skip: !level?._id });
    const subLevels  = subLevelsData?.data || [];

    // Auto-select first subLevel when data loads
    const activeSubLevel = activeTab || subLevels[0] || null;

    // Check if syllabus exists for active subLevel
    const { data: syllabusData, refetch: refetchSyllabus } = useGetSyllabusVersionsBySubLevelQuery(
        { subLevelId: activeSubLevel?._id },
        { skip: !activeSubLevel?._id }
    );
    const hasSyllabus = (syllabusData?.data?.length || 0) > 0;

    // Check if tasks exist for active version (for header button)
    const { data: tasksData } = useGetTasksBySyllabusVersionQuery(
        activeTaskVersionId,
        { skip: !activeTaskVersionId || activeSection !== "Tasks" }
    );
    const hasTasks = (tasksData?.tasks?.length || 0) > 0;

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
                        {subLevels.map((sl) => (
                            <button
                                key={sl._id}
                                onClick={() => setActiveTab(sl)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                                    activeSubLevel?._id === sl._id
                                        ? "border-orange-500 text-orange-500 font-semibold"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {sl.name}
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

                {/* Upload Syllabus — only when Syllabus tab active AND syllabus already exists */}
                {activeSection === "Syllabus" && hasSyllabus && (
                    <OrangeButton
                        buttonTitle={
                            <span className="flex items-center gap-1.5">
                                <MdCloudUpload size={15} /> Upload Syllabus
                            </span>
                        }
                        panelTitle="Upload Syllabus"
                        panelSubtitle="Upload an Excel file with Session, Subject, Topic, SubTopic columns."
                        drawerContent={
                            <SyllabusUploadDrawer
                                ref={syllabusDrawerRef}
                                level={level}
                                subLevel={activeSubLevel}
                                onSaved={refetchSyllabus}
                            />
                        }
                        leftBtnText="Close"
                        rightBtnText=""
                        onLeftClick={() => syllabusDrawerRef.current?.reset()}
                    />
                )}
                {/* Upload Tasks — only when Tasks tab active AND tasks already exist */}
                {activeSection === "Tasks" && hasTasks && activeTaskVersionId && (
                    <OrangeButton
                        buttonTitle={
                            <span className="flex items-center gap-1.5">
                                <MdCloudUpload size={15} /> Upload Tasks
                            </span>
                        }
                        panelTitle="Upload Tasks"
                        panelSubtitle="Upload an Excel file with Topic, SubTopic, TaskTitle columns."
                        drawerContent={
                            <TaskUploadDrawer
                                syllabusVersionId={activeTaskVersionId}
                                subjectName={syllabusData?.data?.find(v => v._id === activeTaskVersionId)?.subjectName || ""}
                                version={syllabusData?.data?.find(v => v._id === activeTaskVersionId)?.version || ""}
                                onSaved={refetchSyllabus}
                            />
                        }
                        leftBtnText="Close"
                        rightBtnText=""
                        onLeftClick={() => {}}
                    />
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
                                key={`students-${activeSubLevel?._id}`}
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
                        <TasksTab level={level} subLevel={activeSubLevel} onVersionChange={setActiveTaskVersionId} />
                    )}

                    {/* ── Syllabus ── */}
                    {activeSection === "Syllabus" && (
                        <SyllabusTab
                            key={activeSubLevel?._id}
                            level={level}
                            subLevel={activeSubLevel}
                        />
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

const TasksTab = ({ level, subLevel, onVersionChange }) => {
    const subLevelId = subLevel?._id;
    const [selectedVersionId, setSelectedVersionId] = useState("");

    const { data: versionsData, refetch } = useGetSyllabusVersionsBySubLevelQuery(
        { subLevelId, sessionId: "" },
        { skip: !subLevelId }
    );
    const versions = versionsData?.data || [];

    const activeVersion = versions.find((v) => v._id === selectedVersionId) || versions[0];
    const versionId = activeVersion?._id || "";

    // Notify parent of active version
    useEffect(() => { onVersionChange?.(versionId); }, [versionId]);

    const { data: tasksData, refetch: refetchTasks } = useGetTasksBySyllabusVersionQuery(
        versionId,
        { skip: !versionId }
    );
    const hasTasks = (tasksData?.tasks?.length || 0) > 0;

    if (!versions.length) {
        return (
            <div className="py-16 text-center text-gray-400 text-sm">
                No syllabus found. Please upload a syllabus first from the Syllabus tab.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Subject:</span>
                <select
                    value={versionId}
                    onChange={(e) => { setSelectedVersionId(e.target.value); onVersionChange?.(e.target.value); }}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
                >
                    {versions.map((v) => (
                        <option key={v._id} value={v._id}>
                            {v.subjectName} — {v.version} ({v.status})
                        </option>
                    ))}
                </select>
            </div>

            {versionId && (
                <div className="space-y-4">
                    {!hasTasks && (
                        <TaskUploadDrawer
                            syllabusVersionId={versionId}
                            subjectName={activeVersion?.subjectName || ""}
                            version={activeVersion?.version || ""}
                            onSaved={refetchTasks}
                        />
                    )}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <VersionTasksTable versionId={versionId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowSubLevelTablesData;
