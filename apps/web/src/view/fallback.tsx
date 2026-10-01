// FALLBACK_V1 - que pintar si nada encaja
export function FallbackView({spec}:{spec:any}){return <div data-fallback>{spec?.title||"No template"} - fallback</div>}