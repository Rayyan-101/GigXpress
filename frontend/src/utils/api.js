// Central API configuration for the frontend.
//
// Every existing screen currently builds fetch URLs manually with
// import.meta.env.VITE_API_URL. Keeping that logic here gives the project one
// place to control the backend URL, cookie handling, JSON headers, and common
// auth failure behavior.
//
// This file does not change any current page by itself. Screens will start
// using these helpers one by one in later refactor steps.

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Build a full API URL from either:
 * - a backend path such as "/api/auth/me"
 * - a full URL such as "https://example.com/api/auth/me"
 *
 * Keeping this small helper separate makes future changes safer if the backend
 * URL format changes.
 */
export const buildApiUrl = (path) => {
  if (!path) return API_BASE_URL;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Shared fetch wrapper for JSON API requests.
 *
 * Important project behavior preserved:
 * - credentials: "include" sends the cookie-based auth session to the backend.
 * - Content-Type defaults to application/json, matching existing requests.
 * - 401 responses redirect to /login, matching the current dashboard/profile
 *   behavior in several files.
 *
 * The response shape is not transformed. Backend controllers already return
 * objects such as { success, data, message }, so callers receive the same data
 * structure they receive today.
 */
export const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    window.location.href = '/login';
  }

  return data;
};
