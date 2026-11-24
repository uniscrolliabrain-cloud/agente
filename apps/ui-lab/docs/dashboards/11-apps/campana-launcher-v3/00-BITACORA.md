# Bitácora — campaña Launcher V3

| Dato | Valor |
|---|---|
| Fecha | 2026-11-24 |
| Rama | `main` (sin ramas ni PR, según el protocolo de la campaña) |
| Alcance | UI Lab, vista nueva `apps-launcher-v3`. Producción, kernel, runtime e integraciones intactos |
| Build verificado | `e3652cfc33b6` (`version.json`) |
| Build del artifact | `a5d9447fe411` (`version.json` del paquete) |

## Qué se ha construido

1. **35 iconos originales** generados individualmente (uno por app, nunca una cuadrícula recortada),
   con dirección artística común: cerámica marfil, esmalte violeta, oro champán y fondo lavanda.
   Originales 1024, WebP 512 para documentación y 320 para la app, más manifiesto con prompts.
2. **Launcher empresarial completo** en `apps/ui-lab/src/apps-launcher/`: reposo, escritorio con
   favoritas y widgets, carpetas, dock, cajón con buscador, recientes y apertura de apps con
   transición desde el icono.
3. **Registro** de la preview `apps-launcher-v3` en UI Lab, junto a las vistas existentes.
4. **QA** en navegador real con capturas de PC, tablet y móvil, y **documentación** de campaña.

## Decisiones relevantes

| Decisión | Motivo |
|---|---|
| Iconos con la herramienta de imagen del entorno, no con el pipeline OpenRouter | No hay `OPEN_ROUTER_API_KEY` disponible en este entorno; el pipeline existente queda documentado y el guion de derivados es reproducible |
| Un único archivo por icono, sin hojas de contacto en la app | Requisito expreso: 35 imágenes individuales |
| Selección táctil real, no por ancho de pantalla | El founder lo exige: se detecta `pointerType` y `hover/pointer` del dispositivo |
| Nombre del icono superpuesto, nunca en el flujo | Evita que la cuadrícula se desplace al revelar nombres |
| Superficie de app de demostración por categoría | Los 35 workspaces reales no se reinventan; la superficie se identifica como «Demostración» |
| Favoritos y recientes en `localStorage` | La demo conserva memoria sin backend ni datos de negocio |
| `:has()` para encajar el launcher en el marco de UI Lab | El badge del laboratorio añadía 26 px y generaba scroll; el ajuste solo actúa con esta vista montada |
| Escape con dueño propio en cada superficie modal | El primer Escape se perdía si el foco estaba en un `input[type=search]` o durante el cambio de pantalla |

## Estado por fase

| Fase | Estado | Evidencia |
|---|---|---|
| C00 auditoría | Hecha | `01-AUDITORIA-BASELINE.md` |
| C01 dirección artística | Hecha | `02-DIRECCION-ARTISTICA.md`, iconos y capturas |
| C02 arquitectura | Hecha | `04-ARQUITECTURA-COMPONENTES.md` |
| C03 construcción | Hecha | 12 componentes + CSS aislado |
| C04 motion | Hecha | `05-INTERACCIONES-Y-MOTION.md` |
| C05 responsive y accesibilidad | Verificada en 7 anchos | `08-QA.md` |
| C06 iconos | Hechos y derivados | `06-GENERACION-ICONOS.md` |
| C07 QA | Ejecutado, sin fallos abiertos | `08-QA.md` |
| Artifact | Script + workflow listos; ZIP local generado | `artifact/` |

## Bloqueos y límites

- Sin claves de imagen en el entorno: los iconos se generaron con la herramienta integrada, no con el
  workflow de OpenRouter (que requiere el secreto del repositorio).
- No hay backend ni autenticación en la simulación; ningún dato procede de APIs reales.
- La aprobación estética de los iconos corresponde al founder: aquí solo se certifica el
  cumplimiento técnico y la coherencia de la dirección artística.
- Pestaña de QA con emulación táctil: Playwright deja de entregar teclado en esa pestaña; el teclado
  se verificó en pestaña limpia (documentado en QA).

## Siguiente acción

Revisión visual del founder sobre `/?view=apps-launcher-v3` y decisión sobre los 35 iconos. No se ha
desplegado nada ni se ha tocado producción.
