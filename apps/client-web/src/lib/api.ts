"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export interface SessionState {
  accessToken: string;
  organisationId: string;
  user: { id: string; email: string; displayName: string };
  memberships: Array<{ organisationId: string; organisationName: string; role: string }>;
}

const SESSION_KEY = "vs.session";

export function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as SessionState) : null;
}

export function saveSession(session: SessionState): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = loadSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
    headers["x-organisation-id"] = session.organisationId;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export async function signIn(email: string, password: string): Promise<SessionState> {
  const res = await fetch(`${API_BASE}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  const firstMembership = body.memberships[0];
  const session: SessionState = {
    accessToken: body.accessToken,
    organisationId: firstMembership?.organisationId ?? "",
    user: body.user,
    memberships: body.memberships,
  };
  saveSession(session);
  return session;
}
