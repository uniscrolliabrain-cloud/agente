import type { Insight } from '../types';
type Props = { i: Insight; onClick: () => void };
export function InsightCard({ i, onClick }: Props) {
  const btnCls = i.variant === 'light' ? 'bg-white text-black' : i.variant === 'primary' ? 'bg-[#6D5BFF] text-white' : 'bg-white/10 text-white border border-white/10';
  return (
    <div className="rounded-[14px] bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] text-white/60 uppercase tracking-widest">{i.tag}</div>
      <p className="text-[12px] leading-[1.5] mt-2 text-white/90">{i.body}</p>
      <button onClick={onClick} className={'mt-3 h-7 px-3 rounded-full text-[11px] font-medium ' + btnCls}>{i.cta}</button>
    </div>
  );
}
