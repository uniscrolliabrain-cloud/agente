# C02 · Baseline móvil · 2026-11-21

Base `3023637d72994460b1aa4742f558557ec0c69922`. Código validado `18ee1c1f0387e5a9f3cf7044936bbb687dac77c6`. La rama local `campaign/c02-baseline-movil` avanzó por fast-forward desde main hasta el HEAD del PR #16. El diff de producto es idéntico al de ese SHA. No se aplicaron patches nuevos al producto.

Fuentes: [PR #16](https://github.com/uniscrolliabrain-cloud/agente/pull/16), [despliegue](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365), código y pruebas del PR, y el informe móvil de su rama.

Los 22 commits del PR abarcan hoja móvil y estilos, controles del compositor, estado del FAB, viewport visual, aislamiento de gestos y continuidad del hilo al cancelar un turno. La rama posterior `feat/mobile-chat-multimodal-ux` añade un commit (`7bb8990`) sobre el baseline. Sus notas de audio, llamadas simuladas y botones se mantienen como trabajo pendiente de reconciliar tras los contratos de medios.

## Evidencia de producción

El 21 de noviembre el HTML público del panel y la build local resolvieron los mismos nombres de JavaScript y CSS. Los bytes de los dos archivos de entrada coincidieron según SHA-256:

| Archivo | SHA-256 |
| --- | --- |
| `index-CefBM1Jv.js` | `5551c8f26a6863ea66d998e1f00724dc3b7d87d5088ab917af597438c22355bb` |
| `index-DDE1v0AY.css` | `e93faae6f28d3df170e45026cd3aec047792826c8b92b450c869f671322a0889` |

Esta observación cubre el panel público web. La demo privada y la procedencia directa de cada máquina Fly siguen sin verificarse.

## Validación local

- Instalación con lockfile congelado, Node 24.22.3 y pnpm 11.25.0.
- Typecheck global y web, build web y auditoría de coherencia 7/7.
- Chromium 156, CDP y Playwright con emulación Pixel 7 contra el build de producción local. Pasaron FAB, envío único, arrastre, cancelación de gesto, viewport visual simulado, cierre y reapertura, continuidad del hilo, scroll del historial, corte de streaming, dictado simulado, recuperación tras fallo de red, viewports cortos y movimiento reducido. Queda pendiente la comprobación del teclado de un dispositivo físico.

El gate registrado por GitHub para este mismo SHA completó 900 pruebas (874 aprobadas, 0 fallos, 21 omitidas y 5 TODO). [Logs del gate](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365/job/136828446600)

La rama y el informe son locales. El PR #16 permanece como revisión del mismo código. Rollback de la preparación local: volver a la rama de coordinación. Cualquier rollback de producción requiere determinar la imagen anterior y autorización.

GO para conservar este árbol como baseline local. La repetición local de la suite completa quedó en curso durante este arranque. La aprobación de merge y la validación de la demo privada siguen pendientes.
