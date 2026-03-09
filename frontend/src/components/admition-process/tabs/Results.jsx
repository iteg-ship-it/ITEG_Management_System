import { AiFillStop } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import SearchBox from "./../../common-components/seach-export/SearchBox";

const Results = ({ data, toTitleCase, getLatestInterviewResult, searchTerm, setSearchTerm, rowsPerPage, onRowClick }) => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageNavbar
          title="Results"
          subtitle="Final admission results - Selected and Rejected students"
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

export default Results;
