import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import back from "../../../assets/icons/back-icon.png";
import del from "../../../assets/icons/delete-icon.png";
import edit from "../../../assets/icons/edit-icon.png";
import { IoSearchOutline } from "react-icons/io5";
import UserProfile from "../../common-components/user-profile/UserProfile";
import CommonTable from "../../common-components/table/CommonTable";

const allStudents = [
  {
    id: "1",
    name: "Ana Sha",
    fatherName: "John Sha",
    mobile: "8123456787",
    village: "Harda",
    course: "Iteg",
    year: "1st Year",
    profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "2",
    name: "Rohan Das",
    fatherName: "Mohan Das",
    mobile: "9123456789",
    village: "Kannod",
    course: "B.Tech",
    year: "2nd Year",
    profilePhoto: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    name: "Priya Mehta",
    fatherName: "Shyam Mehta",
    mobile: "7023456789",
    village: "Satwas",
    course: "MBA",
    year: "3rd Year",
    profilePhoto: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: "4",
    name: "Raj Gupta",
    fatherName: "Amit Gupta",
    mobile: "8523456789",
    village: "Narsullaganj",
    course: "B.Sc",
    year: "1st Year",
    profilePhoto: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: "5",
    name: "Sita Verma",
    fatherName: "Harish Verma",
    mobile: "9623456789",
    village: "Khategaon",
    course: "M.Tech",
    year: "2nd Year",
    profilePhoto: "https://randomuser.me/api/portraits/women/5.jpg",
  },
];

const StudentDetailTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const selectedYear = queryParams.get("year") || "Unknown Year";

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filteredStudents = allStudents.filter(
      (student) => student.year === selectedYear
    );
    setStudents(filteredStudents);
  }, [selectedYear]);

  const openStudentProfile = (student) => {
    navigate(`/student-profile/${student.id}`, { state: { student } });
  };

  return (
    <>
      <div className="w-full flex justify-between px-4">
        <div className="flex items-center mb-6">
          <img
            className="w-5 cursor-pointer"
            src={back}
            alt="back"
            onClick={() => navigate(-1)}
          />
        </div>
        <UserProfile />
      </div>

      <div className="p-6 w-[80vw]">
        <div className="bg-white shadow-md p-10 rounded-lg">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-semibold ml-4">
              {selectedYear} Student Details
            </h2>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <button className="px-4 py-2 border border-dark rounded">
                Download
              </button>
              <button className="px-4 py-2 bg-red-200 text-white rounded shadow">
                <img src={del} alt="delete icon" />
              </button>
            </div>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="border rounded p-2 w-full pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoSearchOutline className="absolute right-3 top-3 text-gray-500" />
            </div>
          </div>

          <CommonTable
            data={students}
            searchTerm={searchTerm}
            onRowClick={openStudentProfile}
            columnsToShow={[
              "profilePhoto",
              "name",
              "fatherName",
              "mobile",
              "course",
              "village",
            ]}
            extraColumn={{
              header: "Edit",
              render: (student) => (
                <img
                  className="w-5 cursor-pointer mx-auto"
                  src={edit}
                  alt="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/student-edit-profile", {
                      state: { student },
                    });
                  }}
                />
              ),
            }}
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-gray-600">Showing {students.length} entries</p>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-gray-200 rounded">1</button>
              <button className="px-3 py-2 bg-gray-200 rounded">2</button>
              <button className="px-3 py-2 bg-gray-200 rounded">...</button>
              <button className="px-3 py-2 bg-gray-200 rounded">10</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDetailTable;
