// ZENDESK_SHARED_AVATAR_V1

interface Props {
  initials: string;
  color: { bg: string; fg: string };
  size?: number;
  square?: boolean;
  online?: boolean;
  className?: string;
}

export default function Avatar({ initials, color, size = 40, square = false, online = false, className = "" }: Props) {
  const radius = square ? Math.round(size * 0.28) : 9999;
  const fontSize = Math.round(size * 0.34);
  const dot = Math.max(8, Math.round(size * 0.22));
  return (
    <span
      className={"relative inline-grid shrink-0 place-items-center font-semibold " + className}
      style={{
        width: size,
        height: size,
        background: color.bg,
        color: color.fg,
        borderRadius: radius,
        fontSize: fontSize,
      }}
    >
      {initials}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-bg-card bg-green"
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
}