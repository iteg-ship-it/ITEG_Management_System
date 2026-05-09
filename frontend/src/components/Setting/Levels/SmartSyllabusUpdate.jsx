import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  useUpdateSyllabusSmartlyMutation, 
  usePreviewUpdateImpactMutation,
  useGetAffectedStudentsQuery 
} from '../../../redux/api/authApi';
import { FaUsers, FaLock, FaSync, FaEye, FaExclamationTriangle } from 'react-icons/fa';

const SmartSyllabusUpdate = ({ sessionId, subLevelId, currentSyllabus, onClose, onSuccess }) => {
  const [updateData, setUpdateData] = useState({
    title: currentSyllabus?.title || '',
    subjects: currentSyllabus?.subjects || [],
    changeLog: ''
  });
  const [showPreview, setShowPreview] = useState(false);

  const [updateSyllabus, { isLoading: updating }] = useUpdateSyllabusSmartlyMutation();
  const [previewImpact, { isLoading: previewing }] = usePreviewUpdateImpactMutation();
  const { data: affectedStudents } = useGetAffectedStudentsQuery(
    { sessionId, subLevelId },
    { skip: !showPreview }
  );

  const handlePreview = async () => {
    try {
      const result = await previewImpact({ sessionId, subLevelId }).unwrap();
      setShowPreview(true);
      toast.success('Impact preview loaded');
    } catch (error) {
      toast.error('Failed to load preview');
    }
  };

  const handleUpdate = async () => {
    if (!updateData.changeLog.trim()) {
      toast.error('Please provide a change log');
      return;
    }

    try {
      const result = await updateSyllabus({
        sessionId,
        subLevelId,
        ...updateData
      }).unwrap();

      toast.success(result.message);
      onSuccess?.(result);
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update syllabus');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Smart Syllabus Update</h2>
              <p className="text-blue-100">Update syllabus while preserving completed student progress</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Update Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Syllabus Changes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={updateData.title}
                  onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Syllabus title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Log <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateData.changeLog}
                  onChange={(e) => setUpdateData({ ...updateData, changeLog: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe what changes you're making..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Preview Impact Button */}
          <div className="flex justify-center">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FaEye />
              {previewing ? 'Loading Preview...' : 'Preview Impact'}
            </button>
          </div>

          {/* Impact Preview */}
          {showPreview && affectedStudents && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Update Impact Analysis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Completed Students (Protected) */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FaLock className="text-green-600" />
                    <h4 className="font-semibold text-green-800">Protected Students</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    These students have completed this level. Their syllabus will remain frozen.
                  </p>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {affectedStudents.data.completed.length}
                  </div>
                  {affectedStudents.data.completed.length > 0 && (
                    <div className="max-h-32 overflow-y-auto">
                      {affectedStudents.data.completed.slice(0, 5).map((student) => (
                        <div key={student.id} className="text-xs text-gray-600 py-1">
                          {student.name} ({student.prkey}) - v{student.frozenVersion}
                        </div>
                      ))}
                      {affectedStudents.data.completed.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{affectedStudents.data.completed.length - 5} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Students (Will Get Updates) */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FaSync className="text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Will Get Updates</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    These students are currently on this level and will receive the updated syllabus.
                  </p>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {affectedStudents.data.current.length}
                  </div>
                  {affectedStudents.data.current.length > 0 && (
                    <div className="max-h-32 overflow-y-auto">
                      {affectedStudents.data.current.slice(0, 5).map((student) => (
                        <div key={student.id} className="text-xs text-gray-600 py-1">
                          {student.name} ({student.prkey})
                        </div>
                      ))}
                      {affectedStudents.data.current.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{affectedStudents.data.current.length - 5} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Summary:</strong> {affectedStudents.data.completed.length} students will keep their original syllabus, 
                  {affectedStudents.data.current.length} students will get the updated version.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating || !updateData.changeLog.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Syllabus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSyllabusUpdate;