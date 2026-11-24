# Cuaderno de bitácora UX — AgntiaPro

**Inicio:** 23 noviembre 2026  
**Fuente de decisión:** founder  
**Rama de trabajo documental:** `main`  
**Ámbito:** diseño UX/UI; no es una auditoría de implementación ni un certificado de calidad técnica.

## Regla principal

El founder declara **aprovechables por ahora**: Landing, Centro de Mando, Estudio Demo, Chat, Tareas, Automatizaciones y Equipo. **Todas las demás superficies requieren diseño.** «Aprovechable» significa que sirve como base visual y funcional de trabajo, **no** que esté terminada, probada o lista para producción.

No confundir **Estudio Demo** con **Estudio de Operaciones**; son nombres distintos y no se ha demostrado que sean la misma pantalla. Tampoco confundir **Tareas** con Apps ni con el Centro de Mando. Para no alterar las 19 carpetas principales aprobadas, sus fichas de estado se registran en `19-general/superficies-transversales/` hasta que el founder decida una ubicación definitiva.

## Estado de las 19 carpetas

| Carpeta | Estado UX declarado | Observación |
|---|---|---|
| [01-landing](../01-landing/README.md) | APROVECHABLE AHORA | Requiere diseño antes de tratarla como referencia aprobada. |
| [02-login](../02-login/README.md) | POR DISEÑAR | Existe prompt V2, pero no equivale a diseño implementado o aprobado. |
| [03-legal](../03-legal/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [04-chat-boton-transversal](../04-chat-boton-transversal/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [05-perfil](../05-perfil/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [06-settings](../06-settings/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [07-menu-lateral](../07-menu-lateral/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [08-centro-de-mando](../08-centro-de-mando/README.md) | APROVECHABLE AHORA | Conservar como está por ahora. |
| [09-chat](../09-chat/README.md) | APROVECHABLE AHORA | Requiere diseño antes de tratarla como referencia aprobada. |
| [10-estudio-de-operaciones](../10-estudio-de-operaciones/README.md) | PENDIENTE DE VALIDACIÓN — no confundir con Estudio Demo | Requiere diseño antes de tratarla como referencia aprobada. |
| [11-apps](../11-apps/README.md) | POR DISEÑAR | El catálogo documental existe; NO significa que las 34 interfaces estén aprobadas. |
| [12-comunicacion](../12-comunicacion/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [13-automatizaciones](../13-automatizaciones/README.md) | APROVECHABLE AHORA | La sección principal está aprovechable; no implica que la App 16 esté aprobada. |
| [14-documentos](../14-documentos/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [15-conocimiento](../15-conocimiento/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [16-proyectos](../16-proyectos/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [17-equipo](../17-equipo/README.md) | APROVECHABLE AHORA | La sección principal está aprovechable; no implica que la App 18 esté aprobada. |
| [18-data](../18-data/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |
| [19-general](../19-general/README.md) | POR DISEÑAR | Requiere diseño antes de tratarla como referencia aprobada. |

**Adicionales aprovechables:** [Estudio Demo](./superficies-transversales/ESTUDIO-DEMO.md) y [Tareas](./superficies-transversales/TAREAS.md). Se contabilizan aparte de las 19 carpetas, sin confundirlas con Estudio de Operaciones.

## Milestones de diseño

| Hito | Objetivo | Estado | Criterio de cierre |
|---|---|---|---|
| UX-00 | Inventario y clasificación por decisión del founder | Registrado | Cada superficie identificada y diferenciada |
| UX-01 | Consolidar referencias aprovechables: Landing, Centro de Mando, Estudio Demo, Chat, Tareas, Automatizaciones, Equipo | Pendiente | Capturas y rutas/componentes contrastados, sin rediseño forzoso |
| UX-02 | Consolidar tokens y componentes de marca de la Landing | Pendiente | Guía reutilizable responsive, validada por founder |
| UX-03 | Diseñar Login según prompt V2 | Pendiente | Mock desktop/móvil aprobado; autenticación real preservada |
| UX-04 | Diseñar navegación transversal: menú, chat flotante, perfil, settings | Pendiente | Interacciones y accesibilidad definidas |
| UX-05 | Diseñar superficies pendientes: legal, comunicaciones, documentos, conocimiento, proyectos, data | Pendiente | Ficha, wireframe y mock de cada superficie |
| UX-06 | Diseñar metadashboard Apps y revisar cada una de las 34 Apps individualmente | Pendiente | Aprobación explícita por App; no confundir catálogo con UI terminada |
| UX-07 | Validación visual, responsive y estados de interacción | Pendiente | Capturas, checklist y revisión del founder |

## Registro cronológico

### 2026-11-23 · UX-LOG-001 · Decisión de alcance
- El founder define las siete superficies aprovechables: Landing, Centro de Mando, Estudio Demo, Chat, Tareas, Automatizaciones, Equipo.
- El resto queda clasificado **por diseñar**, sin asumir que el código no existe.
- Se crea esta bitácora y se añaden fichas de estado a las 19 carpetas.
- El Centro de Mando actual se mantiene; no se solicita rediseño.
- Se documenta en `main` sin crear rama para documentación.

## Plantilla para futuras entradas

```md
### AAAA-MM-DD · UX-LOG-XXX · Título
- Superficie / ruta:
- Hallazgo u observación:
- Decisión del founder:
- Propuesta de diseño:
- Evidencia (captura, código, enlace):
- Estado: idea | por diseñar | en diseño | en revisión | aprovechable | aprobado
- Dependencias / bloqueos:
- Siguiente paso:
```

## Reglas de mantenimiento

- Registrar decisiones fechadas y evidencia; no borrar historial al cambiar el estado.
- «Aprovechable», «aprobado», «implementado» y «desplegado» son estados distintos.
- No declarar una superficie aprobada solo porque tiene carpeta o prompt.
- No cambiar la estructura principal de 19 carpetas sin autorización.
- No desplegar ni cambiar código por actualizar esta bitácora.

## 2026-11-24 · Dogfooding V1 · promoción al producto real

- Superficie / ruta: `apps/web` (`Login V3`, `/legal`), `apps/site` (landing y consentimiento).
- Hallazgo: la landing viva no coincidía con `main`; Login V3 y Legal V1 eran piezas de laboratorio sin contratos reales.
- Decisión: preservar la landing viva, conectar Login/Legal a los contratos existentes y no promover superficies con fixtures sin cablear.
- Evidencia: `docs/dashboards/19-general/campana-promocion-dogfooding-v1/`.
- Estado: Login V3 y Legal V1 integrados y verificados en preview; deploy lanzado por el workflow real. Chat transversal, Centro de Mando, chat principal y Launcher siguen pendientes.
- Siguiente paso: verificar el dominio y cablear las cuatro superficies operativas.
