import { useState } from "react";
import Pagination from "../../common-components/pagination/Pagination";
import UserProfile from "../../common-components/user-profile/UserProfile";
import { useAdmitedStudentsQuery } from "../../../redux/api/authApi";
import CommonTable from "../../common-components/table/CommonTable";
import { useNavigate } from "react-router-dom";
import edit from "../../../assets/icons/edit-fill-icon.png";

const StudentDetailTable = () => {
  const { data = [], isLoading } = useAdmitedStudentsQuery();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const navigate = useNavigate();

  const filtersConfig = [
    {
      title: "Track",
      options: ["Harda", "Kannod", "Khategaon", "Nemawar"],
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

  const filteredData = data.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrack =
      selectedTracks.length === 0 ||
      selectedTracks.some(
        (track) => track.toLowerCase() === (student.track || "").toLowerCase()
      );

    const matchesResult =
      selectedResults.length === 0 || selectedResults.includes(student.result);

    const matchesPercentage =
      selectedPercentages.length === 0 ||
      selectedPercentages.some((range) => {
        const [min, max] = range.split("-").map((v) => parseFloat(v));
        return (
          student.interviewPercentage >= min &&
          student.interviewPercentage <= max
        );
      });

    return matchesSearch && matchesTrack && matchesResult && matchesPercentage;
  });

  const columns = [
    { key: "profile", label: "Profile" },
    { key: "fullName", label: "Full Name" },
    { key: "fatherName", label: "Father's Name" },
    { key: "mobileNo", label: "Mobile" },
    { key: "course", label: "Course" },
    { key: "level", label: "Level" },
    { key: "village", label: "Village" },
  ];

  const actionButton = (student) => (
    <button
      onClick={() =>
        navigate(`/student-profile/${student._id}`, { state: { student } })
      }
      className="px-3 py-1 rounded"
    >
      <img src={edit} alt="edit-icon" className="w-5 h-5" />
    </button>
  );

  return (
    <>
      <UserProfile showBackButton heading="Admitted Students" />
      <div className="border bg-white shadow-sm rounded-lg px-5">
        <Pagination
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtersConfig={filtersConfig}
        />
      </div>
      <CommonTable
        columns={columns}
        data={filteredData}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        actionButton={actionButton}
      />
    </>
  );
};

export default StudentDetailTable;

// import { useState } from "react";
// import Pagination from "../../common-components/pagination/Pagination";
// import UserProfile from "../../common-components/user-profile/UserProfile";
// import { useAdmitedStudentsQuery } from "../../../redux/api/authApi";
// import CommonTable from "../../common-components/table/CommonTable";
// import { useNavigate } from "react-router-dom";
// import edit from "../../../assets/icons/edit-fill-icon.png";

// const StudentDetailTable = () => {
//   const { data = [], isLoading } = useAdmitedStudentsQuery();

//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTracks, setSelectedTracks] = useState([]);
//   const [selectedResults, setSelectedResults] = useState([]);
//   const [selectedPercentages, setSelectedPercentages] = useState([]);
//   const navigate = useNavigate();

//   // Define dynamic filter config
//   const filtersConfig = [
//     {
//       title: "Track",
//       options: ["Harda", "Kannod", "Khategaon", "Nemawar"],
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

//   // Filter logic
//   const filteredData = data.filter((student) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.email?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesTrack =
//       selectedTracks.length === 0 ||
//       selectedTracks.some(
//         (track) => track.toLowerCase() === (student.track || "").toLowerCase()
//       );

//     const matchesResult =
//       selectedResults.length === 0 || selectedResults.includes(student.result);

//     const matchesPercentage =
//       selectedPercentages.length === 0 ||
//       selectedPercentages.some((range) => {
//         const [min, max] = range.split("-").map((v) => parseFloat(v));
//         return (
//           student.interviewPercentage >= min &&
//           student.interviewPercentage <= max
//         );
//       });

//     return matchesSearch && matchesTrack && matchesResult && matchesPercentage;
//   });

//   // Define table columns
//   const columns = [
//     { key: "", label: "Profile" },
//     { key: "fullName", label: "Full Name" },
//     { key: "fullName", label: "Full Name" },
//     { key: "fatherName", label: "Father's Name" },
//     { key: "mobileNo", label: "Mobile" },
//     { key: "course", label: "Course" },
//     { key: "level", label: "Level" },
//     { key: "village", label: "Village" },
//   ];
//   const actionButton = () => (
//     <button
//       onClick={() => navigate("/student-profile/:studentId")}
//       className="px-3 py-1  rounded"
//     >
//       <img src={edit} alt="edit-icon" className="w-5 h-5" />
//     </button>
//   );
//   return (
//     <>
//       <UserProfile showBackButton heading="Admitted Students" />
//       <div className="border bg-white shadow-sm rounded-lg px-5">
//         <Pagination
//           rowsPerPage={rowsPerPage}
//           setRowsPerPage={setRowsPerPage}
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           filtersConfig={filtersConfig}
//         />
//       </div>
//       <CommonTable
//         columns={columns}
//         data={filteredData}
//         editable={true}
//         pagination={true}
//         rowsPerPage={rowsPerPage}
//         isLoading={isLoading}
//         actionButton={actionButton}
//       />
//     </>
//   );
// };

// export default StudentDetailTable;
