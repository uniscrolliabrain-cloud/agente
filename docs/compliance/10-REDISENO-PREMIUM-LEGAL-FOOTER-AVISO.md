# AgntiaPro — Especificación de rediseño del sistema legal público
**Versión:** 1.0 · **Fecha:** 22-11-2026 · **Estado:** auditoría de código y diseño propuesto, NO implementado  
**Rama documental:** `feat/freebuff-compliance-integral`  
**Ámbito:** seis páginas legales, footer de la landing React, aviso informativo de privacidad.  
**Principio rector:** no crear otra estética: extender fielmente los componentes reales de la landing editorial premium.

## Índice
1. Evidencia y límites
2. Inventario y taxonomía
3. ADN visual comprobado
4. Contrato de arquitectura y contenido
5. Especificación de las seis páginas
6. Footer: intervención mínima
7. Aviso legal informativo: intervención mínima
8. Movimiento, accesibilidad y responsive
9. Campañas secuenciales
10. Pruebas y aceptación
11. Riesgos, decisiones y handoff

## 1. Evidencia y límites

**Fuentes de código inspeccionadas en esta rama:** `apps/web/src/landing/Landing.jsx`, `apps/web/src/landing/landing.css`, `apps/web/src/landing/ProductScene.jsx`, `apps/web/src/config/publicSite.ts`, `apps/site/aviso-legal.html`, `privacidad.html`, `cookies.html`, `terminos.html`, `transparencia-ia.html`, `confianza.html` y `docs/compliance/reports/PUBLICACION-LANDING.md`. Se identificó el uso de `BrandLockup` desde `../components/BrandMark`; **su implementación interna debe inspeccionarse antes de reutilizarla**.

**Hallazgo verificable:** los seis HTML legales comparten CSS inline con fondo oscuro `#0b0d12`, texto `#e8eaf0`, enlaces azul claro `#aabfff` y tipografía system-ui. No comparten la apariencia de la landing React. El footer de la landing ya contiene seis enlaces correctos por `legalPages` y el aviso se controla con `legalVisible`. La documentación de publicación afirma integración multipágina mediante Vite y pruebas históricas; no es una prueba de la versión actualmente servida.

**Límite:** no se inspeccionó visualmente el sitio público desde navegador en esta auditoría. Las decisiones estéticas se basan en el código real y en las capturas de la landing compartidas por el titular. Antes de programar: comparar screenshots de producción, rama de release y rama de compliance.

## 2. Inventario y taxonomía

| ID | Superficie | Fuente | Acción |
|---|---|---|---|
| L0 | Routing, build, metadatos | `apps/site/*.html`, Vite, `publicSite.ts` | Conservar URLs y publicación |
| L1 | Tokens, marca, tipografía | `landing.css`, `BrandMark` | Extraer y reutilizar |
| L2 | Plantilla documental | Seis HTML de `apps/site` | Sustituir CSS oscuro por shell editorial |
| L3 | Confianza y seguridad | `apps/site/confianza.html` | Hub documental dentro del mismo lenguaje |
| L4 | Footer React | `Landing.jsx`, `.lp-footer*`, `.lp-legal-links` | Ajuste de banda legal, sin rehacer footer |
| L5 | Aviso informativo | `legalVisible`, `.lp-legal-notice` | Refinar componente existente |
| L6 | Motion/a11y/responsive | CSS + estados React | Microinteracciones discretas |
| L7 | Tests/release | Scripts legales, Playwright, Vite | Verificar y entregar sin desplegar automáticamente |

## 3. ADN visual de AgntiaPro — contrato vinculante

### 3.1 Tokens comprobados
- `.agntia-landing.lp-premium`: papel `#fcfaf6`, tinta `#242421`, secundario `#6e6c66`, línea `#e6e1d8`, violeta `#6550dd`, dorado `#b49665`.
- Fraunces en titulares; Manrope en UI y cuerpo.
- `.lp-container` determina el ancho de composición. **No fijar un contenedor alternativo sin contrastarlo con el CSS existente**.
- Hero `.lp-hero`: grid `1.08fr 1fr`, gap 74px en su regla base; H1 con `letter-spacing: -0.052em`. Reutilizar la gramática tipográfica, no copiar literalmente el tamaño del hero a documentos largos.
- `.lp-premium .lp-button`: radio 9px, alto mínimo 50px, hover `translateY(-2px)`. No botones pill.
- `.lp-footer-main`: cuatro columnas `1.4fr 1fr 1fr 1.3fr`; logo `BrandLockup`, claim «Tu empresa, siempre un paso por delante», grupos «Explora» y «Hablemos», nota «AGNTIAPRO + TU EMPRESA». Banda inferior `.lp-legal-links` y `.lp-footer-bottom`.
- `.lp-reserve-section` utiliza `#232420` como contraste de conversión; **no extenderlo a los documentos legales**.
- `.lp-legal-notice`: bottom-left, ancho `min(330px, calc(100% - 24px))`, padding `12px 14px`, radio 12px, fondo papel, borde fino. Esta es la base, no una plantilla de toast inventada.

