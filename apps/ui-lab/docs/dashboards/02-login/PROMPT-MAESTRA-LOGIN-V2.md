# PROMPT MAESTRA LOGIN V3 — fidelidad al mockup, identidad definitiva de landing
Fecha: 2026-11-24. Sustituye íntegramente V2 en este mismo archivo para conservar todos los enlaces existentes. Documentación para futura ejecución autorizada; no implica aprobación visual ni despliegue.

## 0. Misión y precedencia
Eres diseñador de producto senior e ingeniero frontend de AgntiaPro. Construye exactamente la composición del PNG [mockup original](./login-mockup-falta-adaptar-branding-y-copy.png), pero con la dirección artística efectiva de la landing nueva. No diseñes otra pantalla. La captura manda en distribución, orden, anatomía y proporciones; la landing manda en marca, tipografía, color, geometría y acabados; esta V3 manda en copy y comportamiento objetivo. El código real manda en contratos y disponibilidad. No copies los tokens históricos del PNG. No introduzcas fotografías grandes, navegación comercial, nuevas secciones ni un dashboard.
Antes de escribir código, abre el PNG y lee completos:
- ../01-landing/GUIA-MAESTRA-BRANDING-UX-V2.md
- apps/ui-lab/src/vendor/landing/Landing.jsx, landing.css, ProductScene.jsx
- apps/ui-lab/src/design-system/agntia-tokens.css
- apps/web/src/components/BrandMark.tsx y Login.tsx
- docs/agntia-demo: kickoffs y respuestas del founder relevantes al acceso y negocio.
- README, ESTADO-UX y HANDOFF de esta carpeta; ante contradicción visual prevalece esta V3.
Las copias en ../01-landing/ejemplo-componentes-reales/ son material de estudio; comprobar código vigente. Capturar baseline de landing y login a igual viewport. No calificar por intuición ni usar Linear/Apple como fuente de tokens.

## 1. Producto y alcance
Puerta de acceso para autónomos y pymes. Tres intenciones: entrar en una cuenta, conversar con LAIA sin cuenta, solicitar invitación. Google primero, GitHub segundo, conversación pública, contraseña colapsada, invitación. LAIA coordina el equipo; no presentar agentes como ejecutores autónomos sin permisos. Las acciones sensibles requieren las aprobaciones aplicables. No inventar capacidades ni datos empresariales. No cambiar landing, shell, runtime, kernel, rutas, autenticación o backend por razones visuales. No eliminar acceso sandbox existente. El lenguaje público evita tenant, datos sintéticos y jerga interna; las limitaciones reales sí se explican con claridad.

## 2. Tokens y dirección artística exactos
Usar variables compartidas scoped, no otro :root. Tabla canónica:
| Rol | Token | Valor |
|---|---|---|
| Papel | --ag-paper | #fcfaf6 |
| Blanco | --ag-surface | #ffffff |
| Superficie tenue | --ag-soft | #f2efe8 |
| Tinta | --ag-ink | #242421 |
| Secundario | --ag-muted | #6e6c66 |
| Borde | --ag-line | #e6e1d8 |
| CTA | --ag-violet | #6550dd |
| Lila | --ag-lilac | #f0ecfc |
| Oro | --ag-gold | #b49665 |
Énfasis editorial del hero: #7c7364, observado en .lp-hero h1 em. Hover CTA violeta #5743c9; tinta #403e39. Borde lila #e8e2fa y superficie de icono #f1edfe como .lp-spark. No introducir #FDFBF7, #211D18, #5B4BDB, #C9A86A como segunda paleta.
Fondo papel uniforme: eliminar halo lavanda decorativo del mockup. Profundidad por espacio, borde y sombra, no por gradiente. Oro exclusivamente como detalle editorial. No partículas, glow, glassmorphism universal, neón, badges redundantes, stock, emojis ni logos de integraciones ajenas al acceso.
Fraunces variable opsz 9–144, SOFT 20, WONK 1, pesos 400–500; Manrope 400–800. Importación idéntica a landing. Titulares editoriales 400, nunca 700. Hero tracking -0.052em, leading 1.035; títulos de cards tracking -0.03em, leading 1.15. Manrope cuerpo 14–16, leading 1.6–1.8, botones 14/600, labels 11–12/700. Eyebrow tracking .13em, micro .1em. No usar texto taupe claro para cuerpo.
Geometría: botones 9px, min-height 50px, padding 12px 23px; secundarios borde 1px; chips pill; card principal 18px, invitación 16px, bloque LAIA 12px, preview chat 13px. Cards grandes 24–28px padding, internas 16px. Sombra chat 0 7px 25px #49392806; login misma familia de sombra contenida, sin sombra oscura. CTA violeta 0 3px 5px #3023740c, 0 7px 18px #6550dd1c. Iconografía Lucide 16–20px, stroke coherente.

## 3. Layout global y medidas
Referencia desktop: PNG 1366×1070 incluye cabecera del visor externo de 68px; NO reproducir esa cabecera. Contenedor real max-width 1248px, padding inline 32px como .lp-container. Header en flujo normal, 80–88px, sin navegación ni doble logo. Grid desktop 55:45, gap 44–64px, align-items start. A 1366px, buscar anchuras útiles cercanas a 616 y 500px del PNG; no imponer píxeles que causen overflow. Hero comienza aproximadamente 16–20px por debajo del inicio de tarjeta derecha. Separación header/grid 32–48px. Página scrollable min-height 100dvh, nunca altura fija ni recorte de contenido.
Columna izquierda: eyebrow, H1, lead, tres beneficios con descripción, preview LAIA. Columna derecha: card acceso, card invitación, footer legal. Gap derecho 16px. No insertar fotografía de hero, pricing, testimonios ni CTA adicional. Mantener aire inferior izquierdo del PNG; no rellenarlo.
En 1024px comprobar espacio de ambos paneles; si no caben con lectura cómoda, apilar. En 768px y menos: una columna, header compacto, hero arriba y acceso debajo, invitación y footer. Mantener los tres beneficios y chips, no ocultarlos; reducir márgenes y tamaños, no miniaturizar. A 320–430px padding 16px, H1 36–40px, botones full-width, chips wrap. Header marca una sola vez. Footer puede envolver. No overflow horizontal ni scroll interno salvo historial de chat. Teclado móvil y safe areas.

## 4. Header
Izquierda: importar BrandLockup real, markSize 32, estilos cc-brand del CSS de landing. Chevron geométrico, Manrope AgntiaPro con Pro en negrita y firma LAIA entre reglas doradas. No letra A serif ni cuadrado negro inventado. Logo enlaza a landing únicamente si existe navegación real apropiada.
Derecha: pill discreta «Acceso protegido», borde --ag-line, fondo blanco, radio pill, padding 6px 12px, ShieldCheck 14px violeta, Manrope 12/600 secundario. No interacción necesaria ni afirmaciones de seguridad no verificadas. En móvil mantener marca y pill sin duplicación.

## 5. Columna izquierda — especificación y copy cerrado
Eyebrow: línea dorada 28×1px, gap 12px, texto «TU EMPRESA, UN EQUIPO DIGITAL.» gris secundario, 12/700, tracking .13em. Margin inferior 24px.
H1: «Tu empresa, siempre un paso por delante.» Fraunces 400, clamp(2.5rem, 4.6vw, 4rem), tracking -0.052em, leading 1.035. «por delante.» en #7c7364. Mantener composición de dos líneas del PNG cuando el ancho lo permita; envolver naturalmente a tres en tamaños menores. No cortar palabras ni fijar br en móvil.
Lead: margin top 24px. Primera frase «Imagina poder hablar con tu empresa.» Manrope 18–20/500 tinta. Continuación «LAIA coordina un equipo de agentes que trabaja contigo.» Manrope 15–16, secundario, leading 1.8. LAIA puede ir 600 en tinta. Sin párrafos extra.
Beneficios: margin top 32px, gap vertical 24px, icono lineal 18px alineado con título, en círculo lila de 20–24px si se necesita mantener la silueta del PNG. Usar MessageCircle, Folder, ShieldCheck, como principios de landing; no emojis. Títulos Manrope 15/600 tinta, descripciones 14/400 secundario, margin top 4px, leading 1.65.
1. «Tan natural como conversar» / «Cuéntale a LAIA qué necesitas. Ella organiza el trabajo con tu equipo.»
2. «Con el contexto de tu negocio» / «Tus clientes, tu equipo y tus prioridades, en el mismo lugar de trabajo.»
3. «Las decisiones importantes, contigo» / «LAIA prepara y propone. Tú apruebas las decisiones sensibles.»
No cuarto beneficio. No prometer que cada acción requiere aprobación ni que todo trabajo está realizado.

### Preview conversacional LAIA
Margin top 36–40px, blanco, borde 1px, radio 13px, padding 16px, sombra lp-inline-chat. Fila superior gap 12px, icono Sparkles violeta en superficie lila 40×40px radio 12px (patrón lp-spark), label «LAIA» 11/600, texto «Hola, soy LAIA. ¿Qué te gustaría quitarte de encima?» 14px tinta. No estado online ficticio, ni foto nueva.
Fila inferior margin 14–16px, gap 8px, chips con borde fino, radio pill, padding 7px 12px, Manrope 12/600. Textos exactos «Quiero más clientes», «Organizar mi equipo», «Automatizar mi atención». Hover papel/lila tenue, focus visible. Cada chip abre el chat inline de la derecha y precarga el input, sin enviar automáticamente. En móvil desplazar suavemente al chat y enfocar de forma accesible, sin perder texto. No input ni historial en esta preview.

## 6. Columna derecha — acceso
Card blanca, borde 1px, radio 18px, padding 28px desktop/20px móvil, sombra tenue. H2 «Entra en tu cuenta» Fraunces 400, 30–32px, leading 1.15. Subtítulo «Usa la cuenta de Google o GitHub de tu empresa.» 14px secundario, margin top 8px.
Botones OAuth margin top 24px, gap 12px, min-height 50–52px, full width, radio 9px, blanco, borde canónico, texto Manrope 14/600 tinta. Icono 18px y gap 10px, grupo centrado. Google G oficial multicolor; GitHub icono oficial negro o componente existente. Textos y orden: «Continuar con Google», «Continuar con GitHub». Hover papel, press y focus como landing. No otros proveedores. Conservar enlaces reales existentes, anteriormente documentados como /api/auth/oauth/google/start y /api/auth/oauth/github/start; verificar antes de tocar. No simular OAuth con timers ni notificaciones de éxito.
Divisor margin block 24px, línea 1px a cada lado, gap 12px, texto «O CONTINÚA CON» 11/700 tracking .1em secundario.

### Bloque LAIA sin cuenta
Fondo --ag-lilac, borde #e8e2fa, radio 12px, padding 16px. Fila icono 36px blanco con Sparkles violeta, radio 10px; gap 12px. Título «Habla con LAIA sin cuenta» Manrope 16/700, no serif. Descripción «Una primera conversación de 30 minutos, sin registro ni compromiso.» Manrope 13–14, secundario, leading 1.6. Mantener 30 minutos como objetivo comercial solicitado, sujeto a verificación real antes de publicar.
CTA margin top 16px, full width, 50px mínimo, radio 9px, violeta canónico, sombra y hover de lp-button-purple. Texto «Hablar con LAIA ahora», ArrowRight 16px. No badge adicional. El violeta se concentra aquí; no colorear todo el hero.
Al abrir: expandir chat dentro de esta card, no popup, sheet ni nueva página. CTA cambia a «Cerrar chat» con aria-expanded y aria-controls. Mantener la estructura estable. Superficie blanca borde canónico radio 13px; cabecera y mensajes con gramática lp-inline-chat. Mensaje inicial «Hola, soy LAIA. ¿Qué te gustaría quitarte de encima?»; historial desplazable si crece, mensajes usuario lila suave, respuesta LAIA legible sin globos pesados. Composer con borde superior, input placeholder «Cuéntale a LAIA qué necesitas…», enviar circular violeta 34px con ArrowUp. Enter envía cuando procede, no durante composición IME; botón accesible. Chips precargan y esperan envío. Mantener borrador al colapsar en la sesión; no persistir información sensible. No pedir email ni contraseña en conversación. Loading, error, reintento, límite alcanzado y sesión expirada con mensajes veraces. No respuestas empresariales simuladas ni temporizadores de éxito. Si no existe servicio anónimo real, prototipo con estado explícito de no disponibilidad y sin envío; no prometer acceso real. Aislamiento, rate limiting, privacidad y límite de sesión son requisitos del servicio, no implementarlos en esta campaña visual.

### Contraseña
Margin top 24px, centrado. «Entrar con contraseña» Manrope 13/600, subrayado fino y ChevronDown 12px. Colapsado inicialmente. Expandir inline, sin modal duplicado. Labels visibles «Email de tu empresa», «Contraseña», inputs 48–50px, radio 9px, borde canónico, focus violeta. Autocomplete email/current-password; mostrar/ocultar contraseña con control accesible. Botón tinta «Entrar». Usar onLogin y error reales; no cambiar contrato. «¿Olvidaste tu contraseña?» solo activo si existe flujo real. Validación, loading y errores anunciados; no guardar contraseña ni imprimirla. Mantener accesos de prueba preexistentes por su mecanismo actual, sin confundirlos con conversación pública.

