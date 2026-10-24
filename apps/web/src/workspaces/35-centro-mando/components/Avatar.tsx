type Props = { label: string; size?: number; tone?: 'lav' | 'dark' };
export function Avatar({ label, size = 32, tone = 'lav' }: Props) {
  const bg = tone === 'dark' ? 'bg-[#111113] text-white' : 'bg-[#F1F0FF] text-[#6D5BFF]';
  return (
    <div className={'rounded-full grid place-items-center text-[11px] font-bold shrink-0 ' + bg} style={{ width: size, height: size }}>
      {label}
    </div>
  );
}