### 3.2 Reglas negativas
Prohibido: degradados nuevos, glassmorphism, ilustraciones stock, iconografía decorativa de escudos gigantes, tarjetas con radios 18–24px por defecto, botones tipo píldora, sombras profundas, modo oscuro legal, titulares sans genéricos, CTA comerciales insertados dentro de obligaciones jurídicas o cualquier nuevo sistema visual de inspiración externa. **Las capturas reales de la landing son la referencia visual de aceptación.**

### 3.3 Sistema compartido
Extraer variables y patrones sin arrastrar el bundle entero de React a los HTML legales. Candidato: `apps/site/legal.css` con tokens derivados de `landing.css` y clases `.agntia-legal`. No copiar CSS de forma ciega: verificar cascada, fuentes, licencia de assets, responsive y dependencia de Google Fonts. Reutilizar el SVG/logo real de `BrandMark` solo tras inspeccionar su implementación y ruta pública. Mantener el contenido legal legible si las fuentes externas fallan.

## 4. Contrato de arquitectura y contenido

- Mantener estas rutas exactas: `/aviso-legal.html`, `/privacidad.html`, `/cookies.html`, `/terminos.html`, `/transparencia-ia.html`, `/confianza.html`.
- Mantener los metadatos `legal-status=published` y `legal-version=2026-11-21`, salvo actualización jurídica aprobada. Preservar títulos y encabezados legales.
- El texto jurídico aprobado es **inmutable para esta campaña**: comprobar igualdad de contenido normalizado antes/después, incluyendo datos identificativos y enlaces. No mover cláusulas a acordeones cerrados.
- Reutilizar enlaces centralizados desde `legalPages` en React; los HTML estáticos pueden usar enlaces relativos verificados. Mantener origen, canonical y acceso directo.
- Preferir HTML semántico ligero + CSS compartido, con `main`, `nav`, `article`, `section`, `footer`, `h1/h2`. Si se propone plantilla/generador común, verificar primero scripts de empaquetado Vite y control legal. No migrar a React sin justificación técnica.
- Mantener separadas landing pública demo y app operativa. No tocar backend, Fly, auth, APIs, contenido comercial ni portada legacy `apps/site/index.html` sin plan independiente.
- Evitar nuevas cookies, trackers o SDK de consentimiento. Verificar solicitudes a Google Fonts y otros terceros con Network antes de cualquier afirmación de cumplimiento.

## 5. Especificación de las seis páginas

### 5.1 Shell editorial compartido
1. **Header:** mismo lockup real que la landing, mismo fondo papel, navegación discreta «Volver al inicio» y acceso a «Confianza». Sin crear un menú SaaS paralelo.
2. **Intro:** microetiqueta sobria con tratamiento `.lp-micro` y, si encaja, línea dorada `.lp-gold-line`; H1 Fraunces, subtítulo solo si no introduce nuevas afirmaciones; fecha/versión en Manrope secundaria.
3. **Cuerpo:** ancho de lectura aproximado 680–760px *dentro* del contenedor maestro; espaciado generoso entre secciones, subtítulos claros, líneas finas `--lp-line`, enlaces subrayados y foco visible. Evitar cards por cada párrafo.
4. **Navegación interna:** índice de secciones opcional en escritorio, discreto y no sticky si interfiere con lectura; en móvil índice compacto. No esconder contenido.
5. **Cierre:** enlaces a documentos hermanos y contacto existente, sin añadir garantías.
6. **Footer:** reutilizar estructura editorial y lenguaje de `.lp-footer`, adaptado a navegación legal, con cuatro columnas cuando el viewport lo permita.

