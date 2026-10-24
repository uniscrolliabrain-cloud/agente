// ZENDESK_INSIGHT_INTENT_V1

interface Props {
  intent: string;
}

export default function InsightIntent({ intent }: Props) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Intencion</p>
      <p className="mt-1 text-sm text-text">{intent}</p>
    </div>
  );
}