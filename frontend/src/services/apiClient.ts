import type { ApiError } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class ApiException extends Error {
  error: string;
  statusCode: number;

  constructor(error: string, message: string, statusCode: number) {
    super(message);
    this.name = 'ApiException';
    this.error = error;
    this.statusCode = statusCode;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: ApiError = {
        error: `HTTP_${response.status}`,
        message: `Server returned status ${response.status}`,
      };
      try {
        errorData = await response.json();
      } catch {
        // use default fallback message
      }
      throw new ApiException(errorData.error, errorData.message, response.status);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof ApiException) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network error occurred';
    throw new ApiException('NETWORK_ERROR', message, 0);
  }
}
