# Datos — capacidades futuras

Superficie `datos`. Propuesta; el SQL del clon no se ejecuta.

## Propósito

Dar acceso seguro y comprensible a la base de datos: entender el esquema, consultar sin miedo, cambiar estructura con migraciones versionadas y saber qué datos personales hay. Es la superficie más peligrosa del producto y debe parecerlo.

## Modelo de trabajo

Solo lectura por defecto. La escritura de esquema pasa por migraciones revisables; la escritura de filas pasa por consultas con confirmación y límite de filas. Producción nunca se consulta desde el navegador: el servidor ejecuta con permisos acotados y devuelve resultados paginados.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Explorador de esquema | Tablas, columnas, tipos, índices y claves foráneas. | Marca tablas con datos personales declarados. |
| Consulta de lectura | Editor SQL con ejecución limitada y resultados paginados. | Solo `SELECT`; límite de 100 filas y tiempo de 5 s. |
| Historial de consultas | Guarda consultas ejecutadas con autor y duración. | Las consultas con datos personales se redactan al guardar. |
| Migraciones | Propuesta de cambio con SQL generado y vista previa del plan. | Aplicar en producción exige aprobación y copia de seguridad. |
| Datos de ejemplo | Semilla reproducible para preview. | Nunca se copian datos reales a preview. |
| Exportar | Descarga CSV/JSON de un resultado. | Requiere motivo y queda auditado. |

## Capacidades · fase V2

- **Asistente de consulta** en lenguaje natural con SQL visible y editable.
- **Detección de consultas costosas** con sugerencia de índice.
- **Backups** programados con restauración verificada.
- **Retención y borrado** por tabla con política declarada.
- **Enmascarado** de columnas sensibles por rol.

## Capacidades · fase V3

- **Versionado de datos** con puntos de restauración lógicos.
- **Branching de base de datos** para probar migraciones sin tocar producción.
- **Catálogo de datos** con propietario, descripción y sensibilidad por tabla.

## Integraciones y datos

D1 como motor principal, migraciones del repositorio, secretos para credenciales de solo lectura y observabilidad para consultas lentas. Los resultados no se cachean en el navegador más allá de la sesión.

## Límites y no-objetivos

- No se ejecuta SQL arbitrario en producción desde el cliente.
- No se permite `DROP`, `TRUNCATE` ni `UPDATE` masivo desde la consola.
- No se exportan datos personales sin motivo y auditoría.
- No se muestran credenciales ni cadenas de conexión completas.

## Métricas de éxito

- Consultas bloqueadas por política y motivos.
- Migraciones fallidas y tiempo de restauración.
- Tablas sin propietario o sin política de retención.
- Consultas lentas por encima de umbral y su resolución.

## Dependencias y riesgos

Depende de `10-infraestructura` y `13-entornos`. Riesgo: fuga o borrado de datos; mitigación con solo lectura, límites duros en servidor, migraciones aprobadas y backups verificados.
