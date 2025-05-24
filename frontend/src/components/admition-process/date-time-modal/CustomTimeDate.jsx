/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useInterviewCreateMutation } from '../../../redux/api/authApi';

const CustomTimeDate = ({ isOpen, onClose, studentId, attemed }) => {
  const [formData, setFormData] = useState({
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
    created_by: '', // Can be replaced dynamically
    result: 'Pending'
  });

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      created_by: 'admin', // Replace with actual logged-in user
      studentId: studentId, // ✅ Use passed studentId here
    };

    try {
      await createInterview(payload).unwrap();
      onClose();
    } catch (err) {
      console.error('Interview submission failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[95vh] overflow-y-auto no-scrollbar relative">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-4">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Select Round */}
          <div>
            <label className="text-sm font-medium">Round</label>
            <select name="round" value={formData.round} disabled={true} onChange={handleChange} className="w-full border rounded p-2">
              <option value="First">Technical Round</option>
            </select>
          </div>

          <InputField label="Attempt No" name="attemptNo" value={attemed + 1} onChange={handleChange} type="number" disabled={true} />
          <InputField label="Assignment" name="assignment" value={formData.assignment} onChange={handleChange} />
          <InputField label="Communication" name="communication" value={formData.communication} onChange={handleChange} type="number" />
          <InputField label="Confidence" name="confidence" value={formData.confidence} onChange={handleChange} type="number" />
          <InputField label="Goal" name="goal" value={formData.goal} onChange={handleChange} type="number" />
          <InputField label="Subject Knowledge" name="subjectKnowlage" value={formData.subjectKnowlage} onChange={handleChange} type="number" />
          <InputField label="Assignment Marks" name="assignmentMarks" value={formData.assignmentMarks} onChange={handleChange} type="number" />
          <InputField label="Sincerity" name="sincerity" value={formData.sincerity} onChange={handleChange} type="number" />
          <InputField label="Maths" name="maths" value={formData.maths} onChange={handleChange} type="number" />
          <InputField label="Reasoning" name="reasoning" value={formData.reasoning} onChange={handleChange} type="number" />
          <InputField label="Total Marks" name="marks" value={formData.marks} onChange={handleChange} type="number" />

          <InputField label="Remark" name="remark" value={formData.remark} onChange={handleChange} />
          <InputField label="Created By" name="created_by" value={formData.created_by} onChange={handleChange} />

          <InputField label="Date" name="date" value={formData.date} onChange={handleChange} type="datetime-local" />
          <div>
            <label className="text-sm font-medium">Result</label>
            <select name="result" value={formData.result} onChange={handleChange} className="w-full border rounded p-2">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

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

// Reusable input component
const InputField = ({ label, name, value, onChange, type = 'text', disabled }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className="w-full border rounded p-2"
    />
  </div>
);

export default CustomTimeDate;

