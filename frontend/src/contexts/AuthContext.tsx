import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: 'Student' | 'Judge' | 'Coordinator' | 'Administrator';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<User>;
  logout: () => void;
  updateProfile: (fullName: string, email?: string) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on boot
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('chms_token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (err) {
          // Token is invalid/expired; clear it
          localStorage.removeItem('chms_token');
          localStorage.removeItem('chms_role');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, role } = res.data;
      
      localStorage.setItem('chms_token', access_token);
      localStorage.setItem('chms_role', role);

      // Fetch full profile info
      const profileRes = await api.get('/users/me');
      const userData: User = profileRes.data;
      setUser(userData);
      setIsLoading(false);
      return userData;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        email,
        password,
        full_name: fullName,
        role: role
      });
      setIsLoading(false);
      return res.data;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('chms_token');
    localStorage.removeItem('chms_role');
    setUser(null);
  };

  const updateProfile = async (fullName: string, email?: string) => {
    try {
      const res = await api.put('/users/me/profile', {
        full_name: fullName,
        email: email || undefined
      });
      const updatedUser: User = res.data;
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
