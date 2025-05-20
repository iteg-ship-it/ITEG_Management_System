import { useGetAllStudentsQuery } from "../../../redux/api/authApi";
import CommonTable from "../../common-components/table/CommonTable";
import Pagination from "../../common-components/pagination/Pagination";
import { useState } from "react";
import edit from "../../../assets/icons/edit-fill-icon.png";
import CustomTimeDate from "../date-time-modal/CustomTimeDate";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../common-components/user-profile/UserProfile";

const toTitleCase = (str) =>
  str
    ?.toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const StudentList = () => {
  const { data = [], isLoading, error } = useGetAllStudentsQuery();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Total Registration");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const scheduleButton = (student) => {
    setSelectedStudentId(student._id); // store student ID
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setIsModalOpen(false);
  };

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
    "Technical Round",
    "Final Round",
    "Selected",
    "Rejected",
  ];

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
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
        selectedTracks.some((track) => track.toLowerCase() === (student.track || "").toLowerCase());

      const matchResult =
        selectedResults.length === 0 ||
        selectedResults.some(
          (result) =>
            result.toLowerCase() ===
            getLatestInterviewResult(student.interviews || [])?.toLowerCase()
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

  const handleGetMarks = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    return roundData?.[roundData.length - 1]?.marks || 0;
  };

  const handleGetStatus = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    const result = roundData?.[roundData.length - 1]?.result;
    switch (result) {
      case "Pass":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">Pass</span>;
      case "Fail":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl text-sm font-medium">Fail</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium">{toTitleCase(result) || "Not Attempted"}</span>;
    }
  };

  let columns = [];
  let actionButton;

  switch (activeTab) {
    case "Online Assessment":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
        { key: "stream", label: "Marks", render: (row) => handleGetMarks(row.interviews) },
        { key: "stream", label: "Status", render: (row) => handleGetStatus(row.interviews) },
      ];
      actionButton = (row) => (
        <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
          Take interview
        </button>
      );
      break;
 case "Final Round":
  columns = [
    { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
    { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
    { key: "studentMobile", label: "Mobile" },
    { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
    { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
    { key: "stream", label: "Marks of tech", render: (row) => handleGetMarks(row.interviews) },
  ];
  actionButton = (row) => (
    <button
      onClick={() => navigate(`/interview-detail/${row._id}`)}
      className="bg-orange-400 text-white font-semibold px-3 py-1 rounded hover:bg-orange-500"
    >
      Interviews Detail
    </button>
  );
  break;


    case "Selected":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Send confirmation to ${row.firstName}`)}
          className="bg-green-300 text-green-700 font-semibold px-3 py-1 rounded"
        >
          Selected
        </button>
      );
      break;
    

    case "Rejected":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
        { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Review ${row.firstName}'s case again`)}
          className="bg-red-300 text-red-700 px-3 py-1 rounded"
        >
          Reject
        </button>
      );
      break;

    default:
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
        { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
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
      <UserProfile heading="Admission Process" />

      <div className="mt-5 border bg-white shadow-sm rounded-lg px-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Pagination
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtersConfig={filtersConfig}
            filteredData={filteredData}
          />
        </div>

        <div className="px-2 flex gap-6 mt-4">
          {tabs.map((tab) => (
            <p
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 border-b-2 ${
                activeTab === tab ? "border-orange-400 font-semibold" : "border-transparent"
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

      {isModalOpen && selectedStudentId && (
        <CustomTimeDate
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          studentId={selectedStudentId}
        />
      )}
    </>
  );
};

export default StudentList;



// import { useGetAllStudentsQuery,  } from "../../../redux/api/authApi";
// import CommonTable from "../../common-components/table/CommonTable";
// import Pagination from "../../common-components/pagination/Pagination";
// import { useState } from "react";
// import edit from "../../../assets/icons/edit-fill-icon.png";
// import CustomTimeDate from "../date-time-modal/CustomTimeDate";
// import { useNavigate } from "react-router-dom";
// import UserProfile from "../../common-components/user-profile/UserProfile";

// // Converts string to Title Case (e.g., "john doe" => "John Doe")
// const toTitleCase = (str) =>
//   str
//     ?.toLowerCase()
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");

// const StudentList = () => {
//   const { data = [], isLoading, error } = useGetAllStudentsQuery();
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("Total Registration");
//   const [selectedTracks, setSelectedTracks] = useState([]);
//   const [selectedResults, setSelectedResults] = useState([]);
//   const [selectedPercentages, setSelectedPercentages] = useState([]);
//   // const [showModal, setShowModal] = useState(false);
//    const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
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
//     "Technical Round",
//     "Final Round",
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
//             getLatestInterviewResult(student.interviews || [])?.toLowerCase()
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

//   const handleGetMarks = (data) => {
//     if (data.length > 0) {
//       const onlineTestData = data.filter((item) => item?.round === "First");
//       let latestData = onlineTestData?.length;
//       return onlineTestData[latestData - 1]?.marks || 0;
//     }
//     return 0;
//   };

//   const handleGetStatus = (data = []) => {
//     if (Array.isArray(data) && data.length > 0) {
//       const onlineTestData = data.filter((item) => item?.round === "First");
//       const latestData = onlineTestData.length;
//       const result = onlineTestData[latestData - 1]?.result;

//       switch (result) {
//         case "Pass":
//           return (
//             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">
//               Pass
//             </span>
//           );
//         case "Fail":
//           return (
//             <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl text-sm font-medium">
//               Fail
//             </span>
//           );
//         default:
//           return (
//             <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium">
//               {toTitleCase(result) || "Not Attempted"}
//             </span>
//           );
//       }
//     }

//     return (
//       <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-sm font-medium">
//         Not Attempted
//       </span>
//     );
//   };

//   let columns = [];
//   let actionButton;

//   switch (activeTab) {
//     case "Online Assessment":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
//         },
//         {
//           key: "fatherName",
//           label: "Father's Name",
//           render: (row) => toTitleCase(row.fatherName),
//         },
//         {
//           key: "studentMobile",
//           label: "Mobile",
//         },
//         {
//           key: "track",
//           label: "Track",
//           render: (row) => toTitleCase(row.track),
//         },
//         {
//           key: "stream",
//           label: "Marks",
//           render: (row) => handleGetMarks(row.interviews),
//         },
//         {
//           key: "stream",
//           label: "Status",
//           render: (row) => handleGetStatus(row.interviews),
//         },
//       ];

//       actionButton = (row) => (
//         <button
//           onClick={() => scheduleButton(row)}
//           className="bg-orange-500 text-white px-3 py-1 rounded"
//         >
//           Take interview
//         </button>
//       );
//       break;

//     case "Selected":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
//         },
//         {
//           key: "fatherName",
//           label: "Father's Name",
//           render: (row) => toTitleCase(row.fatherName),
//         },
//         {
//           key: "studentMobile",
//           label: "Mobile",
//         },
//         {
//           key: "course",
//           label: "Course",
//           render: (row) => toTitleCase(row.course),
//         },
//         {
//           key: "track",
//           label: "Track",
//           render: (row) => toTitleCase(row.track),
//         },
//       ];

//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Send confirmation to ${row.firstName}`)}
//           className="bg-green-300 text-green-700 fold-semibold px-3 py-1 rounded"
//         >
//           Selected
//         </button>
//       );
//       break;

//     case "Rejected":
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
//         },
//         {
//           key: "fatherName",
//           label: "Father's Name",
//           render: (row) => toTitleCase(row.fatherName),
//         },
//         {
//           key: "studentMobile",
//           label: "Mobile",
//         },
//         {
//           key: "stream",
//           label: "Subject",
//           render: (row) => toTitleCase(row.stream),
//         },
//         {
//           key: "village",
//           label: "Village",
//           render: (row) => toTitleCase(row.village),
//         },
//         {
//           key: "track",
//           label: "Track",
//           render: (row) => toTitleCase(row.track),
//         },
//       ];

//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Review ${row.firstName}'s case again`)}
//           className="bg-red-40 text-red-700 bg-red-300 px-3 py-1 rounded"
//         >
//           Reject
//         </button>
//       );
//       break;

//     default:
//       columns = [
//         {
//           key: "firstName",
//           label: "Full Name",
//           render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
//         },
//         {
//           key: "fatherName",
//           label: "Father's Name",
//           render: (row) => toTitleCase(row.fatherName),
//         },
//         {
//           key: "studentMobile",
//           label: "Mobile",
//         },
//         {
//           key: "stream",
//           label: "Subject",
//           render: (row) => toTitleCase(row.stream),
//         },
//         {
//           key: "village",
//           label: "Village",
//           render: (row) => toTitleCase(row.village),
//         },
//         {
//           key: "track",
//           label: "Track",
//           render: (row) => toTitleCase(row.track),
//         },
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
 
//   const handleOpenModal = (student) => {
//     setSelectedStudent(student);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedStudent(null);
//   };
//   return (
//     <>
//       <UserProfile heading="Admission Process" />

//       <div className="mt-5 border bg-white shadow-sm rounded-lg px-5">
//         <div className="flex justify-between items-center flex-wrap gap-4">
//           <Pagination
//             rowsPerPage={rowsPerPage}
//             setRowsPerPage={setRowsPerPage}
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//             filtersConfig={filtersConfig}
//             filteredData={filteredData}
//           />
//         </div>

//         <div className="px-2 flex gap-6 mt-4">
//           {tabs.map((tab) => (
//             <p
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`cursor-pointer pb-2 border-b-2 ${activeTab === tab
//                 ? "border-orange-400 font-semibold"
//                 : "border-transparent"
//                 }`}
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

//       {isModalOpen && selectedStudent && (
//         <CustomTimeDate
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           student={selectedStudent}
//         />
//       )}    </>
//   );
// };

// export default StudentList;
