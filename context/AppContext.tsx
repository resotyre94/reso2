
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, INITIAL_STATE } from '../types';

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  resetData: () => void;
  navigateTo: (tab: string, redirectBackTo?: string | null, editId?: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ali_inventory_db');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            // MIGRATION: Check if currentUser is a string (old format)
            if (parsed.currentUser && typeof parsed.currentUser === 'string') {
                 parsed.currentUser = null;
                 parsed.isAuthenticated = false;
            }

            // Ensure users array exists 
            if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
                parsed.users = [{ username: 'admin', password: '123', role: 'Admin', name: 'System Admin' }];
            }
            
            // Ensure basic user object validity
            if (parsed.currentUser && !parsed.currentUser.username) {
                parsed.currentUser = null;
                parsed.isAuthenticated = false;
            }

            return { ...INITIAL_STATE, ...parsed };
        } catch (e) {
            console.error("Failed to parse local storage", e);
            return { 
                ...INITIAL_STATE,
                users: [{ username: 'admin', password: '123', role: 'Admin', name: 'System Admin' }]
            };
        }
    }
    return { 
        ...INITIAL_STATE,
        users: [{ username: 'admin', password: '123', role: 'Admin', name: 'System Admin' }]
    };
  });

  useEffect(() => {
    localStorage.setItem('ali_inventory_db', JSON.stringify(state));
  }, [state]);

  const resetData = () => {
    setState({
        ...INITIAL_STATE,
        users: [{ username: 'admin', password: '123', role: 'Admin', name: 'System Admin' }]
    });
    localStorage.removeItem('ali_inventory_db');
  };

  const navigateTo = (tab: string, redirectBackTo: string | null = null, editId: string | null = null) => {
      setState(prev => ({
          ...prev,
          activeTab: tab,
          redirectAfterSave: redirectBackTo,
          editTransactionId: editId
      }));
  };

  return (
    <AppContext.Provider value={{ state, setState, resetData, navigateTo }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
