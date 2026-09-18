/**
 * ScamShield Authentication & User Profile Domain Models
 * Prepared for future Amazon Cognito User Pool integration
 */

export interface UserPreferences {
  aggressivePhishingShield: boolean;
  realtimeHeuristics: boolean;
  familyAlerts: boolean;
  ephemeralLogging: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}

export interface SignInCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  displayName: string;
  email: string;
  password?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
