# Apps — catálogo y metadashboard de la sección Workspaces

## Decisión del founder · 23 de noviembre de 2026

La sección existente **Workspaces** pasa a llamarse **Apps**. Este cambio se refiere a la presentación, acceso y organización de los módulos/workspaces, **no a la arquitectura ni al concepto global de AgntiaPro**. No sustituye ni rediseña el Centro de Mando, Estudio de Operaciones, LAIA, agentes, runtime, comunicaciones, memorias u otras áreas ya existentes. No implica cambiar nombres de rutas, directorios, integraciones o contratos técnicos sin una campaña y aprobación específicas.

### Experiencia deseada

- **Móvil:** la sección Apps se parece a la pantalla de inicio de Android cuando enciendes el teléfono: una superficie visual de iconos/logos que abre módulos, con diseño propio de AgntiaPro. No copiar la marca de Android ni la de las apps que inspiraron los workspaces.
- **PC:** adaptación del mismo concepto a un escritorio de mayor superficie, aprovechando el espacio disponible sin imponer una copia literal del layout móvil.
- **Apps:** cada uno de los 35 workspaces actuales se presenta como una app o módulo accesible desde el catálogo; conservan su funcionalidad y UX específica.
- **Metadashboard adaptativo de Apps:** un algoritmo analiza patrones generales de uso y la actividad/contexto del usuario **en ese instante** para acercarle las aplicaciones más necesarias. El objetivo es reducir el esfuerzo de navegación, no modificar automáticamente la lógica de negocio.
- **Miniapps de utilidad empresarial:** el catálogo también admitirá pequeñas aplicaciones como calculadoras de desempeño del trabajo, presupuestos y otras herramientas prácticas. Sus nombres, cantidades y fórmulas todavía no están definidos; no inventar especificaciones funcionales.
- **Branding:** iconos, logos, tipografía, colores, geometría, movimiento y estados visuales deben alinearse con la landing premium y Studio Demo y con la guía visual del repositorio.

### Límites y criterios de UX

La sección Apps es **una parte del software**, no su nuevo sistema operativo ni un rediseño transversal. Mantener accesibles todas las apps aunque el algoritmo destaque solo algunas; respetar preferencias manuales y evitar reordenaciones imprevisibles. Cualquier algoritmo concreto, ponderaciones, señales de contexto, telemetría, privacidad y permisos requerirá una especificación y revisión posteriores. No declarar ese algoritmo implementado.

## Inventario real de 35 workspaces actuales

Fuente: directorios numerados existentes en `apps/web/src/workspaces/` de `main`, comprobados el 23-11-2026. Son **identificadores técnicos actuales**, no nombres comerciales definitivos ni prueba de que todos los módulos estén terminados.

| Nº | Nombre actual del workspace | Documentación individual |
|---:|---|---|
| 01 | `01-gmail` | [Ficha](../01-gmail/README.md) |
| 02 | `02-whatsapp` | [Ficha](../02-whatsapp/README.md) |
| 03 | `03-hubspot` | [Ficha](../03-hubspot/README.md) |
| 04 | `04-holded` | [Ficha](../04-holded/README.md) |
| 05 | `05-google-drive` | [Ficha](../05-google-drive/README.md) |
| 06 | `06-google-calendar` | [Ficha](../06-google-calendar/README.md) |
| 07 | `07-linear` | [Ficha](../07-linear/README.md) |
| 08 | `08-chatgpt` | [Ficha](../08-chatgpt/README.md) |
| 09 | `09-airtable` | [Ficha](../09-airtable/README.md) |
| 10 | `10-perdoo` | [Ficha](../10-perdoo/README.md) |
| 11 | `11-holded-tesoreria` | [Ficha](../11-holded-tesoreria/README.md) |
| 12 | `12-odoo-purchase` | [Ficha](../12-odoo-purchase/README.md) |
| 13 | `13-productive` | [Ficha](../13-productive/README.md) |
| 14 | `14-zendesk` | [Ficha](../14-zendesk/README.md) |
| 15 | `15-docusign` | [Ficha](../15-docusign/README.md) |
| 16 | `16-n8n` | [Ficha](../16-n8n/README.md) |
| 17 | `17-process-street` | [Ficha](../17-process-street/README.md) |
| 18 | `18-factorial` | [Ficha](../18-factorial/README.md) |
| 19 | `19-personio` | [Ficha](../19-personio/README.md) |
| 20 | `20-ramp` | [Ficha](../20-ramp/README.md) |
| 21 | `21-stripe` | [Ficha](../21-stripe/README.md) |
| 22 | `22-canva` | [Ficha](../22-canva/README.md) |
| 23 | `23-buffer` | [Ficha](../23-buffer/README.md) |
| 24 | `24-shopify` | [Ficha](../24-shopify/README.md) |
| 25 | `25-intercom` | [Ficha](../25-intercom/README.md) |
| 26 | `26-odoo-inventory` | [Ficha](../26-odoo-inventory/README.md) |
| 27 | `27-maintainx` | [Ficha](../27-maintainx/README.md) |
| 28 | `28-odoo-manufacturing` | [Ficha](../28-odoo-manufacturing/README.md) |
| 29 | `29-isms-online` | [Ficha](../29-isms-online/README.md) |
| 30 | `30-microsoft-entra` | [Ficha](../30-microsoft-entra/README.md) |
| 31 | `31-suitedash` | [Ficha](../31-suitedash/README.md) |
| 32 | `32-notion` | [Ficha](../32-notion/README.md) |
| 33 | `33-langsmith` | [Ficha](../33-langsmith/README.md) |
| 34 | `34-trello` | [Ficha](../34-trello/README.md) |
| 35 | `35-centro-mando` | [Ficha](../35-centro-mando/README.md) |

## Encaje en UI Lab

Esta ficha define el **launcher/metadashboard de la sección Apps**, no una app adicional del catálogo ni una sustitución de las 35 fichas. Las 35 fichas existentes siguen en `apps/ui-lab/docs/dashboards/`. Para la experiencia del launcher, documentar en futuras pasadas: especificación visual desktop/móvil; flujos de acceso y búsqueda; personalización y ranking contextual; contratos de iconos/tiles/widgets; fixtures demo; componentes; pruebas de estabilidad de navegación, accesibilidad y capturas. Preservar la explicación original del founder como fuente prioritaria.

**Estado:** definición conceptual aprobada en conversación; documentación solamente. Sin implementación, cambios de backend, merges a main ni despliegue.
