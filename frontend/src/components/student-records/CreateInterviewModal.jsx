/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useCreateLevelInterviewMutation } from '../../redux/api/authApi';
import { Formik, Form, useFormikContext, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomDatePicker from './CustomDatePicker';

const CreateInterviewModal = ({ isOpen, onClose, studentId, refetchStudents }) => {
    const [createInterview, { isLoading }] = useCreateLevelInterviewMutation();
    const [studentName, setStudentName] = useState("");
    
    // Get student name when modal opens
    useEffect(() => {
        if (isOpen && studentId) {
            // Find student from localStorage or use a placeholder
            const students = JSON.parse(localStorage.getItem("students") || "[]");
            const student = students.find(s => s._id === studentId);
            if (student) {
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                setStudentName(fullName || "Student");
            } else {
                setStudentName("Student");
            }
        }
    }, [isOpen, studentId]);
    
    const initialValues = {
        Theoretical_Marks: '',
        Practical_Marks: '',
        Communication_Marks: '',
        marks: '',
        remark: '',
        date: new Date(),
        result: 'Pending',
    };
    
    const validationSchema = Yup.object().shape({
        Theoretical_Marks: Yup.number()
            .typeError('Must be a number')
            .min(1, 'Enter between 1 to 10')
            .max(10, 'Enter between 1 to 10')
            .required('Required'),
        Practical_Marks: Yup.number()
            .typeError('Must be a number')
            .min(1, 'Enter between 1 to 10')
            .max(10, 'Enter between 1 to 10')
            .required('Required'),
        Communication_Marks: Yup.number()
            .typeError('Must be a number')
            .min(1, 'Enter between 1 to 10')
            .max(10, 'Enter between 1 to 10')
            .required('Required'),
        marks: Yup.number().nullable(),
        remark: Yup.string(),
        date: Yup.date().required('Required'),
        result: Yup.string().required('Required'),
    });
    
    const handleSubmit = async (values, { resetForm }) => {
        try {
            await createInterview({
                id: studentId,
                data: values,
            }).unwrap();
            
            // Force immediate data refresh
            await refetchStudents();
            resetForm();
            onClose();
        } catch (err) {
            console.error(err);
            // Silently close even on error
            onClose();
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl py-4 px-6 w-full max-w-2xl relative">
                <h2 className="text-xl font-bold text-center text-orange-500 mb-4">Technical Interview Form</h2>
                
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue }) => (
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AutoMarksCalculator />
                            
                            {/* Interview Metadata */}
                            <div className="col-span-2 text-sm font-semibold text-gray-600 mt-2">Interview Details</div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                <input 
                                    type="text" 
                                    value={studentName} 
                                    disabled 
                                    className="w-full border p-3 rounded-lg bg-gray-100 cursor-not-allowed" 
                                />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <CustomDatePicker 
                                    name="date" 
                                    value={values.date}
                                    onChange={(e) => {
                                        const { name, value } = e;
                                        setFieldValue(name, value);
                                    }}
                                />
                                <ErrorMessage name="date" component="div" className="text-red-500 text-xs mt-1 border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800" />
                            </div>
                            
                            {/* Technical Knowledge */}
                            <div className="col-span-2 text-sm font-semibold text-gray-600 mt-4 ">Technical Evaluation</div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Theoretical Marks</label>
                                <input 
                                    type="number" 
                                    name="Theoretical_Marks" 
                                    value={values.Theoretical_Marks}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFieldValue(name, value);
                                    }}
                                    className="w-full border p-3 rounded-lg focus:outline-none @apply border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800" 
                                />
                                <ErrorMessage name="Theoretical_Marks" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Practical Marks</label>
                                <input 
                                    type="number" 
                                    name="Practical_Marks" 
                                    value={values.Practical_Marks}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFieldValue(name, value);
                                    }}
                                    className="w-full border p-3 rounded-lg focus:outline-none border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800" 
                                />
                                <ErrorMessage name="Practical_Marks" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Communication Marks</label>
                                <input 
                                    type="number" 
                                    name="Communication_Marks" 
                                    value={values.Communication_Marks}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFieldValue(name, value);
                                    }}
                                    className="w-full border p-3 rounded-lg focus:outline-none border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800" 
                                />
                                <ErrorMessage name="Communication_Marks" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                <input 
                                    type="number" 
                                    name="marks" 
                                    value={values.marks} 
                                    disabled 
                                    className="w-full border p-3 rounded-lg bg-gray-100 cursor-not-allowed" 
                                />
                            </div>
                            
                            {/* Summary & Decision */}
                            <div className="col-span-2 text-sm font-semibold text-gray-600 mt-4">Summary & Decision</div>
                            
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                                <select 
                                    name="result" 
                                    value={values.result}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFieldValue(name, value);
                                    }}
                                    className="w-full border p-3 rounded-lg focus:outline-none border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Pass">Pass</option>
                                    <option value="Fail">Fail</option>
                                </select>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remark / Feedback</label>
                                <textarea 
                                    name="remark" 
                                    value={values.remark}
                                    onChange={(e) => {
                                        const { name, value } = e.target;
                                        setFieldValue(name, value);
                                    }}
                                    className="w-full border p-3 rounded-lg focus:outline-none min-h-[80px] border-2 rounded-md px-3 py-2 focus:outline-none focus:border-gray-800" 
                                />
                            </div>
                            
                            <div className="col-span-2 flex justify-center mt-4 gap-4">
                                <button 
                                    type="button" 
                                    onClick={() => onClose()} 
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="bg-brandYellow text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
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

export default CreateInterviewModal;

// Auto-calculate total marks
const AutoMarksCalculator = () => {
    const { values, setFieldValue } = useFormikContext();
  
    useEffect(() => {
      // Get the current values and convert to numbers
      const theoretical = parseFloat(values.Theoretical_Marks) || 0;
      const practical = parseFloat(values.Practical_Marks) || 0;
      const communication = parseFloat(values.Communication_Marks) || 0;
      
      // Calculate total
      const total = theoretical + practical + communication;
      
      // Update the total marks field
      setFieldValue("marks", total);
    }, [values.Theoretical_Marks, values.Practical_Marks, values.Communication_Marks, setFieldValue]);
  
    return null;
};