### 5.2 Reglas por documento
| Documento | Tratamiento visual | Cautela |
|---|---|---|
| Aviso legal | Título, versión, secciones de identificación y actividad bien espaciadas | No editar datos del prestador |
| Privacidad | Jerarquía de finalidades, derechos y contacto fácil de escanear | No inventar plazos, bases o proveedores |
| Cookies | Estructura muy clara de tecnologías, terceros y gestión | Confirmar inventario real antes de cambiar texto |
| Términos | Secciones y navegación editorial ordenadas | No alterar obligaciones ni ámbito |
| Transparencia IA | Jerarquía limpia de información sobre LAIA y demo | No sugerir IA autónoma activa o garantías inexistentes |
| Confianza | Hub de documentos con enlaces sobrios en el lenguaje de la landing | No certificaciones, badges ni promesas de seguridad sin evidencia |

**Confianza no debe parecer un dashboard**: si se usan tarjetas, derivarlas de componentes ya presentes en la landing; de lo contrario, usar lista editorial con separadores finos.

## 6. Footer — intervención mínima y precisa

### 6.1 DOM existente que debe conservarse
`<footer className="lp-footer"><div className="lp-container"><div className="lp-footer-main">...` contiene marca/claim, «Explora», «Hablemos» y nota editorial. Después vienen `<nav className="lp-legal-links">` con seis enlaces y `.lp-footer-bottom` con copyright y disclaimer demo.

### 6.2 Problema y solución
El añadido de seis enlaces legales puede romper ritmo visual y wrapping de la franja inferior, sobre todo en tablet y móvil. **No rehacer la retícula de cuatro columnas.** Revisar `.lp-legal-links` (gap actual 8px 20px, flex-wrap) y su posición frente a `.lp-footer-bottom`. Establecer orden y agrupación visual con separadores sutiles o dos filas controladas cuando sea necesario, manteniendo los seis links visibles. Ajustar alineación y tipografía con el resto del footer. No introducir nuevas columnas de navegación ni duplicar enlaces.

### 6.3 Aceptación footer
- A 1440px la banda legal se integra sin dominar la composición.
- A 768px no hay enlaces huérfanos ni colisiones con la nota editorial.
- A 390px y 320px todos los enlaces son legibles, clicables, sin scroll horizontal y sin interferir con copyright.
- `BrandLockup`, claims y grupos existentes intactos.

## 7. Aviso informativo — refinamiento del componente real

### 7.1 Estado y semántica comprobados
`legalVisible` empieza en `true`; aviso `aside.lp-legal-notice` se muestra si `!chatOpen && !selectedAgent && !menuOpen`; contiene título «Información legal y privacidad», texto descriptivo, enlaces a Privacidad y Cookies y botón X. Según documentación previa, no registra consentimiento ni escribe en storage.

### 7.2 Rediseño exacto
- Conservar anclaje inferior izquierdo, ancho de 330px, padding 12px 14px, radio 12px, borde `--lp-line` y fondo `--lp-paper`.
- Mejorar únicamente jerarquía tipográfica, interlineado, alineación de la X, espaciado entre texto y links y sombra cálida casi imperceptible.
- Título tinta; descripción muted; enlaces con el mismo subrayado de `.lp-premium .lp-legal-notice a`. Sin iconos grandes ni botón morado de «Aceptar».
- Entrada `opacity:0→1` y `translateY(6px)→0` en 200–280ms; salida 180–220ms, con desmontaje controlado si se anima la salida. Reduced-motion: instantáneo.
- Comprobar convivencia con launcher «Hablar con LAIA», menús, diálogos y teclado virtual. Si el ancho móvil no permite mantener el anclaje, ajustar margen y max-width, **sin convertirlo en un bottom-sheet modal**.
- Cerrar X significa **cerrar aviso**, no aceptar cookies.

### 7.3 Decisión legal pendiente de evidencia
Auditar cookies, localStorage, solicitudes a terceros y scripts reales en producción. Si se usan tecnologías opcionales que requieren consentimiento, crear una campaña independiente de consentimiento con bloqueo previo, rechazo y configuración equivalentes, revocación y persistencia adecuada; nunca disfrazar consentimiento de simple aviso.

## 8. Motion, accesibilidad y responsive
- Motion de nivel editorial: enlaces 160–220ms, hover de botones según landing (200ms), aviso 200–280ms. Sin parallax ni reveals que oculten texto jurídico.
- `prefers-reduced-motion: reduce`: eliminar desplazamientos, suavizado de scroll y animaciones no esenciales.
- Focus visible; landmarks; skip link; jerarquía H1/H2; contraste WCAG AA; zoom 200%; viewport 320px sin overflow; touch targets adecuados; idioma `lang=es`.
- Las páginas legales deben ser legibles sin JS; no usar `opacity:0` como estado base.
- Verificar carga de fuentes, CLS, navegación directa y lector de pantalla. CSS scoped `.agntia-legal` para evitar afectar app autenticada.

