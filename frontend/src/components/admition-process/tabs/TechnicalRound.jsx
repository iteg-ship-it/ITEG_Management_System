import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import SearchBox from "./../../common-components/seach-export/SearchBox";

const TechnicalRound = ({ data, toTitleCase, scheduleButton, handleGetStatus, handleGetMarks, searchTerm, setSearchTerm, rowsPerPage, onRowClick }) => {
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
      key: "course",
      label: "Course",
      render: (row) => toTitleCase(row.course),
    },
    {
      key: "onlineTestResult",
      label: (
        <div className="flex flex-col ">
          <span>Result</span>
          <span className="text-xs text-gray-500">(1st Round)</span>
        </div>
      ),
      render: (row) => handleGetStatus(row.interviews),
    },
    {
      key: "techMarks",
      label: (
        <div className="flex flex-col ">
          <span>Marks</span>
          <span className="text-xs text-gray-500">(1st Round)</span>
        </div>
      ),
      align: "center",
      render: (row) => handleGetMarks(row.interviews),
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
          title="Technical Round"
          subtitle="Students eligible for technical interview"
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

export default TechnicalRound;
