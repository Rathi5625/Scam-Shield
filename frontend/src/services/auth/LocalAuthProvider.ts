import type { UserProfile, SignInCredentials, SignUpData, UserPreferences } from '../../types/auth';
import type { AuthProvider } from './AuthProvider';

const SESSION_STORAGE_KEY = 'scamshield_auth_session_v1';
const USERS_STORAGE_KEY = 'scamshield_mock_users_v1';

interface StoredMockUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}

/**
 * Computes a SHA-256 hex string using browser Web Crypto API.
 * Ensures plaintext passwords are NEVER persisted or exposed in localStorage.
 */
async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * LocalAuthProvider
 * LOCAL MOCK AUTH ONLY — Phase 5 local development provider.
 * Implements AuthProvider using browser localStorage and Web Crypto SHA-256 hashing.
 * Designed for 1:1 drop-in replacement by CognitoAuthProvider in a future cloud phase.
 */
export class LocalAuthProvider implements AuthProvider {
  private users: StoredMockUser[] = [];
  private currentSession: UserProfile | null = null;
  private initialized = false;

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load registered users from storage
    try {
      const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (rawUsers) {
        const parsed = JSON.parse(rawUsers);
        this.users = Array.isArray(parsed)
          ? parsed.filter((u) => u && typeof u === 'object' && u.id && u.email && u.passwordHash)
          : [];
      }
    } catch {
      this.users = [];
    }

    if (!Array.isArray(this.users)) {
      this.users = [];
    }

    // Load active session from storage
    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.email) {
          this.currentSession = parsed;
        } else {
          this.currentSession = null;
        }
      }
    } catch {
      this.currentSession = null;
    }

    this.initialized = true;
  }

  private saveUsers(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch {
      console.warn('ScamShield [MOCK AUTH]: Failed to save mock users to local storage.');
    }
  }

  private saveSession(user: UserProfile | null): void {
    this.currentSession = user;
    try {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      console.warn('ScamShield [MOCK AUTH]: Failed to update local session.');
    }
  }

  async signIn(credentials: SignInCredentials): Promise<UserProfile> {
    await this.initialize();

    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Please provide an operative identifier or email address.');
    }
    if (!credentials.password) {
      throw new Error('Passphrase gate requires a password.');
    }

    const user = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error('Invalid operative credentials. Node access denied.');
    }

    const inputHash = await hashPassphrase(credentials.password);
    if (user.passwordHash !== inputHash) {
      throw new Error('Passphrase mismatch. Check credentials and retry.');
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      onboardingCompleted: user.onboardingCompleted,
      preferences: user.preferences,
    };

    this.saveSession(profile);
    return profile;
  }

  async signUp(data: SignUpData): Promise<UserProfile> {
    await this.initialize();

    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const displayName = (data.displayName || '').trim();

    if (!displayName) {
      throw new Error('Please enter an operative full name or callsign.');
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Please provide a valid operative email address.');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Passphrase must contain at least 8 characters for cryptographic baseline.');
    }

    // Duplicate email check
    const existing = this.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('An operative identity with this email already exists.');
    }

    const passwordHash = await hashPassphrase(data.password);
    const newUser: StoredMockUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      displayName,
      passwordHash,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      preferences: {
        aggressivePhishingShield: true,
        realtimeHeuristics: true,
        familyAlerts: false,
        ephemeralLogging: true,
      },
    };

    this.users.push(newUser);
    this.saveUsers();

    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      createdAt: newUser.createdAt,
      onboardingCompleted: false,
      preferences: newUser.preferences,
    };

    this.saveSession(profile);
    return profile;
  }

  async signOut(): Promise<void> {
    await this.initialize();
    this.saveSession(null);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    await this.initialize();
    return this.currentSession;
  }

  async completeOnboarding(preferences: UserPreferences): Promise<UserProfile> {
    await this.initialize();
    if (!this.currentSession) {
      throw new Error('No active operative session found.');
    }

    const userIndex = this.users.findIndex((u) => u.id === this.currentSession?.id);
    if (userIndex !== -1) {
      this.users[userIndex].onboardingCompleted = true;
      this.users[userIndex].preferences = preferences;
      this.saveUsers();
    }

    const updatedProfile: UserProfile = {
      ...this.currentSession,
      onboardingCompleted: true,
      preferences,
    };

    this.saveSession(updatedProfile);
    return updatedProfile;
  }

  async updateProfile(data: { displayName?: string }): Promise<UserProfile> {
    await this.initialize();
    if (!this.currentSession) {
      throw new Error('No active operative session.');
    }

    const newName = data.displayName?.trim();
    if (!newName) {
      throw new Error('Display name cannot be empty.');
    }

    const userIndex = this.users.findIndex((u) => u.id === this.currentSession?.id);
    if (userIndex !== -1) {
      this.users[userIndex].displayName = newName;
      this.saveUsers();
    }

    const updatedProfile: UserProfile = {
      ...this.currentSession,
      displayName: newName,
    };

    this.saveSession(updatedProfile);
    return updatedProfile;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile> {
    await this.initialize();
    if (!this.currentSession) {
      throw new Error('No active operative session.');
    }

    const currentPrefs = this.currentSession.preferences || {
      aggressivePhishingShield: true,
      realtimeHeuristics: true,
      familyAlerts: true,
      ephemeralLogging: true,
    };

    const merged: UserPreferences = {
      ...currentPrefs,
      ...preferences,
    };

    const userIndex = this.users.findIndex((u) => u.id === this.currentSession?.id);
    if (userIndex !== -1) {
      this.users[userIndex].preferences = merged;
      this.saveUsers();
    }

    const updatedProfile: UserProfile = {
      ...this.currentSession,
      preferences: merged,
    };

    this.saveSession(updatedProfile);
    return updatedProfile;
  }

  isAuthenticated(): boolean {
    if (!this.initialized) {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        return Boolean(raw);
      } catch {
        return false;
      }
    }
    return Boolean(this.currentSession);
  }

  async getToken(): Promise<string | null> {
    await this.initialize();
    if (!this.currentSession) return null;
    return generateDevJwt(this.currentSession.id, this.currentSession.email);
  }
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateDevJwt(userId: string, email: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    email: email,
    iat: now,
    exp: now + 86400,
    iss: 'scamshield-local-dev',
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const secret = 'scamshield-dev-jwt-secret-key-must-be-32-chars!';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = bufferToBase64Url(signature);

  return `${data}.${sigB64}`;
}

// Platform singleton instance
export const authProvider = new LocalAuthProvider();
