# Handoff LLM

> v1 · 2026-10-27 · Estado: current

## Propósito

Documento de handoff para el trabajo relacionado con LLM en Laia. Cubre la configuración de modelos, transporte de LLM, y la auditoría LLM→workspace.

## Configuración de modelos

Laia usa dos velocidades de LLM:

| Velocidad | Uso | Variables |
|-----------|-----|-----------|
| Fast | Chat, respuesta inmediata | `FAST_LLM_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` |
| Slow | Tareas de fondo, procesamiento | Misma configuración que fast |

## Transporte LLM

El transporte LLM está delegado al vendor. Los backends disponibles son:
- `sample`: comportamiento de ejemplo.
- `model`: `BuiltInAgent`.
- `agui`: delega a `HttpAgent` remoto (AG-UI / CopilotKit).

## Auditoría LLM → Workspace

Ver `AUDITORIA-LLM-WORKSPACE.md` para la auditoría detallada de la relación entre LLM y workspace.

## Cuotas

- `fastCallsPerHour`: default 600.
- `slowCallsPerHour`: default 60.

## Timeouts

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LLM_FIRST_BYTE_MS` | 45000 | Timeout primer byte LLM. |
| `LLM_GLOBAL_MS` | 120000 | Timeout global LLM. |
