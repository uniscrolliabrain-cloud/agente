import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CompanyOverview } from "../../../web/src/api/company";
import { changedPresentationKeys, presentationSnapshot, type PresentationSnapshot } from "./presentation-diff";

const EMPTY: ReadonlySet<string> = new Set<string>();
const Context = createContext<ReadonlySet<string>>(EMPTY);
const DISPLAY_MS = 6000;

/** El estado efímero se limita a esta vista, nunca al store de la empresa.
 * El cambio de tenant, modo ejemplo o error invalida la comparación.
 */
export function PresentationChanges({ overview, children }: { overview: CompanyOverview | null; children: ReactNode }) {
  const snapshot = useMemo(() => overview ? presentationSnapshot(overview) : null, [overview]);
  const previous = useRef<PresentationSnapshot | null>(null);
  const [observed, setObserved] = useState<{
    snapshot: PresentationSnapshot;
    keys: ReadonlySet<string>;
  } | null>(null);

  useEffect(() => {
    const keys = changedPresentationKeys(previous.current, snapshot);
    previous.current = snapshot;
    if (!snapshot || keys.size === 0) {
      setObserved(null);
      return;
    }
    setObserved({ snapshot, keys });
    const timeout = window.setTimeout(() => setObserved(null), DISPLAY_MS);
    return () => window.clearTimeout(timeout);
  }, [snapshot]);

  return (
    <Context.Provider value={observed?.snapshot === snapshot ? observed.keys : EMPTY}>
      {children}
    </Context.Provider>
  );
}

/** Reserva un hueco óptico constante. No genera toast, pulse ni aria-live. */
export function ChangeMark({ observation }: { observation: string }) {
  const changed = useContext(Context).has(observation);
  return (
    <>
      <span className="cce-change-mark" data-visible={changed ? "true" : "false"} aria-hidden="true" />
      {changed && <span className="cce-visually-hidden"> (dato actualizado)</span>}
    </>
  );
}
