// /* eslint-disable react/prop-types */
// import { useInterviewCreateMutation } from '../../redux/api/authApi';
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';
// import { toast } from 'react-toastify';

// import TextInput from '../common-components/common-feild/TextInput';
// import SelectInput from '../common-components/common-feild/SelectInput';
// import DatePickerInput from '../datepickerInput/DatePickerInput';

// const CustomTimeDate = ({ isOpen, onClose, studentId, attempted, refetch }) => {
//   const initialValues = {
//     created_by: '',
//     date: '',
//     maths: '',
//     subjectKnowlage: '',
//     reasoning: '',
//     goal: '',
//     sincerity: '',
//     communication: '',
//     confidence: '',
//     attemptNo: attempted + 1,
//     assignmentMarks: '',
//     marks: '',
//     result: 'Pending',
//     remark: '',
//   };

//   const validationSchema = Yup.object().shape({
//     created_by: Yup.string().required(),
//     date: Yup.string().required(),
//     maths: Yup.number().required(),
//     subjectKnowlage: Yup.number().required(),
//     reasoning: Yup.number().required(),
//     goal: Yup.number().required(),
//     sincerity: Yup.number().required(),
//     communication: Yup.number().required(),
//     confidence: Yup.number().required(),
//     attemptNo: Yup.number().required(),
//     assignmentMarks: Yup.number().required(),
//     marks: Yup.number().required(),
//     result: Yup.string().required(),
//     remark: Yup.string(),
//   });

//   const [createInterview, { isLoading }] = useInterviewCreateMutation();

//   const handleSubmit = async (values, { resetForm }) => {
//     const payload = {
//       ...values,
//       round: 'First',
//       studentId,
//     };

//     try {
//       await createInterview(payload).unwrap();
//       toast.success('Interview scheduled successfully!');
//       refetch?.();
//       resetForm();
//       onClose();
//     } catch (err) {
//       toast.error('Failed to schedule interview.');
//       console.error('Interview error:', err);
//     }
//   };

//   if (!isOpen) return null;

//   const fivePointOptions = [
//     { value: 1, label: '1. Very Weak' },
//     { value: 2, label: '2. Weak' },
//     { value: 3, label: '3. Average' },
//     { value: 4, label: '4. Good' },
//     { value: 5, label: '5. Very Good' },
//   ];

//   const behaviorOptions = [
//     { value: 1, label: '1. Poor' },
//     { value: 2, label: '2. Below Average' },
//     { value: 3, label: '3. Average' },
//     { value: 4, label: '4. Good' },
//     { value: 5, label: '5. Excellent' },
//   ];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//       <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">
//         <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
//           Technical Interview Form
//         </h2>

//         <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
//           {() => (
//             <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Interview Metadata</div>
//               <TextInput name="created_by" label="Created By" />
//               <DatePickerInput name="date" label="Select Date" />

//               <div className="col-span-2 text-sm font-semibold text-gray-600">Technical Knowledge & Aptitude</div>
//               <SelectInput name="maths" label="Mathematics Marks" options={fivePointOptions} />
//               <SelectInput name="subjectKnowlage" label="Subjective Knowledge" options={fivePointOptions} />
//               <SelectInput name="reasoning" label="Reasoning Marks" options={fivePointOptions} />

//               <div className="col-span-2 text-sm font-semibold text-gray-600">Candidate Behaviour & Soft Skill</div>
//               <SelectInput name="goal" label="Goal Clarity" options={behaviorOptions} />
//               <SelectInput name="sincerity" label="Sincerity" options={behaviorOptions} />
//               <SelectInput name="communication" label="Communication Level" options={behaviorOptions} />
//               <SelectInput name="confidence" label="Confidence Level" options={behaviorOptions} />

