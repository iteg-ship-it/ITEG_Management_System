import { buttonStyles } from "../../../styles/buttonStyles";

const TechnicalRound = ({ data, toTitleCase, scheduleButton, handleGetStatus, handleGetMarks }) => {
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

  return { columns, actionButton };
};

export default TechnicalRound;
