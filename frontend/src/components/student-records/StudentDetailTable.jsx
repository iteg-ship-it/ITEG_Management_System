import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import {
  useAdmitedStudentsQuery,
} from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
// import edit from "../../assets/icons/edit-fill-icon.png";
// import interview from "../../assets/icons/interview-icon.png";
import CreateInterviewModal from "./CreateInterviewModal";
import PageNavbar from "../common-components/navbar/PageNavbar";

const StudentDetailTable = () => {
  const { data = [], isLoading, refetch } = useAdmitedStudentsQuery();
  const location = useLocation();
  const selectedLevel = location.state?.level || "1A"; // Default to 1A if no level is selected
  const navigate = useNavigate();
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(`Level ${selectedLevel}`);

  const levelTabs = ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C", "Level's Cleared"];

  // Update active tab when selectedLevel changes
  useEffect(() => {
    if (selectedLevel === "cleared") {
      setActiveTab("Level's Cleared");
    } else {
      setActiveTab(`Level ${selectedLevel}`);
    }
  }, [selectedLevel]);

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Count students per level
  // const studentCounts = useMemo(() => {
  //   const counts = {};
  //   data.forEach((student) => {
  //     const passedLevels = (student.level || []).filter(
  //       (lvl) => lvl.result === "Pass"
  //     );
  //     const latestLevel =
  //       passedLevels.length > 0
  //         ? passedLevels[passedLevels.length - 1].levelNo
  //         : "1A";
  //     counts[latestLevel] = (counts[latestLevel] || 0) + 1;
  //   });
  //   return counts;
  // }, [data]);

  // Dynamic track options from data
  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(data.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
  }, [data]);

  const filtersConfig = [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: ["Pass", "Fail", "Pending"],
      selected: selectedResults,
      setter: setSelectedResults,
    },
  ];

  // Use regular admitted students data
  const currentData = data;
  const currentLoading = isLoading;

  const enhancedData = currentData.map((student) => {
    // Get all level attempts grouped by levelNo
    const levelAttempts = {};
    (student.level || []).forEach(lvl => {
      if (!levelAttempts[lvl.levelNo]) {
        levelAttempts[lvl.levelNo] = [];
      }
      levelAttempts[lvl.levelNo].push(lvl);
    });

    // Check if the student has passed their current level
    const currentLevel = student.currentLevel || "1A";
    const currentLevelAttempts = levelAttempts[currentLevel] || [];

    // Check if any attempt for the current level has a Pass result
    const hasPassedCurrentLevel = currentLevelAttempts.some(lvl => lvl.result === "Pass");

    return {
      ...student,
      latestLevel: currentLevel,
      hasPassedCurrentLevel,
      levelAttempts
    };
  });

  const filteredData = enhancedData.filter((student) => {
    // Search term filter
    const searchableValues = Object.values(student)
      .map((val) => String(val ?? "").toLowerCase())
      .join(" ");
    if (!searchableValues.includes(searchTerm.toLowerCase())) return false;

    // Track filter
    const track = toTitleCase(student.track || "");
    const matchesTrack = selectedTracks.length === 0 || selectedTracks.includes(track);

    // Result filter
    const matchesResult = selectedResults.length === 0 ||
      selectedResults.includes(student.result || "Pending");

    // Level filter
    let matchesLevel;
    if (activeTab === "Level's Cleared") {
      // Show students who have passed Level 2C
      const level2CAttempts = student.levelAttempts?.["2C"] || [];
      matchesLevel = level2CAttempts.some(lvl => lvl.result === "Pass");
    } else if (selectedLevel === "2C") {
      // For Level 2C tab, exclude students who have passed Level 2C
      const level2CAttempts = student.levelAttempts?.["2C"] || [];
      const hasPassedLevel2C = level2CAttempts.some(lvl => lvl.result === "Pass");
      matchesLevel = student.currentLevel === selectedLevel && !hasPassedLevel2C;
    } else {
      // For other tabs, show students whose current level matches the selected tab
      matchesLevel = student.currentLevel === selectedLevel;
    }

    return matchesTrack && matchesResult && matchesLevel;
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "Level's Cleared") {
      // For Level's Cleared tab, don't navigate with level state
      navigate(`/student-detail-table`, { state: { level: "cleared" } });
    } else {
      // Extract level code from tab name (e.g., "Level 1A" -> "1A")
      const levelCode = tab.replace("Level ", "");
      navigate(`/student-detail-table`, { state: { level: levelCode } });
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
    },
    {
      key: "fatherName",
      label: "Father's Name",
      render: (row) => toTitleCase(row.fatherName || ""),
    },
    { key: "studentMobile", label: "Mobile No.", align: "center" },
    {
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course || ""),
    },
    {
      key: "track",
      label: "Bus Route",
      render: (row) => toTitleCase(row.track || ""),
    },
    ...(activeTab !== "Level's Cleared" ? [{
      key: "attempts",
      label: "Attempts",
      align: "center",
      render: (row) => {
        const currentLevelAttempts = row.levelAttempts?.[selectedLevel] || [];
        return currentLevelAttempts.length || 0;
      }
    }] : []),
    ...(activeTab === "Level's Cleared" ? [{
      key: "clearedDate",
      label: "Level 2C Cleared Date",
      render: (row) => {
        const level2CAttempts = row.levelAttempts?.["2C"] || [];
        const passedAttempt = level2CAttempts.find(lvl => lvl.result === "Pass");
        return passedAttempt?.date ? new Date(passedAttempt.date).toLocaleDateString() : "N/A";
      }
    }] : []),
  ];

  const actionButton = (student) => (
    <div className="flex space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStudentId(student._id);
          // Store student data in localStorage for the modal to access
          const students = JSON.parse(localStorage.getItem("students") || "[]");
          if (!students.some(s => s._id === student._id)) {
            localStorage.setItem("students", JSON.stringify([...students, student]));
          }
          setShowModal(true);
        }}
        className="bg-orange-500 text-md text-white px-3 py-1 rounded"
      >
        Take Interview
      </button>
    </div>
  );

  // Show loader when data is loading
  if (currentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <PageNavbar 
        title="Admitted Student WorkFlow" 
        subtitle="Track student progress through different levels"
        showBackButton={false}
      />

      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          {/* Level Tabs */}
          <div className="flex gap-6 mt-4 overflow-x-auto">
            {levelTabs.map((tab) => (
              <div key={tab}>
                <p
                  onClick={() => handleTabClick(tab)}
                  className={`cursor-pointer text-md pb-2 border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[var(--text-color)] font-semibold text-[var(--text-color)]"
                      : "border-gray-200 text-[var(--text-color)]"
                  } ${
                    tab === "Level's Cleared" 
                      ? "text-green-600 font-medium" + (activeTab === tab ? " border-green-600" : "")
                      : ""
                  }`}
                >
                  {tab === "Level's Cleared" ? "🎉 " + tab : tab}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4 mt-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
              filteredData={filteredData}
            />
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={columns}
          editable={true}
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          actionButton={selectedLevel === "permission" || activeTab === "Level's Cleared" ? null : actionButton}
          onRowClick={(row) => {
            // Set the source section to 'admitted' before navigating
            localStorage.setItem("lastSection", "admitted");
            navigate(`/student-profile/${row._id}`, { state: { student: row } });
          }}
        />
      </div>

      <CreateInterviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        studentId={selectedStudentId}
        refetchStudents={refetch}
      />
    </>
  );
};

export default StudentDetailTable;
