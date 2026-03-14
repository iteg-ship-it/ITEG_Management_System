import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPermissionStudentQuery,
} from "../../redux/api/authApi";
import Loader from '../common-components/loader/Loader';
import CommonTable from '../common-components/table/CommonTable';
import Header from "../common-components/sidebar/Header";
// import { HiArrowNarrowLeft } from "react-icons/hi";

const StudentPermission = () => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetPermissionStudentQuery();

  const students = data?.data || [];
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const filtersConfig = [
    {
      title: "Track",
      options: [...new Set(students.map((s) => toTitleCase(s.track || "")))].filter(Boolean),
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: ["Pass", "Fail", "Pending"],
      selected: selectedResults,
      setter: setSelectedResults,
    },
  ];

  const filteredData = students.filter((student) => {
    const searchableValues = Object.values(student)
      .map((val) => String(val ?? "").toLowerCase())
      .join(" ");
    if (!searchableValues.includes(searchTerm.toLowerCase())) return false;

    const track = toTitleCase(student.track || "");
    const matchesTrack = selectedTracks.length === 0 || selectedTracks.includes(track);

    const matchesResult = selectedResults.length === 0 ||
      selectedResults.includes(student.result || "Pending");

    return matchesTrack && matchesResult;
  });

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
    },
    {
      key: "fatherName",
      label: "Father Name",
      render: (row) => toTitleCase(row.fatherName || "N/A"),
    },
    {
      key: "studentMobile",
      label: "Mobile Number",
      render: (row) => row.studentMobile || "N/A",
    },
    {
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course || "N/A"),
    },
    {
      key: "track",
      label: "Track",
      render: (row) => toTitleCase(row.track || "N/A"),
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) => row.permissionDetails?.remark || "N/A",
    },
    {
      key: "requested_by",
      label: "Approved By",
      render: (row) => {
        const approvedBy = row.permissionDetails?.approved_by || row.permissionDetails?.requested_by;
        if (!approvedBy) return "N/A";
        
        // If it's an object with name property
        if (typeof approvedBy === 'object' && approvedBy.name) {
          return toTitleCase(approvedBy.name);
        }
        
        // If it's a string
        if (typeof approvedBy === 'string') {
          return toTitleCase(approvedBy);
        }
        
        return "N/A";
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600 font-medium">
          Error: {error?.data?.message || "Something went wrong."}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Dummy Students" />
      <div className="min-h-screen px-5">

        <CommonTable
          data={filteredData}
          columns={columns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtersConfig={filtersConfig}
          onRowClick={(row) => navigate(`/student-profile/${row._id}`)}
          rowsPerPage={rowsPerPage}
        />
      </div>
    </>
  );
};

export default StudentPermission;



// import {
//   useGetPermissionStudentQuery,
// } from "../../redux/api/authApi";
// import Loader from '../common-components/loder/Loader';
// const StudentPermission = () => {
//   const {
//     data,
//     isLoading=true,
//     isError,
//     error,
//   } = useGetPermissionStudentQuery();

//   const students = data?.data || [];

//   return (
//     <>
//       <div>
//         {/* Loading State */}
//         <div className="min-h-screen flex items-center justify-center bg-white">
//       {isLoading ? <Loader /> : <div>Your Content Here</div>}
//     </div>

//         {/* Error State */}
//         {isError && (
//           <div className="text-center text-red-600 font-medium py-4">
//             Error: {error?.data?.message || "Something went wrong."}
//           </div>
//         )}

//         {/* No Data */}
//         {!isLoading && !isError && students.length === 0 && (
//           <div className="text-center text-gray-500 py-6">
//             No student permissions found.
//           </div>
//         )}

//         {/* Student Permission List */}
//         {students.length > 0 && (
//           <div>
       

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {students.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-xl transition"
//                 >
//                   <div className="mb-3">
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       {student.firstName} {student.lastName}
//                     </h3>
//                     <p className="text-sm text-gray-500">
//                       PRN: {student.prkey || "N/A"}
//                     </p>
//                   </div>

//                   <div className="text-sm text-gray-700 space-y-1">
//                     <p>
//                       <span className="font-medium">Remark:</span>{" "}
//                       {student.permissionDetails?.remark || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Approved By:</span>{" "}
//                       {student.permissionDetails?.approved_by || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Upload Date:</span>{" "}
//                       {student.permissionDetails?.uploadDate
//                         ? new Date(student.permissionDetails.uploadDate).toLocaleDateString()
//                         : "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default StudentPermission;

