// Estado del launcher V3.
//
// El launcher es una simulación de UX: no hay backend, ni autenticación, ni
// peticiones externas. Favoritos y recientes se guardan en localStorage para que
// la demo conserve cierta memoria entre recargas, nunca como datos de negocio.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APP_BY_ID, DOCK_DEFAULT, FAVORITES_DEFAULT, RECENTS_DEFAULT } from "./launcher-catalog";

export type LauncherScreen = "rest" | "home" | "drawer" | "app" | "recents";
export type InputModality = "pointer" | "touch" | "keyboard";

type Persisted = { favorites: string[]; recents: string[] };

const STORE_KEY = "agntia_launcher_v3";

function readStore(): Persisted {
  const fallback: Persisted = { favorites: FAVORITES_DEFAULT, recents: RECENTS_DEFAULT };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      favorites: Array.isArray(parsed.favorites) && parsed.favorites.length ? parsed.favorites : fallback.favorites,
      recents: Array.isArray(parsed.recents) ? parsed.recents : fallback.recents,
    };
  } catch {
    return fallback;
  }
}

function writeStore(value: Persisted): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  } catch {
    // Almacenamiento no disponible (modo privado, iframe restringido): la demo sigue en memoria.
  }
}

/** Detecta cómo interactúa el dispositivo de verdad, no solo su ancho. */
export function useInputModality(): InputModality {
  const [modality, setModality] = useState<InputModality>(() => {
    if (typeof window === "undefined") return "pointer";
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches ? "pointer" : "touch";
  });
  const lastRef = useRef<InputModality>(modality);

  useEffect(() => {
    const set = (next: InputModality) => {
      if (lastRef.current === next) return;
      lastRef.current = next;
      setModality(next);
    };
    const onPointer = (event: PointerEvent) => set(event.pointerType === "touch" ? "touch" : "pointer");
    const onKey = () => set("keyboard");
    const onTouch = () => set("touch");
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return modality;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export type OriginRect = { x: number; y: number; width: number; height: number };

export function useLauncher() {
  const initial = useMemo(readStore, []);
  const [screen, setScreen] = useState<LauncherScreen>("rest");
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<OriginRect | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(initial.favorites);
  const [recents, setRecents] = useState<string[]>(initial.recents);
  const [query, setQuery] = useState("");
  // El escritorio se desmonta al abrir una app: guardamos el id y recuperamos el
  // icono recién montado al cerrar, en vez de un nodo que ya no existe.
  const returnFocusRef = useRef<string | null>(null);

  useEffect(() => {
    writeStore({ favorites, recents });
  }, [favorites, recents]);

  const unlock = useCallback(() => setScreen("home"), []);
  const lock = useCallback(() => {
    setScreen("rest");
    setFolderId(null);
    setSelectedId(null);
    setActiveAppId(null);
  }, []);

  const openApp = useCallback((id: string, rect?: DOMRect | null) => {
    if (rect) setOrigin({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    setActiveAppId(id);
    setSelectedId(null);
    setFolderId(null);
    setScreen("app");
    setRecents((prev) => [id, ...prev.filter((entry) => entry !== id)].slice(0, 6));
    returnFocusRef.current = APP_BY_ID.get(id)?.name ?? null;
  }, []);

  const closeApp = useCallback(() => {
    const id = returnFocusRef.current;
    setScreen("home");
    setActiveAppId(null);
    window.setTimeout(() => {
      if (!id) return;
      const selector = `.alp-app[aria-label="${id.replace(/"/g, "")}"]`;
      document.querySelector<HTMLElement>(selector)?.focus();
      returnFocusRef.current = null;
    }, 60);
  }, []);

  const goHome = useCallback(() => {
    setScreen("home");
    setFolderId(null);
    setSelectedId(null);
    setQuery("");
  }, []);

  const openDrawer = useCallback(() => {
    setScreen("drawer");
    setSelectedId(null);
  }, []);

  const openRecents = useCallback(() => {
    setScreen("recents");
    setSelectedId(null);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const clearRecents = useCallback(() => setRecents([]), []);

  return {
    screen,
    activeAppId,
    origin,
    selectedId,
    folderId,
    query,
    favorites,
    recents,
    dock: DOCK_DEFAULT,
    unlock,
    lock,
    openApp,
    closeApp,
    goHome,
    openDrawer,
    openRecents,
    toggleFavorite,
    isFavorite,
    clearRecents,
    select: setSelectedId,
    clearSelection: () => setSelectedId(null),
    openFolder: setFolderId,
    closeFolder: () => setFolderId(null),
    setQuery,
  };
}

export type LauncherApi = ReturnType<typeof useLauncher>;
