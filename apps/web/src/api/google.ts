import { apiFetch } from "./client";

export interface GoogleStatus {
  connected: boolean;
  account: string | null;
  /** true cuando el deployment corre en modo sample (la conexion es simulada). */
  sample: boolean;
  /** false cuando faltan GOOGLE_CLIENT_ID/SECRET o TOKEN_ENCRYPTION_KEY en modo live. */
  configured: boolean;
}

export interface GoogleConnectResult {
  /** URL de consentimiento de Google; null si la conexion ya quedo activa (sample). */
  url: string | null;
  connected?: boolean;
}

export async function googleStatus(): Promise<GoogleStatus> {
  return apiFetch<GoogleStatus>("/api/google/status");
}

export async function connectGoogle(capability: "read" | "write"): Promise<GoogleConnectResult> {
  return apiFetch<GoogleConnectResult>("/api/google/connect", {
    method: "POST",
    body: { capability },
  });
}

export async function disconnectGoogle(): Promise<void> {
  await apiFetch("/api/google/disconnect", { method: "POST" });
}
