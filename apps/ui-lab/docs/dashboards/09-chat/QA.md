# QA reproducible — Chat UX V2

## 1. Entorno y comandos

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm --filter @agente/ui-lab typecheck
pnpm --filter @agente/ui-lab build
pnpm --filter @agente/ui-lab preview --port 4173 &
pnpm --filter @agente/ui-lab exec playwright install chromium   # una vez
pnpm --filter @agente/ui-lab exec node qa/chat-ux-v2.qa.mjs
```

- Playwright **1.62.1** (misma versión que `apps/worker`), declarado en `apps/ui-lab`.
- Salida: `apps/ui-lab/qa/out/chat-ux-v2/` (RESULTADOS.md, resultados.json, capturas/).
- Variables: `QA_BASE_URL` (defecto `http://127.0.0.1:4173`), `QA_OUT`.
- En un Linux sin fuentes del sistema hay que instalar dependencias del navegador (`playwright install --with-deps chromium`). En el entorno de esta campaña no había root y se instalaron libs locales; no forma parte del repositorio.

## 2. Resultado

**76/76 checks PASS · 0 FAIL** (`resultados.json`, generado contra el build de `feat/ui-lab-chat-ux-v2`).

Cobertura automatizada:

| Área | Checks |
| --- | --- |
| Portada, copy, proporciones, chips | Saludo, titular 48 px, compositor 680 px, 3 chips, enviar deshabilitado, sin overflow |
| Fuente offline | Manrope local con Google Fonts bloqueado, ancho de texto real |
| Transición | FLIP medido 413→656 px, mismo nodo, mensaje visible, streaming inmediato |
| Streaming / cancelación | Texto creciente sin marcadores crudos, cursor, detener, bloqueo del compositor, sin respuesta parcial, foco recuperable |
| Markdown | Tabla, código, negrita, cita, lista ordenada, tabla sin desbordar |
| Scroll | No fuerza el fondo al leer; un mensaje nuevo no arrastra |
| Herramientas / timeline | Resumen «2 pasos», apertura del detalle |
| Foco | Tab desde el compositor y anillo violeta 2 px |
| Roles | Chips de finanzas y cambio de rol |
| Adjuntos | Éxito, envío con adjunto, error visible y recuperable |
| Dictado | Disponible con stub local; no disponible sin romper |
| IME | Enter durante composición no envía; después sí |
| Reduced motion | Animación 0.01 ms y contenido visible |
| Viewports | 320×640, 390×844, 430×932, 768×1024, 1024×768, 1366×599, 1440×900, 1920×1080 en portada y conversación |
| Contenedor | 480 / 680 / 900 px con viewport 1440×900 (panel abierto) |
| Borrador/foco | Se conserva al reducir el ancho (1440→1024) |
| Contraste | Cuerpo 14.93:1, burbuja 13.80:1, metadatos 5.04:1 |
| Copiar | Portapapeles real y confirmación accesible |
| Consola | Sin errores ni peticiones fallidas (fuentes externas se bloquean aparte) |

## 3. Evidencias visuales

En `capturas/` (y dentro del artifact):

- `baseline-original-chat-1440x900.png` — chat original, misma composición de partida.
- `01-portada-1440x900.png`, `15-home-320/390/1366/1920`, `16-conversacion-*`.
- `03a/03b` transición, `04` streaming, `05` cancelación.
- `06/07` historial inicio/final, `07b` lectura conservada.
- `08` timeline abierta, `09` foco de teclado, `10` chips por rol.
- `11/12` adjunto listo/error, `12b/13` dictado, `14` reduced motion.
- `17/18` contenedor 480/680/900, `19` panel simulado 1024.
- `verificacion-zip.png` — render desde el ZIP extraído, sin red.

## 4. Criterios del gate

