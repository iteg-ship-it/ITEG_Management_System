/* eslint-disable react/prop-types */
import { useState} from "react";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import {
  useGetStudentByIdQuery,
  useGetInterviewDetailByIdQuery,
  useInterviewCreateMutation,
} from "../../redux/api/authApi";
import InputField from "../common-components/common-feild/InputField";
import CustomDropdown from "../common-components/common-feild/CustomDropdown";
import { HiChevronUp, HiChevronDown} from "react-icons/hi";
import Loader from "../common-components/loader/Loader";
import * as Yup from "yup";
import { toast } from "react-toastify";
import PageNavbar from "../common-components/navbar/PageNavbar";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full mb-6 rounded-lg border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-t-lg"
      >
        {title}
        <span>{open ? <HiChevronUp /> : <HiChevronDown />}</span>
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

const MetricCard = ({ icon, label, value, isTotal = false }) => (
  <div className={`${isTotal ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-lg">{icon}</span>
      <span className={`text-2xl font-bold ${isTotal ? 'text-red-600' : 'text-gray-800'}`}>
        {value || 'N/A'}
      </span>
    </div>
    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
      {label}
    </div>
  </div>
);

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
    refetch,
  } = useGetInterviewDetailByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 15000, // Poll every 15 seconds
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createInterview, { isLoading: isSubmitting }] =
    useInterviewCreateMutation();

  const validationSchema = Yup.object().shape({
    round: Yup.string().required("Required"),
    remark: Yup.string().required("Remark is required"),
    result: Yup.string().required("Result is required"),
  });

  const handleInterviewSubmit = async (values, { resetForm }) => {
    try {
      await createInterview({ ...values, studentId: id }).unwrap();
      toast.success("Interview created successfully");
      setIsModalOpen(false);
      resetForm();
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create interview");
    }
  };

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
    // Add update logic here
  };

  return (
    <div className="w-full">
      <PageNavbar 
        title="Student Profile" 
        subtitle="View and manage student admission details"
      />
      <div className="px-4 py-2">

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            {/* Personal Info */}
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--backgroundColor)]">
                <InputField
                  name="firstName"
                  label="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="lastName"
                  label="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="studentMobile"
                  label="Contact Number"
                  value={values.studentMobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="fatherName"
                  label="Father's Name"
                  value={values.fatherName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <CustomDropdown
                  name="gender"
                  label="Gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                  value={values.track}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                  options={[
                    { label: "Harda", value: "Harda" },
                    { label: "Rehti", value: "Rehti" },
                    { label: "Khategaon", value: "Khategaon" },
                  ]}
                />
                <InputField
                  name="address"
                  as="textarea"
                  label="Address"
                  value={values.address}
                  disabled
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
              </div>
            </Section>

            {/* Academic Info */}
            <Section title="Academic Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--backgroundColor)]">
                <InputField
                  name="subject12"
                  label="12th Subject"
                  value={values.subject12}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="percent12"
                  label="12th %"
                  value={values.percent12}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="percent10"
                  label="10th %"
                  value={values.percent10}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
                <InputField
                  name="year12"
                  label="Passout Year"
                  value={values.year12}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled
                />
              </div>
            </Section>

            {/* Interview History */}
            <Section title="Interview History">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Interview Rounds
                    </h3>
                  </div>
                  {interviews.length >= 2 && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-[#FDA92D] to-orange-500 text-white rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Interview</span>
                    </button>
                  )}
                </div>

                {interviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No interview records available</p>
                    <p className="text-gray-400 text-sm mt-1">Click &quot;Add Interview&quot; to create the first record</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {interviews.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{item.round} Round</h3>
                              <p className="text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(item.date).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <ResultBadge result={item.result} />
                        </div>

                        {/* Performance Metrics */}
                        <div className="mb-6">
                          <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700">Performance Metrics</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard icon="💬" label="COMMUNICATION" value={item.communication} />
                            <MetricCard icon="🔥" label="CONFIDENCE" value={item.confidence} />
                            <MetricCard icon="📚" label="SUBJECT KNOWLEDGE" value={item.subjectKnowlage} />
                            <MetricCard icon="🔢" label="MATHEMATICS" value={item.maths} />
                            <MetricCard icon="🧠" label="REASONING" value={item.reasoning} />
                            <MetricCard icon="✅" label="SINCERITY" value={item.sincerity} />
                            <MetricCard icon="🎯" label="GOAL CLARITY" value={item.goal} />
                            <MetricCard icon="🏆" label="TOTAL MARKS" value={item.marks} isTotal={true} />
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex justify-between items-start">
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="flex items-center mb-1">
                              <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              <span className="text-sm font-semibold text-blue-700">Attempt Number</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-800">{item.attemptNo}</span>
                          </div>

                          {item.remark && (
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded flex-1 ml-4">
                              <div className="flex items-center mb-2">
                                <svg className="w-4 h-4 text-orange-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm font-semibold text-orange-700">Interviewer Remarks</span>
                              </div>
                              <p className="text-gray-700">{item.remark}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          </Form>
        )}
      </Formik>

      {/* Modal UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <h2 className="text-xl font-bold text-center text-orange-500 mb-6">
              Add Interview
            </h2>
            <Formik
              initialValues={{
                round: "Second",
                remark: "",
                result: "Pending",
              }}
              validationSchema={validationSchema}
              onSubmit={handleInterviewSubmit}
            >
              {() => (
                <Form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <CustomDropdown
                    label="Round"
                    name="round"
                    disabled
                    options={[{ value: "Second", label: "Final Round" }]}
                  />
                  <InputField label="Remark" name="remark" />
                  <CustomDropdown
                    label="Result"
                    name="result"
                    options={[
                      { value: "Pass", label: "Pass" },
                      { value: "Fail", label: "Fail" },
                      { value: "Pending", label: "Pending" },
                    ]}
                  />
                  <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-[#FDA92D] text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="ml-2">Submitting...</span>
                        </>
                      ) : "Submit"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};



export default AdmissionEditPage;
