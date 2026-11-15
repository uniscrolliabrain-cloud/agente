# UX SVG, animación conversacional y caminos de acciones empresariales
**Objetivo:** una LAIA comprensible y cálida, sin que la UI sea un depurador de DAGs. **Estado:** especificación, no implementación.

## 1. Decisión del fundador: representación humana ≠ secuencia exacta del runtime
Se acordó que LAIA puede mostrar una animación SVG de puntos claros, compacta, en espiral, y **un camino de pasos que orienta al cliente sobre lo que está haciendo**. Los pasos no necesitan corresponder uno a uno, ni durar lo mismo, ni aparecer en el mismo orden técnico que cada micro-operación del runtime. Su función es educativa, de orientación y reducción de incertidumbre. Una representación conceptual no debe afirmar falsamente que un efecto externo ha sucedido.

**Dos contratos distintos:**
- **VisualNarrative:** cinco frases/etapas orientativas, generadas o elegidas por UI, sin `taskId` obligatorio. Su tiempo es de animación, no de ejecución.
- **OperationalProjection:** hitos reales verificados, con `taskId`, `eventId`, `receipt`, status y timestamps. La interfaz los puede agrupar bajo una frase humana, pero no inventar hechos.

## 2. Taxonomía de la experiencia
| Nivel | Ejemplo | Evidencia necesaria | Puede ser ilustrativo |
|---|---|---|---|
| Microanimación | espiral de puntos girando | estado local `thinking` | Sí |
| Fases educativas | “Comprendiendo tu solicitud” | no representa ejecución | Sí |
| Narrativa de proceso | “Preparando el análisis” | solicitud aceptada si se expresa como operación real | Sí, con copy cuidadoso |
| Hito de tarea | “La auditoría está en cola” | task/event confirmado | No |
| Hito de aprobación | “Necesito tu autorización” | approval real | No |
| Efecto externo | “Escaneo iniciado” | receipt/estado de ejecución | No |
| Resultado | “Informe disponible” | artefacto y verificación | No |

## 3. Las cinco fases pedagógicas
Copy inicial acordado en el anexo anterior, **ajustable al contexto**:
1. Comprendiendo tu solicitud.
2. Identificando qué necesitas.
3. Preparando el trabajo.
4. Coordinando la operación.
5. Organizando la respuesta.

No obligar a mostrar las cinco si la respuesta llega antes. No imponer “2 segundos cada una”: se mencionó como ejemplo improvisado. Los intervalos 600–1000 ms y fundidos 150–250 ms de documentación previa son hipótesis de prototipado, **no estándares**. La animación jamás retiene el primer token o primer audio. En saludos o charla informal, mostrar solo espiral o copy conversacional, no fingir una operación empresarial.

## 4. Un camino visible para el cliente
Ejemplo de acción “Revisar la seguridad de mi empresa”:
```text
[Solicitud recibida] ─ [Preparación] ─ [Revisión] ─ [Resultados] ─ [Siguiente decisión]
        ●                  ◌               ◌             ◌                  ◌
```
Esta es la **narrativa comprensible**, no un contrato de que el runtime tenga cinco pasos. Puede haber 17 tareas internas, reintentos, 3 workers y 2 herramientas. Si el kernel aún no aceptó la tarea, no marcar “Solicitud recibida” como operativamente aceptada; mostrar “Preparando solicitud” como estado local. La narrativa puede agrupar eventos reales y fases educativas, siempre con semántica clara.

### Estados operativos y visuales
- `not_requested`: sin tarea; animación conversacional opcional.
- `submitting`: intento local de enviar petición.
- `accepted`: ACK persistido; se puede afirmar “recibida”.
- `queued`: en cola; no afirmar “ejecutando”.
- `running`: trabajo real confirmado; narrar fase comprensible.
- `awaiting_approval`: detenido hasta autorización; mostrar botón real y alcance.
- `verifying`: comprobación real de evidencia, si existe.
- `completed`: outcome verificado.
- `partial`: resultado parcial con pendientes explícitos.
- `failed`: error.
- `outcome_unknown`: resultado externo incierto; no mostrar éxito.
- `cancelled`: cancelación confirmada, distinta de cerrar chat.

