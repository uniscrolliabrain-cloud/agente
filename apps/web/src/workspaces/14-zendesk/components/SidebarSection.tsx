// ZENDESK_SIDEBAR_SECTION_V1

import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function SidebarSection({ label, children }: Props) {
  return (
    <section className="mt-5">
      <h3 className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-text-3">{label}</h3>
      <div className="flex flex-col gap-0.5 px-2">{children}</div>
    </section>
  );
}