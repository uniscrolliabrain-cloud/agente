# Campaña maestra de convergencia operativa 12×4

Base inicial: main@12e535a264d0c4a5da17d7b049e04c82cbcc681c. Estado: PRELIMINAR; no ejecución ni cierre acreditado.

Objetivo: compilar y operar AgntiaPro real sobre su propio sistema. Cuatro pasadas completas en orden 01→04; cada pasada recorre las doce fases 01→12. Gates por bloque y por pasada. No confundir 48 bloques con 48 ramas: una rama canónica, commits trazables. UX y agntia-demo excluidos.

- [Consolidación transversal](01-consolidacion/README.md): Reconciliar C00–C06 y ramas backend, legal, comunicaciones y documentación. Resolver fallo CopilotKit chat undefined, cancelación C04, ownership de receipts, Postgres real y P03b. Inventariar rutas LIVE_V2/LIVE_LEGACY/SHADOW; preservar referencias y rollback.
- [Observabilidad integral](02-observabilidad/README.md): Instrumentar OpenTelemetry SDK, propagación W3C, métricas y trazas kernel, fast/slow, bus, grafo, memorias, workers, SOP, API, web y DB. Exportar OTLP a Grafana; logs estructurados con redacción.
- [Activación cognitiva y conectores](03-proveedores/README.md): Fast y Slow independientes; JEV clasificación semántica con egress; ElevenLabs STT/TTS y Anam avatar; Composio como registro de capacidades OAuth gobernadas. Adaptadores live/stub y kill switches.
- [Vertical slice WhatsApp](04-whatsapp/README.md): Webhook autenticado, dedupe, contacto, hilo, recepción, clasificación, respuesta aprobada, entrega y estado; plantillas y ventana de conversación según proveedor.
- [Vertical slices Google](05-google/README.md): OAuth incremental; Maps búsqueda empresarial autorizada, Calendar disponibilidad y agenda, Drive archivos, Gmail lectura/respuesta, Docs creación/edición. Identidad y scopes por tenant; adapter único por capability.
- [Repositorio de datos sintéticos](06-data-sintetica/README.md): Identificar repo y licencia, fijar SHA, adaptar generadores al esquema canónico; fixtures deterministas desde fase 01; instalación completa aquí. Separar demo, test y producción.
- [Owner real AgntiaPro](07-owner-real/README.md): Provisionar tenant real, owner, usuarios, roles, dominios, políticas, cuentas y memorias; no reutilizar agntia-demo como identidad real.
- [Middleware ciberseguridad](08-ciberseguridad/README.md): Identificar repo propio, fijar versión, auditar licencias/dependencias, instalar como capacidades gobernadas. Auditoría pasiva por defecto; alcance explícito para pruebas activas.
- [Observabilidad de operación real](09-observabilidad-v2/README.md): Ampliar instrumentación a proveedores, OAuth, WhatsApp, Google, seguridad, costes y outcomes empresariales; dashboards y alertas con runbooks.
- [Middleware gestoría](10-gestoria/README.md): Identificar repo propio, contratos y dependencias; instalar adaptador administrativo/contable/fiscal/financiero; conciliación, facturas y documentos con aprobación.
- [Recompilación de dominios y SOPs](11-recompilacion/README.md): Recontextualizar AgntiaPro con hechos reales, capacidades instaladas, roles, memorias, SOPs versionados y dependencias. Actualizar SOP mínimo en cada fase previa.
- [Validación operativa y release](12-validacion/README.md): Ejecutar jornadas empresariales reproducibles y luego dogfooding autorizado; comprobar recuperación, costes, seguridad, latencia y coherencia; cerrar ramas restantes tras reconciliación.

[Pendientes](00-pendientes/README.md) · [Invariantes](CONTRATO-TRANSVERSAL.md) · [Handoff](HANDOFF.md)

- 01-scaffold-docu: Inventario, contratos, ADR, threat model, scaffolds compilables, fixtures y tests de contrato. Determinar paths exactos, dependencias y secretos; no activar proveedores.
- 02-coding-audit-transversal: Implementar código completo y wiring, migraciones compatibles, tests unitarios/integración/E2E, revisar productores y consumidores de todos los contratos. Validar cada slice y auditar efectos cruzados.
- 03-reaudit-refactoring: Auditor independiente del autor: repetir gates sobre SHA exacto, buscar duplicidad, dead code, carreras, fallos de recuperación y divergencias. Refactorizar con tests de regresión y comparar antes/después.
- 04-reaudit-hardening: Reauditar después del refactor, fault injection, carga, seguridad, revocación, aislamiento, backups, rollback y SLO. Evidencia reproducible y GO/NO-GO explícito.