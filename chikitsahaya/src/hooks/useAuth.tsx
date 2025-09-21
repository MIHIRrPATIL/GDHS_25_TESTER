import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

export type UserRole = 'doctor' | 'patient';

export interface AuthUser {
  id: string;
  role: UserRole;
  token: string;
  name: string;
  email: string;
  onboardingComplete?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

// RegisterCredentials interface removed - registration now handled directly in auth pages

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (credentials: LoginCredentials | { role: UserRole; onboardingComplete?: boolean }) => Promise<void>;
  register: (credentials: any) => Promise<void>; // Deprecated - use API directly
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials | { role: UserRole; onboardingComplete?: boolean }) => {
    setIsLoading(true);
    
    try {
      if ('email' in credentials) {
        // Real API login with email/password
        const loginRequest = {
          email: credentials.email,
          password: credentials.password
        };

        let response;
        if (credentials.role === 'patient') {
          response = await authAPI.patientLogin(loginRequest);
        } else {
          response = await authAPI.doctorLogin(loginRequest);
        }

        if (response.success && response.data) {
          const { user: apiUser, token } = response.data;
          
          // Create AuthUser object (no token storage)
          const authUser: AuthUser = {
            id: apiUser.id,
            role: apiUser.role,
            token: token,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            onboardingComplete: apiUser.onboardingComplete ?? true,
          };

          setUser(authUser);
          localStorage.setItem('auth-user', JSON.stringify(authUser));
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } else {
        // Legacy login (for existing code) - fallback to mock
        const mockUser: AuthUser = {
          id: credentials.role === 'doctor' ? 'doc1' : 'patient1',
          role: credentials.role,
          token: 'dev-token-' + credentials.role,
          name: credentials.role === 'doctor' ? 'Dr. Smith' : 'John Doe',
          email: credentials.role === 'doctor' ? 'doctor@example.com' : 'patient@example.com',
          onboardingComplete: credentials.onboardingComplete ?? (credentials.role === 'doctor'),
        };

        setUser(mockUser);
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Registration is now handled directly in auth pages
  // This function is kept for backward compatibility but should not be used
  const register = async (credentials: any) => {
    throw new Error('Registration should be handled directly through API calls in auth pages');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};