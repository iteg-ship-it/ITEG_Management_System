import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdFilterList, MdCloudUpload, MdTableChart } from "react-icons/md";
import Header from "../../../shared/sidebar/Header";
import OrangeButton from "../../../shared/sidebar/OrangeButton";
import { useGetSubLevelsByLevelQuery, useAddSubLevelMutation, useGetSyllabusVersionsBySubLevelQuery, useGetNewStudentsQuery } from "../../../../redux/api/authApi";
import SearchBox from "../../../shared/search-export/SearchBox";
import ExportDropdown from "../../../shared/search-export/ExportDropdown";
import CommonTable from "../../../shared/table/CommonTable";
import InputField from "../../../shared/form-fields/InputField";
import RadioGroup from "../../../shared/form-fields/RadioGroup";
import SyllabusTab, { TasksTab, ManualTaskForm, TaskUploadDrawer, SyllabusUploadDrawer, ManualSyllabusForm } from "./SyllabusTab";
import Loader from "../../../shared/loader/Loader";

const validationSchema = Yup.object({
    name: Yup.string().required("SubLevel name is required"),
    order: Yup.number().required("Order is required").positive("Must be positive"),
    isActive: Yup.boolean(),
});

const STUDENT_COLUMNS = [
    { label: "S.No",        key: "sno" },
    { label: "Full Name",   key: "fullName" },
    { label: "Father Name", key: "fatherName" },
    { label: "Mobile No.",  key: "mobile" },
    { label: "Course",      key: "course", render: (row) => <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{row.course}</span> },
    { label: "Status",      key: "status", render: (row) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            row.status === "Active"    ? "bg-green-100 text-green-700" :
            row.status === "Dropped"   ? "bg-red-100 text-red-700" :
            row.status === "Placed"    ? "bg-purple-100 text-purple-700" :
            "bg-gray-100 text-gray-600"
        }`}>{row.status}</span>
    )},
];

const StudentsTab = ({ subLevel, searchTerm, setSearchTerm, onRowClick, onTaskBoard }) => {
    const params = subLevel?._id ? `currentSubLevelId=${subLevel._id}` : "";
    const { data, isLoading } = useGetNewStudentsQuery(params, { skip: !subLevel?._id });

    const students = (data?.data || []).map((s, i) => ({
        _id: s._id,
        sno: i + 1,
        fullName: `${s.firstName} ${s.lastName}`,
        fatherName: s.fatherName,
        mobile: s.studentMobile,
        course: s.course,
        status: s.status,
        prkey: s.prkey,
        raw: s,
    }));

    const columns = [
        ...STUDENT_COLUMNS,
        { label: "Task Board", key: "taskboard", render: (row) => (
            <button
                onClick={(e) => { e.stopPropagation(); onTaskBoard(row); }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-200 transition"
            >
                <MdTableChart size={14} /> Task Board
            </button>
        )},
    ];

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <div className="ml-auto flex items-center gap-3">
                    <button className="flex items-center gap-1.5 h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition flex-shrink-0">
                        <MdFilterList size={16} /> Filter
                    </button>
                    <ExportDropdown data={students} sectionName="students" />
                </div>
            </div>
            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                        <MdCloudUpload size={28} className="text-orange-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">No students in this sub-level</p>
                    <p className="text-xs text-gray-400 mt-1">Students will appear here once enrolled in this sub-level</p>
                </div>
            ) : (
                <CommonTable
                    key={`students-${subLevel?._id}`}
                    columns={columns}
                    data={students}
                    editable={false}
                    pagination={true}
                    rowsPerPage={10}
                    searchTerm={searchTerm}
                    onRowClick={onRowClick}
                />
            )}
        </div>
    );
};

const ProgressTab = ({ subLevel }) => {
    const [progressSearch, setProgressSearch] = useState("");
    const params = subLevel?._id ? `currentSubLevelId=${subLevel._id}` : "";
    const { data, isLoading } = useGetNewStudentsQuery(params, { skip: !subLevel?._id });

    const progressData = (data?.data || []).map((s) => ({
        _id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        prkey: s.prkey,
        status: s.status,
    }));

    const PROGRESS_COLUMNS = [
        { key: "prkey",  label: "PR Key",       render: (row) => <span className="text-xs font-mono text-gray-500">{row.prkey}</span> },
        { key: "name",   label: "Student Name", render: (row) => <span className="font-semibold text-sm text-orange-500">{row.name}</span> },
        { key: "status", label: "Status",       render: (row) => (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                row.status === "Active"  ? "bg-green-100 text-green-700" :
                row.status === "Dropped" ? "bg-red-100 text-red-700" :
                row.status === "Placed"  ? "bg-purple-100 text-purple-700" :
                "bg-gray-100 text-gray-600"
            }`}>{row.status}</span>
        )},
    ];

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <SearchBox searchTerm={progressSearch} setSearchTerm={setProgressSearch} />
                <div className="ml-auto">
                    <ExportDropdown data={progressData} sectionName="progress" />
                </div>
            </div>
            <CommonTable columns={PROGRESS_COLUMNS} data={progressData} editable={false} pagination={true} rowsPerPage={10} searchTerm={progressSearch} />
        </div>
    );
};

