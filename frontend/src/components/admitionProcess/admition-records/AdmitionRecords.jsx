import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ useNavigate import kiya
import back from "../../../assets/icons/back-icon.png";
import edit from "../../../assets/icons/edit-icon.png";
import { FiEdit } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";

const allStudents = [
  {
    name: "Ana Sha",
    fatherName: "John Sha",
    mobile: "8123456787",
    village: "Harda",
    course: "Iteg",
  },
  {
    name: "Ana Sha",
    fatherName: "John Sha",
    mobile: "8123456787",
    village: "Harda",
    course: "Iteg",
  },
  {
    name: "Rohan Das",
    fatherName: "Mohan Das",
    mobile: "9123456789",
    village: "Kannod",
    course: "B.Tech",
  },
  {
    name: "Priya Mehta",
    fatherName: "Shyam Mehta",
    mobile: "7023456789",
    village: "Satwas",
    course: "MBA",
  },
  {
    name: "Raj Gupta",
    fatherName: "Amit Gupta",
    mobile: "8523456789",
    village: "Narsullaganj",
    course: "B.Sc",
  },
  {
    name: "Sita Verma",
    fatherName: "Harish Verma",
    mobile: "9623456789",
    village: "Khategaon",
    course: "M.Tech",
  },
];

const AdmitionRecords = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ useNavigate hook ka use kiya
  const params = new URLSearchParams(location.search);
  const selectedLocation = params.get("location");

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filteredStudents = allStudents.filter(
      (student) => student.village === selectedLocation
    );
    setStudents(filteredStudents);
  }, [selectedLocation]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-[85vw]">
      <div className="flex items-center mb-6">
        <img
          className="w-4 mr-5"
          src={back}
          alt="back"
          onClick={() => navigate(-1)}
        />
        {/* <IoArrowBack className="text-2xl cursor-pointer mr-2 text-gray-600 hover:text-gray-800 transition" />{" "} */}
        <h2 className="text-2xl font-semibold ">
          {selectedLocation} Registration
        </h2>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-200 rounded">
            Show Entries
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded">Download</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded">
            <FaTrash />
          </button>
        </div>
        <div className="relative w-full md:w-64 flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded p-2 w-full pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IoSearchOutline className="absolute right-3 text-gray-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">S. No.</th>
              <th className="p-3">Name</th>
              <th className="p-3">Father's Name</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Village</th>
              <th className="p-3">Course</th>
              <th className="p-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student, index) => (
                <tr
                  key={index}
                  className="border-t bg-white hover:bg-gray-100 transition"
                >
                  <td className="p-3 text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="p-3 text-center">{index + 1}</td>
                  <td className="p-3 text-center">{student.name}</td>
                  <td className="p-3 text-center">{student.fatherName}</td>
                  <td className="p-3 text-center">{student.mobile}</td>
                  <td className="p-3 text-center">{student.village}</td>
                  <td className="p-3 text-center">{student.course}</td>
                  <td className="p-3 flex justify-center">
                    <img
                      className="w-4 cursor-pointer text-blue-600 hover:text-blue-800 transition"
                      onClick={() =>
                        navigate("/student-profile", { state: { student } })
                      }
                      src={edit}
                      alt="edit"
                    />
                    {/* <FiEdit
                      className="cursor-pointer text-blue-600 hover:text-blue-800 transition"
                      onClick={() =>
                        navigate("/student-profile", { state: { student } })
                      }
                    /> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-600">
                  No students found for {selectedLocation}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-600">Showing {students.length} entries</p>
        <button className="px-4 py-2 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
};

export default AdmitionRecords;
