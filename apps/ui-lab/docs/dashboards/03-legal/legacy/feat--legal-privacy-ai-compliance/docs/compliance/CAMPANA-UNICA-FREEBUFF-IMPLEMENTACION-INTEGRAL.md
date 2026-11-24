# CAMPAÑA ÚNICA FREEBUFF — Compliance, Trust Center, RGPD, AI Act y UX legal AgntiaPro

**ESTADO:** HANDOFF EJECUTABLE. **Una sola campaña, un solo branch de implementación, un solo informe final.** No dividir en 12 campañas ni abrir subramas por cada módulo. Fecha: 2026-11-21.

## 0. ORDEN DIRECTA A FREEBUFF
Implementa de extremo a extremo, en una rama nueva creada desde `feat/legal-privacy-ai-compliance` (ej. `feat/freebuff-compliance-integral`), una experiencia de cumplimiento profesional y coherente con la interfaz real de AgntiaPro. La rama base ya contiene el footer público y cinco páginas HTML **borrador**, además de los documentos 01–09. **No reescribas el core ni dupliques arquitectura.** Trabaja por fases dentro de esta única rama; al terminar cada fase deja commit y reporte breve en el mismo documento de progreso, y continúa salvo bloqueo real. No hagas merge, PR automático, deploy ni cambies secretos, consola Google, DNS o producción. Entrega código, pruebas y un handoff de revisión, no solo documentos.

**Definición de terminado:** el usuario puede encontrar información legal antes del login, ver y gestionar controles de privacidad auténticos en Ajustes, entender permisos de conectores y naturaleza IA, y el owner puede acceder a gobernanza de datos de empresa dentro de sus permisos; la web muestra footer y páginas públicas coherentes; el backend soporta solo las acciones realmente implementadas y seguras. No publicar textos legales incompletos.

## 1. TAXONOMÍA (dominios de código, no campañas)
- **PUB** Web pública: footer, rutas, cinco documentos legales, Trust Center.
- **AUTH** Login/OAuth: enlaces legales, consentimiento/aceptación cuando corresponda, scopes Google.
- **PRIV** Cuenta personal: derechos RGPD, solicitudes, exportación, supresión y estado.
- **TEN** Gobernanza tenant: DPA, subencargados, políticas, roles, exportación autorizada.
- **CON** Conectores: permisos, datos leídos/escritos, desconexión y retención.
- **COO** Cookies/storage: inventario, consentimiento solo si no exentas, preferencias.
- **AIX** Transparencia IA: LAIA, voz, avatar, contenido sintético, aprobaciones.
- **KRN** Backend/kernel: contratos, tenancy, eventos, auditoría, retención, jobs, backups.
- **QA** E2E, seguridad, evidencia y release gate.
- **DOC** Inventarios, decisiones, pendientes del fundador y handoff.

## 2. FASE 0 — RECONOCIMIENTO OBLIGATORIO ANTES DE EDITAR
1. Registrar commit base, branch y árbol; leer `docs/compliance/README.md`, `MATRIZ-REQUISITOS.md`, documentos 01–09, especialmente 07–09.
2. Auditar código real y ramas recientes: `fix/mobile-chat-sheet-keyboard-gestures`, UX, fast chat, cognition, kernel, Anam/ElevenLabs; documentar qué está en main, qué solo está en ramas, y posibles conflictos. **No fusionar ramas ajenas ni copiar implementaciones antiguas.**
3. Inspeccionar `apps/site/index.html` y cómo se despliega; `apps/web/src/App.tsx`, `AppShell.tsx`, `Login.tsx`, `SidebarV2.tsx`, `SettingsMenu.tsx`, CSS, rutas, hooks, stores y patrones de modal/sheet. Confirmar si el sitio y la app comparten origen; probar rutas y no inventar hosts.
4. Inspeccionar `apps/server/src/oauth-login.ts`, `google-auth.ts`, `engine/voice-v2/coordinator.ts`, `kernel/audit/entry.ts`, `engine/events/retention.ts`, backups, RAG/memorias, modelos de tenant, RLS, consentimientos, conectores, logs y worker. Comparar documentación con código.
5. Crear `docs/compliance/reports/FREEBUFF-PROGRESO.md` con SHA, rutas verificadas, riesgos, inventario cookies, proveedores y tablas existentes. No implementar una CMP ni tablas nuevas sin este paso.

## 3. FASE 1 — PUB: WEB PÚBLICA + TRUST CENTER
**Partir del código existente** `apps/site/index.html` (footer responsive ya añadido en la rama base) y `apps/site/{aviso-legal,privacidad,cookies,terminos,transparencia-ia}.html` (borradores noindex).
- Verificar la estructura real de hosting, 200/404 y rutas relativas. Corregir navegación rota, accesibilidad y responsive sin sustituir el diseño de la landing. Footer **no sticky**, borde superior, marca, descripción, enlaces en dos columnas móvil, foco visible.
- Añadir una página pública `/confianza.html` («Confianza y seguridad») o equivalente si hosting/routing lo requiere: índice de privacidad, seguridad, IA, subencargados, derechos, términos comerciales, contacto y versión de políticas. Añadir «Confianza» al footer solo cuando exista página real.
- Convertir borradores en **plantillas legales estructuradas**, sin inventar razón social/NIF/domicilio, DPA, bases legales, retenciones, transferencias ni precios. Los textos con `[PENDIENTE]` deben permanecer `noindex` y señalizados. Crear guard de publicación que bloquee release con placeholders. No presentar contenido como política definitiva.
- Crear índice de documentos con fecha de versión y estado `draft|approved|published`, sin fingir firma o aceptación.
- **Copy footer**: «AgntiaPro» / «Software y servicios de inteligencia artificial para empresas.» / «Aviso legal» / «Privacidad» / «Cookies» / «Términos del servicio» / «Transparencia IA» / «Confianza y seguridad» / «Contacto».
- URLs previstas relativas al sitio: `/aviso-legal.html`, `/privacidad.html`, `/cookies.html`, `/terminos.html`, `/transparencia-ia.html`, `/confianza.html`. No asumir que la app Vite las sirve; resolver URL canónica tras verificar infraestructura.

## 4. FASE 2 — AUTH + UX DE APLICACIÓN
**No colocar footer global en workspaces**: la app tiene shell de pantalla completa y chat sheet móvil; un footer fijo taparía composer, teclado o acciones.
- `apps/web/src/components/Login.tsx`: insertar `LegalLinksInline` en el pie de `.login-card`, visible antes de Google/GitHub OAuth, demo y contraseña. Copy «Consulta nuestra Política de privacidad y los Términos del servicio.» Enlaces «Privacidad», «Términos», «Cookies». No afirmar consentimiento por mero login.
- `apps/web/src/components/SettingsMenu.tsx`: sección nueva entre perfil/empresa y logout con «Privacidad y datos», «Políticas y condiciones», «Transparencia IA» y «Preferencias de cookies» solo cuando exista CMP real. Mantener foco, Escape, backdrop y accesibilidad.
- Crear o adaptar `apps/web/src/components/legal/LegalLinksInline.tsx`, `LegalExternalLink.tsx`, `apps/web/src/config/publicSite.ts`; resolver links por configuración validada, no strings duplicados.
- Crear `apps/web/src/components/privacy/PrivacyDataPanel.tsx`: panel personal con «Mis datos», «Solicitudes», «Conexiones externas», «Políticas». Desktop diálogo o panel de ancho contenido ~640px; móvil sheet/pantalla con scroll propio y safe-area, sin solapar chat, teclado o botones. Respetar estilo existente y evitar doble modal.
- Acciones «Solicitar copia», «Solicitar rectificación», «Solicitar eliminación», «Ver mis solicitudes»: solo activas si hay API funcional y permisos; si no, ofrecer canal manual verificable o estado «Próximamente», nunca confirmaciones falsas.
- Evitar añadir `AppView` de forma innecesaria; integrar mediante patrón existente de navegación/overlays. No romper `SidebarV2` rail/drawer ni estados de chat.

## 5. FASE 3 — COO: COOKIES Y ALMACENAMIENTO
- Auditar cookies de auth, OAuth state, SDK, analytics, tags, localStorage, sessionStorage, terceros y worker. Registrar nombre, proveedor, dominio, propósito, duración, necesidad y activación.
- Si **no** hay cookies no exentas, no crear banner artificial. Política de cookies informativa verificada.
- Si existen: `CookieConsentBanner` y `CookiePreferencesDialog` en la superficie que las usa; bloqueo previo real de scripts opcionales, aceptar/rechazar con visibilidad equivalente, granularidad real, versión de decisión y revocación desde footer/Ajustes. Texto: «Tu privacidad importa»; «Rechazar opcionales» / «Configurar» / «Aceptar opcionales».
- Probar red antes/después de decisión; no equiparar almacenamiento técnico con cookies publicitarias ni pedir consentimiento para cookies estrictamente necesarias.

## 6. FASE 4 — PRIV + KRN: DERECHOS Y RETENCIÓN
- Reusar contratos Zod, rutas, eventos, auth, jobs, permisos y stores actuales. Proponer endpoints solo tras inspeccionar el código; usar tipos `PrivacyRequest`, `DataExportJob`, `ErasurePlan`, `RetentionRule` si no existen equivalentes.
- Solicitudes con identidad y autoridad verificadas, tenant binding, tipo, estado, plazos, evidencia minimizada y respuesta clara; separar datos de cuenta, datos de empresa y datos de terceros. No aceptar `tenantId` arbitrario del cliente.
- Exportar datos permitidos en formato estructurado, enlace protegido/expirable; sin credenciales ni secretos. Rectificación, oposición, limitación y supresión con estados reales y excepciones legales.
- Trazar supresión/retención en Postgres, memorias, RAG, embeddings, archivos, eventos, snapshots, backups y proveedores. Jobs idempotentes, reintentos, receipts; **no prometer borrado global si no se puede garantizar**.
- Revisar `kernel/audit/entry.ts`: hash ≠ anonimización por defecto; auditar linkage y borrado. No borrar evidencia obligatoria indiscriminadamente.
- Si backend de un derecho requiere revisión legal o proveedor no disponible, implementar **solicitud registrada con revisión humana** en lugar de endpoint de borrado ficticio. Documentar limitación.

## 7. FASE 5 — TEN + CON: GOBERNANZA Y CONECTORES
- Crear `TenantGovernancePanel` solo para owner/manager con permiso real: políticas de datos de empresa, subencargados, DPA, retención, exportaciones autorizadas, incidentes y solicitudes; permisos en servidor y tests de aislamiento, no solo ocultar UI.
- Crear `ConnectionPrivacyDetails` por integración activa: proveedor, scopes reales, datos leídos/escritos, finalidad, región verificada, retención conocida, quién autorizó, desconexión y consecuencias. No inventar región ni DPA.
- Revisar Google OAuth: separar login de conectores, mínimo privilegio, scopes y links canónicos para verificación. Desconectar token no equivale a eliminar datos ya procesados; indicar explícitamente.
- Inventariar leads, contactos, WhatsApp y terceros no usuarios; identificar rol responsable/encargado por finalidad, contrato y tenant.
- Mantener compatibilidad con jerarquía multi-tenant futura sin asumir que ya está implementada.

## 8. FASE 6 — AIX: TRANSPARENCIA IA
- Chat LAIA: aviso contextual «Estás conversando con LAIA, un sistema de inteligencia artificial.» en primera interacción cuando corresponda, con información recuperable, no popups repetidos.
- Voz: «Soy LAIA, un asistente de inteligencia artificial.» al inicio cuando corresponda; auditar transcripción, grabación y proveedor antes de describir política.
- Vídeo Anam: «Avatar generado por IA» visible y aviso previo cuando aplique; no afirmar verificación de sandbox/proveedor sin prueba.
- Contenido sintético: etiquetado según canal y obligación aplicable; clasificación AI Act por caso de uso, especialmente RRHH. Aprobaciones humanas para acciones sensibles; no permitir al LLM alterar permisos ni estados de consentimiento.
- Reusar runtime determinista, event bus y permisos actuales; no crear segundo motor de agentes ni inyectar documentos legales completos en prompt fast-LLM. Solo tarjetas pequeñas de disclosure si se necesitan.

