# Motor de recomendaciones de Formación · diseño funcional y técnico

> **Nota de arquitectura posterior:** este documento es la primera propuesta de ranking determinista. La arquitectura objetivo aprobada conceptualmente es un **SOP cíclico gobernado por Cognition V2 TRUE**, con slow LLM, JEV AI, gate del kernel y template dinámico. Véase [PROPUESTA-SOP-CICLICO-COGNITION-V2-TRUE.md](./PROPUESTA-SOP-CICLICO-COGNITION-V2-TRUE.md). Las puntuaciones aquí son una posible heurística de respaldo editorial, no el motor cognitivo definitivo.

> **Gate obligatorio de nomenclatura:** antes de implementar, leer [AUDITORIA-LEXICON-RECOMENDADOR.md](./AUDITORIA-LEXICON-RECOMENDADOR.md). Los nombres de campos y señales de esta propuesta son conceptuales hasta mapearlos a contratos reales; no crear eventos ni capacidades inexistentes.

**Estado:** especificación para implementación futura, no código desplegado. Vive dentro de Formación de AgntiaPro, con lógica de descubrimiento tipo biblioteca musical y branding propio. No confundir con un algoritmo de maximización de tiempo de pantalla: **optimizar utilidad y aprendizaje demostrado**.

## 1. Objetivo
Recomendar el siguiente microreel más útil para cada persona, usando su **perfil declarado** en la aplicación y señales proporcionadas por el uso de Formación y de AgntiaPro con transparencia, proporcionalidad y controles. Ejemplos: comercial → seguimiento de leads; administrativo → SOP de facturas; owner → detectar cuellos de botella; usuario nuevo → fundamentos. No deducir características sensibles ni inferir desempeño laboral individual para decisiones de RRHH.

## 2. Señales permitidas y procedencia
- **Explícitas:** rol/función, departamento, nivel autoevaluado, objetivos elegidos, intereses, idioma, accesibilidad, tiempo disponible y preferencia de temas. Editables por la persona.
- **Formación:** reproducciones, guardados, temas elegidos, progreso verificado, «útil/no me interesa», saltos voluntarios y búsquedas. Evitar interpretar un skip como incompetencia.
- **Uso del producto:** funcionalidades usadas y conectores disponibles **solo en forma de categorías mínimas necesarias y con información clara**; preferir indicadores agregados o eventos dedicados, no leer mensajes, documentos, calendario, contenido de correos, prompts privados ni historiales sensibles para recomendar.
- **Contexto laboral:** responsabilidades y flujos que el usuario haya declarado expresamente; necesidades formativas asignadas legítimamente por la empresa con separación de permisos.
- **Catálogo:** tema, competencias, prerrequisitos, dificultad, duración, tipo (práctico/conceptual/compliance), apps opcionales, estado de publicación, verificación de contenido, idioma y caducidad.

## 3. Diseño híbrido: reglas primero, ranking después
**Fase 1: elegibilidad determinista**. Solo contenido publicado y vigente; idioma adecuado; permisos de acceso; edad/restricciones cuando procedan; excluir vistos recientemente, bloqueados y duplicados; no exigir OAuth para ver. Las piezas de cumplimiento pertinentes se pueden ofrecer de manera explícita, sin mezclarlas con publicidad.

**Fase 2: candidatos**. Mezcla: onboarding según rol, brechas de habilidades declaradas, continuidad, contenidos relacionados, oportunidades de automatización que la persona haya señalado, exploración de nuevos temas y novedades editoriales verificadas. Garantizar diversidad entre colecciones y no recomendar solo el mismo proveedor.

**Fase 3: ranking interpretable (MVP)**. Para cada candidato elegible, normalizar 0–1:
```text
score = 0.24*roleFit + 0.20*goalFit + 0.17*skillGap
      + 0.14*workflowRelevance + 0.10*prerequisiteFit
      + 0.08*continuity + 0.07*novelty
      - repetitionPenalty - excessiveDifficultyPenalty
```
Pesos **iniciales hipotéticos**, calibrables con evaluación; no son pesos aprendidos ni promesa de eficacia. Las reglas de cumplimiento y seguridad son filtros, no incentivos manipulables. Introducir exploración controlada y límites de repetición. No usar engagement bruto o tiempo de pantalla como objetivo principal.

