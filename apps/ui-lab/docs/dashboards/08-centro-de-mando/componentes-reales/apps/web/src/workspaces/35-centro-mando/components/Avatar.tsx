type Props = { label: string; size?: number; tone?: 'lav' | 'dark' };

export function Avatar({ label, size = 32, tone = 'lav' }: Props) {
  const bg = tone === 'dark'
    ? 'bg-[#1A1A1A] text-white'
    : 'bg-[var(--v2-purple-soft)] text-[color:var(--v2-purple)]';
  return (
    <div
      className={'rounded-full grid place-items-center text-[11px] font-bold shrink-0 ' + bg}
      style={{ width: size, height: size }}
    >
      {label}
    </div>
  );
}
