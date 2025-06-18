import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import UserProfile from "../common-components/user-profile/UserProfile";
import { useGetReadyStudentsForPlacementQuery } from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";

const PlacementReadyStudents = () => {
  const { data = [] } = useGetReadyStudentsForPlacementQuery();
  const students = data?.data || [];

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);

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

  const columns = [
    {
      key: "image",
      label: "Profile",
      render: (row) => (
        <div className="flex justify-center">
          <img
            src={row.image || "https://via.placeholder.com/40"}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "course", label: "Course" },
    { key: "techno", label: "Technology" },
    { key: "studentMobile", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "stream", label: "Stream" },
  ];

  const actionButton = (student) => (
    <button
      onClick={() => console.log("Interview clicked for", student)}
      className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
    >
      Interview
    </button>
  );

  return (
    <>
      <UserProfile heading={"Placement Ready Students"} />
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
        data={students}
        editable={true} // ✅ required to show actionButton
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        actionButton={actionButton}
      />
    </>
  );
};

export default PlacementReadyStudents;





// import CommonTable from "../common-components/table/CommonTable";
// import UserProfile from "../common-components/user-profile/UserProfile";
// import { useGetReadyStudentsForPlacementQuery } from "../../redux/api/authApi";
// import Pagination from "../common-components/pagination/Pagination";
// import { useState } from "react";

// const PlacementReadyStudents = () => {
//   const { data = [] } = useGetReadyStudentsForPlacementQuery();
//   const students = data?.data || [];
//   console.log(students);

//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTracks, setSelectedTracks] = useState([]);
//   const [selectedResults, setSelectedResults] = useState([]);
//   const [selectedPercentages, setSelectedPercentages] = useState([]);
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


//   const columns = [
//     {
//       key: "image", label: "Profile", render: (row) => (
//         <div className="flex justify-center">
//           <img
//             src={row.image || "https://via.placeholder.com/40"}
//             alt="avatar"
//             className="w-8 h-8 rounded-full object-cover"
//           />
//         </div>
//       )
//     }, {
//       key: "fullName",
//       label: "Full Name",
//       render: (row) => `${row.firstName} ${row.lastName}`,
//     },
//     { key: "techno", label: "Technology" },
//     { key: "email", label: "Email" },
//     { key: "course", label: "Course" },
//     { key: "gender", label: "Gender" },
//     { key: "stream", label: "Stream" },
//     { key: "studentMobile", label: "Phone" },
//   ];

//   const actionButton = (student) => (
//     <>
//       <button
//         onClick={() => {
//           console.log(student);

//         }}
//         className="px-3 py-1 rounded"
//       >
//         Interview
//       </button>

//     </>
//   );
//   return (
//     <>
//       <UserProfile heading={"Placement Ready Students"} />
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
//         data={students}
//         pagination={true}
//         rowsPerPage={rowsPerPage}
//         actionButton={actionButton}
//       />

//     </>
//   );
// };

// export default PlacementReadyStudents;


// // // import CommonTable from "../common-components/table/CommonTable";
// // import UserProfile from "../common-components/user-profile/UserProfile"
// // import { useGetReadyStudentsForPlacementQuery } from "./../../redux/api/authApi"
// // const PlacementReadyStudents = () => {
// //   // const { data, isLoading, isError, error } = useGetReadyStudentsForPlacementQuery();
// //   const { data = [] } = useGetReadyStudentsForPlacementQuery();
// //   console.log(data.data);

// //   return (
// //     <>
// //       <UserProfile heading={"Placement Ready Students"} />
// //       {/* <CommonTable /> */}
// //     </>
// //   )
// // }

// // export default PlacementReadyStudents
