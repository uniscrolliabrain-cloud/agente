// acme-obras - declaracion de vistas (7, una por kind que soporta el adapter).
import type { WorkspaceViewDeclaration } from "../../../src/contracts/index.ts";

export const VIEWS = [
  {
    id: "resumen",
    intent: "resumen de obras en ejecución",
    kind: "dashboard",
    title: "Resumen de obras",
    query: "obras.resumen",
    actions: [],
  },
  {
    id: "tablero",
    intent: "obras por estado",
    kind: "board",
    title: "Tablero de obras",
    query: "obras.tablero",
    actions: [],
  },
  {
    id: "tareas",
    intent: "cola de tareas de obra",
    kind: "queue",
    title: "Tareas en curso",
    query: "obras.tareas",
    actions: [],
  },
  {
    id: "incidencias",
    intent: "incidencias abiertas de obra",
    kind: "inbox",
    title: "Incidencias abiertas",
    query: "obras.incidencias",
    actions: [],
  },
  {
    id: "partes",
    intent: "partes de obra emitidos por los agentes",
    kind: "table",
    title: "Partes de obra",
    query: "obras.partes",
    actions: [],
  },
  {
    id: "detalle",
    intent: "ficha de una obra concreta",
    kind: "detail",
    title: "Ficha de obra",
    query: "obras.detalle",
    actions: [],
  },
  {
    id: "parte-nuevo",
    intent: "redactar un parte de obra nuevo",
    kind: "form",
    title: "Nuevo parte",
    query: "obras.parte-nuevo",
    actions: [],
  },
] as const satisfies readonly WorkspaceViewDeclaration[];
