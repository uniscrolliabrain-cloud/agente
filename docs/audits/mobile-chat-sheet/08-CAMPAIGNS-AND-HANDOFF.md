# 08 — Campañas secuenciales para Codex

**Regla:** cada campaña entrega commit en rama hija, reporte en `04-EXECUTION-REPORT.md` y resumen en chat; detenerse si no se puede reproducir/medir el fallo. No merge a main, no deploy sin autorización.

### C0 — Reconstrucción
Leer rama, diff main, docs 00-08 y archivos de UI relacionados. Confirmar build/URL y DOM que vio el usuario. Registrar discrepancias doc vs código. Entregar mapa de eventos, estados y CSS.

### C1 — Observabilidad
Añadir `?sheetDebug=1` solo dev, panel exportable sin PII y tests mínimos que detecten solapamiento y gesto. Confirmar que se está ejecutando el SHA editado.

### C2 — FAB/Enviar
Localizar todas las instancias del FAB, clasificar viewport, corregir origen del solapamiento y asegurar hit testing de Enviar. Validar T01/T02/T15.

### C3 — Bottom sheet
Arreglar gestos, snaps, scroll y resize sin refactor ajeno. Validar T03/T04/T05/T08/T13. Si falla emulación, aislar reproducción mínima.

### C4 — Teclado
Elegir y justificar estrategia viewport; mantener compositor encima del teclado, preservar snap y safe areas. Validar T06/T07/T08. Si no hay Android físico, dejar pendientes explícitos.

### C5 — Compositor multimodal
Extender `ChatInput` compartido para mostrar bocadillo ElevenLabs (voz bidireccional), micrófono (dictado), vídeo Anam (videollamada) y flecha Enviar. Proveedores quedan como stubs honestos, sin credenciales ni permisos. Verificar móvil/dock/full. Validar T12/T14 y M01-M07.

### C6 — Regresión/handoff
Typecheck/lint/tests/Playwright, revisión de accesibilidad, limpieza de instrumentación temporal, evidencia por caso, riesgos, reporte final y enlace a build probada. Solicitar validación en Android real y autorización antes de merge.

## Handoff final obligatorio
- SHA y branch base/resultado
- Cambios archivo por archivo
- Causas raíz confirmadas vs hipótesis descartadas
- Pruebas ejecutadas y resultados sin inventar
- Qué puede verificar el propietario en Android, con pasos exactos
- Qué falta para conectar ElevenLabs, dictado y Anam
- Bloqueos y decisiones pendientes
- Confirmación explícita: NO MERGE / NO DEPLOY
