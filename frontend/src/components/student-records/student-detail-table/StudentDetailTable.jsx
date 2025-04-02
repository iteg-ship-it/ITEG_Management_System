import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import back from "../../../assets/icons/back-icon.png";
import del from "../../../assets/icons/delete-icon.png";
import edit from "../../../assets/icons/edit-icon.png";
import { IoSearchOutline } from "react-icons/io5";

const allStudents = [
  {
    name: "Ana Sha",
    fatherName: "John Sha",
    mobile: "8123456787",
    village: "Harda",
    course: "Iteg",
    year: "1st Year",
    profilePhoto: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Rohan Das",
    fatherName: "Mohan Das",
    mobile: "9123456789",
    village: "Kannod",
    course: "B.Tech",
    year: "2nd Year",
    profilePhoto: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Priya Mehta",
    fatherName: "Shyam Mehta",
    mobile: "7023456789",
    village: "Satwas",
    course: "MBA",
    year: "3rd Year",
    profilePhoto: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    name: "Raj Gupta",
    fatherName: "Amit Gupta",
    mobile: "8523456789",
    village: "Narsullaganj",
    course: "B.Sc",
    year: "1st Year",
    profilePhoto: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
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

  return (
    <div className="p-6 w-[85vw]">
      <div className="bg-white shadow-md p-10 rounded-lg">
        <div className="flex items-center mb-6">
          <img
            className="w-5 cursor-pointer"
            src={back}
            alt="back"
            onClick={() => navigate(-1)}
          />
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

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 text-center">
                  <input type="checkbox" />
                </th>
                <th className="p-3 text-center">S.No</th>
                <th className="p-3">Profile</th>
                <th className="p-3 text-center">Name</th>
                <th className="p-3 text-center">Father</th>
                <th className="p-3 text-center">Mobile</th>
                <th className="p-3 text-center">Course</th>
                <th className="p-3 text-center">Village</th>
                <th className="p-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {students.length > 0 ? (
                students
                  .filter((student) =>
                    student.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((student, index) => (
                    <tr key={index} className="border-t hover:bg-gray-100">
                      <td className="p-3 text-center">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <img
                          src={student.profilePhoto}
                          alt={student.name}
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{student.fatherName}</td>
                      <td className="p-3">{student.mobile}</td>
                      <td className="p-3">{student.course}</td>
                      <td className="p-3">{student.village}</td>
                      <td className="p-3 flex justify-center">
                        <img
                          className="w-5 cursor-pointer"
                          src={edit}
                          alt="edit"
                          onClick={() =>
                            navigate("/student-edit-profile", {
                              state: { student },
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-4 text-gray-600">
                    No students found for {selectedYear}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
  );
};

export default StudentDetailTable;
