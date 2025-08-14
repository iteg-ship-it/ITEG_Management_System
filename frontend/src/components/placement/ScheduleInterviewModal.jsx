/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useFormik } from "formik";
import * as Yup from "yup";
import { useAddPlacementInterviewRecordMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { useState } from "react";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const ScheduleInterviewModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  const interviewSchema = Yup.object().shape({
    companyName: Yup.string().required("Required"),
    hrEmail: Yup.string().email("Invalid email").required("Required"),
    contactNumber: Yup.string().required("Required"),
    positionOffered: Yup.string().required("Required"),
    requiredTechnology: Yup.string().required("Required"),
    interviewDate: Yup.string().required("Required"),
    location: Yup.string().required("Required"),
    jobType: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      companyName: "",
      hrEmail: "",
      contactNumber: "",
      positionOffered: "",
      requiredTechnology: "",
      interviewDate: "",
      location: "",
      jobType: "Internship",
    },
    validationSchema: interviewSchema,
    onSubmit: async (values, actions) => {
      try {
        if (!studentId) {
          alert("Student ID missing!");
          return;
        }

        await addInterviewRecord({
          studentId,
          interviewData: values,
        }).unwrap();

        toast.success("Interview added successfully");
        actions.resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Failed to submit interview", err);
        toast.error(err?.data?.message || "Failed to add interview");
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-lg p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-semibold text-center mb-6"
          style={{ color: PRIMARY_COLOR }}
        >
          Company Interview Details
        </h2>

        <form
          onSubmit={formik.handleSubmit}
          className="grid grid-cols-2 gap-4 text-[15px]"
          style={{ color: TEXT_COLOR }}
        >
          {/* Row 1 */}
          <div className="relative">
            <input
              type="text"
              name="companyName"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.companyName}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Company Name
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              name="hrEmail"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.hrEmail}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Hr. Email
            </label>
          </div>

          {/* Row 2 */}
          <div className="relative">
            <input
              type="text"
              name="contactNumber"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.contactNumber}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Contact Number
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              name="positionOffered"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.positionOffered}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Position Offered
            </label>
          </div>

          {/* Job Type */}
          <div className="flex items-center gap-6">
            {["Internship", "Job"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jobType"
                  value={type}
                  checked={formik.values.jobType === type}
                  onChange={formik.handleChange}
                  className="hidden"
                />
                <span className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                  {formik.values.jobType === type && (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#FDA92D" }}
                    ></span>
                  )}
                </span>
                {type}
              </label>
            ))}
          </div>

          {/* Required Technology */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTechDropdown(!showTechDropdown)}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-black  w-full text-left flex items-center justify-between peer ${showTechDropdown ? 'border-black' : 'border-gray-300'}`}
            >
              <span className={formik.values.requiredTechnology ? 'text-gray-900' : 'text-transparent'}>
                {formik.values.requiredTechnology || ' '}
              </span>
              <span className="ml-2">▼</span>
            </button>
            <label className={`absolute left-3 transition-all duration-200 ${formik.values.requiredTechnology ? '-top-2 left-2 text-xs bg-white px-1 text-black' : 'top-3 text-gray-500'}`}>
              Required Technology
            </label>
            {showTechDropdown && (
              <div
                className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden"
                style={{
                  background: `
                    linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
                    linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
                    white
                  `
                }}
              >
                {['Java', 'React', 'Node.js', 'Python'].map((tech) => (
                  <div
                    key={tech}
                    onClick={() => {
                      formik.setFieldValue('requiredTechnology', tech);
                      setShowTechDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview Date & Time */}
          <input
            type="datetime-local"
            name="interviewDate"
            onChange={formik.handleChange}
            value={formik.values.interviewDate}
            className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
          />

          {/* Location */}
          <div className="relative">
            <input
              type="text"
              name="location"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.location}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-[#FDA92D] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
              Company Location
            </label>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-4 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-40 h-12 rounded-md text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;