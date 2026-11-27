/** Resorte críticamente amortiguado, solución analítica (m=1, c=2w, k=w²).
 * Tiempo en segundos; posición y velocidad se conservan al cambiar el objetivo.
 * No integración Euler ni dependencia de la frecuencia de refresco.
 */
export type SpringState = { position: number; velocity: number };
export function advanceSpring(
  state: SpringState, target: number, seconds: number, omega: number,
): SpringState {
  if (seconds <= 0) return state;
  const delta = state.position - target;
  const coefficient = state.velocity + omega * delta;
  const decay = Math.exp(-omega * seconds);
  return {
    position: target + (delta + coefficient * seconds) * decay,
    velocity: (state.velocity - omega * coefficient * seconds) * decay,
  };
}
export function springSettled(state: SpringState, target: number): boolean {
  return Math.abs(state.position - target) < 0.002 && Math.abs(state.velocity) < 0.04;
}
