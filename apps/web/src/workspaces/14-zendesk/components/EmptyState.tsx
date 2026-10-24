// ZENDESK_EMPTY_V1

import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon && <span className="text-text-3">{icon}</span>}
      <p className="text-sm font-medium text-text">{title}</p>
      {subtitle && <p className="text-xs text-text-3">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}