## 7. Invitación y footer
Card separada debajo, gap 16px, fondo --ag-soft, borde canónico, radio 16px, padding 24px. H2 Fraunces 400 23–24px: «¿No tienes acceso todavía?». Descripción 14px, margin top 10px: «AgntiaPro funciona por invitación. Si tu equipo ya está dentro, pide que te inviten.» Eliminar referencia a Discord. CTA tinta, margin top 16px, full width, min-height 50px, radio 9px, texto «Conseguir una invitación», ArrowRight 16px. Hover #403e39. Microcopy centrado margin top 12px, 12px: «Te avisamos cuando haya sitio para tu empresa.» Conservar política de invitación como objetivo, verificar antes de publicar.
Modal de invitación: reutilizar Dialog/patrón existente si es compatible; overlay tinta translúcida sin blur excesivo, blanco, max-width 440px, radio 16px, padding 24px. H2 Fraunces 400 «Conseguir una invitación», X accesible. Texto «Déjanos un poco de contexto sobre tu empresa.» Campos nombre, email de empresa, empresa, «¿Qué te quita más tiempo?» (opcional). No añadir campos ajenos; si contrato real difiere, documentar bloqueo en lugar de inventarlo. Labels visibles, validación de requeridos/email, consentimiento opcional no premarcado si aplica. CTA «Pedir invitación». Solo tras confirmación real: «¡Listo! Te avisamos cuando haya sitio para tu empresa.» Opción «Hablar con LAIA sin cuenta» cierra modal y abre chat inline. Sin endpoint: estado no disponible, sin recogida persistente ni éxito falso. Escape, focus trap, retorno de foco, scroll móvil.
Footer debajo de invitación, margin top 24px, centrado 12px secundario: «© 2026 AgntiaPro · Aviso legal · Privacidad · Transparencia IA». Enlaces solo a rutas reales verificadas; no # ficticios. En móvil wrap con objetivos táctiles adecuados.

## 8. Movimiento y estados
Objetivo de motion de guía maestra, no afirmar que ya está implementado en landing. Header y estructura visibles desde primer paint. Entrada editorial: eyebrow/H1 → lead/beneficios como grupo → preview; card derecha entra en paralelo y luego invitación. Opacidad y translateY 6–10px, 400–600ms, stagger 45–70ms entre grupos, curva cubic-bezier(.22,1,.36,1). Sin ocultar controles hasta terminar ni animar cada palabra. Hover botones 200ms, translateY -2px como landing; active vuelve a 0. Chat/contraseña expansión 200–300ms con continuidad de layout y foco; modal 240–320ms, salida breve. Animar solo mensaje nuevo, no historial. Sin scroll-jacking, zoom agresivo ni loops. Reduced motion elimina desplazamientos y cascadas; contenido siempre visible si JS falla.
Estados explícitos: inicial, OAuth pendiente/error, chat abierto/cerrado/precargado/enviando/error/límite, contraseña abierta/cerrada/validación/loading/error, invitación abierta/cerrada/validación/pendiente/confirmada/error/no disponible. Estado inicial todo cerrado, borradores vacíos. No inventar datos de tenant.

## 9. Implementación y entrega futura
Solo tras autorización de ejecución: prototipo scoped en UI Lab, React/TS y CSS/tokens existentes, Lucide. No crear App.tsx global, index.css duplicado ni nueva librería de UI. Identificar primero registro de ruta de laboratorio y componentes reales; reutilizar BrandLockup, botones, Dialog y patrones de chat sin acoplar CSS global ni importar toda la landing a producción. Mantener Login.tsx y contratos de producción intactos durante prototipo. No tocar landing ni Studio. Si luego se autoriza integración, patch mínimo separado y pruebas de autenticación. No desplegar.
Fase 1: lectura y baseline; registrar inventario de componentes, rutas y capacidades reales. Fase 2: construir estado inicial y responsive, comparar con PNG y landing. Fase 3: estados interactivos, motion y accesibilidad sin simular servicios. Fase 4: pruebas y capturas; dejar informe en esta carpeta. Ejecutar secuencialmente sin pedir aprobación entre fases salvo bloqueo de permisos/contratos o cambio de alcance. Reportar en documentación, no en chat por cada archivo. Detenerse al final para revisión del founder.

## 10. Gate de aceptación
- Misma estructura y orden que PNG; sin cabecera del visor externo, sin nueva sección ni retrato grande.
- Marca real exacta, tokens canónicos, Fraunces 400, Manrope, eyebrow gris y línea dorada, botones radio 9px, chat y superficies coherentes.
- Copy de esta V3 literal salvo limitaciones verificadas que obliguen a corregir una promesa; registrar cualquier divergencia.
- Comparativa lado a lado con landing y mockup a 1366/1440px; capturas 320/360/390/430/768/1024/1920px. Revisar scroll, wrap, teclado, foco, contraste WCAG AA, reduced motion, errores, navegación y regresiones.
- Verificar OAuth y contraseña sin credenciales reales en capturas; no afirmar funcionamiento de servicios no probados.
- Build/typecheck y tests aplicables, registrar comandos y resultados reales. No declarar calidad visual por pasar tests.
- Entregar rutas de archivos, capturas, diferencias justificadas, bloqueos y pendientes. Founder aprueba visualmente antes de producción.

## 11. Nota editorial separada — landing
La landing sigue intacta. Su copy puede pulirse en otra revisión autorizada, manteniendo narrativa, composición y capacidades. No editarla como parte de login. Las propuestas de copy de esta V3 son decisiones editoriales para el acceso, no cambios de política comercial ni validación de disponibilidad.
