/* eslint-disable react/prop-types */
import { useInterviewCreateMutation } from '../../redux/api/authApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify'; // ✅ import toast

// Common Components
import TextInput from '../common-components/common-feild/TextInput';
import SelectInput from '../common-components/common-feild/SelectInput';

const CustomTimeDate = ({ isOpen, onClose, studentId, attempted, refetch }) => {
  const initialValues = {
    round: 'First',
    attemptNo: '',
    assignment: '',
    communication: '',
    confidence: '',
    goal: '',
    subjectKnowlage: '',
    assignmentMarks: '',
    sincerity: '',
    maths: '',
    reasoning: '',
    marks: '',
    remark: '',
    date: '',
    created_by: '',
    result: 'Pending',
  };

  const validationSchema = Yup.object().shape({
    round: Yup.string().required('Round is required'),
    assignment: Yup.string().required('Assignment is required'),
    communication: Yup.number().typeError('Must be a number').required().min(0).max(100),
    confidence: Yup.number().typeError('Must be a number').required().min(0).max(100),
    goal: Yup.number().typeError('Must be a number').required().min(0).max(100),
    subjectKnowlage: Yup.number().typeError('Must be a number').required().min(0).max(100),
    assignmentMarks: Yup.number().typeError('Must be a number').required().min(0).max(100),
    sincerity: Yup.number().typeError('Must be a number').required().min(0).max(100),
    maths: Yup.number().typeError('Must be a number').required().min(0).max(100),
    reasoning: Yup.number().typeError('Must be a number').required().min(0).max(100),
    marks: Yup.number().typeError('Must be a number').required().min(0).max(100),
    remark: Yup.string().required('Remark is required'),
    date: Yup.string().required('Date is required'),
    created_by: Yup.string().required('Created By is required'),
    result: Yup.string().required('Result is required'),
  });

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      ...values,
      created_by: values.created_by || 'admin',
      studentId: studentId,
    };

    try {
      await createInterview(payload).unwrap();
      toast.success('Interview scheduled successfully!');
      if (refetch) refetch(); // ✅ trigger GET call
      resetForm(); // optional: reset form
      onClose();   // close modal
    } catch (err) {
      console.error('Interview submission failed:', err);
      toast.error('Failed to schedule interview.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl py-4 px-6 w-full max-w-4xl h-[95vh] overflow-y-auto no-scrollbar relative">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-4">Schedule Interview</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <SelectInput
                label="Round"
                name="round"
                disabled={true}
                options={[{ value: 'First', label: 'Technical Round' }]}
              />

              <TextInput
                label="Attempt No"
                name="attemptNo"
                type="number"
                value={attempted + 1}
                disabled={true}
              />

              <TextInput label="Assignment" name="assignment" />
              <TextInput label="Communication" name="communication" type="number" />
              <TextInput label="Confidence" name="confidence" type="number" />
              <TextInput label="Goal" name="goal" type="number" />
              <TextInput label="Subject Knowledge" name="subjectKnowlage" type="number" />
              <TextInput label="Assignment Marks" name="assignmentMarks" type="number" />
              <TextInput label="Sincerity" name="sincerity" type="number" />
              <TextInput label="Maths" name="maths" type="number" />
              <TextInput label="Reasoning" name="reasoning" type="number" />
              <TextInput label="Total Marks" name="marks" type="number" />
              <TextInput label="Remark" name="remark" />
              <TextInput label="Created By" name="created_by" />
              <TextInput label="Date" name="date" type="datetime-local" />

              <SelectInput
                label="Result"
                name="result"
                options={[
                  { value: 'Pass', label: 'Pass' },
                  { value: 'Fail', label: 'Fail' },
                  { value: 'Pending', label: 'Pending' },
                ]}
              />

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-700"
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
// import { Formik, Form } from 'formik'; // Import Formik and Form
// import * as Yup from 'yup'; // Import Yup for validation

// // Assuming these are your common components
// import TextInput from '../common-components/common-feild/TextInput';
// import SelectInput from '../common-components/common-feild/SelectInput';

// const CustomTimeDate = ({ isOpen, onClose, studentId, attempted, refetch }) => {
//   // initialValues for Formik
//   const initialValues = {
//     round: 'First',
//     attemptNo: '',
//     assignment: '',
//     communication: '',
//     confidence: '',
//     goal: '',
//     subjectKnowlage: '',
//     assignmentMarks: '',
//     sincerity: '',
//     maths: '',
//     reasoning: '',
//     marks: '',
//     remark: '',
//     date: '',
//     created_by: '', // Will be set dynamically to 'admin'
//     result: 'Pending'
//   };

//   // Basic validation schema for Formik
//   const validationSchema = Yup.object().shape({
//     round: Yup.string().required('Round is required'),
//     // attemptNo: Yup.number().typeError('Must be a number').required('Attempt No is required').min(1),
//     assignment: Yup.string().required('Assignment is required'),
//     communication: Yup.number().typeError('Must be a number').required('Communication is required').min(0).max(100),
//     confidence: Yup.number().typeError('Must be a number').required('Confidence is required').min(0).max(100),
//     goal: Yup.number().typeError('Must be a number').required('Goal is required').min(0).max(100),
//     subjectKnowlage: Yup.number().typeError('Must be a number').required('Subject Knowledge is required').min(0).max(100),
//     assignmentMarks: Yup.number().typeError('Must be a number').required('Assignment Marks is required').min(0).max(100),
//     sincerity: Yup.number().typeError('Must be a number').required('Sincerity is required').min(0).max(100),
//     maths: Yup.number().typeError('Must be a number').required('Maths marks are required').min(0).max(100),
//     reasoning: Yup.number().typeError('Must be a number').required('Reasoning marks are required').min(0).max(100),
//     marks: Yup.number().typeError('Must be a number').required('Total Marks are required').min(0).max(100),
//     remark: Yup.string().required('Remark is required'),
//     date: Yup.string().required('Date is required'),
//     created_by: Yup.string().required('Created By is required'),
//     result: Yup.string().required('Result is required'),
//   });

//   const [createInterview, { isLoading }] = useInterviewCreateMutation();

//   const handleSubmit = async (values) => { // Formik passes values directly
//     const payload = {
//       ...values,
//       created_by: values.created_by || 'admin', // Use value from form, fallback to 'admin'
//       studentId: studentId,
//     };

//     try {
//       await createInterview(payload).unwrap();
//       if (refetch) refetch(); // auto-refresh parent data
//       onClose(); // close modal
//     } catch (err) {
//       console.error('Interview submission failed:', err);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl py-4 px-6 w-full max-w-4xl h-[95vh] overflow-y-auto no-scrollbar relative">
//         <h2 className="text-2xl font-bold text-center text-orange-500 mb-4">Schedule Interview</h2>
//         <Formik
//           initialValues={initialValues}
//           validationSchema={validationSchema}
//           onSubmit={handleSubmit}
//         >
//           {() => ( // Pass errors, touched, values from Formik
//             <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

//               {/* Select Round */}
//               <SelectInput
//                 label="Round"
//                 name="round"
//                 disabled={true}
//                 options={[
//                   { value: 'First', label: 'Technical Round' },
//                   // { value: 'Second', label: 'Final Round' },
//                 ]}
//               />

//               <TextInput
//                 label="Attempt No"
//                 name="attemptNo"
//                 type="number"
//                 value={attempted + 1}
//                 disabled={true}
//               />

//               <TextInput
//                 label="Assignment"
//                 name="assignment"
//               />

//               <TextInput label="Communication" name="communication" type="number" />
//               <TextInput label="Confidence" name="confidence" type="number" />
//               <TextInput label="Goal" name="goal" type="number" />
//               <TextInput label="Subject Knowledge" name="subjectKnowlage" type="number" />
//               <TextInput label="Assignment Marks" name="assignmentMarks" type="number" />
//               <TextInput label="Sincerity" name="sincerity" type="number" />
//               <TextInput label="Maths" name="maths" type="number" />
//               <TextInput label="Reasoning" name="reasoning" type="number" />
//               <TextInput label="Total Marks" name="marks" type="number" />

//               <TextInput label="Remark" name="remark" />
//               <TextInput label="Created By" name="created_by" />

//               <TextInput label="Date" name="date" type="datetime-local" />
//               <SelectInput
//                 label="Result"
//                 name="result"
//                 options={[
//                   { value: 'Pass', label: 'Pass' },
//                   { value: 'Fail', label: 'Fail' },
//                   { value: 'Pending', label: 'Pending' },
//                 ]}
//               />

//               <div className="md:col-span-2 flex justify-end gap-4 mt-0">
//                 <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//                 >
//                   {isLoading ? 'Submitting...' : 'Submit'}
//                 </button>
//               </div>
//             </Form>
//           )}
//         </Formik>

//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-700"
//         >
//           &times;
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CustomTimeDate;
