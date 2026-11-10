// acme-obras - declaracion de capacidades. Todas de lectura: ninguna tiene
// efectos laterales ni exige aprobacion todavia.
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
  lectura("obra.resumen", "Resumen de obras", "Agrega avance y estado de las obras del tenant."),
  lectura("obra.tablero", "Tablero de obras", "Agrupa las obras por estado de ejecución."),
  lectura("obra.tareas", "Tareas de obra", "Lista las tareas de obra con su estado real."),
  lectura("obra.incidencias", "Incidencias de obra", "Lista las incidencias abiertas con su prioridad."),
  lectura("obra.partes", "Partes de obra", "Lista los partes diarios emitidos por los agentes."),
  lectura("obra.detalle", "Ficha de obra", "Devuelve una obra concreta por entityId."),
  lectura("obra.parte.nuevo", "Nuevo parte", "Prepara los campos de un parte de obra nuevo."),
];
