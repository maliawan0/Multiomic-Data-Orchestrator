import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getMe, logout as apiLogout } from '@/lib/api';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user by validating the token
    const validateSession = async () => {
      const token = localStorage.getItem('mdo-token');
      
      if (token) {
        try {
          // Validate token by calling /auth/me
          const userData = await getMe();
          setUser({ email: userData.email, name: userData.name });
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error("Session validation failed", error);
          localStorage.removeItem('mdo-token');
          localStorage.removeItem('mdo-user');
          setUser(null);
        }
      } else {
        // No token, try to restore from localStorage (fallback)
        try {
          const storedUser = localStorage.getItem('mdo-user');
          if (storedUser) {
            // We have a stored user but no token, clear it
            localStorage.removeItem('mdo-user');
          }
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          localStorage.removeItem('mdo-user');
        }
      }
      
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = (email: string, name?: string) => {
    const newUser = { email, name };
    localStorage.setItem('mdo-user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    // Call backend logout endpoint for audit logging
    await apiLogout();
    // Clear user state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
