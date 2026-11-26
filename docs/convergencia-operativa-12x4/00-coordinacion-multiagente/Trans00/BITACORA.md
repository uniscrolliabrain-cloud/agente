# Bitácora Trans00

## 2026-11-26 · D-M1

- Estrategia: preservar seis campañas, adendas mínimas, observabilidad antes de evolución cognitiva, supervisor único.
- Diagnóstico: ocho refs fijados, ocho árboles recursivos completos, 1489 paths de alcance y 58 divergentes; 37 entradas (24 Codex + 13 GPT) trazadas a 16 familias, una conducta getDelta conservadora no se presenta como defecto. Trans02/05 tienen delta funcional idéntico; Trans06 coincide con main en alcance. Main divergente de canónica, no merge ciego.
- Diseño: baseline documental desde main 26b9902d4b5a5e344969cfacab578025b8573b72, futura integración funcional separada, propiedad única, protocolo E-M1/2/3 con B1–B6.
- Simulación inicial: ABI pendiente permite tests/pure helpers fail-closed; conflicto app/index vuelve a T01; fuente/actor revocados invalidan contexto; unknown no resend; gate parcial no certifica; collector caído no afecta operación. Pendiente simulación exhaustiva D-M3.
- Feedback: mantener getDelta null; campo energía experimental fuera de patch; GitHub-first explícito, Doppler opcional, Supabase intacto; no transferir score dinámico a identidad durable. No trasladar blobs antiguos de main.
- Ejecución: rama Trans00 creada desde main fijado; publicación exclusivamente documental en carpeta Trans00. Comprobar diff y HEAD tras commit.
- Evidencia: consultas GitHub de fuentes y árboles, sin checkout/runner; no tests funcionales, no código, no merge, no deploy. AGENTS.md raíz 404. Lectura de documentos consolidados enfocada en secciones relevantes, no lectura nueva integral de 288 bloques; faltan Astra completo y validación de consumidores.
- Checkpoint: D-M1 entregado; D-M2 pendiente, D-M3 pendiente. Estado de ejecución funcional NO_GO. Próximo: 07-HANDOFF-PREPARACION.md.

## 2026-11-26 · D-M2

- Nuevos HEADs: main 55655cdba0348539a0169881794968761af85443; restantes canónica y seis Trans sin cambios. 50 deltas únicos, 0 conflictos de blob con main en selección; manifest exacto.
- Relectura de los cinco documentos Astra (R1–R3, C1–C3 y 3 experimentos), contraste de code anchors y montaje; se conserva arquitectura y se clasifican 37 entradas. FIX_NEEDED=27, PRESERVE=1, COVERED_BY_EXISTING_PATCH=9. C03-01: mitigation de retry en T01, falta receipt. C02-02 preservar.
- Reserva propuesta concreta por path, contratos existentes K1–K7, seis prompts candidatos y común. Ningún archivo funcional editado. No tests nuevos ejecutados, no rama funcional creada. D-M3 pendiente: simulación y freeze de handoff, autorización de ejecución separada. Ver 13-DM2-CHECKPOINT.md.
