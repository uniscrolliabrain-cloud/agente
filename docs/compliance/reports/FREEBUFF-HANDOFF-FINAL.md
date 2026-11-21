# Freebuff. Handoff para revisión

**Rama local** `feat/freebuff-compliance-integral`
**Base** `de924e09b145348c3aed64f85fb03a8a7687e3aa` de `feat/legal-privacy-ai-compliance`
**HEAD de implementación y QA** `5702d3639b58c5afb521ece5f735671b9b69e194`. El commit siguiente incorpora este informe. Para comprobar el SHA que lo contiene, ejecutar `git log -1 --format=%H -- docs/compliance/reports/FREEBUFF-HANDOFF-FINAL.md`.

| Fase | Commit | Resultado |
|---|---|---|
| 0 | `90272f5` | Reconocimiento de arquitectura, hosting, auth, datos, ramas y riesgos |
| 1 | `390f624` | Navegación, versiones y centro de confianza |
| 2 | `964be64` | Login, ajustes y diálogo de privacidad |
| 3 | `ee2109b` | Inventario y aviso de cookies |
| 4 | `da56f78` | Registro personal, revisión humana y mapa de retención |
| 5 | `d539ec0` | Gobernanza con permiso vigente y fichas de conectores |
| 6 | `9ed3ac9` | Avisos en chat y dictado |
| 7 | `e6dc2ee`, `5702d36` | Pruebas HTTP y navegador, gate, matriz y restauración de foco al control de Ajustes |

## Funciones y estado

| Superficie | Disponible en la rama | Pendiente |
|---|---|---|
| Sitio Vercel | Landing, seis documentos enlazados, navegación relativa, fecha y estado, y protección de release | Aprobación y publicación coordinada de documentos. La página de privacidad en el sitio público actual devolvió 404 |
| App Fly/Vite | Enlaces legales en login y Ajustes; diálogo con scroll y foco; políticas disponibles antes de autenticar en la build local apuntando al sitio local | Revalidar origen y enlaces junto con la futura publicación legal |
| Cuenta personal | Listado y creación de seis tipos de solicitud. Autenticación, cuenta activa, contexto tenant y usuario verificados. Referencia UUID, confirmación de registro, idempotencia con la misma referencia y revisión manual | Definir canal y responsables. Verificar identidad y alcance antes de responder. Automatización de exportación, plazos, oposición efectiva, rectificación y supresión pendientes |
| Operador | CLI sobre Store con listado por tenant y estados recibido, en revisión y respondido. Transiciones con compare-and-swap | Listados limitados a 1.000 registros; acordar volumen, acceso, gestión de plazos y evidencias antes de operar. Guardar la respuesta y su justificante en el sistema aprobado |
| Empresa | Endpoint y panel para membership vigente con `tenant.admin`. En la matriz actual solo owner tiene ese permiso | Contrato DPA, política de retención, subencargados, exportación corporativa, incidentes y solicitudes corporativas requieren circuito operativo aprobado |
| Google Workspace | Ficha con scopes concedidos, atribución cuando está registrada, desconexión y enlace de revocación. Conserva el control en Mi perfil y lo comparte con Privacidad | Validar consola y operaciones de scopes amplios. Simulación HTTP en pruebas. Revocación de proveedor debe confirmarse si falla la API |
| WhatsApp | Su vista muestra proveedor, datos leídos/escritos y revisión de envíos cuando la conexión está habilitada | Confirmar autorizante, permisos, región, revocación y retención con responsables de Meta/Evolution |
| Cookies | Inventario técnico y aviso. Prueba inicial sin cookies de la app antes del login. La app solicita tipografías de Google y se registró el intento de red durante la prueba | Infraestructura y tratamiento de recursos externos por revisar. No se observó una categoría opcional que justifique una CMP en el código auditado |
| IA | Aviso visible antes de la primera interacción y recuperable en chat completo, dock y sheet. Dictado identificado como Web Speech | Aviso hablado en telefonía y validación del primer turno en el canal real. Anam/ElevenLabs, marcado en canales externos y evaluación por caso de uso, en particular RRHH |
| Publicación | Gate de desarrollo permite borradores señalizados y comprueba enlaces. Gate de release exige estado publicado y ausencia de pendientes y noindex | Desbloquear tras revisión explícita y verificación de infraestructura |

