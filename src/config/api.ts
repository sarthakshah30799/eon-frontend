const LOCAL_API_BASE_URL = 'http://localhost:3000';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : import.meta.env.PROD
    ? ''
    : LOCAL_API_BASE_URL;

if (!rawApiBaseUrl && import.meta.env.PROD) {
  // Keep the app usable, but make the deployment misconfiguration obvious.
  console.warn(
    'VITE_API_BASE_URL is not set. Production requests will use the current origin.'
  );
}

