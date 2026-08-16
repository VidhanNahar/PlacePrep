import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserDTO, UserRole, SyncProfileInput } from '@placeprep/shared';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signupWithCollegeEmail: (email: string, password: string, profile: SyncProfileInput) => Promise<void>;
  loginAsDevUser: (role: 'STUDENT' | 'MODERATOR' | 'ADMIN') => Promise<void>;
  syncUserProfile: (profile: SyncProfileInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch local user profile from backend
  const fetchCurrentUserProfile = async () => {
    try {
      const response: any = await api.get('/auth/me');
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('placeprep_auth_token');
      if (token) {
        await fetchCurrentUserProfile();
      } else {
        setIsLoading(false);
      }

      if (isSupabaseConfigured) {
        // Listen to Supabase auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.access_token) {
            localStorage.setItem('placeprep_auth_token', session.access_token);
            await fetchCurrentUserProfile();
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('placeprep_auth_token');
            setUser(null);
          }
        });
      }
    };

    initAuth();
  }, []);

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Dev fallback if Supabase keys not populated
        await loginAsDevUser('STUDENT');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.session?.access_token) {
        localStorage.setItem('placeprep_auth_token', data.session.access_token);
        await fetchCurrentUserProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithCollegeEmail = async (
    email: string,
    password: string,
    profile: SyncProfileInput
  ) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        await loginAsDevUser('STUDENT');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.fullName,
            college_name: profile.collegeName,
            graduation_year: profile.graduationYear,
            branch: profile.branch,
          },
        },
      });

      if (error) throw error;

      if (data.session?.access_token) {
        localStorage.setItem('placeprep_auth_token', data.session.access_token);
        // Sync profile with backend DB
        await api.post('/auth/sync-profile', profile);
        await fetchCurrentUserProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDevUser = async (role: 'STUDENT' | 'MODERATOR' | 'ADMIN') => {
    setIsLoading(true);
    try {
      const email =
        role === 'ADMIN'
          ? 'admin@thapar.edu'
          : role === 'MODERATOR'
          ? 'priya.nair@iitb.ac.in'
          : 'aarav.sharma@thapar.edu';

      const mockToken = `mock-dev-token:${email}`;
      localStorage.setItem('placeprep_auth_token', mockToken);
      await fetchCurrentUserProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const syncUserProfile = async (profile: SyncProfileInput) => {
    const response: any = await api.post('/auth/sync-profile', profile);
    if (response.success && response.data) {
      setUser(response.data);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('placeprep_auth_token');
    setUser(null);
  };

  const isModerator = user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isModerator,
        isAdmin,
        loginWithPassword,
        signupWithCollegeEmail,
        loginAsDevUser,
        syncUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
