import { useGetAllStudentsQuery, useAdmitedStudentsQuery, useGetReadyStudentsForPlacementQuery, useGetAllUsersQuery, useGetAllDepartmentsQuery } from '../../redux/api/authApi';
import Loader from '../common-components/loader/Loader';
import Header from '../common-components/sidebar/Header';
import { Chart } from 'react-google-charts';
import { Formik, Form } from 'formik';
import CustomDropdown from '../common-components/common-feild/CustomDropdown';
const AdmissionDashboard = () => {
  const { data: allStudentsData, isLoading: s1 } = useGetAllStudentsQuery();
  const { data: admittedData, isLoading: s2 } = useAdmitedStudentsQuery();
  const { data: placementData, isLoading: s3 } = useGetReadyStudentsForPlacementQuery();
  const { data: usersData, isLoading: s4 } = useGetAllUsersQuery();
  const { data: deptData, isLoading: s5 } = useGetAllDepartmentsQuery();

  if (s1 || s2 || s3 || s4 || s5) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader /></div>;
  }

  const allStudents = allStudentsData?.data || allStudentsData || [];
  const admittedStudents = Array.isArray(admittedData) ? admittedData : admittedData?.data || [];
  const placementStudents = placementData?.data || placementData || [];
  const users = usersData || [];
  const departments = deptData || [];

  const placedStudents = admittedStudents.filter(s => s.placedInfo && Object.keys(s.placedInfo).length > 0);
  const placementPct = admittedStudents.length > 0 ? Math.round((placedStudents.length / admittedStudents.length) * 100) : 0;

  // Stats cards
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#FDA92D';

  const stats = [
    { label: 'TOTAL ENROLLED', value: allStudents.length, trend: '+5%', color: primaryColor },
    { label: 'ADMISSIONS', value: admittedStudents.length, trend: '+12%', color: primaryColor },
    { label: 'DEPARTMENTS', value: departments.length, trend: 'Stable', color: primaryColor },
    { label: 'PLACED STUDENT', value: placedStudents.length, trend: '+8%', color: primaryColor },
    { label: 'PLACEMENT %', value: `${placementPct}%`, trend: '+2%', color: primaryColor },
    { label: 'TOTAL FACULTY', value: users.length, trend: '+4%', color: primaryColor },
  ];

  // Admission Trend — level-wise student count (Google AreaChart)
  const levelCounts = { '1A': 0, '1B': 0, '1C': 0, '2A': 0, '2B': 0, '2C': 0 };
  admittedStudents.forEach(s => {
    const lvl = s.currentLevel || '1A';
    if (levelCounts[lvl] !== undefined) levelCounts[lvl]++;
  });
  const admissionTrendData = [
    ['Level', 'Students'],
    ['1A', levelCounts['1A']],
    ['1B', levelCounts['1B']],
    ['1C', levelCounts['1C']],
    ['2A', levelCounts['2A']],
    ['2B', levelCounts['2B']],
    ['2C', levelCounts['2C']],
  ];

  // Placement Distribution dept-wise (ColumnChart)
  const deptPlacementMap = {};
  placedStudents.forEach(s => {
    const dept = s.department || s.course || 'Other';
    deptPlacementMap[dept] = (deptPlacementMap[dept] || 0) + 1;
  });
  const placementDistData = [
    ['Department', 'Students'],
    ...Object.entries(deptPlacementMap).slice(0, 6).map(([k, v]) => [k, v]),
  ];
  if (placementDistData.length === 1) placementDistData.push(['No Data', 0]);

  // Program Distribution — track/course wise (Donut)
  const trackMap = {};
  admittedStudents.forEach(s => {
    const t = s.track || s.course || 'Other';
    trackMap[t] = (trackMap[t] || 0) + 1;
  });
  const programDistData = [
    ['Track', 'Count'],
    ...Object.entries(trackMap).map(([k, v]) => [k, v]),
  ];
  if (programDistData.length === 1) programDistData.push(['No Data', 1]);

  // Academic Performance — level pass % per track
  const trackPerf = {};
  admittedStudents.forEach(s => {
    const t = s.track || s.course || 'Other';
    if (!trackPerf[t]) trackPerf[t] = { total: 0, passed: 0 };
    trackPerf[t].total++;
    const levels = s.level || [];
    const passed = levels.filter(l => l.result === 'Pass').length;
    if (passed > 0) trackPerf[t].passed++;
  });
  const perfEntries = Object.entries(trackPerf).slice(0, 5);

  // Year status
  const totalWorkingDays = 210;
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const daysPassed = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalWorkingDays - daysPassed);

  // Operations
  const totalLevels = admittedStudents.reduce((acc, s) => acc + (s.level?.length || 0), 0);
  const passedLevels = admittedStudents.reduce((acc, s) => acc + (s.level?.filter(l => l.result === 'Pass').length || 0), 0);
  const syllabusCompletion = totalLevels > 0 ? Math.round((passedLevels / totalLevels) * 100) : 0;
  const pendingInterviews = allStudents.filter(s => !s.interviewRecord || s.interviewRecord.length === 0).length;
  const pendingPct = allStudents.length > 0 ? Math.round((pendingInterviews / allStudents.length) * 100) : 0;

  // Recent Activity — last 4 admitted students
  const recentStudents = [...admittedStudents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const donutColors = [primaryColor, '#00B8D9', '#8E33FF', '#22C55E', '#FF5630'];

  return (
    <>
      <Header  title="Dashboard">
        <Formik initialValues={{ year: "2023-24", department: "all" }} onSubmit={() => { }}>
          <Form className="flex gap-4">
            <CustomDropdown
              label="Year:"
              name="year"
              options={[
                { label: "2023-24", value: "2023-24" },
                { label: "2022-23", value: "2022-23" },
                { label: "2021-22", value: "2021-22" },
              ]}
            />
            <CustomDropdown
              label="Department:"
              name="department"
              options={[
                { label: "All Departments", value: "all" },
                { label: "Computer Science", value: "cs" },
                { label: "Information Technology", value: "it" },
                { label: "Electronics", value: "ece" },
                { label: "Mechanical", value: "mech" },
              ]}
            />
          </Form>
        </Formik>
      </Header>
      <div className="min-h-screen p-5 bg-[#F8F7F5]">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-orange-400 bg-orange-50 px-1.5 py-0.5 rounded">{s.trend}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight">{s.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Row 1: Admission Trend + Placement Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 [&>*]:min-h-[22rem]">
          {/* Admission Trend */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Admission Trend</h3>
            </div>
            <Chart
              chartType="AreaChart"
              data={admissionTrendData}
              options={{
                backgroundColor: 'transparent',
                chartArea: { width: '85%', height: '75%' },
                colors: [primaryColor],
                areaOpacity: 0.15,
                lineWidth: 3,
                pointSize: 0,
                hAxis: { textStyle: { color: '#9CA3AF', fontSize: 10 }, gridlines: { color: 'transparent' }, baselineColor: '#E5E7EB' },
                vAxis: { textStyle: { color: '#9CA3AF', fontSize: 10 }, gridlines: { color: '#F3F4F6' }, baselineColor: 'transparent' },
                legend: 'none',
                curveType: 'function',
              }}
              width="100%"
              height="300px"
            />
          </div>

          {/* Placement Distribution */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Placement Distribution (Dept-wise)</h3>
              <span className="text-xs text-gray-400">Total {placedStudents.length} Students</span>
            </div>
            <Chart
              chartType="ColumnChart"
              data={placementDistData}
              options={{
                backgroundColor: 'transparent',
                chartArea: { width: '85%', height: '72%' },
                colors: ['#FDBA74'],
                bar: { groupWidth: '55%' },
                hAxis: { textStyle: { color: '#9CA3AF', fontSize: 10 }, gridlines: { color: 'transparent' }, baselineColor: '#E5E7EB' },
                vAxis: { textStyle: { color: '#9CA3AF', fontSize: 10 }, gridlines: { color: '#F3F4F6' }, baselineColor: 'transparent' },
                legend: 'none',
              }}
              width="100%"
              height="300px"
            />
          </div>
        </div>

        {/* Row 2: Program Distribution + Academic Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 [&>*]:min-h-[22rem]">
          {/* Program Distribution */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Program Distribution</h3>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Chart
                  chartType="PieChart"
                  data={programDistData}
                  options={{
                    backgroundColor: 'transparent',
                    chartArea: { width: '90%', height: '90%' },
                    colors: donutColors,
                    pieHole: 0.55,
                    legend: 'none',
                    pieSliceText: 'none',
                    tooltip: { trigger: 'focus' },
                  }}
                  width="260px"
                  height="260px"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs text-gray-400 mb-1">{admittedStudents.length} Total</p>
                {Object.entries(trackMap).slice(0, 5).map(([track, count], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: donutColors[i % donutColors.length] }}></span>
                      <span className="text-xs text-gray-600 truncate max-w-[80px]">{track}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {admittedStudents.length > 0 ? Math.round((count / admittedStudents.length) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Academic Performance %</h3>
              <span className="text-xs text-orange-400 font-semibold">
                Avg: {perfEntries.length > 0 ? Math.round(perfEntries.reduce((acc, [, v]) => acc + (v.total > 0 ? (v.passed / v.total) * 100 : 0), 0) / perfEntries.length) : 0}%
              </span>
            </div>
            <div className="space-y-3">
              {perfEntries.length > 0 ? perfEntries.map(([track, v], i) => {
                const pct = v.total > 0 ? Math.round((v.passed / v.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{track}</span>
                      <span className="text-xs font-semibold text-orange-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-orange-400 transition-all" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs text-gray-400 text-center py-8">No performance data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Year Status + Operations Status + Recent Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 [&>*]:min-h-[22rem]">
          {/* Year Status */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Year Status</h3>
              <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded font-medium">Current Year</span>
            </div>
            <p className="text-xs text-gray-500">Total Working Days: {totalWorkingDays}</p>
            <p className="text-xs text-gray-500">Completed: {Math.min(daysPassed, totalWorkingDays)}</p>
            <p className="text-xs text-gray-500 mb-3">Remaining: {daysRemaining}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Days Remaining</p>
            <p className="text-4xl font-bold text-orange-400">{daysRemaining}</p>
            <p className="text-xs text-gray-400 mb-4">Till Final Examinations</p>
            <button className="w-full bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold py-2 rounded-lg transition">
              Generate Reports
            </button>
          </div>

          {/* Operations Status */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Operations Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">📋 Syllabus Completion</span>
                  <span className="text-xs font-semibold text-gray-700">{syllabusCompletion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-orange-400" style={{ width: `${syllabusCompletion}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">⏳ Pending Tasks</span>
                  <span className="text-xs font-semibold text-gray-700">{pendingPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-orange-300" style={{ width: `${pendingPct}%` }}></div>
                </div>
              </div>
            </div>
            {placementStudents.length > 0 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-700">
                  ⚠️ <span className="font-semibold">{placementStudents.length} students</span> are ready for placement interviews.
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
              <span className="text-xs text-orange-400 font-semibold cursor-pointer hover:underline">VIEW ALL</span>
            </div>
            <div className="space-y-3">
              {recentStudents.length > 0 ? recentStudents.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-orange-500">
                      {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      New Admission: {s.firstName} {s.lastName}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {s.course || s.track || 'Student admitted'}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                    {s.createdAt ? timeAgo(s.createdAt) : '—'}
                  </span>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-6">No recent activity</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdmissionDashboard;