## 9. FASE 7 — QA + RELEASE GATE
- Ejecutar pnpm install solo si dependencias justificadas; typecheck, lint, unit, integración, smoke, Playwright mobile/desktop según scripts reales. Reportar comandos y resultados.
- E2E: web legal 200, links footer/login, OAuth sin bloquear, teclado/foco, mobile safe areas, chat sheet no tapado, cookies preconsentimiento, revocación, permisos por rol/tenant, solicitudes idempotentes, conectores y disclosures IA.
- Tests negativos: tenant A no accede a B; empleado no exporta datos de empresa; sin permiso no ejecuta borrado; rechazo de cookies bloquea requests opcionales; no se registran tokens/PII en logs.
- Añadir comprobación de links rotos y placeholders legales en release gate; no bloquear development por placeholders borrador si están noindex y aislados de producción.
- Documentar riesgos P0/P1/P2, no declarar cumplimiento certificado. No merge ni deploy.

## 10. ENTREGABLES ÚNICOS Y RUTAS
**Código esperado (adaptar a estructura existente, no crear duplicados):**
- `apps/site/index.html` y `apps/site/{aviso-legal,privacidad,cookies,terminos,transparencia-ia,confianza}.html`.
- `apps/web/src/components/Login.tsx`, `SettingsMenu.tsx`, `App.tsx`/shell solo si wiring exige; `components/legal/*`, `components/privacy/*`, `components/cookies/*`, `components/ai/*`, `components/integrations/*` según hallazgos.
- Backend: rutas, servicios, stores, jobs y tests en paths coherentes con código existente; **NO crear por duplicado**.
- `docs/compliance/reports/FREEBUFF-PROGRESO.md` y `FREEBUFF-HANDOFF-FINAL.md`; `inventario/{DATOS-Y-FLUJOS,PROVEEDORES-Y-TRANSFERENCIAS,COOKIES-STORAGE,OAUTH-SCOPES,RETENCION-Y-BORRADO,CASOS-USO-IA}.md`; actualizar `MATRIZ-REQUISITOS.md`.

**Formato del reporte final obligatorio:**
1. Rama, base SHA, HEAD SHA, commits por fase.
2. Inventario de archivos nuevos/modificados y wiring real.
3. Funciones terminadas vs stub/manual vs bloqueadas, sin maquillarlas.
4. Tests con comandos, resultados y fallos.
5. Evidencias sin datos personales ni secretos.
6. Conflictos de ramas y decisiones de compatibilidad.
7. Acciones del fundador: identidad legal, contratos, Google Cloud, dominios, proveedores, aprobaciones.
8. Checklist de revisión y pasos de integración sugeridos, **sin ejecutar merge/deploy**.

## 11. NO-GO / REGLAS DE SEGURIDAD
- Prohibido inventar NIF, domicilio, bases jurídicas, transferencias, DPA firmados, certificaciones, consentimiento o eliminación completada.
- Prohibido publicar borradores legales, habilitar rastreadores antes de consentimiento, filtrar datos entre tenants o usar datos reales en tests.
- Prohibido tocar producción, secretos, despliegue, main, permisos Google reales o ramas de terceros.
- Si no existe infraestructura para completar una capacidad de forma segura: implementar un flujo real de solicitud con revisión humana y dejar el resto documentado como pendiente, **nunca UI engañosa**.
- Evitar scope creep: no internacionalización completa, no reescribir branding ni menús, no construir jerarquía fractal tenant, no alterar fast chat/voz salvo disclosures mínimos.
- Al final, detenerse y solicitar revisión del fundador.

## 12. REFERENCIAS DE ESTA MISMA RAMA
- `docs/compliance/README.md` y `MATRIZ-REQUISITOS.md`
- `docs/compliance/01-auditoria-tratamientos-proveedores.md` a `06-verificacion-produccion.md`
- `docs/compliance/07-UX-LEGAL-MAPA-INTERFAZ.md`
- `docs/compliance/08-COPY-LEGAL-UX-Y-LINKS.md`
- `docs/compliance/09-BENCHMARK-ESTANDAR-PRO-OPENAI-META-GEMINI-CLAUDE-GROK.md`
**Estos documentos son material de referencia, NO campañas independientes. Esta CAMPAÑA ÚNICA prevalece como plan de ejecución.**
