import { useState, useEffect } from 'react';
import { AlertTriangle, Lock, TrendingUp, Calendar, Plus } from 'lucide-react';
import Header from '../common-components/sidebar/Header';
import { useGetSystemSettingQuery, useUpdateSystemSettingMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';

const themes = [
  { id: 'orange', color: '#FDA92D' },
  { id: 'blue',   color: '#3B82F6' },
  { id: 'green',  color: '#22C55E' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'indigo', color: '#6366F1' },
  { id: 'teal',   color: '#14B8A6' },
  { id: 'rose',   color: '#F43F5E' },
];

const academicYears = [
  { year: 'AY 2024 – 2025', label: 'Current Active Cycle', status: 'ACTIVE' },
  { year: 'AY 2023 – 2024', label: 'Previous Cycle',       status: 'ARCHIVED' },
];

const backlogOptions = [
  'Maximum 1 subject',
  'Maximum 2 subjects',
  'Maximum 3 subjects',
  'No limit',
];

const SettingFIle = () => {
  const { data: themeData } = useGetSystemSettingQuery('theme');
  const [updateSystemSetting] = useUpdateSystemSettingMutation();
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('theme') || 'orange');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minGpa, setMinGpa] = useState('2.5');
  const [attendance, setAttendance] = useState('75');
  const [backlog, setBacklog] = useState('Maximum 2 subjects');
  const [backlogOpen, setBacklogOpen] = useState(false);

  // Sync theme from DB on load
  useEffect(() => {
    if (themeData?.value) {
      setActiveTheme(themeData.value);
      document.documentElement.setAttribute('data-theme', themeData.value);
      localStorage.setItem('theme', themeData.value);
    }
  }, [themeData]);

  const handleThemeChange = async (themeId) => {
    setActiveTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);
    try {
      await updateSystemSetting({ key: 'theme', value: themeId }).unwrap();
      toast.success('Theme saved successfully!');
    } catch {
      toast.error('Failed to save theme');
    }
  };

  const currentTheme = themes.find(t => t.id === activeTheme);

  return (
    <>
      <Header title="Settings" breadcrumbs={[{ label: 'Settings' }]} />

      <div className="p-6 space-y-6 max-w-5xl">

        {/* Page Title + Maintenance Toggle */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage institutional global rules, branding, and academic lifecycles.</p>
          </div>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Maintenance Mode</p>
              <p className={`text-xs font-bold ${maintenanceMode ? 'text-orange-500' : 'text-green-500'}`}>
                {maintenanceMode ? 'Maintenance' : 'System Live'}
              </p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${maintenanceMode ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Row 1: Academic Year + Promotion Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Academic Year Management */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Calendar size={16} className="text-orange-500" />
                </div>
                <h2 className="text-base font-bold text-gray-800">Academic Year Management</h2>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition">
                <Plus size={13} /> Add New
              </button>
            </div>
            <div className="space-y-3">
              {academicYears.map((ay) => (
                <div key={ay.year} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{ay.year}</p>
                    <p className="text-xs text-gray-400">{ay.label}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider ${
                    ay.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {ay.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Promotion Rules */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <TrendingUp size={16} className="text-orange-500" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Promotion Rules</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Minimum GPA</label>
                <input
                  type="number"
                  value={minGpa}
                  onChange={e => setMinGpa(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-400 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Attendance %</label>
                <input
                  type="number"
                  value={attendance}
                  onChange={e => setAttendance(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-orange-400 bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Backlog Limit</label>
              <div className="relative">
                <button
                  onClick={() => setBacklogOpen(!backlogOpen)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 flex items-center justify-between focus:outline-none focus:border-orange-400"
                >
                  {backlog}
                  <span className="text-gray-400 text-xs">▾</span>
                </button>
                {backlogOpen && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {backlogOptions.map(opt => (
                      <li
                        key={opt}
                        onClick={() => { setBacklog(opt); setBacklogOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 ${backlog === opt ? 'bg-orange-100 font-semibold text-orange-600' : 'text-gray-700'}`}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Society Logo & Branding + Lock Academic Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Society Logo & Branding */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 text-base">🎨</div>
              <h2 className="text-base font-bold text-gray-800">Society Logo & Branding</h2>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏛️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Official Society Logo</p>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">Upload high-res PNG or SVG. Max 2MB.</p>
                <button className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition">
                  Change Logo
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme Primary Color</p>
              <div className="flex items-center gap-2 flex-wrap">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className="relative w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: theme.color }}
                  >
                    {activeTheme === theme.id && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lock Academic Year */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Lock size={16} className="text-red-500" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Lock Academic Year</h2>
            </div>

            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">
                Locking the academic year (2023-2024) will freeze all marks, attendance, and faculty records. This action is{' '}
                <span className="font-bold underline">irreversible</span> and ensures data integrity for audits.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Ready for Finalization?</p>
                <p className="text-xs text-gray-400 mt-0.5">Last Check: 12 Oct 2023</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-sm">
                Lock 2023-2024
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SettingFIle;
