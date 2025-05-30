import {
  useGetPermissionStudentQuery, useGetLevelInterviewQuery,
  useGetLevelNumberQuery,
  useGetAdmittedStudentsByIdQuery,
} from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";

const StudentPermission = () => {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetPermissionStudentQuery();
  const levelInterviewId = "YOUR_INTERVIEW_ID_HERE";
  const levelNo = 2; // example level number
  const admittedStudentId = "YOUR_ADMITTED_STUDENT_ID_HERE";

  // Query 1: Get level interview by ID
  const { data: interviewData, isLoading: interviewLoading, error: interviewError } =
    useGetLevelInterviewQuery(levelInterviewId);

  // Query 2: Get level details by number
  const { data: levelData, isLoading: levelLoading, error: levelError } =
    useGetLevelNumberQuery({ levelNo });

  // Query 3: Get admitted student by ID
  const { data: admittedStudentData, isLoading: admittedLoading, error: admittedError } =
    useGetAdmittedStudentsByIdQuery(admittedStudentId);

  // Log responses to console
  console.log("Interview Data:", interviewData);
  console.log("Level Data:", levelData);
  console.log("Admitted Student Data:", admittedStudentData);

  const students = data?.data || [];

  return (
    <>
      <UserProfile heading="Student Permission" />

      <div className="p-4">
        {/* Loading State */}
        {isLoading && <p>Loading student permissions...</p>}

        {/* Error State */}
        {isError && (
          <p className="text-red-500">
            Error: {error?.data?.message || "Something went wrong"}
          </p>
        )}

        {/* No Data Found */}
        {!isLoading && !isError && students.length === 0 && (
          <p className="text-gray-500">No student permissions found.</p>
        )}

        {/* Student List */}
        {students.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Student Permissions</h3>
            <ul className="space-y-2">
              {students.map((student, index) => (
                <li key={student._id || index} className="p-3 bg-gray-100 rounded shadow">
                  <p>
                    <strong>Name:</strong>{" "}
                    {student.firstName} {student.lastName}
                  </p>
                  <p>
                    <strong>PRN:</strong> {student.prkey}
                  </p>
                  <p>
                    <strong>Permission Remark:</strong>{" "}
                    {student.permissionDetails?.remark || "N/A"}
                  </p>
                  <p>
                    <strong>Approved By:</strong>{" "}
                    {student.permissionDetails?.approved_by || "N/A"}
                  </p>
                  <p>
                    <strong>Upload Date:</strong>{" "}
                    {student.permissionDetails?.uploadDate
                      ? new Date(student.permissionDetails.uploadDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Check Console for API Logs</h2>

        {interviewLoading || levelLoading || admittedLoading ? (
          <p>Loading...</p>
        ) : (
          <p>Data fetched. Open the browser console to view details.</p>
        )}

        {interviewError && <p className="text-red-500">Error loading interview data</p>}
        {levelError && <p className="text-red-500">Error loading level data</p>}
        {admittedError && <p className="text-red-500">Error loading admitted student data</p>}
      </div>
    </>
  );
};

export default StudentPermission;
