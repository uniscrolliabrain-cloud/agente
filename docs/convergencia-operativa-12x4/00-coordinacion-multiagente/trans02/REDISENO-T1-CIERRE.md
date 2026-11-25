# T1 — cierre de inventario y entrada a diseño
Estado: arqueología documental suficiente para diseño; certificación NO_GO / NOT_RUN. No afirmar lectura integral de todos los consumidores ni suites. P1–P6 conservan evidencia R01–R36; corregir referencia chat-agent SHA a 3ab50c7e78a173aa52877293ce9be87ff6d85.
## Canon
Leídos los 36 README de bloques fases 04–12 en esta pasada, complementando 12 de 01–03 de pasada anterior. Son instrucciones de ejecución PENDING, no resultados. Los 12 PATCHSETS contrastados acumulativamente. P1 inventario/contrato, P2 wiring y pruebas, P3 auditoría independiente/refactor, P4 fault injection/rollback/GO. No modificar canon ni UX/demo.
## Matriz propuesta (IDs nuevos T2-Pxx, no reutilizar Cxx históricos)
F01 P01 selector/identidad R01,R07,R21,R22; P02 contexto/atención R02,R03,R08,R09,R10,R23,R34; P03 proyección/recibos R05,R12,R13,R19,R24,R25; P04 Slow admisión R04,R14,R16,R31.
F02 P05 señales H02 R06,R15,R22,R32: hooks existentes, Trans04 exporta, sin payload.
F03 P06 proveedores/JEV R17,R20,R26–R30,R32: perfiles independientes, consentimiento, contabilidad, no autorización.
F04 P07 receipt WhatsApp: Trans03 normaliza accepted/confirmed/unknown, Trans01 verifica y persiste; Trans02 proyecta estado con scope, no envía.
F05 P08 RAG/Google R18,R19: ACL/revisión Drive, Gmail/Calendar/Maps/Docs receipts por familia; no segundo OAuth.
F06 P09 fixtures: Trans04 genera reproducibles, Trans02 prueba contradicción/revocación/replay, no demo.
F07 P10 identidad/RLS R01,R33: owner real solo plan autorizado, no ampliar actor==owner sin PDP/RLS.
F08 P11 cyber: reutilizar bridge existente, inspeccionar código antes de hunk, hallazgo != remediación.
F09 P05 extensión: lag event→card→snapshot, denominadores y fallos JEV, no doble contador.
F10 P12 gestoría: conciliación receipt != propuesta fiscal, Trans03 adapter, Trans01 autoridad.
F11 P13 recompilación/memorias R11,R35: preserve provenance, legacy unknown/private, version SOP, no borrado.
F12 P14 gate R36: suites existentes, PG restringido, sandbox, rollback, NO_GO C05/C08/C13/C14/C15 hasta evidencia.
Cada fase conserva P1–P4; macro M1 P01–P06 contratos/core, M2 P07–P13 slices/extensiones dependientes, M3 P14 reauditoría. No iniciar M2 con gate obligatorio rojo. IDs históricos C01–C08 y C01–C15 no equivalentes; mapear por descripción en T2, no por número.
## Límites y siguientes acciones
T2 debe contener hunks y firmas concretas, SQL CAS, tests existentes y nuevos, wiring exacto, orden/rollback. Revisar suites relevantes y ABI Trans01/03/04 antes de cada hunk; no declarar lectura total del repo. Bloqueos externos fail-closed. No ejecución de tests ni cambios funcionales. No nota >=9 hasta reauditoría T3. Este cierre permite comenzar diseño, no autoriza implementación.
