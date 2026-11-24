// PROVENANCE_BADGE_V1 - chip de procedencia por campo.

import type { ProvenanceChipKind } from "../../../../packages/domain/src/context-chips.ts";

const COLORS: Record<ProvenanceChipKind, { bg: string; fg: string; label: string }> = {
  auto: { bg: "var(--v2-bg-soft, #f7f3ed)", fg: "var(--v2-text-2)", label: "auto" },
  alta: { bg: "#e8f5ec", fg: "#1b7a3b", label: "alta" },
  media: { bg: "#fff5d5", fg: "#92400e", label: "media" },
  sugerido: { bg: "#f0ebff", fg: "var(--v2-purple)", label: "sugerido" },
  tu: { bg: "#eff6ff", fg: "#2563eb", label: "tú" },
  missing: { bg: "var(--v2-bg-soft, #f7f3ed)", fg: "var(--v2-text-3)", label: "falta" },
};

interface Props {
  kind: ProvenanceChipKind;
  tooltip?: string;
}

export default function ProvenanceBadge({ kind, tooltip }: Props) {
  const c = COLORS[kind];
  return (
    <span
      title={tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.fg,
        fontSize: 10,
        padding: "2px 6px",
        borderRadius: 999,
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.fg }} />
      {c.label}
    </span>
  );
}