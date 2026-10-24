/** Tailwind config — tokens exactos del V2 warm beige. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F3F0EB",
        "bg-card": "#FFFFFF",
        "bg-soft": "#F7F3ED",
        "bg-softer": "#FBF8F3",
        border: "#EDE8E0",
        "border-soft": "#F0EBE3",
        "border-strong": "#E7E0D6",
        text: "#1A1A1A",
        "text-2": "#6B6B6B",
        "text-3": "#8A857E",
        "text-4": "#B8B2AA",
        purple: "#5E4FF1",
        "purple-soft": "#F0EBFF",
        green: "#22C55E",
        orange: "#FF6B2C",
        warn: "#FFF5D5",
        "warn-border": "#FDE68A",
        "warn-text": "#92400E",
        info: "#EFF6FF",
        "info-border": "#BFDBFE",
        "info-text": "#2563EB",
      },
      fontFamily: {
        sans: ["'Instrument Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "28px", pill: "999px" },
      boxShadow: {
        card: "0 12px 40px rgba(0,0,0,0.04)",
        soft: "0 2px 12px rgba(0,0,0,0.04)",
        composer: "0 2px 18px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1)",
      },
    },
  },
  plugins: [],
};