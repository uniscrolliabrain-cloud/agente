type Props = { pct: number; color?: string };

export function ProgressBar({ pct, color = 'var(--v2-purple)' }: Props) {
  return (
    <div className="h-2 rounded-full bg-[var(--v2-bg-soft)] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: color }} />
    </div>
  );
}
