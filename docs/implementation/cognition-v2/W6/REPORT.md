# W6 — Puerto JEV con contrato público verificado

Estado: LOCAL_CONTRACT_TESTED / LIVE_DISABLED. Fuentes, hash del OpenAPI y límites: [verificación C08](../C08/JEV-PROVIDER-VERIFICATION.md).

Se implementa TypeSafe REST con siete preguntas atómicas por request, modelos fijados y resultados siempre propuestos. SemanticClassifier es inyectable desde bootstrap confiable, conservando reglas por defecto. No se configura salida externa por tener una clave presente. Gateway de egreso obligatorio y pendiente de integración real; ninguna inferencia real ejecutada.

Pruebas locales focales 7/7 PASS; request/response sintéticos validados contra SystemOneRequest/SystemOneResponse del OpenAPI oficial. No se midió calidad/calibración ni coste real. La tolerancia de sumas de probabilidades valida formato/rounding; no es umbral de aceptación empresarial.

No se añadieron dependencias. Los logs/reportes no contienen credenciales ni texto privado; se registra metadata y uso reportado, no precios calculados. Un resultado de proveedor no adquiere autoridad de ejecución.
