// A3_USE_PANEL_V1 - estado de panel con persistencia en localStorage.
import { useCallback, useState } from "react";

export function usePanel(
  key: string,
  initial: boolean,
): [boolean, (v: boolean | ((p: boolean) => boolean)) => void] {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? initial : v === "1";
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (v: boolean | ((p: boolean) => boolean)) => {
      setOpen((p) => {
        const n = typeof v === "function" ? v(p) : v;
        try { localStorage.setItem(key, n ? "1" : "0"); } catch { /* storage bloqueado */ }
        return n;
      });
    },
    [key],
  );

  return [open, set];
}