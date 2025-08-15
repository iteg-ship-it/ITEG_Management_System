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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Interview Rounds
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-[#FDA92D]  text-white rounded-md hover:bg-orange-600 transition"
                >
                  Add Interview
                </button>
              </div>

              {interviews.length === 0 ? (
                <p className="text-gray-500">No interview records available.</p>
              ) : (
                <div className="space-y-4">
                  {interviews.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="bg-gray-100 border border-gray-300 rounded-xl p-5 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-blue-600">
                          {item.round} Round
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        <Detail label="Attempt No." value={item.attemptNo} />
                        <Detail
                          label="Communication"
                          value={item.communication}
                        />
                        <Detail label="Confidence" value={item.confidence} />
                        <Detail
                          label="Subject Knowledge"
                          value={item.subjectKnowlage}
                        />
                        <Detail label="Maths" value={item.maths} />
                        <Detail label="Reasoning" value={item.reasoning} />
                        <Detail label="Sincerity" value={item.sincerity} />
                        <Detail label="Goal" value={item.goal} />
                        <Detail label="Marks" value={item.marks} />
                        <Detail label="Result" value={item.result} />
                      </div>
                      {item.remark && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Remark:</span>{" "}
                          {item.remark}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                      className="px-5 py-2 bg-[#FDA92D]  text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center"
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

const Detail = ({ label, value }) => (
  <div>
    <span className="text-gray-600 font-semibold">{label}</span>
    <div className="text-gray-900">{value}</div>
  </div>
);

export default AdmissionEditPage;
