# Auditoría concreta de interfaz y especificación UX legal — 2026-11-21

## Alcance y evidencia
Se inspeccionó el código **main** de: `apps/site/index.html`, `apps/web/index.html`, `apps/web/src/App.tsx`, `apps/web/src/components/Login.tsx`, `SidebarV2.tsx`, `SettingsMenu.tsx`, `AppShell.tsx`, y parte de `apps/web/src/index.css`. Esta especificación NO sustituye una auditoría de ramas más recientes ni una inspección visual del deploy. Antes de implementar en app, comparar ramas `fix/mobile-chat-sheet-keyboard-gestures` y las ramas de UX/conversación en curso, y revalidar paths/clases/DOM.

## Hallazgos confirmados
- `apps/site/index.html` es una landing HTML estática oscura con footer básico; en esta rama se ha ampliado a un footer legal responsive.
- `apps/web/src/App.tsx` tiene estado `view` para today/chat/tasks/documents/whatsapp/operations/memory/projects/control-center/users/team/workspace/centro-mando; `AppShell` compone sidebar, main y panel contextual. No usar una página legal como nuevo `AppView` sin necesidad.
- `Login.tsx` ofrece Google y GitHub OAuth, demo y contraseña alternativa. Su pie era `Agntia Pro · Laia`, sin enlaces legales.
- `SidebarV2.tsx` es rail plegable y drawer móvil, lista workspaces y recientes, ajustes en zona inferior.
- `SettingsMenu.tsx` es diálogo de cuenta: perfil, empresa/tenant, salida demo, logout. Es punto natural para sección «Privacidad y datos».
- `App.tsx` incluye botón flotante de chat y hoja móvil. No colocar footer fijo bajo composer ni botón flotante, ni en el interior de un panel scroll.
- La web y app tienen entradas separadas: verificar host, routing y publicación de `apps/site` antes de apuntar enlaces de app al sitio.

## Diseño final de superficies
### 1. Web pública — footer
Componente actual: HTML estático `footer.site-footer` en `apps/site/index.html` (ya implementado en esta rama).
Ubicación: después de contenido comercial, dentro de main; nunca sticky, no superpone CTA. Fondo oscuro, borde superior, marca, descripción, navegación legal en flex, copyright y aviso IA. Desktop: enlaces en fila con wrap; móvil <=600px: dos columnas; foco de teclado visible. Enlaces reales relativos a cinco HTML estáticos y mailto de contacto.
Texto: «AgntiaPro», «Software y servicios de inteligencia artificial para empresas.», «Aviso legal», «Privacidad», «Cookies», «Términos del servicio», «Transparencia IA», «Contacto», «Los agentes y avatares identificados como IA son sistemas artificiales.»
Los cinco documentos son borradores con `noindex,nofollow` y pendientes legales; NO desplegar hasta completar identidad, políticas y aprobación.

### 2. Login — pie de tarjeta
Modificar `apps/web/src/components/Login.tsx`, debajo de botón de contraseña/demo y antes del cierre `.login-card`.
Crear `LegalLinksInline.tsx` (o componente compartido existente si lo hay): enlaces «Privacidad», «Términos», «Cookies» y texto breve «Al continuar, consulta nuestra Política de privacidad y los Términos del servicio». Evitar afirmar aceptación contractual por mero login si no existe registro válido de aceptación. Estilo tipografía 11–12px, color secundario, enlaces subrayados en hover/focus, wrap en móvil; accesible sin login.
Para OAuth: los enlaces deben estar disponibles ANTES de pulsar Google/GitHub; no esconderlos detrás de menú ni demo.
**Routing:** resolver URL pública mediante config `VITE_PUBLIC_SITE_URL` o rutas de mismo origen solo después de verificar despliegue. No asumir que `/privacidad.html` de Vite sirve el HTML de `apps/site`.

### 3. Ajustes de cuenta — privacidad y datos
Modificar `SettingsMenu.tsx` insertando sección después de «Mi perfil»/empresa y antes de logout:
- `ShieldCheck` «Privacidad y datos» -> subpanel `PrivacyDataPanel` o ruta dedicada.
- `FileText` «Políticas y condiciones» -> enlaces externos al sitio.
- `Cookie` «Preferencias de cookies» -> abrir CMP solo si hay cookies opcionales y CMP implementada; si no, enlazar información, no control ficticio.
- `Bot` «Transparencia de IA» -> página pública.
Mantener `Escape`, cierre y foco; si hay diálogo anidado, gestionar foco y backdrop, evitar dos modales superpuestos.

