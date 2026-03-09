import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import SearchBox from "./../../common-components/seach-export/SearchBox";

const TotalRegistration = ({ data, toTitleCase, searchTerm, setSearchTerm, rowsPerPage, onRowClick }) => {
  const columns = [
    {
      key: "firstName",
      label: "Full Name",
      render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
    },
    {
      key: "fatherName",
      label: "Father's Name",
      render: (row) => toTitleCase(row.fatherName),
    },
    { key: "studentMobile", label: "Mobile No.", align: "center" },
    {
      key: "subject12",
      label: "12th Subject",
      render: (row) => toTitleCase(row.stream),
    },
    {
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course),
    },
    {
      key: "village",
      label: "Village",
      render: (row) => toTitleCase(row.village),
    },
    {
      key: "track",
      label: "Bus Route",
      render: (row) => toTitleCase(row.track),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageNavbar
          title="Total Registration"
          subtitle="View all registered students"
          showBackButton={false}
        />
        <div className="w-80 ml-auto">
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>
      <CommonTable
        data={data}
        columns={columns}
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default TotalRegistration;
