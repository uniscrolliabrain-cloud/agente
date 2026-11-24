# Estado UX — 04-chat-boton-transversal

**Fecha de clasificación:** 2026-11-24  
**Estado:** IMPLEMENTADO EN UI LAB · PENDIENTE DE APROBACIÓN ESTÉTICA DEL FOUNDER  
**Preview:** `/?embed=1&view=chat-transversal-v3`

## Qué hay

Módulo aislado `apps/ui-lab/src/chat-transversal-v3/` que porta la implementación avanzada
recuperada de `release/landing-legal-20261122` y la viste con el sistema visual de AgntiaPro:

- PC: panel izquierdo de 312 / 390 / 510 / 660 px, arrastre, snap, pulsación del tirador,
  expansión, cierre, teclado y workspace contiguo que se adapta.
- Móvil y tablet: hoja inferior en 26 / 45 / 68 / 100 %, mínimo medido, `pointer capture`,
  cancelación, `visualViewport`, safe areas, compositor siempre visible y modo compacto.
- Conversación de texto, sugerencias, streaming simulado, borrador persistente, notas de voz.
- Compositor con «+» de diez acciones, dictado corto, nota mantenida, voz y videollamada.
- Escena de voz con marca real; videollamada con el retrato de LAIA, PiP local y acta posterior.

## Evidencia

- `campana-transversal-v3/07-QA.md` y `qa/qa-resultados.json`: 45 comprobaciones reales en
  Chromium (escritorio 1440/1366/1280/1024; móvil y tablet 768/390/360/320).
- Typecheck 0 y build 0.
- Capturas en `campana-transversal-v3/qa/capturas/`.

## Pendiente

- Aprobación estética del founder: la responsabilidad de esta campaña es técnica y de ejecución.
- Verificación con cámara concedida, micrófono y dictado reales (el navegador de QA no los expone).
- Fotografía oficial: se usa el PNG del founder (`assets/file_00000000bad881f4a18a32b6c6edc2c8.png`), recibido a mitad de campaña y conservado con su nombre original.

**Bitácora y milestones:** [Cuaderno de bitácora UX](../19-general/BITACORA-UX.md).
