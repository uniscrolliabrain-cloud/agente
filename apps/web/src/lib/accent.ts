// APARIENCIA_V1 - color de la aplicación elegido en «Mi perfil».
//
// El color no se pinta aquí: se guarda en `document.documentElement.dataset.accent`
// y las paletas viven en CSS (--themed-*), que alimentan los tokens del shell
// (--accent, --v2-purple*) y de cada workspace. Asi el cambio alcanza la banda,
// los botones, las etiquetas y los acentos sin repintar componente a componente.

export type AccentId = "lavanda" | "grafito" | "amarillo" | "naranja" | "rojo";

export interface AccentOption {
  id: AccentId;
  label: string;
  hint: string;
  /** Dos paradas de la muestra: el acento y su lavado. */
  swatch: [string, string];
}

export const ACCENTS: AccentOption[] = [
  { id: "lavanda", label: "Lavanda", hint: "El de siempre, suave", swatch: ["#6550dd", "#e6dcfb"] },
  { id: "grafito", label: "Grafito", hint: "Gris oscuro, casi negro", swatch: ["#2c2c31", "#cfccc5"] },
  { id: "amarillo", label: "Amarillo", hint: "Mostaza cálida", swatch: ["#d0a01b", "#f7e9bb"] },
  { id: "naranja", label: "Naranja", hint: "Terroso y templado", swatch: ["#c4651b", "#f4d8bb"] },
  { id: "rojo", label: "Rojo", hint: "Rojo de YouTube", swatch: ["#d21f1f", "#f5cccc"] },
];

const STORAGE_KEY = "agntia_accent_v1";

export function readAccent(): AccentId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ACCENTS.some((option) => option.id === saved)) return saved as AccentId;
  } catch {
    // Almacenamiento bloqueado: se queda el color por defecto.
  }
  return "lavanda";
}

export function applyAccent(id: AccentId): void {
  document.documentElement.dataset.accent = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Sin persistencia el color dura la sesión; no es un error de la vista.
  }
}

/** Siembra el color guardado al arrancar la aplicación. */
export function initAccent(): void {
  applyAccent(readAccent());
}
