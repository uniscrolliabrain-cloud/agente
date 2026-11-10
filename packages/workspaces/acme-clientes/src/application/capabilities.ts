// acme-clientes - declaracion de capacidades. Solo lectura.
import type { CapabilityDeclaration } from "../../../src/contracts/index.ts";

function lectura(id: string, title: string, description: string): CapabilityDeclaration {
  return {
    id,
    title,
    description,
    kind: "query",
    risk: "low",
    sideEffects: false,
    requiresApproval: false,
    inputs: {},
    outputs: {},
  };
}

export const CAPABILITIES: readonly CapabilityDeclaration[] = [
  lectura("clientes.resumen", "Resumen comercial", "Agrega cartera, oportunidades y cobros del tenant."),
  lectura("clientes.oportunidades", "Oportunidades", "Agrupa las oportunidades por estado comercial."),
  lectura("clientes.facturas", "Facturas pendientes", "Lista las facturas emitidas y su estado de cobro."),
  lectura("clientes.bandeja", "Bandeja de clientes", "Lista los mensajes recibidos de clientes."),
  lectura("clientes.cartera", "Cartera de clientes", "Lista los clientes activos del tenant."),
  lectura("clientes.ficha", "Ficha de cliente", "Devuelve un cliente concreto por entityId."),
  lectura("clientes.alta", "Alta de cliente", "Prepara los campos de alta de un cliente nuevo."),
];
