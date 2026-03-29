import { useState } from "react";
import { MdAdd, MdFilterList, MdChevronRight } from "react-icons/md";
import { useParams, useLocation } from "react-router-dom";
import Header from "../../common-components/sidebar/Header";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import TabsCommon from "../../common-components/table/TabsCommon";
import CommonTable from "../../common-components/table/CommonTable";
import SearchBox from "../../common-components/seach-export/SearchBox";
import ExportDropdown from "../../common-components/seach-export/ExportDropdown";

const LEVEL_TABS = ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"];
const SECTION_TABS = ["Students", "Tasks", "Syllabus", "Progress"];

const DUMMY_STUDENTS = [
  { _id: "1", name: "John Doe", fatherName: "Robert Doe", mobile: "+91 9876543210", course: "BCA", busRoute: "Route A", attempts: 1 },
  { _id: "2", name: "Jane Smith", fatherName: "Michael Smith", mobile: "+91 9123456780", course: "MCA", busRoute: "Route B", attempts: 2 },
  { _id: "3", name: "Aryan Gupta", fatherName: "Suresh Gupta", mobile: "+91 9988776655", course: "BCA", busRoute: "Route C", attempts: 3 },
  { _id: "4", name: "Priya Sharma", fatherName: "Ramesh Sharma", mobile: "+91 9871234560", course: "BSc", busRoute: "Route A", attempts: 1 },
  { _id: "5", name: "Rahul Verma", fatherName: "Anil Verma", mobile: "+91 9765432100", course: "MCA", busRoute: "Route D", attempts: 2 },
];

const Avatar = ({ name }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
};

const TABLE_COLUMNS = [
  {
    key: "name", label: "Full Name",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} />
        <span className="font-semibold text-gray-800 text-sm">{row.name}</span>
      </div>
    ),
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

  return (
    <>
      <Header sidebarOpen={true} title="Level Details" />
      <div className="flex justify-between items-center pt-5 pb-4 gap-4 bg-white">
        <PageNavbar
          title={level?.name || "Level Details"}
          subtitle="View level information and manage sub-levels"
          showBackButton={true}
          breadcrumbs={[
            { label: "Departments", path: "/department-management" },
            { label: "Levels", path: `/subdepartment/${subdepartmentId}/levels` },
            { label: level?.name || "Level Details" },
          ]}
        />
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex-shrink-0">
          <MdAdd size={18} />
          Add Sub-Level
        </button>
      </div>
      <div className=" px-6 pb-10">

        {/* Page Navbar + Actions */}


        {/* Main content card */}
        {/* <div className=" rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}> */}

        {/* Level Tabs — underline style */}
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

        {/* Section Tabs — underline style */}
        <div className="border-b border-gray-100">
          <TabsCommon
            tabs={SECTION_TABS}
            activeTab={activeSection}
            onTabChange={setActiveSection}
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
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
                columns={TABLE_COLUMNS}
                data={DUMMY_STUDENTS}
                editable={true}
                pagination={true}
                rowsPerPage={10}
                searchTerm={searchTerm}
                actionButton={() => (
                  <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap flex-shrink-0">
                    Conduct Exam <MdChevronRight size={16} />
                  </button>
                )}
              />
            </div>
          )}
          {activeSection === "Tasks" && (
            <div className="py-16 text-center text-gray-400 text-sm">Tasks content coming soon</div>
          )}
          {activeSection === "Syllabus" && (
            <div className="py-16 text-center text-gray-400 text-sm">Syllabus content coming soon</div>
          )}
          {activeSection === "Progress" && (
            <div className="py-16 text-center text-gray-400 text-sm">Progress content coming soon</div>
          )}
        </div>
        {/* </div> */}

      </div>
    </>
  );
};

export default SubLevelManagement;
