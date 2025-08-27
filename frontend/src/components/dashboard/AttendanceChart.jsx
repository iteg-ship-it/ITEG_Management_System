import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGetItegAttendanceQuery } from '../../redux/api/authApi';
import { FiCalendar, FiUsers, FiTrendingUp, FiSearch, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
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

const AttendanceChart = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getCurrentWeekDates());
  const [tempDateRange, setTempDateRange] = useState(getCurrentWeekDates());
  const [dateError, setDateError] = useState('');

  const { data: attendanceData, isLoading, error, refetch } = useGetItegAttendanceQuery(dateRange);
  
  // Handle attendance API errors gracefully
  useAttendanceErrorHandler(error, !!error, 'Attendance Chart');

  const chartData = useMemo(() => {
    if (!attendanceData?.data?.itegAttendanceList) return [];
    return attendanceData.data.itegAttendanceList.map(item => ({
      year: `Year ${item.year}`,
      attendance: parseFloat(item.attendancePercent.replace('%', '')),
      male: parseFloat(item.maleStudentPercent.replace('%', '')),
      female: parseFloat(item.femaleStudentPercent.replace('%', '')),
      totalStudents: item.totalStudents,
      totalAttendance: item.totalAttendance
    }));
  }, [attendanceData]);

  const pieData = useMemo(() => {
    if (!attendanceData?.data?.summary) return [];
    const { totalMaleStudents, totalFemaleStudents } = attendanceData.data.summary;
    return [
      { name: 'Male Students', value: totalMaleStudents, fill: '#3B82F6' },
      { name: 'Female Students', value: totalFemaleStudents, fill: '#EC4899' }
    ];
  }, [attendanceData]);

  const handleTempDateChange = (field, value) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prevent future dates
    if (value > today) {
      setDateError('Cannot select future dates');
      return;
    }
    
    const newRange = { ...tempDateRange, [field]: value };
    
    // Validate date range
    if (newRange.dateFrom && newRange.dateTo) {
      if (new Date(newRange.dateTo) < new Date(newRange.dateFrom)) {
        setDateError('End date must be equal to or greater than start date');
        return;
      }
    }
    
    setDateError('');
    setTempDateRange(newRange);
  };

  const handleSearch = () => {
    if (dateError) return;
    setDateRange(tempDateRange);
    refetch();
  };

  const handleReset = () => {
    const currentWeek = getCurrentWeekDates();
    setDateError('');
    setTempDateRange(currentWeek);
    setDateRange(currentWeek);
    refetch();
  };

  const handleViewAttendance = () => {
    navigate('/attendance-details');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Overall: <span className="font-medium">{data.attendance}%</span>
          </p>
          <p className="text-sm text-blue-500">
            Male: <span className="font-medium">{data.male}%</span>
          </p>
          <p className="text-sm text-pink-500">
            Female: <span className="font-medium">{data.female}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Students: <span className="font-medium">{data.totalStudents}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 0 22px 6px rgba(0, 0, 0, 0.09)' }}>
      <div className="px-6 py-4 border-b-2 border-gray-200 shadow-sm bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">ITEG Attendance Analytics</h3>
              <p className="text-sm text-gray-600">Year-wise attendance tracking and insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="w-4 h-4" />
            <span>Current Week: {dateRange.dateFrom} to {dateRange.dateTo}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Date Range Filters */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">From Date</label>
              <input
                type="date"
                value={tempDateRange.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleTempDateChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">To Date</label>
              <input
                type="date"
                value={tempDateRange.dateTo}
                min={tempDateRange.dateFrom}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleTempDateChange('dateTo', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={!!dateError}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm ${
                  dateError 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FiSearch className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors shadow-sm"
              >
                Reset
              </button>
              <button
                onClick={handleViewAttendance}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiEye className="w-4 h-4" />
                View Attendance
              </button>
            </div>
          </div>
          {dateError && (
            <div className="mt-2 text-sm text-red-600 font-medium">
              {dateError}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading attendance data...</p>
            </div>
          </div>
        ) : error ? (
          <AttendanceApiError 
            onRetry={refetch}
            message="Attendance APIs are not working. Please try again later."
          />
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseInt(attendanceData?.data?.summary?.totalITEGStudents) || 0}
                    </p>
                  </div>
                  <FiUsers className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Male Students</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseInt(attendanceData?.data?.summary?.totalMaleStudents) || 0}
                    </p>
                  </div>
                  <FiUsers className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-900">Female Students</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {parseInt(attendanceData?.data?.summary?.totalFemaleStudents) || 0}
                    </p>
                  </div>
                  <FiUsers className="w-8 h-8 text-pink-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Working Days</p>
                    <p className="text-2xl font-bold text-green-600">
                      {parseInt(attendanceData?.data?.dateRange?.workingDays) || 0}
                    </p>
                  </div>
                  <FiCalendar className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Year-wise Attendance</h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="male" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" fill="#EC4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Year-wise Details */}
            {attendanceData?.data?.itegAttendanceList && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {attendanceData.data.itegAttendanceList.map((yearData, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold text-gray-900">Year {yearData.year}</span>
                        <span className={`text-xl font-bold ${
                          parseFloat(yearData.attendancePercent) >= 80 ? 'text-green-600' :
                          parseFloat(yearData.attendancePercent) >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {yearData.attendancePercent}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Students:</span>
                          <span className="font-medium">{yearData.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Male:</span>
                          <span className="font-medium text-blue-600">{yearData.maleStudentPercent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Female:</span>
                          <span className="font-medium text-pink-600">{yearData.femaleStudentPercent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Attendance:</span>
                          <span className="font-medium">{yearData.totalAttendance}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Info */}
            {attendanceData?.data?.dateRange && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-6 text-sm text-blue-800">
                  <span>Period: {attendanceData.data.dateRange.from} to {attendanceData.data.dateRange.to}</span>
                  <span>•</span>
                  <span>Working Days: {attendanceData.data.dateRange.workingDays}</span>
                  <span>•</span>
                  <span>Total Days: {attendanceData.data.dateRange.totalDays}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceChart;