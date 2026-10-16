# Stage final — UI, LLM humano y ViewSpec dinámico

> STAGE_FINAL_UI_LLM_V1 · 2026-10-05 · Estado: pendiente
> Este documento existe para no perder el hilo entre ventanas de chat.
> Es un stage grande que se hace DESPUÉS de los 800 fixes.

## Contexto

Se hará al final, cuando todos los fixes de los 25 bloques estén aplicados
y el motor esté estable. Toca los bloques 13, 14, 15 y probablemente 24.

## Los 3 objetivos

### 1. LLM habla humano

- Prompt, tono, evitar jerga técnica.
- Traducir todo a lenguaje natural.
- Cero términos internos (capability, kernel, thought, SOP, runtime, turn, etc.).
- Cero markdown decorativo (###, ---, **negrita**).
- Cero relleno tipo "Perfecto", "Genial", "Excelente".
- Mensajes cortos, humanos, con pregunta útil al final.

### 2. ViewSpec dinámico

- Detallar todas las entradas de datos posibles.
- Definir qué vistas corresponden a cada tipo de entrada.
- Servir diferentes UI/UX según el caso.
- Spec de vistas debe responder: dado un intent + un contexto de datos,
  qué vista y qué layout se sirve.

### 3. Componentes UI/UX

- Crear los componentes para cada combinación (caso + entrada + vista).
- Definir la UI/UX que se crea en cada caso.
- No es solo un renderer: es un sistema de decisiones visuales.

## Alcance

- Es un stage de diseño + implementación, no un bloque de fixes.
- Requiere:
  - Un documento de spec de entradas de datos (qué tipos hay, qué forma tienen).
  - Un documento de spec de vistas (qué vista corresponde a cada entrada).
  - Un documento de spec de UI/UX por caso.
  - Implementación de componentes.
  - Tests de las combinaciones.

## Qué no es

- No es un rediseño del motor.
- No es un cambio de arquitectura.
- No es un bloque de los 25. Es un stage posterior, transversal.

## Notas sueltas

- Idea del owner: "el LLM hable humano y en detallar todas las entradas de
  data que puede haber y crear el ViewSpec sirviendo diferentes UI/UX depende
  del caso y a crear los componentes y definir la UI/UX que se crea en cada
  caso, va a ser un stage muy grande".
- Se hace al final de todo.
- La docu obsoleta (menos spec, features, goals y audits) no se usa como
  fuente.

## Documentos obsoletos — política del owner

El owner considera obsoleta toda la documentación antigua, EXCEPTO:
- `docs/audits/**` (los 25 bloques de auditoría).
- Los documentos de spec, features y goals (SPEC.md, FEATURES.md, GOALS.md
  o equivalentes).

Todo lo demás (README, ARCHITECTURE, docs sueltos de diseño, mockups
antiguos) **no se usa como fuente de verdad**.