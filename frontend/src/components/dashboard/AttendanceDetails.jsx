import { useState, useMemo, useEffect } from 'react';
import { useGetItegStudentAttendanceQuery } from '../../redux/api/authApi';
import { FiCalendar, FiFilter, FiEye} from 'react-icons/fi';
import { BsPersonFill, BsPersonFillCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import PageNavbar from '../common-components/navbar/PageNavbar';
import AttendanceCalendarModal from './AttendanceCalendarModal';
import AttendanceApiError from '../common-components/error-pages/AttendanceApiError';
import { useAttendanceErrorHandler } from '../../hooks/useAttendanceErrorHandler';
import { buttonStyles } from '../../styles/buttonStyles';
import DatePicker from '../common-components/DatePicker';

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
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--backgroundColor)]">
      <PageNavbar 
        title="ITEG Attendance Details" 
        subtitle="Detailed attendance records and analytics"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      />

      <div className="p-6">
        {/* Filters Section */}
        <div className="bg-[var(--backgroundColor)] border rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FiFilter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <DatePicker
                label="From Date"
                value={filters.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(value) => handleFilterChange('dateFrom', value)}
                className="black-calendar-icon"
              />
            </div>
            
            <div>
              <DatePicker
                label="To Date"
                value={filters.dateTo}
                min={filters.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(value) => handleFilterChange('dateTo', value)}
                className="black-calendar-icon"
              />
            </div>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsYearOpen(!isYearOpen)}
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight bg-white text-left focus:outline-none focus:border-black focus:ring-0 appearance-none flex items-center justify-between cursor-pointer transition-all duration-200"
              >
                <span className="text-gray-900">
                  {years.find(y => y.value === filters.year)?.label || 'Select Year'}
                </span>
                <span className={`ml-2 transition-transform duration-200 ${isYearOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Year
              </label>
              {isYearOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border"
                  style={{
                    background: `
                      linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                      linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                      white
                    `
                  }}
                >
                  {years.map((year) => (
                    <div
                      key={year.value}
                      onClick={() => {
                        handleFilterChange('year', year.value);
                        setIsYearOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                    >
                      {year.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGenderOpen(!isGenderOpen)}
                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight bg-white text-left focus:outline-none focus:border-black focus:ring-0 appearance-none flex items-center justify-between cursor-pointer transition-all duration-200"
              >
                <span className="text-gray-900">
                  {filters.gender === '' ? 'All' : filters.gender === 'male' ? 'Male' : 'Female'}
                </span>
                <span className={`ml-2 transition-transform duration-200 ${isGenderOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                Gender
              </label>
              {isGenderOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border"
                  style={{
                    background: `
                      linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                      linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                      white
                    `
                  }}
                >
                  <div
                    onClick={() => {
                      handleFilterChange('gender', '');
                      setIsGenderOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                  >
                    All
                  </div>
                  <div
                    onClick={() => {
                      handleFilterChange('gender', 'male');
                      setIsGenderOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                  >
                    Male
                  </div>
                  <div
                    onClick={() => {
                      handleFilterChange('gender', 'female');
                      setIsGenderOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                  >
                    Female
                  </div>
                </div>
              )}
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
                className="w-full bg-[#FDA92D] text-white px-3 py-3 rounded-md hover:bg-[#ED9A21] active:bg-[#B66816] transition-all duration-200"
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
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600">{overallStats.totalStudents}</p>
                </div>
                <FiEye className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Male Students</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.maleStudents}</p>
                </div>
                <BsPersonFill className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-900">Female Students</p>
                  <p className="text-2xl font-bold text-pink-600">{overallStats.femaleStudents}</p>
                </div>
                <BsPersonFillCheck className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Avg Attendance</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.avgAttendance}%</p>
                </div>
                <FiCalendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-[var(--backgroundColor)] border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Attendance Records</h3>
            <div className="flex justify-between items-center">
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
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${buttonStyles.primary}`}
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
            <div className="flex justify-end items-center gap-6 px-6 py-4 border-t border-gray-200 bg-[var(--backgroundColor)] rounded-b-lg text-sm">
              <span className="text-[var(--text-color)] font-medium">
                {filteredData.length === 0
                  ? "0"
                  : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredData.length
                  )} of ${filteredData.length}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 flex items-center justify-center text-[var(--text-color)] disabled:opacity-40"
                >
                  <span className="text-3xl">‹</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 text-md flex items-center justify-center text-[var(--text-color)] disabled:opacity-40"
                >
                  <span className="text-3xl">›</span>
                </button>
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