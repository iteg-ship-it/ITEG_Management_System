import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import SearchBox from "./../../common-components/seach-export/SearchBox";

const OnlineAssessment = ({ data, toTitleCase, scheduleButton, searchTerm, setSearchTerm, rowsPerPage, onRowClick }) => {
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
  ];

  const actionButton = (row) => (
    <button
      onClick={() => scheduleButton(row)}
      className={`text-md ${buttonStyles.primary}`}
    >
      Take Interview
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageNavbar
          title="Online Assessment"
          subtitle="Students pending for technical interview"
          showBackButton={false}
        />
        <div className="w-80 ml-auto">
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>
      <CommonTable
        data={data}
        columns={columns}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        actionButton={actionButton}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default OnlineAssessment;
