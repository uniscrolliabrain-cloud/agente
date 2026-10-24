// ZENDESK_AVATAR_V1

import Avatar from "./Avatar.tsx";
import { colorFromCompany } from "../format.ts";
import type { ZendeskCustomer } from "../types.ts";

interface Props {
  customer: ZendeskCustomer;
  size?: number;
}

export default function TicketAvatar({ customer, size = 40 }: Props) {
  return <Avatar initials={customer.avatarInitials} color={colorFromCompany(customer.company)} size={size} />;
}