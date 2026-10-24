// ZENDESK_FILTER_PILL_V1

interface Props {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export default function TicketFilterPill({ label, count, active, onClick }: Props) {
  const cls = active
    ? "border-text bg-text text-white"
    : "border-border bg-bg-card text-text-2 hover:text-text";
  const countCls = active ? "bg-white/20 text-white" : "bg-bg-soft text-text-3";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={"inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors " + cls}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={"rounded-full px-1.5 text-[10px] " + countCls}>{count}</span>
      )}
    </button>
  );
}