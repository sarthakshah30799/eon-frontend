import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { IUser } from '../modules/auth/types';
import { toast } from 'react-hot-toast';
import { AUTH_SESSION_EXPIRED_EVENT } from './authSessionEvents';
import { AUTH_CONSTANTS } from '../modules/auth/constants/authConstants';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeBranchId: string | null;
  activeCounterId: string | null;
  setWorkplace: (branchId: string, counterId: string) => void;
  clearWorkplace: () => void;
  login: (email: string, password: string) => Promise<void>;
  otpLogin: (
    countryCode: string,
    mobileNumber: string,
    otp: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    () => localStorage.getItem('activeBranchId')
  );
  const [activeCounterId, setActiveCounterId] = useState<string | null>(
    () => localStorage.getItem('activeCounterId')
  );

  const isAuthenticated = !!user;

  const clearSessionState = useCallback(() => {
    setUser(null);
    setActiveBranchId(null);
    setActiveCounterId(null);
    localStorage.removeItem('activeBranchId');
    localStorage.removeItem('activeCounterId');
  }, []);

  const handleSessionExpired = useCallback((message?: string) => {
    clearSessionState();
    
    const publicPaths = ['/login', '/forgot-password', '/reset-password', '/mail-console'];
    if (publicPaths.includes(window.location.pathname)) {
      return;
    }

    toast.error(message || AUTH_CONSTANTS.MESSAGES.SESSION_EXPIRED);
    window.location.replace('/login');
  }, [clearSessionState]);

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser({
        ...currentUser,
        isHo: currentUser.isHo || currentUser.isHoStaff,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authApi.login({ email, password });
    await checkAuth();
  };

  const otpLogin = async (
    countryCode: string,
    mobileNumber: string,
    otp: string
  ) => {
    await authApi.verifyOtp(countryCode, mobileNumber, otp);
    await checkAuth();
  };

  const setWorkplace = (branchId: string, counterId: string) => {
    setActiveBranchId(branchId);
    setActiveCounterId(counterId);
    localStorage.setItem('activeBranchId', branchId);
    localStorage.setItem('activeCounterId', counterId);
  };

  const clearWorkplace = () => {
    setActiveBranchId(null);
    setActiveCounterId(null);
    localStorage.removeItem('activeBranchId');
    localStorage.removeItem('activeCounterId');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSessionState();
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    checkAuth();
  }, []);

  useEffect(() => {
    const onSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; status?: number }>;
      handleSessionExpired(customEvent.detail?.message);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, [handleSessionExpired]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    activeBranchId,
    activeCounterId,
    setWorkplace,
    clearWorkplace,
    login,
    otpLogin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
