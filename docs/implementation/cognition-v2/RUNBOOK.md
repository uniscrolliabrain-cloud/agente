# Runbook local y rollback

## Entorno comprobado

Node v24.22.1, pnpm instalado 11.25.0; packageManager del repo conserva pnpm@11.19.0. Instalaciones frozen-lockfile y dependencias declaradas, sin modificar secretos. Pruebas de persistencia en PGlite y Postgres 17 Alpine local. Ningún proveedor LLM, Anam o JEV real se invocó.

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm --filter @agente/web typecheck
pnpm --filter @agente/web build
pnpm test:cognition-v2
pnpm gate
pnpm verify:slice
pnpm test:browser
pnpm gate:cognition-v2
```

El último comando requiere evidencia de un `gate` completo. Declara NO_GO mientras existan bloqueos de certificación, aunque los focos locales estén verdes; no es una vía para saltarse el gate. El test Postgres exige `COGNITION_TEST_POSTGRES_URL` dirigido a una base sintética local; sin él se marca skip explícito. No apuntarlo a producción.

## Activación sintética

Configurar una allowlist explícita `COGNITION_V2_TENANTS=tenant-sintetico` y crear usuario activo/membership mediante los servicios del sistema. Mantener esta activación fuera de despliegues reales.

- PGlite: API y worker deben compartir el mismo proceso; habilitar expresamente `COGNITION_V2_EMBEDDED_WORKER=true` al arrancar `pnpm dev`.
- Postgres: `pnpm dev:cognition-worker` requiere `DATABASE_URL` y la misma allowlist; no comparte cola ni admisión Fast con Slow.
- Fast necesita FAST_LLM_PROVIDER/MODEL/API_KEY; Slow sus propias SLOW_LLM_PROVIDER/MODEL/API_KEY. BASE_URL se configura por carril con objetos de proveedor, sin mutar variables globales. Una configuración ausente falla de forma explícita, sin fallback cruzado.
- Presupuestos actuales son límites defensivos de llamadas/entrada/salida, no una política comercial de costes aprobada ni un SLA. El conteo de contexto por bytes UTF-8 es una cota conservadora, no tokens medidos por proveedor.

API interna autenticada `/api/cognition-v2`: working, memories, snapshots, references, attention, graph, rag/prepare, slow/cancel y journey. Tenant/actor nunca se aceptan del body. El ACK de delivery es interno, no una afirmación de que el usuario leyó el texto.

## Bloqueos de operación

No activar shared RLS V2, Anam, JEV ni delegaciones reales Cyber para dar por probados los gates. La ontología cromática necesita un recibo de aprobación del fundador. El SDK Cyber sigue privado/UNLICENSED; este trabajo no concede aprobación de distribución ni piloto.

## Rollback sin borrar evidencia

Quitar el tenant de la allowlist, detener workers V2 y conservar journal, inbox, jobs, revisiones, tombstones, snapshots y receipts. Los esquemas nuevos son aditivos. No borrar fuentes para revertir ni restaurar un dato revocado desde una revisión antigua. Volver a V1 solo mantiene continuidad transitoria y requiere que su política de seguridad sea suficiente; no es permiso de eludir una revocación.

M0/M1/M2 locales están construidos parcialmente; canary, migración de datos existentes y retiro completo del legacy siguen pendientes. El adapter V1→V2 conserva conocimiento consumido como activo y restringe visibilidad privada, pero no constituye un backfill ejecutado ni un cutover autorizado.

## Migración RLS explícita (solo Postgres de pruebas por ahora)

`installCognitionRls` en `engine/cognition/v2/rls.ts` se ejecuta después de instalar el esquema, con el propietario de las tablas. No concede roles, no borra datos ni desactiva políticas. El rol de aplicación debe ser NOSUPERUSER NOBYPASSRLS y tener solo DML. Cada operación debe usar una conexión transaccional con SET LOCAL app.tenant_id derivado de identidad autenticada. No usar SET de sesión con pools. La integración del runtime todavía falla cerrada en modo compartido: esta migración aislada no autoriza retirar ese bloqueo.

## Ontología aprobada y recuperación

El runtime V2 instala agntiapro.cards@1.0.0 con la decisión founder-20261116-card-ontology-001 del fundador. Las inferencias no pueden aprobar nuevas versiones. Un registro de revocación en el store autoritativo invalida su uso al proyectar/servir; el bootstrap no lo borra. No habilita JEV externo ni cambia el flag de tenants.

El worker tiene tres bucles independientes: proyección, Slow y recuperación de entregas. Esta última es acotada, utiliza cursor/lease/fence persistentes y valida actor. Las reservas caducadas no reciben ACK automático. Auditoría: cognition_v2_delivery_recoveries. La migración RLS se ejecuta de nuevo explícitamente para incluir esta tabla antes de cualquier validación compartida.
