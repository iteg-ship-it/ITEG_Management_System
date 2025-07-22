// components/student/StudentLevelData.jsx
import { useParams } from "react-router-dom";
import { useGetLevelInterviewQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import { useState, useMemo } from "react";
import { IoSearchOutline } from "react-icons/io5";
import CommonTable from "../common-components/table/CommonTable";
import Pagination from "../common-components/pagination/Pagination";

const toTitleCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const StudentLevelData = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetLevelInterviewQuery(id);
  const [activeTab, setActiveTab] = useState("Level 1A");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(10);
  const [trackFilter, setTrackFilter] = useState([]);
  const [resultFilter, setResultFilter] = useState([]);

  // Define all level tabs
  const levelTabs = ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"];

  // Filter data based on active tab
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    // Filter by level
    const levelFiltered = data.filter(item => {
      // Map tab names to levelNo values in your data
      const levelMapping = {
        "Level 1A": "1A",
        "Level 1B": "1B",
        "Level 1C": "1C",
        "Level 2A": "2A",
        "Level 2B": "2B",
        "Level 2C": "2C"
      };
      
      return item.levelNo === levelMapping[activeTab];
    });
    
    // Apply search term filter
    if (!searchTerm) return levelFiltered;
    
    return levelFiltered.filter(item => {
      const searchableValues = Object.values(item)
        .map(val => String(val ?? "").toLowerCase())
        .join(" ");
      return searchableValues.includes(searchTerm.toLowerCase());
    });
  }, [data, activeTab, searchTerm]);

  // Dynamic options for filters
  const dynamicResultOptions = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(item => toTitleCase(item.result || "")))].filter(Boolean);
  }, [data]);

  // Filter configuration
  const filtersConfig = [
    {
      title: "Result",
      options: dynamicResultOptions,
      selected: resultFilter,
      setter: setResultFilter,
    },
  ];

  // Table columns
  const columns = [
    {
      key: "studentName",
      label: "Student Name",
      render: (row) => toTitleCase(row.studentName || "N/A"),
    },
    {
      key: "levelNo",
      label: "Level",
      render: (row) => row.levelNo,
    },
    {
      key: "result",
      label: "Status",
      render: (row) => {
        const result = row.result;
        if (result === "Pass") {
          return (
            <span className="inline-block px-2 py-1 rounded-md text-[#118D57] bg-[#22C55E]/20 text-sm font-medium">
              Pass
            </span>
          );
        } else if (result === "Fail") {
          return (
            <span className="inline-block px-2 py-1 rounded-md bg-[#FFCEC3] text-[#D32F2F] text-sm font-medium">
              Fail
            </span>
          );
        } else {
          return (
            <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium">
              {toTitleCase(result) || "Pending"}
            </span>
          );
        }
      },
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) => row.remark || "N/A",
    },
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <p className="p-4 text-red-500">Error fetching data: {error.message}</p>
    );
  }

  return (
    <>
      <h1 className="text-3xl py-4 font-bold">Student Level Progress</h1>
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          {/* Level Tabs */}
          <div className="flex gap-6 mt-4 overflow-x-auto">
            {levelTabs.map((tab) => (
              <p
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer text-md text-[var(--text-color)] pb-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[var(--text-color)] font-semibold"
                    : "border-gray-200"
                }`}
              >
                {tab}
              </p>
            ))}
          </div>
          
          {/* Search and Filters */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
              filteredData={filteredData}
            />
          </div>
        </div>
        
        {/* Data Table */}
        {filteredData.length > 0 ? (
          <CommonTable
            data={filteredData}
            columns={columns}
            pagination={true}
            rowsPerPage={rowsPerPage}
            searchTerm={searchTerm}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            No data found for {activeTab}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentLevelData;
