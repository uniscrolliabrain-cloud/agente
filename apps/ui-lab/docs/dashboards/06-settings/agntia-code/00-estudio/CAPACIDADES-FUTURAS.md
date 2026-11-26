# Estudio de código — capacidades futuras

Superficie `estudio`. Propuesta de producto, no implementación. El clon solo dibuja el prompt y las métricas.

## Propósito

Convertir una intención en lenguaje natural ("quiero que los clientes puedan pagar con Stripe") en un plan revisable: alcance, archivos afectados, dependencias, riesgos y primer parche. El Estudio es el lugar donde se decide **qué** se va a construir antes de tocar código; el resto de superficies ejecutan y publican.

## Modelo de trabajo

- **Intención** → **plan** → **borrador de cambio** → **revisión** → **PR** → **preview** → **producción**.
- Cada paso deja artefacto: intención escrita, plan con tareas, diff, revisión, despliegue.
- Nada se ejecuta por defecto: el nivel de autonomía lo fija el proyecto en `03-agente`.
- El Estudio nunca publica; como mucho abre un borrador y una preview.

## Capacidades · fase V1 (núcleo utilizable)

| Capacidad | Qué hace | Regla de producto |
|---|---|---|
| Captura de intención | Caja de prompt con proyecto, rama y modelo visibles; acepta texto, captura de pantalla, enlace y archivo. | Si no hay proyecto seleccionado, el botón queda deshabilitado con explicación, no con error silencioso. |
| Contexto explícito | Muestra qué se enviará al modelo: archivos, esquema de datos, variables de entorno por nombre, historial reciente. | El usuario puede quitar cualquier pieza antes de construir. |
| Plan antes de código | Genera 3-7 tareas con archivos candidatos, dependencias y estimación de coste en créditos. | Editable; si una tarea toca producción, se marca en rojo y exige aprobación. |
| Detección de ambigüedad | Pregunta solo lo que bloquea (stack, autenticación, datos existentes) y ofrece valores por defecto. | Máximo tres preguntas por ronda; nunca un cuestionario. |
| Arranque de proyecto | Desde cero: plantilla, nombre, stack, base de datos, dominio provisional. | Crea recursos en modo preview; producción requiere paso aparte. |
| Continuidad | "Seguir donde lo dejé": últimos hilos, ramas abiertas, PRs pendientes, previews vivas. | Ordenado por relevancia real (actividad + bloqueos), no por fecha decorativa. |
| Métricas honestas | Proyectos activos, despliegues de hoy, cobertura, coste del mes. | Cada cifra declara su fuente y su ventana temporal; sin datos, muestra "—". |
| Atajos | Nueva conversación, importar repositorio, ver preview, abrir bitácora. | Cada atajo lleva a una pantalla existente, no a un placeholder. |

## Capacidades · fase V2 (equipo y control)

- **Plantillas de intención** por tipo de trabajo (nueva pantalla, integración de pago, migración de datos, corrección de bug) con campos guiados.
- **Comparador de enfoques**: dos planes alternativos con coste, riesgo y tiempo estimado; se elige uno y el otro queda archivado.
- **Presupuesto por proyecto**: límite mensual de créditos, aviso al 80 % y bloqueo configurable.
- **Contexto compartido**: enlazar una idea de Tu Empresa o un documento de la app para que el plan herede objetivos y tono.
- **Estimación de impacto**: qué usuarios y rutas se ven afectados, si hay migración de datos, si rompe compatibilidad.
- **Modo cliente**: el `viewer` ve el plan en lenguaje no técnico, sin diffs ni nombres de archivo.

## Capacidades · fase V3 (plataforma)

- **Agentes de arranque** especializados por vertical (SaaS, comercio, contenido) que precargan convenciones.
- **Doble plan**: un plan "seguro" (mínimo cambio) y uno "ambicioso", con la diferencia de riesgo explicada.
- **Histórico de decisiones**: por qué se eligió un enfoque, enlazado a la bitácora.
- **Importación desde otro proyecto**: reutilizar un módulo ya construido con su batería de pruebas.

## Integraciones y datos

- **GitHub**: lectura de repositorios, ramas y issues para enriquecer el contexto.
- **Vercel / Cloudflare**: estado de la preview y del último despliegue del proyecto.
- **Datos**: esquema D1 y migraciones pendientes, solo estructura, nunca filas completas.
- **Modelo**: proveedor y modelo por defecto configurables; el coste se estima antes de ejecutar.

## Límites y no-objetivos

- No es un buscador de código ni un chat generalista: su salida siempre es un plan o un cambio propuesto.
- No decide por el usuario en materias irreversibles (borrado de datos, cambio de dominio, rotación de secretos).
- No promete "app lista en un clic": el Estudio prepara el trabajo, no lo termina.
- No muestra cifras de negocio inventadas como si fueran reales.

## Métricas de éxito

- Porcentaje de intenciones que llegan a plan aprobado sin preguntas adicionales.
- Tiempo medio de intención a primer diff.
- Porcentaje de planes que se ejecutan sin retrabajo por contexto insuficiente.
- Coste medio por plan y desviación frente a la estimación.

## Dependencias y riesgos

Depende de `03-agente` (autonomía), `06-repositorios` (acceso real) y `13-entornos` (secretos). Riesgo principal: prometer demasiado y generar planes irreales; mitigación con estimaciones conservadoras, marcas de incertidumbre y revisión humana obligatoria en cambios de producción.
