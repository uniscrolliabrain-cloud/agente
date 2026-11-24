import { useId, type CSSProperties, type MouseEvent } from "react";
import type { LauncherApp } from "./launcher-catalog";

type AppIconProps = {
  app: LauncherApp;
  selected?: boolean;
  /** Variante visual: escritorio, cajón, dock o carpeta. */
  variant?: "home" | "drawer" | "dock" | "folder" | "recent";
  onActivate: (app: LauncherApp, element: HTMLButtonElement) => void;
  onHoverChange?: (id: string | null) => void;
  badge?: string;
};

/**
 * Un icono del launcher.
 *
 * El nombre nunca forma parte del layout: se revela superpuesto al pasar el
 * cursor, al recibir foco de teclado o al seleccionarlo con el dedo, de modo que
 * la cuadrícula no se desplaza. El nombre accesible vive en `aria-label`.
 */
export function AppIcon({ app, selected = false, variant = "home", onActivate, onHoverChange, badge }: AppIconProps) {
  const labelId = useId();
  const style = { "--alp-icon-accent": "var(--alp-violet)" } as CSSProperties;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onActivate(app, event.currentTarget);
  };
  return (
    <button
      type="button"
      className={`alp-app alp-app--${variant}${selected ? " is-selected" : ""}`}
      aria-label={app.name}
      aria-describedby={`${labelId}-tagline`}
      aria-pressed={selected || undefined}
      onClick={handleClick}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") onHoverChange?.(app.id);
      }}
      onPointerLeave={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(app.id)}
      onBlur={() => onHoverChange?.(null)}
      style={style}
    >
      <span className="alp-app-tile">
        <img src={app.icon} alt="" width={320} height={320} draggable={false} decoding="async" />
        {badge ? <span className="alp-app-badge">{badge}</span> : null}
      </span>
      <span className="alp-app-label" id={`${labelId}-label`} aria-hidden="true">
        {app.name}
      </span>
      <span id={`${labelId}-tagline`} className="alp-visually-hidden">
        {app.tagline}
      </span>
    </button>
  );
}
