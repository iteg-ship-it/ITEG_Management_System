import React, { useState, useEffect, useMemo } from 'react';
import { FaUpload, FaUsers, FaEye, FaFilter } from 'react-icons/fa';
import LevelTaskUploadModal from './LevelTaskUploadModal';
import { taskAPI } from '../../services/taskService';
import { useAdmitedStudentsQuery } from '../../redux/api/authApi';
import CommonTable from '../common-components/table/CommonTable';
import SearchBox from '../common-components/seach-export/SearchBox';

const LevelWiseStudentManagement = () => {
  const [selectedLevel, setSelectedLevel] = useState('1A');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [levelStats, setLevelStats] = useState({});
  const [isTaskUploadModalOpen, setIsTaskUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  
  // Get admitted students data
  const { data: admittedStudents = [], isLoading: isLoadingAdmitted, refetch } = useAdmitedStudentsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const levels = ['1A', '1B', '1C', '2A', '2B', '2C'];

  // Table columns configuration - memoized to update when selectedSubject changes
  const tableColumns = useMemo(() => [
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
      key: 'subjectProgress',
      label: 'Subject Progress',
      align: 'center',
      render: (student) => {
        if (selectedSubject === 'all' || !student.subjectTaskStats || !student.subjectTaskStats[selectedSubject]) {
          return (
            <div className="text-xs text-gray-500">-</div>
          );
        }
        
        const subjectStats = student.subjectTaskStats[selectedSubject];
        const total = subjectStats.pending + subjectStats['in-progress'] + subjectStats.completed;
        const completed = subjectStats.completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="text-xs font-medium text-[#FDA92D]">{selectedSubject}</div>
            <div className="text-sm font-medium">{completed}/{total}</div>
            <div className="w-12 bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${
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
      label: selectedSubject !== 'all' ? `${selectedSubject} Pending` : 'Pending',
      align: 'center',
      render: (student) => {
        let count = 0;
        if (selectedSubject !== 'all' && student.subjectTaskStats && student.subjectTaskStats[selectedSubject]) {
          count = student.subjectTaskStats[selectedSubject].pending || 0;
        } else {
          count = student.taskStats?.pending || 0;
        }
        
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {count}
          </span>
        );
      }
    },
    {
      key: 'inProgressTasks',
      label: selectedSubject !== 'all' ? `${selectedSubject} In Progress` : 'In Progress',
      align: 'center',
      render: (student) => {
        let count = 0;
        if (selectedSubject !== 'all' && student.subjectTaskStats && student.subjectTaskStats[selectedSubject]) {
          count = student.subjectTaskStats[selectedSubject]['in-progress'] || 0;
        } else {
          count = student.taskStats?.['in-progress'] || 0;
        }
        
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {count}
          </span>
        );
      }
    },
    {
      key: 'completedTasks',
      label: selectedSubject !== 'all' ? `${selectedSubject} Completed` : 'Completed',
      align: 'center',
      render: (student) => {
        let count = 0;
        if (selectedSubject !== 'all' && student.subjectTaskStats && student.subjectTaskStats[selectedSubject]) {
          count = student.subjectTaskStats[selectedSubject].completed || 0;
        } else {
          count = student.taskStats?.completed || 0;
        }
        
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {count}
          </span>
        );
      }
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
  ], [selectedSubject]);

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

  // Filter students based on search term, subject, and status
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((student) => {
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
    }
    
    // Apply subject and status filters
    if (selectedSubject !== 'all' || selectedStatus !== 'all') {
      filtered = filtered.filter((student) => {
        if (!student.subjectTaskStats) return false;
        
        // If subject is selected, check if student has tasks in that subject
        if (selectedSubject !== 'all') {
          const subjectStats = student.subjectTaskStats[selectedSubject];
          if (!subjectStats) return false;
          
          // If status is also selected, check the specific status count
          if (selectedStatus !== 'all') {
            return subjectStats[selectedStatus] > 0;
          }
          
          // If only subject is selected, show students with any tasks in that subject
          return (subjectStats.pending + subjectStats['in-progress'] + subjectStats.completed) > 0;
        }
        
        return true;
      });
    }
    
    return filtered;
  }, [students, searchTerm, selectedSubject, selectedStatus]);

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
        
        // Extract unique subjects from all students' tasks
        const subjects = new Set();
        sortedStudents.forEach(student => {
          if (student.subjectTaskStats) {
            Object.keys(student.subjectTaskStats).forEach(subject => {
              subjects.add(subject);
            });
          }
        });
        setAvailableSubjects(Array.from(subjects).sort());
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
        setAvailableSubjects([]);
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
      setAvailableSubjects([]);
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
    // Reset filters to show new data
    setSelectedSubject('all');
    setSelectedStatus('all');
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
          
          <div className="flex items-center gap-4">
            {/* Dynamic Filters */}
            <div className="flex items-center gap-3">
              <FaFilter className="text-gray-600 text-sm" />
              {/* Subject Filter */}
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    if (e.target.value === 'all') {
                      setSelectedStatus('all');
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDA92D] focus:border-transparent min-w-[140px] appearance-none transition-all duration-200"
                  style={{
                    background: selectedSubject !== 'all' ? `
                      linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                      linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                      white
                    ` : 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSubject === 'all') {
                      e.target.style.background = `
                        linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                        linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                        white
                      `;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSubject === 'all') {
                      e.target.style.background = 'white';
                    }
                  }}
                >
                  <option value="all">All Subjects</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter - Only show when subject is selected */}
              {selectedSubject !== 'all' && (
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDA92D] focus:border-transparent min-w-[120px] appearance-none transition-all duration-200"
                    style={{
                      background: selectedStatus !== 'all' ? `
                        linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                        linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                        white
                      ` : 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedStatus === 'all') {
                        e.target.style.background = `
                          linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                          linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                          white
                        `;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedStatus === 'all') {
                        e.target.style.background = 'white';
                      }
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              
              {/* Clear Filters */}
              {(selectedSubject !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedStatus('all');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              onClick={() => setIsTaskUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#FDA92D] hover:bg-[#E6941A] text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FaUpload className="text-sm" />
              Upload Tasks for Level {selectedLevel}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-72">
              <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            
            {/* Filter Results Info */}
            {(searchTerm || selectedSubject !== 'all' || selectedStatus !== 'all') && (
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedSubject !== 'all' && ` in ${selectedSubject}`}
                {selectedStatus !== 'all' && ` with ${selectedStatus} tasks`}
              </div>
            )}
          </div>
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