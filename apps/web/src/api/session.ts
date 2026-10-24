import { clearSession, getSession, setSession } from "./client";

export interface SessionResponse {
  token: string;
  mode: "sample" | "live";
}

export async function login(accessKey: string): Promise<SessionResponse> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.error === "string" ? body.error : "Access key incorrecta");
  }
  const session = (await res.json()) as SessionResponse;
  setSession(session);
  return session;
}

export function logout(): void {
  clearSession();
}

export function currentSession(): SessionResponse | null {
  return getSession();
}
