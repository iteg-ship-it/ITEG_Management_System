import { useGetAllStudentsQuery } from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import { useEffect, useState } from "react";
// import edit from "../../assets/icons/edit-fill-icon.png";
import CustomTimeDate from "./CustomTimeDate";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";

const toTitleCase = (str) =>
  str?.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

const StudentList = () => {
  const { data = [], isLoading, error, refetch } = useGetAllStudentsQuery();
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Total Registration");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [atemendNumber, setAtemendNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Filter states per tab
  const [trackFilterTab1, setTrackFilterTab1] = useState([]);
  const [resultFilterTab2, setResultFilterTab2] = useState([]);
  const [percentageFilterTab2, setPercentageFilterTab2] = useState([]);
  const [statusFilterTab3, setStatusFilterTab3] = useState([]);

  const tabFilterConfig = {
    "Total Registration": [
      {
        title: "Track",
        options: ["Harda", "Kannod", "Khategaon"],
        selected: trackFilterTab1,
        setter: setTrackFilterTab1,
      },
    ],
    "Online Assessment": [
      {
        title: "Result",
        options: ["Pass", "Fail"],
        selected: resultFilterTab2,
        setter: setResultFilterTab2,
      },
      {
        title: "Interview",
        options: ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"],
        selected: percentageFilterTab2,
        setter: setPercentageFilterTab2,
      },
    ],
    "Technical Round": [
      {
        title: "Tech Status",
        options: ["Pass", "Fail"],
        selected: statusFilterTab3,
        setter: setStatusFilterTab3,
      },
    ],
  };

  const filtersConfig = tabFilterConfig[activeTab] || [];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromURL = searchParams.get("tab");
    const savedTab = localStorage.getItem("admissionActiveTab");

    if (tabFromURL) {
      setActiveTab(tabFromURL);
      localStorage.setItem("admissionActiveTab", tabFromURL);
    } else if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [location.search]);

  const getLatestInterviewResult = (interviews = []) => {
    if (!interviews.length) return null;
    return [...interviews].sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.result;
  };

  const matchTabCondition = (student) => {
    const latestResult = getLatestInterviewResult(student.interviews);
    const hasInterviews = student.interviews?.length > 0;
    const firstRound = student.interviews?.filter((i) => i.round === "First");
    const secondRound = student.interviews?.filter((i) => i.round === "Second");

    switch (activeTab) {
      case "Online Assessment":
        return student.onlineTest?.result === "Pending" && (!hasInterviews || firstRound.length === 0);
      case "Technical Round":
        return firstRound.length > 0 && firstRound.some((i) => i.result === "Pending" || i.result === "Fail");
      case "Final Round":
        return firstRound.some((i) => i.result === "Pass") && !secondRound.some((i) => i.result === "Pass");
      case "Selected":
        return secondRound.some((i) => i.result === "Pass");
      case "Rejected":
        return latestResult === "Fail" || secondRound.some((i) => i.result === "Fail");
      default:
        return true;
    }
  };

  const filteredData = data.filter((student) => {
    const searchableValues = Object.values(student)
      .map((val) => String(val ?? "").toLowerCase())
      .join(" ");
    if (!searchableValues.includes(searchTerm.toLowerCase())) return false;

    const track = toTitleCase(student.track || "");
    const latestResult = toTitleCase(getLatestInterviewResult(student.interviews || []) || "");
    const percentage = parseFloat(student.percentage);

    const matches = filtersConfig.every(({ title, selected }) => {
      if (selected.length === 0) return true;
      if (title === "Track") return selected.includes(track);
      if (title === "Result" || title === "Tech Status") return selected.includes(latestResult);
      if (title === "Interview") {
        return selected.some((range) => {
          const [min, max] = range.replace("%", "").split("-").map(Number);
          return percentage >= min && percentage <= max;
        });
      }
      return true;
    });

    return matches && matchTabCondition(student);
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("admissionActiveTab", tab);
  };

  const scheduleButton = (student) => {
    const numberOfAttempted = student?.interviews?.filter(item => item.round === "First") || [];
    setSelectedStudentId(student._id);
    setAtemendNumber(numberOfAttempted.length);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudentId(null);
    setAtemendNumber(null);
    setIsModalOpen(false);
  };

  // const handleEditClick = (studentId) => {
  //   navigate(`/admission/edit/${studentId}`);
  // };

  const handleGetOnlineMarks = (onlineTest = {}) => {
    const result = onlineTest?.result;
    const classes = "px-3 py-1 rounded-xl text-sm font-medium";
    switch (result) {
      case "Pass": return <span className={`bg-green-100 text-green-700 ${classes}`}>Pass</span>;
      case "Fail": return <span className={`bg-red-100 text-red-700 ${classes}`}>Fail</span>;
      default: return <span className={`bg-gray-100 text-gray-700 ${classes}`}>{toTitleCase(result) || "Not Attempted"}</span>;
    }
  };

  const handleGetMarks = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    return roundData?.[roundData.length - 1]?.marks || 0;
  };

  const handleGetStatus = (interviews = []) => {
    const roundData = interviews?.filter((i) => i?.round === "First");
    const result = roundData?.[roundData.length - 1]?.result;
    const classes = "px-3 py-1 rounded-xl text-sm font-medium";
    switch (result) {
      case "Pass": return <span className={`bg-green-100 text-green-700 ${classes}`}>Pass</span>;
      case "Fail": return <span className={`bg-red-100 text-red-700 ${classes}`}>Fail</span>;
      default: return <span className={`bg-gray-100 text-gray-700 ${classes}`}>{toTitleCase(result) || "Not Attempted"}</span>;
    }
  };

  const tabs = [
    "Total Registration",
    "Online Assessment",
    "Technical Round",
    "Final Round",
    "Selected",
    "Rejected",
  ];

  let columns = [];
  let actionButton;

  switch (activeTab) {
    case "Online Assessment":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "12th Subject", render: (row) => toTitleCase(row.stream) },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "village", label: "Marks", render: (row) => toTitleCase(row.village) },
        { key: "stream", label: "Status", render: (row) => handleGetOnlineMarks(row.onlineTest) },
      ];
      actionButton = (row) => (
        <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
          Take interview
        </button>
      );
      break;

    case "Technical Round":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "onlineTestStatus", label: "Status of Written", render: (row) => handleGetOnlineMarks(row.onlineTest) },
        { key: "techMarks", label: "Marks of Tech", render: (row) => handleGetMarks(row.interviews) },
        { key: "techStatus", label: "Status of Tech", render: (row) => handleGetStatus(row.interviews) },
      ];
      actionButton = (row) => (
        <button onClick={() => scheduleButton(row)} className="bg-orange-500 text-white px-3 py-1 rounded">
          Take interview
        </button>
      );
      break;

    case "Final Round":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "onlineTestStatus", label: "Status of Written", render: (row) => handleGetOnlineMarks(row.onlineTest) },
        { key: "techMarks", label: "Marks of Tech", render: (row) => handleGetMarks(row.interviews) },
        { key: "stream", label: "Attempts of tech", render: (row) => handleGetMarks(row.interviews) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => {
            localStorage.setItem("studdedntDetails", JSON.stringify(row));
            navigate(`/interview-detail/${row._id}?tab=${activeTab}`);
          }}
          className="bg-orange-400 text-white font-semibold px-3 py-1 rounded hover:bg-orange-500"
        >
          Interviews Detail
        </button>
      );
      break;

    case "Selected":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "onlineTestStatus", label: "Status of Written", render: (row) => handleGetOnlineMarks(row.onlineTest) },
        { key: "techMarks", label: "Marks of Tech", render: (row) => handleGetMarks(row.interviews) },
        { key: "stream", label: "Attempts of tech", render: (row) => handleGetMarks(row.interviews) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Send confirmation to ${row.firstName}`)}
          className="bg-green-300 text-green-700 font-semibold px-3 py-1 rounded"
        >
          Selected
        </button>
      );
      break;

    case "Rejected":
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "Subject", render: (row) => toTitleCase(row.stream) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
        { key: "track", label: "Track", render: (row) => toTitleCase(row.track) },
      ];
      actionButton = (row) => (
        <button
          onClick={() => alert(`Review ${row.firstName}'s case again`)}
          className="bg-red-300 text-red-700 px-3 py-1 rounded"
        >
          Reject
        </button>
      );
      break;

    default:
      columns = [
        { key: "firstName", label: "Full Name", render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`) },
        { key: "fatherName", label: "Father's Name", render: (row) => toTitleCase(row.fatherName) },
        { key: "studentMobile", label: "Mobile" },
        { key: "stream", label: "12th Subject", render: (row) => toTitleCase(row.stream) },
        { key: "course", label: "Course", render: (row) => toTitleCase(row.course) },
        { key: "village", label: "Village", render: (row) => toTitleCase(row.village) },
        { key: "track", label: "Bus Route", render: (row) => toTitleCase(row.track) },
      ];
    // actionButton = (row) => (
    //   <button onClick={() => handleEditClick(row._id)}>
    //     <img src={edit} alt="edit-icon" className="w-5 h-5" />
    //   </button>
    // );
    // break;
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching students.</p>;

  return (
    <>
      <h1 className="text-2xl pt-1 font-semibold">Admission Process</h1>
      <div className="mt-5 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-6">
          <div className="flex gap-6 mt-4">
            {tabs.map((tab) => (
              <p
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer pb-2 border-b-2 ${activeTab === tab ? "border-orange-400 font-semibold" : "border-gray-200"
                  }`}
              >
                {tab}
              </p>
            ))}
          </div>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Pagination
              rowsPerPage={rowsPerPage}
              // setRowsPerPage={setRowsPerPage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtersConfig={filtersConfig}
              filteredData={filteredData}
            />
          </div>
        </div>

        <CommonTable
          data={filteredData}
          columns={columns}
          editable={!!actionButton} // true only if actionButton exists
          pagination={true}
          rowsPerPage={rowsPerPage}
          searchTerm={searchTerm}
          actionButton={actionButton}
        />
      </div>

      {isModalOpen && selectedStudentId && (
        <CustomTimeDate
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          studentId={selectedStudentId}
          attempted={atemendNumber}
          refetch={refetch}
        />
      )}
    </>
  );
};

export default StudentList;