## 9. Campañas secuenciales de implementación

**C00 · Preflight (solo lectura).** Confirmar SHA realmente desplegado, Vercel root/output, ramas `feat/freebuff-compliance-integral`, `release/landing-legal-20261122`, `feat/landing-premium-funnel`. Inspeccionar `BrandMark`, tokens completos, cascada final y scripts Vite. Capturar landing (hero, footer, CTA y aviso) y seis páginas a 1440/768/390/320. Registrar Network, cookies, storage, Lighthouse y pruebas actuales.

**C01 · Fuente de verdad visual.** Extraer tokens a CSS legal scoped; preparar lockup, header y footer a partir de componentes reales, sin inventar otros. Revisar fuentes y assets.

**C02 · Plantilla de lectura.** Aplicar shell a los seis HTML manteniendo el texto jurídico byte-for-byte cuando sea posible; comparar DOM normalizado para verificar igualdad. Preservar metadatos.

**C03 · Confianza.** Mejorar la navegación de `confianza.html` con la gramática visual real; validar cada link y evitar claims nuevos.

**C04 · Footer.** Ajustar únicamente `.lp-legal-links` y responsive necesario; conservar `.lp-footer-main`, textos y navegación.

**C05 · Aviso.** Refinar `.lp-legal-notice` y su interacción; probar superposiciones, teclado, X y reduced-motion.

**C06 · QA visual y accesible.** Screenshots comparativos, Playwright desktop/mobile, axe o auditoría equivalente, navegación por teclado, zoom, 320px, enlaces directos, performance, cookies y storage.

**C07 · Release controlado.** Ejecutar `check-legal-site`, release gate, tests/build/typecheck y smoke de seis URLs; documentar comandos exactos y resultados. Preparar PR y rollback. **No merge ni deploy sin aprobación del titular**; no desplegar API/worker por este cambio visual.

### Entregable obligatorio por campaña
Commit acotado, lista de archivos tocados, screenshots antes/después, pruebas ejecutadas con resultado real, regresiones conocidas, decisión de continuar o bloquear y nota de handoff.

## 10. Pruebas y criterios de aceptación
- [ ] Seis documentos con la misma identidad visual de la landing, sin CSS dark legacy.
- [ ] Misma marca real, Fraunces/Manrope, colores, bordes y proporciones verificadas con screenshots.
- [ ] Contenido legal, metadatos, enlaces y rutas preservados; ninguna cláusula alterada sin aprobación.
- [ ] Footer de cuatro columnas conservado y banda legal equilibrada en escritorio/móvil.
- [ ] Aviso mantiene semántica informativa, X funcional y no tapa controles.
- [ ] Seis URLs abren directamente sin 404, redirecciones al login ni enlaces rotos.
- [ ] Sin regresiones de accesibilidad, performance, fuentes ni CLS significativas.
- [ ] Sin nuevas cookies o trackers no auditados; consentimiento real separado si procede.
- [ ] No se modifica backend, app operativa, precios, copy comercial ni legacy index.
- [ ] Capturas comparativas aprobadas por el titular antes de publicar.

## 11. Riesgos, decisiones y handoff
1. **Divergencia de ramas:** la landing premium aparece en varias ramas; comprobar diferencias antes de aplicar cambios para evitar sobrescribir motion u otras mejoras.
2. **Build multipágina:** `apps/site` contiene portada legacy y seis documentos legales; no borrar directorio ni rutas por confundirlos.
3. **Dependencia de fuentes:** la landing carga Google Fonts; revisar transferencia de datos y rendimiento si se replica en legal.
4. **Aviso vs consentimiento:** no son equivalentes. Una X no prueba consentimiento.
5. **Producción no verificada visualmente:** el implementador debe confirmar screenshots y HTTP actuales antes de afirmar que la corrección está publicada.
6. **Copy aprobado:** separar diseño de revisión jurídica; cualquier hallazgo sustantivo se escala al titular, no se corrige silenciosamente.

### Instrucción final al agente
Trabaja sobre la rama confirmada, compara con la landing premium real y conserva el código operativo. No uses mockups ni imágenes de terceros como autoridad de diseño. No hagas cambios de contenido legal. Reporta avances campaña por campaña, con capturas y pruebas. **El criterio de éxito no es “parece premium”: es “parece exactamente AgntiaPro”.**
