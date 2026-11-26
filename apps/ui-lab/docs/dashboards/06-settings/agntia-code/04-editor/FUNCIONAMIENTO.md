# Editor — funcionamiento

## Flujo principal

1. Se abre el editor con el proyecto y la rama activos; el árbol carga primero y el archivo anterior al final.
2. Si hay un diff pendiente del chat, se abre en modo propuesta con el primer archivo afectado.
3. El usuario recorre hunks, acepta los que quiere y edita el resto en línea.
4. Al guardar, se propone mensaje de commit; si hay varios archivos, se muestra el resumen.
5. El commit se crea en la rama de trabajo y la terminal puede ejecutar el comando de verificación.
6. Si la verificación falla, el editor mantiene los cambios y ofrece volver al hunk problemático.
7. El chat recibe un mensaje de sistema con el commit y el resultado, sin duplicar el hilo.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `workspaceTree` | projectId, commitRef, archivos[], ignorados[], truncado |
| `fileDraft` | id, path, rama, contenido, baseCommit, autorId, actualizadoEn |
| `diffProposal` | id, threadId, archivos[], hunks[], estado, autor |
| `hunk` | id, path, rangoViejo, rangoNuevo, contenido, decisión |
| `commitDraft` | mensaje, archivos[], rama, verificación |

## Estados

Archivo: `sin-cargar` → `cargando` → `listo` | `binario` | `demasiado-grande`. Borrador: `limpio` → `modificado` → `guardado` | `conflicto`. Diff: `propuesto` → `parcial` → `aplicado` | `descartado`. Commit: `borrador` → `creando` → `creado` | `rechazado`.

## Roles y permisos

- `viewer`: lectura de archivos permitidos; sin diffs ocultos.
- `reviewer`: lectura y comentarios; no edita ni guarda.
- `builder`: edita, aplica hunks y crea commits en ramas de trabajo.
- `owner`: además, permite editar rutas protegidas con confirmación adicional.

## Errores, reintentos e idempotencia

- Archivo modificado en remoto: se detecta con `baseCommit` y se ofrece comparar antes de guardar.
- Guardado falla por red: el borrador queda local con reintento manual; no se pierde.
- Commit rechazado por hooks: se muestra el mensaje del hook y el archivo implicado.
- Aplicar dos veces el mismo diff no duplica hunks ya aplicados.

## Rendimiento y límites

- Archivos de hasta 2 MB editables; por encima, solo lectura con aviso.
- El árbol pagina a 500 entradas por carpeta con carga bajo demanda.
- El índice de búsqueda se limita a 50 000 archivos por proyecto.
- Autoguardado cada 2 s con debounce; nunca un guardado por pulsación.

## Móvil y accesibilidad

- Árbol como hoja inferior; el código ocupa el ancho completo con scroll horizontal contenido.
- Diff unificado por defecto, tipografía monoespaciada legible a 12 px mínimo.
- Botones de aceptar/rechazar por hunk con etiqueta, no solo icono.
- Navegación por teclado en escritorio; foco visible en cada hunk.

## Demo actual frente a conectado

El clon muestra `src/app/page.tsx` y dos archivos más con resaltado manual y sin contenido real. Aplicar cambios, guardar o buscar no hacen nada; el formulario de terminal asociado tampoco ejecuta.

## Criterios de aceptación

- Cualquier diff del chat se puede revisar hunk a hunk y aplicar parcialmente.
- Nunca se pierde un borrador por recarga o pérdida de red.
- No es posible commitear en `main` desde el editor.
- El commit creado aparece en Ramas, en la bitácora y en GitHub.
