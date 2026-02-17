import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaFileExcel, FaTimes, FaPlus, FaUsers, FaCheck } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { taskAPI } from '../../services/taskService';

const LevelTaskUploadModal = ({ isOpen, onClose, level, onTasksUploaded, students = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [assignmentType, setAssignmentType] = useState('all'); // 'all' or 'selected'
  const [selectedStudents, setSelectedStudents] = useState([]);
  const fileInputRef = useRef(null);
  
  const [manualTask, setManualTask] = useState({
    title: '',
    description: '',
    subject: '',
    customSubject: '',
    priority: '2nd',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 2MB.');
      event.target.value = '';
      return;
    }

    // Check file type
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please select a valid Excel file (.xlsx, .xls, .csv)');
      event.target.value = '';
      return;
    }

    setIsProcessingFile(true);
    
    try {
      // Use setTimeout to prevent blocking
      setTimeout(async () => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);
          
          // Process in smaller chunks
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellNF: false,
            cellText: false
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          // Strict limit to prevent hanging
          if (jsonData.length > 50) {
            alert('Too many rows. Please limit to 50 tasks per upload.');
            event.target.value = '';
            setIsProcessingFile(false);
            return;
          }

          if (jsonData.length === 0) {
            alert('No data found in the file. Please check the file format.');
            event.target.value = '';
            setIsProcessingFile(false);
            return;
          }

          const parsedTasks = jsonData.map((row, index) => ({
            title: String(row.Title || row.title || `Task ${index + 1}`).trim(),
            description: String(row.Description || row.description || '').trim(),
            subject: String(row.Subject || row.subject || '').trim(),
            priority: String(row.Priority || row.priority || '2nd').toLowerCase().trim(),
            dueDate: row.DueDate || row.dueDate || new Date().toISOString().split('T')[0]
          })).filter(task => task.title && task.description && task.subject);

          if (parsedTasks.length === 0) {
            alert('No valid tasks found. Please check required fields: Title, Description, Subject.');
            event.target.value = '';
            setIsProcessingFile(false);
            return;
          }

          setTasks(parsedTasks);
          event.target.value = '';
          setIsProcessingFile(false);
        } catch (error) {
          console.error('File parsing error:', error);
          alert('Error reading file. Please check the format and try again.');
          event.target.value = '';
          setIsProcessingFile(false);
        }
      }, 100);
    } catch (error) {
      console.error('File reading error:', error);
      alert('Error reading file. Please try again.');
      event.target.value = '';
      setIsProcessingFile(false);
    }
  };

  const addManualTask = () => {
    const finalSubject = manualTask.subject === 'Other' ? manualTask.customSubject : manualTask.subject;
    
    if (!manualTask.title.trim() || !manualTask.description.trim() || !finalSubject.trim()) {
      alert('Please fill all required fields');
      return;
    }

    setTasks([...tasks, { 
      ...manualTask, 
      subject: finalSubject 
    }]);
    setManualTask({
      title: '',
      description: '',
      subject: '',
      customSubject: '',
      priority: '2nd',
      dueDate: new Date().toISOString().split('T')[0]
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

    if (assignmentType === 'selected' && selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setIsUploading(true);
    try {
      let result;
      if (assignmentType === 'all') {
        result = await taskAPI.bulkUploadTasks(level, tasks);
      } else {
        result = await taskAPI.bulkUploadTasksToSelectedStudents(level, tasks, selectedStudents);
      }
      
      if (result.message) {
        alert(result.message);
        setTasks([]);
        setSelectedStudents([]);
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

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s._id));
  };

  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  const downloadTemplate = () => {
    const templateData = [
      { 
        Title: 'Complete JavaScript Assignment', 
        Description: 'Complete the JavaScript fundamentals assignment covering variables, functions, and loops', 
        Subject: 'JavaScript',
        Priority: '1st', 
        DueDate: '2024-01-15' 
      },
      { 
        Title: 'Prepare for Technical Interview', 
        Description: 'Review data structures and algorithms for upcoming technical interview', 
        Subject: 'Data Structures',
        Priority: '2nd', 
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
              <p className="text-sm text-gray-600 mb-4">Upload up to 50 tasks using Excel file (Max 2MB)</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingFile ? 'Processing...' : 'Choose File'}
              </button>
              {isProcessingFile && (
                <div className="mt-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FDA92D] mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Processing file, please wait...</p>
                </div>
              )}
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

          {/* Assignment Type Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">Task Assignment</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="all"
                  checked={assignmentType === 'all'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="text-[#FDA92D] focus:ring-[#FDA92D]"
                />
                <span className="text-sm font-medium text-gray-700">Assign to All Students in Level {level}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="selected"
                  checked={assignmentType === 'selected'}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="text-[#FDA92D] focus:ring-[#FDA92D]"
                />
                <span className="text-sm font-medium text-gray-700">Assign to Selected Students</span>
              </label>
            </div>
          </div>

          {/* Student Selection */}
          {assignmentType === 'selected' && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">Select Students ({selectedStudents.length}/{students.length})</h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllStudents}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllStudents}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => toggleStudentSelection(student._id)}
                      className="text-[#FDA92D] focus:ring-[#FDA92D] rounded"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-6 h-6 bg-[#FDA92D]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#FDA92D] font-semibold text-xs">
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    value={manualTask.subject}
                    onChange={(e) => setManualTask({ ...manualTask, subject: e.target.value, customSubject: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                  >
                    <option value="">Select Subject</option>
                    <option value="HTML/CSS">HTML/CSS</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="React">React</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Database">Database</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="System Design">System Design</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Project Work">Project Work</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Interview Prep">Interview Prep</option>
                    <option value="Other">Other</option>
                  </select>
                  {manualTask.subject === 'Other' && (
                    <input
                      type="text"
                      value={manualTask.customSubject}
                      onChange={(e) => setManualTask({ ...manualTask, customSubject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D] mt-2"
                      placeholder="Enter custom subject"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={manualTask.priority}
                    onChange={(e) => setManualTask({ ...manualTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#FDA92D]"
                  >
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {task.subject}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === '1st' ? 'bg-red-100 text-red-800' :
                          task.priority === '2nd' ? 'bg-yellow-100 text-yellow-800' :
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
            disabled={tasks.length === 0 || isUploading || (assignmentType === 'selected' && selectedStudents.length === 0)}
            className="flex-1 px-4 py-2 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 
              assignmentType === 'all' 
                ? `Upload ${tasks.length} Tasks to All Students` 
                : `Upload ${tasks.length} Tasks to ${selectedStudents.length} Students`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelTaskUploadModal;