// acme-suministros - declaracion de capacidades. Solo lectura.
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
  lectura("suministros.resumen", "Resumen de compras", "Agrega pedidos, importes y avisos del tenant."),
  lectura("suministros.pedidos", "Pedidos por estado", "Agrupa los pedidos por su estado real."),
  lectura("suministros.aprobaciones", "Aprobaciones pendientes", "Lista las acciones que esperan aprobación."),
  lectura("suministros.avisos", "Avisos de suministro", "Lista las notificaciones del tenant con su cta."),
  lectura("suministros.documentos", "Documentos y fuentes", "Lista documentos y fuentes de conocimiento."),
  lectura("suministros.ficha", "Ficha de suministro", "Devuelve un suministro concreto por entityId."),
  lectura("suministros.pedido-nuevo", "Nuevo pedido", "Prepara los campos de un pedido a proveedor."),
];
