# UI Animations V1 - El sistema se siente vivo

> **UI_ANIMATIONS_V1**
>
> Principios y snippets para que el OS se sienta vivo. No es cosmetica: es
> como el usuario percibe que el sistema trabaja para el.

---

## Por que importa

Cuando el texto aparece letra a letra, el usuario **ve el pensamiento**. No es
un output que ya estaba ahi. Es un **proceso en curso**. Eso cambia la relacion
con el sistema.

En ChatGPT funciona porque el LLM tarda 3-15 segundos en generar. Ese tiempo,
sin feedback, es angustia. Con typewriter, es presencia.

En este OS pasa lo mismo, mas fuerte: hay fast LLM, slow LLM, tareas durables,
agentes trabajando en paralelo. El typewriter es la ventana a ese trabajo.

---

## Frontera backend/frontend

**El backend no sabe que existe una animacion.**
**El frontend no decide que se muestra.**

| Cosa | Backend | Frontend |
|---|---|---|
| Typewriter | emite stream | buffer de render |
| Cascada de listas | - | aplica |
| Cuando aparece el panel | - | decide |
| Que contiene el panel | genera spec | - |
| Que se anima al llegar | - | aplica |
| KPIs: valores | calcula | - |
| KPIs: contador animado | - | aplica |
| Estado "trabajando": saberlo | expone | - |
| Estado "trabajando": pintarlo | - | aplica |
| prefers-reduced-motion | - | respeta |

---

## Los 8 principios

### 1. Todo aparece, nada se presenta de golpe

Ningun cambio de estado se muestra sin transicion. Cero "pop instantaneo". Ni
siquiera un badge numerico.

### 2. El typewriter refleja el stream real, no lo finge

No hay una animacion separada del LLM. El typewriter **es** el stream. Si el
LLM tarda 8 segundos, el texto sale a lo largo de 8 segundos. Nunca al reves.

### 3. Las animaciones son cortas pero visibles

- Micro (botones, badges): 80-150ms.
- Medias (bloques, panel): 200-300ms.
- Largas (cascadas, contadores): 400-800ms.
- Nunca mas de 1s.

### 4. Las animaciones nunca bloquean

El usuario puede hacer click mientras algo se anima. Excepto el input del chat
mientras el fast LLM responde (que es una limitacion real del sistema).

### 5. Nada se mueve mas de 200px

Un panel que entra desde la derecha se mueve los 340px del panel. Un bloque
dentro del chat se mueve 8-16px. Nada vuela por la pantalla.

### 6. Easing consistente

Un solo easing para casi todo: `cubic-bezier(0.16, 1, 0.3, 1)`. Sensacion:
rapido al principio, suave al final. Es el que usan Vercel, Linear, y todos los
productos que se sienten modernos.

Para pulsos y loops: `ease-in-out`.

### 7. Los loops respiran

Si algo esta "trabajando", el pulso es de 1.5-2s. Nunca mas rapido (parece
urgente) ni mas lento (parece muerto).

### 8. `prefers-reduced-motion` es obligatorio

Si el sistema del usuario lo tiene activado, todas las animaciones se reducen
al minimo. Solo opacidad, sin transformaciones ni typewriter.

---

## Typewriter en el chat

**Objetivo:** el texto del fast LLM aparece letra a letra, respetando el stream
real.

**No hay libreria.** El stream ya llega por chunks. Solo hay que colar los
caracteres.

### Snippet: `useTypewriter`

```ts
import { useEffect, useRef, useState } from "react";

export function useTypewriter() {
  const [displayed, setDisplayed] = useState("");
  const queueRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const push = (delta: string) => {
    queueRef.current.push(...delta.split(""));
  };

  const reset = () => {
    queueRef.current = [];
    setDisplayed("");
  };

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        const next = queueRef.current.splice(0, 2).join("");
        setDisplayed((prev) => prev + next);
      }
    }, 30);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { displayed, push, reset };
}
```

**Ritmo:** 2 caracteres cada 30ms = 66 chars/segundo. Se siente natural.

### Cursor parpadeante

```css
.stream-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

## Cascada en listas

**Objetivo:** un grupo de elementos aparece uno detras de otro con un pequeno
delay entre cada uno.

### Que es y que no es

- **No es** "todos a la vez con fade-in" - eso es un fade.
- **No es** "cada uno con animacion distinta" - eso es caos.
- **Si es** "el mismo fade-slide, con delay progresivo".

### Donde va

- Mensajes de un turno del chat.
- Filas de una tabla del panel contextual.
- Items del inbox.
- Cards del board.
- Chips de sugerencia.
- KPIs del dashboard.
- Pasos de un plan.

### Donde NO va

- Chrome (navegacion, toolbar).
- Notificaciones puntuales.
- Cambios de estado de un solo elemento.
- Mensajes que llegan por stream.

### Snippet CSS

```css
.cascade-item {
  animation: fade-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(min(var(--i, 0), 8) * 70ms);
}
@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

El `min(var(--i), 8)` capa el delay a partir del item 8. Con 20 items, el
ultimo aparece a 560ms, no a 1400ms.

### Snippet React: `useCascade`

```ts
import { useEffect, useRef } from "react";

export function useCascade(): { className: string } {
  const seenRef = useRef(false);
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      seenRef.current = true;
    }
  }, []);

  return { className: seenRef.current ? "cascade-item" : "" };
}
```

### Uso

```tsx
function TaskList({ tasks }: { tasks: Task[] }) {
  const { className } = useCascade();
  return (
    <div>
      {tasks.map((task, i) => (
        <div
          key={task.id}
          className={className}
          style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
        >
          <TaskRow task={task} />
        </div>
      ))}
    </div>
  );
}
```

### Ritmos por contexto

| Contexto | Delay | Duracion |
|---|---|---|
| Mensajes del chat | (llegan del stream) | 200ms |
| Tool calls dentro de un mensaje | 100ms | 250ms |
| Filas de tabla | 40ms | 200ms |
| Items del inbox | 80ms | 250ms |
| Cards del board | 60ms | 250ms |
| Chips de sugerencia | 90ms | 300ms |
| KPIs del dashboard | 120ms | 400ms |

**Regla:** a mas items, menos delay. A menos items, mas delay.

**Regla:** `duracion / delay >= 3` para que haya solapamiento organico.

---

## Slide-in del panel contextual

```css
.panel-slide-in {
  animation: panel-slide-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes panel-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

El panel entra desde la derecha con fade simultaneo.

---

## Contadores de KPIs

```tsx
import { useEffect, useState } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 500;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{displayed.toLocaleString()}</>;
}
```

El numero cuenta de 0 al valor en 500ms con easing ease-out. Comunica "el
sistema esta midiendo ahora mismo".

---

## Pulso de "trabajando"

```css
.pulse {
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

1.8s por ciclo. Ni mas rapido (parece urgente) ni mas lento (parece muerto).

---

## Chips de procedencia

Los chips (`auto`, `alta`, `media`, `sugerido`, `tu`) aparecen con un pop:

```css
.chip-pop-in {
  animation: chip-pop-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes chip-pop-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Transiciones de estado

Cuando un badge cambia de estado (`queued` -> `running` -> `succeeded`), **no**
aparece uno nuevo encima del viejo. Se transforma:

```css
.status-badge {
  transition: background-color 200ms ease-out, color 200ms ease-out;
}
```

Para el check animado:

```css
.check-animate {
  animation: check-pop 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes check-pop {
  0% { transform: scale(0.5) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

---

## Botones

```css
.btn-interactive {
  transition: transform 80ms ease-out, box-shadow 150ms ease-out;
}
.btn-interactive:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.btn-interactive:active {
  transform: scale(0.98);
}
```

---

## `prefers-reduced-motion`

**Obligatorio.** Si el usuario tiene "reducir movimiento", todas las
animaciones se reducen al minimo.

```css
@media (prefers-reduced-motion: reduce) {
  .cascade-item {
    animation: fade-in-only 150ms ease-out both;
    animation-delay: 0ms;
  }
  .panel-slide-in {
    animation: fade-in-only 150ms ease-out both;
  }
  .pulse {
    animation: none;
    opacity: 1;
  }
  .stream-cursor {
    animation: none;
    opacity: 0.5;
  }
  .chip-pop-in {
    animation: fade-in-only 100ms ease-out both;
  }
  @keyframes fade-in-only {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

Sin transformaciones, sin stagger, solo fade. **Es obligatorio.**

---

## Lo que NO se hace

- No instalar Framer Motion. Todo se hace con CSS + 20 lineas de React.
- No animar todo. Si todo se mueve, nada destaca.
- No hacer typewriter fake. Si el stream tarda 8s, el texto sale en 8s.
- No usar `transition: all`. Especifica la propiedad.
- No bloquear la interaccion.
- No ignorar `prefers-reduced-motion`.
- No animar `width`/`height`. Usa `transform` y `opacity`.
- No cascadar mas de 15 items sin cap. Ya esta capado a 8.
- No cascadar el mismo componente dos veces. Solo la primera vez.
- No cascadar en respuesta a acciones del usuario. Solo al cargar.

---

## Donde se aplica

### Chat
- Typewriter en la respuesta del fast LLM.
- Cursor parpadeante al final.
- Tool calls con fade-slide.
- Bloques en cascada.

### Panel contextual
- Slide-in del panel.
- Cascada de filas de tabla.
- Chips de procedencia con pop.

### Centro de control
- KPIs con contador.
- Graficos con barras que crecen.
- Indicador del worker con pulso.

### Tareas
- Badges con cross-fade.
- Pasos del plan con check animado.
- Filas en cascada.

### Inbox
- Items en cascada.
- Botones con hover/active.
- Al aprobar: check animado + slide-out.

### Sidebar
- Cambio de vista con fade rapido.
- Nuevas notificaciones con shake del icono.

### Onboarding
- Bienvenida con typewriter.
- Sugerencias en cascada.
- Todo con fade-in general.

---

## Criterios de cierre Fase 2

- El chat se siente vivo (typewriter + cascada).
- El panel contextual se siente montado (slide-in + cascada).
- Los KPIs cuentan.
- Todo respeta `prefers-reduced-motion`.
- Cero librerias nuevas.

---

## Como se pide a la otra IA

Prompt tipo:

> Dame 6 GIFs o videos cortos de referencia para:
>
> 1. Typewriter de ChatGPT en el chat.
> 2. Cascada de filas de una tabla al cargar.
> 3. Slide-in de un panel desde la derecha.
> 4. Pulso suave de un indicador de estado "trabajando".
> 5. Contador de KPI que sube de 0 al valor.
> 6. Fade-slide de bloques que aparecen en un chat.
>
> De cada uno, dime el easing, la duracion, y el delay entre elementos si aplica.

Con esas referencias, se escriben los snippets concretos.

---

Fin del plan.
