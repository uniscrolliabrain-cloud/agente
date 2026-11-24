# QA — Login V3 (UI Lab)

Fecha: 2026-11-24 · Rama `feat/ui-lab-login-v3` · Prototipo aislado, sin backend conectado.
Rutas: `/?embed=1&view=login-v3` (solo diseño) y `/?view=login-v3` (selector del laboratorio).

Esta pasada corrige exclusivamente las desviaciones señaladas en la auditoría del founder. No hay
rediseño, ni cambios de copy, ni de composición, ni de orden de bloques.

## 1. Alcance construido

- `apps/ui-lab/src/login-v3/LoginV3.tsx` y `login-v3.css` (namespace `.login-v3`, tokens `--ag-*`).
- Fuentes locales en `apps/ui-lab/src/login-v3/fonts/` (Fraunces y Manrope, licencia OFL).
- Registro `login-v3` en `apps/ui-lab/src/registry.tsx` con `status: "fixture"`.
- QA de navegador versionado en `apps/ui-lab/scripts/qa-login-v3.mjs`.
- Paso `login-v3-chromebook` en `.github/workflows/ui-lab.yml` (job build, sin tocar deploy).
- Sin cambios en `apps/web/src/components/Login.tsx`, landing, Studio, kernel, rutas ni backend.
- Sin llamadas de red productivas: OAuth, contraseña, chat e invitación declaran entorno de prueba.

## 2. Comandos ejecutados y resultado real

Se separa lo que se ejecutó en este entorno de lo que ejecutó GitHub Actions, porque no es lo mismo:

| Comando | Dónde | Resultado |
|---|---|---|
| `pnpm --filter @agente/ui-lab typecheck` | este entorno | OK (exit 0) |
| `pnpm --filter @agente/ui-lab build` | este entorno y CI | OK (exit 0); `LoginV3-*.js` 14,80 kB y CSS 14,94 kB |
| `node apps/ui-lab/scripts/qa-login-v3.mjs` | este entorno | **no ejecutable**: falta `libnspr4`/`libnss3` y no hay `sudo` para `playwright install-deps`. Las mismas aserciones se ejecutaron en el navegador Cloud contra el `dist/` local (§4). |
| `node apps/ui-lab/scripts/qa-login-v3.mjs` | GitHub Actions, `browser_qa=true` | ver §7 |

El bundle incluye `assets/fraunces-latin-*.woff2` (120.764 B) y `assets/manrope-latin-*.woff2`
(24.532 B): la tipografía ya no viaja por Google Fonts.

### Reproducibilidad de la QA

La versión de Playwright está fijada en `.github/workflows/ui-lab.yml` (`PLAYWRIGHT_VERSION: "1.65.1"`),
que instala `playwright@1.65.1` y, por tanto, la revisión de Chromium que ese paquete trae. El script
comprueba la versión instalada y aborta con código 3 si no coincide con la fijada, de modo que no se
puede medir con otro motor por descuido. Con `EXPECTED_BUILD_SHA` exige además que el bundle servido
declare ese commit en `version.json`, y con `REPORT` escribe un JSON con SHA, versiones y los 41 checks.

El `dist/` se sirve con `vite preview` (Node), no con `python3 -m http.server`: ese servidor de Python
tiene una cola de conexiones de 5 y, cuando Chromium pide en paralelo el CSS de un chunk dinámico,
alcanza a rechazar alguna petición. En CI eso se veía como `Unable to preload CSS for
/assets/agntia-tokens-*.css` y la vista no montaba; el diagnóstico queda en `qa/qa.log` del artifact
`login-v3-qa-evidence`.

## 3. Medidas medidas en navegador (1366×1002, DPR 1)

| Elemento | Medido | Contrato |
|---|---|---|
| Contenedor | ancho 1224, padding 32 → contenido 1160, x=96 | contenido 1160, margen 103 |
| Rejilla | 616 / 500, gap 44 | 616 / 500, gap 44 |
| Header | 88 px | 88 |
| Card acceso | x=756, y=124, 500×546 | y=124, ancho 500; altura natural |
| Hero | y=124 + offset 18, H1 60 px, 2 líneas (alto 124) | offset 18, H1 60, 2 líneas |
| H1 desktop | 60 px, line-height 1,035, tracking −0,052em | igual |
| H1 1024 / 768 / 390 | 52 / 46 / 38 px | 52 / ≤1023 / ≤430 38 |
| Chips | 11 px, padding 6 × 10, radio 100 | 11 px, padding 6 × 10 (CONTRATO-VISUAL) |
| Orden móvil (≤1023) | acceso → texto editorial → invitación y legal | decisión del founder: el acceso va primero |
| Modal de invitación | 520 px de ancho, 32 px de padding interior (28/24 en ≤430) | más tamaño y aire, pedido del founder |
| CTA violeta | `rgb(101, 80, 221)` sobre `#fff` (estilos computados) | `--ag-violet`, texto blanco |
| Overflow horizontal | 0 en 320, 360, 390, 430, 768, 1024, 1280, 1366, 1440, 1920 | ninguno |
| Fuentes | Fraunces y Manrope `status: loaded` con Google Fonts bloqueado | sin fallback silencioso |

