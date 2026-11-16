# W11 — Escritura empresarial con aprobación (A03)

Base `474ad9c`. `CognitionBusinessWrite` es un puerto interno **no montado** en HTTP, chat ni workers. Admite solo capabilities de una allowlist explícita inyectada en el constructor; el contrato debe ser `kind: "tool"`, `requiresApproval: true`, riesgo distinto de `low` y exactamente un efecto `write`/`external_write`. Rechaza lo demás antes de tocar nada.

Identidad y actor se resuelven de nuevo en cada intento; el actor debe ser humano, activo y del mismo tenant, y el PDP debe devolver `allow` para `execute/project`. Cada solicitud referencia un `ApprovalRequest` formal en `approval-requests` que debe coincidir en tenant, owner, capability y hash del payload (`digest([capability, input])`); una aprobación de otro payload, caducada, pendiente o rechazada no autoriza.

Consumo de un solo uso: se marca `payload.consumedBy` con un `compareAndSwap` sobre `{status:"approved", payload:{hash, consumedBy:null}}` antes del efecto. El estado del `ApprovalRequest` no sale de su esquema (`pending|approved|rejected|expired`); el desenlace se registra en `payload.outcome`. Las aprobaciones sin el marcador `consumedBy` se rechazan (`BUSINESS_APPROVAL_UNBOUND`) en lugar de asumirse nuevas. Un fallo previo al efecto libera el receipt para permitir un intento corregido; uno posterior deja receipt y aprobación en `unknown` y no se reintenta automáticamente.

La puerta de aprobación propia del `CapabilityRunner` V1 se satisface exponiendo la **misma** aprobación ya consumida como registro `executing`, no una segunda aprobación. Sin ese puente el runner rechazaba por `requires approval`.

Pruebas `tests/cognition-v2-business-write.test.ts`: 3/3 PASS, 0 omitidas, con PGlite y con PostgreSQL 17.9 sintético loopback; incluyen PDP denegado, capability fuera de allowlist, aprobación ausente/mismatch/caducada/pendiente/sin marcador, repetición idempotente del mismo `operationId`, aprobación gastada usada para otra operación, fallo incierto sin retry y dos conexiones concurrentes que no pueden gastar la misma aprobación. `tsc --noEmit`: PASS.

Límites: no crea aprobaciones (las emite el flujo existente), no implementa compensación, no cubre `high`/`critical`, no verifica el efecto externo y no está conectado a la aplicación. A03 pasa de `NOT_RUN` a `PARTIAL`; la aceptación empresarial completa y C15 siguen NO_GO. Los proveedores reales continúan sin configurar: `JevClassifier` exige una `apiKey` no vacía y Anam no tiene adaptador, así que ambos fallan cerrados o no existen en lugar de simularse.
