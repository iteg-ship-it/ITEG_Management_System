// // import { useGetPermissionStudentQuery } from "../../redux/api/authApi";
// import UserProfile from "../common-components/user-profile/UserProfile";

// const StudentPermission = () => {
//   // const [] = useGetPermissionStudentQuery
//   return (
//     <>
//       <UserProfile heading="Student Permission" />
//       <h3>student permission</h3>
//     </>
//   );
// };

// export default StudentPermission;



import { useGetPermissionStudentQuery } from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";

const StudentPermission = () => {
 const { data, isLoading, isError, error } = useGetPermissionStudentQuery();
console.log({ data, isLoading, isError, error });

  return (
    <>
      <UserProfile heading="Student Permission" />

      <div className="p-4">
        {isLoading && <p>Loading student permissions...</p>}

        {isError && (
          <p className="text-red-500">
            Error: {error?.data?.message || "Something went wrong"}
          </p>
        )}

        {data && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Student Permissions</h3>
            <ul className="space-y-2">
              {data.map((item, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded shadow">
                  <p>
                    <strong>Name:</strong> {item.name}
                  </p>
                  <p>
                    <strong>Permission Type:</strong> {item.permissionType}
                  </p>
                  <p>
                    <strong>Status:</strong> {item.status}
                  </p>
                  {/* You can customize the fields according to your API response */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentPermission;
