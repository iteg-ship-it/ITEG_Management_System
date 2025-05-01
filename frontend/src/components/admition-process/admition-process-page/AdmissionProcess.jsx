import UserProfile from "../../common-components/user-profile/UserProfile";
import { useGetAllStudentsQuery } from "../../../redux/api/authApi";
import CommonTable from "../../common-components/table/CommonTable";
import Pagination from "../../common-components/pagination/Pagination";
import { useState } from "react";
import edit from "../../../assets/icons/edit-fill-icon.png";

const AdmissionProcess = () => {
  return (
    <>
      <UserProfile heading="Admission Process" />
      <StudentList />
    </>
  );
};

export default AdmissionProcess;

const StudentList = () => {
  const { data = [], isLoading, error } = useGetAllStudentsQuery();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Total Registration");

  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const tabs = [
    "Total Registration",
    "Online Assessment",
    "Selected",
    "Rejected",
  ];

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0]?.result;
  };
  const scheduleButton = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const filteredData = data
    .filter((student) => {
      if (activeTab === "Online Assessment") {
        return student.onlineTest?.result === "Pending";
      }
      if (activeTab === "Selected") {
        return getLatestInterviewResult(student.interviews) === "Pass";
      }
      if (activeTab === "Rejected") {
        return getLatestInterviewResult(student.interviews) === "Fail";
      }
      return true;
    })
    .filter((student) => {
      const values = Object.values(student)
        .map((val) => String(val ?? "").toLowerCase())
        .join(" ");
      return values.includes(searchTerm.toLowerCase());
    })
    .filter((student) => {
      const matchTrack =
        selectedTracks.length === 0 || selectedTracks.includes(student.track);
      const matchYear =
        selectedYears.length === 0 ||
        selectedYears.includes(student.year?.toString());
      const percentage = parseFloat(student.percentage);
      const matchPercentage =
        selectedPercentages.length === 0 ||
        selectedPercentages.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });
      return matchTrack && matchYear && matchPercentage;
    });

  let columns = [];
  let actionButton;
  switch (activeTab) {
    case "Online Assessment":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "fatherName", label: "Father's Name" },
        { key: "studentMobile", label: "Mobile" },
        {
          key: "interviews",
          label: "Marks",
          render: (row) =>
            row.interviews && row.interviews.length > 0
              ? row.interviews[0].marks
              : "N/A",
        },

        { key: "village", label: "Status" },
      ];
      actionButton = (row) => (
        <button
          onClick={() => scheduleButton(row)}
          className="bg-orange-500 text-white px-3 py-1 rounded"
        >
          + Schedule Interview
        </button>
      );

      break;

    case "Selected":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "year", label: "Year" },
        { key: "track", label: "Track" },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Send confirmation to ${row.firstName}`)}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Confirm
        </button>
      );
      break;

    case "Rejected":
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "reason", label: "Rejection Reason" },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Review ${row.firstName}'s case again`)}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Re-review
        </button>
      );
      break;

    default:
      columns = [
        {
          key: "firstName",
          label: "Full Name",
          render: (row) => `${row.firstName} ${row.lastName}`,
        },
        { key: "fatherName", label: "Father's Name" },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "Subject" },
        { key: "village", label: "Village" },
      ];

      actionButton = (row) => (
        <button
          onClick={() => alert(`Edit registration of: ${row.firstName}`)}
          className="px-3 py-1  rounded"
        >
          <img src={edit} alt="edit-icon" className="w-5 h-5" />
        </button>
      );
      break;
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching students.</p>;

  return (
    <>
      <div className="border bg-white shadow-sm rounded-lg px-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Pagination
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTracks={selectedTracks}
            setSelectedTracks={setSelectedTracks}
            selectedYears={selectedYears}
            setSelectedYears={setSelectedYears}
            selectedPercentages={selectedPercentages}
            setSelectedPercentages={setSelectedPercentages}
          />
        </div>

        <div className="px-2 flex gap-6 mt-4">
          {tabs.map((tab) => (
            <p
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 border-b-2 ${
                activeTab === tab
                  ? "border-orange-400 font-semibold"
                  : "border-transparent"
              }`}
            >
              {tab}
            </p>
          ))}
        </div>
      </div>

      <CommonTable
        data={filteredData}
        columns={columns}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        actionButton={actionButton}
      />
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Schedule Interview for {selectedStudent.firstName}
            </h2>
            {/* Modal Content Here */}
            <p>
              Add your form or time scheduling UI here for{" "}
              <strong>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </strong>
            </p>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// import UserProfile from "../../common-components/user-profile/UserProfile";
// import { useGetAllStudentsQuery } from "../../../redux/api/authApi";
// import CommonTable from "../../common-components/table/CommonTable";
// import Pagination from "../../common-components/pagination/Pagination";
// import { useState } from "react";
// import edit from "../../../assets/icons/edit-fill-icon.png";
// const AdmissionProcess = () => {
//   return (
//     <>
//       <UserProfile heading="Admission Process" />
//       <StudentList />
//     </>
//   );
// };

// export default AdmissionProcess;
// const StudentList = () => {
//   const { data = [], isLoading, error } = useGetAllStudentsQuery();
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("Total Registration");

//   const [selectedTracks, setSelectedTracks] = useState([]);
//   const [selectedYears, setSelectedYears] = useState([]);
//   const [selectedPercentages, setSelectedPercentages] = useState([]);

//   const tabs = [
//     "Total Registration",
//     "Online Assessment",
//     "Selected",
//     "Rejected",
//   ];

//   const getLatestInterviewResult = (interviews = []) => {
//     if (!interviews.length) return null;
//     return [...interviews].sort(
//       (a, b) => new Date(b.date) - new Date(a.date)
//     )[0]?.result;
//   };

//   const filteredData = data
//     .filter((student) => {
//       if (activeTab === "Online Assessment") {
//         return student.onlineTest?.result === "Pending";
//       }
//       if (activeTab === "Selected") {
//         return getLatestInterviewResult(student.interviews) === "Pass";
//       }
//       if (activeTab === "Rejected") {
//         return getLatestInterviewResult(student.interviews) === "Fail";
//       }
//       return true;
//     })
//     .filter((student) => {
//       const values = Object.values(student)
//         .map((val) => String(val ?? "").toLowerCase())
//         .join(" ");
//       return values.includes(searchTerm.toLowerCase());
//     })
//     .filter((student) => {
//       const matchTrack =
//         selectedTracks.length === 0 || selectedTracks.includes(student.track);
//       const matchYear =
//         selectedYears.length === 0 ||
//         selectedYears.includes(student.year?.toString());
//       const percentage = parseFloat(student.percentage);
//       const matchPercentage =
//         selectedPercentages.length === 0 ||
//         selectedPercentages.some((range) => {
//           const [min, max] = range.replace("%", "").split("-").map(Number);
//           return percentage >= min && percentage <= max;
//         });
//       return matchTrack && matchYear && matchPercentage;
//     });

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching students.</p>;

//   // Define columns and action button logic per tab
//   let columns = [];
//   let actionButton = null;
//   switch (activeTab) {
//     case "Online Assessment":
//       columns = [
//         { key: "firstName", label: "Full Name" },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "onlineTest.result", label: "Test Result" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Schedule interview for: ${row.firstName}`)}
//           className="bg-blue-500 text-white px-3 py-1 rounded"
//         >
//           Schedule Interview
//         </button>
//       );
//       break;

//     case "Selected":
//       columns = [
//         { key: "firstName", label: "Full Name" },
//         { key: "interviews[0].result", label: "Latest Interview" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Send offer letter to: ${row.firstName}`)}
//           className="bg-green-500 text-white px-3 py-1 rounded"
//         >
//           Send Offer
//         </button>
//       );
//       break;

//     case "Rejected":
//       columns = [
//         { key: "firstName", label: "Full Name" },
//         { key: "interviews[0].result", label: "Latest Interview" },
//         { key: "reasonForRejection", label: "Reason" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Review rejection of: ${row.firstName}`)}
//           className="bg-red-500 text-white px-3 py-1 rounded"
//         >
//           Review
//         </button>
//       );
//       break;

//     default:
//       columns = [
//         {
//           key: "fullName",
//           label: "Full Name",
//           render: (row) => `${row.firstName} ${row.lastName}`,
//         },
//         { key: "fatherName", label: "Father's Name" },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "stream", label: "Subject" },
//         { key: "village", label: "Village" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Edit registration of: ${row.firstName}`)}
//           className=" px-3 py-1 rounded"
//         >
//           <img src={edit} alt="edit-icon" />
//         </button>
//       );
//       break;
//   }

//   return (
//     <>
//       <div className="border bg-white shadow-sm rounded-lg px-5">
//         <div className="flex justify-between items-center flex-wrap gap-4">
//           <Pagination
//             rowsPerPage={rowsPerPage}
//             setRowsPerPage={setRowsPerPage}
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             selectedTracks={selectedTracks}
//             setSelectedTracks={setSelectedTracks}
//             selectedYears={selectedYears}
//             setSelectedYears={setSelectedYears}
//             selectedPercentages={selectedPercentages}
//             setSelectedPercentages={setSelectedPercentages}
//           />
//         </div>

//         <div className="px-2 flex gap-6 mt-4">
//           {tabs.map((tab) => (
//             <p
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`cursor-pointer pb-2 border-b-2 ${
//                 activeTab === tab
//                   ? "border-orange-400 font-semibold"
//                   : "border-transparent"
//               }`}
//             >
//               {tab}
//             </p>
//           ))}
//         </div>
//       </div>

//       <CommonTable
//         data={filteredData}
//         columns={columns}
//         editable={true}
//         pagination={true}
//         rowsPerPage={rowsPerPage}
//         searchTerm={searchTerm}
//         actionButton={actionButton}
//       />
//     </>
//   );
// };

// // const StudentList = () => {
// //   const { data = [], isLoading, error } = useGetAllStudentsQuery();
// //   const [rowsPerPage, setRowsPerPage] = useState(10);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [activeTab, setActiveTab] = useState("Total Registration");

// //   const [selectedTracks, setSelectedTracks] = useState([]);
// //   const [selectedYears, setSelectedYears] = useState([]);
// //   const [selectedPercentages, setSelectedPercentages] = useState([]);

// //   const totalRegistrationColumns = [
// //     { key: "firstName", label: "Full Name" },
// //     { key: "fatherName", label: "Father's Name" },
// //     { key: "studentMobile", label: "Mobile" },
// //     { key: "stream", label: "Subject" },
// //     { key: "address", label: "Village" },
// //   ];

// //   const onlineAssessmentColumns = [
// //     { key: "firstName", label: "Full Name" },
// //     { key: "fatherName", label: "Father's Name" },
// //     { key: "studentMobile", label: "Mobile" },
// //     { key: "onlineTest.result", label: "Online Test Result" },
// //   ];

// //   const selectedColumns = [
// //     { key: "firstName", label: "Full Name" },
// //     { key: "fatherName", label: "Father's Name" },
// //     { key: "studentMobile", label: "Mobile" },
// //     { key: "interviews.result", label: "Interview Result" },
// //   ];

// //   const rejectedColumns = [
// //     { key: "firstName", label: "Full Name" },
// //     { key: "fatherName", label: "Father's Name" },
// //     { key: "studentMobile", label: "Mobile" },
// //     { key: "reasonForRejection", label: "Reason for Rejection" },
// //   ];

// //   const tabs = [
// //     "Total Registration",
// //     "Online Assessment",
// //     "Selected",
// //     "Rejected",
// //   ];

// //   const getLatestInterviewResult = (interviews = []) => {
// //     if (!interviews.length) return null;
// //     return [...interviews].sort(
// //       (a, b) => new Date(b.date) - new Date(a.date)
// //     )[0]?.result;
// //   };

// //   const filteredData = data
// //     .filter((student) => {
// //       if (activeTab === "Online Assessment") {
// //         return student.onlineTest?.result === "Pending";
// //       }
// //       if (activeTab === "Selected") {
// //         return getLatestInterviewResult(student.interviews) === "Pass";
// //       }
// //       if (activeTab === "Rejected") {
// //         return getLatestInterviewResult(student.interviews) === "Fail";
// //       }
// //       return true; // "Total Registration" tab will show all students
// //     })
// //     .filter((student) => {
// //       const values = Object.values(student)
// //         .map((val) => String(val ?? "").toLowerCase()) // Ensure data is in lowercase
// //         .join(" ");
// //       return values.includes(searchTerm.toLowerCase()); // Ensure searchTerm is also in lowercase
// //     })
// //     .filter((student) => {
// //       const matchTrack =
// //         selectedTracks.length === 0 || selectedTracks.includes(student.track);
// //       const matchYear =
// //         selectedYears.length === 0 ||
// //         selectedYears.includes(student.year?.toString());
// //       const percentage = parseFloat(student.percentage);
// //       const matchPercentage =
// //         selectedPercentages.length === 0 ||
// //         selectedPercentages.some((range) => {
// //           const [min, max] = range.replace("%", "").split("-").map(Number);
// //           return percentage >= min && percentage <= max;
// //         });
// //       return matchTrack && matchYear && matchPercentage;
// //     });

// //   if (isLoading) return <p>Loading...</p>;
// //   if (error) return <p>Error fetching students.</p>;

// //   // Select columns based on the active tab
// //   let columns = [];
// //   switch (activeTab) {
// //     case "Online Assessment":
// //       columns = onlineAssessmentColumns;
// //       break;
// //     case "Selected":
// //       columns = selectedColumns;
// //       break;
// //     case "Rejected":
// //       columns = rejectedColumns;
// //       break;
// //     default:
// //       columns = totalRegistrationColumns;
// //   }

// //   return (
// //     <>
// //       <div className="border bg-white shadow-sm rounded-lg px-5">
// //         <div className="flex justify-between items-center flex-wrap gap-4">
// //           <Pagination
// //             rowsPerPage={rowsPerPage}
// //             setRowsPerPage={setRowsPerPage}
// //             searchTerm={searchTerm}
// //             setSearchTerm={setSearchTerm}
// //             selectedTracks={selectedTracks}
// //             setSelectedTracks={setSelectedTracks}
// //             selectedYears={selectedYears}
// //             setSelectedYears={setSelectedYears}
// //             selectedPercentages={selectedPercentages}
// //             setSelectedPercentages={setSelectedPercentages}
// //           />
// //         </div>

// //         <div className="px-2 flex gap-6 mt-4">
// //           {tabs.map((tab) => (
// //             <p
// //               key={tab}
// //               onClick={() => setActiveTab(tab)}
// //               className={`cursor-pointer pb-2 border-b-2 ${
// //                 activeTab === tab
// //                   ? "border-orange-400 font-semibold"
// //                   : "border-transparent"
// //               }`}
// //             >
// //               {tab}
// //             </p>
// //           ))}
// //         </div>
// //       </div>

// //       <CommonTable
// //         data={filteredData}
// //         columns={columns}
// //         editable={true}
// //         pagination={true}
// //         rowsPerPage={rowsPerPage}
// //         searchTerm={searchTerm}
// //         actionButton={(row) => (
// //           <button
// //             onClick={() => console.log("Clicked row:", row)}
// //             className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
// //           >
// //             submit
// //           </button>
// //         )}
// //       />
// //     </>
// //   );
// // };

// // const StudentList = () => {
// //   const { data = [], isLoading, error } = useGetAllStudentsQuery();
// //   const [rowsPerPage, setRowsPerPage] = useState(10);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [activeTab, setActiveTab] = useState("Total Registration");

// //   const [selectedTracks, setSelectedTracks] = useState([]);
// //   const [selectedYears, setSelectedYears] = useState([]);
// //   const [selectedPercentages, setSelectedPercentages] = useState([]);

// //   const columns = [
// //     { key: "firstName", label: "Full Name" },
// //     { key: "fatherName", label: "Father's Name" },
// //     { key: "studentMobile", label: "Mobile" },
// //     { key: "stream", label: "Subject" },
// //     { key: "address", label: "Village" },
// //   ];

// //   const tabs = [
// //     "Total Registration",
// //     "Online Assessment",
// //     "Selected",
// //     "Rejected",
// //   ];

// //   const getLatestInterviewResult = (interviews = []) => {
// //     if (!interviews.length) return null;
// //     return [...interviews].sort(
// //       (a, b) => new Date(b.date) - new Date(a.date)
// //     )[0]?.result;
// //   };

// //   const filteredData = data
// //     .filter((student) => {
// //       if (activeTab === "Online Assessment") {
// //         return student.onlineTest?.result === "Pending";
// //       }
// //       if (activeTab === "Selected") {
// //         return getLatestInterviewResult(student.interviews) === "Pass";
// //       }
// //       if (activeTab === "Rejected") {
// //         return getLatestInterviewResult(student.interviews) === "Fail";
// //       }
// //       return true; // "Total Registration" tab will show all students
// //     })
// //     .filter((student) => {
// //       const values = Object.values(student)
// //         .map((val) => String(val ?? "").toLowerCase()) // Ensure data is in lowercase
// //         .join(" ");
// //       return values.includes(searchTerm.toLowerCase()); // Ensure searchTerm is also in lowercase
// //     })
// //     .filter((student) => {
// //       const matchTrack =
// //         selectedTracks.length === 0 || selectedTracks.includes(student.track);
// //       const matchYear =
// //         selectedYears.length === 0 ||
// //         selectedYears.includes(student.year?.toString());
// //       const percentage = parseFloat(student.percentage);
// //       const matchPercentage =
// //         selectedPercentages.length === 0 ||
// //         selectedPercentages.some((range) => {
// //           const [min, max] = range.replace("%", "").split("-").map(Number);
// //           return percentage >= min && percentage <= max;
// //         });
// //       return matchTrack && matchYear && matchPercentage;
// //     });

// //   if (isLoading) return <p>Loading...</p>;
// //   if (error) return <p>Error fetching students.</p>;

// //   return (
// //     <>
// //       <div className="border bg-white shadow-sm rounded-lg px-5">
// //         <div className="flex justify-between items-center flex-wrap gap-4">
// //           <Pagination
// //             rowsPerPage={rowsPerPage}
// //             setRowsPerPage={setRowsPerPage}
// //             searchTerm={searchTerm}
// //             setSearchTerm={setSearchTerm}
// //             selectedTracks={selectedTracks}
// //             setSelectedTracks={setSelectedTracks}
// //             selectedYears={selectedYears}
// //             setSelectedYears={setSelectedYears}
// //             selectedPercentages={selectedPercentages}
// //             setSelectedPercentages={setSelectedPercentages}
// //           />
// //         </div>

// //         <div className="px-2 flex gap-6 mt-4">
// //           {tabs.map((tab) => (
// //             <p
// //               key={tab}
// //               onClick={() => setActiveTab(tab)}
// //               className={`cursor-pointer pb-2 border-b-2 ${
// //                 activeTab === tab
// //                   ? "border-orange-400 font-semibold"
// //                   : "border-transparent"
// //               }`}
// //             >
// //               {tab}
// //             </p>
// //           ))}
// //         </div>
// //       </div>

// //       <CommonTable
// //         data={filteredData}
// //         columns={columns}
// //         editable={true}
// //         pagination={true}
// //         rowsPerPage={rowsPerPage}
// //         searchTerm={searchTerm}
// //         actionButton={(row) => (
// //           <button
// //             onClick={() => console.log("Clicked row:", row)}
// //             className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
// //           >
// //             submit
// //           </button>
// //         )}
// //       />
// //     </>
// //   );
// // };
