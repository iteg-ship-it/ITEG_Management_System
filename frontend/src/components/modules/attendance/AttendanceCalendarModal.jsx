import { useState, useMemo, useEffect } from 'react';
import { useGetStudentAttendanceCalendarQuery } from '../../../redux/api/authApi';
import { FiX, FiChevronLeft, FiChevronRight, FiCalendar, FiUser } from 'react-icons/fi';
import AttendanceApiError from '../../shared/error-pages/AttendanceApiError';
import { useAttendanceErrorHandler } from '../../../hooks/useAttendanceErrorHandler';
import BlurBackground from '../../shared/BlurBackground';

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
      case 'present': return 'bg-green-50 text-green-700 border border-green-200';
      case 'absent': return 'bg-red-50 text-red-700 border border-red-200';
      case 'holiday': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'weekend': return 'bg-slate-50 text-slate-700 border border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border border-slate-100';
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
      if (dateStr >= dateFrom && dateStr <= dateTo) {
        if (dayData.isHoliday) {
          holidayCount++;
        } else if (dayData.isWeekend) {
          weekendCount++;
        } else {
          const studentData = dayData.students?.find(s => s.stdId === student?.stdId);
          if (studentData) {
            if (studentData.status === 'present') {
              presentCount++;
            } else {
              absentCount++;
            }
          } else {
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

  const attendanceRate = useMemo(() => {
    const total = summary.present + summary.absent;
    return total > 0 ? Math.round((summary.present / total) * 100) : 0;
  }, [summary]);

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
  };
  
  if (!isOpen) return null;

  return (
    <BlurBackground isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl border border-gray-150 max-w-xl w-full flex flex-col m-4 overflow-hidden shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500 shadow-sm shrink-0">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                {student?.firstName} {student?.lastName}
              </h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Attendance Profile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Present Rate</span>
                <span className={`text-sm font-extrabold ${attendanceRate >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                  {attendanceRate}%
                </span>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                attendanceRate >= 75 
                  ? 'bg-green-50 text-green-600 border-green-150' 
                  : 'bg-red-50 text-red-600 border-red-150'
              }`}>
                {attendanceRate}%
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition shrink-0">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex-shrink-0 text-xs">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3.5 text-gray-600">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Father's Name</span>
              <span className="font-bold text-gray-800 text-sm mt-0.5 block">{student?.fathersName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Mobile Contact</span>
              <span className="font-bold text-gray-800 text-sm mt-0.5 block">{student?.mobile || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Scope Range</span>
              <span className="font-semibold text-gray-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 mt-1 inline-block">
                {dateFrom} to {dateTo}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200/60">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-700 border border-green-150 shadow-sm">
              Present: {summary.present}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-150 shadow-sm">
              Absent: {summary.absent}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-150 shadow-sm">
              Holiday: {summary.holiday}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
              Weekend: {summary.weekend}
            </span>
          </div>
        </div>

        {/* Calendar Box */}
        <div className="flex-1 p-4 bg-white">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => changeMonth(-1)} 
              disabled={!canNavigateMonth(-1)}
              className={`p-1.5 rounded-lg border transition duration-200 ${
                canNavigateMonth(-1) 
                  ? 'border-gray-200 hover:bg-slate-50 text-gray-700 hover:border-gray-300' 
                  : 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-extrabold text-gray-800 tracking-widest uppercase">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => changeMonth(1)} 
              disabled={!canNavigateMonth(1)}
              className={`p-1.5 rounded-lg border transition duration-200 ${
                canNavigateMonth(1) 
                  ? 'border-gray-200 hover:bg-slate-50 text-gray-700 hover:border-gray-300' 
                  : 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
              }`}
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="py-4">
              <AttendanceApiError 
                message="Attendance APIs are not working. Calendar data is currently unavailable."
              />
            </div>
          ) : (
            <>
              {/* Day Titles */}
              <div className="grid grid-cols-7 gap-1.5 mb-2.5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendar.flat().map((day, index) => {
                  const isPresent = day.isInRange && day.status === 'present';
                  const isAbsent = day.isInRange && day.status === 'absent';
                  const isHoliday = day.isInRange && day.status === 'holiday';
                  const isWeekend = day.isInRange && day.status === 'weekend';
                  
                  let cellClasses = "bg-slate-50/50 border border-slate-100/50 text-gray-300 opacity-30 select-none pointer-events-none";
                  if (day.isInRange) {
                    if (isPresent) {
                      cellClasses = "bg-green-50 text-green-700 border border-green-200 font-bold hover:scale-105 hover:shadow-sm";
                    } else if (isAbsent) {
                      cellClasses = "bg-red-50 text-red-700 border border-red-200 font-bold hover:scale-105 hover:shadow-sm";
                    } else if (isHoliday) {
                      cellClasses = "bg-orange-50 text-orange-600 border border-orange-200 font-bold hover:scale-105 hover:shadow-sm";
                    } else if (isWeekend) {
                      cellClasses = "bg-slate-50 text-slate-500 border border-slate-200 font-bold hover:scale-105 hover:shadow-sm";
                    } else {
                      cellClasses = "bg-white border border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-300 hover:scale-105 hover:shadow-sm transition";
                    }
                  } else if (day.isCurrentMonth) {
                    cellClasses = "bg-white border border-gray-100 text-gray-400 opacity-50";
                  }

                  return (
                    <div
                      key={index}
                      className={`h-10 w-10 mx-auto flex items-center justify-center text-sm rounded-xl cursor-default transition-all duration-200 ${cellClasses}`}
                    >
                      <span>{day.date.getDate()}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-bold text-gray-500 uppercase tracking-wider pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-green-50 border border-green-200 rounded-md"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-red-50 border border-red-200 rounded-md"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-orange-50 border border-orange-200 rounded-md"></div>
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-200 rounded-md"></div>
                  <span>Weekend</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </BlurBackground>
  );
};

export default AttendanceCalendarModal;