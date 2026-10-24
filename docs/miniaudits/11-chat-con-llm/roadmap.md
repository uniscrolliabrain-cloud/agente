# Roadmap — 11 chat con LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Responde en <2s, con tono humano, sin alucinar.

## 2. Estado verificado
- Prompt con 8 reglas de tono.
- RAG como system message. urgentBlock de 3 líneas.
- Fuente: repodump conversation.ts.

## 3. Huecos contra producción
- Presenter no wireado.
- Sin timeout duro de primera respuesta.
- Historial limitado a 3 mensajes.
- Sin feedback durante slow.

## 4. Objetivo
El chat respeta al Presenter y responde en <2s o avisa.

## 5. Fronteras
- No streaming de audio.

## 6. Conexiones
- Depende de: 09, 10.
- Archivos compartidos: conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo, UI servida.

## 8. Cómo se verifica el cierre
- Test de primera respuesta <2s.
- Test de tono: no "Perfecto", no "Capability".
- Presenter decide el texto del SSE.
