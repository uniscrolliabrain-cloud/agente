import { useCallback, useEffect, useState } from "react";
import { currentSession, login as apiLogin, logout as apiLogout } from "../api/session";

const HARDCODED_ACCESS_KEY = "uniscroll_admin_dev_key_2026";

export interface AuthState {
  isAuthenticated: boolean;
  mode: "sample" | "live" | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const session = currentSession();
    return { isAuthenticated: Boolean(session), mode: session?.mode ?? null };
  });
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const session = currentSession();
    if (session) {
      setState({ isAuthenticated: true, mode: session.mode });
      setBooting(false);
      return;
    }
    let cancelled = false;
    apiLogin(HARDCODED_ACCESS_KEY)
      .then((s) => {
        if (cancelled) return;
        setState({ isAuthenticated: true, mode: s.mode });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error inesperado");
        setState({ isAuthenticated: false, mode: null });
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (accessKey: string) => {
    setError(null);
    try {
      const s = await apiLogin(accessKey);
      setState({ isAuthenticated: true, mode: s.mode });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setState({ isAuthenticated: false, mode: null });
  }, []);

  return { ...state, error, booting, login, logout };
}
