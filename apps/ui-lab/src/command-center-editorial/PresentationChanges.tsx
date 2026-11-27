import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CompanyOverview } from "../../../web/src/api/company";
import { presentationDeadlines, presentationSnapshot, type PresentationSnapshot } from "./presentation-diff";

const EMPTY: ReadonlySet<string> = new Set<string>();
const Context = createContext<ReadonlySet<string>>(EMPTY);
const DISPLAY_MS = 6000;

/** Estado efímero local. Cada observación conserva su propio vencimiento. */
export function PresentationChanges({ overview, children }: { overview: CompanyOverview | null; children: ReactNode }) {
  const snapshot = useMemo(() => overview ? presentationSnapshot(overview) : null, [overview]);
  const previous = useRef<PresentationSnapshot | null>(null);
  const deadlines = useRef<ReadonlyMap<string, number>>(new Map());
  const [observed, setObserved] = useState<ReadonlySet<string>>(EMPTY);

  useLayoutEffect(() => {
    deadlines.current = presentationDeadlines(previous.current, snapshot, deadlines.current, performance.now(), DISPLAY_MS);
    previous.current = snapshot;
    let timeout: number | undefined;
    const publish = () => {
      const now = performance.now();
      const active = new Map([...deadlines.current].filter(([, until]) => until > now));
      deadlines.current = active;
      setObserved(active.size ? new Set(active.keys()) : EMPTY);
      if (active.size) timeout = window.setTimeout(publish, Math.max(1, Math.ceil(Math.min(...active.values()) - now)));
    };
    publish();
    return () => { if (timeout !== undefined) window.clearTimeout(timeout); };
  }, [snapshot]);

  useEffect(() => () => { previous.current = null; deadlines.current = new Map(); }, []);

  return <Context.Provider value={snapshot ? observed : EMPTY}>{children}</Context.Provider>;
}

/** Hueco fijo y marca que acompaña al dato, sin toast ni anuncio periódico. */
export function ChangeMark({ observation }: { observation: string }) {
  const changed = useContext(Context).has(observation);
  return (
    <>
      <span className="cce-change-mark" data-visible={changed ? "true" : "false"} aria-hidden="true" />
      {changed && <span className="cce-visually-hidden"> (dato actualizado)</span>}
    </>
  );
}
