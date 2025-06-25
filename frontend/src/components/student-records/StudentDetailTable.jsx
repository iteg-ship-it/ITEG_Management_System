import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../common-components/pagination/Pagination";
import {
  // useAdmitedStudentsQuery,
  // useGetAllStudentsByLevelQuery,
  useGetLevelNumberQuery
} from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import edit from "../../assets/icons/edit-fill-icon.png";
import interview from "../../assets/icons/interview-icon.png";
import CreateInterviewModal from "./CreateInterviewModal";

const StudentDetailTable = () => {
  // const { data = [], isLoading, refetch } = useAdmitedStudentsQuery();
  const location = useLocation();
  const selectedLevel = location.state?.level || null;
  console.log("🚀 ~ file: StudentDetailTable.jsx:10 ~ StudentDetailTable ~ selectedLevel:", selectedLevel);
  const { data = [], isLoading, refetch } = useGetLevelNumberQuery(selectedLevel);
  const navigate = useNavigate();
  console.log("🚀 ~ file: StudentDetailTable.jsx:11 ~ StudentDetailTable ~ data:", data);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const toTitleCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const filtersConfig = [
    {
      title: "Track",
      options: ["Harda", "Kannod", "Khategaon", "Nemawar"],
      selected: selectedTracks,
      setter: setSelectedTracks,
    },
    {
      title: "Result",
      options: ["Pass", "Fail"],
      selected: selectedResults,
      setter: setSelectedResults,
    },
    {
      title: "Interview",
      options: ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"],
      selected: selectedPercentages,
      setter: setSelectedPercentages,
    },
  ];

  const enhancedData = data.map((student) => {
    const passedLevels = (student.level || []).filter(
      (lvl) => lvl.result === "Pass"
    );
    const latestPassedLevel =
      passedLevels.length > 0
        ? passedLevels[passedLevels.length - 1].levelNo
        : "1A";

    return {
      ...student,
      latestLevel: latestPassedLevel,
    };
  });

  const filteredData = enhancedData.filter((student) => {
    const matchesSearch =
      searchTerm === "" ||
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrack =
      selectedTracks.length === 0 ||
      selectedTracks.some(
        (track) => track.toLowerCase() === (student.track || "").toLowerCase()
      );

    const matchesResult =
      selectedResults.length === 0 || selectedResults.includes(student.result);

    const matchesPercentage =
      selectedPercentages.length === 0 ||
      selectedPercentages.some((range) => {
        const [min, max] = range.split("-").map((v) => parseFloat(v));
        return (
          student.interviewPercentage >= min &&
          student.interviewPercentage <= max
        );
      });

    const matchesLevel =
      !selectedLevel || student.latestLevel === selectedLevel;

    return (
      matchesSearch &&
      matchesTrack &&
      matchesResult &&
      matchesPercentage &&
      matchesLevel
    );
  });

  const columns = [
    {
      key: "fullName",
      label: "Full Name",
      render: (row) => toTitleCase(`${row.firstName} ${row.lastName}`),
    },
    { key: "fatherName", label: "Father's Name" },
    { key: "studentMobile", label: "Mobile" },
    { key: "course", label: "Course" },
    { key: "latestLevel", label: "Level" },
    { key: "village", label: "Village" },
  ];

  const actionButton = (student) => (
    <>
      <button
        onClick={() => {
          setSelectedStudentId(student._id);
          setShowModal(true);
        }}
        className="px-3 py-1 rounded"
      >
        <img src={interview} alt="interview-icon" className="w-5 h-5" />
      </button>
      <button
        onClick={() =>
          navigate(`/student-profile/${student._id}`, { state: { student } })
        }
        className="px-3 py-1 rounded"
      >
        <img src={edit} alt="edit-icon" className="w-5 h-5" />
      </button>
    </>
  );

  return (
    <>
      {selectedLevel && (
        <div className="px-10 pb-5 text-md text-gray-700">
          Showing students of <strong>Level {selectedLevel}</strong>
        </div>
      )}
      <div className="border bg-white shadow-sm rounded-lg px-5">
        <Pagination
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtersConfig={filtersConfig}
        />
      </div>
      <CommonTable
        columns={columns}
        data={filteredData}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        isLoading={isLoading}
        actionButton={actionButton}
      />
      <CreateInterviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        studentId={selectedStudentId}
        refetchStudents={refetch} // 🔁 passed here
      />
    </>
  );
};

export default StudentDetailTable;
