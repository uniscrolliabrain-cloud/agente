// B3_LIVEITEM_V1 - item de sidebar con franja 18px y 9 estados.
import { alertUrgency, pickPrimary, type LiveActivity } from "@openmuse/domain/live";
import { fmtDur, useNow } from "../hooks/useNow";

interface Props {
  title: string;
  subtitle?: string;
  active?: boolean;
  activities?: LiveActivity[];
  onClick?: () => void;
}

export default function LiveItem({
  title,
  subtitle,
  active,
  activities = [],
  onClick,
}: Props) {
  const now = useNow();
  const live = pickPrimary(activities);
  const urgent = live?.kind === "alert" && alertUrgency(live) === "urgent";

  return (
    <button
      type="button"
      className="live-item"
      data-active={active || undefined}
      data-kind={live?.kind ?? "idle"}
      data-urgent={urgent || undefined}
      onClick={onClick}
      aria-label={`${title}${live && "label" in live ? `, ${live.label}` : ""}`}
    >
      <span className="live-item__title">{title}</span>
      <span className="live-item__strip">
        {!live && subtitle}
        {live?.kind === "counter" && (
          <>
            <i className="live-dot live-dot--up" />
            {live.label} · <b className="live-value">{live.value.toLocaleString("es-ES")}</b>
          </>
        )}
        {live?.kind === "progress" && (
          <>
            {live.label}
            <span className="live-progress" role="progressbar" aria-valuenow={live.value} aria-valuemax={live.max}>
              <i style={{ width: `${Math.min(100, (live.value / Math.max(1, live.max)) * 100)}%` }} />
            </span>
            <b className="live-value">{Math.round((live.value / Math.max(1, live.max)) * 100)}%</b>
            {live.etaSec != null && <> · ~{fmtDur(live.etaSec)}</>}
          </>
        )}
        {live?.kind === "pulse" && (
          <>
            <i className="live-dot live-dot--pulse" />
            {live.label}
          </>
        )}
        {live?.kind === "timer" && (
          <>
            ⏱ {live.label} <b className="live-value">{fmtDur((now - live.startedAt) / 1000)}</b>
          </>
        )}
        {live?.kind === "alert" && (
          <>
            <span className="live-warn">!</span>
            <b className="live-label live-label--warn">{live.label}</b>
          </>
        )}
        {live?.kind === "error" && <b className="live-label live-label--error">Falló · {live.label}</b>}
        {live?.kind === "queued" && <>En cola · {live.position}º</>}
        {live?.kind === "stale" && <>Sin datos hace {fmtDur((now - live.lastSeen) / 1000)}</>}
        {live?.kind === "done" && <>✓ {live.label}</>}
      </span>
    </button>
  );
}