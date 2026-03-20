/* eslint-disable react/prop-types */
import { useState } from "react";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import {
  useGetStudentByIdQuery,
  useGetInterviewDetailByIdQuery,
} from "../../redux/api/authApi";
import InputField from "../common-components/common-feild/InputField";
import CustomDropdown from "../common-components/common-feild/CustomDropdown";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import Loader from "../common-components/loader/Loader";
import Header from "../common-components/sidebar/Header";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full mb-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 rounded-t-xl transition"
      >
        {title}
        <span className="text-gray-500">{open ? <HiChevronUp size={20} /> : <HiChevronDown size={20} />}</span>
      </button>
      {open && <div className="p-6 pt-2">{children}</div>}
    </div>
  );
};

const ResultBadge = ({ result }) => {
  const getResultStyle = (result) => {
    switch (result?.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'fail':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 ${getResultStyle(result)}`}>
      {result?.toLowerCase() === 'pass' && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      <span>{result || 'Pending'}</span>
    </div>
  );
};

const AdmissionEditPage = () => {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useGetStudentByIdQuery(id);
  const {
    data: interviewData,
    isLoading: interviewLoading,
    error: interviewError,
  } = useGetInterviewDetailByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 15000,
  });

  if (isLoading || interviewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError || interviewError) {
    return (
      <div className="text-center text-red-600 font-semibold py-6">
        Error loading student data:{" "}
        {error?.data?.message || "Something went wrong!"}
      </div>
    );
  }

  const interviews = interviewData?.interviews || [];
  const studentData = data?.data;

  const initialValues = {
    firstName: studentData?.firstName || "",
    lastName: studentData?.lastName || "",
    studentMobile: studentData?.studentMobile || "",
    fatherName: studentData?.fatherName || "",
    gender: studentData?.gender || "",
    track: studentData?.track || "",
    address: studentData?.address || "",
    subject12: studentData?.subject12 || "",
    percent12: studentData?.percent12 || "",
    percent10: studentData?.percent10 || "",
    year12: studentData?.year12 || "",
    interviewMarks: studentData?.interviewMarks || "",
    result: studentData?.result || "",
  };

  const handleSubmit = (values) => {
    console.log("Updated data:", values);
  };

  return (
    <>
    <Header 
    title="Student Detail"
    breadcrumbs={[
      { label: "Admission Process", path: "/admission-process" },
      { label: "Details", path: null },
    ]}
    />
      <div className="w-full">
        <div className="py-2 p-5">
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange }) => (
              <Form className="space-y-6">
                {/* Personal Info */}
                <Section title="Personal Information">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputField
                      name="firstName"
                      label="First Name"
                      value={values.firstName}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="lastName"
                      label="Last Name"
                      value={values.lastName}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="studentMobile"
                      label="Contact Number"
                      value={values.studentMobile}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="fatherName"
                      label="Father's Name"
                      value={values.fatherName}
                      onChange={handleChange}
                      disabled
                    />
                    <CustomDropdown
                      name="gender"
                      label="Gender"
                      variant="card"
                      disabled
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Other", value: "other" },
                      ]}
                    />
                    <CustomDropdown
                      name="track"
                      label="Track"
                      variant="card"
                      disabled
                      options={[
                        { label: "Harda", value: "Harda" },
                        { label: "Rehti", value: "Rehti" },
                        { label: "Khategaon", value: "Khategaon" },
                      ]}
                    />
                    <InputField
                      name="address"
                      type="textarea"
                      label="Address"
                      value={values.address}
                      disabled
                      onChange={handleChange}
                      className="md:col-span-3"
                    />
                  </div>
                </Section>

                {/* Academic Info */}
                <Section title="Academic Information">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputField
                      name="subject12"
                      label="12th Subject"
                      value={values.subject12}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="percent12"
                      label="12th Percentage"
                      value={values.percent12}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="year12"
                      label="12th Year"
                      value={values.year12}
                      onChange={handleChange}
                      disabled
                    />
                    <InputField
                      name="percent10"
                      label="10th Percentage"
                      value={values.percent10}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </Section>

                {/* Interview Section */}
                <Section title="Interview Details">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        name="interviewMarks"
                        label="Interview Marks"
                        value={values.interviewMarks}
                        onChange={handleChange}
                        disabled
                      />
                      <div className="flex items-end">
                        <ResultBadge result={values.result} />
                      </div>
                    </div>

                    {interviews.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Interview History</h3>
                        <div className="space-y-3">
                          {interviews.map((interview, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-700">Round {interview.round}</span>
                                <ResultBadge result={interview.result} />
                              </div>
                              <p className="text-sm text-gray-600">{interview.remark}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default AdmissionEditPage;
