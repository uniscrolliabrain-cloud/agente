// ZENDESK_CUSTOMER_V1

import { MoreHorizontal } from "lucide-react";
import TicketAvatar from "./TicketAvatar.tsx";
import { formatLtv } from "../format.ts";
import type { ZendeskCustomer } from "../types.ts";

interface Props {
  customer: ZendeskCustomer;
}

export default function CustomerHeader({ customer }: Props) {
  return (
    <div className="border-b border-border-soft px-5 py-4">
      <div className="flex items-start gap-3">
        <TicketAvatar customer={customer} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-text">{customer.name}</h2>
            <span className="inline-flex shrink-0 items-center rounded-md bg-purple-soft px-1.5 py-0.5 text-[10px] font-bold text-purple">
              LTV {formatLtv(customer.ltv)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-text-2">
            {customer.company} - {customer.email}
          </p>
          <p className="mt-0.5 text-[11px] text-text-3">
            {customer.interactions} interacciones previas - Cliente desde {customer.customerSince}
          </p>
        </div>
        <button
          type="button"
          aria-label="Mas opciones"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-text-3 hover:bg-bg-soft hover:text-text"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}