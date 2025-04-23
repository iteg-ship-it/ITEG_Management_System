import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import forward from "../../../assets/icons/forward-icon.png";
import UserProfile from "../../common-components/user-profile/UserProfile";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentCounts, setStudentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const yearCategories = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "Diploma 1st Year",
    "Diploma 2nd Year",
  ];

  useEffect(() => {
    // Simulated API delay
    setTimeout(() => {
      setStudentCounts({
        "1st Year": 45,
        "2nd Year": 38,
        "3rd Year": 37,
        "Diploma 1st Year": 30,
        "Diploma 2nd Year": 28,
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
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <UserProfile heading="Student Dashboard" />

      <div className="p-4 md:p-6 bg-gray-100 min-h-screen w-full">
        <div className="container mx-auto bg-white shadow-md p-6 md:p-10 rounded-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Explore Student Data by Year
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {yearCategories.map((year, index) => (
              <div
                key={year}
                className="bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg p-5 border border-gray-200 cursor-pointer flex flex-col justify-between"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  👨‍🎓 {year}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  All enrolled {year.toLowerCase()} students categorized by
                  department
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
                  className="mt-4 w-full flex items-center justify-between font-semibold py-2 px-4"
                  onClick={() =>
                    navigate(
                      `/student-detail-table?year=${encodeURIComponent(year)}`
                    )
                  }
                >
                  View Students
                  <img src={forward} alt="forward" className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
    // <>
    //   <div className="w-full flex justify-end px-4">
    //     <UserProfile />
    //   </div>
    //   <div className="p-4 md:p-6 bg-gray-100 min-h-screen w-full md:w-[80vw]">
    //     <div className="bg-white shadow-md p-6 md:p-10 rounded-lg">
    //       <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
    //         Explore Student Data by Year
    //       </h2>

    //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
    //         {yearCategories.map((year, index) => (
    //           <div
    //             key={year}
    //             className="bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg p-5 border border-gray-200 cursor-pointer flex flex-col justify-between"
    //           >
    //             <h3 className="text-lg font-semibold flex items-center gap-2">
    //               👨‍🎓 {year}
    //             </h3>
    //             <p className="text-sm text-gray-600 mt-1">
    //               All enrolled {year.toLowerCase()} students categorized by
    //               department
    //             </p>

    //             {loading ? (
    //               <div className="h-5 mt-4 w-24 bg-gray-200 rounded animate-pulse"></div>
    //             ) : (
    //               <p className="text-sm font-medium mt-3 pt-10">
    //                 Total: {studentCounts[year]} students
    //               </p>
    //             )}

    //             <div className={`h-1 w-full mt-2 rounded ${getColor(index)}`} />

    //             <button
    //               className="mt-4 w-full flex items-center justify-between font-semibold py-2 px-4"
    //               onClick={() =>
    //                 navigate(
    //                   `/student-detail-table?year=${encodeURIComponent(year)}`
    //                 )
    //               }
    //             >
    //               View Students
    //               <img src={forward} alt="forward" className="w-5 h-5" />
    //             </button>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </>
  );
};

export default StudentDashboard;

// import { useNavigate } from "react-router-dom";
// import forward from "../../../assets/icons/forward-icon.png";
// import UserProfile from "../../common-components/user-profile/UserProfile";

// const StudentDashboard = () => {
//   const navigate = useNavigate();

//   return (
//     <>
//       {/* Header - User Profile */}
//       <div className="w-full flex justify-end px-4 pt-4">
//         <UserProfile />
//       </div>

//       {/* Main Content */}
//       <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
//         <div className="bg-white shadow-md p-6 sm:p-10 rounded-lg max-w-7xl mx-auto">
//           <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
//             Explore Student Data by Year
//           </h2>

//           {/* Year Cards Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {["1st Year", "2nd Year", "3rd Year"].map((year, index) => (
//               <div
//                 key={index}
//                 className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:scale-105"
//               >
//                 <div>
//                   <h3 className="text-lg font-semibold flex items-center gap-2">
//                     👨‍🎓 Trainee Level ({year})
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     All enrolled {year.toLowerCase()} students categorized by
//                     department
//                   </p>
//                   <p className="text-sm font-medium mt-3 pt-6">
//                     Total: 120 students
//                   </p>
//                   <div
//                     className={`h-1 w-full mt-2 rounded ${
//                       index === 0
//                         ? "bg-orange-500"
//                         : index === 1
//                         ? "bg-blue-500"
//                         : "bg-green-500"
//                     }`}
//                   ></div>
//                 </div>
//                 <button
//                   className="mt-6 w-full flex items-center justify-between font-medium text-blue-700 hover:text-blue-900 transition duration-200"
//                   onClick={() =>
//                     navigate(
//                       `/student-detail-table?year=${encodeURIComponent(year)}`
//                     )
//                   }
//                 >
//                   View Students
//                   <img src={forward} alt="forward" className="w-4 h-4 ml-2" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default StudentDashboard;
