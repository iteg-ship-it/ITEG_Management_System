import { buttonStyles } from "../../../styles/buttonStyles";

const OnlineAssessment = ({ data, toTitleCase, scheduleButton }) => {
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

  return { columns, actionButton };
};

export default OnlineAssessment;
