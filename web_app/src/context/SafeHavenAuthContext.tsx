'use client';

// SafeHaven Auth Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, handleApiError } from '@/lib/safehaven-api';
import { User } from '@/types/safehaven';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SafeHavenAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('safehaven_token');
      const savedUser = localStorage.getItem('safehaven_user');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsLoading(false); // Set loading false immediately with cached user
        
        // Verify token is still valid by fetching profile in background
        try {
          const response = await authApi.getProfile();
          if (response.status === 'success' && response.data) {
            const userData = response.data.user || response.data;
            setUser(userData);
            localStorage.setItem('safehaven_user', JSON.stringify(userData));
          }
        } catch (error) {
          // Token invalid, clear auth silently (no toast)
          console.error('Token validation failed:', error);
          localStorage.removeItem('safehaven_token');
          localStorage.removeItem('safehaven_user');
          localStorage.removeItem('safehaven_token_time');
          setUser(null);
          router.push('/auth/login');
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);

      // Backend returns { status: "success", data: { user, accessToken } }
      if (response.status === 'success' && response.data) {
        const { accessToken, user: userData } = response.data;

        // Save to localStorage with timestamp
        localStorage.setItem('safehaven_token', accessToken);
        localStorage.setItem('safehaven_user', JSON.stringify(userData));
        localStorage.setItem('safehaven_token_time', Date.now().toString());

        setUser(userData);
        toast.success('Login successful!');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safehaven_token');
    localStorage.removeItem('safehaven_user');
    localStorage.removeItem('safehaven_token_time');
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.status === 'success' && response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        localStorage.setItem('safehaven_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSafeHavenAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSafeHavenAuth must be used within SafeHavenAuthProvider');
  }
  return context;
};
