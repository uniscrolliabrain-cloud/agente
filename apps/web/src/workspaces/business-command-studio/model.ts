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
export const actors: Actor[] = [
  { id: "laia", name: "LAIA", role: "Coordinación", kind: "Agente", initials: "LA", portrait: "/landing/laia.png" },
  { id: "marcos", name: "Marcos", role: "Automatización", kind: "Agente", initials: "MA" },
  {
    id: "antonio",
    name: "Antonio",
    role: "Finanzas",
    kind: "Humano",
    initials: "AN",
    portrait: "/landing/antonio.png",
  },
  { id: "pilar", name: "Pilar", role: "Personas", kind: "Humano", initials: "PI" },
  { id: "manuel", name: "Manuel", role: "Estudio creativo", kind: "Proveedor", initials: "MN" },
];
export const projects: Project[] = [
  { id: "campaign", name: "Campaña de captación", client: "Estudio Norte", output: "Propuesta y campaña publicadas" },
  { id: "operations", name: "Operación ACME", client: "ACME", output: "Jornada coordinada" },
  { id: "onboarding", name: "Onboarding del equipo", client: "ACME", output: "Nueva incorporación preparada" },
];
const a = (
  id: string,
  title: string,
  actor: string,
  project: string,
  stage: Stage,
  start: number,
  end: number,
  detail: string,
  output: string,
  dependsOn?: string,
): Activity => ({
  id,
  title,
  actor,
  project,
  stage,
  start,
  end,
  detail,
  output,
  dependsOn,
  kind: "Tarea",
  priority: stage === "Aprobación" ? "Alta" : "Normal",
});
export const initialActivities: Activity[] = [
  a(
    "demo-campaign",
    "Coordinar campaña",
    "laia",
    "campaign",
    "En curso",
    540,
    735,
    "LAIA coordina la propuesta de Estudio Norte. Marcos prepara la secuencia y Manuel, las piezas de campaña.",
    "Brief y plan de campaña",
  ),
  a(
    "demo-crm",
    "Conectar el CRM",
    "marcos",
    "campaign",
    "Pendiente",
    780,
    855,
    "Preparar el mapeo de contactos antes de activar la secuencia comercial.",
    "Contactos normalizados",
    "demo-automation",
  ),
  a(
    "demo-automation",
    "Preparar secuencia",
    "marcos",
    "campaign",
    "En curso",
    570,
    690,
    "Diseñar la secuencia comercial de tres pasos. El envío queda pendiente de revisión.",
    "Secuencia de seguimiento",
    "demo-brief",
  ),
  a(
    "demo-content",
    "Editar piezas creativas",
    "manuel",
    "campaign",
    "En curso",
    600,
    795,
    "Preparar las piezas de lanzamiento a partir del briefing aprobado.",
    "Tres piezas para revisión",
    "demo-brief",
  ),
  a(
    "demo-proposal",
    "Revisar propuesta",
    "laia",
    "campaign",
    "Revisión",
    810,
    900,
    "Contrastar alcance, calendario y presupuesto antes de presentar al cliente.",
    "Propuesta comercial revisada",
    "demo-content",
  ),
  a(
    "demo-budget",
    "Aprobar presupuesto",
    "antonio",
    "campaign",
    "Aprobación",
    630,
    720,
    "El presupuesto de 5.400 € requiere una decisión del propietario. Esta aprobación es solo una simulación.",
    "Presupuesto aprobado",
    "demo-brief",
  ),
  a(
    "demo-brief",
    "Preparar briefing",
    "laia",
    "campaign",
    "Completado",
    480,
    525,
    "Recopilar objetivos y contexto del cliente para iniciar la campaña.",
    "Briefing compartido",
  ),
  a(
    "demo-bank",
    "Conciliación de caja",
    "antonio",
    "operations",
    "Completado",
    495,
    600,
    "Revisar cobros y gastos previstos de la jornada.",
    "Resumen financiero",
  ),
  a(
    "demo-interviews",
    "Entrevistas de equipo",
    "pilar",
    "onboarding",
    "En curso",
    615,
    735,
    "Conversar con dos candidatos para la nueva posición de operaciones.",
    "Notas y recomendación",
  ),
  a(
    "demo-meeting",
    "Presentación al cliente",
    "laia",
    "campaign",
    "Pendiente",
    960,
    1020,
    "Presentar la propuesta y recoger los próximos pasos de Estudio Norte.",
    "Acuerdos de reunión",
    "demo-proposal",
  ),
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
    selection: { kind: "activity", id: "demo-campaign" },
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
      return { ...state, scope: action.scope, selection: { kind: "company", id: "acme" } };
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
