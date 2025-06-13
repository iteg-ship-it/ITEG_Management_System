import {
  useGetPermissionStudentQuery,
} from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";

const StudentPermission = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetPermissionStudentQuery();

  const students = data?.data || [];

  return (
    <>
      <UserProfile heading="Student Permission" />

      <div>
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-blue-400 border-dashed rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading student permissions...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center text-red-600 font-medium py-4">
            Error: {error?.data?.message || "Something went wrong."}
          </div>
        )}

        {/* No Data */}
        {!isLoading && !isError && students.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            No student permissions found.
          </div>
        )}

        {/* Student Permission List */}
        {students.length > 0 && (
          <div>
       

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => (
                <div
                  key={student._id || index}
                  className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-xl transition"
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      PRN: {student.prkey || "N/A"}
                    </p>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Remark:</span>{" "}
                      {student.permissionDetails?.remark || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Approved By:</span>{" "}
                      {student.permissionDetails?.approved_by || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Upload Date:</span>{" "}
                      {student.permissionDetails?.uploadDate
                        ? new Date(student.permissionDetails.uploadDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentPermission;


// import {
//   useGetPermissionStudentQuery,
//   // useGetLevelInterviewQuery,
//   // useGetLevelNumberQuery,
//   // useGetAdmittedStudentsByIdQuery,
// } from "../../redux/api/authApi";
// import UserProfile from "../common-components/user-profile/UserProfile";

// const StudentPermission = () => {
//   const {
//     data,
//     isLoading,
//     isError,
//     error,
//   } = useGetPermissionStudentQuery();
//   // const levelInterviewId = "YOUR_INTERVIEW_ID_HERE";
//   // const levelNo = 2; // example level number
//   // const admittedStudentId = "YOUR_ADMITTED_STUDENT_ID_HERE";

//   // // Query 1: Get level interview by ID
//   // const { data: interviewData, isLoading: interviewLoading, error: interviewError } =
//   //   useGetLevelInterviewQuery(levelInterviewId);

//   // // Query 2: Get level details by number
//   // const { data: levelData, isLoading: levelLoading, error: levelError } =
//   //   useGetLevelNumberQuery({ levelNo });

//   // // Query 3: Get admitted student by ID
//   // const { data: admittedStudentData, isLoading: admittedLoading, error: admittedError } =
//   //   useGetAdmittedStudentsByIdQuery(admittedStudentId);

//   // // Log responses to console
//   // console.log("Interview Data:", interviewData);
//   // console.log("Level Data:", levelData);
//   // console.log("Admitted Student Data:", admittedStudentData);

//   const students = data?.data || [];

//   return (
//     <>
//       <UserProfile heading="Student Permission" />

//       <div className="p-4">
//         {/* Loading State */}
//         {isLoading && <p>Loading student permissions...</p>}

//         {/* Error State */}
//         {isError && (
//           <p className="text-red-500">
//             Error: {error?.data?.message || "Something went wrong"}
//           </p>
//         )}

//         {/* No Data Found */}
//         {!isLoading && !isError && students.length === 0 && (
//           <p className="text-gray-500">No student permissions found.</p>
//         )}

//         {/* Student List */}
//         {students.length > 0 && (
//           <div className="mt-4">
//             <h3 className="text-xl font-semibold mb-2">Student Permissions</h3>
//             <ul className="space-y-2">
//               {students.map((student, index) => (
//                 <li key={student._id || index} className="p-3 bg-gray-100 rounded shadow">
//                   <p>
//                     <strong>Name:</strong>{" "}
//                     {student.firstName} {student.lastName}
//                   </p>
//                   <p>
//                     <strong>PRN:</strong> {student.prkey}
//                   </p>
//                   <p>
//                     <strong>Permission Remark:</strong>{" "}
//                     {student.permissionDetails?.remark || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Approved By:</strong>{" "}
//                     {student.permissionDetails?.approved_by || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Upload Date:</strong>{" "}
//                     {student.permissionDetails?.uploadDate
//                       ? new Date(student.permissionDetails.uploadDate).toLocaleDateString()
//                       : "N/A"}
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>

//       {/* <div className="p-6">
//         <h2 className="text-xl font-bold mb-4">Check Console for API Logs</h2>

//         {interviewLoading || levelLoading || admittedLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <p>Data fetched. Open the browser console to view details.</p>
//         )}

//         {interviewError && <p className="text-red-500">Error loading interview data</p>}
//         {levelError && <p className="text-red-500">Error loading level data</p>}
//         {admittedError && <p className="text-red-500">Error loading admitted student data</p>}
//       </div> */}
//     </>
//   );
// };

// export default StudentPermission;
