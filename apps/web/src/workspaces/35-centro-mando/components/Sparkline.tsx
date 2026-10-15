export function Sparkline({ points }: { points: string }) {
  return (
    <svg width="100%" height="44" viewBox="0 0 120 44" className="overflow-visible">
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={points} />
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" points={'0,38 ' + points + ' 120,38'} />
    </svg>
  );
}
