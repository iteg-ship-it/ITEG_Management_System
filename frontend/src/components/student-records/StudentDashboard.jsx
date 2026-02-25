import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import TabsCommon from "../common-components/table/TabsCommon";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useAdmitedStudentsQuery();
  // eslint-disable-next-line no-unused-vars
  const [studentCounts, setStudentCounts] = useState({});
  const [activeTab, setActiveTab] = useState("Level 1A");

  const levelTabs = ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C", "Permission Students"];
  
  console.log("Level Tabs:", levelTabs); // Debug log

  useEffect(() => {
    if (!isLoading && students.length > 0) {
      const counts = {};

      students.forEach((student) => {
        const passedLevels = (student.level || []).filter(
          (lvl) => lvl.result === "Pass"
        );

        const latestLevel =
          passedLevels.length > 0
            ? passedLevels[passedLevels.length - 1].levelNo
            : "1A";

        counts[latestLevel] = (counts[latestLevel] || 0) + 1;
      });

      setStudentCounts(counts);
    }
  }, [isLoading, students]);

  // Auto-navigate to Level 1A on component mount
  useEffect(() => {
    // Always navigate to student-detail-table with Level 1A when this component mounts
    const levelCode = "1A";
    navigate(`/student-detail-table`, { state: { level: levelCode }, replace: true });
  }, [navigate]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    if (tab === "Permission Students") {
      navigate(`/student-detail-table`, { state: { level: "permission" } });
    } else {
      // Extract level code from tab name (e.g., "Level 1A" -> "1A")
      const levelCode = tab.replace("Level ", "");
      navigate(`/student-detail-table`, { state: { level: levelCode } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl py-4 font-bold">Student Level Progress</h1>
      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          <TabsCommon tabs={levelTabs} activeTab={activeTab} onTabChange={handleTabClick} />
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
