import Table from "../components/Table";

const studentData = [
  {
    sno: 1,
    name: "Nguyen, Shane",
    father: "Cooper, Kristin",
    mobile: "9139344421",
    course: "BCA 1st",
    village: "Harda",
  },
  {
    sno: 2,
    name: "Flores, Juanita",
    father: "Flores, Juanita",
    mobile: "9139834421",
    course: "BBA 1st",
    village: "Khatgaon",
  },
  // ...more rows
];

const columns = [
  { key: "sno", label: "S.no" },
  { key: "name", label: "Name" },
  { key: "father", label: "Father" },
  { key: "mobile", label: "Mobile" },
  { key: "course", label: "Course" },
  { key: "village", label: "Village" },
];

const StudentProfiles = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">1st Year Students Profiles</h1>
      <Table
        columns={columns}
        data={studentData}
        searchable
        selectable
        editable
        pagination
      />
    </div>
  );
};

export default StudentProfiles;
