# Ficha · agntia-ciberseguridad

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-ciberseguridad` |
| Visibilidad | Público |
| Proyecto | Ciberseguridad |
| Superficies Agntia Code | Revisiones, Entornos, Observabilidad |
| Estado | IMPLEMENTATION |
| Verificado contra | `main@424c8e23c73fca45a005d1f5b065678d2cda02ca`, 2026-11-26 |
| Lenguaje | Python 3.11+ (FastAPI) + SDK TypeScript |
| Tamaño | 1 613 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Middleware de ciberseguridad tradicional y agéntica para AgntiaPro: observar activos autorizados, reunir evidencias, preparar auditorías y reportes, controlar acciones de agentes y proponer remediaciones revisables.

## Qué declara que funciona hoy

- Paquete `agntia-ciberseguridad` (FastAPI, Pydantic, Uvicorn, jsonschema, cryptography, OpenTelemetry).
- **196 tests Python OK (8 skips)** y **115 tests de laboratorio adversarial**, en suites distintas; SDK 6/1; 84 rutas `/v1`; esquema 8; demo sintética.
- `production_enabled=false` en `docs/release/status.json`; 2 fases `PASS` y 40 `PARTIAL`; sin PR ni revisión independiente.
- Existe `SECURITY.md`, laboratorio adversarial C01–C18, hardening B/D y centro de operaciones con matriz CP-01…CP-14.

## Qué no está verificado

- No hay GO de producción ni aceptación independiente; el propio README corrige cronologías anteriores.
- Clientes, compras y despliegue: deshabilitados.
- No se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `python scripts/validate_foundation.py`; instalación con `pyproject.toml` (`requires-python >=3.11`).
- Carpetas `agntia_ciberseguridad/`, `adversarial_lab/`, `rules/`, `fixtures/`, `infra/`, `typescript/`, `tests/`.
- Variables de entorno: no hay `.env.example` en la raíz.

## Datos e integraciones

Demo sintética empaquetable con adaptadores offline; sin ejecución de clientes habilitada. Observabilidad con OpenTelemetry export a OTLP HTTP.

## Calidad

- La evidencia más detallada de la cuenta en cuanto a estado por fase, con correcciones de cronología y límites explícitos.
- Riesgo declarado con honestidad: 2 PASS / 40 PARTIAL.
- Sin licencia ni descripción en GitHub.

## Límites y riesgos

- Es material sensible: una ficha o demo que muestre capacidades ofensivas debe limitarse a datos sintéticos y no ejecutar nada contra terceros.
- Los planes Lite/L/XL son hipótesis históricas, no precios aprobados.
- `handoff_freebuff.md` y la unificación en TypeScript están declarados obsoletos; no usarlos como fuente.

## Migración a Agntia Code

1. Alta como proyecto "Ciberseguridad" con `python scripts/validate_foundation.py` como verificación mínima.
2. Superficies: Revisiones (matriz CP y fases), Entornos (producción deshabilitada) y Observabilidad (OTLP).
3. Bitácora inicial con `status.json` y las correcciones de cronología del README.
4. No habilitar despliegue ni `production_enabled` desde Agntia Code sin aceptación explícita.
