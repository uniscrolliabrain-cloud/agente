import { useCallback, useEffect, useState } from "react";
import {
  cachedUser,
  loginWithCredentials,
  logoutServer,
  me,
  type AuthUser,
} from "../api/auth";
import { currentSession } from "../api/session";

export interface AuthState {
  isAuthenticated: boolean;
  mode: "sample" | "live" | null;
  user: AuthUser | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const session = currentSession();
    const user = cachedUser();
    return {
      isAuthenticated: Boolean(session && user),
      mode: session?.mode ?? null,
      user,
    };
  });
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const session = currentSession();
    const user = cachedUser();
    if (!session || !user) {
      setBooting(false);
      setState({ isAuthenticated: false, mode: null, user: null });
      return;
    }
    let cancelled = false;
    me()
      .then((fresh) => {
        if (cancelled) return;
        localStorage.setItem("openmuse_user", JSON.stringify(fresh));
        setState({ isAuthenticated: true, mode: session.mode, user: fresh });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ isAuthenticated: false, mode: null, user: null });
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await loginWithCredentials(email, password);
      setState({ isAuthenticated: true, mode: "live", user: res.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutServer();
    setState({ isAuthenticated: false, mode: null, user: null });
  }, []);

  return { ...state, error, booting, login, logout };
}
