import React from 'react';
import { useGetAllSessionsQuery } from '../../redux/api/authApi';

const SessionSelector = ({ 
  selectedSessionId, 
  onSessionChange, 
  label = "Select Session",
  required = true,
  disabled = false,
  className = ""
}) => {
  const { data: sessions, isLoading } = useGetAllSessionsQuery();

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          Loading sessions...
        </div>
      </div>
    );
  }

  const activeSessions = sessions?.data?.filter(session => session.isActive) || [];

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={selectedSessionId || ''}
        onChange={(e) => onSessionChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
        disabled={disabled}
      >
        <option value="">Choose a session...</option>
        {activeSessions.map((session) => (
          <option key={session._id} value={session._id}>
            {session.name}
          </option>
        ))}
      </select>
      {activeSessions.length === 0 && (
        <p className="text-sm text-red-600 mt-1">
          No active sessions found. Please create a session first.
        </p>
      )}
    </div>
  );
};

export default SessionSelector;