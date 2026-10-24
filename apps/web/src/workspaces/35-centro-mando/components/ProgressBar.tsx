type Props = { pct: number; color?: string };
export function ProgressBar({ pct, color = '#6D5BFF' }: Props) {
  return (
    <div className="h-2 rounded-full bg-[#F1F0FF] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: color }} />
    </div>
  );
}
