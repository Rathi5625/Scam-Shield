import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import type { UserProfile, SignInCredentials, SignUpData, UserPreferences } from '../../types/auth';
import type { AuthProvider } from './AuthProvider';
import { apiClient } from '../api/apiClient';

interface UserProfileResponse {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}

export class CognitoAuthProvider implements AuthProvider {
  private userPool: CognitoUserPool;
  private currentUserProfile: UserProfile | null = null;
  private initialized = false;

  constructor() {
    const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_ScamShieldDev';
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || 'scamshield-web-client-dev';

    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    });
  }

  async signIn(credentials: SignInCredentials): Promise<UserProfile> {
    const email = (credentials.email || '').trim();
    const password = credentials.password || '';

    if (!email) {
      throw new Error('Please provide your operative email address.');
    }
    if (!password) {
      throw new Error('Passphrase gate requires a password.');
    }

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise<UserProfile>((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          try {
            const idToken = session.getIdToken();
            const payload = idToken.decodePayload();
            const sub = payload.sub || idToken.getJwtToken();
            const userEmail = payload.email || email;
            const displayName = payload.name || payload['cognito:username'] || userEmail.split('@')[0];

            // Bootstrap user record in DynamoDB via authenticated backend call
            let profile: UserProfile;
            try {
              const res = await apiClient.post<UserProfileResponse>('/users/bootstrap', {
                email: userEmail,
                displayName: displayName,
              });
              profile = {
                id: res.userId || sub,
                email: res.email || userEmail,
                displayName: res.displayName || displayName,
                createdAt: res.createdAt || new Date().toISOString(),
                onboardingCompleted: Boolean(res.onboardingCompleted),
                preferences: res.preferences,
              };
            } catch {
              // Fallback to token payload if backend bootstrap call fails during offline testing
              profile = {
                id: sub,
                email: userEmail,
                displayName: displayName,
                createdAt: new Date().toISOString(),
                onboardingCompleted: false,
              };
            }

            this.currentUserProfile = profile;
            this.initialized = true;
            resolve(profile);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to finalize session';
            reject(new Error(msg));
          }
        },
        onFailure: (err) => {
          const msg = err.message || 'Cognito authentication failed.';
          reject(new Error(msg));
        },
        newPasswordRequired: () => {
          reject(new Error('New password required. Please reset your password via your identity administrator.'));
        },
      });
    });
  }

  async signUp(data: SignUpData): Promise<UserProfile> {
    const email = (data.email || '').trim().toLowerCase();
    const displayName = (data.displayName || '').trim();
    const password = data.password || '';

    if (!displayName) {
      throw new Error('Please enter an operative full name or callsign.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid operative email address.');
    }
    if (!password || password.length < 8) {
      throw new Error('Passphrase must contain at least 8 characters for cryptographic baseline.');
    }

    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: displayName }),
    ];

    return new Promise<UserProfile>((resolve, reject) => {
      this.userPool.signUp(email, password, attributeList, [], async (err, result) => {
        if (err || !result) {
          const msg = err?.message || 'Registration failed with Amazon Cognito.';
          return reject(new Error(msg));
        }

        const userSub = result.userSub;
        const profile: UserProfile = {
          id: userSub,
          email,
          displayName,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
          preferences: {
            aggressivePhishingShield: true,
            realtimeHeuristics: true,
            familyAlerts: false,
            ephemeralLogging: true,
          },
        };

        this.currentUserProfile = profile;
        this.initialized = true;
        resolve(profile);
      });
    });
  }

  async signOut(): Promise<void> {
    const cognitoUser = this.userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    this.currentUserProfile = null;
    this.initialized = true;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const cognitoUser = this.userPool.getCurrentUser();
    if (!cognitoUser) {
      this.currentUserProfile = null;
      this.initialized = true;
      return null;
    }

    return new Promise<UserProfile | null>((resolve) => {
      cognitoUser.getSession(async (err: unknown, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          this.currentUserProfile = null;
          this.initialized = true;
          return resolve(null);
        }

        try {
          const payload = session.getIdToken().decodePayload();
          const sub = payload.sub;
          const userEmail = payload.email || cognitoUser.getUsername();
          const displayName = payload.name || userEmail.split('@')[0];

          // Fetch fresh operative profile from backend /users/me
          try {
            const remoteUser = await apiClient.get<UserProfileResponse>('/users/me');
            if (remoteUser && remoteUser.userId) {
              const profile: UserProfile = {
                id: remoteUser.userId,
                email: remoteUser.email || userEmail,
                displayName: remoteUser.displayName || displayName,
                createdAt: remoteUser.createdAt,
                onboardingCompleted: Boolean(remoteUser.onboardingCompleted),
                preferences: remoteUser.preferences,
              };
              this.currentUserProfile = profile;
              this.initialized = true;
              return resolve(profile);
            }
          } catch {
            // If /users/me not yet created or offline, use token claims
          }

          const fallbackProfile: UserProfile = {
            id: sub,
            email: userEmail,
            displayName: displayName,
            createdAt: new Date().toISOString(),
            onboardingCompleted: false,
          };
          this.currentUserProfile = fallbackProfile;
          this.initialized = true;
          resolve(fallbackProfile);
        } catch {
          this.currentUserProfile = null;
          this.initialized = true;
          resolve(null);
        }
      });
    });
  }

  async completeOnboarding(preferences: UserPreferences): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) {
      throw new Error('No active authenticated operative session found.');
    }

    try {
      const updated = await apiClient.put<UserProfileResponse>(`/users/${current.id}/preferences`, preferences);
      const profile: UserProfile = {
        ...current,
        onboardingCompleted: true,
        preferences: updated.preferences || preferences,
      };
      this.currentUserProfile = profile;
      return profile;
    } catch {
      const profile: UserProfile = {
        ...current,
        onboardingCompleted: true,
        preferences,
      };
      this.currentUserProfile = profile;
      return profile;
    }
  }

  async updateProfile(data: { displayName?: string }): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) {
      throw new Error('No active operative session.');
    }

    const newName = data.displayName?.trim();
    if (!newName) {
      throw new Error('Display name cannot be empty.');
    }

    try {
      const updated = await apiClient.put<UserProfileResponse>(`/users/${current.id}/profile`, { displayName: newName });
      const profile: UserProfile = {
        ...current,
        displayName: updated.displayName || newName,
      };
      this.currentUserProfile = profile;
      return profile;
    } catch {
      const profile: UserProfile = {
        ...current,
        displayName: newName,
      };
      this.currentUserProfile = profile;
      return profile;
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) {
      throw new Error('No active operative session.');
    }

    const merged = { ...(current.preferences || {}), ...preferences };
    try {
      const updated = await apiClient.put<UserProfileResponse>(`/users/${current.id}/preferences`, merged);
      const profile: UserProfile = {
        ...current,
        preferences: updated.preferences || (merged as UserPreferences),
      };
      this.currentUserProfile = profile;
      return profile;
    } catch {
      const profile: UserProfile = {
        ...current,
        preferences: merged as UserPreferences,
      };
      this.currentUserProfile = profile;
      return profile;
    }
  }

  isAuthenticated(): boolean {
    if (!this.initialized) {
      const cognitoUser = this.userPool.getCurrentUser();
      return Boolean(cognitoUser);
    }
    return Boolean(this.currentUserProfile);
  }

  async getToken(): Promise<string | null> {
    const cognitoUser = this.userPool.getCurrentUser();
    if (!cognitoUser) return null;

    return new Promise<string | null>((resolve) => {
      cognitoUser.getSession((err: unknown, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          return resolve(null);
        }
        // Return ID token (or Access token) as Bearer token for API calls
        const token = session.getIdToken().getJwtToken();
        resolve(token);
      });
    });
  }
}

export const cognitoAuthProvider = new CognitoAuthProvider();
