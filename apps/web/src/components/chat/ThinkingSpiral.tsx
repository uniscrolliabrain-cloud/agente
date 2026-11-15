import "./thinking-spiral.css";
/** Decorative activity only. Accessible text describes the actual pending request. */
export function ThinkingSpiral() {
  return <span className="thinking-status" role="status" aria-live="polite">
    <svg className="thinking-spiral" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" focusable="false">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = i * .67, radius = 2 + i * .55;
        return <circle key={i} cx={16 + Math.cos(angle) * radius} cy={16 + Math.sin(angle) * radius}
          r={.8 + i * .07} fill="currentColor" opacity={.25 + i * .045} />;
      })}
    </svg>
    <span>Esperando la respuesta</span>
  </span>;
}
