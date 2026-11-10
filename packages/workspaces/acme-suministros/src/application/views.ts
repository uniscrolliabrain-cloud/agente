// acme-suministros - declaracion de vistas (7, una por kind que soporta el adapter).
import type { WorkspaceViewDeclaration } from "../../../src/contracts/index.ts";

export const VIEWS = [
  {
    id: "resumen",
    intent: "resumen de compras y suministros",
    kind: "dashboard",
    title: "Resumen de compras",
    query: "suministros.resumen",
    actions: [],
  },
  {
    id: "pedidos",
    intent: "pedidos por estado",
    kind: "board",
    title: "Pedidos por estado",
    query: "suministros.pedidos",
    actions: [],
  },
  {
    id: "aprobaciones",
    intent: "aprobaciones pendientes de compra",
    kind: "queue",
    title: "Aprobaciones pendientes",
    query: "suministros.aprobaciones",
    actions: [],
  },
  {
    id: "avisos",
    intent: "avisos de suministro",
    kind: "inbox",
    title: "Avisos de suministro",
    query: "suministros.avisos",
    actions: [],
  },
  {
    id: "documentos",
    intent: "documentos y fuentes de conocimiento",
    kind: "table",
    title: "Documentos y fuentes",
    query: "suministros.documentos",
    actions: [],
  },
  {
    id: "ficha",
    intent: "ficha de un suministro concreto",
    kind: "detail",
    title: "Ficha de suministro",
    query: "suministros.ficha",
    actions: [],
  },
  {
    id: "pedido-nuevo",
    intent: "preparar un pedido a proveedor",
    kind: "form",
    title: "Nuevo pedido",
    query: "suministros.pedido-nuevo",
    actions: [],
  },
] as const satisfies readonly WorkspaceViewDeclaration[];
