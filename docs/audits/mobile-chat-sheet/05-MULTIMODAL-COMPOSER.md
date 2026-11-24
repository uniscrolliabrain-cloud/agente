# 05 — Contrato de compositor multimodal (ChatGPT-like)

## Requisito de producto, 2026-11-20
La ventana de chat transversal de AgntiaPro, en móvil y escritorio, debe mantener siempre una experiencia de conversación escrita comparable al compositor de ChatGPT. En la barra de composición, además de escribir y enviar con flecha, se reservan **tres acciones visibles**:
1. Icono **bocadillo de cómic** (`MessageCircle`): conversación oral bidireccional de baja latencia con ElevenLabs (turn-taking, reproducción y captura de audio). NO confundir con dictado.
2. Icono **micrófono** (`Mic`): dictado/transcripción de voz a texto editable en el compositor, sin enviar automáticamente.
3. Icono **vídeo** (`Video`): sesión audiovisual con avatar de Laia mediante Anam; no es adjuntar vídeo.
4. Icono **flecha enviar** (`ArrowUp`): enviar el texto escrito mediante `useChat.send`, con el comportamiento existente de cancelar cuando streaming.

Orden visual orientativo: bocadillo, micrófono, vídeo a la izquierda; Enviar a la derecha. Mantener controles visibles y táctiles en los cuatro snap points, en viewport pequeño y con teclado abierto; evitar solapamientos con FAB, grip, safe area y teclado. Para el nivel plegado, priorizar compositor íntegro sobre porcentaje exacto.

## Estado y contratos
- **Implementar ahora** presentación accesible, responsive y estados de disponibilidad; no fingir integración de proveedores.
- **No implementar ahora** conectores ElevenLabs/Anam ni inventar credenciales/endpoints; no agregar dependencias ni llamadas reales.
- Botones no cableados: `disabled` con etiqueta accesible «Próximamente: ...» y explicación visible/tooltip compatible con móvil, o diálogo informativo explícito. Nunca aparentar iniciar sesión real.
- Separar estado de modalidad `text | dictation | voice-call | video-call` y estados `idle | requesting-permission | connecting | active | ending | error` para futuro cableado, sin cambiar la API de chat actual. Los modos futuros requieren permisos explícitos de micro/cámara, indicadores de captura, finalizar sesión, gestión de errores y limpieza de tracks; nada se inicia automáticamente.
- Voz bidireccional y videollamada deben ser sesiones separadas del envío de texto, pero vinculables al mismo `threadId`, tenant y contexto, sujetos a autorización. No duplicar `useChat` ni guardar audio/video por defecto.
- Dictado: insertar texto editable, respetar cursor, permitir corregir y enviar voluntariamente.
- El botón enviar jamás puede quedar tapado por el FAB de chat; cuando la hoja esté abierta el FAB debe desaparecer. Revisar `App.tsx`, `ChatInput.tsx`, `SidebarChat.tsx`, `ChatPanel.tsx`, estilos y posibles duplicados.
- Unificar el compositor transversal y el chat completo en un componente compartido o variante de `ChatInput`, no crear dos interfaces divergentes.

## Aceptación adicional
M01: bocadillo, micro, vídeo y enviar visibles y etiquetados en chat completo, dock escritorio y sheet móvil.
M02: 26/45/68/100% y teclado Android: todos los controles siguen visibles y tocables; enviar nunca interceptado.
M03: sin integración, acciones de ElevenLabs/Anam comunican «Próximamente», no hacen llamadas ni piden permisos.
M04: dictado no disponible comunica estado real; al integrarse, texto editable sin envío automático.
M05: envío escrito y cancelación streaming existentes sin regresión.
M06: teclado, lector de pantalla, foco, áreas táctiles mínimas ~44px y reduced-motion.
M07: no hay exposición de secretos ni datos entre tenants.

## Trabajo Codex
Añadir esta especificación a W0 y W1; implementar el scaffold visual en una ola separada **después** de reparar FAB, drag y teclado, salvo que sea necesario cambiar el compositor para solucionar esos fallos. En informe distinguir UI implementada, provider stub y proveedor conectado. No declarar funcional ElevenLabs o Anam hasta probar integración real. No fusionar ni desplegar sin aprobación.
