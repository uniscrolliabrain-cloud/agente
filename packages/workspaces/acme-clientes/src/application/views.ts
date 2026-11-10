// acme-clientes - declaracion de vistas (7, una por kind que soporta el adapter).
import type { WorkspaceViewDeclaration } from "../../../src/contracts/index.ts";

export const VIEWS = [
  {
    id: "resumen",
    intent: "resumen comercial de clientes y facturación",
    kind: "dashboard",
    title: "Resumen comercial",
    query: "clientes.resumen",
    actions: [],
  },
  {
    id: "oportunidades",
    intent: "oportunidades por estado",
    kind: "board",
    title: "Oportunidades",
    query: "clientes.oportunidades",
    actions: [],
  },
  {
    id: "facturas",
    intent: "facturas pendientes de cobro",
    kind: "queue",
    title: "Facturas pendientes",
    query: "clientes.facturas",
    actions: [],
  },
  {
    id: "bandeja",
    intent: "bandeja de entrada de clientes",
    kind: "inbox",
    title: "Bandeja de clientes",
    query: "clientes.bandeja",
    actions: [],
  },
  {
    id: "cartera",
    intent: "cartera completa de clientes",
    kind: "table",
    title: "Cartera de clientes",
    query: "clientes.cartera",
    actions: [],
  },
  {
    id: "ficha",
    intent: "ficha de un cliente concreto",
    kind: "detail",
    title: "Ficha de cliente",
    query: "clientes.ficha",
    actions: [],
  },
  {
    id: "alta",
    intent: "dar de alta un cliente nuevo",
    kind: "form",
    title: "Alta de cliente",
    query: "clientes.alta",
    actions: [],
  },
] as const satisfies readonly WorkspaceViewDeclaration[];
