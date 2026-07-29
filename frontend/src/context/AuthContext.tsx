import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '@/services/api';
import { 
  apiService, 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken 
} from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (initialMode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: 'student' | 'coordinator' | 'judge' | 'admin';
    department?: string;
    college_id?: string;
  }) => Promise<UserProfile>;
  signup: (email: string, password: string, fullName: string, role: string) => Promise<UserProfile>;
  quickLoginAsRole: (role: 'student' | 'coordinator' | 'judge' | 'admin') => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default fallback mock user if API is offline
const MOCK_DEMO_USERS: Record<string, UserProfile> = {
  student: {
    id: 'demo-student-id',
    email: 'student@college.edu',
    full_name: 'Alex Rivera',
    role: 'student',
    department: 'Computer Science & Engineering',
    college_id: 'CS2026-088',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Full-stack AI developer passionate about high-scale web systems and LLMs.',
    is_active: true
  },
  coordinator: {
    id: 'demo-coord-id',
    email: 'coordinator@college.edu',
    full_name: 'Dr. Sarah Connor',
    role: 'coordinator',
    department: 'Department of Information Technology',
    college_id: 'FAC-8812',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'Lead Faculty Coordinator for Hackathons & Innovation Cell.',
    is_active: true
  },
  judge: {
    id: 'demo-judge-id',
    email: 'judge@college.edu',
    full_name: 'Prof. David Zhang',
    role: 'judge',
    department: 'School of Artificial Intelligence',
    college_id: 'FAC-9901',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Senior AI Researcher and Industry Mentor.',
    is_active: true
  },
  admin: {
    id: 'demo-admin-id',
    email: 'admin@college.edu',
    full_name: 'System Admin',
    role: 'admin',
    department: 'Central IT & Systems',
    college_id: 'ADM-0001',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Platform Administrator.',
    is_active: true
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          setIsLoading(true);
          const response = await apiService.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.log("Backend offline or token expired, utilizing standard demo user state.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    initAuth();

    const handleUnauthorized = () => {
      removeStoredToken();
      setToken(null);
      setUser(null);
      window.location.href = '/';
    };

    window.addEventListener('chms-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('chms-unauthorized', handleUnauthorized);
    };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      if (response.data) {
        setStoredToken(response.data.access_token);
        setToken(response.data.access_token);
        setUser(response.data.user);
        closeAuthModal();
        setIsLoading(false);
        return response.data.user;
      }
      throw new Error("Invalid response format");
    } catch (err: any) {
      // Fallback for demo mode if backend is not actively listening
      const matchingDemo = Object.values(MOCK_DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matchingDemo) {
        setUser(matchingDemo);
        closeAuthModal();
        setIsLoading(false);
        return matchingDemo;
      } else {
        setIsLoading(false);
        throw err;
      }
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: 'student' | 'coordinator' | 'judge' | 'admin';
    department?: string;
    college_id?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const response = await apiService.register(payload);
      if (response.data) {
        setStoredToken(response.data.access_token);
        setToken(response.data.access_token);
        setUser(response.data.user);
        closeAuthModal();
        setIsLoading(false);
        return response.data.user;
      }
      throw new Error("Invalid response format");
    } catch (err: any) {
      // Fallback user creation locally if backend is unavailable
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role || 'student',
        department: payload.department || 'Computer Science',
        college_id: payload.college_id || 'STUDENT-2026',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        is_active: true
      };
      setUser(newUser);
      closeAuthModal();
      setIsLoading(false);
      return newUser;
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: string): Promise<UserProfile> => {
    // Standard role mapping to lowercase
    const roleLower = role.toLowerCase() as 'student' | 'coordinator' | 'judge' | 'admin';
    return await register({
      email,
      password,
      full_name: fullName,
      role: roleLower
    });
  };

  const quickLoginAsRole = async (role: 'student' | 'coordinator' | 'judge' | 'admin') => {
    const demoEmail = `${role}@college.edu`;
    const password = 'password123';
    try {
      await login(demoEmail, password);
    } catch (e) {
      setUser(MOCK_DEMO_USERS[role]);
      closeAuthModal();
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await apiService.updateProfile(data);
      if (res.data) {
        setUser(res.data);
      }
    } catch (err) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await apiService.changePassword({
      current_password: currentPassword,
      new_password: newPassword
    });
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        signup,
        quickLoginAsRole,
        updateProfile,
        changePassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