**Regla de oro:** la animación y el “camino pedagógico” son libres; la insignia de estado, el resultado y el botón de aprobación deben ser veraces.

## 5. Gramática visual
- SVG inline pequeño (16–32 px para indicador; responsive para timeline).
- Espiral **cerradita** de puntos claros, estética moderna, fondo blanco o transparente.
- Rotación continua y pulso de opacidad; no oscurecer el conjunto.
- `prefers-reduced-motion`: indicador estático, información textual equivalente.
- `aria-live` para hitos operativos importantes; no anunciar cada frase de animación.
- Para tareas largas, timeline con pasos completados, paso actual y próximos, sin porcentajes inventados.
- En móvil, vista compacta expandible; en desktop, timeline junto al chat o tarjeta de tarea.
- Anam: sincronizar indicador con listening/speaking, no hacer que el avatar recite cada fase decorativa.
- Barge-in: detiene audio/animación conversacional; la tarea empresarial persiste salvo cancelación explícita autorizada.

## 6. Modelo de proyección propuesto
```ts
interface NarrativeStage {
  key: string; label: string; kind: 'illustrative' | 'grounded';
  sourceEventIds?: string[];  // obligatorio para afirmaciones operativas
}
interface ClientActionJourney {
  taskId?: string;
  narrativeTemplateId: string;
  stages: NarrativeStage[];
  operationalStatus?: 'accepted'|'queued'|'running'|'awaiting_approval'|
    'verifying'|'completed'|'partial'|'failed'|'outcome_unknown'|'cancelled';
  lastVerifiedEventId?: string;
  updatedAt?: string;
}
```
No es esquema existente; versionar y validar con Zod antes de implementarlo. Un template puede decir “Analizamos la situación” como descripción general, pero no “Hemos auditado 26 activos” sin receipt real.

## 7. Mapeo entre realidad y narrativa
- Muchos eventos técnicos → un paso humano.
- Un paso humano → varios estados operativos posibles.
- No hay equivalencia 1:1 obligatoria.
- El frontend nunca deduce `completed` de que terminó la quinta frase.
- Si la tarea se bloquea en aprobación, el camino muestra claramente la espera y deja de avanzar.
- Si el resultado es parcial, no se rellena visualmente como completado.
- Reconnect/SSE replay reconstruye los hitos reales desde cursor; el ciclo pedagógico puede reiniciarse sin alterar task.
- Si una etapa es solo ilustrativa, evitar que su diseño sugiera un comprobante técnico.

## 8. Ejemplos de copy permitidos y no permitidos
| Situación | Copy válido | Copy inválido |
|---|---|---|
| Animación local | “Preparando la respuesta” | “Auditoría completada” |
| Intent no aceptado | “Estoy preparando tu solicitud” | “Ya está ejecutándose” |
| En cola | “La revisión está pendiente de empezar” | “Estoy escaneando” |
| Espera aprobación | “Necesito tu autorización para continuar” | “Ya he aprobado por ti” |
| Resultado parcial | “He obtenido parte del informe; falta verificar X” | “Todo terminado” |
| Outcome desconocido | “No puedo confirmar si se completó la operación” | “Operación realizada” |

## 9. Criterios de aceptación
1. Animación inmediata y sin bloqueo de stream.
2. Copy educativo desacoplado de eventos del runtime.
3. Eventos verificados controlan únicamente hitos y resultados factuales.
4. No retrasar la respuesta para completar cinco fases.
5. No cancelar tareas por barge-in o cierre de sesión.
6. Tenant A no recibe journey de B.
7. Reconnect y eventos fuera de orden no generan progresión falsa.
8. Accesibilidad móvil y reduce motion.
9. Las métricas separan tiempo hasta primer token/audio y duración de animación.
10. Se puede ver la trazabilidad técnica bajo demanda, sin imponerla al usuario.
