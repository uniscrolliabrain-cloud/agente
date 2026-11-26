# Ficha · agntiapro-acme

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntiapro-acme` |
| Visibilidad | Público |
| Proyecto | ACME sintético |
| Superficies Agntia Code | Datos, Pruebas, Bitácora |
| Estado | DOCS_ONLY |
| Verificado contra | `main@8637e8925dd57351e9e93af8dae79aa3b2163314`, 2026-11-26 |
| Lenguaje | sin código de producto |
| Tamaño | 76 KB · 11 archivos |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Productor de datos y escenarios sintéticos de la empresa demo AgntiaPro ACME. No es otro tenant ni otro runtime: el producto y el runtime viven en `agente`.

## Qué declara que funciona hoy

- Diseño y documentación inicial de ocho bloques (`01-ARQUITECTURA` a `08-MIDDLEWARE-MCP-AGENTE`).
- Principios: los datos sintéticos entran por los mismos contratos y rutas de ingesta que los reales; AgntiaPro es autoridad de tenant, permisos y auditoría; separación `synthetic`/`sandbox`/`real`; efectos externos deny-by-default; reproducibilidad con `scenarioId`, `seed`, `runId` y `correlationId`.

## Qué no está verificado

- El README lo dice explícitamente: **no hay implementación operativa ni integraciones activadas**.
- No hay generador, fixtures ni pipeline en el repo; la unificación de las tres vías demo se anuncia como trabajo del propietario en `agente`.

## Stack y ejecución

- Sin `package.json` ni `pyproject.toml`: es un repo documental.
- No hay comandos de instalación, test o build.
- Variables de entorno: ninguna declarada.

## Datos e integraciones

Define contratos de ingesta y escenarios, pero no los ejecuta. Depende de `agente` para autoridad, memoria, auditoría y estado de ejecución. Los documentos mencionan adaptadores de proveedor/sandbox sin implementarlos.

## Calidad

- Sin tests ni CI visibles en la raíz.
- La validación es editorial: documentos de arquitectura, contratos y handoff.
- No se ha ejecutado nada.

## Límites y riesgos

- Riesgo bajo de seguridad, alto de expectativa: el nombre "ACME" puede leerse como entorno listo cuando es solo diseño.
- Sin licencia declarada: conviene decidirla antes de compartir con clientes.
- Si el generador se implementa fuera, la ficha de este repo debe enlazar al repo real que lo ejecuta para no duplicar la verdad.

## Migración a Agntia Code

1. Alta como proyecto "ACME sintético" en modo lectura, sin despliegue.
2. Superficies: Datos (contratos y escenarios), Pruebas (cuando existan fixtures) y Bitácora.
3. Nada que desplegar: la salud se limita a documentación y enlaces.
4. Cuando exista generador, moverlo a `SCAFFOLD` y añadir comando de ejecución.
