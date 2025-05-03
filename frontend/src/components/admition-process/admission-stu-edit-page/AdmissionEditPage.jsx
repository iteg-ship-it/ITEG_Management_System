// src/pages/admission/AdmissionEditPage.js
import { useParams } from "react-router-dom";
import { useGetStudentByIdQuery } from "../../../redux/api/authApi";
import { Formik, Field, Form } from "formik";

const AdmissionEditPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetStudentByIdQuery(id);

  if (isLoading) return <p>Loading student data...</p>;
  if (error) return <p>Error loading student data.</p>;

  // Pre-fill Formik with data
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

  // Handle form submit
  const handleSubmit = (values) => {
    console.log("Form submitted with data:", values);
    // Implement your update logic here (e.g., call an API to update the student data)
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Edit Student: {data?.data.firstName} {data?.data.lastName}
      </h2>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, handleChange, handleBlur }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="firstName">First Name</label>
              <Field
                id="firstName"
                name="firstName"
                type="text"
                className="input"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="lastName">Last Name</label>
              <Field
                id="lastName"
                name="lastName"
                type="text"
                className="input"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="fatherName">Father&apos;s Name</label>
              <Field
                id="fatherName"
                name="fatherName"
                type="text"
                className="input"
                value={values.fatherName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="studentMobile">Student Mobile</label>
              <Field
                id="studentMobile"
                name="studentMobile"
                type="text"
                className="input"
                value={values.studentMobile}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="parentMobile">Parent Mobile</label>
              <Field
                id="parentMobile"
                name="parentMobile"
                type="text"
                className="input"
                value={values.parentMobile}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="gender">Gender</label>
              <Field
                id="gender"
                name="gender"
                as="select"
                className="input"
                value={values.gender}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Field>
            </div>

            <div>
              <label htmlFor="dob">Date of Birth</label>
              <Field
                id="dob"
                name="dob"
                type="date"
                className="input"
                value={values.dob}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="aadharCard">Aadhar Card</label>
              <Field
                id="aadharCard"
                name="aadharCard"
                type="text"
                className="input"
                value={values.aadharCard}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="address">Address</label>
              <Field
                id="address"
                name="address"
                type="text"
                className="input"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="track">Track</label>
              <Field
                id="track"
                name="track"
                type="text"
                className="input"
                value={values.track}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="village">Village</label>
              <Field
                id="village"
                name="village"
                type="text"
                className="input"
                value={values.village}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="stream">Stream</label>
              <Field
                id="stream"
                name="stream"
                type="text"
                className="input"
                value={values.stream}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="course">Course</label>
              <Field
                id="course"
                name="course"
                type="text"
                className="input"
                value={values.course}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="category">Category</label>
              <Field
                id="category"
                name="category"
                type="text"
                className="input"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="subject12">12th Subject</label>
              <Field
                id="subject12"
                name="subject12"
                type="text"
                className="input"
                value={values.subject12}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label htmlFor="year12">12th Year</label>
              <Field
                id="year12"
                name="year12"
                type="text"
                className="input"
                value={values.year12}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label>
                <Field
                  type="checkbox"
                  name="itegrInterviewFlag"
                  checked={values.itegrInterviewFlag}
                  onChange={handleChange}
                />
                Interview Flag
              </label>
            </div>

            <div>
              <label>
                <Field
                  type="checkbox"
                  name="admissionStatus"
                  checked={values.admissionStatus}
                  onChange={handleChange}
                />
                Admission Status
              </label>
            </div>

            <div>
              <label htmlFor="interviewStage">Interview Stage</label>
              <Field
                id="interviewStage"
                name="interviewStage"
                type="text"
                className="input"
                value={values.interviewStage}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AdmissionEditPage;
// /* eslint-disable react/prop-types */
// import { useEffect, useState } from "react";
// import { Formik, Form } from "formik";
// import SelectInput from "../../common-components/common-feild/SelectInput";
// import RadioGroup from "../../common-components/common-feild/RadioGroup";
// import InputField from "../../common-components/common-feild/InputField";
// import { interviewSchema } from "../../../validationSchema";
// import UserProfile from "../../common-components/user-profile/UserProfile";
// import {
//   useGetStudentByIdQuery,
//   useUpdateStudentMutation,
// } from "../../../redux/api/authApi";
// import { useParams } from "react-router-dom";

// const Section = ({ title, children }) => {
//   const [open, setOpen] = useState(true);
//   return (
//     <div className="w-full mb-4 border rounded-lg shadow-md border-b-4">
//       <button
//         className="w-full text-left px-4 py-3 bg-slate-100 font-semibold flex justify-between items-center"
//         onClick={() => setOpen(!open)}
//         type="button"
//       >
//         {title}
//         <span className="text-xl">{open ? "▾" : "▸"}</span>
//       </button>
//       {open && <div className="p-4 bg-white">{children}</div>}
//     </div>
//   );
// };

// const AdmissionEditPage = () => {
//   const { id } = useParams();
//   const { data: student, isLoading, isError } = useGetStudentByIdQuery(id);
//   const [updateStudent] = useUpdateStudentMutation();

//   const [initialValues, setInitialValues] = useState({
//     firstName: "",
//     lastName: "",
//     contact: "",
//     fatherName: "",
//     gender: "",
//     track: "",
//     address: "",
//     subject12: "",
//     percent12: "",
//     percent10: "",
//     passOut: "",
//     courseOrDiploma: "",
//     marks: "",
//     remark: "",
//     attempt: "",
//     examDate: "",
//     result: "",
//   });

//   useEffect(() => {
//     if (student) {
//       setInitialValues({
//         firstName: student.firstName || "",
//         lastName: student.lastName || "",
//         contact: student.contact || "",
//         fatherName: student.fatherName || "",
//         gender: student.gender || "",
//         track: student.track || "",
//         address: student.address || "",
//         subject12: student.subject12 || "",
//         percent12: student.percent12 || "",
//         percent10: student.percent10 || "",
//         passOut: student.passOut || "",
//         courseOrDiploma: student.courseOrDiploma || "",
//         marks: student.marks || "",
//         remark: student.remark || "",
//         attempt: student.attempt || "",
//         examDate: student.examDate || "",
//         result: student.result || "",
//       });
//     }
//   }, [student]);

//   const handleSubmit = async (values) => {
//     console.log("Submitting for ID:", id);
//     console.log("Values:", values);
//     try {
//       await updateStudent({ id, ...values }).unwrap();
//       alert("Student updated successfully!");
//     } catch (error) {
//       console.error("Update failed:", error);
//       alert("Failed to update student.");
//     }
//   };

//   if (isLoading) return <p>Loading...</p>;
//   if (isError || !student) return <p>Error loading student data</p>;

//   return (
//     <>
//       <UserProfile showBackButton heading="Interview Process" />

//       <div className="mx-auto">
//         <Formik
//           enableReinitialize
//           initialValues={initialValues}
//           validationSchema={interviewSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ setFieldValue }) => (
//             <Form>
//               {/* Section 1: Personal Info */}
//               <Section title="Personal Information">
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-7">
//                   <InputField
//                     label="First Name"
//                     name="firstName"
//                     placeholder="First Name"
//                   />
//                   <InputField
//                     label="Last Name"
//                     name="lastName"
//                     placeholder="Last Name"
//                   />
//                   <InputField
//                     label="Contact Number"
//                     name="contact"
//                     placeholder="Contact Number"
//                   />
//                   <InputField
//                     label="Father's Name"
//                     name="fatherName"
//                     placeholder="Father's Name"
//                   />
//                   <SelectInput
//                     label="Gender"
//                     name="gender"
//                     options={[
//                       { value: "male", label: "Male" },
//                       { value: "female", label: "Female" },
//                       { value: "other", label: "Other" },
//                     ]}
//                   />
//                   <SelectInput
//                     label="Select Track"
//                     name="track"
//                     options={[
//                       { value: "track1", label: "Track 1" },
//                       { value: "track2", label: "Track 2" },
//                       { value: "Gopalpur", label: "Gopalpur" },
//                       { value: "Narshullaganj", label: "Narshullaganj" },
//                     ]}
//                   />
//                   <InputField
//                     label="Address"
//                     name="address"
//                     as="textarea"
//                     placeholder="Address"
//                     className="input col-span-2 md:col-span-1"
//                   />
//                 </div>
//               </Section>

//               {/* Section 2: Academic */}
//               <Section title="Academic Information">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <InputField
//                     label="12th Subject"
//                     name="subject12"
//                     placeholder="12th Subject"
//                   />
//                   <InputField
//                     label="12th %"
//                     name="percent12"
//                     placeholder="12th %"
//                   />
//                   <InputField
//                     label="10th %"
//                     name="percent10"
//                     placeholder="10th %"
//                   />
//                   <InputField
//                     label="Passed Out Year"
//                     name="passOut"
//                     type="date"
//                   />
//                   <RadioGroup
//                     label="Course"
//                     name="courseOrDiploma"
//                     options={[
//                       { value: "Graduation", label: "Graduation" },
//                       { value: "Diploma", label: "Diploma" },
//                     ]}
//                     className="col-span-1 md:col-span-2"
//                   />
//                 </div>
//               </Section>

//               {/* Section 3: Interview Result */}
//               <Section title="Interview Result">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <InputField
//                     label="Marks"
//                     name="marks"
//                     type="number"
//                     placeholder="Marks"
//                   />
//                   <InputField
//                     label="Remark"
//                     name="remark"
//                     placeholder="Enter Remark"
//                   />
//                   <InputField
//                     label="Attempt"
//                     name="attempt"
//                     type="number"
//                     placeholder="Attempt"
//                   />
//                   <InputField
//                     label="Date of Exam"
//                     name="examDate"
//                     type="date"
//                   />
//                   <div className="flex items-center gap-4">
//                     <label className="font-medium">Result</label>
//                     <button
//                       type="button"
//                       className="px-3 py-1 bg-green-500 text-black rounded-md"
//                       onClick={() => setFieldValue("result", "Pass")}
//                     >
//                       Pass
//                     </button>
//                     <button
//                       type="button"
//                       className="px-3 py-1 bg-slate-200 text-black rounded-md"
//                       onClick={() => setFieldValue("result", "Fail")}
//                     >
//                       Fail
//                     </button>
//                   </div>
//                 </div>
//               </Section>

//               {/* Buttons */}
//               <div className="flex justify-end gap-4 mt-4">
//                 <button
//                   type="button"
//                   className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
//                   onClick={() => {
//                     console.log("Rejected student ID:", id);
//                     alert(`Rejected student ${id}`);
//                   }}
//                 >
//                   Reject
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition"
//                 >
//                   Select
//                 </button>
//               </div>
//             </Form>
//           )}
//         </Formik>
//       </div>
//     </>
//   );
// };

// export default AdmissionEditPage;
