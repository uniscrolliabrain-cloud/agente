# Agente de código — capacidades futuras

Superficie `agente`. Propuesta de producto; el clon solo dibuja controles.

## Propósito

Hacer explícito **cuánto puede hacer el agente por su cuenta** y **con qué límites**. Sin esta superficie, la autonomía queda escondida en prompts y el usuario no puede auditar por qué ocurrió algo.

## Modelo de trabajo

Cuatro niveles de autonomía por proyecto:

1. **Sugerir**: solo texto y planes, nunca toca archivos.
2. **Parchear**: escribe en la rama de trabajo, sin commit; el usuario revisa.
3. **Abrir PR**: crea rama, commit y pull request; no fusiona.
4. **Publicar**: fusiona y despliega a preview; producción siempre requiere aprobación humana.

El nivel se hereda del workspace y puede bajarse por proyecto, nunca subirse sin `owner`.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Selector de autonomía | Cambia el nivel con explicación de consecuencias. | Subir a "Publicar" exige confirmación escrita y queda auditado. |
| Skills | Activa capacidades concretas: tests, migraciones, accesibilidad, rendimiento. | Una skill declara comandos, permisos y límites antes de activarse. |
| Guardarraíles | Lista de rutas y operaciones prohibidas (secretos, producción, borrados). | Se aplican en servidor; la interfaz no es la única defensa. |
| Sandbox | Entorno aislado con red restringida y sin credenciales de producción. | Sin sandbox disponible, el agente cae a "Sugerir". |
| Memoria | Convenciones del proyecto y decisiones previas que el agente debe respetar. | La memoria es editable y muestra su origen; nunca se inventa. |
| Evaluación | Batería de casos que comprueba si una skill sigue funcionando. | Cambiar el modelo obliga a reevaluar antes de subir autonomía. |
| Aprobaciones | Bandeja de acciones pendientes con diff y riesgo. | Aprobaciones caducan y no se pueden delegar en bloque. |

## Capacidades · fase V2

- **Presupuesto de ejecución**: minutos de cómputo, llamadas a herramientas y créditos por tarea.
- **Reglas por ruta**: `src/pagos/**` exige revisor humano; `docs/**` puede ir directo a PR.
- **Doble control** para migraciones destructivas con confirmación de dos personas.
- **Replay** de una ejecución paso a paso, incluidos comandos y salidas.
- **Skills de terceros** firmadas, con permisos declarados y revisión previa.

## Capacidades · fase V3

- **Enjambre supervisado** con roles y un plan común, sin escritura concurrente en el mismo archivo.
- **Autonomía adaptativa**: el sistema propone bajarla si aumentan fallos o retrabajo.
- **Certificación interna** de skills por proyecto con histórico de incidentes.

## Integraciones y datos

Sandbox de ejecución, GitHub (ramas/commits/PR), terminal, pruebas, observabilidad y bóveda de secretos. La configuración de autonomía se guarda con versión y autor para poder reconstruir por qué el agente hizo algo.

## Límites y no-objetivos

- No hay autonomía total sin supervisión: producción siempre tiene puerta humana.
- El agente no puede leer secretos completos ni exfiltrarlos; solo recibe los que la ejecución necesita.
- No se permite ejecutar código arbitrario fuera del sandbox ni abrir red a dominios no permitidos.
- No se promete que una skill sea segura por estar firmada: sigue sujeta a permisos y auditoría.

## Métricas de éxito

- Porcentaje de acciones ejecutadas sin aprobación que no generaron incidente.
- Retrabajo por cambio de autonomía mal calibrada.
- Tiempo de revisión por PR generado.
- Incidentes con causa en una skill y tiempo de desactivación.

## Dependencias y riesgos

Depende de `05-terminal` (sandbox), `08-revisiones` (puerta humana) y `13-entornos` (secretos). Riesgo principal: autonomía excesiva con contexto pobre; mitigación con evaluación obligatoria, límites por ruta y presupuesto.
