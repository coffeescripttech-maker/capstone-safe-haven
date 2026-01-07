// Authentication Context

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserProfile } from '../types/models';
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from '../types/api';
import { authService } from '../services/auth';
import { STORAGE_KEYS } from '../constants/config';
import { storeData, getData, removeData } from '../utils/storage';
import { handleApiError } from '../services/api';

interface AuthContextData {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await getData<User>(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        setUser(storedUser);
        // Fetch fresh profile data
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      
      // Store tokens
      await storeData(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      await storeData(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      await storeData(STORAGE_KEYS.USER_DATA, response.user);
      
      setUser(response.user);
      
      // Fetch profile
      await refreshProfile();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      
      // Store tokens
      await storeData(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      await storeData(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      await storeData(STORAGE_KEYS.USER_DATA, response.user);
      
      setUser(response.user);
      
      // Fetch profile
      await refreshProfile();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const logout = async () => {
    try {
      // Clear storage
      await removeData(STORAGE_KEYS.ACCESS_TOKEN);
      await removeData(STORAGE_KEYS.REFRESH_TOKEN);
      await removeData(STORAGE_KEYS.USER_DATA);
      await removeData(STORAGE_KEYS.FCM_TOKEN);
      
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.user);
      setProfile(response.profile);
      
      // Update stored user data
      await storeData(STORAGE_KEYS.USER_DATA, response.user);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
      setProfile(response.profile);
      
      // Update stored user data
      await storeData(STORAGE_KEYS.USER_DATA, response.user);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
