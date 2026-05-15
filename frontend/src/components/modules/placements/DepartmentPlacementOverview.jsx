import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetDepartmentWisePlacementStatsQuery,
  useGetPlacedStudentsByDepartmentQuery,
} from '../../../redux/api/authApi';
import Loader from '../../shared/loader/Loader';
import Header from '../../shared/sidebar/Header';
import Avatar from '../../shared/Avatar';

// ── icons ──────────────────────────────────────────────────────────────────
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconBriefcase = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// ── stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bg, text, border }) => (
  <div className={`${bg} ${border} border rounded-2xl p-5 flex items-center gap-4`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${text} bg-white/60`}>
      {icon}
    </div>
    <div>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ── main component ─────────────────────────────────────────────────────────
const DepartmentPlacementOverview = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const { data: statsData, isLoading: statsLoading } = useGetDepartmentWisePlacementStatsQuery();
  const { data: studentsData, isLoading: studentsLoading } = useGetPlacedStudentsByDepartmentQuery(selectedDept);

  const departments = statsData?.data || [];
  const overall = statsData?.overall || {};
  const placedStudents = studentsData?.data || [];

  const filtered = placedStudents.filter((s) => {
    const text = [s.firstName, s.lastName, s.email, s.course, s.placedInfo?.companyName, s.department?.name]
      .join(' ').toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDeptSelect = (id) => {
    setSelectedDept(id);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const selectedDeptName = departments.find((d) => d.departmentId === selectedDept)?.departmentName;

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Header title="Department Placement Overview" />

      <div className="min-h-screen px-5 pb-12 space-y-6">

        {/* ── Overall Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <StatCard
            label="Total Students"
            value={overall.totalStudents ?? 0}
            icon={<IconUsers />}
            bg="bg-slate-50" border="border-slate-200" text="text-slate-700"
          />
          <StatCard
            label="Total Placed"
            value={overall.placedStudents ?? 0}
            icon={<IconBriefcase />}
            bg="bg-green-50" border="border-green-200" text="text-green-700"
          />
          <StatCard
            label="Ready for Placement"
            value={overall.readyStudents ?? 0}
            icon={<IconCheck />}
            bg="bg-orange-50" border="border-orange-200" text="text-orange-600"
          />
        </div>

        {/* ── Department Filter Pills ── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDeptSelect(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedDept === null
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            All
          </button>
          {departments.map((dept) => (
            <button
              key={dept.departmentId}
              onClick={() => handleDeptSelect(dept.departmentId)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                selectedDept === dept.departmentId
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500'
              }`}
            >
              {dept.departmentName}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                selectedDept === dept.departmentId
                  ? 'bg-white/25 text-white'
                  : 'bg-green-100 text-green-700'
              }`}>
                {dept.placedStudents}
              </span>
            </button>
          ))}
        </div>

        {/* ── Department Stats Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Department-wise Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Department', 'Total', 'Placed', 'Ready', 'In Interview', 'Avg Package', 'Placement %'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => {
                    const isActive = selectedDept === dept.departmentId;
                    return (
                      <tr
                        key={dept.departmentId}
                        onClick={() => handleDeptSelect(dept.departmentId)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          isActive ? 'bg-orange-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                            )}
                            <span className="font-medium text-gray-900">{dept.departmentName}</span>
                            {dept.departmentCode && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {dept.departmentCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{dept.totalStudents}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-green-600">{dept.placedStudents}</span>
                        </td>
                        <td className="px-5 py-3.5 text-blue-600">{dept.readyStudents}</td>
                        <td className="px-5 py-3.5 text-orange-500">{dept.interviewStudents}</td>
                        <td className="px-5 py-3.5 text-gray-700">
                          {dept.avgSalary > 0 ? `₹${(dept.avgSalary / 100000).toFixed(1)} LPA` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-green-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(dept.placementRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{dept.placementRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Placed Students Section ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Placed Students
                {selectedDeptName && (
                  <span className="ml-2 text-orange-500">— {selectedDeptName}</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <IconSearch />
              </span>
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search students..."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 w-56"
              />
            </div>
          </div>

          {/* Table */}
          {studentsLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-gray-400 text-sm">No placed students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Student', 'Department', 'Company', 'Profile', 'Type', 'Package', 'Placed On'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row) => (
                      <tr
                        key={row._id}
                        onClick={() => navigate(`/student-profile/${row._id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar firstName={row.firstName} lastName={row.lastName} imageUrl={row.image} />
                            <div>
                              <p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
                              <p className="text-xs text-gray-400">{row.course || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                            {row.department?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 font-medium">
                          {row.placedInfo?.companyName || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                            {row.placedInfo?.jobProfile || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
                            {row.placedInfo?.jobType || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-green-600">
                            {row.placedInfo?.salary
                              ? `₹${(row.placedInfo.salary / 100000).toFixed(1)} LPA`
                              : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {row.placedInfo?.placedDate
                            ? new Date(row.placedInfo.placedDate).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          p === currentPage
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DepartmentPlacementOverview;
