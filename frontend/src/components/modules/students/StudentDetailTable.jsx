import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetNewStudentsQuery } from "../../../redux/api/authApi";
import Loader from "../../shared/loader/Loader";
import CommonTable from "../../shared/table/CommonTable";
import Header from "../../shared/sidebar/Header";
import Avatar from "../../shared/Avatar";
import { MdTableChart } from "react-icons/md";
import SearchBox from "../../shared/search-export/SearchBox";

const toTitle = (str) =>
  str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "";

const STATUS_COLORS = {
  Active:    "bg-green-100 text-green-700",
  Placed:    "bg-purple-100 text-purple-700",
  Dropped:   "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
  Dummy:     "bg-orange-100 text-orange-700",
};

const StudentDetailTable = () => {
  const navigate = useNavigate();
  const { subDepartmentId } = useParams(); // present for admin, absent for faculty

  const [searchTerm, setSearchTerm]         = useState("");
  const [activeTab, setActiveTab]           = useState("All");
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedYears, setSelectedYears]   = useState([]);

  // Build query string — if subDepartmentId present, filter by it
  const queryStr = subDepartmentId ? `subDepartmentId=${subDepartmentId}` : "";

  const { data: res = {}, isLoading } = useGetNewStudentsQuery(queryStr, {
    refetchOnMountOrArgChange: true,
  });

  const students = res.data || [];

  // Get active session year (max start year from all students' sessions, default to current calendar year if none)
  const activeStartYear = useMemo(() => {
    let maxYear = 0;
    students.forEach((s) => {
      const sessionName = s.sessionId?.name;
      if (sessionName) {
        const startYear = parseInt(sessionName.split("-")[0]);
        if (!isNaN(startYear) && startYear > maxYear) {
          maxYear = startYear;
        }
      }
    });
    return maxYear || new Date().getFullYear();
  }, [students]);

  const getStudentYear = (student) => {
    const sessionName = student.sessionId?.name;
    if (!sessionName) return "N/A";
    const startYear = parseInt(sessionName.split("-")[0]);
    if (isNaN(startYear)) return "N/A";
    const yearDiff = activeStartYear - startYear + 1;
    if (yearDiff === 1) return "1st Year";
    if (yearDiff === 2) return "2nd Year";
    if (yearDiff === 3) return "3rd Year";
    if (yearDiff === 4) return "4th Year";
    return `${yearDiff}th Year`;
  };

  // Dynamic sublevel tabs from data
  const subLevelTabs = useMemo(() => {
    const names = [...new Set(
      students.map((s) => s.currentSubLevelId?.name).filter(Boolean)
    )].sort();
    return ["All", ...names];
  }, [students]);

  const filteredData = useMemo(() => {
    return students.filter((s) => {
      const matchTab    = activeTab === "All" || s.currentSubLevelId?.name === activeTab;
      const matchStatus = selectedStatus.length === 0 || selectedStatus.includes(s.status);
      const studentYear = getStudentYear(s);
      const matchYear   = selectedYears.length === 0 || selectedYears.includes(studentYear);
      const name        = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchSearch = !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        s.prkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentMobile?.includes(searchTerm);
      return matchTab && matchStatus && matchYear && matchSearch;
    });
  }, [students, activeTab, selectedStatus, selectedYears, searchTerm, activeStartYear]);

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <div>
            <p className="font-medium text-gray-800">{toTitle(`${row.firstName} ${row.lastName}`)}</p>
            <p className="text-xs text-gray-400">{row.prkey}</p>
          </div>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father's Name",
      render: (row) => toTitle(row.fatherName || ""),
    },
    { key: "studentMobile", label: "Mobile", align: "center" },
    {
      key: "course",
      label: "Course",
      render: (row) => (row.course || "").toUpperCase(),
    },
    {
      key: "department",
      label: "Department",
      render: (row) => row.subDepartmentId?.name || "—",
    },
    {
      key: "level",
      label: "Level",
      align: "center",
      render: (row) => (
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-600">
            {row.currentLevelId?.name || "—"} / {row.currentSubLevelId?.name || "—"}
          </span>
          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded mt-1">
            {getStudentYear(row)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}>
          {row.status}
        </span>
      ),
    },
  ];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  const deptName = students[0]?.subDepartmentId?.name;

  return (
    <>
      <Header
        title={deptName ? `${deptName} — Students` : "Student Progress"}
        badge={`${filteredData.length} students`}
        breadcrumbs={[
          { label: "Academics" },
          { label: "Student Progress", path: "/student-detail-table" },
          ...(deptName ? [{ label: deptName }] : []),
        ]}
      />

      {/* SubLevel Tabs */}
      <div className="bg-white border-b px-6 flex gap-1 overflow-x-auto">
        {subLevelTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
              {tab === "All"
                ? students.length
                : students.filter((s) => s.currentSubLevelId?.name === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex-wrap">
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          <div className="sm:ml-auto flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Status Dropdown */}
            <select
              value={selectedStatus[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val ? [val] : []);
              }}
              style={{ outline: "none" }}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 min-w-[130px] text-gray-600 font-medium cursor-pointer transition-colors hover:border-gray-400"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Placed">Placed</option>
              <option value="Dropped">Dropped</option>
              <option value="Completed">Completed</option>
              <option value="Dummy">Dummy</option>
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYears[0] || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYears(val ? [val] : []);
              }}
              style={{ outline: "none" }}
              className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 min-w-[130px] text-gray-600 font-medium cursor-pointer transition-colors hover:border-gray-400"
            >
              <option value="">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pagination
          rowsPerPage={10}
          filtersConfig={[
            {
              title: "Status",
              options: ["Active", "Placed", "Dropped", "Completed", "Dummy"],
              selected: selectedStatus,
              setter: setSelectedStatus,
            },
            {
              title: "Year",
              options: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
              selected: selectedYears,
              setter: setSelectedYears,
            },
          ]}
          extraColumn={{
            header: "Task Board",
            render: (row) => (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate("/student/task-board", {
                    state: {
                      student: row,
                      level: row.currentLevelId,
                      subdepartment: row.subDepartmentId,
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500 transition hover:bg-orange-100"
              >
                <MdTableChart size={14} /> Task Board
              </button>
            ),
          }}
          onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
        />
      </div>
    </>
  );
};

export default StudentDetailTable;
