/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { useAddPlacementInterviewRecordMutation } from "../../../redux/api/authApi";
import BlurBackground from "../../shared/BlurBackground";

const inputClass = "h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none";

const ScheduleInterviewModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();

  const formik = useFormik({
    initialValues: {
      companyName: "",
      hrEmail: "",
      hrContact: "",
      location: "",
      jobProfile: "",
      scheduleDate: "",
    },
    validationSchema: Yup.object({
      companyName: Yup.string().trim().required("Company name is required"),
      hrEmail: Yup.string().trim().email("Invalid email").required("HR email is required"),
      hrContact: Yup.string().trim().matches(/^[0-9]{10}$/, "Enter 10 digit contact").required("HR contact is required"),
      location: Yup.string().trim().required("Location is required"),
      jobProfile: Yup.string().trim().required("Job profile is required"),
      scheduleDate: Yup.string().required("Date and time is required"),
    }),
    onSubmit: async (values, actions) => {
      try {
        if (!studentId) {
          toast.error("Student ID missing");
          return;
        }

        await addInterviewRecord({
          studentId,
          interviewData: {
            companyName: values.companyName.trim(),
            hrEmail: values.hrEmail.trim(),
            hrContact: values.hrContact.trim(),
            location: values.location.trim(),
            jobProfile: values.jobProfile.trim(),
            scheduleDate: new Date(values.scheduleDate).toISOString(),
          },
        }).unwrap();

        toast.success("Interview scheduled successfully");
        actions.resetForm();
        onClose();
        onSuccess?.();
      } catch (error) {
        toast.error(error?.data?.message || error?.data?.error || "Failed to schedule interview");
      }
    },
  });

  useEffect(() => {
    if (!isOpen) formik.resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  const field = (name, placeholder, type = "text") => (
    <div>
      <input
        {...formik.getFieldProps(name)}
        type={type}
        placeholder={placeholder}
        className={inputClass}
      />
      {formik.touched[name] && formik.errors[name] && (
        <p className="mt-1 text-xs text-red-500">{formik.errors[name]}</p>
      )}
    </div>
  );

  return (
    <BlurBackground isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full max-w-[522px] rounded-2xl bg-white px-8 py-8 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 transition hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        <h2 className="mb-6 text-center text-2xl font-semibold text-[#FDA92D]">
          Company Interview Details
        </h2>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4">
          {field("companyName", "Company Name")}
          {field("hrEmail", "HR Email", "email")}
          {field("hrContact", "HR Contact", "tel")}
          {field("location", "Location")}
          {field("jobProfile", "Job Profile")}

          <div className="relative">
            <input
              {...formik.getFieldProps("scheduleDate")}
              type="datetime-local"
              className={`${inputClass} pr-10 ${formik.values.scheduleDate ? "" : "text-gray-500"}`}
            />
            <FaCalendarAlt className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" />
            {formik.touched.scheduleDate && formik.errors.scheduleDate && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.scheduleDate}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="col-span-2 mt-3 h-11 rounded-md bg-[#FDA92D] text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-60"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </BlurBackground>
  );
};

export default ScheduleInterviewModal;
