import type { AuthProvider } from './AuthProvider';
import { authProvider as localAuthProvider } from './LocalAuthProvider';
import { cognitoAuthProvider } from './CognitoAuthProvider';
import { registerTokenProvider } from '../api/apiClient';

/**
 * Resolves active AuthProvider based on VITE_AUTH_MODE.
 * Supported modes:
 * - 'LOCAL' (default): Local development mock with Web Crypto SHA-256
 * - 'COGNITO': Live Amazon Cognito User Pool authentication with JWTs
 */
const authMode = (import.meta.env.VITE_AUTH_MODE || 'LOCAL').toUpperCase();

export const authProvider: AuthProvider =
  authMode === 'COGNITO' ? cognitoAuthProvider : localAuthProvider;

// Register token retrieval callback so apiClient automatically attaches Bearer tokens
registerTokenProvider(() => authProvider.getToken());

export { localAuthProvider, cognitoAuthProvider };
