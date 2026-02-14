import React, { useState, useEffect, useMemo } from 'react';
import { FaUpload, FaUsers, FaEye } from 'react-icons/fa';
import { Search } from 'lucide-react';
import LevelTaskUploadModal from './LevelTaskUploadModal';
import { taskAPI } from '../../services/taskService';
import { useAdmitedStudentsQuery } from '../../redux/api/authApi';

const LevelWiseStudentManagement = () => {
  const [selectedLevel, setSelectedLevel] = useState('1A');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [levelStats, setLevelStats] = useState({});
  const [isTaskUploadModalOpen, setIsTaskUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get admitted students data
  const { data: admittedStudents = [], isLoading: isLoadingAdmitted, refetch } = useAdmitedStudentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const levels = ['1A', '1B', '1C', '2A', '2B', '2C'];

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    return students.filter((student) => {
      const searchFields = [
        student.firstName,
        student.lastName,
        `${student.firstName} ${student.lastName}`,
        student.studentMobile,
        student.village,
        student.course,
        student.techno,
        student.readinessStatus
      ];
      
      return searchFields.some(field => 
        field && String(field).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [students, searchTerm]);

  useEffect(() => {
    if (admittedStudents.length > 0) {
      fetchStudentsByLevel(selectedLevel);
      fetchLevelStats();
    }
  }, [selectedLevel, admittedStudents]);

  const fetchStudentsByLevel = async (level) => {
    setLoading(true);
    try {
      // Try to get students with task data first
      const result = await taskAPI.getStudentsByLevelWithTasks(level);
      if (result.students) {
        setStudents(result.students);
      } else {
        // Fallback to regular filtering
        const filteredStudents = admittedStudents.filter(student => 
          student.currentLevel === level
        );
        setStudents(filteredStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to regular filtering
      const filteredStudents = admittedStudents.filter(student => 
        student.currentLevel === level
      );
      setStudents(filteredStudents);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelStats = () => {
    try {
      const stats = {};
      for (const level of levels) {
        const levelStudents = admittedStudents.filter(student => 
          student.currentLevel === level
        );
        stats[level] = levelStudents.length;
      }
      setLevelStats(stats);
    } catch (error) {
      console.error('Error calculating level stats:', error);
    }
  };

  const handleTasksUploaded = () => {
    // Refresh students data when tasks are uploaded
    fetchStudentsByLevel(selectedLevel);
    refetch();
  };

  const getTaskCompletionColor = (completed, total) => {
    if (total === 0) return 'bg-gray-100 text-gray-600';
    const percentage = (completed / total) * 100;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Level-wise Student Management</h1>
        <p className="text-gray-600">Manage students and tasks by their current level</p>
      </div>

      {/* Level Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {levels.map((level) => (
          <div
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedLevel === level
                ? 'border-[#FDA92D] bg-[#FDA92D]/10 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <h3 className={`text-lg font-bold ${
                selectedLevel === level ? 'text-[#FDA92D]' : 'text-gray-800'
              }`}>
                Level {level}
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {levelStats[level] || 0}
              </p>
              <p className="text-sm text-gray-600">Students</p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Level Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FDA92D]/20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-[#FDA92D] text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Level {selectedLevel} Students</h2>
              <p className="text-gray-600">{students.length} students currently in this level</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsTaskUploadModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FaUpload className="text-sm" />
            Upload Tasks for Level {selectedLevel}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden max-w-md h-12 bg-white relative focus-within:border-[#FDA92D] transition-colors">
            <div className="flex items-center px-3 w-full">
              <Search className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search students by name, mobile, village..."
                className="outline-none border-none ring-0 focus:ring-0 px-2 py-2 w-full h-9 text-sm text-gray-600 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Students List */}
        {loading || isLoadingAdmitted ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA92D] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div key={student._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">Level {student.currentLevel}</p>
                    <p className="text-xs text-gray-500">{student.course}</p>
                  </div>
                  <button
                    onClick={() => window.open(`/student-profile/${student._id}`, '_blank')}
                    className="text-[#FDA92D] hover:text-[#E6941A] transition-colors"
                    title="View Profile"
                  >
                    <FaEye />
                  </button>
                </div>
                
                {/* Student Information */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Mobile:</span>
                      <span className="ml-1 font-medium">{student.studentMobile}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Village:</span>
                      <span className="ml-1 font-medium">{student.village}</span>
                    </div>
                  </div>
                  
                  {/* Task Statistics */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Tasks Progress:</span>
                      <span className="font-medium">
                        {student.taskStats?.completed || 0} / {student.totalTasks || 0}
                      </span>
                    </div>
                    
                    {student.totalTasks > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="px-2 py-1 rounded text-center bg-red-100 text-red-800">
                          <div className="font-medium">{student.taskStats?.pending || 0}</div>
                          <div>Pending</div>
                        </div>
                        <div className="px-2 py-1 rounded text-center bg-blue-100 text-blue-800">
                          <div className="font-medium">{student.taskStats?.['in-progress'] || 0}</div>
                          <div>In Progress</div>
                        </div>
                        <div className="px-2 py-1 rounded text-center bg-green-100 text-green-800">
                          <div className="font-medium">{student.taskStats?.completed || 0}</div>
                          <div>Completed</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.readinessStatus === 'Ready' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.readinessStatus || 'Not Ready'}
                    </span>
                    {student.techno && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.techno}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'No Students Found' : 'No Students Found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No students match "${searchTerm}" in Level ${selectedLevel}`
                : `No students are currently in Level ${selectedLevel}`
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 px-4 py-2 text-[#FDA92D] hover:text-[#E6941A] font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Upload Modal */}
      <LevelTaskUploadModal
        isOpen={isTaskUploadModalOpen}
        onClose={() => setIsTaskUploadModalOpen(false)}
        level={selectedLevel}
        onTasksUploaded={handleTasksUploaded}
      />
    </div>
  );
};

export default LevelWiseStudentManagement;