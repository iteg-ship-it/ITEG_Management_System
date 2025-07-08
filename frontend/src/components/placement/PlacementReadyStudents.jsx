/* PlacementReadyStudents.jsx */
import { useState } from "react";
import Pagination from "../common-components/pagination/Pagination";
import {
  useGetReadyStudentsForPlacementQuery,
} from "../../redux/api/authApi";
import CommonTable from "../common-components/table/CommonTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal"; // ✅ Correct import
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
      key: "fullName",
      label: "Full Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.profile || profile}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-gray-800">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    
    { key: "course", label: "Course" },
    { key: "techno", label: "Technology" },
    { key: "studentMobile", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "gender", label: "Gender" },
    { key: "stream", label: "Stream" },
  ];

  const actionButton = (student) => (
    <button
      onClick={() => {
        setSelectedStudent(student);
        setIsModalOpen(true);
      }}
      className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
    >
      Interview
    </button>
  );

  return (
    <>
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

      {/* Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={selectedStudent?._id} // ✅ send only _id
      />
    </>
  );
};

export default PlacementReadyStudents;
