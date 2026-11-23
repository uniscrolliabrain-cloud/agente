# 05 · Matriz de aceptación UX/UI

**Gate principal:** calidad visual comparada con Landing y Estudio Demo REALES, no solo con mockups. Un resultado «funciona pero es cutre» = FAIL.

| ID | Prueba | Evidencia requerida |
|---|---|---|
| UX01 | Misma identidad cromática/tipográfica que Landing activa | capturas lado a lado + tokens citados |
| UX02 | Jerarquía, aire, microdetalles y profundidad a nivel Landing/Studio | revisión visual founder |
| UX03 | No duplicación del shell global | inspección DOM/rutas |
| UX04 | Home, colecciones y búsqueda con 120 registros canónicos | test catálogo + captura |
| UX05 | IA, R, P diferenciados; drafts no se reproducen como vídeos reales | tests de disponibilidad |
| UX06 | Mini-player persiste al navegar dentro de Formación | test interacción |
| UX07 | Vídeo 9:16, subtítulos y controles accesibles | prueba con media real licenciada cuando exista |
| UX08 | Cola y biblioteca personal con estado honesto | prueba de navegación |
| UX09 | Modos Trabajo/Aprender/Explorar elegidos por usuario | test cambio de modo |
| UX10 | CTA LAIA no ejecuta acciones no autorizadas | test bloqueo |
| UX11 | 1440/768/390/360 px sin overflow ni controles tapados | 4 capturas |
| UX12 | Teclado, foco visible, contraste y reduced motion | audit accesibilidad |
| UX13 | Entradas, sheets y player sin saltos de layout | walkthrough |
| UX14 | Cero cambios a backend/landing/studio/deploy | diff de archivos |
| UX15 | Revisión visual explícita del founder | aprobación registrada |
| UX16 | Escena y sheet mantienen jerarquía a 360/390px | capturas peek/half/full |
| UX17 | Gesto completo y scroll de episodios sin conflicto | grabación + test táctil/teclado |
| UX18 | Safe areas, teclado, orientación, FAB chat y navegación sin solaparse | capturas y walkthrough |
| UX19 | Snap y tabs preservan selección/foco; reduced motion | test de continuidad y accesibilidad |
| UX20 | Landing = editorial; Studio = controles; mockup Formación = composición | matriz comparativa de tres referencias |

**Test data:** catálogo 120; portada ausente; vídeo ausente; permisos denegados; biblioteca vacía; búsqueda sin resultados; modo exploración; usuario sin historial; error de player; offline; título largo; texto escalado 200%.

**Cierre:** PASS técnico + PASS visual + PASS accesibilidad + aprobación founder. Ninguna de estas condiciones se declara superada por escribir la documentación.
