export function ChartAnnotation({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <line x1={x} y1="30" x2={x} y2="95" stroke="#6D5BFF" strokeDasharray="4 4" opacity="0.6" />
      <g transform={'translate(' + (x + 12) + ',22)'}>
        <rect width="112" height="22" rx="11" fill="#111113" />
        <text x="10" y="14" fontSize="10" fill="white" fontWeight="600">{label}</text>
      </g>
      <circle cx={x} cy={y} r="6" fill="#6D5BFF" stroke="white" strokeWidth="2" />
    </>
  );
}
