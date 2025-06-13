import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import forward from "../../assets/icons/forward-icon.png";
import UserProfile from "../common-components/user-profile/UserProfile";
import { useAdmitedStudentsQuery } from "../../redux/api/authApi";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useAdmitedStudentsQuery();
  const [studentCounts, setStudentCounts] = useState({});

  const yearCategories = ["1A", "1B", "1C", "2A", "2B", "2C"];

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

  const getColor = (index) => {
    const colors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <UserProfile heading="Explore Student Data by Year" />

      <div className="container mx-auto bg-white shadow-md p-6 md:p-10 rounded-lg my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {yearCategories.map((year, index) => (
            <div
              onClick={() => navigate(`/student-detail-table`, { state: { level: year } })}
              key={year}
              className="bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg p-5 border border-gray-200 cursor-pointer flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                👨‍🎓 Trainee Level {year}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                All enrolled {year} students categorized by department
              </p>

              {isLoading ? (
                <div className="h-5 mt-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-sm font-medium mt-3 pt-10">
                  Total: {studentCounts[year] || 0} students
                </p>
              )}

              <div className={`h-1 w-full mt-2 rounded ${getColor(index)}`} />

              <button
                className="mt-4 w-full flex items-center justify-between font-semibold py-2 px-4 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/student-detail-table`, { state: { level: year } });
                }}
              >
                View Students
                <img src={forward} alt="forward" className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
