import { MdAccountTree, MdOutlineMenuBook } from 'react-icons/md';
import { HiOutlineUserGroup } from 'react-icons/hi';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ onView, onEdit, inactive }) => (
  <div className="flex gap-3 px-5 pb-5 mt-auto">
    {onView && (
      <button
        onClick={inactive ? undefined : onView}
        disabled={inactive}
        className={`flex-1 border border-gray-300 rounded-xl py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 active:scale-[0.97] ${
          inactive
            ? 'border-gray-150 bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'border-gray-200 text-gray-700 hover:bg-slate-50 hover:border-gray-400 cursor-pointer shadow-xs hover:shadow'
        }`}
      >
        VIEW
      </button>
    )}
    {onEdit && (
      <div className={`${onView ? 'flex-1' : 'w-full'} ${inactive ? 'opacity-40 pointer-events-none' : ''} [&_button]:!w-full [&_button]:!h-full [&_button]:!py-2.5 [&_button]:!text-xs [&_button]:!font-bold [&_button]:!tracking-wider [&_button]:!uppercase [&_button]:!rounded-xl [&_button]:!transition-all [&_button]:!duration-200 [&_button]:active:scale-[0.97] [&_button]:!shadow-xs`}>
        {onEdit}
      </div>
    )}
  </div>
);

const SubDepartmentCard = ({
  title,
  departmentName,
  status,
  statusLabel,
  totalStudents = 0,
  allowedCourses = [],
  faculties = [],
  levelCounts = [],
  subLevelCounts = [],
  showSubLevels = false,
  onView,
  onEdit
}) => {
  const inactive = status === false;
  const navigate = useNavigate();

  const activeLevelCounts = showSubLevels ? subLevelCounts : levelCounts;

  return (
    <div className={`bg-white border rounded-3xl shadow-sm transition-all duration-300 overflow-hidden flex flex-col md:flex-row min-h-[580px] lg:min-h-[calc(100vh-250px)] w-full ${
      inactive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 hover:border-orange-300'
    }`}>
      
      {/* Left Column: Subdepartment Profile & Quick Stats */}
      <div className="w-full md:w-5/12 bg-slate-50/80 p-6 lg:p-8 border-b md:border-b-0 md:border-r border-gray-150 flex flex-col justify-between gap-8 flex-shrink-0">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-wider">Sub-Department</span>
              <h3 className={`text-2xl lg:text-3xl font-black tracking-tight leading-none mt-1 ${inactive ? 'text-gray-400' : 'text-gray-900'}`}>
                {title}
              </h3>
              {departmentName && (
                <p className="text-xs text-gray-500 font-medium mt-1.5 uppercase tracking-wide">
                  Department: <span className="font-semibold text-gray-700">{departmentName}</span>
                </p>
              )}
            </div>
            
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex-shrink-0 ${
              inactive 
                ? 'bg-slate-50 text-slate-400 border-slate-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-150'
            }`}>
              {!inactive && (
                <span className="relative flex h-1.5 w-1.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {statusLabel || (inactive ? 'Inactive' : 'Active')}
            </span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Quick Stats Cards */}
          <div className="flex flex-col gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                <HiOutlineUserGroup size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider">Total Admitted Students</p>
                <p className="text-xl font-black text-gray-800 mt-0.5">{totalStudents} Students</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                <MdOutlineMenuBook size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-450 font-extrabold uppercase tracking-wider">Approved Courses</p>
                <p className="text-xl font-black text-gray-800 mt-0.5">{allowedCourses?.length || 0} Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons in Left Panel */}
        <div className="mt-auto">
          <ActionButtons onView={onView} onEdit={onEdit} inactive={inactive} />
        </div>
      </div>

      {/* Right Column: Detailed Lists & Progress */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col gap-8 overflow-y-auto">
        
        {/* Section 1: Student Progress / Levels */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs text-gray-450 font-black uppercase tracking-wider">
              {showSubLevels ? "Students Sub-Level Wise Distribution" : "Students Level Wise Distribution"}
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Real-time progress
            </span>
          </div>

          {activeLevelCounts && activeLevelCounts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeLevelCounts.map((lc) => {
                const count = lc.studentCount || 0;
                const percent = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                return (
                  <div key={lc.levelId || lc.subLevelId} className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 transition duration-150 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-850 text-sm">{lc.levelName || lc.subLevelName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-orange-600 text-sm">{count}</span>
                        <span className="text-[10px] text-gray-450 font-semibold">students ({percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl py-8 text-center text-gray-450 italic text-sm">
              No active levels or student distribution data available.
            </div>
          )}
        </div>

        {/* Section 2: Faculties List */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs text-gray-450 font-black uppercase tracking-wider">
            Assigned Faculties ({faculties.length})
          </h4>
          
          {faculties && faculties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {faculties.map((fac) => (
                <div 
                  key={fac._id}
                  onClick={() => navigate(`/user-profile/${fac._id}`)}
                  className="group bg-white hover:bg-slate-50 p-3 rounded-2xl border border-gray-150 hover:border-orange-300 transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-3xs"
                >
                  {fac.profileImage ? (
                    <img 
                      src={fac.profileImage} 
                      alt={fac.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white hover:scale-105 transition duration-150 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-black ring-2 ring-white hover:scale-105 transition duration-150 flex-shrink-0">
                      {fac.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-extrabold text-gray-800 text-xs truncate leading-snug group-hover:text-orange-500 transition-colors">{fac.name}</p>
                    <p className="text-[10px] text-gray-450 font-medium truncate mt-0.5 capitalize">{fac.position || 'Faculty member'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-2xl py-6 text-center text-gray-450 italic text-xs">
              No faculty members assigned to this sub-department yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SubDepartmentCard;