## Archivos y wiring

- **Sitio** `apps/site/{index,aviso-legal,privacidad,cookies,terminos,transparencia-ia,confianza}.html`. La landing enlaza los documentos directamente. Confianza indexa versiones y estados. Los seis documentos se mantienen como borradores.
- **App y estilos** `apps/web/src/{App.tsx,index.css,config/publicSite.ts}` y `components/{Login,SettingsMenu,ProfileModal,ChatPanel,SidebarChat,ChatInput,WhatsAppView}.tsx`. El origen público se configura con `VITE_PUBLIC_SITE_URL`, que acepta HTTPS o HTTP local. Ajustes oculta su menú mientras el diálogo está abierto y restaura el foco al volver.
- **Componentes** `apps/web/src/components/legal/{LegalExternalLink,LegalLinksInline}.tsx`, `privacy/{PrivacyDataPanel,PrivacyRequests,TenantGovernancePanel}.tsx`, `integrations/{GoogleConnections,ConnectionPrivacyDetails}.tsx` y `ai/AIDisclosure.tsx`. `apps/web/src/api/google.ts` recibe el dato adicional de atribución.
- **API y dominio** `apps/server/src/{app,privacy-routes,tenant-governance-routes,google-auth}.ts`, `apps/server/src/kernel/audit/entry.ts`, `packages/domain/src/privacy.ts` y `scripts/privacy-review.ts`. `app.ts` monta `/api/privacy/requests` y `/api/privacy/governance` bajo autenticación existente. Las solicitudes se guardan en `records` con el Store scoped y sin texto libre. El operador reutiliza el mismo Store. El cambio de auditoría corrige la interpretación de los hashes.
- **Pruebas y gate** `tests/{tenant-http-e2e,vertical-slice-google-connection}.test.ts`, `apps/worker/tests/legal-web.mjs`, `scripts/{check-legal-site.mjs,release-check.ts}` y `.github/workflows/{ci,deploy}.yml`. Se conecta la comprobación legal al gate existente. No se ejecutó ningún flujo de despliegue.
- **Documentación** `docs/compliance/MATRIZ-REQUISITOS.md`, `reports/{FREEBUFF-PROGRESO,FREEBUFF-HANDOFF-FINAL}.md` y seis inventarios en `docs/compliance/inventario/` sobre datos, proveedores, almacenamiento, OAuth, retención y casos de IA. Los anexos 01–09 sirvieron de referencia.

## Pruebas y evidencia

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile --store-dir /tmp/freebuff-pnpm-store` | Instalación sin cambiar el lockfile |
| `pnpm typecheck` y `pnpm --filter @agente/web typecheck` | Server, worker y web aprobados |
| `pnpm --filter @agente/web build` | Aprobado. Avisos de anotaciones upstream, chunk superior a 500 kB y una importación dinámica que comparte módulo con importación estática |
| `node --import tsx scripts/audits/coherence.ts` | 7/7 comprobaciones aprobadas |
| `ALLOW_NETWORK=0 node --import tsx scripts/verify-vertical-slice.ts --only smoke` | Smoke aprobado. Health 200, anónimo 401, login y sesión 200 |
| `ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/tenant-http-e2e.test.ts tests/oauth.test.ts tests/vertical-slice-google-connection.test.ts` | Tres archivos aprobados con Node 22. Las pruebas nuevas cubren cuenta inactiva, recibo sin PII, reintentos concurrentes 200/201, tipo incompatible 409, tenant ajeno, ausencia de borrado y revocación del rol |
| `ALLOW_NETWORK=0 CHROMIUM_PATH=/usr/bin/chromium node --import tsx --import ./tests/setup.ts apps/worker/tests/legal-web.mjs` | Chromium 1280×720 y Pixel 7 emulado 412×839. Rutas legales 200, ruta inexistente 404, login, foco, Escape, vuelta al chat, registro 201 y relectura de la referencia, owner autorizado |
| `node scripts/check-legal-site.mjs` / `node scripts/check-legal-site.mjs --release` | Siete HTML verificados en desarrollo. Release devuelve 1 y señala los seis documentos pendientes |
| `pnpm lint` | Falló por deuda global. 1.806 errores frente a 1.809 en el árbol base con el mismo Biome. El chequeo focalizado del código nuevo quedó verde |
| `node --import tsx scripts/privacy-review.ts <tenant> list\|start\|answer` | PGlite temporal con un registro sintético. Listado y transiciones recibido → en revisión → respondido verificados |
| Smoke Hono OAuth con IDs sintéticos y preflight simulado | Google y GitHub devuelven 302, scopes de identidad esperados y cookie técnica HttpOnly, Secure, Lax de 600 s |
| Suite completa | `pnpm test` encontró EPERM en el socket IPC de tsx. `ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit 'tests/**/*.test.ts'` terminó con 195 archivos aprobados y 8 fallidos de 203 en Node 24 |

La suite completa registró fallos en `browser`, `business-graph`, `computer-runner`, `conversation-browser`, `crash-recovery`, `demo-model`, `gate/idempotency-cli` y `model-worker`. `business-graph` mostró además un fallo nativo de V8. La ejecución focalizada en Node 22 pasó. La suite completa sigue siendo un bloqueo de verificación general en este entorno.

Para reproducir Playwright, servir `apps/site` en `http://127.0.0.1:4174` y arrancar Vite en `http://127.0.0.1:5173` con `VITE_PUBLIC_SITE_URL=http://127.0.0.1:4174`. El test crea una cuenta sintética y ejecuta sus peticiones contra Hono y PGlite locales. Intercepta peticiones externas y streams para aislar el entorno. No usó proveedores ni datos reales. El teclado virtual del sistema, cookies de terceros en origen externo y revocación real no se verificaron con esta emulación.

## Compatibilidad y riesgos

- Las ramas de hoja móvil y UX multimodal cabalgan por delante de main. Posibles conflictos en `App.tsx`, `SidebarChat.tsx`, compositor y CSS. Conservar su tratamiento del viewport, gestos y teclado al trasladar el aviso y la apertura de Ajustes.
- Cognition runtime ya está en main. Conversación universal y scaffold de avatar tienen wiring adicional que queda fuera del árbol base. Integrar los avisos en esas superficies cuando se elija su rama objetivo. La campaña no cambia el runtime del modelo, permisos de acciones ni consentimiento de voz.
- **P0** Documentos y DPA incompletos, proceso humano sin propietario asignado y validez de URLs públicas pendientes. Comprobar Postgres shared y RLS de la instalación con datos sintéticos antes de poner en servicio nuevas rutas.
- **P1** Verificar Google y scopes de escritura, inventario real de proveedores, retención, continuidad tras restaurar y procedimientos de incidentes. Validar teléfono/voz, medios sintéticos e información a terceros. Mantener a legal en la evaluación de RRHH y otras decisiones sensibles.
- **P2** Seguimiento de SLA y paginación de cola, mejora de pruebas en dispositivo real y cobertura de retención por dataset.

## Acciones para revisión e integración

1. Fundador y legal validan identidad del prestador, contacto de derechos, autoridad aplicable, finalidades, bases, condiciones, retención, transferencias, DPA y subencargados. Confirmar dominios, proyectos y rutas canónicas.
2. Fundador e integraciones verifican Google Console, separación de clientes, Redirect URI, scopes sensibles y revocación. Confirmar el entorno de proveedores reales, especialmente WhatsApp, voz y avatar.
3. Operaciones asigna responsables de solicitudes e incidentes, acuerda plazos y canal verificado, y ensaya exportación, supresión y restauración con fixtures de dos tenants. Verificar permisos, RLS y protección de evidencias.
4. Revisar solapamientos sobre las ramas activas en móvil y conversación. Repetir flujo autenticado, teclado móvil real y OAuth controlado. Revisar límites restantes de lint y suite antes de integrar.
5. Validar en revisión conjunta el cambio de estado de todos los documentos, el gate y los enlaces públicos antes de una publicación autorizada. La rama queda en workspace para revisión, sin merge, PR ni despliegue.
