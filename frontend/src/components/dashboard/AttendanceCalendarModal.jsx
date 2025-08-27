import { useState, useMemo, useEffect } from 'react';
import { useGetStudentAttendanceCalendarQuery } from '../../redux/api/authApi';
import { FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiUser } from 'react-icons/fi';
import AttendanceApiError from '../common-components/error-pages/AttendanceApiError';
import { useAttendanceErrorHandler } from '../../hooks/useAttendanceErrorHandler';

const AttendanceCalendarModal = ({ isOpen, onClose, student, initialDateFrom, initialDateTo }) => {
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDateFrom));

  // Update dates when props change
  useEffect(() => {
    setDateFrom(initialDateFrom);
    setDateTo(initialDateTo);
    setCurrentMonth(new Date(initialDateFrom));
  }, [initialDateFrom, initialDateTo]);

  const { data: calendarData, isLoading, error } = useGetStudentAttendanceCalendarQuery({
    stdId: student?.stdId,
    dateFrom,
    dateTo
  }, { skip: !isOpen || !student?.stdId });
  
  // Handle attendance API errors gracefully
  useAttendanceErrorHandler(error, !!error, 'Student Calendar');



  const getDayStatus = (date, dayData) => {
    if (!dayData) {
      // If no data exists for this date, assume it's a working day and mark as absent
      return 'absent';
    }
    
    if (dayData.isHoliday) return 'holiday';
    if (dayData.isWeekend) return 'weekend';
    
    // Check if student has attendance data for this day
    const studentData = dayData.students?.find(s => s.stdId === student?.stdId);
    if (studentData) {
      return studentData.status === 'present' ? 'present' : 'absent';
    }
    
    // If no student data but it's a working day, consider as absent
    return 'absent';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500 text-white';
      case 'absent': return 'bg-red-500 text-white';
      case 'holiday': return 'bg-blue-500 text-white';
      case 'weekend': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✓';
      case 'absent': return '✗';
      case 'holiday': return '🏖️';
      case 'weekend': return '📅';
      default: return '';
    }
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    
    const calendar = [];

    const current = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = current.toISOString().split('T')[0];
        const dayData = calendarData?.data?.calendarData?.[dateStr];
        const isCurrentMonth = current.getMonth() === month;
        
        // Fix date comparison by comparing date strings
        const currentDateStr = current.toISOString().split('T')[0];
        const isInRange = currentDateStr >= dateFrom && currentDateStr <= dateTo;
        

        
        weekDays.push({
          date: new Date(current),
          dateStr,
          dayData,
          isCurrentMonth,
          isInRange,
          status: isInRange ? getDayStatus(dateStr, dayData) : 'other-month'
        });
        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);
    }
    return calendar;
  };
  
  const calendar = useMemo(() => generateCalendar(), [currentMonth, calendarData, dateFrom, dateTo]);
  
  const summary = useMemo(() => {
    if (!calendarData?.data?.calendarData) return { present: 0, absent: 0, holiday: 0, weekend: 0 };
    
    const calData = calendarData.data.calendarData;
    
    let presentCount = 0;
    let absentCount = 0;
    let holidayCount = 0;
    let weekendCount = 0;
    
    Object.entries(calData).forEach(([dateStr, dayData]) => {
      // Use string comparison for date range
      if (dateStr >= dateFrom && dateStr <= dateTo) {
        if (dayData.isHoliday) {
          holidayCount++;
        } else if (dayData.isWeekend) {
          weekendCount++;
        } else {
          // Check if student has data for this day
          const studentData = dayData.students?.find(s => s.stdId === student?.stdId);
          if (studentData) {
            if (studentData.status === 'present') {
              presentCount++;
            } else {
              absentCount++;
            }
          } else {
            // No data for working day = absent
            absentCount++;
          }
        }
      }
    });
    
    return {
      present: presentCount,
      absent: absentCount,
      holiday: holidayCount,
      weekend: weekendCount
    };
  }, [calendarData, student, dateFrom, dateTo]);

  const canNavigateMonth = (direction) => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    
    if (direction === -1) {
      return newMonth >= new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    } else {
      return newMonth <= new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    }
  };
  
  const changeMonth = (direction) => {
    if (!canNavigateMonth(direction)) return;
    
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateChange = () => {
    // The query will automatically refetch when dateFrom or dateTo changes
    // due to the dependency in useGetStudentAttendanceCalendarQuery
  };
  
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full h-[75vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <FiUser className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {student?.firstName} {student?.lastName}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Father:</span> {student?.fathersName} | 
              <span className="font-medium"> Mobile:</span> {student?.mobile}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">Present: {summary.present}</span>
              <span className="text-red-600 font-medium">Absent: {summary.absent}</span>
              <span className="text-blue-600 font-medium">Holiday: {summary.holiday}</span>
              <span className="text-yellow-600 font-medium">Weekend: {summary.weekend}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Date Range:</span> {dateFrom} to {dateTo}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 p-4 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => changeMonth(-1)} 
              disabled={!canNavigateMonth(-1)}
              className={`p-2 rounded-lg ${
                canNavigateMonth(-1) ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => changeMonth(1)} 
              disabled={!canNavigateMonth(1)}
              className={`p-2 rounded-lg ${
                canNavigateMonth(1) ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="py-4">
              <AttendanceApiError 
                message="Attendance APIs are not working. Calendar data is currently unavailable."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendar.flat().map((day, index) => (
                  <div
                    key={index}
                    className={`relative h-10 w-10 mx-auto flex items-center justify-center text-sm rounded-full ${
                      day.isInRange ? 'text-gray-900' : 'text-gray-300'
                    } ${
                      day.isInRange && day.status === 'present' ? 'bg-green-100 border-2 border-green-500' :
                      day.isInRange && day.status === 'absent' ? 'bg-red-100 border-2 border-red-500' :
                      day.isInRange && day.status === 'holiday' ? 'bg-blue-100 border-2 border-blue-500' :
                      day.isInRange && day.status === 'weekend' ? 'bg-yellow-100 border-2 border-yellow-500' :
                      day.isInRange ? 'bg-gray-50 hover:bg-gray-100' :
                      'bg-gray-100 opacity-30'
                    }`}
                  >
                    <span className="font-medium">{day.date.getDate()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4 justify-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded-full"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-500 rounded-full"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded-full"></div>
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded-full"></div>
                  <span>Weekend</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendarModal;