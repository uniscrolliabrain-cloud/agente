# Benchmark de cumplimiento UX: OpenAI, Meta, Gemini, Claude y Grok
Fecha: 2026-11-21. Estado: investigación y propuesta; no equivale a certificación legal ni a auditoría exhaustiva de los flujos privados de cada producto.

## Fuentes oficiales verificadas
- OpenAI Legal: https://openai.com/policies/
- OpenAI Privacy Portal: https://privacy.openai.com/
- OpenAI EU Privacy Policy: https://openai.com/policies/eu-privacy-policy/revisions/2026-04-01/
- OpenAI Cookies (actualización 2026-11-19): https://openai.com/policies/cookie-policy/
- Gemini Apps Privacy Hub: https://support.google.com/gemini/answer/13594961
- Anthropic Legal Center: https://www.anthropic.com/legal
- Meta AI transparency: https://ai.meta.com/responsible-ai/
- Meta Privacy Policy 2026: https://storage.googleapis.com/transparency_hub_documents/675211559efd527760c64413/privacy_policy/1787558446.pdf
- Meta privacy engineering: https://engineering.fb.com/2025/10/23/security/scaling-privacy-infrastructure-for-genai-product-innovation/
- Grok/xAI Legal: https://x.ai/legal
- Grok privacy: https://x.ai/legal/privacy-policy

## Benchmark verificado: patrones, no copias
### OpenAI / ChatGPT
- Centro legal estructurado: privacidad, cookies, términos consumer/business, DPA, conectores, políticas de uso.
- Portal de privacidad con acciones y separación expresa de usuarios individuales y clientes business.
- Controles de datos: exportación, eliminación, configuración de entrenamiento/memoria según producto, conversaciones temporales.
- Política de cookies técnica y tabulada (nombre, dominio, duración, finalidad).
**Adaptación**: centro de privacidad individual y consola de gobernanza del tenant, sin mezclar responsabilidades del responsable/encargado.

