import type { ReactNode } from 'react';
type Props = { title: ReactNode; actions?: ReactNode };
export function SectionHeader({ title, actions }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
