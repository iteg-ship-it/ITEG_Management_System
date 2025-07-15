/* eslint-disable react/prop-types */
import { useInterviewCreateMutation } from '../../redux/api/authApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

// ✅ YOUR TextInput style
import TextInput from '../common-components/common-feild/TextInput';
import SelectInput from '../common-components/common-feild/SelectInput';

const CustomTimeDate = ({ isOpen, onClose, studentId, attempted, refetch }) => {
  const initialValues = {
    created_by: '',
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
    subjectKnowlage: Yup.string().required(),
    reasoning: Yup.number().required(),
    goal: Yup.string().required(),
    sincerity: Yup.string().required(),
    communication: Yup.string().required(),
    confidence: Yup.string().required(),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">

        <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
          Technical Interview Form
        </h2>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {() => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Section: Interview Metadata */}
              <div className="col-span-2 text-sm font-semibold text-gray-600">Interview Metadata</div>
              <TextInput name="created_by" label="Created By" />
              <TextInput name="date" type="datetime-local" label="Select Date" />

              {/* Section: Technical Knowledge & Aptitude */}
              <div className="col-span-2 text-sm font-semibold text-gray-600">Technical Knowledge & Aptitude</div>
              <TextInput name="maths" label="Mathematics Marks" type="number" />
              <SelectInput
                name="subjectKnowlage"
                options={[
                  { value: '', label: 'Subjective Knowledge' },
                  { value: 'Basic', label: 'Basic' },
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'Advanced', label: 'Advanced' },
                ]}
                label="Subjective Knowledge"
              />
              <TextInput name="reasoning" label="Reasoning Marks" type="number" />

              {/* Section: Candidate Behaviour & Soft Skill */}
              <div className="col-span-2 text-sm font-semibold text-gray-600">Candidate Behaviour & Soft Skill</div>
              <SelectInput
                name="goal"
                options={[
                  { value: '', label: 'Goal Clarity' },
                  { value: 'Clear', label: 'Clear' },
                  { value: 'Average', label: 'Average' },
                  { value: 'No Clarity', label: 'No Clarity' },
                ]}
                placeholder="Goal Clarity"
              />
              <SelectInput
                name="sincerity"
                options={[
                  { value: '', label: 'Sincerity' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
                placeholder="Sincerity"
              />
              <SelectInput
                name="communication"
                options={[
                  { value: '', label: 'Communication Level' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Average', label: 'Average' },
                  { value: 'Poor', label: 'Poor' },
                ]}
                placeholder="Communication Level"
              />
              <SelectInput
                name="confidence"
                options={[
                  { value: '', label: 'Confidence Level' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ]}
                placeholder="Confidence Level"
              />

              {/* Section: Assignment Evaluation */}
              <div className="col-span-2 text-sm font-semibold text-gray-600">Assignment Evaluation</div>
              <SelectInput
                name="attemptNo"
                options={[
                  { value: 1, label: '1st Attempt' },
                  { value: 2, label: '2nd Attempt' },
                  { value: 3, label: '3rd Attempt' },
                ]}
                placeholder="Assignment Attempt"
              />
              <TextInput name="assignmentMarks" label="Assignment Marks" type="number" />

              {/* Section: Summary & Decision */}
              <div className="col-span-2 text-sm font-semibold text-gray-600">Summary & Decision</div>
              <TextInput name="marks" label="Total Mark" type="number" />
              <SelectInput
                name="result"
                options={[
                  { value: '', label: 'Result' },
                  { value: 'Pass', label: 'Pass' },
                  { value: 'Fail', label: 'Fail' },
                  { value: 'Pending', label: 'Pending' },
                ]}
                placeholder="Result"
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



// /* eslint-disable react/prop-types */
// import { useInterviewCreateMutation } from '../../redux/api/authApi';
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';
// import { toast } from 'react-toastify';

// // ✅ YOUR TextInput style
// import TextInput from '../common-components/common-feild/TextInput';
// import SelectInput from '../common-components/common-feild/SelectInput';

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
//     subjectKnowlage: Yup.string().required(),
//     reasoning: Yup.number().required(),
//     goal: Yup.string().required(),
//     sincerity: Yup.string().required(),
//     communication: Yup.string().required(),
//     confidence: Yup.string().required(),
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

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//       <div className="bg-white rounded-xl py-6 px-8 w-full max-w-3xl h-[95vh] overflow-y-auto no-scrollbar relative">

//         <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
//           Technical Interview Form
//         </h2>

//         <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
//           {() => (
//             <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">

//               {/* Section: Interview Metadata */}
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Interview Metadata</div>
//               <TextInput name="created_by" label="Created By" />
//               <TextInput name="date" type="datetime-local" label="Select Date" />

//               {/* Section: Technical Knowledge & Aptitude */}
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Technical Knowledge & Aptitude</div>
//               <TextInput name="maths" label="Mathematics Marks" type="number" />
//               <SelectInput
//                 name="subjectKnowlage"
//                 options={[
//                   { value: '', label: 'Subjective Knowledge' },
//                   { value: 'Basic', label: 'Basic' },
//                   { value: 'Intermediate', label: 'Intermediate' },
//                   { value: 'Advanced', label: 'Advanced' },
//                 ]}
//                 label="Subjective Knowledge"
//               />
//               <TextInput name="reasoning" label="Reasoning Marks" type="number" />

//               {/* Section: Candidate Behaviour & Soft Skill */}
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Candidate Behaviour & Soft Skill</div>
//               <SelectInput
//                 name="goal"
//                 options={[
//                   { value: '', label: 'Goal Clarity' },
//                   { value: 'Clear', label: 'Clear' },
//                   { value: 'Average', label: 'Average' },
//                   { value: 'No Clarity', label: 'No Clarity' },
//                 ]}
//                 placeholder="Goal Clarity"
//               />
//               <SelectInput
//                 name="sincerity"
//                 options={[
//                   { value: '', label: 'Sincerity' },
//                   { value: 'High', label: 'High' },
//                   { value: 'Medium', label: 'Medium' },
//                   { value: 'Low', label: 'Low' },
//                 ]}
//                 placeholder="Sincerity"
//               />
//               <SelectInput
//                 name="communication"
//                 options={[
//                   { value: '', label: 'Communication Level' },
//                   { value: 'Good', label: 'Good' },
//                   { value: 'Average', label: 'Average' },
//                   { value: 'Poor', label: 'Poor' },
//                 ]}
//                 placeholder="Communication Level"
//               />
//               <SelectInput
//                 name="confidence"
//                 options={[
//                   { value: '', label: 'Confidence Level' },
//                   { value: 'High', label: 'High' },
//                   { value: 'Medium', label: 'Medium' },
//                   { value: 'Low', label: 'Low' },
//                 ]}
//                 placeholder="Confidence Level"
//               />

//               {/* Section: Assignment Evaluation */}
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Assignment Evaluation</div>
//               <SelectInput
//                 name="attemptNo"
//                 options={[
//                   { value: 1, label: '1st Attempt' },
//                   { value: 2, label: '2nd Attempt' },
//                   { value: 3, label: '3rd Attempt' },
//                 ]}
//                 placeholder="Assignment Attempt"
//               />
//               <TextInput name="assignmentMarks" label="Assignment Marks" type="number" />

//               {/* Section: Summary & Decision */}
//               <div className="col-span-2 text-sm font-semibold text-gray-600">Summary & Decision</div>
//               <TextInput name="marks" label="Total Mark" type="number" />
//               <SelectInput
//                 name="result"
//                 options={[
//                   { value: '', label: 'Result' },
//                   { value: 'Pass', label: 'Pass' },
//                   { value: 'Fail', label: 'Fail' },
//                   { value: 'Pending', label: 'Pending' },
//                 ]}
//                 placeholder="Result"
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
