import {
  useGetPermissionStudentQuery,
} from "../../redux/api/authApi";

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

