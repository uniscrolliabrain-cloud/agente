// CONSENT_V1 - una sola fuente para la elección de cookies del navegador.
// Guarda la decisión y avisa a quien la necesite. Hoy no hay ningún servicio
// opcional cargado (no existen analítica ni píxeles en el build): por eso
// `applyConsent` no activa nada. Si algún día se añade uno, debe comprobar
// `measurement` aquí antes de cargarse; guardar la elección no es consentimiento
// efectivo por sí solo.

export const CONSENT_KEY = "agntia_cookie_consent_v1";
export const CONSENT_EVENT = "agntia:cookie-consent";
export const OPEN_COOKIE_PREFERENCES_EVENT = "agntia:open-cookie-preferences";

export type CookieConsent = {
  version: 1;
  necessary: true;
  measurement: boolean;
  savedAt: string;
};

function isConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CookieConsent>;
  return (
    candidate.version === 1 &&
    candidate.necessary === true &&
    typeof candidate.measurement === "boolean" &&
    typeof candidate.savedAt === "string"
  );
}

export function readConsent(): CookieConsent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function applyConsent(consent: CookieConsent): void {
  // No optional scripts or requests exist in this build. This function is the
  // single gate future services must consult; it deliberately does nothing else.
  window.dispatchEvent(new CustomEvent<CookieConsent>(CONSENT_EVENT, { detail: consent }));
}

export function saveConsent(measurement: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: 1,
    necessary: true,
    measurement,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // Sin almacenamiento la decisión vale solo para esta visita.
  }
  applyConsent(consent);
  return consent;
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Nada que borrar.
  }
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}
