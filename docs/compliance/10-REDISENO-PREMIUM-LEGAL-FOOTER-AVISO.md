# AgntiaPro · Rediseño premium de páginas legales, footer y aviso de privacidad

**Fecha:** 2026-11-22 · **Estado:** auditoría de código y especificación de diseño, no implementado. **Rama:** feat/freebuff-compliance-integral. **Objetivo:** unificar las seis páginas legales y el aviso informativo con el sistema editorial premium de la landing, sin modificar el contenido jurídico aprobado ni la semántica de consentimiento.

## 00. Evidencia y límites
Se han leído en esta rama: apps/site/{aviso-legal,privacidad,cookies,terminos,transparencia-ia,confianza}.html; apps/web/src/landing/{Landing.jsx,landing.css}; apps/web/src/config/publicSite.ts; docs/compliance/reports/PUBLICACION-LANDING.md. El acceso HTTP externo a las páginas públicas falló desde el entorno de auditoría; **no se ha validado visualmente el sitio en producción**. La documentación previa reporta comprobaciones Playwright y que antes de publicar ciertas rutas daban 404; no confundir esos resultados históricos con una comprobación actual.

### Diagnóstico verificado
1. Los seis HTML legales repiten un bloque CSS inline oscuro: body background #0b0d12, texto #e8eaf0, enlaces #aabfff, system-ui, main max-width 800px. Contrasta con landing .agntia-landing.lp-premium: papel #fcfaf6, tinta #242421, violeta #6550dd, Fraunces + Manrope.
2. Los HTML repiten cabecera de dos enlaces y footer de seis enlaces, sin header editorial compartido, jerarquía de navegación ni estilo de marca.
3. Landing.jsx usa legalPages desde ../config/publicSite para los seis enlaces del footer y un aviso condicional legalVisible; se oculta mientras chat, modal de agente o menú están abiertos.
4. landing.css ya contiene reglas .lp-footer, .lp-legal-links y .lp-legal-notice, con posibles overrides al final; revisar cascada, especificidad y media queries antes de tocar.
5. apps/site/index.html sigue siendo una landing legacy oscura: **no confundir la eliminación futura de esa portada con la conservación de los seis HTML legales**.
6. docs/compliance/reports/PUBLICACION-LANDING.md explica la integración Vite de las páginas HTML en el origen de la landing y que el aviso es informativo, sin almacenamiento ni registro de consentimiento. El HTML de cookies describe Google Fonts; auditar tráfico real antes de afirmar que no hay terceros.
7. Los documentos legales llevan meta legal-status=published y legal-version=2026-11-21. Preservar estos metadatos y contenido legal.

## 01. Taxonomía de intervención
- L0 — Fuente de verdad, routing, contenido legal y garantías.
- L1 — Design system jurídico (tokens, tipografía, superficies, iconos).
- L2 — Layout y navegación de seis páginas.
- L3 — Centro de confianza y navegación transversal.
- L4 — Footer de landing y enlaces legales.
- L5 — Aviso informativo de privacidad; consentimiento solo si aplica.
- L6 — Motion, responsive y accesibilidad.
- L7 — QA, publicación y rollback.

## 02. L0 · Arquitectura y fuentes
Preservar archivos y rutas existentes: /aviso-legal.html, /privacidad.html, /cookies.html, /terminos.html, /transparencia-ia.html, /confianza.html. Mantener compatibilidad de enlaces directos, canonical, indexación y metadatos. Preferir CSS compartido apps/site/legal.css y shell común generado mediante script/build si la infraestructura existente lo admite; **no migrar a React sin demostrar necesidad**. Si se conserva HTML estático, usar header/footer idénticos en seis archivos mediante plantilla validada; no duplicar CSS inline. Revisar Vite multipage y scripts de copia/packaging antes de modificar rutas. Evitar cargar bundle completo del producto en páginas legales. No introducir analytics, trackers, SDK de consentimiento ni nuevas fuentes remotas sin revisión de privacidad.

