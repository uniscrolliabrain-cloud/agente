import type { Ticket } from '../types';
import { Avatar } from './Avatar';
import { UrgencyBadge } from './UrgencyBadge';

export function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-[14px] border border-[var(--v2-border)] p-3 hover:border-[#5E4FF1]/30 hover:bg-[var(--v2-bg-softer)] transition cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 min-w-0">
          <Avatar label={t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate text-[var(--v2-text)]">{t.name}</div>
            <div className="text-[11px] text-[var(--v2-text-2)] truncate">{t.company} · {t.issue}</div>
          </div>
        </div>
        <div className={'w-2 h-2 rounded-full ' + t.dot + ' mt-1.5'} />
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + t.badgeColor}>{t.badge}</span>
        <UrgencyBadge label={t.urgency} />
        <span className="text-[10px] text-[var(--v2-text-3)] ml-auto">hace {t.time}</span>
      </div>
    </div>
  );
}
