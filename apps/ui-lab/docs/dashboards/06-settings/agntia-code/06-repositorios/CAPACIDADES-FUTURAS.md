# Repositorios — capacidades futuras

Superficie `repositorios`. Propuesta; el clon lista repos inventados.

## Propósito

Establecer el vínculo de confianza entre Agntia Code y el código del cliente: qué repositorios puede leer, en cuáles puede escribir, quién lo autorizó y cómo se revoca. Sin esta superficie, ninguna otra puede tocar código de verdad.

## Modelo de trabajo

La conexión se hace con una GitHub App instalada por el `owner` de la organización, con permisos mínimos (lectura de contenido y metadatos; escritura solo si se activa PR). Cada repositorio se habilita explícitamente: ver una instalación no implica acceso a todos sus repos.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Conectar organización | Instala la App y muestra los repos disponibles. | Se piden permisos mínimos; el motivo se explica antes de redirigir. |
| Habilitar repositorio | Vincula un repo a un proyecto y elige rama por defecto. | Sin permiso de escritura, el repo queda en modo lectura y se indica. |
| Estado de sincronización | Última lectura, commits retrasados, webhook activo o caído. | Un webhook caído se muestra como incidencia, no como verde. |
| Detección de stack | Framework, gestor de paquetes, comando de build y tests. | Con baja confianza, pide confirmación. |
| Monorepo | Selecciona el paquete o carpeta raíz del proyecto. | Nunca asume la raíz si hay varios workspaces. |
| Revocar acceso | Quita un repo del proyecto o toda la instalación. | Revocar no borra el historial ya registrado. |

## Capacidades · fase V2

- **Escanear ramas y PRs abiertas** para sugerir trabajo pendiente.
- **Sincronización bidireccional de issues** con etiquetas por proyecto.
- **Repositorios espejo** para clientes que no dan acceso directo.
- **Revisión de permisos**: quién puede escribir y qué rutas están protegidas por CODEOWNERS.
- **Alertas de dependencias** con severidad y enlace al aviso.

## Capacidades · fase V3

- **Multi-proveedor** (GitLab, Bitbucket) con el mismo contrato de superficie.
- **Firma de commits** con clave del workspace y verificación visible.
- **Catálogo de plantillas internas** publicadas como repos plantilla.

## Integraciones y datos

GitHub App, webhooks, API de contenidos y checks. Se guardan referencias (`installationId`, `repoId`) y tokens de instalación de corta vida; nunca tokens personales del usuario.

## Límites y no-objetivos

- No clona repositorios completos en el navegador.
- No pide acceso a la cuenta personal del usuario si la organización ya está conectada.
- No permite escribir si la organización solo concedió lectura.
- No sincroniza forks ajenos ni repos archivados sin confirmación.

## Métricas de éxito

- Tiempo desde conectar hasta primer repo habilitado.
- Porcentaje de repos con webhook activo y sincronización al día.
- Revocaciones correctas sin dejar accesos huérfanos.
- Errores de permisos al primer intento de push.

## Dependencias y riesgos

Depende de GitHub y de `01-proyectos`. Riesgo: exceso de permisos; mitigación con App de permisos mínimos, habilitación repo por repo y auditoría de instalación.
