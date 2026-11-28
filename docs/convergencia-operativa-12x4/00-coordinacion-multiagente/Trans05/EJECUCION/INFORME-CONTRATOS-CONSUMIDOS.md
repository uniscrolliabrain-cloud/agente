# Consumo de contratos longitudinales — en curso

Los tipos AnchorAnnotation, LongitudinalScope y LongitudinalDelta del domain sustituyen tipos duplicados en la firma real del validador de propuestas. No hay import decorativo ni allowlist. Seis pruebas PASS, cero skips; typecheck raíz/worker exit 0. Logs /tmp/trans05-contract-consumers.log, /tmp/trans05-contract-consumers-tsc.log y /tmp/trans05-contract-audit.log.

La auditoría reconoce los tres consumidores. Sigue en rojo por el contrato nuevo CognitiveHumanTurnPayload de Trans02, cuyo productor aún está pendiente; no se declara gate completo ni activación del serving. No se modificó la regla de auditoría, la canónica ni documentación histórica.
