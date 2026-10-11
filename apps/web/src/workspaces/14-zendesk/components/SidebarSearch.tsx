// ZENDESK_SIDEBAR_SEARCH_V1

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SidebarSearch({ value, onChange, placeholder = "Buscar o preguntar..." }: Props) {
  return (
    <label className="relative mx-4 mt-3 block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-3" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-border bg-bg-card pl-9 pr-3 text-xs text-text outline-none placeholder:text-text-3 focus-visible:border-purple"
      />
    </label>
  );
}