# Prompt maestra V2 — Login AgntiaPro

## Prioridad de producto y branding

**La presente prompt es DOCUMENTACIÓN UX/UI, no una orden de modificar código.** Adaptar el acceso actual al lenguaje visual premium de la landing y Studio Demo, sin inventar una nueva identidad. La composición propuesta es hero editorial a la izquierda, tarjeta de acceso a la derecha, móvil en una columna. LAIA es la protagonista del acceso conversacional, no una ilustración decorativa.

**Código contrastado en main:** `apps/web/src/components/Login.tsx`. Tiene enlaces OAuth reales `/api/auth/oauth/google/start` y `/api/auth/oauth/github/start`, formulario de contraseña con `onLogin`, estado `error` y acceso condicional `onEnterDemo`. El chat público con LAIA y la solicitud de invitaciones no están implementados en este componente. No borrar el acceso sandbox ni romper autenticación por ocultar palabras internas en la interfaz comercial.

**Precedencia:** decisión del founder > código y autenticación real > branding actual de landing/Studio Demo > composición de la prompt > tokens y cifras ilustrativas.

**Correcciones obligatorias a las instrucciones históricas de la prompt adjunta:**
1. Donde dice «recrea exactamente» se entiende fidelidad a composición y jerarquía, no sobrescribir el branding actual ni código existente.
2. Los colores y tipografías son referencias visuales: prevalecen tokens, logo y activos reales del diseño aprobado.
3. Los botones Google y GitHub conservan los enlaces OAuth reales; no mostrar avisos ficticios de conexión completada.
4. Contraseña: usar `onLogin` real y mostrar sus errores, no «Entrando (vista previa)».
5. LAIA sin cuenta: requiere chat anónimo real, aislamiento, rate limiting, transparencia IA y límites; NO simular respuestas temporizadas ni prometer que ha realizado acciones empresariales. Los chips precargan texto y requieren confirmación de envío.
6. Invitaciones: requiere endpoint de registro real y confirmación del backend. No mostrar «te hemos puesto en lista» por validar solo el email. Checkbox de comunicaciones opcionales sin premarcar.
7. «30 minutos» y «solo por invitación» son afirmaciones comerciales que deben validarse antes de publicar.
8. No eliminar la ruta demo del software por quitar la palabra «demo» del copy público; decidir una entrada separada para pruebas.
9. Enlace de aviso legal, privacidad y transparencia IA solo a rutas reales verificadas. Accesibilidad: teclado, focus trap, errores anunciados, contraste AA, responsive 320–1440 px.
10. No usar un único App.tsx ni un index.css global duplicado: componentes modulares y tokens compartidos.
11. Los estados de chat/invitación no disponibles deben quedar como no implementados, no fingir que funcionan.
12. No realizar cambios de código ni despliegue en esta tarea.

---

## Especificación visual original adaptada

PROMPT ULTRA-LARGA — UX DESIGN / LINEAR / FIGMA — ADAPTACIÓN AL BRANDING REAL DE AGNTIAPRO
PROYECTO: "AgntiaPro — Acceso — Habla con LAIA sin cuenta"

OBJETIVO ABSOLUTO:
Recrea EXACTAMENTE, píxel a píxel en estructura, contenido, textos, colores,
jerarquía, espaciados y comportamiento, la interfaz que describo abajo.
NO inventes. NO mejores. NO añadas secciones. NO cambies textos. NO cambies nombres.
NO cambies el orden.
Si algo no está descrito, usa el valor por defecto que indico.
Si hay conflicto, manda ESTA prompt sobre cualquier convención tuya.

ROL QUE DEBES ASUMIR:
Eres un Product Designer Senior estilo Linear + Figma + Editorial de marca premium,
obsesionado con:
- jerarquía visual clarísima
- aire, respiración, densidad baja, mucho blanco cálido
- tipografía editorial serif para titulares + UI limpia para el resto
- radio grande, bordes finos, sombras sutiles
- consistencia total de tokens
- microcopy en español de España, cercano, profesional, sin anglicismos innecesarios
- fotografía / avatar real y cálido — NUNCA ilustración genérica, NUNCA partículas, NUNCA dots

