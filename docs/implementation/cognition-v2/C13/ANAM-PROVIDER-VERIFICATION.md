# Verificación de proveedor Anam — 2026-11-15

Estado: **DOCUMENTACIÓN OFICIAL IDENTIFICADA; SANDBOX NO EJECUTADO; BLOCKED_EXTERNAL_PROVIDER**.

Fuentes primarias consultadas:

- [SDK JavaScript oficial](https://github.com/anam-org/javascript-sdk).
- [SDK Python oficial](https://github.com/anam-org/python-sdk).
- [Changelog oficial](https://anam.ai/changelog).

El SDK JS documenta intercambio de API key por token breve desde el servidor y un cliente WebRTC. También diferencia talk streams, su confirmación de entrega y los casos de desconexión/interrupción; el passthrough de audio no acredita la misma confirmación. La documentación de SDK distingue orquestación propia, LLM personalizado y audio externo. Esto confirma que existen modos técnicos, no que la cuenta del proyecto pueda utilizarlos o que sus garantías satisfagan C13.

Las páginas ensayadas `docs.anam.ai/custom-llm` y `docs.anam.ai/api-reference/session-token` no fueron accesibles mediante la herramienta. No se presentan como contratos verificados. La fuente de SDK sí fue abierta y leída; las búsquedas indexadas no sustituyen sandbox.

No se validaron cuenta, credenciales, región, DPA, retención, precio, cuotas, compatibilidad de avatar, formatos de audio ni firma de callbacks. No se enviaron audio, transcripciones, secretos o información de clientes. No se abrió una sesión facturable.

Decisión: conservar puerto servidor desacoplado y proveedor no disponible por defecto. Antes de un adaptador operativo deben fijarse versión/contrato oficial, modo elegido, tenant/actor/consentimiento, sandbox sintético, eventos de desconexión/interrupción y pruebas de tokens/media. No instalar un SDK en frontend ni habilitar fallback comercial para aparentar el gate.
