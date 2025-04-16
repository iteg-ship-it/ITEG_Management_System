import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import back from "../../../assets/icons/back-icon.png";

import {
  // FaUserGraduate,
  // FaBars,
  // FaTimes,
  FaCamera,
  // FaClipboardList,
  // FaBriefcase,
} from "react-icons/fa";
//import uploadImageToCloudinary from './helper/uploadImage'

const StudentEditPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const studentData = location.state?.student || {}; // Default empty object to prevent errors

  const [formData, setFormData] = useState({
    firstName: studentData.name || "",
    lastName: "",
    contactNumber: studentData.mobile || "",
    fatherName: studentData.fatherName || "",
    gender: "",
    track: studentData.course || "",
    address: studentData.village || "",
    "12th Subject": "",
    "12th Percentage": "",
    "10th Percentage": "",
    passoutYear: "",
    courseType: "Course",
    itegLevels: [],
    permission: false,
    permissionReason: "",
    placed: false,
    companyName: "",
    placementDate: "",
    imageSrc:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prevData) => ({ ...prevData, imageSrc: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "itegLevels") {
      setFormData((prevData) => ({
        ...prevData,
        itegLevels: checked
          ? [...prevData.itegLevels, value]
          : prevData.itegLevels.filter((level) => level !== value),
      }));
    } else if (type === "checkbox" || type === "radio") {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };
  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.contactNumber.match(/^\d{10}$/))
      newErrors.contactNumber = "Enter a valid 10-digit number";
    if (!formData.fatherName)
      newErrors.fatherName = "Father's name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.track) newErrors.track = "Track is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.twelfthSubject)
      newErrors.twelfthSubject = "12th subject is required";
    if (!formData.twelfthPercentage.match(/^\d{1,2}(\.\d{1,2})?$/))
      newErrors.twelfthPercentage = "Enter a valid percentage";
    if (!formData.tenthPercentage.match(/^\d{1,2}(\.\d{1,2})?$/))
      newErrors.tenthPercentage = "Enter a valid percentage";
    if (!formData.passoutYear.match(/^\d{4}$/))
      newErrors.passoutYear = "Enter a valid year";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <div className="w-[80vw] px-8 py-5 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-7">
        <img
          className="h-5 cursor-pointer"
          src={back}
          alt="back"
          onClick={() => navigate(-1)}
        />
        <h3 className="text-xl font-bold">Student Profile</h3>
      </div>

      {/* <button className="absolute top-4 right-4 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-lg"> */}
      <button
        type="button"
        className="absolute top-4 right-8 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-lg"
      >
        {" "}
        Save
      </button>
      {/* <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-lg"
          >
            Save
          </button>
         
        </div> */}
      <div className="flex items-center space-x-4 mt-4">
        <div
          className="relative w-40 h-40 rounded-full border-3 border-dotted border-orange-500 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            className="w-full h-full rounded-full object-cover border border-dashed border-orange-500 p-3"
            src={imageSrc}
            alt="Profile"
          />
          {/* Camera Icon */}
          <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 transform translate-x-1/40 translate-y-1/50">
            <FaCamera className="text-white text-lg" />
          </div>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <h3 className="mt-6 text-2xl font-semibold">Personal Information</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(formData)
            .slice(0, 7)
            .map((key) => (
              <label key={key} className="block font-medium">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={` ${key
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()}`}
                  className="p-3 border text-sm border-gray-300 bg-slate-50 rounded-xl w-full"
                />
                {errors[key] && (
                  <p className="text-red-500 text-sm">{errors[key]}</p>
                )}
              </label>
            ))}
        </div>

        {/* Academic Details */}
        <h3 className="mt-6 text-2xl font-semibold">Academic Details</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(formData)
            .slice(7, 10)
            .map((key) => (
              <label key={key} className="block font-medium">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={` ${key
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()}`}
                  className="p-3 border border-gray-300 bg-slate-50 rounded-lg w-full"
                />
                {errors[key] && (
                  <p className="text-red-500 text-sm">{errors[key]}</p>
                )}
              </label>
            ))}
        </div>

        {/* Course Selection */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="block font-medium">
            12th Passout Year
            <input
              type="text"
              name="passoutYear"
              value={formData.passoutYear}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              className="p-3 border border-gray-300 bg-slate-50 rounded-lg w-full"
            />
            {errors.passoutYear && (
              <p className="text-red-500 text-sm">{errors.passoutYear}</p>
            )}
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="courseType"
                value="Course"
                checked={formData.courseType === "Course"}
                onChange={handleChange}
                className="mr-2 accent-red-600"
              />{" "}
              Course
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="courseType"
                value="Diploma"
                checked={formData.courseType === "Diploma"}
                onChange={handleChange}
                className="mr-2 accent-red-600"
              />{" "}
              Diploma
            </label>
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-semibold">Iteg Levels</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            "1A Level",
            "1B Level",
            "1C Level",
            "2A Level",
            "2B Level",
            "2C Level",
          ].map((level) => (
            <label key={level} className="inline-flex items-center">
              <input
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-xl focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                name="itegLevels"
                value={level}
                checked={formData.itegLevels.includes(level)}
                onChange={handleChange}
              />
              <span className="ml-2">{level}</span>
            </label>
          ))}
        </div>

        <h3 className="mt-6 text-2xl font-semibold">Permission</h3>
        <div className="flex items-center mt-4">
          <label className="inline-flex items-center">
            <input
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-xl focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              name="permission"
              checked={formData.permission}
              onChange={handleChange}
            />
            <span className="ml-2">Permission</span>
          </label>
          {formData.permission && (
            <input
              type="text"
              name="permissionReason"
              value={formData.permissionReason}
              onChange={handleChange}
              placeholder="Reason..."
              className="ml-4 p-2 border rounded-lg"
            />
          )}
        </div>

        <h3 className="mt-6 text-2xl font-semibold">Placed</h3>
        <div className="flex items-center mt-4">
          <label className="inline-flex items-center">
            <input
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-xl focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              name="placed"
              checked={formData.placed}
              onChange={handleChange}
            />
            <span className="ml-2">Placed</span>
          </label>
        </div>
        {formData.placed && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              className="p-2 border rounded-lg"
            />
            <input
              type="date"
              name="placementDate"
              value={formData.placementDate}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-lg"
          >
            Reject
          </button>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg"
          >
            Select
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEditPage;