QUÉ ES Y QUÉ NO ES:
ES: la pantalla de Acceso de AgntiaPro.
ES: la puerta de entrada al software de gestión empresarial agéntica AgntiaPro.
ES: 2 columnas en desktop: izquierda hero editorial como la landing, derecha card de login.
ES: en móvil, 1 columna: hero compacto arriba, card de login debajo, centrada.
ES: 3 vías de entrada, en este orden EXACTO:
    1. Continuar con Google
    2. Continuar con GitHub
    3. Habla con LAIA sin cuenta — el concepto principal, NO secundario
ES: + 1 vía de acceso por invitación estilo Discord: "Conseguir una invitación"
ES: + link secundario "Entrar con contraseña"
NO ES: landing completa.
NO ES: Centro de Mando.
NO ES: WhatsApp.
NO ES: Teléfono.
NO ES: Slack.
NO ES: Analítica.
NO ES: Agntia Apps.
NO ES: un login genérico de SaaS con degradados y partículas.
NO ES: un login con tenant demo.
NO ES: un login con datos sintéticos / datos de ejemplo.
NO ES: un login con "modo demo".

PROHIBIDO ABSOLUTO — PALABRAS PROHIBIDAS EN TODA LA INTERFAZ:
- "tenant"
- "demo" — EXCEPTO en "Demo interactiva" si se usa, pero en esta pantalla NO usar "demo" en ningún sitio.
  En esta pantalla, NO escribir "demo", "tenant demo", "tenant", "sintético", "sintéticos", "datos de ejemplo", "datos sintéticos", "sin backend".
- Si dudas, NO lo escribas. La pantalla debe sonar a producto real, no a prototipo.

USUARIO Y CONTEXTO:
Visitante: dueño de PYME, autónomo, gestor, clínica, comercio, asesoría.
Puede tener cuenta o NO tenerla. Si no la tiene, puede hablar con LAIA sin cuenta
o pedir una invitación. AgntiaPro ofrece acceso por invitación.
LAIA: mujer pelirroja, rizada, sonrisa cálida, foto real, no avatar 3D.

1. SISTEMA DE DISEÑO — TOKENS EXACTOS — NO CAMBIAR


COLORES — USAR SOLO ESTOS:
--bg: #FDFBF7 — fondo principal, warm white, casi blanco cálido
--bg-alt: #F4EEE3 — marfil, fondo de card invitación, hover, fondos secundarios
--border: #E8DFD2 — borde 1px en TODAS las cards, inputs, botones blancos, divisores
--ink: #211D18 — texto principal
--ink-soft: #3A332C — texto cuerpo secundario
--muted: #85796A — texto secundario, subtítulos, placeholders, labels pequeños
--violet: #5B4BDB — color primario, botones, links, badges, LAIA ON
--violet-dark: #4A3FB8 — hover botón violeta
--violet-soft: #ECE9FF — fondo suave violeta para card "Habla con LAIA sin cuenta"
--violet-border: #C7C0F5 — borde de card LAIA sin cuenta
--lav: #E7E2F7 — lavanda, halo superior muy sutil, fondos suaves
--gold: #C9A86A — SOLO para "— LAIA —", ✦ de LAIA
--gold-soft: #E8D9B8 — acentos dorados mínimos
--surface: #FFFFFF — cards blancas
--black: #211D18 / #111 — botones negros "Conseguir una invitación", "Reservar"
--green: #E6F4EA — punto online
--green-dot: #2BA84A
--google-blue: #4285F4, --google-red: #EA4335, --google-yellow: #FBBC05, --google-green: #34A853 — SOLO para la G de Google
--github-black: #111111 — icono GitHub

PROHIBIDO ABSOLUTO:
- fondo oscuro general
- degradados morados grandes, degradados azules, degradados rosa
- partículas, dots, confetti, estrellas decorativas, gradientes de fondo fuertes
- verde WhatsApp #25D366
- logos de WhatsApp, Meta, Slack
- ilustraciones 3D, avatares generados, fotos de stock frías de oficina con traje
- densidad alta, texto pequeño amontonado
- carruseles automáticos

TIPOGRAFÍA:
- Títulos grandes / "Entra en tu cuenta" / "Tu empresa, siempre un paso por delante." /
  "Habla con LAIA sin cuenta" / "¿No tienes acceso todavía?":
  Fraunces, serif, weight 500-600, line-height 1.05, letter-spacing -0.02em. Clase font-serif-x
  Palabra clave en titular hero: "por delante." en color #8A7A68 / marrón suave, NO negro.
- TODO lo demás: Manrope, sans-serif, 400 / 500 / 600 / 700 / 800
- Eyebrow / label superior: 10-11px, UPPERCASE, letter-spacing 0.18em, weight 700, color --muted
  Ejemplos: "TU EMPRESA, UN EQUIPO DIGITAL.", "O CONTINÚA CON"
- Texto cuerpo: 14-15px, line-height 1.6, color --ink-soft
- Microcopy: 11-12px, color --muted
- Botones: 13-14px, bold
- Links: 12-13px

RADIOS:
- Card login principal: 20px
- Card LAIA sin cuenta: 16px
- Card invitación: 16px
- Botón Google / GitHub: 10-12px (NO pill gigante, rectángulo suave como en captura original)
- Botón violeta LAIA: 10-12px
- Botón negro invitación: 10-12px
- Input: 10-12px
- Chip sugerencia: 999px
- Avatar: 999px circular
- Badge: 999px

SOMBRAS:
- Solo shadow-sm / shadow-md suave en card login y en mini-card LAIA.
- Resto: borde 1px --border, SIN sombra fuerte.

ESPACIADO:
- Mucho aire. Página: max-width 1200px centrado, px-6 / px-8
- Card login: p-6 / p-7, gap 16px entre elementos
- Hero izquierda: gap 20px
- Secciones: py-12 / py-16

2. LAYOUT GLOBAL — EXACTO


- Página: min-height 100dvh, bg #FDFBF7, overflow-x clip
- Fondo: halo superior muy sutil lavanda #E7E2F7, difuminado, sin partículas, sin dots.
- Contenedor principal: max-width 1200px mx-auto, px-6, py-8 / py-12,
  grid 2 columnas en desktop (55% hero / 45% login), gap-12, items-center
- En móvil (<md): 1 columna, hero compacto arriba, login debajo, centrada, px-4
- Footer página: text-center, mt-8, 11px color --muted:
  "© 2026 AgntiaPro · Aviso legal · Privacidad · Transparencia IA"
- NO sidebar. NO header con nav completo. SOLO logo arriba a la izquierda en desktop,
  y logo centrado en móvil dentro de la card o encima de ella.

3. HEADER / LOGO — EXACTO


- Contenedor: absolute top-0 left-0 right-0, max-width 1200px mx-auto, px-6 py-5,
  flex justify-between items-center, o dentro del hero en móvil
- Izquierda: Logo:
  Icono: "A" grande serif, 22px bold, color --ink, con línea dorada debajo / acento
    + a su derecha, leading-none:
    "AgntiaPro" — Fraunces bold 17px
    "LAIA" — 8px, letter-spacing 0.3em, color --muted, debajo, centrado
  En captura original: logo "A AgntiaPro — LAIA —" compacto.
  PROHIBIDO: "ACME" en header. PROHIBIDO duplicar "AgntiaPro" dos veces.
- Derecha (desktop): link "¿No tienes acceso? Conseguir invitación →" 12px bold color --violet
  Al hacer clic: scroll a card invitación / abre modal invitación.

4. COLUMNA IZQUIERDA — HERO EDITORIAL — EXACTA


- Contenedor: hidden md:block, max-width 520px
- Eyebrow: "— TU EMPRESA, UN EQUIPO DIGITAL." 10-11px bold letter-spacing 0.18em color --muted, con línea 24px antes
- Titular: Fraunces 48-56px desktop, 38px móvil, line-height 1.05, mt-4:
  Línea 1: "Tu empresa,"
  Línea 2: "siempre un paso"
  Línea 3: "por delante." — esta línea en color #8A7A68 / marrón suave, NO negro
- Subtítulo: "Imagina poder hablar con tu empresa." 15px bold color --ink, mt-5
  Segunda línea: "LAIA coordina un equipo de agentes que trabaja contigo. Tú marcas el rumbo. Ellos se ocupan de que las cosas avancen."
  14-15px, line-height 1.6, color --ink-soft, mt-2, max-width 420px
- Bullets: mt-6, space-y-3, 13-14px color --ink-soft:
  Cada bullet: flex gap-2 items-center, icono 16px:
    1. "💬 Tan natural como conversar" — icono MessageCircle
    2. "📁 Con el contexto de tu negocio" — icono Folder
    3. "🛡️ Las decisiones importantes, contigo" — icono ShieldCheck
- Mini-card LAIA — debajo bullets, mt-6:
  Contenedor: bg white border 1px --border rounded- p-4 shadow-sm flex gap-3
  Izquierda: avatar LAIA 44x44 rounded-full foto real mujer pelirroja rizada + punto verde online + ✦ dorada 12px en esquina
  Centro flex-1:
    "✦ LAIA" 11px bold color --gold + "· ahora" 11px color --muted
    Texto 13-14px mt-1: "Hola, soy LAIA. ¿Qué te gustaría quitarte de encima en tu empresa?"
  Debajo: chips flex gap-2 mt-3:
    3 chips pill border bg white 11px px-3 py-1.5 rounded-full color --ink-soft:
    "Quiero más clientes" / "Organizar mi equipo" / "Automatizar mi atención"
    Al hacer clic chip: abre chat LAIA sin cuenta con ese texto como primer mensaje.
- Microcopy debajo hero: "Una primera conversación. 30 minutos. Sin compromiso." 11-12px color --muted mt-4

HERO MÓVIL COMPACTO:
- Contenedor: md:hidden, text-center, px-4 pt-6 pb-2
- Logo centrado + titular Fraunces 32px: "Tu empresa, siempre un paso por delante."
- Sub: "Habla con tu empresa. LAIA coordina tu equipo digital." 13px color --muted

5. COLUMNA DERECHA — CARD LOGIN — EXACTA


- Contenedor: bg white border 1px --border rounded- p-6 / p-7 shadow-sm, w-full max-width 460px, mx-auto
- Logo dentro de card (solo móvil): centrado, mismo logo que header, mb-4

TÍTULO Y SUBTÍTULO:
- Título: "Entra en tu cuenta" — Fraunces bold 26-28px, leading-none, color --ink
- Subtítulo: "Usa la cuenta de Google o GitHub de tu empresa." — 13-14px color --muted, mt-2

BOTONES GOOGLE / GITHUB — EN ESTE ORDEN EXACTO:
- Contenedor: space-y-3, mt-5
- Botón 1 — Google:
  Contenedor: w-full flex items-center justify-center gap-2, px-4 py-3, rounded-,
  bg #FDFBF7 / #F8F5F0, border 1px --border, 14px medium color --ink, hover bg white, cursor pointer
  Contenido: G multicolor — SVG simple con 4 colores: azul #4285F4, rojo #EA4335, amarillo #FBBC05, verde #34A853, 18x18 + texto "Continuar con Google"
  Al hacer clic: estado "Conectando con Google…" 13px color --muted, botón deshabilitado 2s, luego notice "Conexión con Google lista en producción. Aquí es una vista previa."
  En producción conservar el OAuth real; en prototipo no simular un login exitoso.
- Botón 2 — GitHub:
  Contenedor: mismo estilo que Google
  Contenido: icono GitHub negro 18x18 — círculo con silueta gato / octocat simplificado, o icono lucide Github + texto "Continuar con GitHub"
  Al hacer clic: estado "Conectando con GitHub…" igual que Google.

DIVISOR:
- Contenedor: flex items-center gap-3, my-5:
  Línea izquierda: flex-1 h-px bg --border
  Texto: "O CONTINÚA CON" 10px bold letter-spacing 0.12em color --muted, whitespace-nowrap
  Línea derecha: flex-1 h-px bg --border
- NO escribir "O CON DATOS DE EJEMPLO". NO escribir "O CON DATOS SINTÉTICOS". SOLO "O CONTINÚA CON".

6. BLOQUE PRINCIPAL — HABLA CON LAIA SIN CUENTA — EXACTO


- Contenedor: bg #ECE9FF border 1px #C7C0F5 rounded- p-4, mt-1
- Cabecera: flex gap-2 items-center:
  Icono: 32x32 rounded-full bg white flex center, ✦ 16px color --gold
  Título: "Habla con LAIA sin cuenta" — Fraunces bold 16-17px color --ink
  Badge derecha: "Sin registro" 10px bold px-2 py-1 rounded-full bg white color --violet border 1px #C7C0F5
- Texto: "Prueba una conversación real. Sin registro, sin cuenta, sin compromiso. 30 minutos." 12-13px color --ink-soft mt-2, line-height 1.5
- Botón: mt-3 w-full py-2.5 rounded- bg --violet texto blanco 13-14px bold "Hablar con LAIA ahora →"
  Al hacer clic: abre mini-chat dentro de la misma card (ver abajo), y cambia botón a "Cerrar chat" 12px.
- Mini-chat (cuando abierto):
  Contenedor: mt-3 bg white border 1px --border rounded- p-3
  Mensaje LAIA inicial: flex gap-2: avatar LAIA 28x28 + burbuja bg #FDFBF7 rounded-xl p-2.5 13px:
    "Hola, soy LAIA. ¿Qué te quita tiempo hoy?"
  Chips: flex gap-2 mt-2: "Quiero más clientes" / "Organizar mi equipo" / "Automatizar mi atención" — 11px pill border
    Al hacer clic chip: rellena input.
  Input: flex gap-2 mt-3: input flex-1 border rounded-full px-3 py-2 13px placeholder "¿Qué te quita tiempo hoy?" + botón enviar 32x32 rounded-full bg --violet, ArrowUp 14px blanco
  Lógica: al enviar, añade mensaje usuario derecha bg --violet-soft, y a los 900ms LAIA responde:
    "Entendido. Lo dejo preparado y te pido aprobación antes de enviar nada sensible."
  Segundo mensaje usuario: LAIA responde: "Perfecto. Si quieres, te consigo una invitación para que tu equipo lo pruebe completo."
  NO pedir email en el chat. NO pedir contraseña en el chat.

LINK CONTRASEÑA:
- Debajo bloque LAIA, mt-4, text-left:
  Link: "Entrar con contraseña" — 13px underline color --ink, medium
  Al hacer clic: abre formulario contraseña dentro de la card:
    Input email: "Email de tu empresa" placeholder
    Input contraseña: "Contraseña" placeholder, con ojo para mostrar
    Botón: "Entrar" w-full py-2.5 rounded- bg black texto blanco 13px bold
    Al enviar: si vacío, notice "Rellena email y contraseña." Si ok, notice "Entrando… (vista previa)".
  NO mostrar formulario contraseña por defecto. Solo al hacer clic en el link.

7. BLOQUE INVITACIÓN ESTILO DISCORD — EXACTO


- Contenedor: bg #F4EEE3 border 1px --border rounded- p-4, mt-4
- Cabecera: flex gap-2 items-center:
  Icono: 32x32 rounded-full bg white flex center, Ticket / Mail 16px color --ink
  Título: "¿No tienes acceso todavía?" — Fraunces bold 15-16px
- Texto: "AgntiaPro funciona por invitación, como Discord. Si tu equipo ya está dentro, pide que te inviten." 12-13px color --ink-soft mt-2, line-height 1.5
- Botón: mt-3 w-full py-2.5 rounded- bg black texto blanco 13-14px bold "Conseguir una invitación"
  Al hacer clic: abre modal invitación (ver punto 8).
- Microcopy: "Te avisamos cuando haya sitio para tu empresa." 11px color --muted text-center mt-2

FOOTER CARD:
- Contenedor: mt-5 pt-4 border-top 1px --border, flex justify-between, 11px color --muted:
  Izquierda: "© 2026 AgntiaPro"
  Derecha: "Aviso legal · Privacidad · Transparencia IA" — links underline

8. MODALES — 2 MODALES — EXACTOS


Estilo común modal:
- Overlay: fixed inset-0 bg-black/30 z-50, contenedor center p-4
- Card: w-full max-width 440px bg white rounded- p-5

MODAL 1 — Conseguir una invitación (Discord-like):
- Cabecera: flex justify-between: "Conseguir una invitación" Fraunces 20px bold + X cerrar
- Sub: "Déjanos el email de tu empresa. Te avisamos cuando haya sitio." 13px color --muted mt-1
- Campo: Label "Email de tu empresa" 12px bold + input w-full border rounded- px-3 py-2.5 14px placeholder "tu@tuempresa.com"
- Campo opcional: Label "¿Quién te invita? (opcional)" 12px bold + input placeholder "Nombre de quien te invitó, si lo tienes"
- Checkbox: flex gap-2 mt-3 12px color --muted: "Quiero que me avisen cuando haya sitio para mi empresa." checked por defecto
- Botón: w-full mt-4 py-2.5 rounded- bg black texto blanco 13px bold "Pedir invitación"
  Al hacer clic: si email vacío o sin @, notice "Escribe un email válido." Si ok, cambia contenido modal a:
    "¡Listo!" Fraunces 22px + "Te hemos puesto en lista." 13px + "Te avisamos cuando haya sitio para tu empresa. Mientras, puedes hablar con LAIA sin cuenta." + botón violeta "Hablar con LAIA sin cuenta" → cierra modal y abre chat LAIA.
