import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, ApiPerson, ApiTeam, ApiFeedback } from '../services/api';
import { useToast } from './ToastContext';

interface AppContextType {
  persons: ApiPerson[];
  teams: ApiTeam[];
  feedbacks: ApiFeedback[];
  loading: boolean;
  refreshPersons: () => Promise<void>;
  refreshTeams: () => Promise<void>;
  refreshFeedbacks: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [persons, setPersons] = useState<ApiPerson[]>([]);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [feedbacks, setFeedbacks] = useState<ApiFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const refreshPersons = async () => {
    try {
      const data = await apiService.getPersons();
      setPersons(data);
    } catch (error) {
      console.error('Failed to fetch persons:', error);
      showError('Failed to load team members');
    }
  };

  const refreshTeams = async () => {
    try {
      const data = await apiService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      showError('Failed to load teams');
    }
  };

  const refreshFeedbacks = async () => {
    try {
      const data = await apiService.getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      showError('Failed to load feedbacks');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshPersons(),
        refreshTeams(),
        refreshFeedbacks(),
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on startup
  useEffect(() => {
    refreshAll();
  }, []);

  const value = {
    persons,
    teams,
    feedbacks,
    loading,
    refreshPersons,
    refreshTeams,
    refreshFeedbacks,
    refreshAll,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
