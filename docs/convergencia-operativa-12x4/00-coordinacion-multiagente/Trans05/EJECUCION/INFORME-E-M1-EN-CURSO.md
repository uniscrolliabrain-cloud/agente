# Trans05 — ejecución E-M1 en curso

**PARTIAL_PURE_UNMOUNTED** sobre `5d48d27c13f96533df3815f1829b54007d046dcd`. Implementación pura de P02/P04/P05 y segmentación/packing de P09/P10, conforme al orden B1. Sin nuevos storage, workers, runtime, eventos ni activación compartida. Documentos históricos preservados.

Schemas estrictos de scope por hilo, annotations y deltas; catálogo versionado de 12 skills y composite informativo de una unidad presupuestaria (no precio ni tokens de proveedor); prioridad de corrección/contradicción y abstención; pesos vacíos sin calibración inventada. Segmentos conservan offsets UTF16 exactos y Unicode; no se fabrican páginas o tiempos. Pack cuenta framing JSON y señala falta de anchors obligatorios sin truncar negaciones. Propuestas se contrastan con binding servidor y evidencia exacta, sin reemplazar premisas humanas. Draft narrativo admite únicamente reviewStatus draft y no otorga autoridad de publicación.

Seis pruebas de comportamiento, seis PASS, cero skips; typecheck raíz y worker exit 0. Se corrigió una incompatibilidad de biblioteca ES2023 en la aserción Unicode sin cambiar objetivo de la prueba. Estas pruebas son fixtures de módulos nuevos: no constituyen regresiones rojo/verde del serving ni certificación longitudinal.

Paths nuevos exactos reservados para P02–P10: packages/domain/src/longitudinal.ts; apps/server/src/engine/cognition/v2/longitudinal/selector.ts, segments.ts, pack.ts y proposal.ts; tests/trans05-pure-longitudinal.test.ts. Ningún barrel ni callsite de Trans02 modificado.

Pendientes: journal autenticado/ACL de thread, sidecars estrictos si se justifican, cola Slow versionada, projector CAS/cursor, fuentes y derechos resueltos, publicación humana, brief derivado, integración en selector/serving existente, revocación completa, corpus 10k/50k/100k/500k y ablations con oráculo independiente, H02/H03, PG restringido y convergencia. Las formas de datos no acreditan derechos, verdad ni permisos. No hay garantía de calidad de respuesta o recuperación longitudinal todavía. Los 48 bloques continúan PENDING hasta evidencia por bloque; campaña abierta.
