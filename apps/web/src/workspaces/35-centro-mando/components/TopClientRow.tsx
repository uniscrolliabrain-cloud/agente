import type { Client } from '../types';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
type Props = { c: Client; onOpen: () => void; onAction: () => void };
export function TopClientRow({ c, onOpen, onAction }: Props) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[#FBFAFF] transition">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpen}>
          <Avatar label={c.avatar} />
          <div className="text-[13px] font-medium">{c.name}</div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-[12px] text-[#3A3A3D]">{c.company}</td>
      <td className="px-3 py-3.5 text-[12px] font-semibold">{c.ltv}</td>
      <td className="px-3 py-3.5"><StatusBadge status={c.status} /></td>
      <td className="px-3 py-3.5 text-[11px] text-[var(--muted)] max-w-[200px] truncate">{c.next}</td>
      <td className="px-5 py-3.5">
        <button onClick={onAction} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px] font-medium hover:opacity-90">{c.action}</button>
      </td>
    </tr>
  );
}
