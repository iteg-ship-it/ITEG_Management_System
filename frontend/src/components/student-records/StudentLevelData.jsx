import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllStudentsByLevelQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import Header from "../common-components/sidebar/Header";
import SearchBox from "../common-components/seach-export/SearchBox";
import Avatar from "../common-components/Avatar";

const LEVEL_TABS = ["1A", "1B", "1C", "2A", "2B", "2C"];

const toTitleCase = (str) =>
  str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const StudentLevelData = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1A");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useGetAllStudentsByLevelQuery(activeTab);

  // Backend returns array directly
  const students = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  const filtered = useMemo(() => {
    if (!searchTerm) return students;
    const q = searchTerm.toLowerCase();
    return students.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.course} ${s.studentMobile} ${s.currentLevel}`
        .toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  const columns = [
    {
      key: "name",
      label: "Student Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
          <span className="font-semibold text-gray-800 text-sm">
            {toTitleCase(`${row.firstName} ${row.lastName}`)}
          </span>
        </div>
      ),
    },
    {
      key: "fatherName",
      label: "Father's Name",
      render: (row) => toTitleCase(row.fatherName || "N/A"),
    },
    { key: "studentMobile", label: "Mobile No." },
    {
      key: "course",
      label: "Course",
      render: (row) => (
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {(row.course || "").toUpperCase()}
        </span>
      ),
    },
    {
      key: "currentLevel",
      label: "Current Level",
      render: (row) => (
        <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
          Level {row.currentLevel || activeTab}
        </span>
      ),
    },
    {
      key: "attempts",
      label: "Attempts",
      render: (row) => {
        const count = (row.level || []).filter((l) => l.levelNo === activeTab).length;
        return (
          <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
            {count}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Last Result",
      render: (row) => {
        const attempts = (row.level || []).filter((l) => l.levelNo === activeTab);
        const last = attempts[attempts.length - 1];
        if (!last) return <span className="text-gray-400 text-xs">No attempt</span>;
        const styles = {
          Pass: "bg-green-100 text-green-700",
          Fail: "bg-red-100 text-red-700",
          Pending: "bg-yellow-100 text-yellow-700",
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[last.result] || styles.Pending}`}>
            {last.result || "Pending"}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Header
        title="Student Level Progress"
        breadcrumbs={[
          { label: "Academics", path: "/student-detail-table" },
          { label: "Student Progress", path: "/student-detail-table" },
          { label: `Level ${activeTab}` },
        ]}
      />

      <div className="px-6 py-4">
        {/* Level Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {LEVEL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Level {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 max-w-sm">
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : error ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No students found for Level {activeTab}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="font-semibold text-gray-600 mb-1">No students at Level {activeTab}</p>
            <p className="text-sm">Students will appear here once they reach this level.</p>
          </div>
        ) : (
          <CommonTable
            data={filtered}
            columns={columns}
            pagination={true}
            rowsPerPage={10}
            searchTerm={searchTerm}
            onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
          />
        )}
      </div>
    </>
  );
};

export default StudentLevelData;
