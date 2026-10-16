# Política de validación humana

> Decisión de diseño. Aplicable al runtime del repo y al flujo de trabajo con IA.

## Idea

No todas las acciones necesitan validación humana. Algunas sí (borrar, publicar, aprobar gastos). Otras no (leer, calcular, escribir en local).

El sistema debe permitir al owner definir **por acción** si requiere aprobación humana o no.

## En el runtime del repo

- Cada tool / capability tiene un flag `requiresApproval: boolean` (default según tipo).
- Si `requiresApproval === true`, la acción pasa por `ActionProposal` con estado `awaiting_review`.
- Si `false`, se ejecuta directo.
- El owner del tenant define la política en `TenantConfig` o por rol.
- Ejemplos:
  - `read_*`: nunca requiere aprobación.
  - `write_*` en local: no requiere.
  - `send_email`, `charge_card`, `delete_*`, `publish_*`: requiere.
  - `delegate_task` a un sub-agente: configurable por rol.

**Estado actual:** parcialmente implementado en `actions.ts` (approval-requests). Falta el flag por tool y la política por tenant.

## En el flujo de trabajo con IA (yo)

- El owner define por adelantado qué tipos de comandos quiere que se le consulten antes de ejecutar.
- Ejemplos:
  - "Antes de `git push`, pregúntame."
  - "Antes de borrar archivos, pregúntame."
  - "Antes de cambiar schemas Zod, pregúntame."
  - Todo lo demás, aplica directo.
- La IA respeta la política.

## Bloques donde se aplica

- Bloque 06 (aprobaciones y acciones): añadir flag `requiresApproval` por tool.
- Bloque 11 (chat con LLM): el chat respeta la política al ejecutar tools.
- Bloque 24 (Business OS): el owner configura la política por rol.

## Estado

- Documentado.
- Pendiente de decisión y aplicación en bloque 06 y 24.