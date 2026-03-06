import { AiFillStop } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";

const Results = ({ data, toTitleCase, getLatestInterviewResult }) => {
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
      key: "stream",
      label: "Subject",
      render: (row) => toTitleCase(row.stream),
    },
    {
      key: "village",
      label: "Village",
      render: (row) => toTitleCase(row.village),
    },
    {
      key: "track",
      label: "Track",
      render: (row) => toTitleCase(row.track),
    },
  ];

  const actionButton = (row) => {
    const secondRound = row.interviews?.filter((i) => i.round === "Second") || [];
    const latestResult = getLatestInterviewResult(row.interviews);
    const isSelected = secondRound.some((i) => i.result === "Pass");
    const isRejected = latestResult === "Fail" || secondRound.some((i) => i.result === "Fail");

    if (isSelected) {
      return (
        <button
          className="bg-[#22C55E]/20 flex items-center gap-2 text-md text-[#118D57] px-3 py-1 rounded-md cursor-not-allowed"
          disabled
        >
          <FaCheckCircle className="text-lg" />
          <span>Selected</span>
        </button>
      );
    } else if (isRejected) {
      return (
        <button
          className="bg-[#FFCEC3] flex items-center gap-2 text-md text-[#D32F2F] px-3 py-1 rounded-md cursor-not-allowed"
          disabled
        >
          <AiFillStop className="text-lg" />
          <span>Rejected</span>
        </button>
      );
    } else {
      return null;
    }
  };

  return { columns, actionButton };
};

export default Results;
