# Proyectos — funcionamiento

## Flujo principal

1. El usuario abre Proyectos y ve la cartera con buscador y filtros por estado y stack.
2. Elige "Nuevo proyecto" o "Importar desde GitHub".
3. Alta: nombre, stack, plantilla y visibilidad; se valida que el nombre no colisione en el workspace.
4. Importación: se listan repositorios accesibles; al elegir uno se lee su estructura y se propone configuración.
5. Se crea el proyecto en estado `preparando` y se muestra el progreso paso a paso (repo, configuración, primera build).
6. Al terminar, el proyecto pasa a `activo` con preview disponible o a `requiere-atención` con el motivo.
7. Desde la ficha se navega a editor, chats, despliegues o bitácora sin perder el proyecto activo.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `project` | id, tenantId, nombre, slug, descripción, stack[], ownerId, autonomía, estado, visibilidad |
| `projectRepo` | projectId, repoId, ramaPorDefecto, comandoBuild, directorioRaíz |
| `projectHealth` | projectId, estado, motivos[], calculadoEn, fuente |
| `projectSetting` | projectId, clave, valor, quién, cuándo |

`slug` es único por tenant y no cambia tras crearse; si hace falta otro, se crea un alias de dominio.

## Estados

`preparando` → `activo` → `requiere-atención` → `activo`; desde `activo` se puede `archivar` y desde `archivar` `restaurar`. `error` es terminal hasta que el usuario corrige y reintenta. Nunca se pasa a `activo` sin una build correcta o una preview servida.

## Roles y permisos

- `viewer`: ve ficha, estado y preview; no ve configuración ni coste.
- `reviewer`: ve todo menos secretos; puede abrir incidencias.
- `builder`: crea, configura y archiva.
- `owner`: traspasa propiedad, cambia visibilidad y política de autonomía.

## Errores, reintentos e idempotencia

- Nombre duplicado: se sugiere variante, no se crea a medias.
- Repositorio sin permiso de escritura: se permite modo lectura con aviso y se ofrece reconectar la instalación.
- Fallo en la primera build: el proyecto queda en `requiere-atención` con el log y un botón "reintentar" idempotente.
- Archivado accidental: restaurable 30 días; después solo lectura.

## Rendimiento y límites

- La cartera pagina de 24 en 24 y responde en menos de 500 ms con caché.
- La salud se recalcula como máximo cada 5 minutos por proyecto, no en cada visita.
- Un workspace puede tener 200 proyectos activos; por encima, se avisa y se sugiere archivar.
- La detección de stack se limita a 2000 archivos por repositorio.

## Móvil y accesibilidad

- Tarjetas en una columna; filtros en hoja inferior, no en barra lateral.
- El semáforo lleva texto además de color.
- Acciones destructivas nunca en el primer nivel de la tarjeta.
- Navegación completa por teclado y foco devuelto tras cerrar cualquier hoja.

## Demo actual frente a conectado

El clon muestra tres tarjetas estáticas con stack y estado, y el botón de importar lanza un aviso de simulación. No hay repositorios, builds ni previews reales; el proyecto `lorem-app` es solo contexto visual.

## Criterios de aceptación

- Se puede crear un proyecto y verlo en la cartera tras recargar.
- La ficha explica cada estado con su causa y su fuente.
- Archivar y restaurar conservan chats, despliegues y bitácora.
- Ningún dato se muestra como verde si la integración no respondió.
