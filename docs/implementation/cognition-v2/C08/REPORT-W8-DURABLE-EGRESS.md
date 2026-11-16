# C08 W8 — Gateway durable e integración del adaptador

Base: d0ea1f2d6b92c02d537babaf0776b21a864f10d9. Adaptador W6 incorporado mediante cherry-pick 403bc74 desde 1f63fa9929a48c16f02344a0b1efa52216f2e91a, sin reemplazar las correcciones de C09/C11/C12.

Se implementa DurableJevEgressGate con puertos explícitos de PDP/consentimiento y minimización. Un tenant por instancia, identidad/evidencias revalidadas mediante ContextServingFacade, grants ligados a operación Slow/actor/política/modelo/ontología y contenido por digest. No se guardan el candidato privado ni el texto minimizado; solo bindings, cuotas y resultados/uso estructurados. Las dos tablas aditivas entran en el inventario RLS explícito.

Las cuotas de peticiones por día y de concurrencia se admiten bajo bloqueo SQL compartido entre workers. No se pretende demostrar un límite monetario usando tokens estimados. Un intento reservado no puede reenviarse automáticamente tras reinicio; al expirar pasa a uncertain sin devolver cuota, porque un timeout no demuestra ausencia de facturación. Los resultados son idempotentes y los conflictos no se sobrescriben. La contabilidad puede completarse después de revocación, sin conceder nueva autorización. Cancelación interrumpe la espera de un puerto de minimización atascado.

Comando focal: node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/cognition-v2-jev*.test.ts tests/cognition-v2-rls.test.ts, con Postgres 17 sintético local configurado: 13 tests, 13 pass, 0 fail, 0 skip/cancel/todo, 14.609708 s. Incluye integración adaptador↔gateway con transporte simulado, rollback de cuota, dos conexiones concurrentes, cancelación, revocación de fuente/consentimiento, manipulación y restart. No llamadas de inferencia reales.

C08 continúa EN CURSO: están operativos el puerto, clasificador baseline, contrato oficial, adaptador y control durable local. Quedan corpus gold/calibración/ablaciones, DPA/consentimientos y configuración reales, sandbox del proveedor y aprobación de activación. No autoactivación desde variables/keys ni integración con empresas reales. C15 distingue ya contrato verificado de proveedor certificado.
