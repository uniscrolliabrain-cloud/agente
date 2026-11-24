import type { ReactNode } from 'react';

type Props = { label: string; children: ReactNode; dark?: boolean };

export function KpiCard({ label, children, dark }: Props) {
  if (dark) {
    return (
      <div className="rounded-[20px] bg-[#111113] text-white border border-black shadow-[0_12px_32px_rgba(17,17,19,0.18)] p-5 relative overflow-hidden flex flex-col">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[var(--v2-purple)] opacity-20 blur-[24px]" />
        <div className="relative flex flex-col flex-1">
          <div className="text-[11px] tracking-[0.12em] font-semibold text-white/60">{label}</div>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-[var(--v2-bg-card)] border border-[var(--v2-border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <div className="text-[11px] tracking-[0.12em] font-semibold text-[var(--v2-text-3)]">{label}</div>
      {children}
    </div>
  );
}
