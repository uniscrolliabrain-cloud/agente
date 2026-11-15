# Agntia finanzas — dossier de convergencia V1

**Repositorio:** https://github.com/uniscrolliabrain-cloud/agntia-finanzas

**Fuente comprobada:** `README.md` en rama por defecto, leído 2026-11-15. **No se han ejecutado pruebas ni certificado despliegue.**

## Estado declarado por el repositorio
README indica fundaciones C01–C05 con 41 tests; catálogo vacío, sin persistencia/adaptadores/UI/E2E.

## Qué debe resolver la arquitectura universal
Ledger, saldos vs forecast, conciliación, PSD2/consentimientos, roles de pago, finanzas vs gestoría.

## Invariante del dominio
No presentar forecast como saldo bancario ni habilitar pagos sin consentimiento y operador autorizado.

## Contratos mínimos a reconciliar con el padre
1. **Principal y tenant:** `tenantId`, `actorId`, `runtimeId`, roles, delegación, scopes, issuer y audience; comprobar compatibilidad real con `packages/domain/src/actor.ts` y `execution-context.ts`.
2. **Capacidades:** IDs y versiones del hijo, schemas input/output, permisos, riesgos, side effects, coste y catálogo autorizado; cotejar con `CapabilityContract` y `TenantScopedCapabilityRegistry`.
3. **Eventos:** vocabulario nativo, eventos confirmados vs comandos, correlación/causalidad, retries, dedupe e idempotencia; cotejar con `SystemEvent` y `EventBus`.
4. **Evidencia:** provenance, clasificación, retención, jurisdicción, referencias de artefactos y receipts, sin replicar datos sensibles.
5. **Estado y UI:** status nativo vs `Assignment`, errores, parcialidad y estado desconocido; el presenter no debe fabricar éxitos.
6. **Léxico:** localizar glosarios, namespaces, nombres de rutas, enums y estados existentes; registrar colisiones y aliases, sin renombrar código.
7. **Interoperabilidad:** escenarios de colaboración con al menos otros dos repositorios; fallo parcial, revocación y compensación.

## Preguntas de investigación aún abiertas
- ¿Qué léxicos y contratos existen realmente en el código o documentación del hijo, con rutas y SHA?
- ¿Qué capacidades de su Concept Master serán responsabilidad exclusiva del dominio y cuáles requieren servicios comunes?
- ¿Qué tipo de adaptador preserva su stack sin duplicar autoridad?
- ¿Cómo se hace un test de extremo a extremo con permisos, errores y evidencias sin requerir LLM?

**Estado del dossier:** `README_VERIFIED / CONTRACTS_PENDING / CONCEPT_MASTER_NOT_RECONCILED`. Esta ficha no dirige el desarrollo del hijo.
