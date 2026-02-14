import React, { useState, useRef } from 'react';
import { FaUpload, FaFileExcel, FaTimes, FaPlus } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { taskAPI } from '../../services/taskService';

const LevelTaskUploadModal = ({ isOpen, onClose, level, onTasksUploaded }) => {
  const [tasks, setTasks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const fileInputRef = useRef(null);
  
  const [manualTask, setManualTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedTasks = jsonData.map((row, index) => ({
          title: row.Title || row.title || `Task ${index + 1}`,
          description: row.Description || row.description || '',
          priority: (row.Priority || row.priority || 'medium').toLowerCase(),
          dueDate: row.DueDate || row.dueDate || new Date().toISOString().split('T')[0]
        }));

        setTasks(parsedTasks);
        event.target.value = '';
      } catch (error) {
        alert('Error reading file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addManualTask = () => {
    if (!manualTask.title.trim() || !manualTask.description.trim() || !manualTask.dueDate) {
      alert('Please fill all required fields');
      return;
    }

    setTasks([...tasks, { ...manualTask }]);
    setManualTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
    setShowManualForm(false);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const uploadTasks = async () => {
    if (tasks.length === 0) {
      alert('Please add some tasks first');
      return;
    }

    setIsUploading(true);
    try {
      const result = await taskAPI.bulkUploadTasks(level, tasks);
      
      if (result.message) {
        alert(result.message);
        setTasks([]);
        onTasksUploaded && onTasksUploaded();
        onClose();
      } else {
        alert('Error uploading tasks');
      }
    } catch (error) {
      console.error('Error uploading tasks:', error);
      alert('Error uploading tasks. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 
        Title: 'Complete JavaScript Assignment', 
        Description: 'Complete the JavaScript fundamentals assignment covering variables, functions, and loops', 
        Priority: 'High', 
        DueDate: '2024-01-15' 
      },
      { 
        Title: 'Prepare for Technical Interview', 
        Description: 'Review data structures and algorithms for upcoming technical interview', 
        Priority: 'Medium', 
        DueDate: '2024-01-20' 
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
    XLSX.writeFile(wb, `Level_${level}_Task_Template.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Upload Tasks for Level {level}</h2>
            <p className="text-sm text-gray-600">Add tasks that will be assigned to all students in Level {level}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">Upload Excel File</h3>
              <p className="text-sm text-gray-600 mb-4">Upload tasks in bulk using Excel file</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Manual Add */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FaPlus className="mx-auto text-3xl text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">Add Manually</h3>
              <p className="text-sm text-gray-600 mb-4">Add tasks one by one manually</p>
              <button
                onClick={() => setShowManualForm(true)}
                className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-medium transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>

          {/* Download Template */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800">Need a template?</h4>
                <p className="text-sm text-blue-600">Download our Excel template to get started</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FaFileExcel />
                Download Template
              </button>
            </div>
          </div>

          {/* Manual Task Form */}
          {showManualForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-4">Add New Task</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={manualTask.title}
                    onChange={(e) => setManualTask({ ...manualTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                    placeholder="Enter task title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={manualTask.description}
                    onChange={(e) => setManualTask({ ...manualTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                    rows="3"
                    placeholder="Enter task description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={manualTask.priority}
                    onChange={(e) => setManualTask({ ...manualTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={manualTask.dueDate}
                    onChange={(e) => setManualTask({ ...manualTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowManualForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addManualTask}
                  className="px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-medium transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          )}

          {/* Tasks Preview */}
          {tasks.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-4">Tasks to Upload ({tasks.length})</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800">{task.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTask(index)}
                      className="text-red-400 hover:text-red-600 transition-colors ml-3"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={uploadTasks}
            disabled={tasks.length === 0 || isUploading}
            className="flex-1 px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : `Upload ${tasks.length} Tasks`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelTaskUploadModal;