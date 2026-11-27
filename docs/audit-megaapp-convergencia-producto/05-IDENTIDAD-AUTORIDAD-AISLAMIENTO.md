# Auditoría 05 — Identidad, autoridad y aislamiento transversal
Fecha 2026-11-27. Base documental 855ebb6a185ff38f596598fae41faea5c3857f34; main e496dd43338107f07d48d62d3e0ea03c0e0c6c89. Código de ejecución examinado por SHA: exec/Trans01 dbebaa03053a8b9ada9e323e837f227126b46e7c, exec/Trans02 12a36277d817e9245eb8de308696883b33ceda2a, exec/Trans04 14f1d44d1c1f81f3b6c1a95b0d862ab26e16d443. No afirmar integración ni cierre de las seis campañas. Solo documentación; no pruebas ejecutadas, cambios funcionales, despliegues ni consultas a bases reales. Las certezas son estimaciones de evidencia estática, no probabilidades estadísticas.

## 0. Mandato vigente
UI Lab permanece demo. No promover frontend real antes de compilación empresarial, instalación de capacidades requeridas, APIs/conectores y definición de actores, con consola de ingeniería real previa. No exigir todo el ecosistema para el PMV. Pendientes 7/10 coherencia documental y 5/10 unificación universos demo después de todas las audits. Mantener fuentes raw y las ramas exec intactas.

## 1. Modelo de autoridad objetivo (interpretación, no contrato nuevo)
Separar: identidad de plataforma; membership empresarial; actor humano; persona/agente y revisión de su rol; instancia runtime/servicio; recurso/owner de almacenamiento; delegación a conector; aprobación ligada a efecto/revisión; entorno de ejecución y versión de empresa. Persona visual no es principal. Owner de empresa no es admin de plataforma ni operador técnico. AgntiaPro opera, Tu Empresa propone revisiones y publica con decisión autorizada, Agntia Code construye bajo scopes propios. Engineering UI lee proyecciones autorizadas, no root ni puerta trasera. La separación no exige duplicar identidad o PDP por metaapp. Una cuenta puede pertenecer a varias empresas; el tenant activo no se adivina para efectos. Backend decide identidad desde fuentes confiables, nunca desde avatar, prompt, fixture, localStorage o campo de contexto enviado por modelo.

## 2. Evidencia estática: 14 hallazgos
| ID | Hallazgo | Certeza | Prioridad / interpretación |
|---|---|---:|---|
| A01 | TenantService.resolveStrict cachea DEFAULT_TENANT_ID sin source; en cache hit devuelve source database aun si origen default | 100% | P0: inconsistencia de procedencia; riesgo de admitir solicitud sin membership con caché caliente; no reproducido |
| A02 | ActorService.resolve auto-crea membership cuando membershipsFor devuelve lista vacía; no distingue primer acceso de revocación de última membership | 100% | P0: ruta de alta no debe ser fallback de autenticación; revocación no recreable |
| A03 | tenantClaimOf usa user_metadata editable como último recurso; combinado con A02 amplía confianza más allá de claim administrado | 100% código, 95% riesgo condicionado | P0: verificar proveedor/configuración y eliminar fuente editable para autorización |
| A04 | membershipsFor absorbe fallos del store como []; ActorService puede interpretar fallo como primer acceso | 100% | P0: distinguir indisponibilidad y ausencia; no materializar autoridad en error |
| A05 | hasDurableMemberships escanea hasta 5000 filas y captura errores como []; caller catch(true) no recibe esos errores | 100% | P0: compatibilidad basada en ausencia de filas no prueba empresa legacy; revocar último rol y outage deben cerrar acceso |
| A06 | resolveTenantPrincipal usa membership primaria legacy para sesión; si elección revocada, cae a primaria. Test existente afirma ese comportamiento | 100% | P1: navegación puede pedir nueva selección; una mutación no debe redirigirse a otro tenant silenciosamente |
| A07 | provision-vertical-slice crea usuarios nuevos con role global admin para roles empresariales owner/admin | 100% | P0: rompe separación declarada plataforma/empresa. Contrastado también en exec/Trans04. No probar contra usuarios reales |
| A08 | ActorService colapsa tenant owner/admin y user.role global admin a Actor.roles owner | 100% | P1: conservar dimensiones separadas y verificar políticas consumidoras |
| A09 | app.ts monta authzMiddleware antes de construir ctx; pep.ts guarda authz.ctx null si falta actor/ctx; ctx posterior no actualiza ese valor dentro de middleware | 100% orden, 90% impacto | P1: verificar consumidores reales; no afirmar bypass universal, handlers con checks independientes existen |
| A10 | app.ts importa buildPoliciesFromAgentRole pero instancia PDP con defaultPolicies solamente en ese punto; PolicyEngine.can permite permisos ausentes/vacíos, AgentGovernance fallback y PDP no equivalentes | 100% código local, 90% efecto global | P1: pruebas de política efectiva, no reemplazar PDP por allow-all. Posibles denegaciones indebidas y compat divergente |
| A11 | withRead/withWrite construyen owner tenant:actor y PolicyTarget.ownerId actor.id antes de probar propietario de registro; CAS opcional usa expected {} | 100% local | P1: confirmar uso con Store vs TenantScopedStore, ownership real y revisión; no declarar doble prefijo ni carrera global sin call graph |
| A12 | apiFetch web envía bearer, no fija tenant esperado ni valida X-Tenant-Id en su propio método | 100% local | P1: switch con requests en vuelo, respuesta tardía o sesión cambiada; corroborar otros wrappers antes de afirmar fallo de toda UI |
| A13 | admin-routes requireAdmin usa User.role global; auditCrossTenant best-effort con hash literal cross-audit, no cadena canónica en ese método | 100% | P0 para A07; ingeniería y acceso excepcional requieren alcance y registro durable; no confundir admin legítimo con acceso probado indebido |
| A14 | Cognition V2 exige membership fresca, usuario activo y tenant allowlist; policyRevision=digest(membership), contexto privado y journal scoped; shared RLS explícitamente no certificado | 100% | Fortaleza a conservar; revisar revisión de política más amplia, acceso compartido y revocación en futuras metaapps sin desactivar guards |

