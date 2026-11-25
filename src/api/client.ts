
/**
 * Single HTTP client for the whole app.
 * - Adds the Bearer token to authenticated requests.
 * - Handles expired JWT sessions (401).
 * - Normalises errors into ApiError.
 * - Routes to mock backend when USE_MOCKS=true.
 */

import { API_URL, REQUEST_TIMEOUT_MS, USE_MOCKS } from './config';
import { tokenStorage } from './tokenStorage';
import { mockRequest } from './mock';
import { ApiError } from './errors';
import type { ApiErrorBody } from './../types/api';
import { ToastAndroid } from 'react-native';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type Query = Record<
  string,
  string | number | boolean | undefined | null
>;

export interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Set false for public endpoints (login / OTP). */
  auth?: boolean;
  signal?: AbortSignal;
}

export { ApiError, errorMessage } from './errors';

/* ---- Session-expired hook ---- */

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

/* ---- Helpers ---- */

function buildUrl(path: string, query?: Query) {
  const qs = query
    ? Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&')
    : '';

  return `${API_URL}${path}${qs ? `?${qs}` : ''}`;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};

  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // Non-JSON error response.
  }

  return new ApiError(
    res.status,
    body.message ?? `Request failed (${res.status})`,
    body.code,
  );
}

/* ---- HTTP request ---- */


async function rawFetch(
  method: HttpMethod,
  path: string,
  opts: RequestOptions,
  token?: string,
) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  const abortRequest = () => controller.abort();
  opts.signal?.addEventListener('abort', abortRequest);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    // Attach JWT to all authenticated HTTP methods.
    if (opts.auth !== false && token) {
      headers.token = token;
    }

    console.log('[REQUEST HEADERS]', {
      method,
      url: buildUrl(path, opts.query),
      authorizationAttached: !!headers.Authorization,
    });

    return await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body:
        opts.body !== undefined
          ? JSON.stringify(opts.body)
          : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(0, 'Request timed out');
    }

    throw new ApiError(0, 'No internet connection');
  } finally {
    clearTimeout(timeout);
    opts.signal?.removeEventListener('abort', abortRequest);
  }
}


/* ---- Main request function ---- */

export async function request<T>(
  method: HttpMethod,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  if (USE_MOCKS) {
    return mockRequest<T>(
      method,
      path,
      opts.query,
      opts.body,
    );
  }

  const needsAuth = opts.auth !== false;

  // const token = needsAuth
  //   ? (await tokenStorage.get())?.accessToken
  //   : undefined;

  // const res = await rawFetch(
  //   method,
  //   path,
  //   opts,
  //   token,
  // );

  const token = needsAuth
    ? (await tokenStorage.get())?.accessToken
    : undefined;

  console.log('========== API REQUEST ==========');
  console.log('URL:', buildUrl(path, opts.query));
  console.log('METHOD:', method);
  console.log('AUTH REQUIRED:', needsAuth);
  console.log('TOKEN PRESENT:', !!token);
  console.log('TOKEN FORMAT VALID:', token?.split('.').length === 3);

  const res = await rawFetch(method, path, opts, token);

  console.log('========== API RESPONSE ==========');
  console.log('STATUS:', res.status);
  console.log('URL:', buildUrl(path, opts.query));

  // Backend rejected the JWT.
  if (res.status === 401 && needsAuth) {
    const error = await parseError(res);

    await tokenStorage.clear();
    onUnauthorized?.();

    throw error;
  }

  if (res.status === 502) {
    ToastAndroid.show(
      'Server is temporarily unavailable. Please try again later.',
      ToastAndroid.LONG,
    );

    throw await parseError(res);
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/* ---- API methods ---- */

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, opts),

  post: <T>(
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ) =>
    request<T>('POST', path, { ...opts, body }),

  put: <T>(
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ) =>
    request<T>('PUT', path, { ...opts, body }),

  patch: <T>(
    path: string,
    body?: unknown,
    opts?: RequestOptions,
  ) =>
    request<T>('PATCH', path, { ...opts, body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
};
