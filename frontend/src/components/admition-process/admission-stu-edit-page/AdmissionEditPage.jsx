// import { Formik, Form } from "formik";
// import SelectInput from "../common-feild/SelectInput";
// import RadioGroup from "../common-feild/RadioGroup";
// import InputField from "../common-feild/InputField";
// import { interviewSchema } from "../../../validationSchema";

// // ✅ Define Section Component Here
// const Section = ({ title, children }) => {
//   const [open, setOpen] = useState(true);

//   return (
//     <div className="mb-4 border rounded-lg shadow-md border-b-4">
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

// // ✅ Initial Form Values
// const initialValues = {
//   firstName: "",
//   lastName: "",
//   contact: "",
//   fatherName: "",
//   gender: "",
//   track: "",
//   address: "",
//   subject12: "",
//   percent12: "",
//   percent10: "",
//   passOut: "",
//   courseOrDiploma: "",
//   marks: "",
//   remark: "",
//   attempt: "",
//   examDate: "",
//   result: "",
// };

// import { useState } from "react"; // ✅ Important: Required for Section

// const AdmissionEditPage = () => {
//   const handleSubmit = (values) => {
//     console.log("Form Values: ", values);
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Interview Process</h1>

//       <Formik
//         initialValues={initialValues}
//         validationSchema={interviewSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ values, setFieldValue }) => (
//           <Form>
//             {/* Section 1: Personal Info */}
//             <Section title="Personal Information">
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-7">
//                 <InputField
//                   label="firstName*"
//                   name="firstName"
//                   placeholder="First Name *"
//                 />
//                 <InputField
//                   label="LastName*"
//                   name="lastName"
//                   placeholder="Last Name *"
//                 />
//                 <InputField
//                   label="Contact Number*"
//                   name="contact"
//                   placeholder="Contact Number *"
//                 />
//                 <InputField
//                   label="FatherName*"
//                   name="fatherName"
//                   placeholder="Father's Name *"
//                 />

//                 <SelectInput
//                   label="Gender"
//                   name="gender"
//                   options={[
//                     { value: "male", label: "Male" },
//                     { value: "female", label: "Female" },
//                     { value: "other", label: "Other" },
//                   ]}
//                 />
//                 <SelectInput
//                   label="Select Track"
//                   name="track"
//                   options={[
//                     { value: "track1", label: "Track 1" },
//                     { value: "track2", label: "Track 2" },
//                     { value: "Gopalpur", label: "Gopalpur" },
//                     { value: "Narshullaganj", label: "Narshullaganj" },
//                   ]}
//                 />

//                 <InputField
//                   label="Address"
//                   name="address"
//                   as="textarea"
//                   placeholder="Address"
//                   className="input col-span-2 md:col-span-1"
//                 />
//               </div>
//             </Section>

//             {/* Section 2: Academic */}
//             <Section title="Academic Information">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <InputField
//                   label="12th Subject*"
//                   name="subject12"
//                   placeholder="12th Subject *"
//                 />
//                 <InputField
//                   label="12th %"
//                   name="percent12"
//                   placeholder="12th % *"
//                 />
//                 <InputField
//                   label="10th %"
//                   name="percent10"
//                   placeholder="10th % *"
//                 />
//                 <InputField
//                   name="passOut"
//                   type="date"
//                   placeholder="Passed Out Year *"
//                 />

//                 <RadioGroup
//                   label="Course *"
//                   name="courseOrDiploma"
//                   options={[
//                     { value: "Graduation", label: "Graduation" },
//                     { value: "Diploma", label: "Diploma" },
//                   ]}
//                   className="col-span-1 md:col-span-2"
//                 />
//               </div>
//             </Section>

//             {/* Section 3: Interview Result */}
//             <Section title="Interview Result">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <InputField
//                   label="Marks"
//                   name="marks"
//                   type="number"
//                   placeholder="Marks"
//                 />
//                 <InputField
//                   label=" Remark "
//                   name="remark"
//                   placeholder="Enter Remark"
//                 />
//                 <InputField
//                   label=" Attempt"
//                   name="attempt"
//                   type="number"
//                   placeholder="Attempt"
//                 />
//                 <InputField
//                   name="examDate"
//                   type="date"
//                   placeholder="Date of Exam"
//                 />

//                 <div className="flex items-center gap-4">
//                   <label className="font-medium">Result</label>
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-green-500 text-black rounded-md"
//                     onClick={() => setFieldValue("result", "Pass")}
//                   >
//                     Pass
//                   </button>
//                   <button
//                     type="button"
//                     className="px-3 py-1 bg-slate-200 text-black rounded-md"
//                     onClick={() => setFieldValue("result", "Fail")}
//                   >
//                     Fail
//                   </button>
//                 </div>
//               </div>
//             </Section>