## 3. Fuentes comprobables (rutas relativas al SHA indicado)
- A01/A04/A05: exec/Trans01 apps/server/src/engine/tenant.ts:65–89, 100–147, 148–210. Cache no conserva source. removeMembership elimina user-tenants e invalida caché, no elimina registro primario en ese método.
- A02/A08: exec/Trans01 y Trans02 apps/server/src/engine/actors/service.ts:30–80. A03: packages/domain/src/jwt.ts:5–10,40–48; comentario identifica user_metadata editable. JWT middleware firma/aud/iss en engine/auth/jwt.ts; firma no convierte metadato editable en permiso.
- A06: tenant-principal.ts:88–172, tests/tenant-principal.test.ts:81–85. app.ts:653–720 deriva tenant y abre AsyncLocalStorage.
- A07: scripts/provision-vertical-slice.ts:175–226 en Trans01 y Trans04 (role global asignado en 212). engine/authz/tenant-permissions.ts:1–45 define explícitamente diferencia de roles.
- A09: app.ts:591–612 y 693–720; engine/authz/pep.ts. A10: app.ts:330–340, engine/authz/policies.ts, pdp.ts, engine/policy/engine.ts, engine/agents/governance.ts.
- A11: engine/authz/{with-read,with-write}.ts; db-tenant.ts:1–65. Store prefija tenant:owner; wrapper recibe Store estructural. Requiere inventario consumidor.
- A12: apps/web/src/api/client.ts:70–115, auth.ts:27–65. A13: admin-routes.ts:13–35 y 254–261. A14: Trans02 engine/cognition/v2/{runtime,context,human-turns,rls}.ts; cognition-v2-routes.ts. runtime.ts:75 bloquea shared; 82–88 identidad; human-turns.ts:49–153 vincula tenant/actor/thread/run, hashes, revocación y autorización.
- Fortalezas adicionales: tenant-scope.ts AsyncLocalStorage; tenantAccess matriz positiva; app.ts:948–1015 aprobación consulta membership fresca y puede resolver propuesta de otro actor de misma empresa; events/service-principal.ts scope de servicio registrado, no confiar en prefijo. Trans01 tests de approval binding/hash race, claim scope, kernel route scope, service principal, SOP authz, turn identity existen; no se ejecutaron. tests/c05-role-revocation.test.ts verifica aprobación e inbox en caso con otros roles y legacy; no certifica todos los escenarios anteriores.

## 4. Plan posterior de consolidación: reciclar, modificar, crear solo si falta
| Superficie | Reutilizar | Modificar tras reconciliar Trans | Nuevos archivos candidatos, no definitivos |
|---|---|---|---|
| Principal | tenant-principal.ts, tenant-scope.ts, domain/actor.ts | fuente confiable, membership fresca para autoridad, cache solo routing, no fallback de efectos | tests/tenant-principal-revocation-matrix.test.ts |
| Alta/revocación | engine/tenant.ts, actors/service.ts, admin-tenants.ts, scripts/provision-vertical-slice.ts | alta explícita, estado de enrollment/legacy duradero, separar rol global y empresa; migración auditada de cuentas previas | tests/provision-platform-role-isolation.test.ts |
| JWT y session | domain/jwt.ts, engine/auth/jwt.ts, auth.ts | eliminar confianza en editable, bind session/tenant/actor y revisión, fail closed | ampliar tests/jwt-authz.test.ts |
| Decisión | tenant-permissions, PDP, PEP, governance, PolicyEngine | una semántica efectiva de autorización; PEP después de principal, verificar owner real, política versionada, no RBAC extra por UI | tests/authz-composition.test.ts si no hay equivalente |
| Efectos | Trans01 runner, approvals, claims, SOP, receipt | aprobar revisión y payload exactos; no bypass por workspace o build | ampliar tests existentes |
| Cognición | Trans02 HumanTurnJournal, ContextServingFacade, projection/attention | no degradar privacidad; evidencia, revisión/purpose/revocación; diferenciar compartir y autorización | ampliar tests/cognition-v2-security-context.test.ts |
| Proveedores | Trans03 Google/WhatsApp y child SDK cyber | consent, scope tenant/actor/provider, server-held credentials, revocación y receipts | tests por integración y contrato |
| UI futura | web/api/client.ts, auth hooks, ViewEnvelope, componentes UI Lab | transporte fija tenant esperado en operaciones, descarta respuesta de contexto viejo, limpia caches/stream; roles visuales no autoridad | adaptadores por metaapp solo tras gates 04 |
| Ingeniería | kernel-routes, events-routes, metrics, audit/receipt | lectura autorizada y redactada; operador con alcance explícito; trazabilidad de acceso, no token scrape en browser | consola plan 04; no segundo motor de authz |

No ejecutar aquí. No cambiar kernel por cliente. No crear una matriz paralela de 3 aplicaciones. Revisar si Trans01/02/03/04 ya cubren cada patch en SHA integrado; asociar a bloque existente antes de proponer campaña adicional.

## 5. Pruebas negativas y gates de certificación (propuestas)
- Cold/warm cache sin membership, DB caída, legacy vs tenant con historial de memberships, revocar última fila, reiniciar proceso, segundo proceso con cache antiguo; sin recuperación de autoridad implícita.
- Token firmado con fuente editable no crea autoridad; invitación explícita y claims administrados, expiración, issuer/audience, sesión revocada. Nunca probar con identidad de usuario real.
- Tenant owner/admin nuevo no obtiene rol global; operador plataforma con scope limitado; comprobar rutas de admin, build apply y auditoría, sin realizar operaciones reales.
- Dos empresas A/B, mismo humano en ambas, dos humanos por empresa; cambiar sesión con mutación en vuelo, rechazar tenant obsoleto y descartar respuesta tardía. No renombrar ACME ni migrar datos sin revisión.
- Dos roles agente diferentes, allowedTools vacías/no declaradas, revisión de permisos, recurso ajeno, efecto revocado antes de dispatch, aprobación ligada a payload/target/version, idempotencia y outcome unknown.
- Datos V2 privados, evidencias revocadas, thread ajeno, snapshot invalidado, provider egress no autorizado, revocación durante streaming/worker. No presentar contenido privado en consola.
- Ingeniería: observar decisión denegada, código de motivo, correlación, receipt y actor/tenant/entorno autorizado; verificar que no contiene secretos, raw prompts, datos ajenos ni cadena privada de razonamiento.
- RLS: probar rol de aplicación restringido en Postgres real de staging, transacciones concurrentes y pool, no propietario/superusuario; no habilitar MULTI_TENANT_SHARED antes de certificar. PMV single-tenant aislado no equivale a RLS compartida.
- Validar contra main y SHA integrado; ejecutar tests unit, HTTP y E2E con fixtures y proveedor sandbox autorizado, preservar regresión. No se han ejecutado estas pruebas.

## 6. Conclusión y límites
La prioridad no es añadir login nuevo sino reconciliar autoridad histórica con contratos endurecidos de las campañas. Los problemas A01–A05, A07 son bloqueantes candidatos para exposición multiempresa, no declaración de explotación ni certificación de producción. La evaluación de rutas completas, consumers de withRead/withWrite, permisos de provider y DB real queda pendiente. No se examinó exhaustivamente todo el repo ni repos hijos; no se consultaron secretos. Auditoría 06 continuará observabilidad y evolución empresarial, sin adelantar integración de UI cliente. Mantener backlog 03 y mandato 04.
