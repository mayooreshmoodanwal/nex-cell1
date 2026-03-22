/**
 * fetchWithAuth
 * Drop-in replacement for fetch() that:
 *  1. Always includes credentials (cookies)
 *  2. On 401, attempts a silent token refresh via /api/auth/refresh
 *  3. Retries the original request once with the new token
 *  4. On second 401, redirects to /login
 */

let isRefreshing = false;

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const csrfToken = typeof document !== "undefined"
    ? document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1]
    : undefined;

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> ?? {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };

  const options: RequestInit = {
    ...init,
    credentials: "include",
    headers,
  };

  const res = await fetch(input, options);

  // If not 401, return as-is
  if (res.status !== 401) return res;

  // Prevent multiple simultaneous refresh calls
  if (isRefreshing) {
    window.location.href = "/login";
    return res;
  }

  // Try to refresh the token
  isRefreshing = true;
  try {
    const refreshRes = await fetch("/api/auth/refresh", {
      method:      "POST",
      credentials: "include",
      headers:     csrfToken ? { "x-csrf-token": csrfToken } : {},
    });

    if (!refreshRes.ok) {
      // Refresh failed — redirect to login
      window.location.href = "/login";
      return res;
    }

    // Retry the original request with fresh cookies
    const newCsrf = document.cookie.split(";").find((c) => c.trim().startsWith("csrf_token="))?.split("=")[1];
    const retryRes = await fetch(input, {
      ...options,
      credentials: "include",
      headers: {
        ...(init?.headers as Record<string, string> ?? {}),
        ...(newCsrf ? { "x-csrf-token": newCsrf } : {}),
      },
    });
    return retryRes;
  } finally {
    isRefreshing = false;
  }
}