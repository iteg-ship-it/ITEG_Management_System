import { useState, useEffect } from 'react';
import Header from '../../shared/sidebar/Header';

const themes = [
  { id: 'orange', label: 'Orange', color: '#FDA92D', shade: '#FED7AA', description: 'Default warm orange' },
  { id: 'blue',   label: 'Blue',   color: '#3B82F6', shade: '#BFDBFE', description: 'Classic ocean blue' },
  { id: 'green',  label: 'Green',  color: '#22C55E', shade: '#BBF7D0', description: 'Fresh nature green' },
  { id: 'purple', label: 'Purple', color: '#8B5CF6', shade: '#DDD6FE', description: 'Royal violet purple' },
  { id: 'rose',   label: 'Rose',   color: '#F43F5E', shade: '#FECDD3', description: 'Vibrant rose red' },
  { id: 'teal',   label: 'Teal',   color: '#14B8A6', shade: '#99F6E4', description: 'Cool teal cyan' },
  { id: 'indigo', label: 'Indigo', color: '#6366F1', shade: '#C7D2FE', description: 'Deep indigo blue' },
];

const SettingFIle = () => {
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('theme') || 'orange');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('theme', activeTheme);
  }, [activeTheme]);

  return (
    <>
      <Header title="Settings" breadcrumbs={[{ label: 'Settings' }]} />
      <div className="p-6 max-w-3xl">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Color Theme</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a primary color for the interface. All buttons, badges and accents will update accordingly.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {themes.map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-gray-800 shadow-md scale-[1.03]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Color preview */}
                  <div className="flex gap-1.5">
                    <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.color }} />
                    <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: theme.shade }} />
                  </div>

                  <span className="text-sm font-semibold text-gray-700">{theme.label}</span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">{theme.description}</span>

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: theme.color }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview bar */}
          <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition"
                style={{ backgroundColor: themes.find(t => t.id === activeTheme)?.color }}
              >
                Primary Button
              </button>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: themes.find(t => t.id === activeTheme)?.color }}
              >
                Badge
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: themes.find(t => t.id === activeTheme)?.shade,
                  color: themes.find(t => t.id === activeTheme)?.color
                }}
              >
                Light Badge
              </span>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: themes.find(t => t.id === activeTheme)?.color }}
              />
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default SettingFIle;