| Criterio | Resultado | Evidencia |
| --- | --- | --- |
| 320/390/430/768/1024/1366/1440/1920 | PASS | 16 checks de viewport |
| Contenedor 480/680/900 | PASS | 3 checks + 6 capturas |
| Portada / conversación / streaming / cancelación / adjunto / chips / timeline | PASS | capturas y checks |
| Sin clipping | PASS | `dockBottom ≤ innerHeight`, sin overflow en 8 viewports |
| Foco y teclado | PASS | anillo violeta, orden de tabulación |
| Contraste AA | PASS | 4 pares medidos (≥4.5:1) |
| Reduced motion | PASS | 0.01 ms y contenido visible |
| Fuentes offline | PASS | woff2 local, red externa bloqueada |
| Consola limpia | PASS | 0 errores |
| Scroll sin pérdida de lectura | PASS | scrollTop 120 conservado |
| Borrador y foco con panel abierto | PASS | 1440→1024 |
| Baseline: misma composición y controles | PASS | baseline + matriz de paridad |

## 5. Artefacto

```bash
UI_LAB_BUILD_SHA=<sha> pnpm --filter @agente/ui-lab build
pnpm --filter @agente/ui-lab exec node qa/chat-ux-v2.qa.mjs
bash apps/ui-lab/qa/build-chat-ux-v2-artifact.sh
```

El script: copia `site/`, `fuentes/`, capturas, QA, documentación e instrucciones; escribe `MANIFIESTO.json` con SHA256; genera el ZIP; lo extrae; sirve `site/` con `python3 -m http.server`; comprueba render, Manrope local con red bloqueada, consola y conversación; incorpora `VERIFICACION-ZIP.txt`; rehace `SHA256SUMS.txt`; reextrae el ZIP final y valida `sha256sum -c`. No despliega.

## 6. Pruebas manuales realizadas

- Inspección visual de las capturas anteriores a 1440×900, 1366×599, 390×844, 320×640 y contenedor 480: jerarquía, aire, recortes, fades y coherencia de marca.
- Revisión de la transición con medición de posición del dock (no solo captura).
- Comparación con el baseline original: misma estructura, mismos controles y textos.

## 7. No ejecutado / limitaciones

- **Sin aprobación del founder**: la puntuación es autoevaluación con evidencia, no aceptación visual final.
- **Sin backend real**: la fixture no llama a `/api/chat`, `/api/agent/roles`, `/api/cognition-v2/journey` ni sube archivos. Enviar, cancelar y adjuntar se prueban contra la simulación.
- **Sin dictado real**: se prueba la rama soportada con un stub y la no soportada eliminando la API; no hay micrófono ni permisos.
- **Sin lector de pantalla real**: se verifica semántica y foco con Playwright, no con NVDA/VoiceOver.
- **Sin Chromebook físico**: el artifact se verifica sirviendo el ZIP extraído en este entorno Linux; falta abrirlo en el Chromebook del founder.
- **Sin vídeo de motion**: hay mediciones FLIP y capturas, no grabación.
- **Sin cambios en producción**: todo vive en UI Lab; `apps/web` no se ha modificado.
- **Error surface**: `chat.error` sigue sin renderizarse; es deuda funcional del componente real y queda fuera de alcance.
- **Panel transversal**: no se ha modificado ni probado su componente; la convivencia se verifica por ancho de contenedor (480/680/900) y cambio de viewport con borrador y foco.

## 8. Rúbrica (autoevaluación con evidencia)

| Criterio | Peso | Puntos | Justificación |
| --- | --- | --- | --- |
| Preservación de composición y funciones | 35 | 34 | Todo conservado; markdown, IME y scroll pinning son mejoras propuestas y documentadas |
| Acabado visual | 25 | 24 | Tokens, tipografía, controles, estados y marca coherentes; sin aprobación humana |
| Motion | 15 | 14 | Entrada, FLIP medido, mensajes y microinteracciones; sin vídeo de evidencia |
| Responsive y accesibilidad | 15 | 15 | 8 viewports, 3 contenedores, contraste AA, foco, reduced motion, labels |
| Distribución y artefacto | 10 | 9 | ZIP verificado y reproducible; pendiente de abrir en Chromebook |
| **Total** | **100** | **96** | Objetivo ≥95 respaldado; aceptación final del founder pendiente |

Bloqueantes del gate: ninguno detectado (sin cambios de shell/transversal, sin capacidades falsas, sin llamadas reales, sin regresión funcional, artifact de la misma revisión).
