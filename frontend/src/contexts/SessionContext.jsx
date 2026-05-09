import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetAllSessionsQuery } from '../redux/api/authApi';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [activeSessionId, setActiveSessionId] = useState('');
  const { data: sessions, isLoading } = useGetAllSessionsQuery();

  // Auto-select first active session on load
  useEffect(() => {
    if (sessions?.data && !activeSessionId) {
      const activeSessions = sessions.data.filter(session => session.isActive);
      if (activeSessions.length > 0) {
        setActiveSessionId(activeSessions[0]._id);
      }
    }
  }, [sessions, activeSessionId]);

  const activeSession = sessions?.data?.find(session => session._id === activeSessionId);

  const value = {
    activeSessionId,
    setActiveSessionId,
    activeSession,
    sessions: sessions?.data || [],
    isLoading
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;