**Fase 4: composición de estanterías**: «Para tu puesto», «Continúa», «Lo que puedes automatizar», «Aprende a pensar con IA», «Con tus aplicaciones» y «Explora algo nuevo». En cada tarjeta mostrar **«Por qué te lo recomendamos»**: p. ej. «Elegiste mejorar tus reuniones»; no revelar datos privados.

## 4. Arranque sin historial (cold start)
Preguntar opcionalmente: «¿En qué trabajas?», «¿Qué te gustaría mejorar?» y «¿Cuánto tiempo tienes?». Si no responde, ofrecer onboarding general y colecciones editoriales; nunca bloquear Formación. Primeros 3–5 reels diversos; actualizar con feedback explícito. El rol puede cambiarse y no debe convertirse en etiqueta permanente.

## 5. Bucle de aprendizaje
Ver → comprender → practicar → verificar resultado → feedback → actualizar preferencias. Distinguir `watched`, `attempted`, `completed_verified`. Un fallo de integración no significa fracaso pedagógico. El usuario puede guardar, ocultar, reordenar, resetear personalización y ver el catálogo completo sin algoritmo. No utilizar streaks adictivos ni notificaciones insistentes.

## 6. Arquitectura AgntiaPro
- **Frontend UI Lab:** estanterías, explicación de recomendación, filtros, preferencias, feedback y reproductor persistente.
- **Servicio recommendation backend determinista:** candidatos, filtros, ranking versionado, diversidad y recibos de decisión. No delegar el ranking ni la selección de permisos a un LLM.
- **Cognition V2:** LAIA puede interpretar objetivos expresados por el usuario y proponer preferencias estructuradas; **no** puede acceder libremente a datos de empleados ni ejecutar APIs.
- **Kernel/PDP:** identidad, tenant, ámbito personal/empresa, permisos y aislamiento. Event Bus para eventos mínimos auditables. SOPs Zod y runtime solo si el usuario practica una acción real.
- **Composio:** únicamente adaptador de conexión autorizado para ejercicios que lo necesiten; el motor de recomendación no consume tokens ni secretos OAuth.

## 7. Contratos orientativos Zod
```ts
const RecommendationContext = z.strictObject({
  tenantId: z.string(), actorId: z.string(),
  roleTags: z.array(z.string()), goals: z.array(z.string()),
  completedExerciseIds: z.array(z.string()),
  availableCapabilityIds: z.array(z.string()),
  locale: z.string(), personalizationEnabled: z.boolean(),
});
const RecommendationResult = z.strictObject({
  exerciseId: z.string(), score: z.number().finite(),
  reasonCode: z.enum(["role", "goal", "continue", "skill", "explore", "editorial"]),
  algorithmVersion: z.string(),
});
```
Estos contratos son **borradores**, no rutas ni tablas existentes. Los IDs y roles del cliente se verifican en servidor, no se confía en los suministrados por navegador. No persistir razones basadas en contenido privado.

## 8. Privacidad y gobernanza
Informar de la personalización y sus fuentes; permitir desactivarla y borrar preferencias según política de retención. Minimización, separación de tenants, controles de acceso, cifrado, auditoría, revisión de base jurídica RGPD y evaluación de impacto cuando proceda. **No vigilancia laboral encubierta**: no puntuar empleados, no elaborar rankings de productividad individual, no inferir salud, ideología u otros atributos sensibles, ni facilitar a managers trazas personales de visionado sin fundamento y autorización adecuados. Evaluar límites de decisiones automatizadas y obligaciones aplicables del AI Act según el uso real. El progreso para acreditación formativa debe separarse de la recomendación opcional.

## 9. Métricas y pruebas
Métricas: utilidad declarada, práctica verificada, tasa de descubrimiento, diversidad temática, repetición, errores, opt-out y satisfacción. Evaluar equidad por rol sin procesar atributos sensibles innecesarios. Tests: cold start, perfiles con poco historial, cambios de rol, revocación, fuga cross-tenant, contenido retirado, filtros de seguridad, ausencia de datos, feedback negativo, reset, recomendaciones explicables y ausencia de exposición de información personal.

## 10. Roadmap
**M0** taxonomía y metadatos de 180 microcursos (60 documentados originales + 60 IA profesional + 60 AgntiaPro pendientes); **M1** onboarding y reglas editoriales; **M2** ranking determinista y feedback; **M3** contextualización opt-in por eventos mínimos de uso; **M4** evaluación offline, experimentos prudentes y ajustes; **M5** explorar embeddings solo si aportan valor medible y son compatibles con privacidad. Feature flags y despliegue gradual; no implementar ni publicar sin campaña aprobada.
