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

  const interviewSchema = Yup.object().shape({
    companyName: Yup.string().required("Company name is required"),
    hrEmail: Yup.string().email("Invalid email").required("HR email is required"),
    contactNumber: Yup.string().required("Contact number is required"),
    positionOffered: Yup.string().required("Job profile is required"),
    requiredTechnology: Yup.string().required("Technology is required"),
    interviewDate: Yup.string().required("Interview date is required"),
    interviewTime: Yup.string().required("Interview time is required"),
    location: Yup.string().required("Location is required"),
    jobType: Yup.string().required("Job type is required"),
  });

  const formik = useFormik({
    initialValues: {
      companyName: "",
      hrEmail: "",
      contactNumber: "",
      positionOffered: "",
      requiredTechnology: "",
      interviewDate: "",
      interviewTime: "",
      location: "",
      jobType: "Internship",
    },
    validationSchema: interviewSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, actions) => {
      try {
        if (!studentId) {
          toast.error("Student ID is missing!");
          return;
        }

        // Validate all fields are filled
        const requiredFields = ['companyName', 'hrEmail', 'contactNumber', 'positionOffered', 'requiredTechnology', 'interviewDate', 'interviewTime', 'location'];
        const emptyFields = requiredFields.filter(field => !values[field] || values[field].trim() === '');
        
        if (emptyFields.length > 0) {
          toast.error(`Please fill in: ${emptyFields.join(', ')}`);
          return;
        }

        // Format data to match backend schema
        const formattedData = {
          companyName: values.companyName.trim(),
          jobProfile: values.positionOffered.trim(), // Map positionOffered to jobProfile
          scheduleDate: new Date(`${values.interviewDate}T${values.interviewTime}`).toISOString(), // Combine date and time
          location: values.location.trim(),
          hrEmail: values.hrEmail.trim(),
          contactNumber: values.contactNumber.trim(),
          requiredTechnology: values.requiredTechnology,
          jobType: values.jobType,
        };

        console.log('Submitting formatted data:', { studentId, interviewData: formattedData });

        const result = await addInterviewRecord({
          studentId,
          interviewData: formattedData,
        }).unwrap();

        console.log('Interview submission successful:', result);
        toast.success("Interview scheduled successfully!");
        actions.resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("API Error:", err);
        const errorMessage = err?.data?.message || err?.message || "Failed to schedule interview";
        toast.error(errorMessage);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        <h2
          className="text-2xl font-semibold text-center mb-6"
          style={{ color: PRIMARY_COLOR }}
        >
          Schedule Interview
        </h2>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.companyName}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.companyName && formik.errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.companyName}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="hrEmail"
              placeholder="HR Email *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.hrEmail}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.hrEmail && formik.errors.hrEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.hrEmail && formik.errors.hrEmail && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.hrEmail}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.contactNumber}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.contactNumber && formik.errors.contactNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.contactNumber && formik.errors.contactNumber && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.contactNumber}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="positionOffered"
              placeholder="Job Profile *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.positionOffered}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.positionOffered && formik.errors.positionOffered ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.positionOffered && formik.errors.positionOffered && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.positionOffered}</p>
            )}
          </div>

          <div>
            <select
              name="requiredTechnology"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.requiredTechnology}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.requiredTechnology && formik.errors.requiredTechnology ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Technology *</option>
              <option value="Java">Java</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="Angular">Angular</option>
              <option value="Vue.js">Vue.js</option>
              <option value="PHP">PHP</option>
              <option value="C#">C#</option>
            </select>
            {formik.touched.requiredTechnology && formik.errors.requiredTechnology && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.requiredTechnology}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium">Job Type *</label>
            <div className="flex items-center gap-6">
              {["Internship", "Job"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    value={type}
                    checked={formik.values.jobType === type}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-[#FDA92D] border-gray-300 focus:ring-[#FDA92D]"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <input
              type="date"
              name="interviewDate"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.interviewDate}
              min={new Date().toISOString().split('T')[0]}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.interviewDate && formik.errors.interviewDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.interviewDate && formik.errors.interviewDate && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.interviewDate}</p>
            )}
          </div>

          <div>
            <input
              type="time"
              name="interviewTime"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.interviewTime}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.interviewTime && formik.errors.interviewTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.interviewTime && formik.errors.interviewTime && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.interviewTime}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <input
              type="text"
              name="location"
              placeholder="Company Location *"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.location}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full ${
                formik.touched.location && formik.errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formik.touched.location && formik.errors.location && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.location}</p>
            )}
          </div>

          <div className="md:col-span-2 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-md text-white hover:opacity-90 transition disabled:opacity-50 font-medium"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {isLoading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;