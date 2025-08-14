import { useEffect } from "react";
import Table from "../components/tables/Table";
// import Student from "../components/data/Student";
import { useGetAllStudentsQuery } from "../../redux/api/authApi";
const columns = [
  { key: "sno", label: "S.No" },
  { key: "profile", label: "Profile" },
  { key: "name", label: "Name" },
  { key: "father", label: "Father" },
  { key: "mobile", label: "Mobile" },
  { key: "course", label: "Course" },
  { key: "village", label: "Village" },
];

// const StudentList = () => {
//   return (
//     <div className="w-full h-screen flex flex-col px-6 py-4 bg-[#f9fbfd] overflow-hidden">
//       <h2 className="text-xl font-semibold mb-4">1st Year Student Profiles</h2>
//       <div className="flex-1 overflow-y-auto">
//         <Table
//          columns={columns}
//          data={Student}
//          searchable
//          filterable
//          editable
//          pagination
//       />
//       </div>
//     </div>
//   );
// };


const StudentList = () => {
  const { data = [], isLoading, error, refetch } = useGetAllStudentsQuery(undefined, {
    pollingInterval: 2000,       // auto-refetch every 2 seconds
    refetchOnFocus: true         // refetch when user returns to the tab
  });

  useEffect(() => {
    // warning hataane ke liye ek bar refetch call kar diya
    refetch();
  }, [refetch]);

  // Filter out students who have permission details (dummy students)
  const activeStudents = data.filter(student => {
    return !student.permissionDetails || 
           (typeof student.permissionDetails === 'object' && 
            Object.keys(student.permissionDetails).length === 0);
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching students</p>;

  return (
    <div className="w-full h-screen flex flex-col px-6 py-4 bg-[#f9fbfd] overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">1st Year Student Profiles</h2>
      <div className="flex-1 overflow-y-auto">
        <Table
          columns={columns}
          data={activeStudents}
          searchable
          filterable
          editable
          pagination
        />
      </div>
    </div>
  );
};



export default StudentList;