const SECTION_TABS = ["Students", "Tasks", "Syllabus", "Progress"];

const TaskDrawerContent = ({ activeTab }) => {
    const [mode, setMode] = useState("manual");
    const { data: versionsData } = useGetSyllabusVersionsBySubLevelQuery(
        { subLevelId: activeTab?._id, sessionId: "" },
        { skip: !activeTab?._id }
    );
    const versions = versionsData?.data || [];
    const activeVersion = versions.find((v) => v.status === "active") || versions[0];
    const syllabusVersionId = activeVersion?._id || "";

    return (
        <div className="divide-y divide-gray-100">
            <div className="px-5 py-4">
                <div className="flex gap-1 bg-[#F8F7F5] border border-gray-200 p-1 rounded-xl">
                    <button onClick={() => setMode("manual")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${mode === "manual" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Single Task</button>
                    <button onClick={() => setMode("bulk")}   className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${mode === "bulk"   ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Bulk Upload</button>
                </div>
                {mode === "bulk" && !syllabusVersionId && (
                    <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">No syllabus version found. Please upload syllabus first from Syllabus tab.</p>
                )}
            </div>
            {mode === "manual" ? (
                <ManualTaskForm subLevel={activeTab} onSaved={() => {}} showSubmitButton={false} formId="manual-task-form" />
            ) : syllabusVersionId ? (
                <div className="px-5 py-4">
                    <TaskUploadDrawer syllabusVersionId={syllabusVersionId} subjectName={activeTab?.name || ""} version={activeVersion?.version || ""} onSaved={() => {}} />
                </div>
            ) : null}
        </div>
    );
};

const ShowSubLevelTablesData = () => {
    const location       = useLocation();
    const navigate       = useNavigate();
    const level          = location.state?.level;
    const subdepartment  = location.state?.subdepartment;
    const departmentId   = location.state?.departmentId;
    const departmentName = location.state?.departmentName;
    const session        = location.state?.session || location.state?.sessionName;

    const [activeTab,           setActiveTab]           = useState(null);
    const [activeSection,       setActiveSection]       = useState("Students");
    const [searchTerm,          setSearchTerm]          = useState("");
    const [activeTaskVersionId, setActiveTaskVersionId] = useState("");
    const [syllabusMode,        setSyllabusMode]        = useState("excel");
    const syllabusDrawerRef = useRef(null);
    const manualSyllabusRef = useRef(null);

    const { data: subLevelsData } = useGetSubLevelsByLevelQuery(level?._id, { skip: !level?._id });
    const subLevels = subLevelsData?.data || [];

    useEffect(() => {
        if (subLevels.length > 0 && !activeTab) setActiveTab(subLevels[0]);
    }, [subLevels]);

    const prevLen = useRef(0);
    useEffect(() => {
        if (subLevels.length > prevLen.current && prevLen.current > 0) {
            setActiveTab(subLevels[subLevels.length - 1]);
        }
        prevLen.current = subLevels.length;
    }, [subLevels.length]);

    const [addSubLevel] = useAddSubLevelMutation();
    const handleSectionChange = (tab) => { setActiveSection(tab); setSearchTerm(""); };

    const breadcrumbs = [
        { label: "Departments", path: "/department-management" },
        { label: departmentName || "Department", path: departmentId ? `/department-details/${departmentId}` : "/department-management", state: { department: subdepartment?.departmentId } },
        { label: subdepartment?.name || "Subdepartment", path: subdepartment?._id ? `/subdepartment/${subdepartment._id}/levels` : "/subdepartment-details", state: { subdepartment, departmentId, departmentName } },
        { label: level?.name || "Level" },
    ];

    return (
        <>
            <Header
                title={level?.name || "Level"}
                badge={session || undefined}
                subtitle={subdepartment?.name ? `Sub-Department: ${subdepartment.name}` : undefined}
                showBack={true}
                breadcrumbs={breadcrumbs}
                bottomRow={
                    subLevels.length > 0 ? (
                        <div className="flex gap-1 overflow-x-auto">
                            {subLevels.map((sl) => (
                                <button
                                    key={sl._id}
                                    onClick={() => setActiveTab(sl)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${activeTab?._id === sl._id ? "border-orange-500 text-orange-500 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                                >
                                    {sl.name}
                                </button>
                            ))}
                        </div>
                    ) : null
                }
            >
                {/* Action buttons — only when sublevels exist */}
                {subLevels.length > 0 && activeSection === "Progress" && (
                    <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-500 bg-white border border-orange-500 rounded-md hover:bg-orange-50 transition flex-shrink-0">
                        <MdTableChart size={16} /> Upload Excel
                    </button>
                )}
                {subLevels.length > 0 && activeSection === "Syllabus" && (
                    <OrangeButton
                        buttonTitle="+ Upload Syllabus"
                        panelTitle="Upload Syllabus"
                        drawerContent={
                            <div>
                                <div className="flex gap-1 bg-[#F8F7F5] border border-gray-200 p-1 rounded-xl mb-4">
                                    <button onClick={() => setSyllabusMode("excel")}  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${syllabusMode === "excel"  ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Excel Upload</button>
                                    <button onClick={() => setSyllabusMode("manual")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${syllabusMode === "manual" ? "bg-white text-orange-500 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Manual Entry</button>
                                </div>
                                {syllabusMode === "excel"
                                    ? <SyllabusUploadDrawer ref={syllabusDrawerRef} level={level} subLevel={activeTab} onSaved={() => {}} />
                                    : <ManualSyllabusForm   ref={manualSyllabusRef} level={level} subLevel={activeTab} onSaved={() => {}} />
                                }
                            </div>
                        }
                        leftBtnText="Cancel"
                        rightBtnText="Save Syllabus"
                        onRightClick={() => syllabusMode === "excel" ? syllabusDrawerRef.current?.save() : manualSyllabusRef.current?.save()}
                    />
                )}
                {subLevels.length > 0 && activeSection === "Tasks" ? (
                    <OrangeButton
                        buttonTitle="+ Add Task"
                        panelTitle="Add Task"
                        drawerContent={<TaskDrawerContent activeTab={activeTab} />}
                        leftBtnText="Cancel"
                        rightBtnText="Save Task"
                        onRightClick={() => document.getElementById("manual-task-form")?.requestSubmit()}
                    />
                ) : (
                    /* Always show Add SubLevel button */
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

                {/* No sublevels — show prompt */}
                {subLevels.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                            <MdCloudUpload size={32} className="text-orange-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-700 mb-1">No Sub-Levels yet</h3>
                        <p className="text-sm text-gray-400 max-w-xs">Create at least one Sub-Level first. Students, Syllabus, and Tasks will be available after that.</p>
                    </div>
                )}

                {/* Section Tabs — only when sublevels exist */}
                {subLevels.length > 0 && (
                    <div className="flex gap-2 w-fit bg-[#E2E8F080] border border-gray-200 p-1.5 rounded-xl mt-5">
                        {SECTION_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleSectionChange(tab)}
                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === tab ? "bg-white text-orange-500 shadow" : "text-gray-600 hover:bg-gray-200"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tab Content — only when sublevels exist */}
                {subLevels.length > 0 && (
                    <div className="py-6">
                        {activeSection === "Students" && (
                            <StudentsTab
                                subLevel={activeTab}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                onRowClick={(row) => navigate("/setting/student-profile", { state: { student: row.raw, level, subdepartment } })}
                                onTaskBoard={(row) => navigate("/student/task-board", { state: { student: row.raw, level, subdepartment } })}
                            />
                        )}
                        {activeSection === "Tasks" && (
                            <TasksTab level={level} subLevel={activeTab} onVersionChange={setActiveTaskVersionId} />
                        )}
                        {activeSection === "Syllabus" && (
                            <SyllabusTab level={level} subLevel={activeTab} />
                        )}
                        {activeSection === "Progress" && <ProgressTab subLevel={activeTab} />}
                    </div>
                )}
            </div>
        </>
    );
};

export default ShowSubLevelTablesData;