### Google / Gemini
- Privacy Hub específico para Gemini, además de política Google general.
- Documenta categorías de prompts, ficheros, Live audio/vídeo, datos de apps conectadas, datos de dispositivo y retención.
- Permisos granulares en acciones («Don't allow», «Allow once», «Allow for this chat», «Always allow»), y gestión de Connected Apps.
- Aclara que desconectar una app no implica necesariamente eliminar datos ya procesados en otra.
**Adaptación**: pantalla por conector con scopes, flujo de datos, tercero, revocación y persistencia; no prometer eliminación global al desconectar.

### Anthropic / Claude
- Legal center con términos consumer/commercial separados, DPA, cookie policy, privacy policy, non-user privacy policy, service-specific terms, trust/compliance resources.
- Documentos con fecha de vigencia y alcance del producto.
**Adaptación**: documentos B2B y protección de terceros no usuarios (clientes, leads, proveedores de tenants), versionado y DPA.

### Meta
- Política con ejemplos y controles vinculados a ajustes.
- Transparencia contextual al comenzar funciones generativas; etiquetado de contenido IA y documentación de voz.
- Ingeniería de privacidad: linaje de datos y controles automáticos a escala (fuente técnica, no evidencia de toda su implementación).
**Adaptación**: disclosures específicos por chat, voz, vídeo, canal; registro de procedencia de datos y clasificación.

### Grok / xAI
- Portal legal, políticas por producto y región, Privacy Portal, modos de conversación privada y explicaciones de retención/eliminación.
**Adaptación**: modos de sesión con semántica de retención verificable; nunca prometer «no se guarda» sin controlar eventos, proveedores, backups y logs.

## Estándar profesional objetivo AgntiaPro (prioridad)
P0 — antes de publicar:
1. Identidad legal completa, aviso legal, privacidad, cookies verificadas, términos comerciales, DPA y transparencia IA; versión y fecha de entrada en vigor, idiomas es/en/fr con revisión humana.
2. Footer público y enlaces desde login antes de OAuth; rutas reales verificadas y HTTPS. El footer y páginas borrador existen en esta rama, pero NO deben desplegarse sin revisión.
3. Política de cookies basada en escaneo de cookies, localStorage, terceros, pixels, SDK y tags. CMP solo si hay categorías no exentas.
4. Inventario de tratamientos y subencargados (Neon, Vercel, Fly, Google, Meta, Anam, ElevenLabs y los proveedores efectivamente activados); datos alojados, región, finalidad, DPA y transferencias.
5. Aviso IA en primera interacción y en voz/vídeo; no afirmar que audio no se graba sin validar proveedor y flujos.
6. Canal efectivo de derechos y solicitudes con SLA, autenticación, identidad, estado y evidencia; separar cuentas personales, datos de tenant y datos de terceros.
7. Google OAuth verification: enlaces canónicos, scopes mínimos y demostración de uso de datos conforme a políticas Google.

P1 — primera versión operativa:
8. Privacy Center en `SettingsMenu.tsx`: mis datos, solicitudes, conectores, preferencias de IA, retención visible y centro legal.
9. Tenant Governance Center (owner/manager autorizado): políticas, DPA, subencargados, exportación de empresa, retención, incidentes y autorizaciones; autorización backend/RLS.
10. Conector por conector: scopes, quién autoriza, qué datos lee/escribe, tercero, región, logs, desconectar y consecuencias de desconectar.
11. Registro de aceptación de términos versionado (solo si el mecanismo de aceptación es válido) separado del consentimiento para cookies o marketing.
12. Datos externos: transparencia para terceros no usuarios, especial atención a leads, contactos y mensajes WhatsApp.

P2 — madurez:
13. Data lineage y mapa de tratamiento desde entrada -> evento -> memoria/RAG -> modelo/proveedor -> salida -> backup; catálogo por tenant y finalidad.
14. Consent ledger y audit trail append-only con minimización, retención y manejo de supresión sin falsa anonimización por hash.
15. Evaluaciones de impacto cuando correspondan, clasificación de riesgo por uso y registros de supervisión humana.
16. Auditorías E2E de derechos, consentimiento, retención, aislamiento tenant y disclosures, con release gate automatizado.
17. Historial de políticas y cambios, fecha de vigencia y notificación material al usuario.

## Wireframes funcionales, exactitud por superficie
- `apps/site/index.html`: footer implementado, enlaces a cinco páginas borrador. No footer sticky.
- `apps/web/src/components/Login.tsx`: microfooter con links privacidad/términos/cookies antes de OAuth; nunca consentimiento forzado por navegar.
- `apps/web/src/components/SettingsMenu.tsx`: nuevo grupo «Privacidad y datos» y «Políticas y condiciones», con panel propio; mantener salida de sesión abajo.
- `apps/web/src/components/privacy/PrivacyDataPanel.tsx`: pantalla personal con solicitudes reales, conectores y ajustes; crear en campaña posterior.
- `apps/web/src/components/privacy/TenantGovernancePanel.tsx`: solo roles autorizados, centro de mando/administración, permisos server-side.
- `apps/web/src/components/integrations/ConnectionPrivacyDetails.tsx`: ficha de permisos y datos por conector, antes de conectar y después.
- `apps/web/src/components/ai/AIDisclosure.tsx`: etiqueta contextual de LAIA, voz, avatar y contenido sintético.
- `apps/web/src/components/cookies/CookieConsentBanner.tsx`: solo cuando inventario confirme cookies no exentas; rechazo simétrico y bloqueo previo de scripts.
- `apps/server/src/.../privacy`: definir endpoints a partir de rutas y contratos existentes tras auditar; no inventar nombres definitivos.

## Modelo de datos propuesto (conceptual, sujeto a arquitectura existente)
- policy_version: document_key, locale, version, effective_at, hash, publication_status.
- policy_acceptance: principal_id, tenant_id?, policy_version_id, accepted_at, method, evidence_ref.
- privacy_request: request_id, subject_id?, tenant_id?, request_type, requester_role, status, verified_at, deadline_at, resolution, evidence_ref.
- integration_disclosure: provider, connector, scopes, categories, purposes, region, retention, subprocessors, revision.
- consent_event: subject_id?, tenant_id?, purpose, choice, source, policy_version, timestamp, revocation_at.
- data_inventory: dataset, owner, processor_role, origin, purpose, storage, region, retention_rule, erasure_strategy.
No asumir que todas estas tablas son nuevas: mapear a stores actuales y evitar duplicaciones.

## Campañas adicionales a las seis originales
- C07 Benchmark-to-UX: aterrizar privacy center y enlaces en login/ajustes; comparar ramas recientes y actualizar spec de UI.
- C08 Conectores y permisos: fichas por conector, Google OAuth, revocación, privacidad de proveedores.
- C09 Datos de terceros y tenants: roles responsable/encargado, datos de leads, contratos, políticas de empresa.
- C10 Data lineage y derechos: exportación/borrado con cascada verificable en memoria, RAG, eventos, backups y proveedores.
- C11 Trust & Compliance Center: centro legal versionado, DPA, subencargados, seguridad, evidencias, idiomas.
- C12 Verificación: tests Playwright + server + contract, auditoría de cookie network requests y bloqueos de release.

## Criterios de aceptación
- Cada promesa legal enlaza con evidencia técnica; no publicar claims sin comprobación.
- Ningún borrado, revocación o consentimiento se declara completado si API/provider no confirma.
- Los datos del tenant A jamás se exponen al tenant B.
- Links públicos responden 200 y son accesibles antes de login.
- Idioma preferido del usuario persistente > idioma navegador > país/IP como fallback; jamás IP como único criterio.
- El owner puede gestionar gobernanza sin acceder indebidamente a información privada de terceros.
- Release bloqueado con `[PENDIENTE]` o borradores en páginas legales definitivas.
- Comparar rama de chat móvil actual antes de implementar overlays o footers en app.

## Limitaciones
Se compararon páginas oficiales y políticas públicas, no se hizo inspección interactiva de cuentas autenticadas ni evaluación legal externa. La propuesta combina prácticas observadas con diseño recomendado para AgntiaPro; no atribuir cada feature propuesto a todas las compañías.
