export function RetentionStats() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Retención</div>
        <div className="text-[16px] font-semibold mt-1">82%</div>
        <div className="text-[11px] text-emerald-600">+12% tras fix</div>
      </div>
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Churn mensual</div>
        <div className="text-[16px] font-semibold mt-1">4.2%</div>
        <div className="text-[11px] text-[var(--muted)]">-1.1% vs ant</div>
      </div>
      <div className="rounded-[12px] bg-[#EDE8FF] p-3">
        <div className="text-[10px] text-[#6D5BFF] uppercase tracking-widest">Equipo Growth</div>
        <div className="text-[13px] font-medium mt-1">WhatsApp + Fix</div>
        <div className="text-[11px] text-[#6D5BFF]">Ver thread</div>
      </div>
    </div>
  );
}