## 4. Estados verificados

Ejecutado sobre el bundle construido. La sesión de este entorno no puede lanzar un Chromium local
(faltan `libnspr4`/`libnss3` y no hay `sudo`), así que las comprobaciones se ejecutaron en el
navegador Cloud contra el `dist/` servido en el puerto 3000, con las mismas aserciones que el script
versionado. El script queda listo para reproducirlas donde Playwright con Chromium esté disponible.

| Caso | Resultado |
|---|---|
| H1 60 px, dos líneas, Fraunces local | OK |
| Rejilla 616/500, card 500 en x=756 | OK |
| Chips 11 px y padding 6 × 10 | OK |
| CTA violeta no anulado por la cascada | OK (`rgb(101, 80, 221)`, texto blanco) |
| Marca una sola vez | OK |
| Sin overflow horizontal en 320–1920 | OK |
| Email mal formado → foco en el email | OK (corregido) |
| Email válido y contraseña vacía → foco en la contraseña | OK |
| Aviso de entorno sin simular acceso | OK |
| Mostrar/ocultar contraseña (`type`, `aria-pressed`) | OK |
| Contraseña: cierre animado de altura y limpieza al reabrir | OK |
| Chip: abre chat, precarga, no envía, `aria-expanded=true` | OK |
| Enviar mensaje: aviso de servicio no conectado, sin mensajes ficticios | OK |
| Chat: cierre animado, desmontaje y borrador conservado | OK |
| Invitación: vacío → foco en nombre | OK |
| Invitación: email inválido → foco en email | OK (corregido) |
| Invitación: sin empresa → foco en empresa | OK (corregido) |
| Modal: entrada `lv3-dialog-in`, salida `lv3-dialog-out` y cierre | OK |
| Escape en modal | cierra y devuelve foco a «Conseguir una invitación» |
| Persistencia | ninguna clave nueva ni contraseña/email en `localStorage` |
| Reduced motion | `animation-name: none` y aperturas instantáneas |
| Skip link | «Ir al acceso» visible al foco y enlaza al bloque de acceso |

Motion medido dentro de la página (altura real del contenedor, no solo estado final): el acceso con
contraseña y el chat pasan de su altura completa a 0 px en ~260 ms con varios valores intermedios; el
modal anima entrada de 260 ms y salida de 180 ms antes de cerrarse.

## 5. Capturas

En `capturas/` (regeneradas en esta pasada):

- `login-v3-1366.png` — estado inicial, 1366×1002.
- `login-v3-chat-chip-1366.png` — chat abierto con chip precargado.
- `login-v3-password-1366.png` — contraseña, error y aviso de entorno.
- `login-v3-invitacion-viewport-1366.png` — modal de invitación sin recorte de captura (520 px).
- `login-v3-invitacion-390.png` — modal en móvil, con el nuevo aire interior.
- `login-v3-390.png`, `login-v3-768.png`, `login-v3-1920.png` — responsive.
- `login-v3-artifact-1366.png` — **evidencia histórica**: render del artifact de run 234 (`c6cf874…`),
  anterior a estas correcciones. Se conserva como registro, no describe el estado actual.
- `landing-baseline-1366.png` — baseline de landing para identidad.

Las capturas de esta carpeta se generaron sobre el código `login-v3` de `a9e9eff…`, que es byte a byte el
mismo que el del artifact actual (verificado con `componentes-finales/MANIFEST-SHA256.txt`): el workflow
no toca `LoginV3.tsx` ni `login-v3.css`. El artifact incluye además `capturas-ci/`, generadas por su
propia ejecución de QA a partir de su propio build.

## 6. Correcciones de la auditoría