- Microcopy modal: "Sin spam. Solo un aviso cuando haya sitio." 11px color --muted text-center mt-2

MODAL 2 — Entrar con contraseña (si se usa como modal en lugar de inline):
- Misma estructura que formulario inline del punto 6, pero en modal.
- NO usar ambos a la vez. Elige inline en card (preferido) y NO modal duplicado.

9. ESTADO INICIAL — EXACTO


- provider = null (Google / GitHub / null)
- connecting = false
- laiaChatOpen = false
- laiaMessages = [{author 'LAIA', text 'Hola, soy LAIA. ¿Qué te quita tiempo hoy?'}]
- laiaInput = ''
- passwordOpen = false
- inviteOpen = false
- inviteEmail = ''
- inviteInviter = ''
- inviteSent = false
- notice = ''
- form = {email '', password ''}

PERSISTENCIA: NO obligatoria. Todo en sesión. NO guardar contraseña real. NO conectar a backend real en vista previa.

10. REGLAS DE FIDELIDAD — VERBATIM


1. NO escribas "tenant", "demo", "sintético", "sintéticos", "datos de ejemplo", "datos sintéticos", "sin backend", "modo demo" en NINGÚN sitio de la pantalla.
   Si el texto original lo tenía, se ELIMINA, no se reescribe.
2. NO cambies el orden: Google → GitHub → Habla con LAIA sin cuenta → Entrar con contraseña → Conseguir una invitación.
3. "Habla con LAIA sin cuenta" es el concepto principal, NO secundario. Debe tener card violeta destacada, NO link pequeño.
4. Mantén SIEMPRE: #FDFBF7 fondo, #FFFFFF cards, borde #E8DFD2 1px, violeta #5B4BDB primario, dorado solo LAIA.
5. Fraunces SOLO titulares. Todo lo demás Manrope.
6. Logo SIEMPRE: "A AgntiaPro — LAIA —", fino, sin ACME, sin nombre duplicado.
7. Botones Google / GitHub SIEMPRE blancos con borde, NO violeta, NO negro. Con G multicolor y GitHub negro reales.
8. Botón "Conseguir una invitación" SIEMPRE negro, como Discord: "funciona por invitación".
9. Mini-chat LAIA SIEMPRE dentro de la card, NO en página aparte, NO en popup que tape toda la pantalla.
10. Responsive: 2 columnas desktop, 1 columna móvil, hero compacto en móvil.
11. Si dudas entre espectacular y limpio, elige LIMPIO, con aire, editorial, pro, como la landing.

ENTREGA:
- Código React + Tailwind + lucide-react, componentes modulares reutilizando Login.tsx
- index.css con tokens exactos y clases .font-serif-x, .label, .scroll-thin
- En implementación no sustituir fallos reales por éxitos simulados.
- Resultado final debe ser INDISTINGUIBLE de la descripción: mismo layout,
  mismos textos, mismos colores, mismos botones, mismo comportamiento al hacer clic en
  Google, GitHub, Hablar con LAIA, enviar chat, chips, Entrar con contraseña,
  Conseguir una invitación, Pedir invitación, Hablar con LAIA sin cuenta desde modal.

---

## Criterios de aceptación adicionales

- Desktop: hero editorial y card; móvil: hero compacto y card sin overflow.
- Google, GitHub y contraseña conservan su flujo de autenticación existente.
- LAIA e invitaciones solo se habilitan cuando los endpoints reales estén verificados.
- Ningún éxito simulado, promesa de acceso a datos ajenos ni acción sin permiso.
- La navegación interna y el acceso de pruebas preexistentes no se rompen.
- Los tokens de landing prevalecen sobre hexadecimales de referencia.
- La documentación no modifica código ni despliega.
