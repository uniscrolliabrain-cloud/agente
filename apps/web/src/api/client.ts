const AUTH_KEY = "openmuse_auth";

export interface AuthSession {
  token: string;
  mode: "sample" | "live";
}

export function getSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === "string" && (parsed.mode === "sample" || parsed.mode === "live")) {
      return parsed as AuthSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

let unauthorizedHandler: (() => void) | null = null;

/** La app registra aqui como reaccionar a un 401 (cerrar sesion y volver al login). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/**
 * Invalida la sesion local y avisa a la app. Todo 401 deberia pasar por aqui: antes solo
 * apiFetch limpiaba el token, asi que un 401 en el stream de chat o en la subida de ficheros
 * dejaba la sesion muerta en localStorage sin que la UI lo supiera.
 */
export function handleUnauthorized(): void {
  clearSession();
  unauthorizedHandler?.();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(path, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (res.status === 401) {
    // Un 401 sin Authorization no es una sesión caducada: es una llamada que se adelantó al
    // login (los hooks de arranque corren en paralelo con useAuth). Borrar el token ahí dejaba
    // la app rota hasta recargar.
    if (session?.token) handleUnauthorized();
    throw new ApiError(401, "Sesión expirada");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") detail = body.error;
      if (body?.fields && typeof body.fields === "object") {
        fields = body.fields as Record<string, string>;
      }
    } catch {
      /* ignore body parse errors */
    }
    throw new ApiError(res.status, detail, fields);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
