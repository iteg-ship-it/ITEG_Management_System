import React, { useState, useEffect, useMemo } from 'react';
import { FaUpload, FaUsers, FaEye } from 'react-icons/fa';
import { Search } from 'lucide-react';
import LevelTaskUploadModal from './LevelTaskUploadModal';
import { taskAPI } from '../../services/taskService';
import { useAdmitedStudentsQuery } from '../../redux/api/authApi';
import CommonTable from '../common-components/table/CommonTable';

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
    refetchOnReconnect: true,
  });

  const levels = ['1A', '1B', '1C', '2A', '2B', '2C'];

  // Table columns configuration
  const tableColumns = [
    {
      key: 'fullName',
      label: 'Student Name',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FDA92D]/20 rounded-full flex items-center justify-center">
            <span className="text-[#FDA92D] font-semibold text-sm">
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">{student.course}</div>
          </div>
        </div>
      )
    },
    {
      key: 'currentLevel',
      label: 'Level',
      align: 'center',
      render: (student) => (
        <span className="px-2 py-1 bg-[#FDA92D]/10 text-[#FDA92D] rounded-full text-sm font-medium">
          {student.currentLevel}
        </span>
      )
    },
    {
      key: 'taskProgress',
      label: 'Task Progress',
      align: 'center',
      render: (student) => {
        const completed = student.taskStats?.completed || 0;
        const total = student.totalTasks || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm font-medium">{completed}/{total}</div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">{percentage}%</div>
          </div>
        );
      }
    },
    {
      key: 'pendingTasks',
      label: 'Pending',
      align: 'center',
      render: (student) => (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          {student.taskStats?.pending || 0}
        </span>
      )
    },
    {
      key: 'inProgressTasks',
      label: 'In Progress',
      align: 'center',
      render: (student) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {student.taskStats?.['in-progress'] || 0}
        </span>
      )
    },
    {
      key: 'completedTasks',
      label: 'Completed',
      align: 'center',
      render: (student) => (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {student.taskStats?.completed || 0}
        </span>
      )
    },
    {
      key: 'readinessStatus',
      label: 'Status',
      align: 'center',
      render: (student) => (
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            student.readinessStatus === 'Ready for Interview' 
              ? 'bg-green-100 text-green-800' 
              : student.readinessStatus === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {student.readinessStatus || 'Not Ready'}
          </span>
          {student.techno && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {student.techno}
            </span>
          )}
        </div>
      )
    }
  ];

  // Action button for each row
  const actionButton = (student) => (
    <button
      onClick={() => window.open(`/student-profile/${student._id}`, '_blank')}
      className="flex items-center gap-2 px-3 py-1 text-[#FDA92D] hover:text-[#E6941A] hover:bg-[#FDA92D]/10 rounded-lg transition-all duration-200"
      title="View Profile"
    >
      <FaEye className="text-sm" />
      <span className="text-sm">View</span>
    </button>
  );

  // Handle row click
  const handleRowClick = (student) => {
    window.open(`/student-profile/${student._id}`, '_blank');
  };

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

  // Refresh data when page becomes visible (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && admittedStudents.length > 0) {
        fetchStudentsByLevel(selectedLevel);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedLevel, admittedStudents]);

  const fetchStudentsByLevel = async (level) => {
    setLoading(true);
    try {
      // Always try to get fresh data with task statistics
      const result = await taskAPI.getStudentsByLevelWithTasks(level);
      if (result.students) {
        // Sort students by name to maintain consistent order
        const sortedStudents = result.students.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setStudents(sortedStudents);
      } else {
        // Fallback to regular filtering with consistent sorting
        const filteredStudents = admittedStudents
          .filter(student => student.currentLevel === level)
          .sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
          });
        setStudents(filteredStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to regular filtering with consistent sorting
      const filteredStudents = admittedStudents
        .filter(student => student.currentLevel === level)
        .sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
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
    // Force refetch of admitted students data
    refetch();
    // Small delay to ensure backend data is updated
    setTimeout(() => {
      fetchStudentsByLevel(selectedLevel);
    }, 1000);
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {levels.map((level) => (
          <div
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedLevel === level
                ? 'border-[#FDA92D] bg-[#FDA92D]/10 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <h3 className={`text-sm font-bold ${
                selectedLevel === level ? 'text-[#FDA92D]' : 'text-gray-800'
              }`}>
                Level {level}
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {levelStats[level] || 0}
              </p>
              <p className="text-xs text-gray-600">Students</p>
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
          <div className="flex border border-gray-300 rounded-md overflow-hidden w-full max-w-3xl h-12 bg-white relative focus-within:border-black transition-colors">
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
            <div
              className="absolute inset-0 cursor-text"
              onClick={() => document.querySelector('input[type="text"]').focus()}
            ></div>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Students Table */}
        {loading || isLoadingAdmitted ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDA92D] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CommonTable
              columns={tableColumns}
              data={filteredStudents}
              pagination={true}
              rowsPerPage={10}
              searchTerm=""
              onRowClick={handleRowClick}
            />
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
        students={students}
        onTasksUploaded={handleTasksUploaded}
      />
    </div>
  );
};

export default LevelWiseStudentManagement;