//               <div className="col-span-2 text-sm font-semibold text-gray-600">Assignment Evaluation</div>
//               <SelectInput
//                 name="attemptNo"
//                 label="Assignment Attempt"
//                 options={[
//                   { value: 1, label: '1st Attempt' },
//                   { value: 2, label: '2nd Attempt' },
//                   { value: 3, label: '3rd Attempt' },
//                 ]}
//               />
//               {/* <TextInput name="assignmentMarks" label="Assignment Marks" type="number" /> */}
//               <SelectInput name="assignmentMarks" label="Assignment Marks" options={behaviorOptions} />

//               <div className="col-span-2 text-sm font-semibold text-gray-600">Summary & Decision</div>
//               <TextInput name="marks" label="Total Mark" type="number" />
//               <SelectInput
//                 name="result"
//                 label="Result"
//                 options={[
//                   { value: 'Pass', label: 'Pass' },
//                   { value: 'Fail', label: 'Fail' },
//                   { value: 'Pending', label: 'Pending' },
//                 ]}
//               />
//               <TextInput name="remark" label="Remark / Feedback..." className="col-span-2" />

//               <div className="col-span-2 flex justify-center mt-4">
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="bg-brandYellow text-white px-6 py-2 rounded-md hover:bg-orange-600"
//                 >
//                   {isLoading ? 'Submitting...' : 'Submit'}
//                 </button>
//               </div>
//             </Form>
//           )}
//         </Formik>

//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
//         >
//           &times;
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CustomTimeDate;

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  useInterviewCreateMutation,
  useGetInterviewDetailByIdQuery,
} from "../../redux/api/authApi";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import TextInput from "../common-components/common-feild/TextInput";
import SelectInput from "../common-components/common-feild/SelectInput";
import DatePickerInput from "../datepickerInput/DatePickerInput";
// import { useParams } from "react-router-dom";

