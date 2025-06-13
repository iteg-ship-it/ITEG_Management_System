/* eslint-disable react/prop-types */
import { useFormik } from 'formik';
import { useCreateLevelInterviewMutation } from '../../redux/api/authApi';

const CreateInterviewModal = ({ isOpen, onClose, studentId, refetchStudents }) => {
    const [createInterview, { isLoading }] = useCreateLevelInterviewMutation();

    const formik = useFormik({
        initialValues: {
            Theoretical_Marks: '',
            Practical_Marks: '',
            Communication_Marks: '',
            marks: '',
            remark: '',
            date: new Date().toISOString().substring(0, 10),
            result: 'Pending',
        },
        onSubmit: async (values) => {
            try {
                await createInterview({
                    id: studentId,
                    data: values,
                }).unwrap();

                alert("Interview added successfully");

                refetchStudents(); // 🔁 Refresh student list
                formik.resetForm();
                onClose();
            } catch (err) {
                console.error(err);
                alert("Failed to add interview");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-orange-600 mb-6">Add Interview Round</h2>
                <form onSubmit={formik.handleSubmit} className="grid gap-4">
                    <input type="number" name="Theoretical_Marks" placeholder="Theoretical Marks" onChange={formik.handleChange} value={formik.values.Theoretical_Marks} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input type="number" name="Practical_Marks" placeholder="Practical Marks" onChange={formik.handleChange} value={formik.values.Practical_Marks} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input type="number" name="Communication_Marks" placeholder="Communication Marks" onChange={formik.handleChange} value={formik.values.Communication_Marks} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input type="number" name="marks" placeholder="Total Marks" onChange={formik.handleChange} value={formik.values.marks} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input type="text" name="remark" placeholder="Remark" onChange={formik.handleChange} value={formik.values.remark} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input type="date" name="date" onChange={formik.handleChange} value={formik.values.date} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <select name="result" onChange={formik.handleChange} value={formik.values.result} className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { formik.resetForm(); onClose(); }} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInterviewModal;


// /* eslint-disable react/prop-types */
// // components/CreateInterviewModal.jsx
// import { useFormik } from 'formik';
// import { useCreateLevelInterviewMutation } from '../../redux/api/authApi';

// const CreateInterviewModal = ({ isOpen, onClose, studentId }) => {
//     const [createInterview, { isLoading }] = useCreateLevelInterviewMutation();

//     const formik = useFormik({
//         initialValues: {
//             Theoretical_Marks: '',
//             Practical_Marks: '',
//             Communication_Marks: '',
//             marks: '',
//             remark: '',
//             date: new Date().toISOString().substring(0, 10),
//             result: 'Pending',
//         },
//         onSubmit: async (values) => {
//             try {
//                 await createInterview({
//                     id: studentId,
//                     data: values,
//                 }).unwrap();
//                 console.log(createInterview);

//                 alert("Interview added successfully");

//                 onClose();
//             } catch (err) {
//                 console.error(err);
//                 alert("Failed to add interview");
//             }
//         },
//     });

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-full max-w-md">
//                 <h2 className="text-xl text-orange-600 text-center font-bold mb-4">Add Interview Round</h2>
//                 <form onSubmit={formik.handleSubmit} className="space-y-4">
//                     <input type="number" name="Theoretical_Marks" placeholder="Theoretical Marks" onChange={formik.handleChange} value={formik.values.Theoretical_Marks} className="w-full border p-2 rounded" />
//                     <input type="number" name="Practical_Marks" placeholder="Practical Marks" onChange={formik.handleChange} value={formik.values.Practical_Marks} className="w-full border p-2 rounded" />
//                     <input type="number" name="Communication_Marks" placeholder="Communication Marks" onChange={formik.handleChange} value={formik.values.Communication_Marks} className="w-full border p-2 rounded" />
//                     <input type="number" name="marks" placeholder="Total Marks" onChange={formik.handleChange} value={formik.values.marks} className="w-full border p-2 rounded" />
//                     <input type="text" name="remark" placeholder="Remark" onChange={formik.handleChange} value={formik.values.remark} className="w-full border p-2 rounded" />
//                     <input type="date" name="date" onChange={formik.handleChange} value={formik.values.date} className="w-full border p-2 rounded" />
//                     <select name="result" onChange={formik.handleChange} value={formik.values.result} className="w-full border p-2 rounded">
//                         <option value="Pass">Pass</option>
//                         <option value="Fail">Fail</option>
//                         <option value="Pending">Pending</option>
//                     </select>

//                     <div className="flex justify-end space-x-2">
//                         <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
//                         <button type="submit" disabled={isLoading} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
//                             {isLoading ? "Submitting..." : "Submit"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateInterviewModal;
