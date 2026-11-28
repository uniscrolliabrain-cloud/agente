// SMART_UX_V1 - capa compartida de interacción para las meta-apps del clon.
// Reúne los detalles que ya usa el resto del laboratorio (paleta de comandos,
// atajos, fijados y recientes persistentes) en un solo módulo para que Tu
// Empresa y Agntia Code se sientan parte del mismo producto. Es solo demo:
// guarda preferencias de interfaz en localStorage, nunca datos de negocio.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { CornerDownLeft, Pin, PinOff, Search, X } from "lucide-react";
import { useOrderedList } from "../../../web/src/ux/useOrderedList";
import "./smart-ux.css";

// ORDERED_LIST_V1 - el fantasma y el anuncio del gesto de orden son iguales en
// las tres meta-apps, así que se exponen desde aquí y cada una los monta una vez.
export { OrderAnnounce, OrderGhost } from "../../../web/src/ux/OrderGhost";

export type SmartTone = "company" | "code";

export type SmartCommand = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string;
  icon?: ReactNode;
  shortcut?: string;
  canPin?: boolean;
  run: () => void;
};

export type SmartShortcut = { keys: string; label: string; group?: string };

type SmartState = { section: string; recents: string[]; pins: string[]; collapsed: boolean };

const MAX_RECENTS = 5;
const MAX_PINS = 5;

function readState<T extends string>(key: string, initial: T, ids: readonly T[]): SmartState {
  const base: SmartState = { section: initial, recents: [], pins: [], collapsed: false };
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<SmartState>;
    const keep = (list: unknown, max: number) =>
      Array.isArray(list)
        ? list.filter((value): value is string => typeof value === "string" && ids.includes(value as T)).slice(0, max)
        : [];
    return {
      section: typeof parsed.section === "string" && ids.includes(parsed.section as T) ? parsed.section : initial,
      recents: keep(parsed.recents, MAX_RECENTS),
      pins: keep(parsed.pins, MAX_PINS),
      collapsed: parsed.collapsed === true,
    };
  } catch {
    return base;
  }
}

/**
 * Estado de navegación de una meta-app: sección activa, recientes, fijados y
 * rail plegado. Todo sobrevive a la recarga para que el clon tenga memoria.
 */
