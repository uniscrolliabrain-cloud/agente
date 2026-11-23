// Pure, browser-local demo model. No API imports or executable source-record IDs.
export const DAY_START = 480;
export const DAY_END = 1080;
export const PRESENT = 660;
export const stages = ["Pendiente", "En curso", "Revisión", "Aprobación", "Completado"] as const;
export type Stage = (typeof stages)[number];
export type ActivityKind = "Tarea" | "Evento" | "Proyecto" | "SOP";
export type Selection = { kind: "activity" | "actor" | "project" | "client" | "company"; id: string };
export type View = "Kanban" | "Grafo" | "Digital Twin" | "Empresa 360°";
export interface Actor {
  id: string;
  name: string;
  role: string;
  kind: "Agente" | "Humano" | "Proveedor";
  initials: string;
  portrait?: string;
}
export interface Project {
  id: string;
  name: string;
  client: string;
  output: string;
}
export interface Activity {
  id: string;
  title: string;
  kind: ActivityKind;
  actor: string;
  project: string;
  stage: Stage;
  start: number;
  end: number;
  detail: string;
  output: string;
  dependsOn?: string;
  priority: "Normal" | "Alta";
}
// Scenario agntia-demo v0.1 — isolated, browser-local, no backend effects.
// This is an editorial prototype awaiting founder validation.
export const actors: Actor[] = [
  { id: "laia", name: "LAIA", role: "Supervisión y conversación", kind: "Agente", initials: "LA", portrait: "/landing/laia.png" },
  { id: "marcos", name: "Marcos", role: "Operaciones e implantaciones", kind: "Agente", initials: "MA" },
  { id: "antonio", name: "Antonio", role: "Finanzas", kind: "Agente", initials: "AN", portrait: "/landing/antonio.png" },
  { id: "juan", name: "Juan", role: "Gestoría y administración", kind: "Agente", initials: "JU" },
  { id: "ana", name: "Ana", role: "Personas y formación", kind: "Agente", initials: "AN" },
  { id: "pedro", name: "Pedro", role: "Ciberseguridad", kind: "Agente", initials: "PE" },
  { id: "founder", name: "Founder", role: "Dirección y aprobaciones", kind: "Humano", initials: "FO" },
];
export const projects: Project[] = [
  { id: "bruma", name: "Compilación · Taller Bruma", client: "Taller Bruma", output: "Atención y agenda verificadas en simulación" },
  { id: "caliza", name: "Implantación · Estudio Caliza", client: "Estudio Caliza", output: "Propuesta comercial y campaña en revisión" },
  { id: "ladera", name: "Beta · Mercado Ladera", client: "Mercado Ladera", output: "Canal pendiente de consentimiento" },
  { id: "costa", name: "Operación · Costa Nido", client: "Costa Nido", output: "Seguimiento y cobros del escenario" },
  { id: "equipo", name: "Formación · Atlas Formación", client: "Atlas Formación", output: "Sesiones y evidencias de formación" },
];
const a = (
  id: string, title: string, actor: string, project: string, stage: Stage,
  start: number, end: number, detail: string, output: string, dependsOn?: string,
): Activity => ({
  id, title, actor, project, stage, start, end, detail, output, dependsOn,
  kind: "Tarea", priority: stage === "Aprobación" ? "Alta" : "Normal",
});
export const initialActivities: Activity[] = [
  a("demo-brief-bruma", "Registrar diagnóstico del cliente", "laia", "bruma", "Completado", 480, 530,
    "LAIA recoge las consultas perdidas y la necesidad de agenda de Taller Bruma.", "Discovery documentado"),
  a("demo-ontology-bruma", "Compilar procesos y relaciones", "marcos", "bruma", "En curso", 540, 720,
    "Mapear citas, responsables, canales y procedimientos; no activar conexiones externas.", "Mapa de procesos", "demo-brief-bruma"),
  a("demo-training-bruma", "Preparar formación de equipo", "ana", "bruma", "Pendiente", 780, 850,
    "Preparar ejercicios de simulación para owner y empleados.", "Sesión de formación", "demo-ontology-bruma"),
  a("demo-beta-bruma", "Validar agenda en sandbox", "pedro", "bruma", "Revisión", 740, 830,
    "Revisar evidencias de la prueba antes de aprobar la beta.", "Checklist de validación", "demo-ontology-bruma"),
  a("demo-caliza-proposal", "Preparar propuesta de captación", "marcos", "caliza", "En curso", 540, 690,
    "Elaborar la campaña y los criterios de seguimiento sin enviar mensajes reales.", "Propuesta revisable"),
  a("demo-caliza-approval", "Aprobar campaña comercial", "founder", "caliza", "Aprobación", 810, 900,
    "Publicación bloqueada hasta decisión del owner. Acción simulada.", "Decisión documentada", "demo-caliza-proposal"),
  a("demo-ladera-consent", "Verificar autorización del canal", "pedro", "ladera", "Aprobación", 630, 730,
    "La conexión de mensajería no se activa sin consentimiento verificado.", "Evidencia de autorización pendiente"),
  a("demo-ladera-sop", "Preparar SOP de reactivación", "marcos", "ladera", "Pendiente", 770, 880,
    "Simular la secuencia de reactivación sin comunicaciones externas.", "SOP y pruebas", "demo-ladera-consent"),
  a("demo-costa-invoice", "Revisar factura y cobro", "antonio", "costa", "Revisión", 520, 640,
    "Factura ficticia pendiente de cobro; no hay transferencias reales.", "Seguimiento financiero"),
  a("demo-costa-docs", "Revisar expediente administrativo", "juan", "costa", "Completado", 480, 570,
    "Preparar documentación de la relación recurrente del cliente.", "Expediente revisado"),
  a("demo-atlas-training", "Entrenar al equipo en simulación", "ana", "equipo", "En curso", 600, 760,
    "Owner y empleados practican el recorrido sin afectar sistemas externos.", "Resultados de formación"),
  a("demo-atlas-review", "Revisar resultados con LAIA", "laia", "equipo", "Pendiente", 950, 1020,
    "LAIA resume evidencias y decisiones pendientes del escenario.", "Tarjetas para el owner", "demo-atlas-training"),
];
export interface StudioState {
  activities: Activity[];
  selection: Selection;
  clock: number;
  playing: boolean;
  editing: boolean;
  scope: string;
  view: View;
  revision: number;
}
export function initialState(): StudioState {
  return {
    activities: initialActivities.map((item) => ({ ...item })),
    selection: { kind: "activity", id: "demo-brief-bruma" },
    clock: PRESENT,
    playing: false,
    editing: true,
    scope: "all",
    view: "Kanban",
    revision: 0,
  };
}
export type Action =
  | { type: "select"; selection: Selection }
  | { type: "clock"; clock: number }
  | { type: "play" }
  | { type: "tick" }
  | { type: "present" }
  | { type: "reset" }
  | { type: "editing"; value: boolean }
  | { type: "scope"; scope: string }
  | { type: "view"; view: View }
  | { type: "save"; activity: Activity };
