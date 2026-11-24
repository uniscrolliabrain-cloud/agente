# Documentos — auditoría V7

## Alcance
Mockup independiente de UI Lab. Sin cambios de branding, backend, runtime ni producción. Conservar composición original: seis carpetas, actividad reciente, menú local, papel marfil, tipografía editorial, iconos previstos.

## Evidencia
Revisión estática de model.ts, useExplorer.ts, ExplorerParts.tsx, DocumentsExplorer.tsx, DocumentPreview.tsx y explorer.css. Correcciones publicadas hasta b74072f62e22f90e6f8721d001e13a14a243a7a0.

## Correcciones
- Nuevo en sidebar y subida negra; control móvil conservado.
- Nombres duplicados de carpetas, búsqueda por autor, archivos sin extensión.
- Cuadrícula con filtros, nombres largos, estados vacíos, iconos de formatos gráficos.
- Foco del lector, protección de interacción durante cierre, animación de carpetas y viewport móvil.

## Puertas de aceptación pendientes (no ejecutadas)
- Typecheck y build de UI Lab.
- Navegador a 320, 360, 390, 768, 1024, 1440 y 1920 px: sin overflow accidental, columnas y diálogos legibles.
- Navegación, historial, búsqueda, filtros, selección, mover, papelera, restaurar, renombrar, carga de metadatos, lectores, teclado y reduced motion.
- Verificar iconos definitivos y fidelidad visual al mockup original mediante capturas.
- Revisar filtros de papelera con combinaciones y cierre de diálogos por acciones, todavía no certificados.

No asignar nota de certificación hasta ejecutar las pruebas. La siguiente iteración debe ser validación y correcciones, no expansión de alcance.
