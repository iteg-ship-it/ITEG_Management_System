import { useEffect, useState } from "react";
import CommonTable from "../common-components/table/CommonTable";
import Pagination from "../common-components/pagination/Pagination";
import { useGetAllStudentsQuery } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";

const columns = [
  { 
    key: "profile", 
    label: "Profile", 
    render: (row) => (
      <img src={row.profile} alt="profile" className="w-10 h-10 rounded-full object-cover" />
    )
  },
  { key: "name", label: "Name" },
  { key: "father", label: "Father" },
  { key: "mobile", label: "Mobile" },
  { key: "course", label: "Course" },
  { key: "village", label: "Village" },
];

const StudentList = () => {
  const { data = [], isLoading, error, refetch } = useGetAllStudentsQuery(undefined, {
    pollingInterval: 2000,
    refetchOnFocus: true
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const activeStudents = data.filter(student => {
    return !student.permissionDetails || 
           (typeof student.permissionDetails === 'object' && 
            Object.keys(student.permissionDetails).length === 0);
  });

  if (isLoading) return <Loader />;
  if (error) return <p className="text-center text-red-500 mt-10">Error fetching students</p>;

  return (
    <div className="w-full flex flex-col px-6 py-4 bg-[var(--backgroundColor)]">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">1st Year Student Profiles</h2>
      
      <div className="mb-4">
        <Pagination
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredData={activeStudents}
          selectedRows={selectedRows}
          allData={activeStudents}
          sectionName="students"
        />
      </div>

      <CommonTable
        columns={columns}
        data={activeStudents}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
};

export default StudentList;
