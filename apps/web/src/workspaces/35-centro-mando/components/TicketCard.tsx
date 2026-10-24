import type { Ticket } from '../types';
import { Avatar } from './Avatar';
import { UrgencyBadge } from './UrgencyBadge';
export function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  const initials = t.name.split(' ').map(n => n[0]).join('');
  return (
    <div onClick={onClick} className="group rounded-[14px] border border-[var(--border)] p-3 hover:border-[#6D5BFF]/30 hover:bg-[#FBFAFF] transition cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 min-w-0">
          <Avatar label={initials} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{t.name}</div>
            <div className="text-[11px] text-[var(--muted)] truncate">{t.company} · {t.issue}</div>
          </div>
        </div>
        <div className={'w-2 h-2 rounded-full ' + t.dot + ' mt-1.5'} />
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + t.badgeColor}>{t.badge}</span>
        <UrgencyBadge label={t.urgency} />
        <span className="text-[10px] text-[var(--muted)] ml-auto">{t.time} abierto</span>
      </div>
    </div>
  );
}
