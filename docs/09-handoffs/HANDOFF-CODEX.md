# Handoff Codex

> v1 · 2026-10-27 · Estado: current

## Propósito

Documento de handoff para el agente Codex. Define qué está fuera de alcance de la campaña de documentación actual y qué le corresponde a Codex.

## Fuera de alcance de esta campaña de documentación

Las siguientes áreas pertenecen a la campaña de Codex (F2/F6) y **no se tocan** en esta rama `limpieza-docu`:

- `llm-usage`, coste, cuota, `model-chain.ts`
- `planner/**`, `execution/**`
- `packages/workspaces/**` (524 docs internos)
- `apps/web/src/workspaces/**` (149 docs internos)

## Ramas relacionadas

| Rama | Commit | Descripción |
|------|--------|-------------|
| `campaign/authz-tenant` | `c5a8c7c` | Webhook WhatsApp público, auditoría LLM→workspace, mandato de campaña. |
| `campaign/verdad` | `e3787a6` | Campaña de verdad: estado real del repo, 6 fases V0-V5. |
| `feat/compiler-scaffold` | `eecafa0` | Scaffold de compilador (no es del usuario). |
| `dev/equipo-cuentas` | — | Solo docs de planificación, sin tocar. |

## Instrucciones para Codex

1. No modificar documentación en `docs/` de esta campaña.
2. Continuar con el desarrollo del compilador scaffold en su rama.
3. Coordinar con Cline para revisiones de código y merge a `main`.
