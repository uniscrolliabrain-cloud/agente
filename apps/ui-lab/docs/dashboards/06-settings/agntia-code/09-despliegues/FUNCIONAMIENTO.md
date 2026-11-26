# Despliegues — funcionamiento

## Flujo principal

1. Al abrir la PR, se lanza una preview y su estado se refleja en el pipeline.
2. El usuario revisa la preview; si algo falla, ve el log de build y el error concreto.
3. Con checks en verde, "Promover a producción" se habilita solo si la política lo permite.
4. Al confirmar, se crea un despliegue inmutable y se sigue su progreso etapa por etapa.
5. Al terminar, se muestra la URL servida, el commit y el tiempo total.
6. Si hay incidente, "Revertir" despliega el artefacto anterior y deja constancia del motivo.
7. Cada despliegue escribe una entrada en la bitácora y actualiza el estado del proyecto.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `deployment` | id, projectId, entorno, commit, artefacto, autor, inicio, fin, estado |
| `pipelineStage` | deploymentId, nombre, estado, duración, logRef |
| `preview` | id, prId, url, creadaEn, expiraEn, estado |
| `promotion` | deploymentId, aprobadaPor, política, solicitadaEn |
| `rollback` | deploymentId, targetDeploymentId, motivo, autor, fecha |

## Estados

Despliegue: `en-cola` → `construyendo` → `desplegando` → `servido` | `fallido` | `cancelado` | `superado`. Preview: `creando` → `lista` → `expirada`. Promoción: `bloqueada` → `solicitada` → `aprobada` → `ejecutada`.

## Roles y permisos

- `viewer`: ve previews y estado, no logs internos.
- `reviewer`: ve logs y puede bloquear un despliegue.
- `builder`: despliega a preview y solicita producción.
- `owner`: aprueba producción, levanta congelaciones y programa ventanas.

## Errores, reintentos e idempotencia

- Build fallido: se conserva el log y se permite reintentar sin crear un despliegue nuevo duplicado.
- Promoción con checks caducados: se reejecutan antes de continuar.
- Timeout del proveedor: el despliegue queda `desconocido` y se reconcilia antes de reintentar.
- Revertir dos veces el mismo incidente no encadena reversiones: la segunda se rechaza con explicación.

## Rendimiento y límites

- Preview objetivo en menos de 90 s desde el push.
- Producción objetivo en menos de 5 min; se muestra progreso con etapa actual.
- Un proyecto admite 20 previews simultáneas; las antiguas se archivan.
- Retención de logs: 30 días en base, ampliable por plan.

## Móvil y accesibilidad

- Pipeline vertical en móvil, con etapa actual destacada y texto de estado.
- Promover exige confirmación y muestra el commit exacto.
- Logs con búsqueda y copia; nunca solo desplazamiento horizontal.
- Estados anunciados también por texto para lectores de pantalla.

## Demo actual frente a conectado

El clon muestra etapas, historial y botón "Promover a producción", que responde con un aviso de simulación. No hay build, ni preview servida, ni commit real detrás.

## Criterios de aceptación

- No se puede promover sin checks verdes y política cumplida.
- Cada despliegue servido indica commit y artefacto exactos.
- Revertir deja la versión anterior sirviendo y la actual marcada como superada.
- Las previews expiran con aviso y sin romper enlaces de revisión guardados.
