# Plan maestro — orden de 14 repos hijos y desarrollo paralelo de agente

> 2026-11-15 · Propuesta priorizada; no equivale a instalación. En cada hijo se ha creado rama documental `docs/roadmap-integracion-agente-20261115` con `docs/roadmap-integracion-agente-2026-11/ROADMAP.md`.

## Orden y enlaces

1. [agntia-ciberseguridad](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
2. [agntia-clientes](https://github.com/uniscrolliabrain-cloud/agntia-clientes/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
3. [agntia-gestoria](https://github.com/uniscrolliabrain-cloud/agntia-gestoria/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
4. [agntia-comunicacion](https://github.com/uniscrolliabrain-cloud/agntia-comunicacion/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
5. [agntia-ventas](https://github.com/uniscrolliabrain-cloud/agntia-ventas/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
6. [agntia-finanzas](https://github.com/uniscrolliabrain-cloud/agntia-finanzas/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
7. [agntia-redes](https://github.com/uniscrolliabrain-cloud/agntia-redes/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
8. [agntia-marketing](https://github.com/uniscrolliabrain-cloud/agntia-marketing/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
9. [agntia-video](https://github.com/uniscrolliabrain-cloud/agntia-video/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
10. [agntia-branding](https://github.com/uniscrolliabrain-cloud/agntia-branding/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
11. [agntia-dise-o](https://github.com/uniscrolliabrain-cloud/agntia-dise-o/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
12. [agntia-legal](https://github.com/uniscrolliabrain-cloud/agntia-legal/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
13. [agntia-seguros](https://github.com/uniscrolliabrain-cloud/agntia-seguros/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)
14. [agntia-formacion](https://github.com/uniscrolliabrain-cloud/agntia-formacion/blob/docs/roadmap-integracion-agente-20261115/docs/roadmap-integracion-agente-2026-11/ROADMAP.md)

## Criterios del orden

Ciberseguridad primero por decisión del founder y porque permite construir el primer dominio seguro y observable en el padre. Clientes después por su utilidad transversal y código skeleton existente. Gestoría temprano por su código existente y dogfooding administrativo. Comunicación, ventas y finanzas ofrecen operaciones de negocio centrales; redes y marketing amplían canales; vídeo, branding y diseño construyen producción de activos; legal, seguros y formación se incorporan tras consolidar permisos, trazabilidad y experiencias humanas. **Orden revisable tras L0 por dependencias reales.**

## Dos líneas paralelas por cada repo

- **Hijo:** reconocer y terminar código real, contracts, bundles, SDK, tests, políticas y receipts.
- **Padre `agente`:** crear dominio, proyecciones, UI y APIs, kernel/policy/worker wiring, observabilidad, approvals y certificación de operación humana.

Sincronizar por contrato versionado; permitir avance paralelo, pero cerrar gates de integración de forma secuencial. No fusionar ramas de hijos a ciegas: primero inventario, PRs, CI y resolución de conflictos.

## Harness y agentes desde el primer dominio

Aunque la interfaz humana del primer vertical no dependa de LLM, diseñar sus estados, permisos, tareas, recibos y notificaciones de modo que el `IntentBridge` y `ProgressProjector` de `FastConversationV2` puedan consumirlos sin reescribir el dominio. Laia y otros agentes **solo conversan**; slow LLM propone intenciones tipadas; kernel autoriza; runtime ejecuta. Anam y chat comparten harness. Animación SVG de fases pedagógicas separada del estado operativo verificado.

## Primer vertical — ciberseguridad

1. Confirmar estado de `agntia-ciberseguridad` en HEAD, ramas/PR, bundle, CI, capacidades reales y límites de la demo sintética.
2. En `agente` diseñar `CybersecurityDomain` y adapter por contrato, con scopes tenant/actor, approvals, event receipts y estados visibles.
3. Crear flujo humano de auditoría autorizada → findings → propuesta de remediación → aprobación → ejecución restringida → verificación.
4. Ejecutar pruebas con fixtures y empresa interna; no usar entornos de terceros sin autorización.
5. Certificar fallo/retry/idempotencia, seguridad, audit trail, multi-tenant, rollback y panel de control.
6. Solo después activar slow LLM y Laia como capa conversacional sobre el mismo flujo ya verificado.

## Gates comunes

L0 baseline → L1 hijo terminado → L2 bundle → L3 padre en paralelo → L4 dogfood humano → L5 certificación → L6 slow → L7 fast/chat/Anam → L8 release.

**Estado:** documentación creada en ramas, sin merges, despliegues, tests o cambios de código.
