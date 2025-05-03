import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import forward from "../../../assets/icons/forward-icon.png";
import UserProfile from "../../common-components/user-profile/UserProfile";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const yearCategories = ["1A", "1B", "1C", "2A", "2B", "2C"];

  useEffect(() => {
    // Simulated API delay
    setTimeout(() => {
      setStudentCounts({
        "1A": 45,
        "1B": 38,
        "1C": 37,
        "2A": 30,
        "2B": 28,
        "2C": 28,
      });
      setLoading(false);
    }, 0);
  }, []);

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
              key={year}
              className="bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg p-5 border border-gray-200 cursor-pointer flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                👨‍🎓 Trainee Level {year}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                All enrolled {year} students categorized by department
              </p>

              {loading ? (
                <div className="h-5 mt-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-sm font-medium mt-3 pt-10">
                  Total: {studentCounts[year]} students
                </p>
              )}

              <div className={`h-1 w-full mt-2 rounded ${getColor(index)}`} />

              <button
                className="mt-4 w-full flex items-center justify-between font-semibold py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => navigate(`/student-detail-table`)}
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
