import Table from "../components/tables/Table";
import Student from "../components/data/Student";

const columns = [
  { key: "sno", label: "S.No" },
  { key: "profile", label: "Profile" },
  { key: "name", label: "Name" },
  { key: "father", label: "Father" },
  { key: "mobile", label: "Mobile" },
  { key: "course", label: "Course" },
  { key: "village", label: "Village" },
];

const StudentList = () => {
  return (
    <div className="w-full h-screen flex flex-col px-6 py-4 bg-[#f9fbfd] overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">1st Year Student Profiles</h2>
      <div className="flex-1 overflow-y-auto">
        <Table
         columns={columns}
         data={Student}
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