//             {/* Form Buttons */}
//             <div className="flex justify-end gap-4 mt-4">
//               <button
//                 type="button"
//                 className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
//               >
//                 Reject
//               </button>
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition"
//               >
//                 Select
//               </button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default AdmissionEditPage;



import { useState } from "react";
import { Formik, Form, Field } from "formik";
import SelectInput from "../common-feild/SelectInput";
import RadioGroup from "../common-feild/RadioGroup";
import InputField from "../common-feild/InputField";
import { interviewSchema } from "../../../validationSchema";

// ✅ Section Component
const Section = ({ title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4 border rounded-lg shadow-md border-b-4">
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

// ✅ Initial Form Values
const initialValues = {
  firstName: "",
  lastName: "",
  contact: "",
  fatherName: "",
  gender: "",
  track: "",
  address: "",
  subject12: "",
  percent12: "",
  percent10: "",
  passOut: "",
  courseOrDiploma: "",
  marks: "",
  remark: "",
  attempt: "",
  examDate: "",
  result: "",
};

const InterviewProcess = () => {
  const handleSubmit = (values) => {
    console.log("Form Values: ", values);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Interview Process</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={interviewSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            {/* Section 1: Personal Info */}
            <Section title="Personal Information">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-7">
                <InputField
                  label={
                    <>
                      First Name <span className="text-red-500">*</span>
                    </>
                  }
                  name="firstName"
                  placeholder="First Name"
                />
                <InputField
                  label={
                    <>
                      Last Name <span className="text-red-500">*</span>
                    </>
                  }
                  name="lastName"
                  placeholder="Last Name"
                />
                <InputField
                  label={
                    <>
                      Contact Number <span className="text-red-500">*</span>
                    </>
                  }
                  name="contact"
                  placeholder="Contact Number"
                />
                <InputField
                  label={
                    <>
                      Father's Name <span className="text-red-500">*</span>
                    </>
                  }
                  name="fatherName"
                  placeholder="Father's Name"
                />

                <SelectInput
                  label={
                    <>
                      Gender <span className="text-red-500"></span>
                    </>
                  }
                  name="gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                />
                <SelectInput
                  label={
                    <>
                      Select Track <span className="text-red-500"></span>
                    </>
                  }
                  name="track"
                  options={[
                    { value: "track1", label: "Track 1" },
                    { value: "track2", label: "Track 2" },
                    { value: "Gopalpur", label: "Gopalpur" },
                    { value: "Narshullaganj", label: "Narshullaganj" },
                  ]}
                />
                <InputField
                  label={
                    <>
                      Address <span className="text-red-500">*</span>
                    </>
                  }
                  name="address"
                  as="textarea"
                  placeholder="Address"
                  className="input col-span-2 md:col-span-1"
                />
              </div>
            </Section>

            {/* Section 2: Academic */}
            <Section title="Academic Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label={
                    <>
                      12th Subject <span className="text-red-500">*</span>
                    </>
                  }
                  name="subject12"
                  placeholder="12th Subject"
                />
                <InputField
                  label={
                    <>
                      12th % <span className="text-red-500" >*</span>
                    </>
                  }
                  name="percent12"
                  placeholder="12th %"
                />
                <InputField
                  label={
                    <>
                      10th % <span className="text-red-500">*</span>
                    </>
                  }
                  name="percent10"
                  placeholder="10th %"
                />
                <InputField
                  label={
                    <>
                      Passed Out Year <span className="text-red-500">*</span>
                    </>
                  }
                  name="passOut"
                  type="date"
                />

                <RadioGroup
                  label={
                    <>
                      Course <span className="text-red-500"></span>
                    </>
                  }
                  name="courseOrDiploma"
                  options={[
                    { value: "Graduation", label: "Graduation" },
                    { value: "Diploma", label: "Diploma" },
                  ]}
                  className="col-span-1 md:col-span-2"
                />
              </div>
            </Section>

            {/* Section 3: Interview Result */}
            <Section title="Interview Result">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label={
                    <>
                      marks <span className="text-red-500">*</span>
                    </>
                  }
                  name="marks"
                  type="number"
                  placeholder="Marks"
                />
                <InputField
                  label={
                    <>
                      Remark <span className="text-red-500">*</span>
                    </>
                  }
                  name="remark"
                  placeholder="Enter Remark"
                />
                <InputField
                  label={
                    <>
                      attempt <span className="text-red-500">*</span>
                    </>
                  }
                  name="attempt"
                  type="number"
                  placeholder="Attempt"
                />
                <InputField label="Date of Exam" name="examDate" type="date" />

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

            {/* Form Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
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
  );
};

export default InterviewProcess;
