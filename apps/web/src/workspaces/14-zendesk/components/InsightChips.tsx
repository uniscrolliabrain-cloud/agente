// ZENDESK_INSIGHT_CHIPS_V1

interface Props {
  chips: string[];
}

export default function InsightChips({ chips }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c}
          className="inline-flex items-center rounded-md border border-border bg-bg-soft px-2 py-0.5 text-[10px] font-medium text-text-2"
        >
          {c}
        </span>
      ))}
    </div>
  );
}