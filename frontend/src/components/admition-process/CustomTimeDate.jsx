
/* eslint-disable react/prop-types */
import { useInterviewCreateMutation } from '../../redux/api/authApi';
import { Formik, Form } from 'formik'; // Import Formik and Form
import * as Yup from 'yup'; // Import Yup for validation

// Assuming these are your common components
import TextInput from '../common-components/common-feild/TextInput';
import SelectInput from '../common-components/common-feild/SelectInput';

const CustomTimeDate = ({ isOpen, onClose, studentId ,attempted}) => {
  // initialValues for Formik
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
    created_by: '', // Will be set dynamically to 'admin'
    result: 'Pending'
  };

  // Basic validation schema for Formik
  const validationSchema = Yup.object().shape({
    round: Yup.string().required('Round is required'),
    // attemptNo: Yup.number().typeError('Must be a number').required('Attempt No is required').min(1),
    assignment: Yup.string().required('Assignment is required'),
    communication: Yup.number().typeError('Must be a number').required('Communication is required').min(0).max(100),
    confidence: Yup.number().typeError('Must be a number').required('Confidence is required').min(0).max(100),
    goal: Yup.number().typeError('Must be a number').required('Goal is required').min(0).max(100),
    subjectKnowlage: Yup.number().typeError('Must be a number').required('Subject Knowledge is required').min(0).max(100),
    assignmentMarks: Yup.number().typeError('Must be a number').required('Assignment Marks is required').min(0).max(100),
    sincerity: Yup.number().typeError('Must be a number').required('Sincerity is required').min(0).max(100),
    maths: Yup.number().typeError('Must be a number').required('Maths marks are required').min(0).max(100),
    reasoning: Yup.number().typeError('Must be a number').required('Reasoning marks are required').min(0).max(100),
    marks: Yup.number().typeError('Must be a number').required('Total Marks are required').min(0).max(100),
    remark: Yup.string().required('Remark is required'),
    date: Yup.string().required('Date is required'),
    created_by: Yup.string().required('Created By is required'),
    result: Yup.string().required('Result is required'),
  });

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const handleSubmit = async (values) => { // Formik passes values directly
    const payload = {
      ...values,
      created_by: values.created_by || 'admin', // Use value from form, fallback to 'admin'
      studentId: studentId,
    };

    try {
      await createInterview(payload).unwrap();
      onClose();
    } catch (err) {
      console.error('Interview submission failed:', err);
      // You might want to show a user-friendly error message here
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
          {() => ( // Pass errors, touched, values from Formik
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

              {/* Select Round */}
              <SelectInput
                label="Round"
                name="round"
                disabled={true}
                options={[
                  { value: 'First', label: 'Technical Round' },
                  // { value: 'Second', label: 'Final Round' },
                ]}
              />

            <TextInput
  label="Attempt No"
  name="attemptNo"
  type="number"
  value={attempted + 1}
  disabled={true}
/>

<TextInput
  label="Assignment"
  name="assignment"
/>

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

              <div className="md:col-span-2 flex justify-end gap-4 mt-0">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
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
// import { useState } from 'react';
// import { useInterviewCreateMutation } from '../../redux/api/authApi';

// const CustomTimeDate = ({ isOpen, onClose, studentId, attemed }) => {
//   const [formData, setFormData] = useState({
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
//     created_by: '', // Can be replaced dynamically
//     result: 'Pending'
//   });

//   const [createInterview, { isLoading }] = useInterviewCreateMutation();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       ...formData,
//       created_by: 'admin', // Replace with actual logged-in user
//       studentId: studentId, // ✅ Use passed studentId here
//     };

//     try {
//       await createInterview(payload).unwrap();
//       onClose();
//     } catch (err) {
//       console.error('Interview submission failed:', err);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[95vh] overflow-y-auto no-scrollbar relative">
//         <h2 className="text-2xl font-bold text-center text-orange-500 mb-4">Schedule Interview</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

//           {/* Select Round */}
//           <div>
//             <label className="text-sm font-medium">Round</label>
//             <select name="round" value={formData.round} disabled={true} onChange={handleChange} className="w-full border rounded p-2">
//               <option value="First">Technical Round</option>
//             </select>
//           </div>

//           <InputField label="Attempt No" name="attemptNo" value={attemed + 1} onChange={handleChange} type="number" disabled={true} />
//           <InputField label="Assignment" name="assignment" value={formData.assignment} onChange={handleChange} />
//           <InputField label="Communication" name="communication" value={formData.communication} onChange={handleChange} type="number" />
//           <InputField label="Confidence" name="confidence" value={formData.confidence} onChange={handleChange} type="number" />
//           <InputField label="Goal" name="goal" value={formData.goal} onChange={handleChange} type="number" />
//           <InputField label="Subject Knowledge" name="subjectKnowlage" value={formData.subjectKnowlage} onChange={handleChange} type="number" />
//           <InputField label="Assignment Marks" name="assignmentMarks" value={formData.assignmentMarks} onChange={handleChange} type="number" />
//           <InputField label="Sincerity" name="sincerity" value={formData.sincerity} onChange={handleChange} type="number" />
//           <InputField label="Maths" name="maths" value={formData.maths} onChange={handleChange} type="number" />
//           <InputField label="Reasoning" name="reasoning" value={formData.reasoning} onChange={handleChange} type="number" />
//           <InputField label="Total Marks" name="marks" value={formData.marks} onChange={handleChange} type="number" />

//           <InputField label="Remark" name="remark" value={formData.remark} onChange={handleChange} />
//           <InputField label="Created By" name="created_by" value={formData.created_by} onChange={handleChange} />

//           <InputField label="Date" name="date" value={formData.date} onChange={handleChange} type="datetime-local" />
//           <div>
//             <label className="text-sm font-medium">Result</label>
//             <select name="result" value={formData.result} onChange={handleChange} className="w-full border rounded p-2">
//               <option value="Pass">Pass</option>
//               <option value="Fail">Fail</option>
//               <option value="Pending">Pending</option>
//             </select>
//           </div>
//         </form>

//         <div className="flex justify-end gap-4 mt-6">
//           <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             disabled={isLoading}
//             className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//           >
//             {isLoading ? 'Submitting...' : 'Submit'}
//           </button>
//         </div>

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

// // Reusable input component
// const InputField = ({ label, name, value, onChange, type = 'text', disabled }) => (
//   <div>
//     <label className="text-sm font-medium">{label}</label>
//     <input
//       type={type}
//       name={name}
//       value={value}
//       disabled={disabled}
//       onChange={onChange}
//       className="w-full border rounded p-2"
//     />
//   </div>
// );

// export default CustomTimeDate;

