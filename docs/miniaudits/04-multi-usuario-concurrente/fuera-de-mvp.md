# FUERA_DE_MVP_MULTIUSUARIO_V1

Lo que NO entra en la Campana 2 (Multiusuario). Cada categoria tiene su justificacion por exclusion.

## Gestion empresarial

| Categoria | Que | Por que NO entra |
|---|---|---|
| Editor de perfiles | Crear, editar, versionar perfiles operativos completos desde UI | Es configurabilidad, otra campana. |
| Constructor de entidades | Crear entidades, campos, relaciones desde UI | Es configurabilidad, otra campana. |
| Formularios dinamicos | Renderizar formularios segun configuracion | Es configurabilidad, otra campana. |
| Compilador de empresas | Aplicar plantillas sectoriales | Es configurabilidad, otra campana. |
| Plantillas sectoriales | Agencia, clinica, fontaneria, etc. | Es configurabilidad, otra campana. |
| Nominas | Calculo de salarios, retenciones, seguros sociales | Es modulo de producto, otra campana. |
| Compliance | RGPD, SOC-2, ISO 27001, auditoria externa | Es modulo de producto, otra campana. |
| Datos clinicos | Historiales medicos, recetas, diagnosticos | Es modulo de producto, otra campana. |

## Multi-tenant

| Categoria | Que | Por que NO entra |
|---|---|---|
| Multi-tenant real | Varios tenants en un solo Postgres con RLS | Campana 1, cerrada. |
| delete-tenant-data.ts | Borrado masivo de datos de un tenant | No aplica a multiusuario. Es de otra campana. |
| User.managerId | Responsable de equipo en User | Se resuelve via Flow y Policy, no via User.managerId. |

## Colaboracion en tiempo real

| Categoria | Que | Por que NO entra |
|---|---|---|
| CRDT / OT | Colaboracion en tiempo real en documentos | Otra campana. |
| WebSocket | Transporte bidireccional | Otra campana. |
| Presence en tiempo real | Estado de conexion de cada usuario | Solo PresenceService in-memory o PresenceStore. |

## Fuera de alcance tecnico

| Categoria | Que | Por que NO entra |
|---|---|---|
| salaryGross, salaryNet, bankAccount | Campos de nomina | No existen en User. |
| fieldClassification en todos los campos | Clasificar cada campo de cada entidad | Solo los campos reales: User.email, User.name, User.setup, AgentRole.permissions, AgentRole.memories, AgentRole.allowedTools, AgentTask.prompt, AgentTask.plan, AgentTask.outcome, AgentMemory.text, BusinessEntity.properties, SOP.steps. |
| withRead y withWrite en rutas no auditadas | Envolver rutas que no acceden a datos | Solo handlers, workers, acciones internas, streams, rutas alternativas. |

## Regla

Todo lo que esta en esta lista NO se implementa en la Campana 2. Si aparece una necesidad durante la campana, se documenta en -pendientes.md como deuda para otra campana. No se amplia el alcance silenciosamente.
