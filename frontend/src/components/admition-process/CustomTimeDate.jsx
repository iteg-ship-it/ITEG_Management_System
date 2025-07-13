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
//                   className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
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
import { useEffect } from 'react';
import { useInterviewCreateMutation } from '../../redux/api/authApi';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import TextInput from '../common-components/common-feild/TextInput';
import SelectInput from '../common-components/common-feild/SelectInput';
import DatePickerInput from '../datepickerInput/DatePickerInput';

const CustomTimeDate = ({ isOpen, onClose, studentId, attempted, refetch }) => {
   const userInfo = JSON.parse(localStorage.getItem("user")) || {};
  const initialValues = {
     created_by: userInfo.name || '',
    date: '',
    maths: '',
    subjectKnowlage: '',
    reasoning: '',
    goal: '',
    sincerity: '',
    communication: '',
    confidence: '',
    attemptNo: attempted + 1,
    assignmentMarks: '',
    marks: '',
    result: 'Pending',
    remark: '',
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

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      round: 'First',
      studentId,
    };

    try {
      await createInterview(payload).unwrap();
      toast.success('Interview scheduled successfully!');
      refetch?.();
      resetForm();
      onClose();
    } catch (err) {
      toast.error('Failed to schedule interview.');
      console.error('Interview error:', err);
    }
  };

  if (!isOpen) return null;

  const fivePointOptions = [
    { value: 1, label: '1. Very Weak' },
    { value: 2, label: '2. Weak' },
    { value: 3, label: '3. Average' },
    { value: 4, label: '4. Good' },
    { value: 5, label: '5. Very Good' },
  ];

  const behaviorOptions = [
    { value: 1, label: '1. Poor' },
    { value: 2, label: '2. Below Average' },
    { value: 3, label: '3. Average' },
    { value: 4, label: '4. Good' },
    { value: 5, label: '5. Excellent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          Technical Interview Form
        </h2>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {() => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 🔥 Inject Auto Calculator */}
              <AutoMarksCalculator />

              <div className="col-span-2 text-sm font-semibold text-gray-600">Interview Metadata</div>
              <TextInput name="created_by" label="Created By" />
              <DatePickerInput name="date" label="Select Date" />

              <div className="col-span-2 text-sm font-semibold text-gray-600">Technical Knowledge & Aptitude</div>
              <SelectInput name="maths" label="Mathematics Marks" options={fivePointOptions} />
              <SelectInput name="subjectKnowlage" label="Subjective Knowledge" options={fivePointOptions} />
              <SelectInput name="reasoning" label="Reasoning Marks" options={fivePointOptions} />

              <div className="col-span-2 text-sm font-semibold text-gray-600">Candidate Behaviour & Soft Skill</div>
              <SelectInput name="goal" label="Goal Clarity" options={behaviorOptions} />
              <SelectInput name="sincerity" label="Sincerity" options={behaviorOptions} />
              <SelectInput name="communication" label="Communication Level" options={behaviorOptions} />
              <SelectInput name="confidence" label="Confidence Level" options={behaviorOptions} />

              <div className="col-span-2 text-sm font-semibold text-gray-600">Assignment Evaluation</div>
              <SelectInput
                name="attemptNo"
                label="Assignment Attempt"
                options={[
                  { value: 1, label: '1st Attempt' },
                  { value: 2, label: '2nd Attempt' },
                  { value: 3, label: '3rd Attempt' },
                ]}
              />
              <SelectInput name="assignmentMarks" label="Assignment Marks" options={behaviorOptions} />

              <div className="col-span-2 text-sm font-semibold text-gray-600">Summary & Decision</div>
              <TextInput name="marks" label="Total Mark" type="number" />
              <SelectInput
                name="result"
                label="Result"
                options={[
                  { value: 'Pass', label: 'Pass' },
                  { value: 'Fail', label: 'Fail' },
                  { value: 'Pending', label: 'Pending' },
                ]}
              />
              <TextInput name="remark" label="Remark / Feedback..." className="col-span-2" />

              <div className="col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
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

    const allFilled = inputs.every((val) => val !== '' && !isNaN(val));

    if (allFilled) {
      const total = inputs.reduce((sum, val) => sum + Number(val), 0);
      const average = total / 8;
      const scaledValue = (average * 2).toFixed(1); 
      setFieldValue('marks', scaledValue);

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
