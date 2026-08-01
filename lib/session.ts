const GUEST_KEY = "sell4me_guest_session_id";
const AFFILIATE_KEY = "sell4me_affiliate_code";
const TOKEN_KEY = "sell4me_access_token";
const USER_KEY = "sell4me_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getGuestSessionId(): string {
  if (!canUseStorage()) return "";
  let id = localStorage.getItem(GUEST_KEY);
  if (!id || id.length < 8) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function clearGuestSessionId() {
  if (!canUseStorage()) return;
  localStorage.removeItem(GUEST_KEY);
}

export function setPendingAffiliateCode(code: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(AFFILIATE_KEY, code);
}

export function consumeAffiliateCode(): string | null {
  if (!canUseStorage()) return null;
  const code = localStorage.getItem(AFFILIATE_KEY);
  if (code) localStorage.removeItem(AFFILIATE_KEY);
  return code;
}

export function peekAffiliateCode(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AFFILIATE_KEY);
}

/** Optional Bearer fallback token. Cookie auth is primary. */
export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (!canUseStorage()) return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown | null) {
  if (!canUseStorage()) return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage() {
  setAccessToken(null);
  setStoredUser(null);
}

/** Clears httpOnly auth cookies on the frontend origin. */
export async function clearAuthCookies() {
  if (!canUseStorage()) return;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore — local session is cleared regardless.
  }
}

export async function clearAuthSession() {
  clearAuthStorage();
  await clearAuthCookies();
}
