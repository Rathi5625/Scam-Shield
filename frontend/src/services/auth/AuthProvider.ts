import type { UserProfile, SignInCredentials, SignUpData, UserPreferences } from '../../types/auth';

/**
 * AuthProvider
 * Abstract interface for identity management.
 * Phase 5 implements LocalAuthProvider.
 * Future phases will implement CognitoAuthProvider without modifying React components.
 */
export interface AuthProvider {
  /**
   * Authenticates an operative with credentials.
   */
  signIn(credentials: SignInCredentials): Promise<UserProfile>;

  /**
   * Registers a new operative account.
   */
  signUp(data: SignUpData): Promise<UserProfile>;

  /**
   * Terminates active session.
   */
  signOut(): Promise<void>;

  /**
   * Retrieves the current authenticated user profile if session exists.
   */
  getCurrentUser(): Promise<UserProfile | null>;

  /**
   * Finalizes operative shield onboarding with security preferences.
   */
  completeOnboarding(preferences: UserPreferences): Promise<UserProfile>;

  /**
   * Updates operative profile details (e.g. display name).
   */
  updateProfile(data: { displayName?: string }): Promise<UserProfile>;

  /**
   * Updates security and shield preferences.
   */
  updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile>;

  /**
   * Synchronous check for active session flag.
   */
  isAuthenticated(): boolean;

  /**
   * Retrieves the current bearer authorization token (Cognito JWT or local dev JWT).
   */
  getToken(): Promise<string | null>;
}

