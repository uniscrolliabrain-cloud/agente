# 01B. Reducir la decisión de ruta

Fase 01 · Montaje del chat y autoridad. Correspondencia con P01, P04 de la especificación original.

Conservar las rutas observadas y extraer una decisión pura solo si hay dos montajes que discrepan. El opt-in debe usar scope resuelto en servidor. Antes de abrir el stream, distinguir configuración incompleta, usuario sin membresía y proveedor no disponible.

**Criterio de salida.** El control positivo llega a Fast V2. Un tenant excluido conserva el comportamiento anterior y un backend AG-UI explícito conserva su destino.

**Superficies de partida.** [Fuente, blob 503e0c7e2bab](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/agent.ts) · [Prueba de referencia, blob 97882a023a9c](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/trans02-candidate-routing.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/01-consolidacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
