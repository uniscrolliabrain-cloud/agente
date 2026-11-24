// CHAT_UX_V2_TIMELINE - misma estructura que CognitionTimeline.tsx (main
// d7260009): details "Tus análisis recientes" con fases y hora. En la preview
// las fases son fixture; no hay polling ni red.
import { fixtureTimeline } from "./fixture";

export default function CognitionTimelineUX() {
  if (!fixtureTimeline.length) return null;
  return (
    <details className="cognition-journey cux-timeline">
      <summary>Tus análisis recientes</summary>
      <ol>
        {fixtureTimeline.slice(-8).map((phase) => (
          <li key={phase.eventId}>
            <span>{phase.label}</span> <time dateTime={phase.at}>{phase.at}</time>
          </li>
        ))}
      </ol>
    </details>
  );
}
