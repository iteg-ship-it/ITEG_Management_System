import { useState, useMemo } from 'react';
import { useGetItegStudentAttendanceQuery } from '../../redux/api/authApi';
import { FiCalendar, FiFilter, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageNavbar from '../common-components/navbar/PageNavbar';
import AttendanceCalendarModal from './AttendanceCalendarModal';
import AttendanceApiError from '../common-components/error-pages/AttendanceApiError';
import { useAttendanceErrorHandler } from '../../hooks/useAttendanceErrorHandler';

// Helper function to get current week dates
const getCurrentWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
  
  return {
    dateFrom: startOfWeek.toISOString().split('T')[0],
    dateTo: endOfWeek.toISOString().split('T')[0]
  };
};

const AttendanceDetails = () => {
  const navigate = useNavigate();
  const currentWeek = getCurrentWeekDates();
  const [filters, setFilters] = useState({
    dateFrom: currentWeek.dateFrom,
    dateTo: currentWeek.dateTo,
    year: 'I',
    gender: ''
  });
  const [dateError, setDateError] = useState('');

  const { data: attendanceData, isLoading, error } = useGetItegStudentAttendanceQuery({
    year: filters.year,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo
  });
  
  // Handle attendance API errors gracefully
  useAttendanceErrorHandler(error, !!error, 'Student Attendance');

  const handleFilterChange = (field, value) => {
    const today = new Date().toISOString().split('T')[0];
    
    if ((field === 'dateFrom' || field === 'dateTo') && value > today) {
      setDateError('Cannot select future dates');
      return;
    }
    
    const newFilters = { ...filters, [field]: value };
    
    if (field === 'dateFrom' || field === 'dateTo') {
      if (newFilters.dateFrom && newFilters.dateTo) {
        if (new Date(newFilters.dateTo) < new Date(newFilters.dateFrom)) {
          setDateError('End date must be equal to or greater than start date');
          return;
        }
      }
    }
    
    setDateError('');
    setFilters(newFilters);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!attendanceData?.data?.students) return [];
    
    let filtered = attendanceData.data.students;
    
    if (filters.gender) {
      filtered = filtered.filter(student => 
        student.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    return filtered;
  }, [attendanceData, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const overallStats = useMemo(() => {
    if (!attendanceData?.data?.students) return null;
    
    const students = attendanceData.data.students;
    const totalStudents = students.length;
    const maleStudents = students.filter(s => s.gender?.toLowerCase() === 'male').length;
    const femaleStudents = students.filter(s => s.gender?.toLowerCase() === 'female').length;
    
    const avgAttendance = students.reduce((sum, student) => {
      return sum + parseFloat(student.attendancePercent.replace('%', ''));
    }, 0) / totalStudents;
    
    return {
      totalStudents,
      maleStudents,
      femaleStudents,
      avgAttendance: avgAttendance.toFixed(2)
    };
  }, [attendanceData]);



  const years = [{ value: 'All', label: 'All Year' }, { value: 'I', label: 'I Year' }, { value: 'II', label: 'II Year' }, { value: 'III', label: 'III Year' }];

  return (
    <div className="min-h-screen">
      <PageNavbar 
        title="ITEG Attendance Details" 
        subtitle="Detailed attendance records and analytics"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />

      <div className="p-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateError('');
                  const currentWeek = getCurrentWeekDates();
                  setFilters({
                    dateFrom: currentWeek.dateFrom,
                    dateTo: currentWeek.dateTo,
                    year: 'I',
                    gender: ''
                  });
                }}
                className="w-full h-10 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          {dateError && (
            <div className="mt-3 text-sm text-red-600 font-medium">
              {dateError}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</p>
                </div>
                <FiEye className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Male Students</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.maleStudents}</p>
                </div>
                <FiEye className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-900">Female Students</p>
                  <p className="text-2xl font-bold text-pink-600">{overallStats.femaleStudents}</p>
                </div>
                <FiEye className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Avg Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.avgAttendance}%</p>
                </div>
                <FiCalendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Attendance Records</h3>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {paginatedData.length} of {filteredData.length} students for {years.find(y => y.value === filters.year)?.label || 'All Years'}
              </p>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading attendance data...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12">
                      <AttendanceApiError 
                        message="Attendance APIs are not working. Student attendance data is currently unavailable."
                      />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((student, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={student.stdId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{globalIndex}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {`${student.firstName} ${student.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.fathersName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">BCA</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.currentYear} Year</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {student.attendancePercent}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {student.totalLeave}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <FiCalendar className="w-3 h-3 mr-1" />
                            View Calendar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Calendar Modal */}
      <AttendanceCalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        initialDateFrom={filters.dateFrom}
        initialDateTo={filters.dateTo}
      />
    </div>
  );
};

export default AttendanceDetails;