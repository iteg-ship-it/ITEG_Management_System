import UserProfile from "../../common-components/user-profile/UserProfile";
import { useAdmitedStudentsQuery } from "../../../redux/api/authApi";

const StudentPermission = () => {
  return (
    <>
      <UserProfile heading="Permission Students" />
      <StudentList />
    </>
  );
};

export default StudentPermission;
const StudentList = () => {
  const { data, error, isLoading } = useAdmitedStudentsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching students.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Student List</h2>
      <ul className="list-disc pl-6 space-y-2">
        {data.map((student) => (
          <li key={student._id} className="text-gray-700">
            <strong>{student.fullName}</strong> <br />
            <span className="text-sm text-gray-500">
              Admission Ref: {student.admissionRef}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
