import { useState } from "react";
import Pagination from "../common-components/pagination/Pagination";
import {
  useGetReadyStudentsForPlacementQuery,
} from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import profile from "../../assets/images/profileImgDummy.jpeg";

const PlacementReadyStudents = () => {
  const { data = {} } = useGetReadyStudentsForPlacementQuery();
  const students = data?.data || [];

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectedPercentages, setSelectedPercentages] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const columns = [
    {
      key: "profile",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={row.image || profile}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">{`${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-gray-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    { key: "fatherName", label: "Father Name" },
    {
      key: "studentMobile",
      label: "Mobile no.",
      render: (row) => `+91 ${row.studentMobile}`,
    },
    { key: "techno", label: "Technology" },
    { key: "course", label: "Course" },
  ];

  const actionButton = (student) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedStudent(student);
        setIsModalOpen(true);
      }}
      className="bg-[#FFAA2C] text-white px-3 py-1.5 text-sm font-medium rounded hover:bg-[#ff9d0c]"
    >
      Add Interview
    </button>
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Placement Workflow</h2>

      <div className="flex gap-6 mb-4 border-b text-sm font-medium text-gray-600">
        <button className="pb-2 border-b-2 border-black text-black">Qualified Students</button>
        <button className="pb-2">Ongoing Interviews</button>
        <button className="pb-2">Selected Student</button>
      </div>

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
        data={students}
        editable={true}
        pagination={true}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        actionButton={actionButton}
      />

      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={selectedStudent?._id}
      />
    </div>
  );
};

export default PlacementReadyStudents;
