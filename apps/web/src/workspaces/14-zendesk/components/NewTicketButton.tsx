// ZENDESK_NEW_BTN_V1

import { Plus } from "lucide-react";

interface Props {
  label?: string;
  onClick?: () => void;
}

export default function NewTicketButton({ label = "Nuevo email", onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-4 mt-3 flex h-11 w-[calc(100%-32px)] items-center justify-center gap-2 rounded-xl bg-text px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}