import { useState, useRef, useEffect } from 'react';
import { useGetAllSessionsQuery } from '../../redux/api/authApi';
import { ChevronDown, Check, Calendar } from 'lucide-react';

const SessionSelector = ({ 
  selectedSessionId, 
  onSessionChange, 
  label = "Select Session",
  showLabel = true,
  required = true,
  disabled = false,
  showAll = true,
  includeAllOption = false,
  allOptionLabel = "All Sessions",
  placeholder = "Choose a session...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: sessionsData, isLoading } = useGetAllSessionsQuery(showAll);

  const sessionsList = sessionsData?.data || [];
  const displaySessions = showAll 
    ? sessionsList 
    : sessionsList.filter(s => s.isActive);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current display label
  const selectedSession = displaySessions.find((s) => String(s._id) === String(selectedSessionId));
  const displayLabel = selectedSession 
    ? selectedSession.name 
    : (includeAllOption ? allOptionLabel : placeholder);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="h-10 px-3.5 flex items-center border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400 font-medium">
          Loading sessions...
        </div>
      </div>
    );
  }

  // Construct options list
  const options = [];
  if (includeAllOption) {
    options.push({ value: "", label: allOptionLabel });
  } else if (placeholder) {
    options.push({ value: "", label: placeholder });
  }

  displaySessions.forEach((session) => {
    const statusText = session.status 
      ? session.status.charAt(0).toUpperCase() + session.status.slice(1)
      : (session.isActive ? 'Active' : 'Inactive');

    options.push({
      value: session._id,
      label: `${session.name} (${statusText})`,
      shortLabel: session.name,
    });
  });

  const handleSelect = (val) => {
    onSessionChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 h-10 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 shadow-xs hover:border-[var(--primary,#FDA92D)] transition-all focus:outline-none ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          <Calendar size={15} className="text-gray-500 shrink-0" />
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--primary,#FDA92D)]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu (Styled like ExportDropdown) */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 min-w-[200px] w-max max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fadeIn custom-scrollbar space-y-0.5">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(selectedSessionId || "");
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-left cursor-pointer group select-none ${
                  isSelected
                    ? "bg-[var(--primary,#FDA92D)] text-white font-semibold"
                    : "text-gray-700 hover:bg-[var(--primary,#FDA92D)] hover:text-white"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={16} className="ml-2 shrink-0 text-white" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {displaySessions.length === 0 && (
        <p className="text-xs text-red-500 mt-1 font-medium">
          No sessions found. Please create a session in Settings.
        </p>
      )}
    </div>
  );
};

export default SessionSelector;