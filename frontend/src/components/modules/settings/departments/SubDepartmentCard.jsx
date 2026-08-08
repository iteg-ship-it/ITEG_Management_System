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
  onView,
  onEdit
}) => {
  const inactive = status === false;
  const navigate = useNavigate();

  return (
    <div className={`bg-white border rounded-2xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden flex flex-col h-full ${
      inactive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 hover:border-orange-300'
    }`}>
      {!inactive && <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-500 flex-shrink-0" />}
      
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header: Title, Department Subtitle, Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={`text-base font-extrabold tracking-tight leading-snug truncate ${inactive ? 'text-gray-500' : 'text-gray-900'}`}>
              {title}
            </h3>
            {departmentName && (
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">
                Dept: {departmentName}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${
            inactive 
              ? 'bg-slate-50 text-slate-400 border-slate-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {!inactive && (
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            )}
            {statusLabel || (inactive ? 'Inactive' : 'Active')}
          </span>
        </div>

        {/* Divider */}
        <div className={`border-t ${inactive ? 'border-gray-150' : 'border-slate-100'}`} />

        {/* Quick Stats: Students & Courses */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${
            inactive 
              ? 'bg-slate-50 text-slate-400 border-slate-100' 
              : 'bg-slate-50 text-gray-700 border-slate-100'
          }`}>
            <HiOutlineUserGroup size={13} className={inactive ? 'text-gray-400' : 'text-orange-500'} />
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Students:</span>
            <span className="font-extrabold">{totalStudents}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${
            inactive 
              ? 'bg-slate-50 text-slate-400 border-slate-100' 
              : 'bg-slate-50 text-gray-700 border-slate-100'
          }`}>
            <MdOutlineMenuBook size={13} className={inactive ? 'text-gray-400' : 'text-orange-500'} />
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Courses:</span>
            <span className="font-extrabold">{allowedCourses?.length || 0}</span>
          </div>
        </div>

        {/* Faculties Group */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faculties ({faculties.length})</span>
          {faculties && faculties.length > 0 ? (
            <div className="flex items-center pl-1 pt-0.5">
              <div className="flex items-center -space-x-2 overflow-hidden">
                {faculties.slice(0, 5).map((fac) => (
                  <div 
                    key={fac._id}
                    title={`${fac.name} (${fac.position || 'Faculty'})`}
                    onClick={() => navigate(`/user-profile/${fac._id}`)}
                    className="relative group cursor-pointer hover:z-10 transition duration-150"
                  >
                    {fac.profileImage ? (
                      <img 
                        src={fac.profileImage} 
                        alt={fac.name} 
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white hover:scale-105 transition duration-150"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-[10px] font-black ring-2 ring-white hover:scale-105 transition duration-150">
                        {fac.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {faculties.length > 5 && (
                  <div 
                    title={`${faculties.slice(5).map(f => f.name).join(', ')}`}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 border border-slate-200 flex items-center justify-center text-[9px] font-bold ring-2 ring-white cursor-help"
                  >
                    +{faculties.length - 5}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 italic font-bold">No assigned faculty</span>
          )}
        </div>

        {/* Student Levels - Structured Table */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Students Level Wise</span>
          {levelCounts && levelCounts.length > 0 ? (
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-gray-500 font-semibold">
                    <th className="px-3 py-1.5">Level</th>
                    <th className="px-3 py-1.5 text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-gray-700">
                  {levelCounts.map((lc) => (
                    <tr key={lc.levelId} className="hover:bg-white/80 transition duration-150">
                      <td className="px-3 py-1.5 font-medium">{lc.levelName}</td>
                      <td className="px-3 py-1.5 text-right font-bold text-orange-600">{lc.studentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <span className="text-[10px] text-gray-400 italic font-bold">No active levels</span>
          )}
        </div>
      </div>

      <ActionButtons onView={onView} onEdit={onEdit} inactive={inactive} />
    </div>
  );
};

export default SubDepartmentCard;
