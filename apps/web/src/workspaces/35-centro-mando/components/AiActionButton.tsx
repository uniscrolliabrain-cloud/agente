type Props = { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'dark' };
export function AiActionButton({ children, onClick, variant = 'dark' }: Props) {
  const cls = variant === 'primary' ? 'bg-[#6D5BFF] text-white hover:brightness-105' : variant === 'ghost' ? 'bg-white/10 text-white border border-white/10' : 'bg-[#111113] text-white hover:opacity-90';
  return <button onClick={onClick} className={'h-8 px-3 rounded-full text-[11px] font-medium ' + cls}>{children}</button>;
}
