import type { PendingAction } from '../types';

const TONE: Record<PendingAction['tone'], string> = {
  warn: 'bg-[#FEF3C7] text-amber-800',
  info: 'bg-[#DBEAFE] text-blue-700',
  danger: 'bg-[#FFE4E6] text-red-700',
};

type Props = { actions: PendingAction[]; onResolve: () => void };

export function PendingActionsList({ actions, onResolve }: Props) {
  return (
    <>
      <div className="mt-4 space-y-2">
        {actions.slice(0, 2).map((action) => (
          <div key={action.id} className="flex items-center gap-2 text-[12px]">
            <span className={'text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ' + TONE[action.tone]}>
              {action.badge}
            </span>
            <span className="flex-1 truncate text-[var(--v2-text)]">{action.title}</span>
            <span className="text-[11px] text-[var(--v2-text-3)] shrink-0">{action.meta}</span>
          </div>
        ))}
        {actions.length > 2 && (
          <div className="text-[11px] text-[var(--v2-text-3)]">
            + {actions.length - 2} más esperando tu decisión
          </div>
        )}
      </div>
      <button
        onClick={onResolve}
        className="mt-4 w-full h-9 rounded-full bg-[var(--v2-purple)] text-white text-[12px] font-medium hover:brightness-105"
      >
        Revisar en Operaciones →
      </button>
    </>
  );
}
