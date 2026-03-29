import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import CommonTable from "../common-components/table/CommonTable";
import CreateInterviewModal from "./CreateInterviewModal";
import PageNavbar from "../common-components/navbar/PageNavbar";
import { buttonStyles } from "../../styles/buttonStyles";
import TabsCommon from "../common-components/table/TabsCommon";
import SearchBox from "./../common-components/seach-export/SearchBox";
import Header from "../common-components/sidebar/Header";
import Avatar from "../common-components/Avatar";

const StudentDetailTable = () => {
  const { data = [], isLoading, refetch } = useAdmitedStudentsQuery();
  const location = useLocation();
  const selectedLevel = location.state?.level || "1A"; // Default to 1A if no level is selected
  const navigate = useNavigate();
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState(`Level ${selectedLevel}`);
  const [selectedRows, setSelectedRows] = useState([]);

  const levelTabs = ["Total Students", "Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C", "Level's Cleared"];

  // Update active tab when selectedLevel changes
  useEffect(() => {
    let newTab;
    if (selectedLevel === "cleared") {
      newTab = "Level's Cleared";
    } else if (selectedLevel === "total") {
      newTab = "Total Students";
    } else {
      newTab = `Level ${selectedLevel}`;
    }
    if (newTab !== activeTab) setActiveTab(newTab);
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

  // Dynamic options from data
  const dynamicTrackOptions = useMemo(() => {
    return [...new Set(data.map((s) => toTitleCase(s.track || "")))].filter(Boolean);
  }, [data]);

  const dynamicCourseOptions = useMemo(() => {
    return [...new Set(data.map((s) => (s.course || "").toUpperCase()))].filter(Boolean);
  }, [data]);

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedAttempts, setSelectedAttempts] = useState([]);

  const filtersConfig = activeTab === "Level's Cleared" || activeTab === "Total Students" ? [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Course",
      options: dynamicCourseOptions,
      selected: selectedCourses,
      setter: setSelectedCourses,
    },
  ] : [
    {
      title: "Track",
      options: dynamicTrackOptions,
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Course",
      options: dynamicCourseOptions,
      selected: selectedCourses,
      setter: setSelectedCourses,
    },
    {
      title: "Attempts",
      options: ["1", "2", "3", "4+"],
      selected: selectedAttempts,
      setter: setSelectedAttempts,
    },
  ];

  // Use regular admitted students data
  const enhancedData = useMemo(() => data.map((student) => {
    const levelAttempts = {};
    (student.level || []).forEach(lvl => {
      if (!levelAttempts[lvl.levelNo]) levelAttempts[lvl.levelNo] = [];
      levelAttempts[lvl.levelNo].push(lvl);
    });
    const currentLevel = student.currentLevel || "1A";
    const currentLevelAttempts = levelAttempts[currentLevel] || [];
    const hasPassedCurrentLevel = currentLevelAttempts.some(lvl => lvl.result === "Pass");
    return { ...student, latestLevel: currentLevel, hasPassedCurrentLevel, levelAttempts };
  }), [data]);

  const filteredData = useMemo(() => {
    return enhancedData.filter((student) => {
      // Search term filter handled by CommonTable's global filter
      // Keep other filters here

      // Track filter
      const track = toTitleCase(student.track || "");
      const matchesTrack = selectedTracks.length === 0 || selectedTracks.includes(track);

      // Course filter
      const course = (student.course || "").toUpperCase();
      const matchesCourse = selectedCourses.length === 0 || selectedCourses.includes(course);

      // Attempts filter (only for non-cleared and non-total tabs)
      let matchesAttempts = true;
      if (activeTab !== "Level's Cleared" && activeTab !== "Total Students") {
        const currentLevelAttempts = student.levelAttempts?.[selectedLevel] || [];
        const attemptCount = currentLevelAttempts.length;
        matchesAttempts = selectedAttempts.length === 0 || selectedAttempts.some(filter => {
          if (filter === "4+") return attemptCount >= 4;
          return attemptCount.toString() === filter;
        });
      }

      // Level filter
      let matchesLevel;
      if (activeTab === "Total Students") {
        // Show all students for Total Students tab
        matchesLevel = true;
      } else if (activeTab === "Level's Cleared") {
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

      return matchesTrack && matchesCourse && matchesAttempts && matchesLevel;
    });
  }, [enhancedData, selectedTracks, selectedCourses, selectedAttempts, activeTab, selectedLevel]);

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (tab === "Total Students") {
      navigate(`/student-detail-table`, { state: { level: "total" }, replace: true });
    } else if (tab === "Level's Cleared") {
      navigate(`/student-detail-table`, { state: { level: "cleared" }, replace: true });
    } else {
      const levelCode = tab.replace("Level ", "");
      navigate(`/student-detail-table`, { state: { level: levelCode }, replace: true });
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.profileImage} />
          <span>{toTitleCase(`${row.firstName} ${row.lastName}`)}</span>
        </div>
      ),
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
      render: (row) => (row.course || "").toUpperCase(),
    },
    {
      key: "track",
      label: "Bus Route",
      render: (row) => toTitleCase(row.track || ""),
    },
    ...(activeTab === "Total Students" ? [{
      key: "level",
      label: "Level",
      align: "center",
      render: (row) => row.currentLevel || "1A",
    }] : []),
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
        className={buttonStyles.primary}
      >
        Take Interview
      </button>
    </div>
  );

  // Show loader when data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Header title="Student Progress" showBack={false} />

      <TabsCommon tabs={levelTabs} activeTab={activeTab} onTabChange={handleTabClick} />

      <div className="px-5">
        <div className="flex justify-between">
          <PageNavbar
            title="Admitted Student WorkFlow"
            subtitle="Track student progress through different levels"
            showBackButton={false}
          />
          <div className="py-4 w-72">
            <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
          onSelectionChange={setSelectedRows}
          onRowClick={(row) => {
            localStorage.setItem("lastSection", "admitted");
            navigate(`/student-profile/${row._id}`, { state: { student: row } });
          }}
        />
        <CreateInterviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          studentId={selectedStudentId}
          refetchStudents={refetch}
          interviewLevel={selectedLevel}
        />
      </div>
    </>
  );
};

export default StudentDetailTable;
