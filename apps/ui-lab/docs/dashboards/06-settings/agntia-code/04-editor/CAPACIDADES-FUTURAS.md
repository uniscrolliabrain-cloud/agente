# Editor — capacidades futuras

Superficie `editor`. Propuesta de producto; el código mostrado en el clon es decorativo.

## Propósito

Que el usuario pueda **ver, entender y corregir** los cambios sin salir de Agntia Code. No pretende sustituir a VS Code en trabajo intensivo, sino cubrir el bucle corto: leer el diff, ajustar una línea, guardar en la rama y volver al chat.

## Modelo de trabajo

Tres modos sobre el mismo archivo: **lectura** (solo ver), **propuesta** (diff del agente pendiente de aplicar) y **edición** (cambios del usuario). El editor siempre sabe en qué rama está y si hay cambios sin commitear; nunca escribe en la rama por defecto sin crear una rama de trabajo.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Árbol del proyecto | Archivos y carpetas con estado (modificado, nuevo, ignorado) y filtro. | Carga progresiva; nunca bloquea la vista mientras llega el resto. |
| Pestañas | Abre varios archivos, conserva posición y modo. | Cerrar una pestaña con cambios pide confirmación. |
| Diff en línea | Cambios del agente por hunks con aceptar, rechazar y editar. | Aceptar un hunk no aplica el resto sin confirmación. |
| Edición básica | Escribir, borrar, deshacer y buscar dentro del archivo. | Los cambios se autoguardan como borrador local, no como commit. |
| Resaltado y plegado | Sintaxis por lenguaje y plegado de bloques. | Si el lenguaje no se reconoce, se muestra texto plano sin romper. |
| Navegación a símbolo | Ir a definición dentro del archivo y buscar en el proyecto. | Sin índice disponible, la búsqueda se limita a texto. |
| Guardar en rama | Crea commit con mensaje propuesto y editable. | Commit vacío bloqueado; mensaje obligatorio. |

## Capacidades · fase V2

- **Edición multiarchivo** con refactor asistido y vista previa de impacto.
- **Acciones en línea**: explicar selección, añadir test, extraer función, traducir comentarios.
- **Comparador de ramas** con diff entre dos referencias y filtro por autor.
- **Conflicto guiado** con marcadores y resolución asistida paso a paso.
- **Comentarios anclados** a línea que viajan al PR.

## Capacidades · fase V3

- **Edición colaborativa** con presencia y cursores, sin escritura simultánea conflictiva.
- **Terminal integrada contextual** que abre en el directorio del archivo activo.
- **Historia visual** del archivo con reproducción de cambios por commit.

## Integraciones y datos

GitHub para contenido y commits; terminal para comandos; pruebas para ejecutar el archivo; el índice de símbolos se construye en servidor y se cachea por commit.

## Límites y no-objetivos

- No ejecuta código en el navegador del usuario.
- No edita archivos ignorados ni binarios; los muestra en solo lectura con aviso.
- No permite escribir en `main` directamente: siempre rama de trabajo.
- No es un IDE completo: sin depuración, sin extensiones de terceros.

## Métricas de éxito

- Tiempo entre abrir un diff y aplicar el primer hunk.
- Porcentaje de cambios del agente aceptados sin edición manual.
- Errores de guardado o pérdida de borrador (objetivo: cero).
- Uso del editor frente a saltar a GitHub para cambios pequeños.

## Dependencias y riesgos

Depende de `06-repositorios` y `03-agente`. Riesgo: prometer paridad con un IDE de escritorio; mitigación con alcance explícito y mensaje claro de "para trabajo profundo, clona el repo".
