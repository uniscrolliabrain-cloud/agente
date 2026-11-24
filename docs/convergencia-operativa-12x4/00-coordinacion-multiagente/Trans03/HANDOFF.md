# HANDOFF Trans03 · Integraciones y middlewares

Lee primero [coordinación común](../README.md), [contrato](../../CONTRATO-TRANSVERSAL.md), [wiring](../../WIRING-INTELIGENCIA-DISTRIBUIDA.md) y [pendientes](../../00-pendientes/README.md). Tu rama es Trans03; destino PR campaign/convergencia-operativa-12x4. No main ni UX/demo.

## Ownership provisional
packages/integrations/**, google-auth.ts, whatsapp-routes.ts, engine/whatsapp-inbound.ts, engine/whatsapp-outbound.ts; adaptadores media/externos y vendor previa reserva. Paths abreviados relativos a apps/server/src salvo packages, scripts, CI y raíz. Antes de editar, registrar lista exacta y confirmar con supervisor; lectura global permitida. No tocar paths de otros agentes, ni siquiera para arreglar tests. Solicitar cambios con diff y prueba.

## Misiones
01 scaffold/docu: Inventariar Evolution y Meta (ambos presentes en outbound), Google OAuth, Composio, Anam, ElevenLabs y upstreams; contratos, scopes y secretos sin valores.

02 coding/audit: Implementar adaptadores existentes y cinco slices Google + WhatsApp; media y Composio gobernados; auditar tarball ciber y gestoría; solicitar dependencias a trans04 y registro a Trans01.

03 reaudit/refactor: Revisar infraestructura de trans04 sin editar; comprobar revocación, duplicación de conectores, timeout ambiguo, egress y permisos. Corrige solo tus propios paths tras recibir auditoría.

04 hardening: Sandbox autorizado, cuotas, firma, replay, conciliación y kill switch; stub fail-closed si faltan cuentas; no enviar ni pagar sin autorización.

## Dependencias
Trans01: capability y SOP; trans02: clasificación y contexto; trans04: lockfile, fixtures y telemetría.

## Primera entrega W0
Inventario por SHA de ramas relevantes, mapa productor/consumidor, paths exactos, conflictos, pruebas existentes y nuevas propuestas, comandos, riesgos, rollback y owner actions. No código funcional hasta aprobación de ownership y contratos. Ejecutar gates disponibles y distinguir NOT_RUN de PASS. Después seguir W1–W5 y barreras del documento común. No cambiar autoridad del kernel, no bloquear Fast con Slow, no confundir persona con permisos.

## Reporte obligatorio
Actualizar BITACORA.md con base/HEAD, fase/pasada/oleada, patchset, paths, solicitudes, comandos y exit codes, evidencia, bloqueos y siguiente tarea. Entregar PR pequeño por oleada, sin auto-merge ni force push. No deploy ni cierre de ramas.


## Instrucción de ejecución vigente (prevalece sobre paradas anteriores)

Lee [PROTOCOLO-TURNOS](../PROTOCOLO-TURNOS.md) y ejecuta [TURNOS.md](TURNOS.md). T01 completo incluye W0 y todo scaffold documental; no parar tras W0. Solo parar en B1–B6 o excepción de seguridad definida. No reportar por chat cada paso, patchset ni oleada. Bitácora y commits son el reporte.
