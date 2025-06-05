import { useGetAllStudentsQuery } from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import Pagination from "../common-components/pagination/Pagination";
import { useEffect, useState } from "react";
import edit from "../../assets/icons/edit-fill-icon.png";
import CustomTimeDate from "./CustomTimeDate";
import { useNavigate, useLocation } from "react-router-dom";
import UserProfile from "../common-components/user-profile/UserProfile";

const toTitleCase = (str) =>
  str?.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const StudentList = () => {
  const { data = [], isLoading, error } = useGetAllStudentsQuery();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Total Registration");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [atemendNumber, setAtemendNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const scheduleButton = (student) => {
    const attempts = student?.interviews.filter(i => i.round === "First");
    setSelectedStudentId(student._id);
    setAtemendNumber(attempts.length);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setAtemendNumber(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (id) => {
    navigate(`/admission/edit/${id}`);
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

  const getLatestResult = (interviews = []) =>
    [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date))?.[0]?.result;

  const filteredData = data.filter((student) => {
    const latestResult = getLatestResult(student.interviews || []);
    const percentage = parseFloat(student.percentage);
    // const studentTrack = (student.track || "").toLowerCase();
    const interviewsExist = (student.interviews || []).length > 0;

    const hasFirstPass = student.interviews?.some(
      (i) => i.round === "First" && i.result === "Pass"
    );
    const hasSecondPass = student.interviews?.some(
      (i) => i.round === "Second" && i.result === "Pass"
    );
    const hasSecondFail = student.interviews?.some(
      (i) => i.round === "Second" && i.result === "Fail"
    );

    if (
      (activeTab === "Online Assessment" && (student.onlineTest?.result !== "Pending" || interviewsExist)) ||
      (activeTab === "Technical Round" && !interviewsExist) ||
      (activeTab === "Final Round" && !hasFirstPass) ||
      (activeTab === "Selected" && !hasSecondPass) ||
      (activeTab === "Rejected" && (latestResult !== "Fail" && !hasSecondFail))
    ) {
      return false;
    }

    const searchMatch = Object.values(student)
      .map((val) => String(val ?? "").toLowerCase())
      .join(" ")
      .includes(searchTerm.toLowerCase());

    const matchTrack = selectedTracks.length === 0 || selectedTracks.includes(toTitleCase(student.track));
    const matchResult = selectedResults.length === 0 || selectedResults.includes(toTitleCase(latestResult));
    const matchPercentage =
      selectedPercentages.length === 0 ||
      selectedPercentages.some((range) => {
        const [min, max] = range.replace("%", "").split("-").map(Number);
        return percentage >= min && percentage <= max;
      });

    return searchMatch && matchTrack && matchResult && matchPercentage;
  });

  const getStatusBadge = (result) => {
    const base = "px-3 py-1 rounded-xl text-sm font-medium";
    if (result === "Pass") return <span className={`bg-green-100 text-green-700 ${base}`}>Pass</span>;
    if (result === "Fail") return <span className={`bg-red-100 text-red-700 ${base}`}>Fail</span>;
    return <span className={`bg-gray-100 text-gray-700 ${base}`}>{toTitleCase(result || "Not Attempted")}</span>;
  };

  const getMarks = (interviews = [], round = "First") =>
    interviews?.filter((i) => i.round === round)?.at(-1)?.marks || 0;

  let columns = [];
  let actionButton;

  const commonColumns = [
    { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
    { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
    { key: "studentMobile", label: "Mobile" },
    { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
  ];

  switch (activeTab) {
    case "Online Assessment":
      columns = [
        ...commonColumns,
        { key: "stream", label: "Status", render: (row) => getStatusBadge(row.onlineTest?.result) },
      ];
      actionButton = (row) => (
        <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
          Take Interview
        </button>
      );
      break;

    case "Technical Round":
      columns = [
        ...commonColumns,
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "stream", label: "Written Status", render: (row) => getStatusBadge(row.onlineTest?.result) },
        { key: "stream", label: "Tech Marks", render: (row) => getMarks(row.interviews) },
      ];
      actionButton = (row) => (
        <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
          Take Interview
        </button>
      );
      break;

    case "Final Round":
      columns = [
        ...commonColumns,
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "stream", label: "Attempts", render: (row) => getMarks(row.interviews) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => {
            localStorage.setItem("studdedntDetails", JSON.stringify(row));
            navigate(`/interview-detail/${row._id}?tab=${activeTab}`);
          }}
          className="bg-orange-400 text-white px-3 py-1 rounded"
        >
          Interviews Detail
        </button>
      );
      break;

    case "Selected":
      columns = [...commonColumns, { key: "course", label: "Course", render: (row) => toTitleCase(row.course) }];
      actionButton = () => (
        <button className="bg-green-300 text-green-700 px-3 py-1 rounded">
          Selected
        </button>
      );
      break;

    case "Rejected":
      columns = [
        ...commonColumns,
        { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
      ];
      actionButton = () => (
        <button className="bg-red-300 text-red-700 px-3 py-1 rounded">
          Reject
        </button>
      );
      break;

    default:
      columns = [
        ...commonColumns,
        { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
      ];
      actionButton = (row) => (
        <button onClick={() => handleEditClick(row._id)}>
          <img src={edit} alt="edit-icon" className="w-5 h-5" />
        </button>
      );
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
              className={`cursor-pointer pb-2 border-b-2 ${activeTab === tab ? "border-orange-400 font-semibold" : "border-transparent"}`}
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
          attemed={atemendNumber}
        />
      )}
    </>
  );
};

export default StudentList;



// // StudentList.jsx

// import { useGetAllStudentsQuery } from "../../redux/api/authApi";
// import CommonTable from "../common-components/table/CommonTable";
// import Pagination from "../common-components/pagination/Pagination";
// import { useEffect, useState } from "react";
// import edit from "../../assets/icons/edit-fill-icon.png";
// import CustomTimeDate from "./CustomTimeDate";
// import { useNavigate, useLocation } from "react-router-dom";
// import UserProfile from "../common-components/user-profile/UserProfile";

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
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [atemendNumber, setAtemendNumber] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const searchParams = new URLSearchParams(location.search);
//     const tab = searchParams.get("tab");
//     if (tab) setActiveTab(tab);
//   }, [location.search]);

//   const scheduleButton = (student) => {
//     const numberOfAttemed = student?.interviews.filter(
//       (item) => item.round === "First"
//     );
//     setSelectedStudentId(student._id);
//     setAtemendNumber(numberOfAttemed.length);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setSelectedStudentId(null);
//     setAtemendNumber(null);
//     setIsModalOpen(false);
//   };

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
//     return [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
//   };

//   const lowerSearchTerm = searchTerm.toLowerCase();
//   const filteredData = data.filter((student) => {
//     const latestResult = getLatestInterviewResult(student.interviews || []);
//     const percentage = parseFloat(student.percentage);
//     const studentTrack = (student.track || "").toLowerCase();
//     // Pre-computed conditions
//     const interviewsExist = (student.interviews || []).length > 0;

//     const hasFirstRoundPass = student.interviews?.some(
//       (interview) => interview.round === "First" && interview.result === "Pass"
//     );

//     const hasSecondRoundPass = student.interviews?.some(
//       (interview) => interview.round === "Second" && interview.result === "Pass"
//     );

//     const hasSecondRoundFail = student.interviews?.some(
//       (interview) => interview.round === "Second" && interview.result === "Fail"
//     );

//     // Main condition check
//     if (
//       // Online Assessment tab:
//       (activeTab === "Online Assessment" &&
//         (student.onlineTest?.result !== "Pending" || interviewsExist)) ||

//       // Selected tab:
//       (activeTab === "Selected" && !hasSecondRoundPass) ||

//       // Final Round tab:
//       (activeTab === "Final Round" && !hasFirstRoundPass) ||

//       // Rejected tab:
//       (activeTab === "Rejected" &&
//         (latestResult !== "Fail" && !hasSecondRoundFail)) ||

//       // Technical Round tab:
//       (activeTab === "Technical Round" && !interviewsExist)
//     ) {
//       return false;
//     }

//     // if (
//     //   (activeTab === "Online Assessment" && student.onlineTest?.result !== "Pending") ||
//     //   (activeTab === "Selected" && latestResult !== "Pass") ||
//     //   (activeTab === "Final Round" && latestResult !== "Pass") ||
//     //   (activeTab === "Rejected" && latestResult !== "Fail")
//     // ) {
//     //   return false;
//     // }
//     // if (
//     //   (activeTab === "Online Assessment" &&
//     //     (student.onlineTest?.result !== "Pending" || (student.interviews || []).length > 0)) ||
//     //   (activeTab === "Online Assessment" &&
//     //     (student.onlineTest?.result !== "Pending" || (student.interviews || []).length > 0)) ||

//     //   (activeTab === "Selected" &&
//     //     !student.interviews?.some(
//     //       (interview) => interview.round === "Second" && interview.result === "Pass"
//     //     )) ||

//     //   (activeTab === "Final Round" &&
//     //     !student.interviews?.some(
//     //       (interview) => interview.round === "First" && interview.result === "Pass"
//     //     )) ||

//     //   (activeTab === "Rejected" && latestResult !== "Fail") ||
//     //   (activeTab === "Selected" && latestResult !== "Pass") ||
//     //   (activeTab === "Final Round" && latestResult !== "Pass") ||
//     //   (activeTab === "Rejected" && latestResult !== "Fail") ||
//     //   (activeTab === "Technical Round" && (student.interviews || []).length === 0) ||
//     //   (activeTab === "Rejected" &&
//     //     latestResult !== "Fail" &&
//     //     !student.interviews?.some(
//     //       (interview) => interview.rounddd === "Second" && interview.result === "Fail"
//     //     ))

//     // ) {
//     //   return false;
//     // }


//     const searchableValues = Object.values(student)
//       .map((val) => String(val ?? "").toLowerCase())
//       .join(" ");
//     if (!searchableValues.includes(lowerSearchTerm)) return false;

//     const matchTrack =
//       selectedTracks.length === 0 ||
//       selectedTracks.some((track) => track.toLowerCase() === studentTrack);

//     const matchResult =
//       selectedResults.length === 0 ||
//       selectedResults.some((result) => result.toLowerCase() === (latestResult?.toLowerCase() || ""));

//     const matchPercentage =
//       selectedPercentages.length === 0 ||
//       selectedPercentages.some((range) => {
//         const [min, max] = range.replace("%", "").split("-").map(Number);
//         return percentage >= min && percentage <= max;
//       });

//     return matchTrack && matchResult && matchPercentage;
//   });
//   const handleGetOnlineMarks = (onlineTest = {}) => {
//     const result = onlineTest?.result;
//     switch (result) {
//       case "Pass":
//         return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">Pass</span>;
//       case "Fail":
//         return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl text-sm font-medium">Fail</span>;
//       default:
//         return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium">{toTitleCase(result) || "Not Attempted"}</span>;
//     }
//   };


//   const handleGetMarks = (interviews = []) => {
//     const roundData = interviews?.filter((i) => i?.round === "First");
//     return roundData?.[roundData.length - 1]?.marks || 0;
//   };

//   const handleGetStatus = (interviews = []) => {
//     const roundData = interviews?.filter((i) => i?.round === "First");
//     const result = roundData?.[roundData.length - 1]?.result;
//     switch (result) {
//       case "Pass":
//         return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">Pass</span>;
//       case "Fail":
//         return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-xl text-sm font-medium">Fail</span>;
//       default:
//         return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-sm font-medium">{toTitleCase(result) || "Not Attempted"}</span>;
//     }
//   };
//   let columns = [];
//   let actionButton;

//   switch (activeTab) {
//     case "Online Assessment":
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
//         { key: "stream", label: "Status", render: (row) => handleGetOnlineMarks(row.onlineTest) },
//         // { key: "stream", label: "Status", render: (row) => handleGetStatus(row.interviews) },
//         //    { key: "stream", label: "Marks", render: (row) => handleGetMarks(row.interviews) },
//         // { key: "stream", label: "Status", render: (row) => handleGetStatus(row.interviews) },
//       ];
//       actionButton = (row) => (
//         <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
//           Take interview
//         </button>
//       );
//       break;
//     case "Technical Round":
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
//         { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
//         { key: "stream", label: "Status of Written", render: (row) => handleGetOnlineMarks(row.onlineTest) },
//         { key: "stream", label: "Marks of tech", render: (row) => handleGetMarks(row.interviews) },
//       ];
//       actionButton = (row) => (
//         <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
//           Take interview
//         </button>
//       ); break;

//     case "Final Round":
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
//         { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
//         { key: "stream", label: "Attempts of tech", render: (row) => handleGetMarks(row.interviews) },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => {
//             localStorage.setItem("studdedntDetails", JSON.stringify(row));
//             navigate(`/interview-detail/${row._id}?tab=${activeTab}`);
//           }}
//           className="bg-orange-400 text-white font-semibold px-3 py-1 rounded hover:bg-orange-500"
//         >
//           Interviews Detail
//         </button>
//       );
//       break;


//     case "Selected":
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Send confirmation to ${row.firstName}`)}
//           className="bg-green-300 text-green-700 font-semibold px-3 py-1 rounded"
//         >
//           Selected
//         </button>
//       );
//       break;


//     case "Rejected":
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
//         { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
//       ];
//       actionButton = (row) => (
//         <button
//           onClick={() => alert(`Review ${row.firstName}'s case again`)}
//           className="bg-red-300 text-red-700 px-3 py-1 rounded"
//         >
//           Reject
//         </button>
//       );
//       break;

//     default:
//       columns = [
//         { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
//         { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
//         { key: "studentMobile", label: "Mobile" },
//         { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
//         { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
//         { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
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
//               className={`cursor-pointer pb-2 border-b-2 ${activeTab === tab ? "border-orange-400 font-semibold" : "border-transparent"
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

//       {isModalOpen && selectedStudentId && (
//         <CustomTimeDate
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//           studentId={selectedStudentId}
//           attemed={atemendNumber}
//         />
//       )}
//     </>
//   );
// };

// export default StudentList;