| Hallazgo | Estado | Evidencia |
|---|---|---|
| Foco al campo incorrecto con email mal formado | Corregido | validación con campo culpable; foco verificado en email |
| Chips a 12 px y 7 × 12 | Corregido a 11 px y 6 × 10 | estilos computados |
| Modal enfoca siempre el primer campo | Corregido | foco en email o empresa según el error |
| Contraseña se expande de golpe | Corregido | 0fr → 1fr en 260 ms, altura medida |
| Modal sin coreografía de entrada y salida | Corregido | `lv3-dialog-in` / `lv3-dialog-out` + fundido de backdrop |
| Chat sin cierre ni continuidad de layout | Corregido | misma mecánica de altura, desmontaje al terminar |
| Fuentes dependientes de Google Fonts | Corregido | woff2 locales con OFL; carga comprobada con Google bloqueado |
| Contraseña y «mostrar» persisten al colapsar | Corregido | campos vaciados y `type` restaurado |
| CTA violeta anulado por el CSS general | No era un fallo | `.login-v3 .lv3-cta-violet` gana la cascada; medido `rgb(101, 80, 221)` |
| Fallo de empaquetado: sin QA ni capturas en el ZIP | Corregido | el paso copia `QA.md`, `BITACORA-EJECUCION.md`, `capturas/` y `qa/` |
| Empaquetado sin comprobar que la vista exista | Corregido | `grep 'id:"login-v3"'` antes de empaquetar |
| Sin pruebas de navegador versionadas | Corregido | `scripts/qa-login-v3.mjs` (41 comprobaciones) |
| Sin pruebas de navegador en el workflow | Añadido, opt-in | input `browser_qa` (por defecto `false`), Playwright fijado y resultado en `qa/qa-report.json` |
| El empaquetado hacía fallar el job en ramas sin la vista | Corregido | paso `Detect Login V3 view`; empaquetado y artifact condicionados a `present == 'true'` |
| Arquitectura monolítica | No aplicado | recomendación de mantenibilidad, no bloqueante; queda como siguiente campaña |
| En móvil el texto editorial iba antes que el acceso | Corregido | a 390 px: tarjeta de acceso y=114, hero y=732, invitación+legal y=1509 |
| Modal de invitación apretado y pequeño | Corregido | 520×589 px con 32 px de padding a 1366; 343 px y 28/24 de padding a 390 |

El manifiesto anterior listaba `apps/ui-lab/src/vite.config.ts`; el archivo real es
`apps/ui-lab/vite.config.ts`. Corregido en `componentes-finales/MANIFEST-SHA256.txt`.

## 7. Verificación del artifact

Run 234 (`workflow_dispatch`, deploy=false) · artifact `login-v3-chromebook` · 8.188.033 bytes ·
sha256 `4bdc74fafabbe6d6a884331cae5d2b098fdd817eef17287f43f123ece1e6ab30`, idéntico al digest de GitHub.
Dentro del ZIP: `site/index.html`, `site/version.json` con el SHA del código, `site/assets/LoginV3-*.js` y
`*.css`, `INSTRUCCIONES.txt` e `iniciar.sh`. Servido con `python3 -m http.server` en `127.0.0.1:8080`
(HTTP 200) y renderizado en navegador real: título «Login V3 · Acceso», H1 de 60 px, card y tres chips
presentes. El job `deploy` quedó `skipped`, como corresponde.

Ese artifact corresponde al commit `c6cf874…` y por tanto **no** incluye estas correcciones: hace falta
una nueva ejecución de `workflow_dispatch` (con `deploy: false`) para publicar el paquete actualizado.
El contenido nuevo del paquete se validó localmente con los mismos comandos del workflow (guard, woff2
en `assets/`, `QA.md`, bitácora, 10 capturas y `qa/`).

## 8. Desviaciones y límites reales

- Iconos de beneficios sin círculo: el PNG los muestra con círculo lila, el contrato visual exige iconos
  de 18 px `#918575` «sin círculos añadidos». Prevalece el contrato.
- Alturas de card e invitación son naturales (546 / 233 px) y no las del PNG, como autoriza el contrato.
- El baseline de landing en el laboratorio muestra imágenes 404 (`/landing/*.png`): `publicDir` apunta a
  `apps/web/public`, que no existe en este árbol. Limitación previa del laboratorio.
- El login productivo (`apps/web/src/components/Login.tsx`) no tiene ruta en el laboratorio; se conserva
  intacto y su snapshot documental sigue en `componentes-reales/`.
- Sin backend anónimo, sin invitaciones y sin OAuth: los estados lo declaran; no se simula éxito.
- Sin auditoría automatizada de accesibilidad (axe/Lighthouse) ni lector de pantalla; foco, teclado,
  roles y contraste por token se revisaron de forma manual.
- Pruebas de navegador en CI: paso opt-in (`browser_qa`) descrito en §7 con su ejecución real. Desde este
  entorno no se puede lanzar `gh` (sin sesión); el disparo se hizo por la API de GitHub.
- El script versionado no se ejecutó en este entorno por falta de bibliotecas de Chromium; lo que aquí se
  midió fue su contenido de aserciones, reproducido en el navegador Cloud. Esa distinción se mantiene en
  todo el documento.

## 9. Rúbrica interna de esta pasada

Composición 23/25 · Identidad 24/25 · Tipografía/espaciado 14/15 · Responsive 9/10 ·
Interacción 9/10 · Motion 5/5 · Accesibilidad 4/5 · Distribución 5/5 → **93/100**.

Es la medición interna del constructor, no una certificación: la nota estética y la aceptación visual
siguen siendo del founder. No se declara 10/10.
