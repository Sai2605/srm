/** Runtime config read from EXPO_PUBLIC_* env vars (see .env.example). */

export const API_URL = ('https://api.example.com/v1').replace(/\/$/, '');

/** Defaults to mocks so the app runs before the backend exists. */
export const USE_MOCKS = 'false';

export const LIVE_POLL_MS = Number(5000);

export const REQUEST_TIMEOUT_MS = 15000;
