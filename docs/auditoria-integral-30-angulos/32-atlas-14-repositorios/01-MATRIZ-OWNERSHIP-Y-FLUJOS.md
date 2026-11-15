# Matriz de ownership y flujos interdominio — hipótesis arquitectónica

> Modelo objetivo derivado de los 14 Concept Masters. **No es inventario de funcionalidades ejecutadas**. Los owners de dominio deben validarse contra los contratos de cada repo.

## Propiedad de datos y responsabilidades

| Dominio | Owns (propuesto) | Consume de otros | Nunca debe duplicar |
|---|---|---|---|
| Ciberseguridad | posture, findings, controles, incidentes, evidence de seguridad | activos, proveedores, consentimientos | identidad global, motor de aprobación |
| Clientes | cuentas, contactos, relaciones, customer timeline | consentimientos, ventas, comunicaciones | autenticación de usuario, pagos |
| Gestoría | obligaciones, libros, expedientes, declaraciones | facturas, documentos, clientes | ledger bancario de Finanzas |
| Comunicación | conversaciones/canales, delivery receipts | contactos, agenda, políticas | CRM canónico, identidad de agente |
| Ventas | leads comerciales, oportunidades, propuestas | clientes, marketing, finanzas | libro mayor, cuentas bancarias |
| Finanzas | cashflow, movimientos, presupuestos, conciliación | facturación, ventas, seguros | facturas fiscales de Gestoría |
| Redes | publicaciones, calendarios sociales, métricas | branding, marketing, diseño, vídeo | consentimiento universal |
| Marketing | campañas, audiencias, atribución, experimentos | clientes, ventas, redes | identidades CRM |
| Vídeo | assets audiovisuales, render jobs, avatar media | branding, diseño, comunicación | voz/canal runtime del padre |
| Branding | identidad, brand guidelines, claims | diseño, marketing, vídeo | repositorio universal de archivos |
| Diseño | design systems, pantallas, componentes, assets de diseño | branding, vídeo, marketing | kernel de permisos |
| Legal | contratos, cláusulas, revisiones, obligaciones jurídicas | clientes, seguros, gestoría | firma/autorización global |
| Seguros | pólizas, coberturas, siniestros, riesgo asegurable | ciberseguridad, legal, finanzas | representación de autorización regulada |
| Formación | currículos, sesiones, evaluación, itinerarios | vídeo, comunicación, RRHH | identidad del empleado |

## Cuatro workflows sistémicos para reauditar

### A. Alta de cliente empresarial
1. Cliente/empresa se registra en kernel (tenant + actores).
2. Clientes crea contacto y relación; Legal establece base jurídica de tratamiento.
3. Gestoría configura obligaciones; Finanzas establece presupuesto y cobro; Comunicación configura canales.
4. Ciberseguridad evalúa accesos y postura; LAIA presenta estado desde eventos.
5. Invariante: ningún hijo crea `tenantId` alternativo; cada efecto requiere autorización y recibo.

### B. Incidente con posible siniestro
1. Ciberseguridad registra hallazgo, severidad, cadena de custodia y medidas.
2. Seguros comprueba cobertura **sin afirmar aceptación de siniestro**; Legal revisa plazos y notificaciones.
3. Finanzas estima impacto; Comunicación prepara borradores, nunca los publica sin autorización.
4. El padre correlaciona `incidentId`, `claimId`, `legalMatterId`, `financialImpactId` sin copiar expedientes completos.
5. Invariante: jurisdicción, confidencialidad y permisos profesionales aplican en cada frontera.

### C. Campaña comercial multimodal
1. Branding publica guía versionada; Diseño produce assets; Vídeo produce clips.
2. Marketing define audiencia y experimentos; Legal valida claims; Redes programa publicaciones.
3. Ventas gestiona oportunidades; Clientes conserva relación; Finanzas calcula ROI.
4. Invariante: un asset aprobado no equivale a aprobación de publicación en todos los canales.

### D. Formación a partir de incidentes
1. Ciberseguridad produce lección anonimizada; Formación crea módulo.
2. Vídeo prepara material; Comunicación distribuye a destinatarios autorizados.
3. Formación evalúa aprendizaje; Ciberseguridad recibe métricas agregadas, no datos personales innecesarios.
4. Invariante: una memoria de incidente restringido no se convierte en contexto conversacional de otros tenants.

## Cinco anti-patrones a evitar
- `agente` importa módulos internos de 14 repos y conoce sus modelos de base de datos.
- Cada hijo implementa su propio `User`, `Tenant`, `Approval` o `EventBus` incompatible.
- Un `string` de status o acción de un hijo se interpreta como autorización en otro.
- El presentador infiere éxito de una respuesta LLM en vez de un receipt verificado.
- Un workflow interdominio persiste datos de todos los hijos en un solo objeto global sin control de acceso.

## Contrato de colaboración deseado
Un workflow entre hijos debe poder describirse mediante: `tenantId`, `principal`, `mandate`, `workflowId`, `capabilityId@version`, `inputSchema`, `correlationId`, `idempotencyKey`, `evidenceRefs`, `resultStatus`, `receipt` y `policyDecision`. **Esto es propuesta**, no esquema existente confirmado. Cada repo aportará un adaptador, sin imponer un cambio de lenguaje o stack.
