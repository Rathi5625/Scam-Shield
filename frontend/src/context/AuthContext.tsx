import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, SignInCredentials, SignUpData, UserPreferences } from '../types/auth';
import { authProvider } from '../services/auth/authProviderResolver';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<UserProfile>;
  signUp: (data: SignUpData) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  completeOnboarding: (preferences: UserPreferences) => Promise<UserProfile>;
  updateProfile: (data: { displayName?: string }) => Promise<UserProfile>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const current = await authProvider.getCurrentUser();
        if (isMounted) {
          setUser(current);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('ScamShield [MOCK AUTH]: Session restoration check failed:', err);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await authProvider.signIn(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await authProvider.signUp(data);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Check operative parameters.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authProvider.signOut();
      setUser(null);
    } catch (err) {
      console.warn('ScamShield [MOCK AUTH]: Sign out encountered error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await authProvider.completeOnboarding(preferences);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to finalize onboarding.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: { displayName?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await authProvider.updateProfile(data);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update operative profile.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await authProvider.updatePreferences(preferences);
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update operative preferences.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
        updateProfile,
        updatePreferences,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
