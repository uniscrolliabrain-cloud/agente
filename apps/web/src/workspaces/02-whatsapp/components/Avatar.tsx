// CHAT_AVATAR_V1

type Props = {
  initial: string
  color: string
  size?: number
  square?: boolean
  online?: boolean
}

export function Avatar({ initial, color, size = 44, square = false, online = false }: Props) {
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: square ? size * 0.28 : 9999,
        fontSize: size * 0.36,
      }}
    >
      {initial}
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-card bg-green" />
      )}
    </span>
  )
}
