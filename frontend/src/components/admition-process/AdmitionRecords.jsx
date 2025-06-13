import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import back from "../../assets/icons/back-icon.png";
import del from "../../assets/icons/delete-icon.png";
import edit from "../../assets/icons/edit-icon.png";
import { IoSearchOutline } from "react-icons/io5";
import UserProfile from "../common-components/user-profile/UserProfile";

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
  const navigate = useNavigate();
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
    <>
      <div className="w-full flex justify-end px-4">
        <UserProfile />
      </div>
      <div className="p-5 w-[80vw] ">
        <div className="bg-white h-50 p-9 rounded-lg">
          <div className=" ">
            <div className="flex items-center mb-6">
              <img
                className="w-5 cursor-pointer"
                src={back}
                alt="back"
                onClick={() => navigate(-1)}
              />
              <h2 className="text-2xl font-semibold ml-4">
                {selectedLocation} Registration
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
                    <th className="p-3">S.No</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Father</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Village</th>
                    <th className="p-3 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={index} className="border-t hover:bg-gray-100">
                        <td className="p-3 text-center">
                          <input type="checkbox" />
                        </td>
                        <td className="p-3">{index + 1}</td>
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
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-gray-200 rounded">1</button>
                <button className="px-3 py-2 bg-gray-200 rounded">2</button>
                <button className="px-3 py-2 bg-gray-200 rounded">...</button>
                <button className="px-3 py-2 bg-gray-200 rounded">10</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdmitionRecords;
