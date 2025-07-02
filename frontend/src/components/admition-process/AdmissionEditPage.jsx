/* eslint-disable react/prop-types */
import { useState } from "react";
import { Formik, Form } from "formik";
import { useParams } from "react-router-dom";
import { useGetStudentByIdQuery } from "../../redux/api/authApi";
import InputField from "../common-components/common-feild/InputField";
import SelectInput from "../common-components/common-feild/SelectInput";
import {
  HiChevronUp,
  HiChevronDown,
  HiArrowNarrowLeft,
} from "react-icons/hi";

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
        <span>{open ? <HiChevronUp/> : <HiChevronDown/>}</span>
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

const AdmissionEditPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetStudentByIdQuery(id);

  if (isLoading) return <p>Loading student data...</p>;
  if (isError) return <p>Error loading student data.</p>;

  const initialValues = {
    firstName: data?.data.firstName || "",
    lastName: data?.data.lastName || "",
    studentMobile: data?.data.studentMobile || "",
    fatherName: data?.data.fatherName || "",
    gender: data?.data.gender || "",
    track: data?.data.track || "",
    address: data?.data.address || "",
    subject12: data?.data.subject12 || "",
    percent12: data?.data.percent12 || "",
    percent10: data?.data.percent10 || "",
    passoutYear: data?.data.passoutYear || "",
    interviewMarks: data?.data.interviewMarks || "",
    result: data?.data.result || "",
  };

  const handleSubmit = (values) => {
    console.log("Updated data:", values);
    // Add update logic here
  };

  return (
    <div className="w-full px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
  <button
    type="button"
    onClick={() => window.history.back()}
    className="text-2xl text-gray-700 hover:text-gray-900"
  >
    <HiArrowNarrowLeft />
  </button>
  <h2 className="text-xl font-bold text-gray-800">Student Profile</h2>
</div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur}) => (
          <Form className="space-y-6">
            {/* Personal Info */}
            <Section className="bg-white" title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--backgroundColor)]">
                <InputField
                  name="firstName"
                  placeholder="First Name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="lastName"
                  placeholder="Last Name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="studentMobile"
                  placeholder="Contact Number"
                  value={values.studentMobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="fatherName"
                  placeholder="Father's Name"
                  value={values.fatherName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <SelectInput
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Other", value: "other" },
                  ]}
                />
                <SelectInput
                  name="track"
                  value={values.track}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: "Harda", value: "Harda" },
                    { label: "Rehti", value: "Rehti" },
                    { label: "Khategaon", value: "Khategaon" },
                  ]}
                />
                <InputField
                  name="address"
                  placeholder="Address"
                  as="textarea"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="col-span-3"
                />
              </div>
            </Section>

            {/* Academic Info */}
            <Section title="Academic Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--backgroundColor)] ">
                <InputField
                  name="subject12"
                  placeholder="12th Subject"
                  value={values.subject12}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="percent12"
                  placeholder="12th %"
                  value={values.percent12}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="percent10"
                  placeholder="10th %"
                  value={values.percent10}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="passoutYear"
                  placeholder="Passout Year"
                  value={values.passoutYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <SelectInput
                  name="track"
                  value={values.track}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: "Harda", value: "Harda" },
                    { label: "Rehti", value: "Rehti" },
                    { label: "Khategaon", value: "Khategaon" },
                  ]}
                />
              </div>
            </Section>

            {/* Interview History */}
            <Section title="Interview History">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--backgroundColor)] ">
                <InputField
                  name="interviewMarks"
                  placeholder="Marks"
                  value={values.interviewMarks}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <InputField
                  name="percent12"
                  placeholder="12th %"
                  value={values.percent12}
                  disabled
                />
                <InputField
                  name="percent10"
                  placeholder="10th %"
                  value={values.percent10}
                  disabled
                />
                <InputField
                  name="passoutYear"
                  placeholder="Passout Year"
                  value={values.passoutYear}
                  disabled
                />
                <SelectInput
                  name="track"
                  value={values.track}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={[
                    { label: "Harda", value: "Harda" },
                    { label: "Rehti", value: "Rehti" },
                    { label: "Khategaon", value: "Khategaon" },
                  ]}
                />
              </div>
            </Section>

            <div className="flex justify-end gap-4">
              {/* <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Reject
              </button>
              <button
                type="submit"
                className="bg-[#FF914D] px-6 py-2 text-white rounded-md hover:bg-orange-500"
              >
                Select
              </button> */}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AdmissionEditPage;
