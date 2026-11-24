# Campaña Legal V1 · vista construida en UI Lab

**Fecha:** 2026-11-24 · **Rama:** `feat/ui-lab-login-v3` · **Vista:** `legal` en UI Lab
(`apps/ui-lab/src/legal/LegalV1.tsx` + `legal-v1.css`) · **Registro:** `apps/ui-lab/src/registry.tsx`

## 1. Punto de partida real

En el código no existía ninguna vista legal: esta carpeta solo tenía documentos de intención. Las seis
rutas de `legalPages` (`aviso-legal.html`, `privacidad.html`, `terminos.html`, `cookies.html`,
`transparencia-ia.html`, `confianza.html`) están **declaradas** en `apps/ui-lab/src/vendor/config/publicSite.ts`,
pero `apps/site` solo contiene `index.html`: ninguna está publicada y no hay textos aprobados.

El mockup aportado por el founder marcaba la dirección editorial y, a la vez, enseñaba cosas que no
existen. La vista construida conserva la dirección y elimina lo que no se sostenía.

## 2. Qué se corrige del mockup

| Mockup | Problema | Decisión en la vista |
|---|---|---|
| «Última actualización: 26 noviembre 2026» | Fecha inventada; el documento no existe | «Sin fecha de vigencia: no hay documento aprobado que citar» y campo `Vigencia: sin fecha aprobada` |
| Texto legal redactado (titular, actividad, contacto) | Simula cumplimiento con texto no validado | Cada sección declara «Texto pendiente de validación jurídica»; solo se muestra el esquema de secciones |
| Botón «Ver detalle» en cada bloque | Acción que no lleva a ningún sitio | Fuera: la sección ya es el detalle; se sustituye por «Copiar enlace» real (`#documento-sección`) |
| Buscador sobre el cuerpo | Buscaba en un texto que no existe | Busca en los títulos y resúmenes de sección del documento, con contador y estado sin coincidencias |
| Botón «Copiar texto» | Copiaba un documento inexistente | Fuera; se copia el enlace a la sección, con confirmación `aria-live` y hash visible si el portapapeles falla |
| «Gestionar cookies» sin efecto | CTA falsa | Abre un diálogo real de preferencias que guarda la elección en `localStorage` y permite borrarla |
| Tabs de documentos + índice lateral duplicado | Dos navegaciones para lo mismo, y en móvil se comprimen | Un solo índice por documento: lateral pegajoso en escritorio, fila de chips en móvil |
| «Necesitas adaptarlo?» | No hay servicio asociado | Fuera: nada de tarjetas que insinúen un contacto inexistente |
| Seis entradas mezcladas con cinco | Faltaba «Confianza» | Seis documentos con estado propio; «Confianza» aparece como **no disponible** |
| Tres banners decorativos | Botones «Ver condiciones» / «Revisar propuesta» sin destino | Banners con acción real: consentimiento guardado, explicación desplegable e invitación que declara no estar conectada |

## 3. Arquitectura

- **Portada editorial:** kicker, titular serif en dos líneas, lead, estado de los textos, acción principal
  única («Cómo decide LAIA») y secundaria suave.
- **Entrada destacada + índice:** una pieza destacada de Transparencia IA y una lista de seis documentos
  con estado (`Esquema` / `No disponible`), `aria-current` en el documento abierto.
- **Lector:** ficha del documento (estado, ruta pública declarada, vigencia), buscador de secciones,
  índice con sección activa por `IntersectionObserver`, columna de lectura de 68ch y secciones con
  anclaje propio.
- **Estados:** documento no disponible, búsqueda sin coincidencias, sección sin texto, consentimiento sin
  elección / guardado / borrado, invitación no conectada e IA desplegada.
- **Banners reutilizables:** cookies (claro), IA (lila) e invitación (tinta), mismo lenguaje visual.

## 4. Accesibilidad y responsive (medido)

- Un `h1`, `h2` por bloque y `h3` por sección; `aria-live` en contador de búsqueda, estado de
  consentimiento, copia y aviso de invitación; `aria-expanded`/`aria-controls` en IA e invitación.
- Foco visible violeta en todos los controles; salto a «Ir al documento»; `<dialog>` nativo con Escape,
  clic en el fondo y retorno de foco al botón que lo abrió.
- Sin `prefers-reduced-motion`: desplazamientos y transiciones a cero.
- Medido a 1366: H1 76 px en dos líneas, destacada 543 px, título de documento 48 px, sin overflow.
- Medido a 390: H1 38 px, una sola columna de 335 px, lector a partir de 1703 px (portada 184,
  destacada 721, índice 1034), diálogo de 337 px dentro del viewport, sin overflow horizontal.
- Diálogo de preferencias a 1366: 520 × 419 px con 32 px de padding.

## 5. Contenido

No se ha inventado texto jurídico ni fechas. Cada documento muestra su **esquema de secciones**
(títulos y una línea de qué tratará cada una) derivado del mandato de diseño, no del texto legal. Cuando
exista texto aprobado, se sustituye el bloque «Texto pendiente de validación jurídica» sin tocar la
estructura.

## 6. QA ejecutado en este entorno

`typecheck` y `build` en verde. Navegador Cloud real sobre el build servido en local:

- Navegación a los seis documentos; «Confianza» muestra el estado no disponible y oculta buscador e
  índice (`sections: 0`).
- Preferencias: diálogo abierto, guardado con medición activada → `localStorage.agente_cookies_v1`
  contiene `{"measurement":true,…}` y el banner pasa a «Guardada en este navegador · medición activada».
- Búsqueda: «derechos» en Aviso legal → 0 de 3; consulta imposible → estado «Ninguna sección coincide
  con «…»».
- Capturas: `capturas/legal-v1-1366.png`, `legal-v1-documento-1366.png`, `legal-v1-banners-1366.png`,
  `legal-v1-no-disponible-1366.png`, `legal-v1-preferencias-1366.png`, `legal-v1-390.png`,
  `legal-v1-documento-390.png`, `legal-v1-banners-390.png`, `legal-v1-preferencias-390.png`.

No se ha ejecutado QA automatizado en CI para esta vista, no se ha desplegado y no se ha fusionado a
`main`.

## 7. Pendientes

- Textos jurídicos aprobados por revisión legal; hasta entonces la vista declara el hueco.
- Páginas públicas reales para las seis rutas de `legalPages`.
- Aprobación visual del founder (no se declara calidad final).
- Backend de consentimiento: hoy la elección vive solo en el navegador, y la UI lo dice.
- Revisión de contraste con herramienta dedicada y prueba con lector de pantalla: no ejecutadas.
