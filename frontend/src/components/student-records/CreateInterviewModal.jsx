/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useCreateLevelInterviewMutation } from '../../redux/api/authApi';
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
// import CustomDatePicker from './CustomDatePicker';
import DatePickerInput from "../datepickerInput/DatePickerInput";
import TextInput from '../common-components/common-feild/TextInput';
import CustomDropdown from '../common-components/common-feild/CustomDropdown';
import { toast } from 'react-toastify';
import InterviewSuccessModal from './InterviewSuccessModal';
import { buttonStyles } from '../../styles/buttonStyles';


const CreateInterviewModal = ({ isOpen, onClose, studentId, refetchStudents, interviewLevel }) => {
    const [createInterview, { isLoading }] = useCreateLevelInterviewMutation();
    const [studentName, setStudentName] = useState("");
    const [currentLevel, setCurrentLevel] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [interviewResult, setInterviewResult] = useState(null);

    // Get student name and current level when modal opens
    useEffect(() => {
        if (isOpen && studentId) {
            // Find student from localStorage or use a placeholder
            const students = JSON.parse(localStorage.getItem("students") || "[]");
            const student = students.find(s => s._id === studentId);
            if (student) {
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                setStudentName(fullName || "Student");

                // Use the interview level passed from parent component
                const actualCurrentLevel = interviewLevel || student.currentLevel || "1A";
                setCurrentLevel(actualCurrentLevel);

                console.log('Student:', student.firstName, 'Current Level:', actualCurrentLevel);
            } else {
                setStudentName("Student");
                setCurrentLevel("1A");
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
        Topic: '',
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
        Topic: Yup.string(),
    });

    const getNextLevel = (current, result) => {
        if (result !== 'Pass') return current;

        const levelProgression = {
            '1A': '1B',
            '1B': '1C',
            '1C': '2A',
            '2A': '2B',
            '2B': '2C',
            '2C': 'Completed'
        };

        return levelProgression[current] || current;
    };

    const handleSubmit = async (values, { resetForm }) => {
        try {
            await createInterview({
                id: studentId,
                data: values,
            }).unwrap();

            // Store interview result for success modal
            const nextLevel = getNextLevel(currentLevel, values.result);
            setInterviewResult({
                studentName,
                currentLevel,
                nextLevel,
                result: values.result
            });

            // Show success modal first, then close form
            setShowSuccessModal(true);
            resetForm();
            onClose();

            // Refresh data in background
            if (refetchStudents) {
                refetchStudents();
            }
        } catch (err) {
            console.error(err);
            onClose();
            toast.error(err?.data?.message || 'Failed to submit interview');
        }
    };

    if (!isOpen) return (
        <>
            {/* Success Modal - Show even when main modal is closed */}
            {showSuccessModal && (
                <InterviewSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    studentName={interviewResult?.studentName}
                    currentLevel={interviewResult?.currentLevel}
                    nextLevel={interviewResult?.nextLevel}
                    result={interviewResult?.result}
                />
            )}
        </>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl py-4 px-6 w-full max-w-2xl relative">
                    <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]">Technical Interview Form</h2>

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
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            value={studentName}
                                            disabled
                                            className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 bg-gray-100 cursor-not-allowed transition-all duration-200"
                                            placeholder=" "
                                        />
                                        <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                            Student Name
                                        </label>
                                    </div>
                                </div>

                                {/* <div className="col-span-2 md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <CustomDatePicker 
                                    name="date" 
                                    value={values.date}
                                    onChange={(e) => {
                                        const { name, value } = e;
                                        setFieldValue(name, value);
                                    }}
                                />
                                <ErrorMessage name="date" component="div" className="text-red-500 text-xs mt-1" />
                            </div> */}

                                <DatePickerInput name="date" label="Select Date" />

                                {/* Technical Knowledge */}
                                <div className="col-span-2 text-sm font-semibold text-gray-600 mt-4 ">Technical Evaluation</div>

                                <div className="col-span-2 md:col-span-1">
                                    <TextInput
                                        label="Theoretical Marks (1-10)"
                                        name="Theoretical_Marks"
                                        type="number"
                                    />
                                    {/* <p className="text-xs text-gray-500 mt-1">Enter marks between 1 to 10</p> */}
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <TextInput
                                        label="Practical Marks (1-10)"
                                        name="Practical_Marks"
                                        type="number"
                                    />
                                    {/* <p className="text-xs text-gray-500 mt-1">Enter marks between 1 to 10</p> */}
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <TextInput
                                        label="Communication Marks (1-10)"
                                        name="Communication_Marks"
                                        type="number"
                                    />
                                    {/* <p className="text-xs text-gray-500 mt-1">Enter marks between 1 to 10</p> */}
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <TextInput
                                        label="Total Marks (Auto-calculated)"
                                        name="marks"
                                        type="number"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Sum of all marks (Max: 30)</p>
                                </div>

                                {/* Summary & Decision */}
                                <div className="col-span-2 text-sm font-semibold text-gray-600 mt-4">Summary & Decision</div>

                                <div className="col-span-2 md:col-span-1">
                                    <CustomDropdown
                                        label="Result"
                                        name="result"
                                        options={[
                                            { value: "Pending", label: "Pending" },
                                            { value: "Pass", label: "Pass" },
                                            { value: "Fail", label: "Fail" }
                                        ]}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <TextInput
                                        label="Topic"
                                        name="Topic"
                                        className="[&_input]:bg-white [&_input]:-webkit-autofill:bg-white"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <TextInput
                                        label="Remark / Feedback"
                                        name="remark"
                                    />
                                </div>

                                <div className="col-span-2 mt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 rounded-lg disabled:opacity-50 ${buttonStyles.primary}`}
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

            {/* Success Modal - Always rendered */}
            {showSuccessModal && (
                <InterviewSuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    studentName={interviewResult?.studentName}
                    currentLevel={interviewResult?.currentLevel}
                    nextLevel={interviewResult?.nextLevel}
                    result={interviewResult?.result}
                />
            )}
        </>
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
