# Proyectos — capacidades futuras

Superficie `proyectos`. Catálogo de producto; el clon solo pinta tarjetas de ejemplo (`lorem-app`, `ipsum-api`, `dolor-landing`).

## Propósito

Ser la fuente de verdad de **qué software hay** y **cómo está**: no una lista de repos, sino la unidad de trabajo a la que se vinculan chats, entornos, despliegues, datos y bitácora. Cada proyecto agrupa uno o varios repositorios, sus entornos y su dominio.

## Modelo de trabajo

Un proyecto puede nacer de tres maneras: importado de GitHub, creado desde plantilla o creado desde cero con el Estudio. En los tres casos recibe identificador estable, propietario, stack declarado y política de autonomía heredada del workspace, que luego puede sobrescribir.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Alta desde plantilla | Elige stack (Next.js + D1 + Workers, Astro + R2, API Hono), nombre y visibilidad inicial. | Crea repositorio y preview; producción nunca automática. |
| Importar repositorio | Conecta un repo existente y detecta framework, gestor de paquetes y comando de build. | Si no puede detectarlo, pide confirmación antes de escribir configuración. |
| Ficha de proyecto | Stack, propietario, entornos, dominio, último despliegue, cobertura, coste del mes. | Cada dato muestra su fuente y su antigüedad. |
| Salud | Semáforo con motivo: build roto, checks en rojo, dominio sin verificar, dependencias desactualizadas. | Un semáforo siempre se puede abrir para ver la causa; nunca es un color sin explicación. |
| Acciones rápidas | Abrir editor, abrir preview, nuevo chat, ver bitácora. | Todas llevan a superficies reales, con proyecto ya seleccionado. |
| Archivar y restaurar | Archiva sin borrar historial; restaura con todo su contexto. | Archivar no detiene recursos de producción: eso se hace en Despliegues. |

## Capacidades · fase V2

- **Plantillas de equipo**: convenciones de lint, tests y estructura de carpetas por tipo de producto.
- **Proyectos vinculados**: dependencia declarada entre servicios con aviso de versión incompatible.
- **Traspaso de propiedad** con auditoría y aceptación del nuevo responsable.
- **Duplicar como entorno de pruebas** sin copiar secretos ni datos personales.
- **Catálogo de módulos reutilizables**: autenticación, pagos, correo, con su estado de adopción.

## Capacidades · fase V3

- **Portfolio técnico compartible** con clientes (`viewer`): estado, preview y última entrega, sin código.
- **Política por proyecto**: quién puede desplegar, en qué franja y con cuántos revisores.
- **Coste total por proyecto** uniendo cómputo, datos, ancho de banda y créditos de IA.

## Integraciones y datos

GitHub (repos y ramas), Vercel y Cloudflare (recursos y despliegues), D1/R2 (esquema y buckets) y el proveedor de modelo para coste. El proyecto no guarda secretos: solo referencias a `13-entornos`.

## Límites y no-objetivos

- No es un gestor de tareas: los pendientes viven en la app principal y se enlazan, no se duplican.
- No borra repositorios ni recursos desde aquí; el borrado vive en la integración correspondiente y exige confirmación escrita.
- No inventa salud: sin conexión, el estado es "desconocido", no verde.

## Métricas de éxito

- Tiempo de alta de un proyecto nuevo hasta primera preview.
- Porcentaje de proyectos con build y checks en verde.
- Proyectos sin dominio verificado o con secretos caducados.
- Coste medio por proyecto y desviación mensual.

## Dependencias y riesgos

Depende de `06-repositorios`, `09-despliegues` y `10-infraestructura`. Riesgo: duplicar la verdad del repositorio; mitigación con GitHub como fuente de código y Agntia Code como fuente de contexto y política.
