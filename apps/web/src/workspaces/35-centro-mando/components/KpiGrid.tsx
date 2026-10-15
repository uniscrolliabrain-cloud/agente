import type { ReactNode } from 'react';
export function KpiGrid({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{children}</section>;
}