const CustomTimeDate = ({ isOpen, onClose, studentId, refetch, activeTab }) => {
  console.log("activeTab", activeTab);
  const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const [lastAttempt, setLastAttempt] = useState(0);
  console.log("lastAttempt", lastAttempt);

  // 👇 Fetch attemptNo from backend
  // const {
  //   data: attemptData,
  //   isLoading: isAttemptLoading,
  // } = useGetInterviewAttemptCountQuery(studentId);

  // const { id } = useParams();
  const { data: attemptData } = useGetInterviewDetailByIdQuery(studentId);
  console.log("Attempt Data:", attemptData);

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  // Return nothing if modal is closed or attempt is still loading
  if (!isOpen) return null;

  const initialValues = {
    created_by: userInfo.name || "",
    date: "",
    maths: activeTab === "Technical Round" ? lastAttempt?.maths : 0,
    subjectKnowlage:
      activeTab === "Technical Round" ? lastAttempt?.subjectKnowlage : 0,
    reasoning: activeTab === "Technical Round" ? lastAttempt?.reasoning : 0,
    goal: activeTab === "Technical Round" ? lastAttempt?.goal : 0,
    sincerity: activeTab === "Technical Round" ? lastAttempt?.sincerity : 0,
    communication:
      activeTab === "Technical Round" ? lastAttempt?.communication : 0,
    confidence: activeTab === "Technical Round" ? lastAttempt?.confidence : 0,
    attemptNo: lastAttempt?.attemptNo > 0 ? lastAttempt?.attemptNo + 1 : 1,
    assignmentMarks:
      activeTab === "Technical Round" ? lastAttempt?.assignmentMarks : 0,
    marks: activeTab === "Technical Round" ? lastAttempt?.marks : 0,
    result: "Pending",
    remark: "",
  };

  const validationSchema = Yup.object().shape({
    created_by: Yup.string().required(),
    date: Yup.string().required(),
    maths: Yup.number().required(),
    subjectKnowlage: Yup.number().required(),
    reasoning: Yup.number().required(),
    goal: Yup.number().required(),
    sincerity: Yup.number().required(),
    communication: Yup.number().required(),
    confidence: Yup.number().required(),
    attemptNo: Yup.number().required(),
    assignmentMarks: Yup.number().required(),
    marks: Yup.number().required(),
    result: Yup.string().required(),
    remark: Yup.string(),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      round: "First",
      studentId,
    };

    try {
      await createInterview(payload).unwrap();
      toast.success("Interview scheduled successfully!");
      refetch?.();
      resetForm();
      onClose();
    } catch (err) {
      toast.error("Failed to schedule interview.");
      console.error("Interview error:", err);
    }
  };

  const fivePointOptions = [
    { value: 1, label: "1. Very Weak" },
    { value: 2, label: "2. Weak" },
    { value: 3, label: "3. Average" },
    { value: 4, label: "4. Good" },
    { value: 5, label: "5. Very Good" },
  ];

  const behaviorOptions = [
    { value: 1, label: "1. Poor" },
    { value: 2, label: "2. Below Average" },
    { value: 3, label: "3. Average" },
    { value: 4, label: "4. Good" },
    { value: 5, label: "5. Excellent" },
  ];

  useEffect(() => {
    if (attemptData) {
      let lastAttempt1 = 0;
      attemptData?.interviews?.forEach((interview) => {
        if (interview.attemptNo > lastAttempt1) {
          lastAttempt1 = interview.attemptNo;
          setLastAttempt(interview);
        }
      });
    }
  }, [attemptData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          Technical Interview Form
        </h2>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoMarksCalculator />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Interview Metadata
              </div>
              <TextInput name="created_by" label="Created By" disabled />
              <DatePickerInput name="date" label="Select Date" />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Technical Knowledge & Aptitude
              </div>
              <SelectInput
                name="maths"
                label="Mathematics Marks"
                options={fivePointOptions}
              />
              <SelectInput
                name="subjectKnowlage"
                label="Subjective Knowledge"
                options={fivePointOptions}
              />
              <SelectInput
                name="reasoning"
                label="Reasoning Marks"
                options={fivePointOptions}
              />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Candidate Behaviour & Soft Skill
              </div>
              <SelectInput
                name="goal"
                label="Goal Clarity"
                options={behaviorOptions}
              />
              <SelectInput
                name="sincerity"
                label="Sincerity"
                options={behaviorOptions}
              />
              <SelectInput
                name="communication"
                label="Communication Level"
                options={behaviorOptions}
              />
              <SelectInput
                name="confidence"
                label="Confidence Level"
                options={behaviorOptions}
              />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Assignment Evaluation
              </div>
              <TextInput name="attemptNo" label="Attempt No" disabled />
              <SelectInput
                name="assignmentMarks"
                label="Assignment Marks"
                options={behaviorOptions}
              />

              <div className="col-span-2 text-sm font-semibold text-gray-600">
                Summary & Decision
              </div>
              <TextInput
                name="marks"
                label="Total Mark"
                type="number"
                disabled
              />
              <SelectInput
                name="result"
                label="Result"
                options={[
                  { value: "Pass", label: "Pass" },
                  { value: "Fail", label: "Fail" },
                  { value: "Pending", label: "Pending" },
                ]}
              />
              <TextInput
                name="remark"
                label="Remark / Feedback..."
                className="col-span-2"
              />

              <div className="col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brandYellow text-white px-6 py-2 rounded-md hover:bg-orange-600"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default CustomTimeDate;

const AutoMarksCalculator = () => {
  const { values, setFieldValue } = useFormikContext();

  const {
    maths,
    reasoning,
    subjectKnowlage,
    goal,
    sincerity,
    communication,
    confidence,
    assignmentMarks,
  } = values;

  useEffect(() => {
    const inputs = [
      maths,
      reasoning,
      subjectKnowlage,
      goal,
      sincerity,
      communication,
      confidence,
      assignmentMarks,
    ];

    const allFilled = inputs.every((val) => val !== "" && !isNaN(val));

    if (allFilled) {
      const total = inputs.reduce((sum, val) => sum + Number(val), 0);
      setFieldValue("marks", total);
    }
  }, [
    maths,
    reasoning,
    subjectKnowlage,
    goal,
    sincerity,
    communication,
    confidence,
    assignmentMarks,
    setFieldValue,
  ]);

  return null;
};


