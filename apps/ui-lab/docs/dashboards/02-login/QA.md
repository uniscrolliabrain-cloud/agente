# QA — Login V3 (UI Lab)

Fecha: 2026-11-24 · Rama `feat/ui-lab-login-v3` · Prototipo aislado, sin backend conectado.
Rutas: `/?embed=1&view=login-v3` (solo diseño) y `/?view=login-v3` (selector del laboratorio).

## 1. Alcance construido

- `apps/ui-lab/src/login-v3/LoginV3.tsx` y `login-v3.css` (namespace `.login-v3`, tokens `--ag-*`).
- Registro `login-v3` en `apps/ui-lab/src/registry.tsx` con `status: "fixture"`.
- Paso `login-v3-chromebook` en `.github/workflows/ui-lab.yml` (job build, sin tocar deploy).
- Sin cambios en `apps/web/src/components/Login.tsx`, landing, Studio, kernel, rutas ni backend.
- Sin llamadas de red productivas: OAuth, contraseña, chat e invitación declaran entorno de prueba.

## 2. Comandos ejecutados y resultado real

```
pnpm install --frozen-lockfile                                   → OK (15,4 s)
pnpm --filter @agente/ui-lab typecheck                          → OK (exit 0, tsc --noEmit)
UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build       → OK (5,6 s; LoginV3 js 13,74 kB, css 13,89 kB)
```

Build local verificado: `apps/ui-lab/dist/version.json` = `9f6b5a188a5fdc84787623e2fd4f08ae9397a2b0`.

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
| Overflow horizontal | 0 en 320, 360, 390, 768, 1024, 1280, 1366, 1440, 1920 | ninguno |
| Fuentes | Fraunces 400 y Manrope 400–800 con `status: loaded` | sin fallback silencioso |

## 4. Estados verificados (navegador real, consola sin errores)

| Caso | Resultado |
|---|---|
| Chip «Quiero más clientes» | abre chat, precarga input, foco en el campo, no envía, `aria-expanded=true` |
| Enviar mensaje | no añade mensajes; aviso «El chat público no está conectado en esta maqueta…» |
| «Cerrar chat» | colapsa, conserva borrador, `aria-expanded=false` |
| Google / GitHub | no navega (misma URL); aviso de entorno de prueba |
| Contraseña: email inválido | «Escribe un email válido.», `role="alert"`, foco en email |
| Contraseña: mostrar/ocultar | `type` password → text, `aria-pressed` correcto |
| Contraseña válida sin backend | aviso de autenticación no conectada, sin éxito ficticio ni persistencia |
| Invitación: vacío | «Indica tu nombre.», foco en primer campo |
| Invitación: válido | aviso de servicio no conectado; ningún dato guardado |
| Escape en modal | cierra y devuelve foco a «Conseguir una invitación» |
| Reduced motion | `animation-name: none` en grupos de entrada; sin desplazamientos |
| Skip link | «Ir al acceso» visible al foco y enlaza al bloque de acceso |

## 5. Capturas

En `capturas/`:

- `login-v3-1366.png` — estado inicial, 1366×1002.
- `login-v3-chat-chip-1366.png` — chat abierto con chip precargado.
- `login-v3-password-1366.png` — contraseña, error y aviso de entorno.
- `login-v3-invitacion-viewport-1366.png` — modal de invitación sin recorte de captura.
- `login-v3-invitacion-390.png` — modal en móvil.
- `login-v3-390.png`, `login-v3-768.png`, `login-v3-1920.png` — responsive.
- `landing-baseline-1366.png` — baseline de landing para identidad.

## 6. Desviaciones y bloqueos reales

- Iconos de beneficios sin círculo: el PNG los muestra con círculo lila, el contrato visual exige iconos de 18 px `#918575` «sin círculos añadidos». Prevalece el contrato.
- Alturas de card e invitación son naturales (546 / 233 px) y no las del PNG, como autoriza el contrato.
- El baseline de landing en el laboratorio muestra imágenes 404 (`/landing/*.png`): `publicDir` apunta a `apps/web/public`, que no existe en este árbol. Es una limitación previa del laboratorio; la comparación de identidad se hizo por tipografía, color y marca, no por fotografía.
- El login productivo original (`apps/web/src/components/Login.tsx`) no tiene ruta en el laboratorio; se conserva intacto y su snapshot documental sigue en `componentes-reales/`.
- Sin backend anónimo, sin invitaciones y sin OAuth en el laboratorio: los estados lo declaran explícitamente; no se simula éxito.
- Fraunces y Manrope se cargan desde Google Fonts: sin Internet la vista cae a Georgia/system-ui. Declarado en INSTRUCCIONES.txt del artifact.
- No se ha ejecutado auditoría automatizada de accesibilidad (axe/Lighthouse) ni lector de pantalla; foco, teclado, roles y contraste por token se revisaron de forma manual.

## 7. Rúbrica (aspiración, no certificación)

Composición 23/25 · Identidad 24/25 · Tipografía/espaciado 13/15 · Responsive 9/10 ·
Interacción 9/10 · Motion 4/5 · Accesibilidad 4/5 · Distribución 5/5 → **91/100**.

No se declara 10/10 ni aceptación: la decisión visual final es del founder.
