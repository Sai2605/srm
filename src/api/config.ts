/** Runtime config read from EXPO_PUBLIC_* env vars (see .env.example). */

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com/v1').replace(/\/$/, '');

/** Defaults to mocks so the app runs before the backend exists. */
export const USE_MOCKS = (process.env.EXPO_PUBLIC_USE_MOCKS ?? 'true') !== 'false';

export const LIVE_POLL_MS = Number(process.env.EXPO_PUBLIC_LIVE_POLL_MS ?? 5000);

export const REQUEST_TIMEOUT_MS = 15000;