export function validActivity(item: Activity): boolean {
  return (
    item.id.startsWith("demo-") &&
    item.title.trim().length > 0 &&
    item.title.length <= 100 &&
    actors.some((actor) => actor.id === item.actor) &&
    projects.some((project) => project.id === item.project) &&
    stages.includes(item.stage) &&
    Number.isFinite(item.start) &&
    Number.isFinite(item.end) &&
    item.start >= DAY_START &&
    item.end <= DAY_END &&
    item.start < item.end
  );
}
export function reducer(state: StudioState, action: Action): StudioState {
  switch (action.type) {
    case "select": {
      const next = { ...state, selection: action.selection };
      const selectedIds = new Set(selectionActivities(next).map((item) => item.id));
      return visibleActivities(next).some((item) => selectedIds.has(item.id)) ? next : { ...next, scope: "all" };
    }
    case "view":
      return { ...state, view: action.view };
    case "scope":
      return { ...state, scope: action.scope, selection: { kind: "company", id: "agntia-demo" } };
    case "editing":
      return { ...state, editing: action.value };
    case "clock":
      return Number.isFinite(action.clock)
        ? { ...state, clock: Math.max(DAY_START, Math.min(DAY_END, action.clock)), playing: false }
        : state;
    case "present":
      return { ...state, clock: PRESENT, playing: false };
    case "play":
      return { ...state, playing: !state.playing, clock: state.clock >= DAY_END ? DAY_START : state.clock };
    case "tick":
      return state.playing
        ? { ...state, clock: Math.min(DAY_END, state.clock + 1), playing: state.clock + 1 < DAY_END }
        : state;
    case "reset":
      return initialState();
    case "save": {
      if (!state.editing || !validActivity(action.activity)) return state;
      const item = { ...action.activity, title: action.activity.title.trim() };
      const exists = state.activities.some((a) => a.id === item.id);
      return {
        ...state,
        activities: exists ? state.activities.map((a) => (a.id === item.id ? item : a)) : [...state.activities, item],
        selection: { kind: "activity", id: item.id },
        scope: "all",
        revision: state.revision + 1,
      };
    }
  }
}
export function visibleActivities(state: StudioState): Activity[] {
  return state.activities.filter(
    (item) =>
      state.scope === "all" ||
      item.project === state.scope ||
      item.actor === state.scope ||
      projects.find((p) => p.id === item.project)?.client === state.scope,
  );
}
export function selectionActivities(state: StudioState): Activity[] {
  const { kind, id } = state.selection;
  return state.activities.filter(
    (item) =>
      kind === "company" ||
      (kind === "activity" && item.id === id) ||
      (kind === "actor" && item.actor === id) ||
      (kind === "project" && item.project === id) ||
      (kind === "client" && projects.find((p) => p.id === item.project)?.client === id),
  );
}
export const timeLabel = (minute: number) =>
  `${Math.floor(minute / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(minute % 60)
    .toString()
    .padStart(2, "0")}`;
export const timeValue = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
};
export const position = (minute: number) => ((minute - DAY_START) / (DAY_END - DAY_START)) * 100;
// Split simultaneous activities into sublanes so edits never conceal another block.
export function packIntervals<T extends { start: number; end: number }>(items: T[]) {
  const ends: number[] = [];
  const blocks = [...items]
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .map((item) => {
      let track = ends.findIndex((end) => end <= item.start);
      if (track < 0) track = ends.length;
      ends[track] = item.end;
      return { item, track };
    });
  return { blocks, tracks: Math.max(1, ends.length) };
}
export const phase = (item: Activity, clock: number) =>
  clock < item.start ? "Previsto" : clock >= item.end ? "Final del intervalo" : "En este intervalo";
