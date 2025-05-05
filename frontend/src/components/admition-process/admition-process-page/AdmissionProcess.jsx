// src/pages/admission/AdmissionProcess.js
import UserProfile from "../../common-components/user-profile/UserProfile";
import { useGetAllStudentsQuery } from "../../../redux/api/authApi";
import CommonTable from "../../common-components/table/CommonTable";
import Pagination from "../../common-components/pagination/Pagination";
import { useState } from "react";
import edit from "../../../assets/icons/edit-fill-icon.png";
import CustomTimeDate from "../date-time-modal/CustomTimeDate";
import { useNavigate } from "react-router-dom";

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
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleEditClick = (studentId) => {
    navigate(`/admission/edit/${studentId}`);
  };

  const filtersConfig = [
    {
      title: "Track",
      options: ["Harda", "Kannod", "Khategaon"],
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: ["Pass", "Fail"],
      selected: selectedResults,
      setter: setSelectedResults,
    },
    {
      title: "Interview",
      options: ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"],
      selected: selectedPercentages,
      setter: setSelectedPercentages,
    },
  ];

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

  const scheduleButton = () => {
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
        selectedTracks.length === 0 ||
        selectedTracks.some(
          (track) => track.toLowerCase() === (student.track || "").toLowerCase()
        );

      const matchResult =
        selectedResults.length === 0 ||
        selectedResults.some(
          (result) =>
            result.toLowerCase() ===
            getLatestInterviewResult(student.interviews || []).toLowerCase()
        );

      const percentage = parseFloat(student.percentage);
      const matchPercentage =
        selectedPercentages.length === 0 ||
        selectedPercentages.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });

      return matchTrack && matchResult && matchPercentage;
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
        <button onClick={() => handleEditClick(row._id)}>
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
            filtersConfig={filtersConfig}
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

      {showModal && <CustomTimeDate onClose={() => setShowModal(false)} />}
    </>
  );
};

// import UserProfile from "../../common-components/user-profile/UserProfile";
// import { useGetAllStudentsQuery } from "../../../redux/api/authApi";
// import CommonTable from "../../common-components/table/CommonTable";
// import Pagination from "../../common-components/pagination/Pagination";
// import { useState } from "react";
// import edit from "../../../assets/icons/edit-fill-icon.png";
// // import { useNavigate } from "react-router-dom";
// import CustomTimeDate from "../date-time-modal/CustomTimeDate";
// import { useNavigate } from "react-router-dom";

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
//   const [selectedResults, setSelectedResults] = useState([]);
//   const [selectedPercentages, setSelectedPercentages] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();

//   const handleEditClick = (studentId) => {
//     navigate(`/admission/edit/${studentId}`);
//   };
//   const filtersConfig = [
//     {
//       title: "Track",
//       options: ["Harda", "Kannod", "Khategaon"],
//       selected: selectedTracks,
//       setter: setSelectedTracks,
//     },
//     {
//       title: "Result",
//       options: ["Pass", "Fail"],
//       selected: selectedResults,
//       setter: setSelectedResults,
//     },
//     {
//       title: "Interview",
//       options: ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"],
//       selected: selectedPercentages,
//       setter: setSelectedPercentages,
//     },
//   ];

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

//   const scheduleButton = () => {
//     setShowModal(true);
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
//         selectedTracks.length === 0 ||
//         selectedTracks.some(
//           (track) => track.toLowerCase() === (student.track || "").toLowerCase()
//         );

//       const matchResult =
//         selectedResults.length === 0 ||
//         selectedResults.some(
//           (result) =>
//             result.toLowerCase() ===
//             getLatestInterviewResult(student.interviews || []).toLowerCase()
//         );

//       const percentage = parseFloat(student.percentage);
//       const matchPercentage =
//         selectedPercentages.length === 0 ||
//         selectedPercentages.some((range) => {
//           const [min, max] = range.replace("%", "").split("-").map(Number);
//           return percentage >= min && percentage <= max;
//         });

//       return matchTrack && matchResult && matchPercentage;
//     });

//   let columns = [];
//   let actionButton;
//   switch (activeTab) {
//     case "Online Assessment":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => `${row.firstName} ${row.lastName}`,
//         },
//         { key: "fatherName", label: "Father's Name" },
//         { key: "studentMobile", label: "Mobile" },
//         {
//           key: "interviews",
//           label: "Marks",
//           render: (row) =>
//             row.interviews && row.interviews.length > 0
//               ? row.interviews[0].marks
//               : "N/A",
//         },
//         { key: "village", label: "Status" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => scheduleButton(row)}
//           className="bg-orange-500 text-white px-3 py-1 rounded"
//         >
//           + Schedule Interview
//         </button>
//       );
//       break;

//     case "Selected":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => `${row.firstName} ${row.lastName}`,
//         },
//         { key: "year", label: "Year" },
//         { key: "track", label: "Track" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Send confirmation to ${row.firstName}`)}
//           className="bg-green-500 text-white px-3 py-1 rounded"
//         >
//           Confirm
//         </button>
//       );
//       break;

//     case "Rejected":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => `${row.firstName} ${row.lastName}`,
//         },
//         { key: "reason", label: "Rejection Reason" },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Review ${row.firstName}'s case again`)}
//           className="bg-red-500 text-white px-3 py-1 rounded"
//         >
//           Re-review
//         </button>
//       );
//       break;

//     default:
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => `${row.firstName} ${row.lastName}`,
//         },
//         { key: "fatherName", label: "Father's Name" },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "stream", label: "Subject" },
//         { key: "village", label: "Village" },
//       ];

//       actionButton = (row) => (
//         <button onClick={() => handleEditClick(row._id)}>
//           <img src={edit} alt="edit-icon" className="w-5 h-5" />
//         </button>
//       );
//       break;
//   }

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching students.</p>;

//   return (
//     <>
//       <div className="border bg-white shadow-sm rounded-lg px-5">
//         <div className="flex justify-between items-center flex-wrap gap-4">
//           <Pagination
//             rowsPerPage={rowsPerPage}
//             setRowsPerPage={setRowsPerPage}
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             filtersConfig={filtersConfig}
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
//       {showModal && <CustomTimeDate onClose={() => setShowModal(false)} />}
//     </>
//   );
// };
