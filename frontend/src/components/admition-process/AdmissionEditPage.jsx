/* eslint-disable react/prop-types */
import { useState } from "react";
import { Formik, Form } from "formik";
import SelectInput from "../common-components/common-feild/SelectInput";
import RadioGroup from "../common-components/common-feild/RadioGroup";
import InputField from "../common-components/common-feild/InputField";
import { interviewSchema } from "../../validationSchema";
import UserProfile from "../common-components/user-profile/UserProfile";
import { useGetStudentByIdQuery } from "../../redux/api/authApi";
import { useParams } from "react-router-dom";

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full mb-4 border rounded-lg shadow-md border-b-4">
      <button
        className="w-full text-left px-4 py-3 bg-slate-100 font-semibold flex justify-between items-center"
        onClick={() => setOpen(!open)}
        type="button"
      >
        {title}
        <span className="text-xl">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
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
    fatherName: data?.data.fatherName || "",
    studentMobile: data?.data.studentMobile || "",
    parentMobile: data?.data.parentMobile || "",
    gender: data?.data.gender || "",
    dob: data?.data.dob || "",
    aadharCard: data?.data.aadharCard || "",
    address: data?.data.address || "",
    track: data?.data.track || "",
    village: data?.data.village || "",
    stream: data?.data.stream || "",
    course: data?.data.course || "",
    category: data?.data.category || "",
    subject12: data?.data.subject12 || "",
    year12: data?.data.year12 || "",
    itegrInterviewFlag: data?.data.itegInterviewFlag || false,
    admissionStatus: data?.data.admissionStatus || false,
    interviewStage: data?.data.interviewStage || "",
    interviews: data?.data.interviews || [],
  };

  const handleSubmit = (values) => {
    console.log("Form submitted with data:", values);
    // Implement your update logic here (e.g., call an API to update the student data)
  };

  return (
    <>
      <UserProfile showBackButton heading="Student edit page" />

      <div className="mx-auto">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={interviewSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              {/* Section 1: Personal Info */}
              <Section title="Personal Information">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-7">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="First Name"
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    placeholder="Last Name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <InputField
                    label="Contact Number"
                    name="contact"
                    placeholder="Contact Number"
                    value={values.studentMobile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <InputField
                    label="Father's Name"
                    name="fatherName"
                    placeholder="Father's Name"
                    value={values.fatherName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <SelectInput
                    label="Gender"
                    name="gender"
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <SelectInput
                    label="Select Track"
                    name="track"
                    options={[
                      { value: "track1", label: "Track 1" },
                      { value: "track2", label: "Track 2" },
                      { value: "Gopalpur", label: "Gopalpur" },
                      { value: "Narshullaganj", label: "Narshullaganj" },
                    ]}
                    value={values.track}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    as="textarea"
                    placeholder="Address"
                    className="input col-span-2 md:col-span-1"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </Section>

              {/* Section 2: Academic */}
              <Section title="Academic Information">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="12th Subject"
                    name="subject12"
                    placeholder="12th Subject"
                    value={values.subject12}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <InputField
                    label="12th %"
                    name="percent12"
                    placeholder="12th %"
                    value={values.year12}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <InputField
                    label="10th %"
                    name="percent10"
                    placeholder="10th %"
                  />
                  <InputField
                    label="Passed Out Year"
                    name="passOut"
                    type="date"
                  // value={values.year10}
                  // onChange={handleChange}
                  // onBlur={handleBlur}
                  />
                  <RadioGroup
                    label="Course"
                    name="courseOrDiploma"
                    options={[
                      { value: "Graduation", label: "Graduation" },
                      { value: "Diploma", label: "Diploma" },
                    ]}
                    className="col-span-1 md:col-span-2"
                  // value={values.courseDeg}
                  // onChange={handleChange}
                  // onBlur={handleBlur}
                  />

                </div>
              </Section>

              {/* Section 3: Interview Result */}
              <Section title="Interview Result">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Marks"
                    name="marks"
                    type="number"
                    placeholder="Marks"
                  />
                  <InputField
                    label="Remark"
                    name="remark"
                    placeholder="Enter Remark"
                  />
                  <InputField
                    label="Attempt"
                    name="attempt"
                    type="number"
                    placeholder="Attempt"
                  />
                  <InputField
                    label="Date of Exam"
                    name="examDate"
                    type="date"
                  />
                  <div className="flex items-center gap-4">
                    <label className="font-medium">Result</label>
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-500 text-black rounded-md"
                      onClick={() => setFieldValue("result", "Pass")}
                    >
                      Pass
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-slate-200 text-black rounded-md"
                      onClick={() => setFieldValue("result", "Fail")}
                    >
                      Fail
                    </button>
                  </div>
                </div>
              </Section>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                  onClick={() => {
                    console.log("Rejected student ID:", id);
                    alert(`Rejected student ${id}`);
                  }}
                >
                  Reject
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition"
                >
                  Select
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default AdmissionEditPage;
