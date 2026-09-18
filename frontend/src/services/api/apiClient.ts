/**
 * ScamShield Centralized API Client
 * Configured via VITE_API_BASE_URL (defaults to http://localhost:8080/api)
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type TokenProvider = () => Promise<string | null>;
let currentTokenProvider: TokenProvider | null = null;

export function registerTokenProvider(provider: TokenProvider): void {
  currentTokenProvider = provider;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  public async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'DELETE' });
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...((init.headers as Record<string, string>) || {}),
      };

      // Automatically attach Bearer token if not explicitly provided
      if (!headers['Authorization'] && currentTokenProvider) {
        try {
          const token = await currentTokenProvider();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch {
          // Fallback to unauthenticated request
        }
      }

      const res = await fetch(url, {
        ...init,
        headers,
      });

      if (!res.ok) {
        let errData: ApiErrorResponse = {};
        try {
          errData = await res.json();
        } catch {
          // Non-JSON response
        }
        const msg = errData.message || errData.error || `HTTP ${res.status}: ${res.statusText}`;
        throw new ApiError(msg, res.status, errData.error || 'HTTP_ERROR');
      }

      // Handle 204 No Content
      if (res.status === 204) {
        return {} as T;
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : 'Network request failed';
      throw new ApiError(message, 0, 'NETWORK_ERROR');
    }
  }
}

export const apiClient = new ApiClient();
