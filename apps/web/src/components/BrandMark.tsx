// BRAND_MARK_V1 - marca de AgntiaPro: chevron tipo "A" con muesca inferior.
// El trazo usa currentColor para funcionar sobre fondo claro y sobre el circulo
// negro de la barra lateral. La firma "LAIA" va entre dos reglas doradas.
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8.5 55 32 9.5 55.5 55"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 52 30.5 43.5"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M51 52 33.5 43.5"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLockup({ markSize = 32, compact = false }: { markSize?: number; compact?: boolean }) {
  return (
    <span className="cc-brand">
      <BrandMark size={markSize} />
      {!compact && (
        <span className="cc-brand-copy">
          <span className="cc-brand-name">
            Agntia<b>Pro</b>
          </span>
          <span className="cc-brand-sub">LAIA</span>
        </span>
      )}
    </span>
  );
}
