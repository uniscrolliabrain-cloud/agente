import { ChevronDown } from "lucide-react";

interface Props {
  name: string;
  subtitle: string;
  onClick?: () => void;
}

export default function WorkspaceSwitcher({ name, subtitle, onClick }: Props) {
  return (
    <button className="ws" onClick={onClick} aria-haspopup="menu">
      <span className="ws__logo" aria-hidden="true">AI</span>
      <span className="ws__text">
        <span className="ws__name">{name}</span>
        <span className="ws__sub">{subtitle}</span>
      </span>
      <ChevronDown size={14} className="ws__chevron" aria-hidden="true" />
    </button>
  );
}
