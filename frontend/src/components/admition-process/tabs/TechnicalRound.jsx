import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Avatar from "../../common-components/Avatar";

const TechnicalRound = ({ data, toTitleCase, scheduleButton, handleGetStatus, handleGetMarks, searchTerm, rowsPerPage, onRowClick }) => {
  const columns = [
    {
      key: "firstName",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.profileImage} />
          <span>{toTitleCase(`${row.firstName} ${row.lastName}`)}</span>
        </div>
      ),
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
