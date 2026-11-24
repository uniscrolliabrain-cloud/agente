# Trans01 — ejecución M1–M3
Fuente de hunks: ESPECIFICACION-IMPLEMENTACION-V3.md y evaluación V1/V2. Aplicar PROTOCOLO-3-MACROTURNOS.md. No reiniciar trabajo existente.
## M1
1. A01: ActionsStore/Store/TenantScopedStore.claim, quinto argumento hash, predicado SQL y 409; preservar expiry y decisión atómica. Test carrera edit/approve y rollback.
2. A02: CapabilityRunner.run y ActionService.run; perfil gobernado explícito, PDP fresco, aprobación vinculada a inputs y binding; negar sin dependencias. Test revocación antes de efecto.
3. A03: CAS sobre claims, fence, unknown y conciliación; distinguir fallo de persistencia de transporte; comprobar scope owner/tenant. Test dos workers y timeout.
4. E01/E02/E03: SystemEvent/EmitOptions causal-1, replay cursor antes de limit, receipt y afterCommit; reutilizar DurableProjector. Test 401 eventos, crash y tenant ajeno.
5. S01: inventariar switch SOPExecutor.runStep; conservar resultados/checkpoint/ask_user; corregir autorización computer_command sin duplicar executor. Test role ausente y abort.
6. C01/H01: app/service/conversation, selector trans02 y hooks Trans04 tras ABI; deferred cerrado hasta contrato. HTTP V1/V2/AGUI y collector caído. B2.
## M2
7. V01–V06: catálogo existente, send_whatsapp/send_email/create_calendar_event, Maps/Drive/Docs según contrato Trans03; por operación schema/PDP/binding/claim/receipt/evento. Pruebas A/B, revoke, timeout, replay. No inventar IDs.
8. O01: roles y plan owner con Trans04; sin apply real. B3.
9. X01/X02: ciber y gestoría, lectura vs efecto, alcance, conciliación, no pagos/remediación automática. D01: recompilar SOP versionado preservando personalización y evidencia. G01: hooks outcome/lag. B4.
## M3
10. Auditar trans02 sobre SHA combinado: ACL, causalidad, persona, ranking, receipts falsos, Fast independiente. Corregir propios paths. B5.
11. Postgres restringido, CAS concurrente, crash postcommit, replay, restore, rollback, gates. B6. Preparar cierre de ramas sin ejecutarlo.
