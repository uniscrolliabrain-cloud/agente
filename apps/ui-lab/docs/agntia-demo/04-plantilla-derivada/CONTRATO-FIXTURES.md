# Contrato de coherencia para fixtures demo

Estas son reglas de **datos de laboratorio**, no contratos de API ni instrucciones de implementación productiva.

1. **Tenant fijo:** `agntia-demo` en todos los nuevos conjuntos de datos de este laboratorio. Owner y empresa tienen IDs diferenciados.
2. **Identidades estables:** una misma persona, agente, cliente, proyecto o documento conserva su ID en todas las vistas.
3. **Referencias válidas:** toda relación apunta a entidades existentes en el mismo universo simulado, salvo referencias externas expresamente ficticias.
4. **Cronología coherente:** fechas, plazos, mensajes, eventos y estados respetan el reloj lógico del escenario.
5. **Consistencia operacional:** una factura, oportunidad, tarea o ticket debe reflejar estados compatibles con las acciones y eventos simulados.
6. **Consistencia financiera:** monedas, importes, impuestos, cobros, saldos y métricas usan convenciones explícitas y no se contradicen entre workspaces.
7. **Roles y autoridad:** las decisiones, ejecuciones y aprobaciones se atribuyen a actores autorizados dentro del escenario ficticio.
8. **Trazabilidad demo:** cuando haya acciones, asociar evento, actor, entidad, tiempo y resultado simulado; no afirmar auditoría real.
9. **Separación de capas:** perfil ontológico/operacional relativamente estable; escenarios variables; presentación UX libre.
10. **Datos seguros:** nombres, correos, teléfonos, documentos, credenciales, cuentas y operaciones son sintéticos; nunca secretos ni clientes reales.
11. **Cobertura explícita:** un escenario no necesita poblar los 18 dominios, pero la plantilla de compilación los contempla todos y marca lo no aplicable.
12. **Integración diferida:** tras terminar UX, registrar una auditoría ligera y propuesta técnica en el reporte; no construir backend por defecto.

## Validaciones recomendadas de demo

- Unicidad de IDs y ausencia de referencias huérfanas
- Consistencia de tenant y ownership
- Fechas y estados compatibles
- Totales y KPIs reconciliables
- Eventos atribuibles a actores y entidades
- Acciones de UI inequívocamente simuladas
- Coherencia del mismo dato en múltiples workspaces
