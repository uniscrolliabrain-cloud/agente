# Academia — capacidades futuras

Superficie `academia`. Propuesta; el clon lista lecciones con progreso inventado.

## Propósito

Que una persona sin perfil técnico pueda entender y dirigir su propio software: qué es una rama, por qué importa un test, cómo se publica sin romper nada. La Academia enseña **con el proyecto del usuario**, no con ejemplos ajenos.

## Modelo de trabajo

Rutas cortas de 10-20 minutos, cada lección con un objetivo, una explicación breve, un ejercicio en sandbox y una comprobación. El progreso se guarda por persona y por proyecto; el agente puede sugerir una lección cuando detecta una carencia (por ejemplo, tras un deploy fallido por variables).

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Rutas por objetivo | "Publica tu primer cambio", "Entiende tus datos", "Revisa código con criterio". | Cada ruta declara requisitos y duración. |
| Lecciones cortas | Texto, ejemplo real del proyecto y ejercicio en sandbox. | El ejercicio nunca toca producción. |
| Comprobación | Verifica el resultado del ejercicio, no solo la lectura. | Se puede repetir sin penalización. |
| Progreso | Por persona, por proyecto, con reanudación. | Visible solo para el usuario y su equipo. |
| Sugerencias contextuales | Propone una lección desde un bloqueo real. | Se puede descartar y no vuelve a insistir en la misma sesión. |
| Glosario | Términos del producto enlazados desde la interfaz. | Definiciones breves, sin jerga innecesaria. |

## Capacidades · fase V2

- **Rutas por rol**: cliente que revisa, builder que publica, owner que gobierna.
- **Ejercicios sobre una copia del proyecto** con estado inicial restaurable.
- **Certificación interna** con examen práctico y registro en el perfil.
- **Biblioteca de patrones** con ejemplos aplicables al stack del proyecto.
- **Sesiones en vivo** con material descargable.

## Capacidades · fase V3

- **Tutor adaptativo** que ajusta el ritmo según errores.
- **Comunidad moderada** con recetas revisadas.
- **Traducción** de rutas al idioma del workspace.

## Integraciones y datos

Sandbox para ejercicios, editor para ejemplos, proyectos del tenant para contexto y bitácora para registrar hitos. El progreso se guarda por usuario; nunca se comparte con clientes sin permiso.

## Límites y no-objetivos

- No sustituye formación reglada ni certifica competencia profesional.
- No usa datos reales del cliente en ejercicios.
- No bloquea el producto por no completar una ruta.
- No promete que aprender aquí garantice buen software.

## Métricas de éxito

- Finalización de rutas y tiempo hasta el primer ejercicio resuelto.
- Reducción de errores repetidos tras la lección correspondiente.
- Sugerencias aceptadas frente a descartadas.
- Satisfacción declarada al final de cada ruta.

## Dependencias y riesgos

Depende de `04-editor`, `05-terminal` y `12-datos`. Riesgo: contenido genérico que no encaja con el proyecto; mitigación con ejercicios anclados al stack real y revisión editorial continua.
