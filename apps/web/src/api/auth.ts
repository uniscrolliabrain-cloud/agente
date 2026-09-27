import { apiFetch, clearSession, setSession } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  active?: boolean;
  setup: { sopIds: string[]; allowedTools: string[]; greeting: string };
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

const USER_KEY = "openmuse_user";

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.error === "string" ? body.error : "Email o contrasena incorrectos",
    );
  }
  const data = (await res.json()) as LoginResponse;
  setSession({ token: data.token, mode: "live" });
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function logoutServer(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignorar errores de logout */
  }
  clearSession();
  localStorage.removeItem(USER_KEY);
}

export async function me(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

export function cachedUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export async function listUsers(): Promise<AuthUser[]> {
  return apiFetch<AuthUser[]>("/api/auth/users");
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: "admin" | "user";
  setup?: Partial<AuthUser["setup"]>;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/users", { method: "POST", body: input });
}

export async function updateUser(
  id: string,
  patch: Partial<{
    name: string;
    role: "admin" | "user";
    active: boolean;
    setup: Partial<AuthUser["setup"]>;
    password: string;
  }>,
): Promise<AuthUser> {
  return apiFetch<AuthUser>(`/api/auth/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/api/auth/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}


export interface UserTaskSummary {
  id: string;
  title: string;
  kind: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  attempts: number;
  result?: string;
  error?: string;
}

export async function userTasks(
  id: string,
  limit = 20,
): Promise<{ userId: string; total: number; tasks: UserTaskSummary[] }> {
  return apiFetch(`/api/auth/users/${encodeURIComponent(id)}/tasks?limit=${limit}`);
}
export async function updateMe(input: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me", { method: "PATCH", body: input });
}