## 03. L1 · Dirección artística: «Editorial Trust»
Continuación natural de landing: papel #fcfaf6, secciones crema sutil #f3efe7, tinta #242421, texto secundario #6e6c66, líneas #e6e1d8, violeta #6550dd, dorado #b49665. Titulares Fraunces, cuerpo Manrope con fallback local. Reutilizar el logo real/BrandLockup o equivalente SVG accesible y ligero. No copiar marca con texto plano improvisado. No aplicar fondo oscuro de forma general; reservar un bloque de contacto opcional en tinta si armoniza con la landing. Anchura editorial del cuerpo 680–760px, contenedor exterior 1120–1200px; 16–18px cuerpo, line-height 1.65–1.8; H1 clamp(36px,5vw,64px); H2 23–30px. Etiquetas pequeñas con contraste suficiente; aire entre apartados 32–52px. Prohibido esconder textos legales tras acordeones cerrados por defecto.

## 04. L2 · Composición de página
Header: logo izquierda, enlace «Volver a AgntiaPro», acceso discreto a «Confianza y seguridad»; versión móvil sin menú innecesario. Hero legal: eyebrow «AGNTIAPRO / INFORMACIÓN Y CONFIANZA», H1 editorial, descripción introductoria solo si no altera alcance jurídico, metadato «Versión 21 nov 2026». Desktop: columna central de lectura + índice lateral sticky de secciones (derivado de h2), ocultar índice sticky en móvil y ofrecer índice compacto no obstructivo. Secciones numeradas opcionalmente solo como decoración fuera del texto jurídico. Bordes finos, sin cajas grandes por párrafo. Enlaces con subrayado y focus visible; enlaces externos identificados accesiblemente. Cierre: contacto y enlaces a documentos hermanos. Footer igual al universo visual de landing. Mantener heading hierarchy y HTML semántico main/nav/article/section/footer.

### Seis fichas de diseño
1. **Aviso legal:** identificación, actividad, uso/propiedad, responsabilidad, contacto; presentación sobria y verificable.
2. **Privacidad:** priorizar legibilidad de finalidades, derechos, contacto, conservación y destinatarios según copy existente; tablas responsivas solo si ya están justificadas.
3. **Cookies:** distinguir tecnologías y configuraciones reales; nunca ofrecer controles ficticios.
4. **Términos:** estructura numerada y navegación por epígrafes; no alterar alcance informativo ni cláusulas.
5. **Transparencia IA:** reforzar claridad visual de que LAIA es IA y qué partes son demo; sin inventar capacidades, garantías o certificaciones.
6. **Confianza y seguridad:** convertirla en hub visual de las seis páginas mediante tarjetas editoriales sobrias, no en una página de marketing con claims de seguridad no demostrados.

## 05. L3 · Centro de confianza
/confianza.html será el punto de navegación transversal: seis tarjetas de documentos con título, descripción neutral, icono lineal consistente y enlace; sección de contacto y fecha de actualización. No usar badges «RGPD certificado», «seguridad garantizada», «100% privado» o logos de certificaciones sin evidencia. Enlaces cruzados desde todas las páginas. Respetar copy jurídico aprobado; descripciones de tarjetas deben verificarse contra el texto real.

## 06. L4 · Footer
En Landing.jsx conservar las seis rutas centralizadas legalPages. Ajustar footer a la grilla de columnas actual, sin convertirlo en una lista kilométrica; agrupar «Producto», «Recursos» y «Legal / Confianza» si cabe sin romper el layout. En móvil: columnas de dos o una según anchura, tap targets ≥44px recomendados, no texto minúsculo. En las páginas legales, footer hermano de la landing con marca, contacto y links. Evitar estilos globales que afecten app autenticada; scope con .agntia-legal o .lp-premium. Tests de navegación de vuelta al home, links absolutos/relativos, base path y refresh directo.

## 07. L5 · Aviso informativo / banner
**Código actual:** legalVisible en Landing.jsx, bloque .lp-legal-notice con enlaces Privacidad y Cookies y botón cerrar; se oculta con chat/modal/menú. Según documentación, no escribe consentimiento ni storage. Por tanto llamarlo «aviso informativo», no «cookie consent», salvo que auditoría de cookies indique necesidad.

