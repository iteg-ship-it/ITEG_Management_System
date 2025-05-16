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

  // Define dynamic filter config
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

  // Filter logic
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

  // Define table columns
  const columns = [
    {
      key: "fullName",
      label: "Full Name",
    },
    {
      key: "fullName",
      label: "Full Name",
    },
    { key: "fatherName", label: "Father's Name" },
    { key: "mobileNo", label: "Mobile" },
    { key: "course", label: "Course" },
    { key: "village", label: "Village" },
  ];
  const actionButton = () => (
    <button
      onClick={() => navigate("/student-profile/:studentId")}
      className="px-3 py-1  rounded"
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

// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import back from "../../../assets/icons/back-icon.png";
// import del from "../../../assets/icons/delete-icon.png";
// import edit from "../../../assets/icons/edit-icon.png";
// import { IoSearchOutline } from "react-icons/io5";
// import UserProfile from "../../common-components/user-profile/UserProfile";
// import CommonTable from "../../common-components/table/CommonTable";

// const allStudents = [
//   {
//     id: "1",
//     name: "Ana Sha",
//     fatherName: "John Sha",
//     mobile: "8123456787",
//     village: "Harda",
//     course: "Iteg",
//     year: "1st Year",
//     profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
//   },
//   {
//     id: "2",
//     name: "Rohan Das",
//     fatherName: "Mohan Das",
//     mobile: "9123456789",
//     village: "Kannod",
//     course: "B.Tech",
//     year: "2nd Year",
//     profilePhoto: "https://randomuser.me/api/portraits/men/2.jpg",
//   },
//   {
//     id: "3",
//     name: "Priya Mehta",
//     fatherName: "Shyam Mehta",
//     mobile: "7023456789",
//     village: "Satwas",
//     course: "MBA",
//     year: "3rd Year",
//     profilePhoto: "https://randomuser.me/api/portraits/women/3.jpg",
//   },
//   {
//     id: "4",
//     name: "Raj Gupta",
//     fatherName: "Amit Gupta",
//     mobile: "8523456789",
//     village: "Narsullaganj",
//     course: "B.Sc",
//     year: "1st Year",
//     profilePhoto: "https://randomuser.me/api/portraits/men/4.jpg",
//   },
//   {
//     id: "5",
//     name: "Sita Verma",
//     fatherName: "Harish Verma",
//     mobile: "9623456789",
//     village: "Khategaon",
//     course: "M.Tech",
//     year: "2nd Year",
//     profilePhoto: "https://randomuser.me/api/portraits/women/5.jpg",
//   },
// ];

// const StudentDetailTable = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const queryParams = new URLSearchParams(location.search);
//   const selectedYear = queryParams.get("year") || "Unknown Year";

//   const [students, setStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const filteredStudents = allStudents.filter(
//       (student) => student.year === selectedYear
//     );
//     setStudents(filteredStudents);
//   }, [selectedYear]);

//   const openStudentProfile = (student) => {
//     navigate(`/student-profile/${student.id}`, { state: { student } });
//   };

//   return (
//     <>
//       <div className="w-full flex justify-between px-4">
//         <div className="flex items-center mb-6">
//           <img
//             className="w-5 cursor-pointer"
//             src={back}
//             alt="back"
//             onClick={() => navigate(-1)}
//           />
//         </div>
//         <UserProfile />
//       </div>

//       <div className="p-6 w-[80vw]">
//         <div className="bg-white shadow-md p-10 rounded-lg">
//           <div className="flex items-center mb-6">
//             <h2 className="text-2xl font-semibold ml-4">
//               {selectedYear} Student Details
//             </h2>
//           </div>

//           <div className="flex justify-between items-center mb-4">
//             <div className="flex gap-4">
//               <button className="px-4 py-2 border border-dark rounded">
//                 Download
//               </button>
//               <button className="px-4 py-2 bg-red-200 text-white rounded shadow">
//                 <img src={del} alt="delete icon" />
//               </button>
//             </div>
//             <div className="relative w-64">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="border rounded p-2 w-full pr-10"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//               <IoSearchOutline className="absolute right-3 top-3 text-gray-500" />
//             </div>
//           </div>

//           <CommonTable
//             data={students}
//             searchTerm={searchTerm}
//             onRowClick={openStudentProfile}
//             columnsToShow={[
//               "profilePhoto",
//               "name",
//               "fatherName",
//               "mobile",
//               "course",
//               "village",
//             ]}
//             extraColumn={{
//               header: "Edit",
//               render: (student) => (
//                 <img
//                   className="w-5 cursor-pointer mx-auto"
//                   src={edit}
//                   alt="edit"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate("/student-edit-profile", {
//                       state: { student },
//                     });
//                   }}
//                 />
//               ),
//             }}
//           />

//         </div>
//       </div>
//     </>
//   );
// };

// export default StudentDetailTable;