export function useSmartNav<T extends string>({
  storageKey,
  ids,
  initial,
  onDropOutside,
  railSelector,
}: {
  storageKey: string;
  ids: readonly T[];
  initial: T;
  /** SPLIT_PANE_V1 - sacar una entrada de la barra abre esa sección al lado. */
  onDropOutside?: (id: string) => void;
  /** Selector de la barra donde vive el menú, para saber cuándo se sale. */
  railSelector?: string;
}) {
  const idsRef = useRef(ids);
  idsRef.current = ids;
  // ORDERED_LIST_V1 - el menú de la meta-app se reordena con el mismo gesto que
  // el menú y los chats de la app; el orden se guarda por meta-app.
  const order = useOrderedList({
    ids: ids as readonly string[],
    storageKey: `${storageKey}__order`,
    ...(onDropOutside ? { onDropOutside } : {}),
    ...(railSelector ? { railSelector } : {}),
  });
  const [state, setState] = useState<SmartState>(() => readState(storageKey, initial, ids));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Sin almacenamiento (modo privado, iframe restringido) la demo sigue en memoria.
    }
  }, [state, storageKey]);

  const go = useCallback((id: T) => {
    setState((prev) => ({
      ...prev,
      section: id,
      recents: [id, ...prev.recents.filter((entry) => entry !== id)].slice(0, MAX_RECENTS),
    }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setState((prev) => {
      if (!idsRef.current.includes(id as T)) return prev;
      const pins = prev.pins.includes(id)
        ? prev.pins.filter((entry) => entry !== id)
        : [...prev.pins, id].slice(-MAX_PINS);
      return { ...prev, pins };
    });
  }, []);

  const setCollapsed = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setState((prev) => ({ ...prev, collapsed: typeof value === "function" ? value(prev.collapsed) : value }));
  }, []);

  const openPalette = useCallback(() => {
    setShortcutsOpen(false);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openShortcuts = useCallback(() => {
    setPaletteOpen(false);
    setShortcutsOpen(true);
  }, []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  return {
    sectionId: state.section as T,
    recents: state.recents,
    pins: state.pins,
    collapsed: state.collapsed,
    isPinned: (id: string) => state.pins.includes(id),
    go,
    togglePin,
    setCollapsed,
    paletteOpen,
    openPalette,
    closePalette,
    shortcutsOpen,
    openShortcuts,
    closeShortcuts,
    dialogOpen: paletteOpen || shortcutsOpen,
    /** ORDERED_LIST_V1 - orden guardado del menú y sus gestos. */
    orderIds: order.orderedIds,
    sortSections: order.sortList,
    bindRow: order.bindRow,
    orderDrag: order.drag,
    orderAnnounce: order.announce,
    orderOutside: order.outside,
  };
}

export type SmartNav = ReturnType<typeof useSmartNav<string>>;

/* ------------------------------------------------------------------ paleta */

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type Group = { title: string; items: SmartCommand[] };

export function SmartCommandPalette({
  open,
  tone,
  title,
  subtitle,
  placeholder,
  commands,
  recents,
  pins,
  onTogglePin,
  onClose,
  onShowShortcuts,
}: {
  open: boolean;
  tone: SmartTone;
  title: string;
  subtitle?: string;
  placeholder: string;
  commands: SmartCommand[];
  recents: string[];
  pins: string[];
  onTogglePin: (id: string) => void;
  onClose: () => void;
  onShowShortcuts: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const groups = useMemo<Group[]>(() => {
    const byId = new Map(commands.map((command) => [command.id, command]));
    const clean = normalize(query.trim());
    if (clean) {
      const tokens = clean.split(/\s+/);
      const found = commands.filter((command) => {
        const haystack = normalize(
          [command.label, command.group, command.hint ?? "", command.keywords ?? ""].join(" "),
        );
        return tokens.every((token) => haystack.includes(token));
      });
      return found.length ? [{ title: "Resultados", items: found }] : [];
    }

    const out: Group[] = [];
    const pinned = pins.map((id) => byId.get(id)).filter((command): command is SmartCommand => Boolean(command));
    if (pinned.length) out.push({ title: "Fijados", items: pinned });
    const recent = recents
      .map((id) => byId.get(id))
      .filter((command): command is SmartCommand => Boolean(command) && !pins.includes(command!.id));
    if (recent.length) out.push({ title: "Recientes", items: recent });
    const seen = new Set<string>();
    for (const command of commands) {
      if (seen.has(command.group)) continue;
      seen.add(command.group);
      out.push({ title: command.group, items: commands.filter((entry) => entry.group === command.group) });
    }
    return out;
  }, [commands, pins, query, recents]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const safeActive = Math.min(active, Math.max(flat.length - 1, 0));

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  // Al cerrar desde fuera (Esc en captura del shell, scrim, ruta) el estado
  // interno no pasa por close(): sin esto, la paleta reabriría con el filtro
  // anterior y parecería vacía.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      const target = returnFocus.current;
      if (target?.isConnected) window.setTimeout(() => target.focus(), 0);
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setQuery("");
    onClose();
  };

  const choose = (command: SmartCommand) => {
    setQuery("");
    onClose();
    command.run();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!flat.length) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActive((safeActive + delta + flat.length) % flat.length);
      inputRef.current?.focus();
      return;
    }
    if (event.key === "Enter") {
      // Los botones (fila o chincheta) resuelven su propio Enter.
      if ((event.target as HTMLElement).tagName === "BUTTON") return;
      const command = flat[safeActive];
      if (command) {
        event.preventDefault();
        choose(command);
      }
      return;
    }
    if (event.key === "Tab") {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  let rowIndex = -1;

  return (
    <div className={`sux sux--${tone}`} role="presentation">
      <div className="sux-scrim" onClick={close} aria-hidden="true" />
      <div
        className="sux-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={handleKeyDown}
      >
        <header className="sux-head">
          <Search size={17} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="sux-kbd">esc</kbd>
          <button type="button" className="sux-close" aria-label="Cerrar" onClick={close}>
            <X size={15} />
          </button>
        </header>

        <div className="sux-body">
          {groups.length === 0 ? (
            <div className="sux-empty">
              <b>Sin resultados</b>
              <span>Prueba con otra palabra o abre los atajos con ?.</span>
            </div>
          ) : (
            groups.map((group) => (
              <section className="sux-group" key={group.title} aria-label={group.title}>
                <h3>{group.title}</h3>
                {group.items.map((command) => {
                  rowIndex += 1;
                  const index = rowIndex;
                  const isActive = index === safeActive;
                  const pinned = pins.includes(command.id);
                  return (
                    <div
                      className="sux-row"
                      data-active={isActive ? "true" : undefined}
                      key={`${group.title}-${command.id}`}
                      onMouseEnter={() => setActive(index)}
                    >
                      <button
                        type="button"
                        className="sux-row-main"
                        onClick={() => choose(command)}
                        onFocus={() => setActive(index)}
                      >
                        {command.icon && <span className="sux-icon">{command.icon}</span>}
                        <span className="sux-copy">
                          <b>{command.label}</b>
                          {command.hint && <small>{command.hint}</small>}
                        </span>
                        {command.shortcut && <kbd className="sux-kbd">{command.shortcut}</kbd>}
                        <CornerDownLeft size={13} className="sux-enter" aria-hidden="true" />
                      </button>
                      {command.canPin && (
                        <button
                          type="button"
                          className="sux-pin"
                          aria-label={pinned ? `Quitar ${command.label} de fijados` : `Fijar ${command.label}`}
                          aria-pressed={pinned}
                          title={pinned ? "Quitar de fijados" : "Fijar"}
                          onClick={(event) => {
                            event.stopPropagation();
                            onTogglePin(command.id);
                          }}
                        >
                          {pinned ? <PinOff size={13} /> : <Pin size={13} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </section>
            ))
          )}
        </div>

        <footer className="sux-foot">
          <div className="sux-hints">
            <span>
              <kbd className="sux-kbd">↑↓</kbd> mover
            </span>
            <span>
              <kbd className="sux-kbd">↵</kbd> abrir
            </span>
            {subtitle && <span className="sux-count">{subtitle}</span>}
          </div>
          <button type="button" className="sux-shortcuts-link" onClick={onShowShortcuts}>
            <kbd className="sux-kbd">?</kbd> Atajos
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ atajos */

export function SmartShortcuts({
  open,
  tone,
  title,
  shortcuts,
  onClose,
}: {
  open: boolean;
  tone: SmartTone;
  title: string;
  shortcuts: SmartShortcut[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      const target = returnFocus.current;
      if (target?.isConnected) window.setTimeout(() => target.focus(), 0);
    };
  }, [open]);

  if (!open) return null;

  const groups = Array.from(new Set(shortcuts.map((shortcut) => shortcut.group ?? "General")));

  return (
    <div className={`sux sux--${tone}`} role="presentation">
      <div className="sux-scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="sux-panel sux-panel--shortcuts"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <header className="sux-head sux-head--static">
          <div className="sux-head-copy">
            <b>{title}</b>
            <span>Profundidad opcional: nada de esto estorba si no lo usas.</span>
          </div>
          <button type="button" className="sux-close" aria-label="Cerrar" onClick={onClose}>
            <X size={15} />
          </button>
        </header>
        <div className="sux-body sux-body--shortcuts">
          {groups.map((group) => (
            <section className="sux-group" key={group} aria-label={group}>
              <h3>{group}</h3>
              {shortcuts
                .filter((shortcut) => (shortcut.group ?? "General") === group)
                .map((shortcut) => (
                  <div className="sux-shortcut" key={`${group}-${shortcut.keys}-${shortcut.label}`}>
                    <span>{shortcut.label}</span>
                    <kbd className="sux-kbd">{shortcut.keys}</kbd>
                  </div>
                ))}
            </section>
          ))}
        </div>
        <footer className="sux-foot">
          <div className="sux-hints">
            <span>
              <kbd className="sux-kbd">esc</kbd> cerrar
            </span>
          </div>
          <span className="sux-count">Los atajos no se disparan mientras escribes.</span>
        </footer>
      </div>
    </div>
  );
}
