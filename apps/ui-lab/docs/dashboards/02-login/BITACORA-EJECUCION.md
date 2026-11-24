# Bitácora de ejecución — Login V3

Fecha: 2026-11-24. Activación: orden expresa del founder para ejecutar README y campaña completa (T01–T06).

## Contexto de origen

- Base: `main` en `9f6b5a188a5fdc84787623e2fd4f08ae9397a2b0` (docs del paquete 02-login ya consolidados).
- Rama de trabajo: `feat/ui-lab-login-v3`, creada desde ese commit.
- Documentación de preparación permanece en `main`; esta rama añade implementación, QA, clones y workflow.

## T01 — Lectura y baseline

Leídos README, PROMPT MAESTRA V3, CONTRATO-VISUAL, CAMPAÑA, GATE, snapshot de componentes reales,
guía de branding, `Landing.jsx`/`landing.css`, `agntia-tokens.css`, `BrandMark.tsx`, `Login.tsx`,
`registry.tsx` y `App.tsx`. PNG abierto y usado como referencia de composición.

Baseline: `capturas/landing-baseline-1366.png`. El login productivo no tiene ruta de laboratorio;
se conserva intacto y su snapshot histórico no se toca.

## T02–T03 — Implementación

- `apps/ui-lab/src/login-v3/LoginV3.tsx`: composición, copy V3, OAuth con SVG exactos, bloque LAIA,
  chat inline, contraseña, invitación y modal, avisos de entorno sin backend.
- `apps/ui-lab/src/login-v3/login-v3.css`: scoped, tokens canónicos, medidas del contrato, breakpoints
  1199/1023/430 y `prefers-reduced-motion`.
- `registry.tsx`: import lazy e `id: login-v3`, `status: fixture`.
- `vite.config.ts`: allowlist de hosts opcional por proceso (`UI_LAB_ALLOWED_HOSTS`) porque Vite 5.4 no
  admite el env var estándar; no se escribe ningún hostname del entorno en el repo.
- Sin cambios en producción, landing, Studio, kernel ni backend.

Correcciones tras comparar con el PNG y medir: ancho útil corregido a 1160 + 32 de padding (la primera
pasada daba 1096), microcopy de invitación a 12 px, chips móviles sin crecimiento forzado y retirada del
`backdrop-filter` del modal, que producía un artefacto de composición en Chromium con el backdrop.

## T04 — Verificación y entrega documental

```
pnpm install --frozen-lockfile                          → OK
pnpm --filter @agente/ui-lab typecheck                  → OK
UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build → OK
```

Navegador real a 320/360/390/768/1024/1280/1366/1440/1920: sin overflow horizontal, fuentes cargadas,
estados y teclado verificados (detalle en `QA.md`). Clones byte a byte en `componentes-finales/` con
`MANIFEST-SHA256.txt` (12 archivos con hash; `cmp` verificado en la generación).

## T05–T06 — Artifact y publicación de rama

Paso `login-v3-chromebook` añadido al job `build` de `.github/workflows/ui-lab.yml`: copia el dist
completo, genera `INSTRUCCIONES.txt` e `iniciar.sh` (Python 3, `127.0.0.1:8080`), verifica `index.html`
y `version.json` y sube el artifact con `if-no-files-found: error`. El job `deploy` no se modifica y
sigue exigiendo `main` + `workflow_dispatch` + `deploy=true`.

Rama publicada: `feat/ui-lab-login-v3` (commit de código `c6cf87408e4dcd088a4ccbb7661372701a07e91c`).
Workflow disparado con `workflow_dispatch` y `deploy=false`:

- Run 234: https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45416203697 → `success` (build),
  `deploy` `skipped` como corresponde.
- Artifact `login-v3-chromebook`: 8.188.033 bytes, expira 2026-12-01, digest
  `sha256:4bdc74fafabbe6d6a884331cae5d2b098fdd817eef17287f43f123ece1e6ab30` (coincide con el ZIP descargado).
- Contenido verificado: `site/index.html`, `site/version.json` con `c6cf874…`, `assets/LoginV3-*.js|css`,
  `INSTRUCCIONES.txt`, `iniciar.sh`. Servido con Python 3 en `127.0.0.1:8080` y renderizado real del id
  `login-v3` en navegador (título, H1 60 px, card y chips presentes).

Commits posteriores de esta bitácora y capturas son documentales: no cambian el código entregado, que
sigue siendo `c6cf874…` (SHA de build del artifact).

## T07 · Refinamiento tras la auditoría del founder (2026-11-24)

Alcance: solo las desviaciones señaladas. Sin rediseño, sin cambios de copy ni de composición.

1. Foco de validación: `submitPassword` distingue email y contraseña; el email mal formado devuelve el
   foco al email. La invitación enfoca nombre, email o empresa según el campo que falla.
2. Chips a 11 px y padding 6 × 10 (contrato visual vinculante), antes 12 px y 7 × 12.
3. Contraseña y chat: colapso real de altura con `grid-template-rows 0fr → 1fr` (260 ms), desmontaje al
   terminar y borrador conservado en el chat.
4. Modal: entrada de 260 ms, salida de 180 ms, fundido de backdrop y cierre animado también con Escape
   (`cancel` interceptado).
5. Contraseña: al colapsar se vacía el valor, se restaura `type=password` y se limpian error y aviso.
6. Fuentes: Fraunces y Manrope empaquetadas en woff2 desde Google Fonts, con OFL, servidas por el bundle.
   Comprobado con `fonts.googleapis.com` y `fonts.gstatic.com` bloqueados.
7. QA versionado: `apps/ui-lab/scripts/qa-login-v3.mjs` (41 comprobaciones de medidas, foco, motion,
   persistencia, consola y reduced motion).
8. Empaquetado: el ZIP incluye `QA.md`, la bitácora, `capturas/` y `qa/`; se comprueba que la vista exista
   en la rama y que los woff2 estén en `assets/`. Pruebas de navegador en CI como paso opt-in (`browser_qa`).
9. Manifiesto de clones: corregida la ruta de `vite.config.ts` (`apps/ui-lab/vite.config.ts`).

Verificación: `typecheck` y `build` en verde; 41 comprobaciones de navegador ejecutadas sobre el bundle
en el navegador Cloud (el entorno no puede lanzar Chromium local: faltan `libnspr4`/`libnss3` y no hay
`sudo`). Capturas regeneradas. El artifact de run 234 sigue siendo el de `c6cf874…`: requiere un nuevo
`workflow_dispatch` con `deploy: false` para publicar este estado.

## Pendientes

- Aprobación visual del founder (no se declara 10/10).
- Nueva ejecución de `workflow_dispatch` (`deploy: false`) para regenerar el artifact con estas correcciones,
  y activación de `browser_qa` si se quiere ejecutar el QA de navegador en CI.
- Separación en componentes (`LoginHeader`, `LoginEditorialHero`, `OAuthButtons`, `PasswordAccess`,
  `InvitationDialog`…): recomendación de mantenibilidad, no bloqueante, sin cambios visuales.
- Integración con backend real de OAuth, autenticación, conversación anónima e invitaciones: fuera de
alcance de esta campaña visual.
