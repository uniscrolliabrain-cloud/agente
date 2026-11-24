# 08 · Handoff

## Qué se entrega

- **Código ejecutable**: [`apps/ui-lab/src/chat-transversal-v3/`](../../../../../src/chat-transversal-v3) con los siete componentes, datos demo, CSS aislado y el retrato optimizado.
- **Preview**: `/?embed=1&view=chat-transversal-v3` (o `/?view=chat-transversal-v3` desde el selector de UI Lab).
- **Componentes finales con hashes**: [`componentes-finales/`](componentes-finales/README.md).
- **QA**: [`07-QA.md`](07-QA.md), [`qa/qa-resultados.json`](qa/qa-resultados.json), [`qa/qa-chat-transversal-v3.mjs`](qa/qa-chat-transversal-v3.mjs) y capturas reales en [`qa/capturas/`](qa/capturas).
- **Artifact Chromebook**: `artifact/build-artifact.py` produce el paquete; el workflow de UI Lab lo publica como `chat-transversal-v3-chromebook`.
- **Fotografía optimizada**: [`assets/laia-videollamada.webp`](assets/laia-videollamada.webp) (900 × 900, 68,2 kB) y original del founder en `assets/file_00000000bad881f4a18a32b6c6edc2c8.png`.

## Cómo verlo

1. `pnpm --filter @agente/ui-lab dev` y abrir `?view=chat-transversal-v3`.
2. El FAB inferior derecho abre el panel. En ≥ 900 px entra a la izquierda; por debajo, como hoja inferior.
3. Probar: arrastrar el tirador, clic para cambiar de ancho/altura, dictado corto y mantenido, «+», llamada de voz, videollamada, finalizar y acta.

## Cómo se genera el artifact

```bash
python3 apps/ui-lab/docs/dashboards/04-chat-boton-transversal/campana-transversal-v3/artifact/build-artifact.py
```

Empaqueta `dist/`, el retrato, las capturas, la documentación y un `SHA256SUMS`. No versiona el ZIP.

## Decisiones que el founder debería revisar

1. **Dirección visual**: marfil, tinta, violeta y oro de la landing; Fraunces en momentos editoriales (vacío, llamada, acta); Manrope en la interfaz operativa. Sin tarjetas ni bordes compitiendo.
2. **Voz**: escena abierta con marca real, anillos y medidor sutiles, rotulada como simulación. Sustituye el rectángulo lavanda anterior.
3. **Vídeo**: LAIA como protagonista, PiP local, controles discretos y finalizar en rojo. El retrato es tu PNG `assets/file_00000000bad881f4a18a32b6c6edc2c8.png` (`0aa55fbe…`), conservado sin renombrar y optimizado a `laia-videollamada.webp` 900 × 900.
4. **Menú «+»**: 10 acciones en dos grupos (Capturar / Trabajo), con «Grabar vídeo» separado de «Subir vídeo».
5. **Workspace de contexto**: maqueta neutra rotulada «Contexto de demostración»; no se rediseñó ningún workspace real.

## Pendiente y límites

- Aprobación estética: exclusivamente el founder.
- Cámara con permiso concedido, dictado real y micrófono no se pudieron verificar en el navegador cloud (sin dispositivos); los caminos de denegación y falta de soporte sí están comprobados.
- Lector de pantalla real, zoom 200 %, Safari/Firefox y dispositivos físicos: no ejecutados.
- El artifact de Actions no se ha ejecutado desde este entorno; el paquete local se validó sirviendo `index.html` y `version.json`.
- `apps/ui-lab/src/lab.css` carga Google Fonts para todo UI Lab (preexistente). Este módulo no depende de esa carga.
