# Auditoría 03 — Extensibilidad
Método: árboles main completos no truncados de 17 hermanos, cabeceras README, manifiestos y símbolos seleccionados. SHA de árbol devuelto por API (no confundir con commit). Padre integration 9650aac71abcceef308681ab49a381d20e7584ff. No tests nuevos, no instalación ni cambios de hijos. Estados de tests de README son declaraciones históricas, no certificación.
| Repo | SHA árbol | blobs | Estado observado/declarado |
|---|---|---:|---|
| agntia-video | 0af2c5bb442e3c9fc55d7fc6d9455b3d571a8ff7 |96| Python/FFmpeg + SDK TS/Hono, MVP declarado, tests presentes |
| agntia-gestoria | ea8e1b536b66ae501ddb1ce3f3be41a4f184f503 |458| Python, SQLite, cliente TS, fiscal/RRHH/Odoo, tests presentes |
| agntia-ciberseguridad |424c8e23c73fca45a005d1f5b065678d2cda02ca|819| FastAPI + SDK alpha.3, laboratorio, producción false |
| agntia-formacion |9c0b7ede0011245edf4ee41f54e38413136fca3d|179| README documentación solamente |
| agntia-redes |7940e97ee857580d686b2047fc371dc9820d2450|282| librería Hono e instalador, clon probado según informe |
| agntia-clientes |8472ea9a5f5b94d753d5a9cafeeeae5d00f8db9d|348| skeleton, HostPort HTTP, 114 tests y PG declarados |
| agntia-marketing |a13ecfa5267b2b9c992d7223815040977a272b1b|332| 23 DONE/15 PARTIAL/4 BLOCKED declarados, PG y outbox, persistencia parcial |
| agntia-ventas |dc5d2f38f7f99422b5c82e3b1718862207b5827f|297| README histórico contradice árbol: 83 archivos TS/PY/TSX fuera docs/vendor; bridge implementado |
| agntia-branding |534dc9e515b08e1102dedba3b80ecf18e101d54c|261| siete tarballs, 131 tests declarados, P0 HTTP, proveedores pendientes |
| agntia-finanzas |193faf1690d2741134e31b18895d3431a1a79445|216| fundaciones C01–05, catálogo vacío según README |
| agntia-legal |5fb797631371d34a2521dbb45b7f042776efd210|289| 16 implemented/24 partial/2 stubbed declarados, RLS PGlite |
| agntia-seguros |82ef41a61fa41215c5b3be3cd6e3ec11fd04a8f0|253| README obsoleto: 42 archivos TS/PY/TSX fuera docs/vendor; API real acotada |
| agntia-dise-o |f976a56376cf6d740090b06eea0e7b56705f22e8|154| documentación según README |
| agntia-comunicacion |439b5942c0e69f19a8663651daefa44267ad9c76|156| documentación según README |
| agntia-iadev |67b6671b0aff8b40e2710535cde0ea6601f337cf|1562| Python ingestion/navigation + TS client, 17 archivos código, README vacío |
| agntiapro-acme |8637e8925dd57351e9e93af8dae79aa3b2163314|11| diseño productor sintético, no segundo runtime |
| agntia-iamotion |28db56fdb9bf522582bf484debee1bba7d29feba|418| documentación y fábrica visual en preparación, workflow/scripts mjs; no motor TS/Python |
## Modelos de extensión
1. Workspace interno: packages/workspaces/01…34 y acme-clientes/obras/suministros contienen declaraciones. packages/workspaces/src/contracts/capability-declaration.ts traduce al CapabilityContract; engine/workspaces/bridge.ts; app.ts 320–354 registra módulos y capabilities en AgentService. Registry global y tenant cache existen; no equivalen a proveedor real. 
2. Servicio especialista externo Python + SDK TS server-only: video, gestoría, cyber. No fusionar runtimes ni instalar Python mediante pnpm.
3. Librería/middleware Hono: redes, branding y otros paquetes; instalación vendorizada o cliente HTTP según diseño. No confundir instalación con autorización o disponibilidad.
4. SaaS especialista con twins vinculados: identidad canónica en padre, mandato/AuthorityMap, membresía local y efectos propios delimitados. Supabase JWT aparece en diseños hijos; reconciliar con principal real del padre, no asumir identidad interoperable.
5. Productores auxiliares: ACME (ingesta sintética por rutas reales, seed/run/correlation, no autoridad); IADev (pyproject agntia-iadev-knowledge 0.1.0, API opcional FastAPI, CLI iadev); IAMotion (fase 1 assets y comportamientos; fase 2 reservada). No son departamentos empresariales equivalentes.
## Cyber como caso real
Padre package.json dependencia file:vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz; hijo typescript/package.json alpha.3, exports client/hono/agent-tools. Diferencia de versión cierta, compatibilidad no verificada. C13/C14 documentos históricos; implementación real en engine/security-v2, no ruta propuesta integrations/cybersecurity. sdk-adapter.ts 21–44 valida identidad/grant antes y después, consume delegación única, minimiza resultado y rechaza garantía. capabilities.ts 3–20 tres lecturas nominadas con efecto delegation.consume, inputs cerrados, no registro automático. event-relay.ts 37–94 verifica tenant/secuencia/hash, transacción local antes ACK remoto, recupera ACK perdido. tests/cognition-v2-cyber-bridge.test.ts usa SDK real con fetch simulado y store local; prueba rechazo cross-tenant y rollback/dedupe. No se encontró composición de bridge en app.ts/service.ts inspeccionados, no afirmar ausencia universal. Hijo docs/release/status.json production_enabled=false, 2/42 PASS, 40 PARTIAL, 80/294 tareas PASS, 214 PARTIAL. Revisión y aceptación pendientes.
## Otros casos
Redes docs/operations/INSTALACION.md: instalador con preflight SHA 9c4c309, tarball, redes-host.ts, verify-redes-install.ts, bloque index.ts REDES_ENABLED=1, reversión; ensayo declarado sobre clon, no padre actual. No aplicar allow-other-ref sin nueva auditoría. Ventas packages/sales/src/bridge.ts mapToParentEvent: cuatro tipos cerrados, filtro de claves sensibles, límite payload; BRIDGE_STATUS transport/parentAck NOT_VERIFIED. Seguros apps/api/src/app.ts createApp: health, me, lectura ACL, preview dryRun, scope contrastado con principal; intents bloqueados explícitamente. No confundir scaffold con ejecución aseguradora.
IAMotion workflow import-visual-library.yml: checkout main/ui-lab/ui-lab-pro, inventario, staging, commit pending-review, recibo. No se ejecutó ni se verificó resultado en este turno; existencia de workflow no certifica importación. README declara fase 1 única activa.
## Riesgos y certeza
99% diferencia SDK cyber; 99% contradicción README seguros/ventas con código main; 99% bridge ventas transporte no verificado; 95% wiring cyber no acreditado en composición inspeccionada; 99% redes instalador ligado a baseline documental distinto. No extrapolar a vulnerabilidades o código muerto. Registry global register sobrescribe por ID (registry.ts); colisiones posibles si no hay namespace/validación superior, impacto no auditado.
## Criterio de instalación recomendado (no ejecución)
Fijar SHA y artefacto/digest; verificar contrato y versión; resolver identidad/mandato desde servidor; declarar capacidades, efectos, aprobación, presupuesto y conciliación; montar adaptador con flag deny-by-default; validar outbox/inbox/ACK, revocación, observabilidad y serving; probar vertical sintética y rollback; habilitar proveedor solo tras aceptación. No importar tools arbitrarias ni duplicar kernel. No convertir catálogo de 34 workspaces o 42 campañas por hijo en porcentaje de producción.
## Pendientes
Lectura íntegra de contratos de cada hijo y ramas de fábrica, inventario de dependencias transitivas, pruebas reales y búsqueda exhaustiva de consumidores. No hay certificación independiente de ningún hijo en este turno. Auditoría 07 reconciliará ontologías y envelopes. No se modificó código.
