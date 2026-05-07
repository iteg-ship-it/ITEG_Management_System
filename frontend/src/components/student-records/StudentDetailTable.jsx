import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetNewStudentsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import Header from "../common-components/sidebar/Header";
import Avatar from "../common-components/Avatar";

const toTitle = (str) =>
  str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "";

const STATUS_COLORS = {
  Active:    "bg-green-100 text-green-700",
  Placed:    "bg-purple-100 text-purple-700",
  Dropped:   "bg-red-100 text-red-700",
  Completed: "bg-blue-100 text-blue-700",
};

const StudentDetailTable = () => {
  const navigate = useNavigate();
  const { subDepartmentId } = useParams(); // present for admin, absent for faculty

  const [searchTerm, setSearchTerm]         = useState("");
  const [activeTab, setActiveTab]           = useState("All");
  const [selectedStatus, setSelectedStatus] = useState([]);

  // Build query string — if subDepartmentId present, filter by it
  const queryStr = subDepartmentId ? `subDepartmentId=${subDepartmentId}` : "";

  const { data: res = {}, isLoading } = useGetNewStudentsQuery(queryStr, {
    refetchOnMountOrArgChange: true,
  });

  const students = res.data || [];

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
      const name        = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchSearch = !searchTerm ||
        name.includes(searchTerm.toLowerCase()) ||
        s.prkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentMobile?.includes(searchTerm);
      return matchTab && matchStatus && matchSearch;
    });
  }, [students, activeTab, selectedStatus, searchTerm]);

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
        <span className="text-xs font-medium text-gray-600">
          {row.currentLevelId?.name || "—"} / {row.currentSubLevelId?.name || "—"}
        </span>
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

      <div className="p-5">
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
              options: ["Active", "Placed", "Dropped", "Completed"],
              selected: selectedStatus,
              setter: setSelectedStatus,
            },
          ]}
          onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
        />
      </div>
    </>
  );
};

export default StudentDetailTable;