### 4. PrivacyDataPanel
Propuesta de componente nuevo `apps/web/src/components/privacy/PrivacyDataPanel.tsx` con:
- encabezado «Privacidad y datos», nombre de cuenta/tenant, enlace a política;
- tarjetas «Mis datos», «Datos de mi empresa» (solo roles autorizados), «Conexiones externas» y «Solicitudes»;
- botones «Solicitar copia de mis datos», «Solicitar rectificación», «Solicitar eliminación», «Ver estado»; inicialmente deshabilitados o con flujo manual real mientras no exista API. **Nunca botones que simulan borrado**.
- microcopy: «La eliminación puede estar limitada por obligaciones legales y plazos de conservación». 
- acciones de empresa con confirmación, autenticación reforzada y permisos server-side; no inferir derechos de datos de terceros a partir de rol admin.
- móvil: hoja full-height con safe areas, scroll propio y cierre visible; desktop: diálogo max-width ~640px. Respetar z-index y comportamiento del chat sheet.

### 5. Cookies
`CookieConsentBanner.tsx` (solo si inventario confirma cookies no esenciales) anclado al viewport inferior de la web pública, no superpuesto a navegación móvil: título «Tu privacidad importa», cuerpo «Utilizamos tecnologías necesarias para que el sitio funcione. Con tu permiso, también podremos usar otras categorías descritas en la Política de cookies.»; acciones «Rechazar opcionales», «Configurar», «Aceptar opcionales» con prominencia comparable. Panel `CookiePreferencesDialog.tsx` con categorías, propósitos, toggles inicialmente desactivados y «Guardar preferencias»; enlace footer «Configurar cookies» cuando exista CMP real. Persistencia versionada; bloquear scripts antes de opt-in; auditar consentimiento y revocación. Si no hay cookies opcionales, NO desplegar banner decorativo.

### 6. Avisos de IA por canal
- En chat inicial con LAIA: aviso contextual discreto «Estás conversando con LAIA, un sistema de inteligencia artificial.» una vez por canal/contexto donde aplique, accesible desde info permanente.
- En vídeo Anam: badge persistente «Avatar generado por IA» y aviso previo a iniciar sesión.
- En voz: aviso oral inicial cuando aplique, con control de consentimiento de transcripción/grabación según tratamiento real. No inferir que voz se graba: `voice-v2/coordinator.ts` requiere inspección y pruebas de proveedor.
- En mensajes externos: política de disclosure por canal, no saturar cada respuesta.

### 7. Web legal
Archivos de esta rama: `apps/site/aviso-legal.html`, `privacidad.html`, `cookies.html`, `terminos.html`, `transparencia-ia.html`.
Son **borradores de contenido**, no textos definitivos. Incluyen placeholders `[PENDIENTE]`, aviso visible y `noindex`. Sustituir con información verificada, revisión legal, versionado y SEO antes de cualquier deploy. Comprobar hosting de HTML estático y rutas (404/200) desde dominio canónico.

## Componentes propuestos y wiring (sin implementar aún)
`apps/web/src/components/legal/LegalLinksInline.tsx`
`apps/web/src/components/legal/LegalExternalLink.tsx`
`apps/web/src/components/privacy/PrivacyDataPanel.tsx`
`apps/web/src/components/privacy/PrivacyRequestForm.tsx`
`apps/web/src/components/privacy/PrivacyRequestStatus.tsx`
`apps/web/src/components/cookies/CookieConsentBanner.tsx`
`apps/web/src/components/cookies/CookiePreferencesDialog.tsx`
`apps/web/src/components/ai/AIDisclosure.tsx`
`apps/web/src/config/publicSite.ts` (URL canónica validada)
`apps/web/src/styles/legal.css` o estilos integrados según convención real.
No instalar router/librería CMP sin verificar necesidad y stack; no duplicar state machine de modal/sheet existente.

## Criterios E2E
- Anónimo: landing/footer y 5 enlaces resuelven 200 en entorno de preview; noindex hasta revisión.
- Login: políticas accesibles sin autenticación y antes de OAuth; teclado/lector pantalla.
- Autenticado: ajustes -> privacidad, vuelta sin perder workspace/chat; móvil teclado/safe-area; overlay chat no tapa acciones.
- Cookies: con opcionales, rechazo efectivo antes de cualquier request no esencial, revocación y recarga; sin opcionales, banner ausente.
- Tenants: empleado no puede exportar ni borrar datos de empresa sin autorización; admin no accede a datos de otra empresa.
- IA: disclosure visible y localizable en chat, voz, vídeo; test por canal.
- CI: grep/lint para links rotos y placeholders; bloquear release si `[PENDIENTE]` o `noindex` en documentos finales.
