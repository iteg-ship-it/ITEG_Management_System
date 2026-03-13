import { buttonStyles } from "../../../styles/buttonStyles";
import CommonTable from "../../common-components/table/CommonTable";
import PageNavbar from "../../common-components/navbar/PageNavbar";
import Avatar from "../../common-components/Avatar";

const FinalRound = ({ data, toTitleCase, setAddInterviwModalOpen, setId, handleGetStatus, handleGetMarks, searchTerm, rowsPerPage, onRowClick }) => {
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
      key: "onlineTestStatus",
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
          <span className="text-xs text-gray-500">(Tech Round)</span>
        </div>
      ),
      align: "center",
      render: (row) => handleGetMarks(row.interviews),
    },
    {
      key: "attempts",
      label: (
        <div className="flex flex-col ">
          <span>Attempts</span>
          <span className="text-xs text-gray-500">(1st Round)</span>
        </div>
      ),
      align: "center",
      render: (row) => {
        const firstRoundAttempts = row.interviews?.filter((i) => i.round === "First") || [];
        return firstRoundAttempts.length;
      },
    },
  ];

  const actionButton = (row) => {
    const userRole = localStorage.getItem('role');
    const isSuperAdmin = userRole === 'superadmin';

    return (
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (isSuperAdmin) {
              setAddInterviwModalOpen(true);
              setId(row._id);
            }
          }}
          disabled={!isSuperAdmin}
          className={`text-md ${isSuperAdmin
            ? buttonStyles.primary + ' cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed px-3 py-1 rounded-md transition'
            }`}
        >
          Take Interview
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PageNavbar
          title="Final Round"
          subtitle="Students qualified for final interview"
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

export default FinalRound;
