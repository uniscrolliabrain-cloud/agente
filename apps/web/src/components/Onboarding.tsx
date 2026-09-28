interface Step {
  id: string;
  label: string;
  actionLabel: string;
  onAction: () => void;
  done: boolean;
}

interface Props {
  steps: Step[];
  onDismiss: () => void;
}

export default function Onboarding({ steps, onDismiss }: Props) {
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  return (
    <section className="onboard" aria-labelledby="onb-title">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h2 className="onboard__title" id="onb-title">Primeros pasos</h2>
          <p className="onboard__sub">Conecta tus datos para que el agente responda con informacion real de tu negocio.</p>
        </div>
        <button className="ghost-icon-button" onClick={onDismiss} aria-label="Ocultar primeros pasos" style={{ width: 24, height: 24 }}>
          ×
        </button>
      </div>
      <ul className="onboard__list">
        {steps.map((step) => (
          <li key={step.id} className="onboard__row" data-done={step.done ? "true" : "false"}>
            <span className="check" aria-hidden="true" />
            <span className="onboard__label">{step.label}</span>
            {!step.done && (
              <button className="btn-sm" onClick={step.onAction}>{step.actionLabel}</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
