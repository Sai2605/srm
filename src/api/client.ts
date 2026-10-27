/**
 * Single HTTP client for the whole app.
 *  - adds the Bearer token
 *  - refreshes the token once on 401 (single-flight), then retries
 *  - normalises errors into ApiError
 *  - routes to the mock backend when EXPO_PUBLIC_USE_MOCKS=true
 */
import { API_URL, REQUEST_TIMEOUT_MS, USE_MOCKS } from './config';
import { endpoints } from './endpoints';
import { tokenStorage } from './tokenStorage';
import { mockRequest } from './mock';
import { ApiError } from './errors';
import type { ApiErrorBody, AuthTokens } from '@/types/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Set false for public endpoints (login). */
  auth?: boolean;
  signal?: AbortSignal;
}

export { ApiError, errorMessage } from './errors';

/* ---- Session-expired hook (AuthProvider registers this) ---- */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

/* ---- Helpers ---- */
function buildUrl(path: string, query?: Query) {
  const qs = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  return `${API_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* non-JSON error */
  }
  return new ApiError(res.status, body.message ?? `Request failed (${res.status})`, body.code);
}

let refreshing: Promise<AuthTokens | null> | null = null;

async function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const current = await tokenStorage.get();
      if (!current?.refreshToken) return null;
      try {
        const res = await fetch(buildUrl(endpoints.auth.refresh), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        if (!res.ok) return null;
        const next = (await res.json()) as AuthTokens;
        await tokenStorage.set(next);
        return next;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function rawFetch(method: HttpMethod, path: string, opts: RequestOptions, token?: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  opts.signal?.addEventListener('abort', () => controller.abort());

  try {
    return await fetch(buildUrl(path, opts.query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new ApiError(0, 'Request timed out');
    throw new ApiError(0, 'No internet connection');
  } finally {
    clearTimeout(timeout);
  }
}

export async function request<T>(method: HttpMethod, path: string, opts: RequestOptions = {}): Promise<T> {
  if (USE_MOCKS) return mockRequest<T>(method, path, opts.query, opts.body);

  const needsAuth = opts.auth !== false;
  let token = needsAuth ? (await tokenStorage.get())?.accessToken : undefined;
  let res = await rawFetch(method, path, opts, token);

  if (res.status === 401 && needsAuth) {
    const next = await refreshTokens();
    if (next) {
      token = next.accessToken;
      res = await rawFetch(method, path, opts, token);
    }
    if (res.status === 401) {
      await tokenStorage.clear();
      onUnauthorized?.();
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
