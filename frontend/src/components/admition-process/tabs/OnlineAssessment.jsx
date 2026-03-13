import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import Avatar from "../../common-components/Avatar";

const OnlineAssessment = ({ data, toTitleCase, scheduleButton, searchTerm, rowsPerPage, onRowClick }) => {
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
