# 25 — Docs operativos

> v1 · 2026-10-04 · Estado: audited
> Fuente: docs/README.md, PRODUCT.md, PROTOCOLO.md, docs/operacion/*

## Ontología

README (índice), PRODUCT (visión), PROTOCOLO (reglas de trabajo),
estado/ (ROADMAP, KNOWN_ISSUES, FUTURE), operacion/ (DEPLOY, CLIENTE,
ONBOARDING, PRODUCCION, TODO-FOR-PROD), kernel/ (auditorías), ui/ (campaña),
archive/ (12 docs históricos con fecha).

## Estado real

Reestructuración completa en este pase. README, PRODUCT, PROTOCOLO
nuevos. 12 docs históricos archivados con fecha. Basura borrada
(ROADMAP_112, AUDITORIA_TENANT.ps1, .lnk). Estructura por carpetas
temáticas. Cada doc tiene cabecera `vN · YYYY-MM-DD · Estado`.

## Evidencia

docs/README.md lista 8 docs canónicos en el nivel 1.
docs/PRODUCT.md con visión de producto.
docs/PROTOCOLO.md con reglas de trabajo unificadas.
docs/archive/ con 12+ docs históricos.
docs/audits/ con esta campaña de 25 ramas.

## Huecos

Runbook de incidentes. Glosario del cliente. FAQ operativa. Diagramas de
arquitectura (hoy ASCII). Verificación automática de cabeceras y enlaces
en docs.

## Interrelación

Cara del sistema para quien opera. Transversal a todas las ramas.

## Riesgos

Docs quedan obsoletos al día siguiente. Operador nuevo no sabe qué hacer
ante un fallo. Cliente pregunta lo mismo 100 veces.

## Tipo de fixes

docs/operacion/RUNBOOK.md con 10-15 escenarios. docs/CLIENTE.md con
glosario en lenguaje natural. FAQ. Diagramas Mermaid.
