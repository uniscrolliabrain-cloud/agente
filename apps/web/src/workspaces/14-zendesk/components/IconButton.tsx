// ZENDESK_ICON_BTN_V1

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "ghost" | "primary";
type Size = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  label: string;
}

const base = "inline-grid place-items-center rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  default: "border border-border bg-bg-card text-text-2 hover:text-text hover:bg-bg-soft",
  ghost: "border border-transparent text-text-2 hover:text-text hover:bg-bg-soft",
  primary: "border border-text bg-text text-white hover:opacity-90",
};
const sizes: Record<Size, string> = { sm: "h-7 w-7", md: "h-9 w-9" };

export default function IconButton({ variant = "default", size = "md", children, label, className = "", ...rest }: Props) {
  return (
    <button type="button" aria-label={label} title={label} className={base + " " + variants[variant] + " " + sizes[size] + " " + className} {...rest}>
      {children}
    </button>
  );
}