### Diseño propuesto
- Desktop: toast editorial flotante bottom-left o bottom-center, max-width 420–480px, fondo papel, borde #e6e1d8, sombra cálida suave, radio 16–18px, padding 18–22px. Icono shield/lock fino violeta, título «Información legal y privacidad», copy existente, enlaces subrayados «Privacidad» y «Cookies», cierre claramente etiquetado. No bloquear hero ni CTA.
- Móvil: bottom sheet compacto, ancho viewport menos safe-area/márgenes, no tapa botón de chat, input ni CTA; posibilidad de cierre con botón grande. No tapar teclado virtual. Evitar backdrop bloqueante.
- Entrada única por sesión de visualización (sin inventar persistencia): 280–360ms opacity + translateY(8px); salida 180–220ms. Reduced motion: instantánea.
- Si la auditoría encuentra cookies no esenciales: diseñar **separadamente** gestor real con «Aceptar», «Rechazar» y «Configurar» de prominencia comparable, bloqueo previo de scripts, granularidad y revocación persistente. Nunca sustituir consentimiento obligatorio por simple X; no implantar sin inventario actualizado y asesoramiento jurídico.
- Evitar textos que impliquen consentimiento al cerrar; no almacenar un «consent=true» al cerrar aviso informativo.

## 08. L6 · Movimiento y accesibilidad
Transiciones 160–240ms hover, 280–420ms entrada, 500–650ms reveal editorial opcional. Header con transición sutil de borde/sombra, índice activo por IntersectionObserver, enlaces con underline, tarjetas de confianza con elevación 2px. Nada de parallax pesado, scroll-jacking o revelar el texto legal de modo que quede invisible si JS falla. CSS preferido; no introducir Motion solo para estas páginas. prefers-reduced-motion: reduce; teclado, Escape donde aplique, focus visible, contraste WCAG AA, 200% zoom, 320px sin overflow, landmarks y skip-link. No ocultar contenido legal detrás de animaciones.

## 09. L7 · Campañas para implementación
**C00 Inventario**: confirmar rama, commit desplegado, rutas y CSS de seis HTML; capturas 1440/390/320; DevTools Network y cookies/storage antes/después; confirmar origen de Fonts y scripts. Baseline Lighthouse/axe.
**C01 Design tokens**: CSS compartido y shell accesible sin tocar textos; tests de igualdad de copy por extracción DOM/hash normalizado.
**C02 Seis páginas**: refactor header, hero, índice, cuerpo y footer, preservando exactamente contenido, meta tags y rutas.
**C03 Confianza**: hub editorial, tarjetas y navegación cruzada, sin claims nuevos.
**C04 Footer React**: alinear grilla y responsive con landing premium, mantener legalPages.
**C05 Aviso**: rediseñar .lp-legal-notice, estados, teclado, móvil; sin introducir cookies/consent ficticio.
**C06 Motion & QA**: microinteracciones, reduced motion, responsive, pruebas de enlaces, contrastes, snapshots.
**C07 Preflight y release**: typecheck/build/test legal/link checker/release gate/Playwright escritorio y móvil, comparar screenshots y métricas, revisar Vercel scope=site; no desplegar API/worker por un cambio puramente visual. Merge/deploy solo tras aprobación.

## 10. Criterios de aceptación
- Las seis páginas parecen parte de la misma marca que la landing Fraunces/Manrope, no una segunda web oscura.
- Ninguna palabra del contenido legal aprobado cambia sin revisión expresa; conservar version y published.
- URLs existentes funcionan en acceso directo y desde el footer; no 404 ni redirecciones al login.
- Footer de landing no se rompe en móvil; todas las rutas correctas.
- Aviso elegante, legible, cerrable y no intrusivo; semántica fiel a su función informativa.
- Si no hay cookies no esenciales, no inventar banner de consentimiento. Si las hay, activar proyecto de consentimiento aparte.
- Páginas sin dependencia de JS para leer texto; keyboard/screenreader y reduced-motion correctos.
- Build, gate legal, Playwright, enlace checker y contraste pasan; reportar resultados reales.
- Ninguna modificación de backend, textos comerciales, precio, API, worker, ni landing legacy en esta campaña.

## 11. Riesgos y handoff
La rama feat/freebuff-compliance-integral tiene copia de la landing React y los HTML legales; comparar con release/landing-legal-20261122 y feat/landing-premium-funnel para no sobrescribir mejoras de motion ni cambios recientes. El informe PUBLICACION-LANDING.md contiene comprobaciones históricas, no prueba actual de producción. El acceso web directo a agntiapro.com no fue posible durante esta auditoría: un agente con navegador debe capturar y verificar el sitio publicado antes de programar. No borrar apps/site/index.html sin resolver el entrypoint de deploy. Mantener separación entre publicación informativa y activación de servicios operativos.

**Regla de diseño:** la confianza no debe parecer un anexo legal añadido al final, sino una extensión natural de la identidad premium de AgntiaPro.
