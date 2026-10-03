# Renderizar y validar código

## User

donde puedo renderizar este codigo para ver si es correcto?

### Pasted
````
Sí, te pillo perfectamente. Estás describiendo **WhatsApp + Steam + dashboard de ops** fundidos en un mismo sistema. Y no es casualidad lo que dices — hay un patrón concreto detrás:

**WhatsApp** te enseña el **badge en el item del chat con microtexto que cambia en vivo** ("escribiendo…", "grabando audio…", "foto"). El item **es** el estado, no un icono decorativo.

**Steam (y consolas)** te enseña **el progreso dentro del propio botón**. Cuando descargas un juego, el botón no dice "Descargar", dice "Descargando 47% · 12,4 GB / 26,1 GB · 3,2 MB/s". Es **una consola de estado**, no un botón.

**Dashboard de ops** te enseña **todo lo que está pasando en tiempo real, en el propio item**. Barras que se llenan, contadores que suben, timer que corre.

La síntesis: **el item de una conversación/tarea/proceso es un "screen de estado" vivo**, no una entrada estática de una lista. Eso es exactamente el "DJ feel" que quieres — tú miras el sidebar y **ves el trabajo ocurriendo**, no la lista de lo que has hecho.

Voy a aterrizarlo en un componente concreto, en código, para que lo veas.

---

## El concepto: `LiveItem`

Un item de sidebar puede estar en **6 estados visuales**. Cada estado muestra algo **distinto** debajo del título, en una **franja de 18px**. Nunca más.

```
┌─────────────────────────────────────────┐
│ ● Proyecto Aurora              [⋯]      │  ← título, 13.5px 600
│ ↑ fotos subiendo · 24                   │  ← franja de estado, 11px
└─────────────────────────────────────────┘
```

Estados posibles de esa franja:

| Estado | Qué se ve | Ejemplo |
|---|---|---|
| `idle` | nada (la franja no existe) | |
| `counter` | flecha + label + número que sube | `↑ fotos subiendo · 24` |
| `progress` | micro-barra + porcentaje | `▬▬▬▬▬░░░░ 47%` |
| `pulse` | punto + verbo continuo | `● escribiendo…` |
| `timer` | reloj + tiempo corriendo | `⏱ 2m 14s` |
| `alert` | gradiente naranja + texto | `⚠ requiere tu OK` |

**Regla dura:** un item **solo puede estar en un estado a la vez**. Si está subiendo fotos Y hay alerta, gana la alerta. Eso fuerza la calma visual.

---

## El componente tal cual

Esto lo pegas en `apps/web/src/playground/LiveItem.tsx`. No tiene dependencias raras.

```tsx
import { useEffect, useRef, useState } from "react";

// ────────────────────────────────────────────────────────────────
// LiveItem — un item de sidebar/lista que "vive"
// 6 estados. Regla: uno a la vez. La franja siempre mide 18px.
// ────────────────────────────────────────────────────────────────

export type LiveState =
  | { kind: "idle" }
  | { kind: "counter"; icon: "↑" | "↓"; label: string; value: number }
  | { kind: "progress"; label: string; value: number; max: number }
  | { kind: "pulse"; label: string }
  | { kind: "timer"; label: string; seconds: number }
  | { kind: "alert"; label: string; urgency: "soft" | "urgent" };

interface Props {
  title: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
  live?: LiveState;
}

export function LiveItem({ title, subtitle, active, onClick, live }: Props) {
  const state = live ?? { kind: "idle" };

  return (
    <button
      onClick={onClick}
      className={`live-item ${active ? "live-item--active" : ""} ${
        state.kind === "alert" ? `live-item--alert-${state.urgency}` : ""
      }`}
    >
      <div className="live-item__head">
        <span className="live-item__title">{title}</span>
      </div>

      {subtitle && state.kind === "idle" && (
        <div className="live-item__subtitle">{subtitle}</div>
      )}

      {state.kind !== "idle" && (
        <div className="live-item__strip">
          {state.kind === "counter" && <CounterStrip state={state} />}
          {state.kind === "progress" && <ProgressStrip state={state} />}
          {state.kind === "pulse" && <PulseStrip state={state} />}
          {state.kind === "timer" && <TimerStrip state={state} />}
          {state.kind === "alert" && <AlertStrip state={state} />}
        </div>
      )}

      <style>{`
        .live-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          transition: background 140ms ease-out, border-color 140ms ease-out;
        }
        .live-item:hover {
          background: rgba(255,255,255,0.6);
          border-color: #EDE8E0;
        }
        .live-item--active {
          background: #FFFFFF;
          border-color: #EDE8E0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .live-item__head {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .live-item__title {
          font-size: 13.5px;
          font-weight: 600;
          color: #1A1A1A;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        .live-item__subtitle {
          font-size: 11px;
          color: #8A857E;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .live-item__strip {
          height: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
        }
        .live-item--alert-soft {
          background: linear-gradient(90deg,
            rgba(255,159,67,0.08) 0%,
            rgba(255,120,40,0.14) 60%,
            transparent 100%);
          border-left: 2px solid rgba(255,140,50,0.5);
        }
        .live-item--alert-urgent {
          background: linear-gradient(90deg,
            rgba(255,90,30,0.16) 0%,
            rgba(255,60,20,0.26) 50%,
            rgba(255,90,30,0.10) 100%);
          border-left: 2px solid #FF6B2C;
          animation: live-item-pulse 2.4s ease-in-out infinite;
        }
        @keyframes live-item-pulse {
          0%, 100% { box-shadow: inset 0 0 0 0 rgba(255,107,44,0); }
          50%      { box-shadow: inset 0 0 20px 0 rgba(255,107,44,0.20); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-item--alert-urgent { animation: none; }
        }
      `}</style>
    </button>
  );
}

// ─── Strip: contador con bump ────────────────────────────────────
function CounterStrip({ state }: { state: Extract<LiveState, { kind: "counter" }> }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(state.value);

  useEffect(() => {
    if (prev.current !== state.value) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 240);
      prev.current = state.value;
      return () => clearTimeout(id);
    }
  }, [state.value]);

  return (
    <>
      <span className={`live-dot live-dot--${state.icon === "↑" ? "up" : "down"}`} />
      <span className="live-label">{state.label}</span>
      <span className="live-sep">·</span>
      <span
        className="live-value"
        style={{
          transform: flash ? "translateY(-2px) scale(1.06)" : "none",
          color: flash ? "#5B4DF1" : "#5B4DF1",
          transition:
            "transform 200ms cubic-bezier(0.34,1.56,0.64,1), color 200ms ease-out",
        }}
      >
        {state.value.toLocaleString()}
      </span>
      <style>{counterStyles}</style>
    </>
  );
}

// ─── Strip: barra de progreso micro ──────────────────────────────
function ProgressStrip({ state }: { state: Extract<LiveState, { kind: "progress" }> }) {
  const pct = Math.max(0, Math.min(1, state.value / state.max));
  return (
    <>
      <span className="live-label">{state.label}</span>
      <span className="live-progress">
        <span
          className="live-progress__fill"
          style={{
            width: `${pct * 100}%`,
            transition: "width 420ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </span>
      <span className="live-value live-value--tabular">
        {Math.round(pct * 100)}%
      </span>
      <style>{counterStyles}</style>
    </>
  );
}

// ─── Strip: pulse (escribiendo, procesando) ──────────────────────
function PulseStrip({ state }: { state: Extract<LiveState, { kind: "pulse" }> }) {
  return (
    <>
      <span className="live-dot live-dot--pulse" />
      <span className="live-label">{state.label}</span>
      <style>{`
        .live-dot--pulse {
          background: #5B4DF1;
          animation: live-pulse 1.6s ease-in-out infinite;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.8); }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-dot--pulse { animation: none; }
        }
      `}</style>
    </>
  );
}

// ─── Strip: timer que corre ──────────────────────────────────────
function TimerStrip({ state }: { state: Extract<LiveState, { kind: "timer" }> }) {
  const [s, setS] = useState(state.seconds);
  useEffect(() => {
    setS(state.seconds);
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [state.seconds]);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return (
    <>
      <span className="live-clock">⏱</span>
      <span className="live-label">{state.label}</span>
      <span className="live-value live-value--tabular">
        {mm}:{String(ss).padStart(2, "0")}
      </span>
      <style>{counterStyles}</style>
    </>
  );
}

// ─── Strip: alerta ───────────────────────────────────────────────
function AlertStrip({ state }: { state: Extract<LiveState, { kind: "alert" }> }) {
  return (
    <>
      <span className="live-warn">!</span>
      <span className="live-label live-label--warn">{state.label}</span>
      <style>{`
        .live-warn {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #FF6B2C;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .live-label--warn {
          color: #8A5A00;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}

const counterStyles = `
  .live-dot {
    width: 6px; height: 6px;
    border-radius: 999px;
    background: #5B4DF1;
    flex-shrink: 0;
  }
  .live-dot--up { background: #5B4DF1; }
  .live-dot--down { background: #9A9590; }
  .live-label {
    font-size: 11px;
    color: #6B6B6B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .live-sep {
    font-size: 11px;
    color: #D8D0C4;
  }
  .live-value {
    font-size: 11px;
    font-weight: 700;
    color: #5B4DF1;
    display: inline-block;
  }
  .live-value--tabular {
    font-variant-numeric: tabular-nums;
  }
  .live-progress {
    flex: 1;
    height: 3px;
    background: #EDE8E0;
    border-radius: 999px;
    overflow: hidden;
    min-width: 40px;
  }
  .live-progress__fill {
    display: block;
    height: 100%;
    background: #5B4DF1;
    border-radius: 999px;
  }
  .live-clock {
    font-size: 10px;
    color: #6B6B6B;
  }
`;
```

---

## Ahora la demo para verlo en marcha

Esto lo pegas en `apps/web/src/playground/Playground.tsx`. Muestra los 6 estados funcionando en un sidebar real.

```tsx
import { useEffect, useState } from "react";
import { LiveItem, type LiveState } from "./LiveItem";

export default function Playground() {
  // Demo: cada item avanza su propio estado en bucle.
  const [tick, setTick] = useState(0);
  const [photos, setPhotos] = useState(12);
  const [uploadProgress, setUploadProgress] = useState(0.1);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setPhotos((p) => (p >= 47 ? 12 : p + Math.ceil(Math.random() * 4)));
      setUploadProgress((v) => (v >= 1 ? 0.05 : v + 0.02));
      setTimer((t) => t + 1);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const items: Array<{ id: string; title: string; subtitle?: string; live?: LiveState }> = [
    {
      id: "aurora",
      title: "Fotos del evento · Aurora",
      live: { kind: "counter", icon: "↑", label: "fotos subiendo", value: photos },
    },
    {
      id: "lola",
      title: "Lola (Atención)",
      live: { kind: "pulse", label: "escribiendo…" },
    },
    {
      id: "conciliacion",
      title: "Conciliación bancaria",
      live: { kind: "progress", label: "procesando", value: Math.round(uploadProgress * 100), max: 100 },
    },
    {
      id: "auditoria",
      title: "Auditoría web",
      live: { kind: "timer", label: "corriendo", seconds: timer },
    },
    {
      id: "cobro",
      title: "Cobro Consultoría Norte",
      live: { kind: "alert", label: "requiere tu OK · 7.900€", urgency: "urgent" },
    },
    {
      id: "onboarding",
      title: "Onboarding proveedor",
      subtitle: "hace 3d · Ops",
    },
    {
      id: "factura",
      title: "Revisar contrato SaaS",
      subtitle: "ayer · Legal",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F0EB",
        padding: 40,
        fontFamily: "Inter, system-ui",
      }}
    >
      <div style={{ maxWidth: 380, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#8A857E",
            padding: "0 12px",
            marginBottom: 10,
          }}
        >
          Recientes
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.4)",
            borderRadius: 16,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {items.map((item) => (
            <LiveItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              live={item.live}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 11,
            color: "#8A857E",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          6 estados posibles · solo uno visible a la vez
          <br />
          la franja mide siempre 18px
        </div>
      </div>
    </div>
  );
}
```

**Abre `http://localhost:5173/?playground=1`** (con el setup que te di antes). Vas a ver:

1. **Fotos subiendo · 23** — el número sube cada 0.9s y hace "bump" (sube 2px y se pone púrpura intenso durante 240ms).
2. **Loba escribiendo** — un punto que late cada 1.6s. Es el "escribiendo…" de WhatsApp.
3. **Conciliación · 47%** — barra que se va llenando con easing lento. La barra ocupa todo el ancho disponible de la franja.
4. **Auditoría web** — un reloj que corre con `mm:ss` en `tabular-nums` (los dígitos no bailan al cambiar).
5. **Cobro Consultoría Norte** — el item entero se tiñe de **gradiente naranja que late cada 2.4s** con `inset box-shadow`. No es un icono de alerta: **es el item el que respira**.
6. **Onboarding** y **Revisar contrato** — idle, con subtítulo normal. La franja ni existe.

---

## Por qué esto es "cuadro de consola de videojuego"

Mira lo que has construido sin darte cuenta:

| Concepto videojuego | Cómo aparece aquí |
|---|---|
| Barra de progreso del save | `LiveItem` con `progress` |
| Notificación de logro | `LiveItem` con `alert` urgente |
| Contador de bajas / kills | `LiveItem` con `counter` |
| Timer de partida | `LiveItem` con `timer` |
| Indicador "jugador activo" | `LiveItem` con `pulse` |

Y mira lo que tiene de **WhatsApp**:

- El "escribiendo…" es literal — mismo pulse, misma sensación.
- El badge numérico que cambia en vivo — mismo efecto.
- Los items que **cuentan algo** en lugar de solo listar títulos.

Y mira lo que tiene de **ops dashboard**:

- El gradiente naranja urgente = "esto pide tu intervención".
- El timer corriendo = "hay algo haciendo trabajo ahora mismo".
- La barra de progreso = "esto está a media".

**Estás construyendo un producto que se siente como las tres cosas a la vez.** Y lo mejor: **cada estado es independiente**. Si mañana quieres añadir "descargando PDF", es un tipo más. Si quieres "reintentando (2/3)", es un tipo más. El componente no crece en complejidad.

---

## Lo que queda por decidir

Cuando lo veas rodar, dime si el ritmo es correcto. Cosas concretas que se pueden ajustar en 30 segundos:

- **El bump** ¿es muy agresivo? → bajo `translateY(-2px)` a `-1px`.
- **El pulse** ¿es muy nervioso? → subo de 1.6s a 2.2s.
- **El late de la alerta** ¿es demasiado? → bajo la opacidad del `box-shadow` de `0.20` a `0.12`.
- **La barra de progreso** ¿es muy fina? → subo de `3px` a `4px`.
- **El reloj** ¿debería mostrar `mm:ss` o `Xs` si es menos de 1 minuto?

Prueba, dime qué chirría, y en el siguiente bloque meto el **typewriter del chat** con el mismo ritmo para que el chat y el sidebar "respiren" igual. Porque si el sidebar late a 2.4s y el chat escribe a 26ms por carácter, tienen que ser **el mismo lenguaje**.
````

## Claude

Tienes tres opciones, de más rápida a más integrada:

**1. En tu propio repo (OpenMuse), que es para lo que está pensado**
Guarda los dos archivos en `apps/web/src/playground/` (`LiveItem.tsx` y `Playground.tsx`), arranca el servidor con `npm run dev` y abre `http://localhost:5173/?playground=1`.

Eso solo funciona si tu `main.tsx` ya tiene el interruptor que renderiza `<Playground />` cuando existe `?playground=1`. Ese paso venía del setup anterior, así que si no lo tienes, dímelo y te lo escribo.

**2. En un sandbox online, sin tocar tu repo**
- **StackBlitz** (stackblitz.com): crea un proyecto "React + TypeScript" con Vite.
- **CodeSandbox** (codesandbox.io): plantilla "React TS".

Pega `LiveItem.tsx` y `Playground.tsx` en `src/` y en `App.tsx` pon:

```tsx
import Playground from "./playground/Playground";
export default function App() { return <Playground />; }
```

No necesita dependencias extra, solo React.

**3. Aquí mismo**
Puedo convertirlo en una página HTML autocontenida y publicarla como artifact para que lo veas funcionando en el chat, sin instalar nada. Solo cambiaría el empaquetado, no el diseño ni los estados.

Un detalle del texto: en la lista de lo que vas a ver pone "Loba escribiendo", pero el item del código es "Lola (Atención)". Es solo un typo en la explicación.

¿Quieres que lo renderice aquí?

## User

tu  lo puedes crear antes en artifact aqui? con ese codigo y antes auditarlo y me dices si crees que es guapo y pro?

## Claude

Primero la auditoría. El concepto es bueno, pero el código tiene fallos reales que corregí en la versión del artifact:

- **Bug del timer:** `Playground` le pasa `seconds={timer}`, que cambia cada 900ms. Eso reinicia el `setInterval` interno en cada tick y el reloj va a saltos. Ahora el timer cuenta por su cuenta.
- **Ternario muerto:** `flash ? "#5B4DF1" : "#5B4DF1"` es el mismo color en ambas ramas, así que el "bump a púrpura intenso" nunca ocurría. Solo se movía.
- **Estilos duplicados:** cada instancia mete su `<style>` en el render (y `counterStyles` hasta 4 veces por item). Eso debería ser una hoja de CSS única.
- **Saltos de layout:** el idle no tiene franja y los demás sí, así que el item cambia de altura. Además el `border-left` de 2px solo aparece en las alertas y desplaza el contenido. Ahora la franja de 18px se reserva siempre y el borde es siempre de 2px.
- **Accesibilidad:** no hay `role="progressbar"` ni `aria-*`, y el gris `#8A857E` a 11px sobre `#F3F0EB` tiene poco contraste.
- **Sin dark mode ni tokens:** los colores están hardcodeados.
- **Pequeños:** el `[⋯]` del diagrama no existe en el código, `tick` no se usa, y el subtítulo desaparece cuando hay estado vivo.

Ya está publicado como artifact con los 6 estados funcionando y los arreglos de la auditoría. Es HTML y JS puro en lugar de React, pero el diseño y los estados son los mismos. También respeta el dark mode del sistema y `prefers-reduced-motion`.

**¿Es guapo y pro?** Mi opinión:

- **Lo mejor es la idea.** El item como pantalla de estado vivo, con una sola franja y una sola cosa a la vez, es disciplina de producto de verdad. Eso se siente pro.
- **Lo que más se nota es la alerta.** El item entero que respira se lee al instante, mejor que un icono.
- **Visualmente es limpio pero no memorable.** Fondo crema, acento violeta y tipografía 13.5/11 son correctos, pero se parecen a cualquier app de productividad. Para el "DJ feel" le falta algo más distintivo: por ejemplo, un micro-sparkline en el estado `counter`, o que la barra de progreso tenga un brillo que la recorra.
- **Pega con el producto, pero no es el producto.** Funciona como componente, pero un wow de verdad vendrá de verlo con datos reales de tus agentes.

Nota: el código original no estaba listo para producción, sobre todo por el timer roto y los estilos duplicados. Si lo llevas a OpenMuse, usa la lógica de esta versión y mueve el CSS a una hoja única. Si quieres, te lo porto de vuelta a React/TSX ya limpio.

#### 📦 Artifact: liveitem
**Type:** code | **Language:** html

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>LiveItem · OpenMuse</title>
<style>
:root{--bg:#F3F0EB;--panel:rgba(255,255,255,.4);--card:#fff;--line:#EDE8E0;--text:#1A1A1A;--mute:#6F6A63;--accent:#5B4DF1;--accent-hi:#7C6FFF;--warn:#FF6B2C;--warnText:#8A5A00;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#16151A;--panel:rgba(255,255,255,.04);--card:#232229;--line:#2E2D36;--text:#F1EFEA;--mute:#A09B94;--accent:#8E83FF;--accent-hi:#B3AAFF;--warnText:#FFB066}}
:root[data-theme="dark"]{--bg:#16151A;--panel:rgba(255,255,255,.04);--card:#232229;--line:#2E2D36;--text:#F1EFEA;--mute:#A09B94;--accent:#8E83FF;--accent-hi:#B3AAFF;--warnText:#FFB066}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;min-height:100vh}
.wrap{max-width:380px;margin:0 auto;padding:40px 16px}
h1{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);padding:0 12px;margin:0 0 10px}
.list{background:var(--panel);border-radius:16px;padding:6px;display:flex;flex-direction:column;gap:2px}
.li{display:flex;flex-direction:column;gap:4px;width:100%;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid transparent;border-left:2px solid transparent;background:transparent;cursor:pointer;font:inherit;color:inherit;transition:background .14s,border-color .14s}
.li:hover{background:rgba(255,255,255,.5);border-color:var(--line)}
:root[data-theme="dark"] .li:hover{background:rgba(255,255,255,.05)}
.li.active{background:var(--card);border-color:var(--line);box-shadow:0 1px 2px rgba(0,0,0,.04)}
.title{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.strip{height:18px;display:flex;align-items:center;gap:6px;overflow:hidden;font-size:11px;color:var(--mute)}
.lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sep{opacity:.5}
.val{font-weight:700;color:var(--accent);display:inline-block;font-variant-numeric:tabular-nums;transition:transform .2s cubic-bezier(.34,1.56,.64,1),color .2s}
.val.bump{transform:translateY(-2px) scale(1.06);color:var(--accent-hi)}
.dot{width:6px;height:6px;border-radius:99px;background:var(--accent);flex:none}
.dot.pulse{animation:p 1.6s ease-in-out infinite}
@keyframes p{50%{opacity:.4;transform:scale(.8)}}
.bar{flex:1;height:3px;min-width:40px;background:var(--line);border-radius:99px;overflow:hidden}
.fill{display:block;height:100%;background:var(--accent);border-radius:99px;transition:width .42s cubic-bezier(.22,1,.36,1)}
.warn{width:14px;height:14px;border-radius:99px;background:var(--warn);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center;flex:none}
.lbl.w{color:var(--warnText);font-weight:600}
.li.urgent{background:linear-gradient(90deg,rgba(255,90,30,.16),rgba(255,60,20,.26) 50%,rgba(255,90,30,.1));border-left-color:var(--warn);animation:u 2.4s ease-in-out infinite}
@keyframes u{50%{box-shadow:inset 0 0 20px rgba(255,107,44,.2)}}
@media (prefers-reduced-motion:reduce){.dot.pulse,.li.urgent{animation:none}.val,.fill{transition:none}}
.foot{margin-top:24px;font-size:11px;color:var(--mute);text-align:center;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">
  <h1>Recientes</h1>
  <div class="list" id="list"></div>
  <div class="foot">6 estados · solo uno a la vez<br>la franja mide siempre 18px</div>
</div>
<script>
const $=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const list=document.getElementById('list');
function item(title,kind,o={}){
  const b=$('button','li'),s=$('div','strip');
  b.append($('span','title',title),s);
  b.onclick=()=>{list.querySelectorAll('.li').forEach(x=>x.classList.remove('active'));b.classList.add('active')};
  let set=()=>{};
  if(kind==='idle'){s.append($('span','lbl',o.sub))}
  if(kind==='counter'){const v=$('span','val');s.append($('span','dot'),$('span','lbl',o.label),$('span','sep','·'),v);
    let p;set=n=>{v.textContent=n.toLocaleString('es-ES');if(p!==undefined&&p!==n){v.classList.add('bump');setTimeout(()=>v.classList.remove('bump'),240)}p=n};set(o.value)}
  if(kind==='progress'){const f=$('span','fill'),bar=$('span','bar'),v=$('span','val');bar.append(f);bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',o.label);
    s.append($('span','lbl',o.label),bar,v);set=n=>{f.style.width=n+'%';v.textContent=n+'%';bar.setAttribute('aria-valuenow',n)};set(o.value)}
  if(kind==='pulse'){s.append($('span','dot pulse'),$('span','lbl',o.label))}
  if(kind==='timer'){const v=$('span','val');let n=o.value;const r=()=>v.textContent=Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
    s.append($('span','lbl','⏱'),$('span','lbl',o.label),v);r();setInterval(()=>{n++;r()},1000)}
  if(kind==='alert'){b.classList.add('urgent');s.append($('span','warn','!'),$('span','lbl w',o.label))}
  list.append(b);return set;
}
const photos=item('Fotos del evento · Aurora','counter',{label:'fotos subiendo',value:12});
item('Lola (Atención)','pulse',{label:'escribiendo…'});
const conc=item('Conciliación bancaria','progress',{label:'procesando',value:10});
item('Auditoría web','timer',{label:'corriendo',value:0});
item('Cobro Consultoría Norte','alert',{label:'requiere tu OK · 7.900€'});
item('Onboarding proveedor','idle',{sub:'hace 3d · Ops'});
item('Revisar contrato SaaS','idle',{sub:'ayer · Legal'});
let ph=12,pr=10;
setInterval(()=>{ph=ph>=47?12:ph+1+Math.floor(Math.random()*4);photos(ph);pr=pr>=100?5:pr+2;conc(pr)},900);
</script>
</body>
</html>
```

## User

se te ocurren mejoras a nivel ui ux y logica de interfaz pro enterprise?

## Claude

Sí. Las ordeno por impacto, de la lógica a lo visual, porque lo enterprise se gana más en la lógica que en el aspecto.

## Lógica de interfaz

1. **Modelo de estado real, no solo visual.** Ahora el componente recibe un `live` ya decidido. En producción cada item debería tener una lista de eventos activos con prioridad, y una función pura que elija cuál mostrar: `alert > pulse > progress > counter > timer`. Así la regla "gana la alerta" vive en un solo sitio, es testeable y no depende de cada pantalla.
2. **Estados que faltan.** Un item enterprise necesita `error` (falló, con reintento), `paused`, `queued` ("2º en cola"), `done` (completado, desaparece solo a los N segundos o se queda hasta que lo veas) y `offline/stale`, que avisa de que el dato lleva tiempo sin actualizarse. Sin `stale`, un usuario puede fiarse de un contador congelado.
3. **Un "visto" explícito.** Las alertas y los `done` deben tener ciclo de vida: aparece, se ve, se reconoce, se archiva. Sin eso, el sidebar se llena de ruido.
4. **Ordenación inteligente.** Arriba lo que requiere acción humana, luego lo que está corriendo, luego lo reciente. Con una transición suave al reordenar (FLIP) para que los items no salten.
5. **Throttling de actualizaciones.** Si llegan 50 eventos por segundo, la UI no debe repintar 50 veces. Agrupa a ~4 fps con `requestAnimationFrame`, o los números parecerán nerviosos y el rendimiento sufrirá con listas largas.

## UX de acciones

6. **Resolver desde el propio item.** La alerta de "requiere tu OK · 7.900€" debería tener *Aprobar / Rechazar* ahí mismo, o al menos al hover o foco. Para aprobaciones rutinarias ahorra un clic y una navegación.
7. **Confirmación proporcional al riesgo.** 7.900€ no debe aprobarse con un solo clic accidental. Usa deshacer con ventana de 5-10s para lo reversible, y confirmación explícita con el importe repetido para lo que no lo es.
8. **Contexto en la alerta.** "Requiere tu OK" es vago. Mejor *quién lo pidió, por qué y desde cuándo*: "Cobro · pedido por Lola · hace 12 min". En enterprise la pregunta es siempre "¿por qué me lo piden a mí?".
9. **Tiempo restante o SLA.** En progress y timer, un ETA ("~2 min") vale más que un porcentaje. Si hay SLA, la alerta puede escalar de `soft` a `urgent` por tiempo, no solo por prioridad.
10. **Command palette (⌘K)** para saltar a cualquier item, filtrar por "solo alertas" o aprobar sin ratón. Es lo que más separa una herramienta pro de una app bonita.

## Enterprise de verdad

11. **Accesibilidad completa.** Usa `aria-live="polite"` en una región aparte, que anuncie cambios importantes (alertas, errores) pero no cada tick del contador. Añade navegación por teclado (↑↓, Enter, A para aprobar) y no dependas solo del color: el naranja necesita siempre icono y texto, que ya tienes. Cumple WCAG AA en contraste, y ojo con los 11px grises.
12. **Auditoría y trazabilidad.** Cada aprobación debe registrar quién, cuándo y con qué contexto, y el item debe poder abrir su histórico. Para un "Business OS" con cobros y legal, esto no es opcional.
13. **Permisos visibles.** Si el usuario no puede aprobar, el botón no debe desaparecer sin más: muéstralo deshabilitado con el motivo ("requiere rol Finanzas").
14. **Multi-usuario.** Si dos personas ven la misma alerta y una la aprueba, la otra debe verlo resuelto en vivo, con "Aprobado por Marta hace 3s". Evita dobles cobros y confusión.
15. **i18n y formato.** Moneda, fechas y plurales ("1 foto / 24 fotos") con `Intl`, no cadenas pegadas.
16. **Tokens de diseño y temas.** Sustituye los colores sueltos por tokens semánticos (`--status-alert`, `--status-progress`...), que permiten dark mode y marca blanca por cliente.
17. **Densidad configurable.** Un modo compacto para power users con 40 items abiertos y uno cómodo para el resto.
18. **Estados vacíos, de carga y de error del propio sidebar.** Skeletons al cargar y un mensaje claro si falla la conexión, no una lista vacía engañosa.

## Pulido visual

19. **Menos animación simultánea.** Si hay 5 items pulsando a la vez, el sidebar parece un árbol de Navidad. Limita a una animación continua visible (la alerta más urgente) y deja las demás estáticas con un cambio puntual al actualizarse.
20. **Un toque propio.** Un sparkline mínimo en `counter` o un brillo que recorra la barra de progreso daría identidad sin romper la calma.

## Si tuviera que elegir

Por impacto frente a esfuerzo empezaría por: **(1) el modelo de prioridad, (2) los estados `error`/`stale`/`done`, (6) acciones en el item, (8) contexto en la alerta y (11) accesibilidad**. Con eso el componente pasa de demo bonita a pieza de producto.

Si quieres, puedo implementar un bloque concreto aquí, por ejemplo la alerta con *Aprobar/Rechazar* y deshacer, o el sistema de prioridades con los estados nuevos, y lo ves funcionando.

## User

creame el artifact donde veo a lo que te refieres, te doy foto de mi ui ux ahora

## Claude

Ya lo tienes montado sobre tu UI real (sidebar de norte., pill de agente, buscador ⌘K, botón negro "Nuevo chat", panel blanco redondeado), en la pantalla de Centro de control, que es donde más encajan las mejoras.

Ya está publicado: https://claude.ai/artifact/U2grWrV2AVFsoXfmdsuBus

Es una aproximación a tu estética (crema, panel blanco, pill del agente, botón negro, acento violeta), no una copia píxel a píxel de tus pantallas. Asumí que el Centro de control actual, que ahora es una lista plana de eventos `system.google_disconnected`, pasa a ser una lista priorizada con items vivos.

**Qué verás de lo que te propuse:**
- **Prioridad automática:** arriba lo que pide tu acción, luego lo que corre y al final lo reciente. El contador naranja del sidebar suma las alertas.
- **Estados nuevos:** `error` con Reintentar, `stale` ("sin datos hace 4 min", atenuado), `queued` ("2º en cola") y `done` con Archivar.
- **Alerta con contexto:** quién la pidió, por qué y hace cuánto, con una barra de SLA. Pasa de suave a urgente cuando se consume la mitad del tiempo.
- **Acciones en el propio item:** al aprobar 7.900€ pide confirmación con el importe, y siempre se puede deshacer durante 8 segundos.
- **Permisos visibles:** el contrato SaaS tiene el botón deshabilitado con el motivo ("Requiere rol Legal").
- **Multiusuario simulado:** a los 20 segundos Marta aprueba "Pago Transportes Vidal" en vivo.
- **Una sola animación continua:** solo la alerta más urgente respira, así que el sidebar no parece un árbol de Navidad.
- **Teclado y accesibilidad:** ⌘K / Ctrl+K abre una paleta para saltar a items o filtrar. Con ↑↓ te mueves entre filas y con A apruebas. Hay un `aria-live` que anuncia solo los cambios importantes, no cada tick, y respeta `prefers-reduced-motion`.
- **Densidad:** el botón Cómodo/Compacto.

**Qué no incluye, por mantenerlo ligero:** las otras pantallas (Chat, Tareas...), el historial de auditoría de cada aprobación y el reordenado animado entre filas.

Si te convence, el siguiente paso sería aplicar esto a tu pantalla "01 Pro" (con los workers y el chat lateral) o portarlo a React/TSX para tu repo. ¿Cuál prefieres?

#### 📦 Artifact: norte-centro
**Type:** code | **Language:** html

```html
<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>norte. · Centro de control</title>
<style>
:root{--bg:#F3F0EB;--card:#fff;--line:#EDE8E0;--chip:#F0EDE8;--text:#1A1A1A;--mute:#6F6A63;--ac:#5B4DF1;--acs:#EEEBFF;--warn:#FF6B2C;--wt:#8A5A00;--err:#D6334B;--ok:#1E9E5A;--ink:#111;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#16151A;--card:#1E1D24;--line:#2C2B34;--chip:#2A2931;--text:#F1EFEA;--mute:#A09B94;--ac:#8E83FF;--acs:#2B2850;--wt:#FFB066;--ink:#F1EFEA}}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px Inter,system-ui,sans-serif;height:100vh;display:flex;overflow:hidden}
aside{width:236px;padding:22px 14px;display:flex;flex-direction:column;gap:2px;flex:none}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;padding:0 8px 18px}.logo{width:32px;height:32px;border-radius:99px;background:var(--ink);color:var(--bg);display:grid;place-items:center;font-size:13px}
.beta{margin-left:auto;font-size:9px;letter-spacing:.08em;color:var(--mute);background:var(--chip);padding:3px 7px;border-radius:99px}
.sec{font-size:10.5px;font-weight:700;letter-spacing:.1em;color:var(--mute);padding:6px 10px}
.nav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;color:var(--mute);font-size:14px}.nav.on{background:var(--card);color:var(--text);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.nav i{font-style:normal;width:18px;text-align:center}.cnt{margin-left:auto;background:var(--warn);color:#fff;font-size:10.5px;font-weight:800;border-radius:99px;min-width:19px;height:19px;display:grid;place-items:center;padding:0 5px}
.user{margin-top:auto;display:flex;align-items:center;gap:10px;padding:8px}.user small{display:block;color:var(--mute);font-size:11px}
main{flex:1;min-width:0;margin:14px 14px 14px 0;background:var(--card);border-radius:28px;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.06);overflow:hidden}
.top{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line)}
.pill{background:var(--chip);border-radius:99px;padding:7px 14px;font-size:12.5px;display:flex;align-items:center;gap:8px}.gd{width:8px;height:8px;border-radius:99px;background:#22C55E}
.srch{margin-left:auto;background:var(--chip);border:0;color:var(--mute);border-radius:99px;padding:8px 14px;font:inherit;font-size:13px;display:flex;gap:30px;cursor:pointer}kbd{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:0 6px;font:11px inherit}
.nb{background:var(--ink);color:var(--bg);border:0;border-radius:99px;padding:10px 18px;font:600 13px inherit;cursor:pointer}
.body{flex:1;overflow:auto;padding:22px 28px 40px}
h1{font-size:22px;margin:0}.sub{color:var(--mute);font-size:12.5px;margin:3px 0 14px}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px}
.chip{border:1px solid var(--line);background:transparent;color:var(--mute);border-radius:99px;padding:6px 13px;font:inherit;font-size:12.5px;cursor:pointer}.chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.dens{margin-left:auto}
.hint{font-size:11.5px;color:var(--mute);background:var(--acs);border-radius:10px;padding:8px 12px;margin:10px 0 4px;line-height:1.5}
h2{font-size:10.5px;letter-spacing:.1em;color:var(--mute);margin:20px 4px 8px;text-transform:uppercase}
.row{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--line);border-left:3px solid transparent;border-radius:14px;margin-bottom:8px;background:var(--card);outline:none;transition:background .14s,border-color .14s}
.row:hover,.row:focus-visible{border-color:var(--ac)}.row.dense{padding:7px 12px;margin-bottom:4px}.row.dense .ctx{display:none}
.row.flash{box-shadow:0 0 0 3px var(--acs)}
.row.alert{border-left-color:var(--warn);background:linear-gradient(90deg,rgba(255,140,50,.09),transparent 70%)}
.row.alert.urgent{background:linear-gradient(90deg,rgba(255,90,30,.18),rgba(255,90,30,.05))}.row.alert.breathe{animation:br 2.4s ease-in-out infinite}
@keyframes br{50%{box-shadow:inset 0 0 22px rgba(255,107,44,.2)}}
.row.error{border-left-color:var(--err)}.row.stale .mid{opacity:.6}.row.done{opacity:.7}
.ic{width:34px;height:34px;border-radius:99px;background:var(--acs);display:grid;place-items:center;flex:none;font-size:14px}
.alert .ic{background:var(--warn);color:#fff;font-weight:800}.error .ic{background:var(--err);color:#fff;font-weight:800}.done .ic{background:#DDF3E7;color:var(--ok)}
.mid{flex:1;min-width:0}.t{font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.strip{min-height:18px;display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--mute);margin-top:2px}
.ctx{font-size:11px;color:var(--mute);margin-top:1px}.v{font-weight:700;color:var(--ac);font-variant-numeric:tabular-nums}.v.bump{display:inline-block;transform:translateY(-2px) scale(1.08)}
.w{color:var(--wt);font-weight:600}.e{color:var(--err);font-weight:600}
.dot{width:6px;height:6px;border-radius:99px;background:var(--ac);flex:none}.dot.p{animation:pl 1.6s infinite}@keyframes pl{50%{opacity:.35;transform:scale(.8)}}
.pb{flex:1;max-width:160px;height:4px;background:var(--line);border-radius:99px;overflow:hidden}.pb i{display:block;height:100%;background:var(--ac);border-radius:99px;transition:width .4s}
.sla{width:70px;height:3px;background:var(--line);border-radius:99px;overflow:hidden}.sla i{display:block;height:100%;background:var(--warn)}
.act{display:flex;gap:6px;align-items:center;flex:none}
.b{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:99px;padding:6px 13px;font:600 12px inherit;cursor:pointer}.b:hover{border-color:var(--ink)}
.b.p{background:var(--ink);color:var(--bg);border-color:var(--ink)}.b:disabled{opacity:.45;cursor:not-allowed}.lk{font-size:11px;color:var(--mute)}
#toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--bg);border-radius:14px;padding:11px 16px;display:none;gap:14px;align-items:center;font-size:13px;z-index:9}
#toast button{background:none;border:0;color:inherit;font:700 13px inherit;text-decoration:underline;cursor:pointer}
#pal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;align-items:flex-start;justify-content:center;padding-top:14vh;z-index:10}
#pal>div{width:min(520px,92vw);background:var(--card);border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3)}
#q{width:100%;border:0;border-bottom:1px solid var(--line);padding:16px 18px;font:15px inherit;background:transparent;color:var(--text);outline:none}
.pi{padding:10px 18px;font-size:13.5px;display:flex;gap:10px;cursor:pointer}.pi.sel{background:var(--acs)}.pi small{margin-left:auto;color:var(--mute)}
.sr{position:absolute;left:-9999px}
@media(max-width:760px){aside{display:none}main{margin:8px}.act{flex-direction:column;align-items:flex-end}}
@media(prefers-reduced-motion:reduce){.row.alert.breathe,.dot.p{animation:none}}
</style></head><body>
<aside>
 <div class="brand"><span class="logo">N</span>norte.<span class="beta">BETA</span></div>
 <div class="sec">PRINCIPAL</div>
 <div class="nav"><i>▢</i>Chat</div><div class="nav"><i>▦</i>Tareas</div><div class="nav"><i>▤</i>Documentos</div><div class="nav"><i>◎</i>Conocimiento</div><div class="nav"><i>▥</i>Proyectos</div>
 <div class="nav on"><i>∿</i>Centro de control<span class="cnt" id="badge">0</span></div><div class="nav"><i>☺</i>Equipo</div>
 <div class="user"><span class="logo">A</span><div><b>Alfonso</b><small>● Admin</small></div></div>
</aside>
<main>
 <div class="top"><span class="pill"><span class="gd"></span>MI · Agente activo</span>
  <button class="srch" id="open"><span>⌕ Buscar</span><kbd>⌘K</kbd></button><button class="nb">+ Nuevo chat</button></div>
 <div class="body">
  <h1>Centro de control</h1><div class="sub" id="sub"></div>
  <div class="bar" id="bar"></div>
  <div class="hint"><b>Pruébalo:</b> Aprobar el cobro de 7.900€ (pide confirmación y se puede deshacer) · <kbd>⌘K</kbd> para saltar a cualquier cosa · <kbd>↑</kbd><kbd>↓</kbd> entre filas y <kbd>A</kbd> para aprobar · espera 20s y Marta resuelve un pago en vivo · prueba el modo compacto.</div>
  <div id="list" role="list"></div>
 </div>
</main>
<div id="toast"><span id="tm"></span><button id="tu">Deshacer</button></div>
<div id="pal"><div><input id="q" placeholder="Saltar a… o escribe 'alertas'" aria-label="Paleta de comandos"><div id="pl"></div></div></div>
<div class="sr" aria-live="polite" id="live"></div>
<script>
const $=s=>document.querySelector(s);
let items=[
{id:1,k:'alert',t:'Cobro Consultoría Norte',amt:7900,who:'Lola',why:'supera el umbral de 5k',since:720,sla:1800},
{id:2,k:'alert',t:'Alta proveedor · Contrato SaaS',who:'Worker #02',why:'requiere firma legal',since:300,sla:3600,lock:'Requiere rol Legal'},
{id:3,k:'alert',t:'Pago Transportes Vidal',amt:1240,who:'Conciliación',why:'factura duplicada posible',since:95,sla:900},
{id:4,k:'error',t:'Sincronizar contactos Google',msg:'Token de Google caducado',ago:2280},
{id:5,k:'progress',t:'Conciliación bancaria',v:34,eta:140},
{id:6,k:'counter',t:'Fotos del evento · Aurora',lb:'fotos subiendo',v:12},
{id:7,k:'pulse',t:'Lola (Atención)',lb:'escribiendo…'},
{id:8,k:'timer',t:'Auditoría web',lb:'corriendo',s:134},
{id:9,k:'queued',t:'Backup nocturno',pos:2},
{id:10,k:'stale',t:'Monitor Stripe',age:240},
{id:11,k:'done',t:'Onboarding proveedor',msg:'Completado',at:3}];
const ORD={alert:0,error:1,pulse:2,progress:3,counter:4,timer:5,queued:6,stale:7,done:8};
const sec={alert:'Requieren tu acción',error:'Requieren tu acción',done:'Recientes'};
let F='all',dense=false,sel=null,undo=null,tt;
const fm=s=>s<60?s+'s':Math.floor(s/60)+' min '+(s%60?('0'+s%60).slice(-2)+'s':'');
const eur=n=>n.toLocaleString('es-ES')+'€';
const urg=i=>i.since>i.sla*.5;
const live=m=>{$('#live').textContent=m};
function strip(i){switch(i.k){
case'alert':return`<span class="w">Requiere tu OK${i.amt?' · '+eur(i.amt):''}</span><span class="sla" title="Tiempo hasta SLA"><i data-sla="${i.id}" style="width:${Math.min(100,i.since/i.sla*100)}%"></i></span>`;
case'error':return`<span class="e">Falló · ${i.msg}</span><span>hace <span data-k="${i.id}:ago">${fm(i.ago)}</span></span>`;
case'progress':return`<span>procesando</span><span class="pb"><i data-pb="${i.id}" style="width:${i.v}%"></i></span><span class="v" data-k="${i.id}:v">${i.v}%</span><span>· ~<span data-k="${i.id}:eta">${fm(i.eta)}</span></span>`;
case'counter':return`<span class="dot"></span><span>${i.lb} ·</span><span class="v" data-k="${i.id}:v">${i.v}</span>`;
case'pulse':return`<span class="dot p"></span><span>${i.lb}</span>`;
case'timer':return`<span>⏱ ${i.lb}</span><span class="v" data-k="${i.id}:s">${fm(i.s)}</span>`;
case'queued':return`<span>En cola · ${i.pos}º</span>`;
case'stale':return`<span class="w">Sin datos hace <span data-k="${i.id}:age">${fm(i.age)}</span> · puede estar desactualizado</span>`;
case'done':return`<span style="color:var(--ok)">✓ ${i.msg}</span><span>· hace <span data-k="${i.id}:at">${fm(i.at)}</span></span>`}}
function act(i){
if(i.k==='alert'){if(i.lock)return`<button class="b" disabled>Aprobar</button><span class="lk">🔒 ${i.lock}</span>`;
 if(i.conf)return`<span class="lk">¿Aprobar ${eur(i.amt)}?</span><button class="b p" data-a="ok" data-id="${i.id}">Confirmar</button><button class="b" data-a="no" data-id="${i.id}">Cancelar</button>`;
 return`<button class="b p" data-a="ap" data-id="${i.id}">Aprobar</button><button class="b" data-a="rj" data-id="${i.id}">Rechazar</button>`}
if(i.k==='error')return`<button class="b p" data-a="rt" data-id="${i.id}">Reintentar</button>`;
if(i.k==='done')return`<button class="b" data-a="ar" data-id="${i.id}">Archivar</button>`;return''}
const IC={alert:'!',error:'×',done:'✓',progress:'◔',counter:'↑',pulse:'●',timer:'⏱',queued:'⋯',stale:'~'};
function row(i,br){const c=[ 'row',i.k,dense?'dense':'',i.k==='alert'&&urg(i)?'urgent':'',br?'breathe':'',i.id===sel?'flash':''].join(' ');
const ctx=i.k==='alert'?`<div class="ctx">Pedido por ${i.who} · ${i.why} · hace <span data-k="${i.id}:since">${fm(i.since)}</span></div>`:'';
return`<div class="${c}" role="listitem" tabindex="0" data-row="${i.id}"><div class="ic">${IC[i.k]}</div><div class="mid"><div class="t">${i.t}</div><div class="strip">${strip(i)}</div>${ctx}</div><div class="act">${act(i)}</div></div>`}
function vis(){return items.filter(i=>F==='all'||(F==='act'&&(i.k==='alert'||i.k==='error'))||(F==='run'&&!['alert','error','done'].includes(i.k))||(F==='err'&&i.k==='error')).sort((a,b)=>ORD[a.k]-ORD[b.k]||(b.since||0)-(a.since||0))}
function render(){const v=vis();let h='',last='',first=true;
for(const i of v){const s=sec[i.k]||'En curso';if(s!==last){h+=`<h2>${s}</h2>`;last=s}
 const br=i.k==='alert'&&urg(i)&&first;if(br)first=false;h+=row(i,br)}
$('#list').innerHTML=h||'<div class="sub">Nada que mostrar con este filtro.</div>';
const n=items.filter(i=>i.k==='alert'||i.k==='error').length;$('#badge').textContent=n;$('#badge').style.display=n?'grid':'none';
$('#sub').textContent=`${items.length} eventos · ${n} requieren acción · ordenados por prioridad`;
const ch=[['all','Todos'],['act','Requieren acción'],['run','En curso'],['err','Errores']];
$('#bar').innerHTML=ch.map(([k,l])=>`<button class="chip ${F===k?'on':''}" data-f="${k}">${l}</button>`).join('')+`<button class="chip dens ${dense?'on':''}" data-d="1">${dense?'Compacto':'Cómodo'}</button>`}
function toast(m,fn){$('#tm').textContent=m;$('#toast').style.display='flex';undo=fn;clearTimeout(tt);tt=setTimeout(()=>{$('#toast').style.display='none';undo=null},8000)}
function resolve(i,msg){const p={...i};Object.assign(i,{k:'done',msg,at:0,conf:false});live(i.t+': '+msg);render();toast(msg+' · '+i.t,()=>{Object.assign(i,p);for(const k in i)if(!(k in p))delete i[k];render()})}
function doA(a,id){const i=items.find(x=>x.id==id);if(!i)return;
if(a==='ap'){if(i.amt>5000){i.conf=true;render();$(`[data-a=ok]`)?.focus()}else resolve(i,'Aprobado por ti')}
if(a==='ok')resolve(i,'Aprobado por ti');if(a==='no'){i.conf=false;render()}
if(a==='rj')resolve(i,'Rechazado por ti');
if(a==='rt'){Object.assign(i,{k:'progress',v:0,eta:60});delete i.msg;live('Reintentando '+i.t);render()}
if(a==='ar'){items=items.filter(x=>x!==i);render()}}
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)doA(b.dataset.a,b.dataset.id)});
$('#list').addEventListener('keydown',e=>{const r=e.target.closest('.row');if(!r)return;const rs=[...document.querySelectorAll('.row')],ix=rs.indexOf(r);
if(e.key==='ArrowDown'){rs[ix+1]?.focus();e.preventDefault()}if(e.key==='ArrowUp'){rs[ix-1]?.focus();e.preventDefault()}
if(e.key.toLowerCase()==='a'&&!e.metaKey&&!e.ctrlKey){const i=items.find(x=>x.id==r.dataset.row);if(i&&i.k==='alert'&&!i.lock)doA('ap',i.id)}});
$('#bar').addEventListener('click',e=>{const f=e.target.closest('[data-f]'),d=e.target.closest('[data-d]');if(f)F=f.dataset.f;if(d)dense=!dense;render()});
$('#tu').onclick=()=>{undo&&undo();$('#toast').style.display='none';undo=null};
/* palette */
let pi=0,pr=[];
function pal(){const q=$('#q').value.toLowerCase();pr=[{t:'Mostrar solo lo que requiere acción',s:'filtro',f:()=>{F='act';render()}},{t:'Mostrar todo',s:'filtro',f:()=>{F='all';render()}},...items.map(i=>({t:i.t,s:i.k,f:()=>{F='all';sel=i.id;render();const r=document.querySelector(`[data-row="${i.id}"]`);r?.scrollIntoView({block:'center'});r?.focus();setTimeout(()=>{sel=null;r?.classList.remove('flash')},1500)}}))].filter(x=>(x.t+x.s).toLowerCase().includes(q)||(q==='alertas'&&x.s==='alert'));
pi=Math.min(pi,Math.max(0,pr.length-1));$('#pl').innerHTML=pr.map((x,n)=>`<div class="pi ${n===pi?'sel':''}" data-n="${n}">${x.t}<small>${x.s}</small></div>`).join('')}
function openP(){$('#pal').style.display='flex';$('#q').value='';pi=0;pal();$('#q').focus()}
function closeP(){$('#pal').style.display='none'}
$('#open').onclick=openP;$('#pal').onclick=e=>{if(e.target.id==='pal')closeP()};
$('#q').oninput=()=>{pi=0;pal()};
$('#pl').onclick=e=>{const n=e.target.closest('[data-n]');if(n){closeP();pr[n.dataset.n].f()}};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openP()}
if($('#pal').style.display==='flex'){if(e.key==='Escape')closeP();if(e.key==='ArrowDown'){pi=Math.min(pi+1,pr.length-1);pal();e.preventDefault()}if(e.key==='ArrowUp'){pi=Math.max(pi-1,0);pal();e.preventDefault()}if(e.key==='Enter'&&pr[pi]){closeP();pr[pi].f()}}});
/* live ticks (sin re-render para no reiniciar animaciones) */
const upd=()=>{document.querySelectorAll('[data-k]').forEach(el=>{const[id,f]=el.dataset.k.split(':'),i=items.find(x=>x.id==id);if(!i)return;const v=i[f];el.textContent=f==='v'&&i.k==='progress'?v+'%':f==='v'?v:fm(v)});
document.querySelectorAll('[data-pb]').forEach(el=>{const i=items.find(x=>x.id==el.dataset.pb);if(i)el.style.width=i.v+'%'});
document.querySelectorAll('[data-sla]').forEach(el=>{const i=items.find(x=>x.id==el.dataset.sla);if(i)el.style.width=Math.min(100,i.since/i.sla*100)+'%'})};
setInterval(()=>{let re=false;items.forEach(i=>{
if(i.k==='alert'){const u=urg(i);i.since++;if(u!==urg(i))re=true}
if(i.k==='error')i.ago++;if(i.k==='timer')i.s++;if(i.k==='stale')i.age++;if(i.k==='done')i.at++;if(i.k==='progress'&&i.eta>0)i.eta--});
re?render():upd()},1000);
setInterval(()=>{items.forEach(i=>{if(i.k==='counter'){i.v=i.v>=47?12:i.v+1+Math.floor(Math.random()*4);const el=document.querySelector(`[data-k="${i.id}:v"]`);if(el){el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),240)}}
if(i.k==='progress'){i.v=i.v>=100?100:i.v+2;if(i.v>=100&&i.t==='Conciliación bancaria'){i.v=5;i.eta=140}}})},900);
/* multiusuario simulado */
setTimeout(()=>{const i=items.find(x=>x.id===3);if(i&&i.k==='alert'){Object.assign(i,{k:'done',msg:'Aprobado por Marta',at:0});live('Marta aprobó '+i.t);render()}},20000);
render();
</script></body></html>
```

## User

tienes otro mock up de codigos ejemplos y angulos para todas las uis de saas, workspaces etc? si me das solo los bloques de codigo cuanto mas y mas variados mejor, me ayudas mucho y los renderizo en otro sitio

## Claude

Todos son HTML/CSS/JS vanilla y van sin dependencias. **Pega primero el bloque 0 al inicio de cada archivo.** Los demás son fragmentos que usan sus variables y se pueden combinar.

## 0. Base (tokens + utilidades)
```html
<style>
:root{--bg:#F3F0EB;--card:#fff;--line:#EDE8E0;--chip:#F0EDE8;--text:#1A1A1A;--mute:#6F6A63;--ac:#5B4DF1;--acs:#EEEBFF;--ok:#1E9E5A;--warn:#FF6B2C;--err:#D6334B;--r:14px}
@media(prefers-color-scheme:dark){:root{--bg:#16151A;--card:#1E1D24;--line:#2C2B34;--chip:#2A2931;--text:#F1EFEA;--mute:#A09B94;--ac:#8E83FF;--acs:#2B2850}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px Inter,system-ui,sans-serif;padding:32px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:16px}
.btn{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:7px 14px;font:600 12.5px inherit;cursor:pointer}
.btn.p{background:#111;color:#fff;border-color:#111}
.chip{background:var(--chip);border-radius:99px;padding:3px 10px;font-size:11.5px;color:var(--mute)}
kbd{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:0 6px;font-size:11px}
</style>
```

## 1. Kanban con drag & drop
```html
<div class="kb">
 <section class="col" data-c><h3>Por hacer <span class="chip">2</span></h3>
  <div class="card k" draggable="true">Revisar contrato SaaS</div><div class="card k" draggable="true">Conciliar banco</div></section>
 <section class="col" data-c><h3>En curso <span class="chip">1</span></h3>
  <div class="card k" draggable="true">Auditoría web</div></section>
 <section class="col" data-c><h3>Hecho <span class="chip">0</span></h3></section>
</div>
<style>
.kb{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-items:start}
.col{background:var(--chip);border-radius:18px;padding:12px;min-height:200px;display:flex;flex-direction:column;gap:8px;transition:outline .15s}
.col.over{outline:2px dashed var(--ac)}.col h3{margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.k{cursor:grab}.k.drag{opacity:.4}
</style>
<script>
let d;document.querySelectorAll('.k').forEach(k=>{k.ondragstart=()=>{d=k;k.classList.add('drag')};k.ondragend=()=>k.classList.remove('drag')});
document.querySelectorAll('[data-c]').forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add('over')};c.ondragleave=()=>c.classList.remove('over');
c.ondrop=()=>{c.classList.remove('over');c.append(d);document.querySelectorAll('[data-c]').forEach(x=>x.querySelector('.chip').textContent=x.querySelectorAll('.k').length)}});
</script>
```

## 2. Tabla con selección y barra de acciones masivas
```html
<div class="card" style="padding:0;overflow:hidden;position:relative">
<table class="tb"><thead><tr><th><input type="checkbox" id="all"></th><th>Cliente</th><th>Estado</th><th class="r">Ingresos</th></tr></thead>
<tbody>
<tr><td><input type="checkbox"></td><td><b>Talleres Martí</b><br><small>B-58294123</small></td><td><span class="chip" style="color:var(--ac)">● Activo</span></td><td class="r">3.240€</td></tr>
<tr><td><input type="checkbox"></td><td><b>Clínica Dental Norte</b><br><small>B-09348102</small></td><td><span class="chip" style="color:var(--ac)">● Activo</span></td><td class="r">1.850€</td></tr>
<tr><td><input type="checkbox"></td><td><b>Bodegas Vidal</b><br><small>A-45238911</small></td><td><span class="chip" style="color:var(--warn)">● Pausado</span></td><td class="r">420€</td></tr>
</tbody></table>
<div class="bulk" id="bulk"><span id="n">0</span> seleccionados <button class="btn">Exportar</button><button class="btn">Pausar</button><button class="btn" style="color:var(--err)">Eliminar</button></div>
</div>
<style>
.tb{width:100%;border-collapse:collapse}.tb th{position:sticky;top:0;background:var(--card);text-align:left;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);padding:12px 16px;border-bottom:1px solid var(--line)}
.tb td{padding:12px 16px;border-bottom:1px solid var(--line)}.tb tr:hover td{background:var(--chip)}.tb small{color:var(--mute)}.r{text-align:right!important;font-variant-numeric:tabular-nums}
.bulk{position:absolute;left:50%;bottom:14px;transform:translate(-50%,80px);background:#111;color:#fff;border-radius:99px;padding:8px 10px 8px 18px;display:flex;gap:8px;align-items:center;transition:transform .25s cubic-bezier(.22,1,.36,1);font-size:13px}
.bulk.on{transform:translate(-50%,0)}.bulk .btn{background:#222;color:#fff;border-color:#333}
</style>
<script>
const cb=[...document.querySelectorAll('tbody input')],up=()=>{const n=cb.filter(c=>c.checked).length;n$=document.getElementById('n').textContent=n;bulk.classList.toggle('on',n>0)};
cb.forEach(c=>c.onchange=up);all.onchange=()=>{cb.forEach(c=>c.checked=all.checked);up()};
</script>
```

## 3. Command palette (⌘K)
```html
<button class="btn" onclick="p.showModal()">Abrir paleta <kbd>⌘K</kbd></button>
<dialog id="p" class="pal"><input placeholder="Escribe un comando o busca…" autofocus>
 <div class="g">Acciones</div>
 <a class="it sel">＋ Nuevo chat <kbd>N</kbd></a><a class="it">▤ Subir documento <kbd>U</kbd></a><a class="it">⚡ Ejecutar SOP <kbd>R</kbd></a>
 <div class="g">Ir a</div>
 <a class="it">∿ Centro de control <kbd>G C</kbd></a><a class="it">☺ Equipo <kbd>G E</kbd></a>
</dialog>
<style>
.pal{border:0;padding:0;border-radius:18px;width:min(540px,92vw);margin-top:12vh;background:var(--card);color:var(--text);box-shadow:0 24px 70px rgba(0,0,0,.3);overflow:hidden}
.pal::backdrop{background:rgba(0,0,0,.35);backdrop-filter:blur(3px)}
.pal input{width:100%;border:0;border-bottom:1px solid var(--line);padding:18px;font:15px inherit;background:transparent;color:inherit;outline:0}
.g{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);padding:12px 18px 4px}
.it{display:flex;justify-content:space-between;padding:10px 18px;cursor:pointer}.it.sel,.it:hover{background:var(--acs)}
</style>
<script>addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key=='k'){e.preventDefault();p.showModal()}})</script>
```

## 4. Settings con switches y secciones
```html
<div class="card set">
 <h3>Notificaciones</h3>
 <label class="row"><div><b>Aprobaciones pendientes</b><small>Aviso cuando algo requiera tu OK</small></div><input type="checkbox" class="sw" checked></label>
 <label class="row"><div><b>Resumen diario</b><small>Email a las 08:00</small></div><input type="checkbox" class="sw"></label>
 <label class="row"><div><b>Errores de workers</b><small>Solo críticos</small></div><input type="checkbox" class="sw" checked></label>
 <h3 style="margin-top:22px">Seguridad</h3>
 <label class="row"><div><b>Doble aprobación &gt; 5.000€</b><small>Requiere a otro admin</small></div><input type="checkbox" class="sw" checked></label>
</div>
<style>
.set{max-width:520px}.set h3{margin:0 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.set .row{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:12px 0;border-bottom:1px solid var(--line)}.set small{display:block;color:var(--mute);margin-top:2px}
.sw{appearance:none;width:40px;height:24px;border-radius:99px;background:var(--line);position:relative;cursor:pointer;transition:background .2s;flex:none}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:99px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.sw:checked{background:var(--ac)}.sw:checked::after{transform:translateX(16px)}.sw:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
</style>
```

## 5. Pricing con toggle mensual/anual
```html
<div class="seg" id="seg"><button class="on" data-m="1">Mensual</button><button data-m="0">Anual <span class="chip" style="background:var(--acs);color:var(--ac)">-20%</span></button></div>
<div class="pr">
 <div class="card"><h4>Starter</h4><div class="amt"><span data-p="29">29</span>€<small>/mes</small></div><ul><li>3 workers</li><li>1.000 SOPs/mes</li></ul><button class="btn" style="width:100%">Elegir</button></div>
 <div class="card hot"><span class="chip" style="background:var(--ac);color:#fff">Más popular</span><h4>Pro</h4><div class="amt"><span data-p="79">79</span>€<small>/mes</small></div><ul><li>20 workers</li><li>SOPs ilimitados</li><li>Doble aprobación</li></ul><button class="btn p" style="width:100%">Elegir</button></div>
 <div class="card"><h4>Enterprise</h4><div class="amt">A medida</div><ul><li>SSO + auditoría</li><li>SLA 99.9%</li></ul><button class="btn" style="width:100%">Contactar</button></div>
</div>
<style>
.seg{display:inline-flex;background:var(--chip);border-radius:99px;padding:4px;margin-bottom:18px}.seg button{border:0;background:transparent;color:var(--mute);border-radius:99px;padding:7px 16px;font:600 13px inherit;cursor:pointer}.seg .on{background:var(--card);color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.pr{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.pr h4{margin:10px 0 4px}.amt{font-size:34px;font-weight:700}.amt small{font-size:13px;color:var(--mute);font-weight:400}
.pr ul{padding-left:18px;color:var(--mute);line-height:1.9}.hot{border:2px solid var(--ac);transform:translateY(-6px)}
</style>
<script>seg.onclick=e=>{const b=e.target.closest('button');if(!b)return;seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));document.querySelectorAll('[data-p]').forEach(s=>s.textContent=b.dataset.m=='1'?s.dataset.p:Math.round(s.dataset.p*.8))}</script>
```

## 6. Checklist de onboarding con anillo de progreso
```html
<div class="card ob">
 <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--line)" stroke-width="6"/><circle id="ring" cx="32" cy="32" r="26" fill="none" stroke="var(--ac)" stroke-width="6" stroke-linecap="round" stroke-dasharray="163.4" stroke-dashoffset="163.4" transform="rotate(-90 32 32)" style="transition:stroke-dashoffset .5s"/><text id="pc" x="32" y="37" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">0%</text></svg>
 <div style="flex:1"><b>Configura tu espacio</b><div style="color:var(--mute);font-size:12.5px">Completa los pasos para activar tu agente</div>
 <label><input type="checkbox"> Conectar Google</label><label><input type="checkbox"> Subir 1 documento</label><label><input type="checkbox"> Invitar al equipo</label><label><input type="checkbox"> Crear tu primer SOP</label></div>
</div>
<style>.ob{display:flex;gap:18px;max-width:460px;align-items:flex-start}.ob label{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer}.ob input:checked+*,.ob input:checked{accent-color:var(--ac)}.ob label:has(:checked){color:var(--mute);text-decoration:line-through}</style>
<script>const c=[...document.querySelectorAll('.ob input')];c.forEach(i=>i.onchange=()=>{const p=c.filter(x=>x.checked).length/c.length;ring.style.strokeDashoffset=163.4*(1-p);pc.textContent=Math.round(p*100)+'%'})</script>
```

## 7. Composer de chat con menú slash y chips
```html
<div class="cmp">
 <div class="chips"><span class="chip">📎 factura_7900.pdf ✕</span></div>
 <div class="menu" id="menu"><a>/sop · Ejecutar un SOP</a><a>/resumen · Resumir documento</a><a>/aprobar · Pedir aprobación</a></div>
 <textarea id="ta" rows="1" placeholder="Pregunta al agente… (escribe / para comandos)"></textarea>
 <div class="bar"><button class="btn">Adjuntar</button><button class="btn">Voz</button><span style="flex:1"></span><small>Enter envía · Shift+Enter salto</small><button class="send">↑</button></div>
</div>
<style>
.cmp{position:relative;max-width:640px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:12px;box-shadow:0 6px 24px rgba(0,0,0,.05)}.cmp:focus-within{border-color:var(--ac)}
.cmp textarea{width:100%;border:0;resize:none;outline:0;font:15px inherit;background:transparent;color:inherit;padding:8px 4px;max-height:160px}.chips{display:flex;gap:6px}
.bar{display:flex;gap:8px;align-items:center}.bar small{color:var(--mute);font-size:11px}.send{width:34px;height:34px;border-radius:99px;border:0;background:var(--ac);color:#fff;font-size:16px;cursor:pointer}
.menu{display:none;position:absolute;bottom:calc(100% + 8px);left:0;right:0;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.12);overflow:hidden}.menu.on{display:block}.menu a{display:block;padding:10px 14px;cursor:pointer}.menu a:hover{background:var(--acs)}
</style>
<script>ta.oninput=()=>{menu.classList.toggle('on',ta.value.startsWith('/'));ta.style.height='auto';ta.style.height=ta.scrollHeight+'px'}</script>
```

## 8. Tarjetas KPI con sparkline SVG
```html
<div class="kpis">
 <div class="card"><small>INGRESOS RECURRENTES</small><div class="v">24.800€ <span class="chip" style="background:var(--acs);color:var(--ac)">+8,2%</span></div>
  <svg viewBox="0 0 120 32" preserveAspectRatio="none"><polyline fill="none" stroke="var(--ac)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="0,24 15,20 30,22 45,14 60,16 75,9 90,11 105,5 120,3"/></svg></div>
 <div class="card"><small>TICKETS ABIERTOS</small><div class="v">18 <span class="chip" style="background:#FDE7EA;color:var(--err)">+3</span></div>
  <svg viewBox="0 0 120 32" preserveAspectRatio="none"><polyline fill="none" stroke="var(--err)" stroke-width="2" stroke-linecap="round" points="0,8 20,12 40,10 60,18 80,15 100,24 120,26"/></svg></div>
 <div class="card"><small>UPTIME</small><div class="v">99.97%</div>
  <svg viewBox="0 0 120 32" preserveAspectRatio="none"><polyline fill="none" stroke="var(--ok)" stroke-width="2" points="0,6 120,6"/></svg></div>
</div>
<style>.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}.kpis small{color:var(--mute);letter-spacing:.08em;font-size:10.5px;font-weight:700}.kpis .v{font-size:26px;font-weight:700;margin:6px 0 10px;font-variant-numeric:tabular-nums}.kpis svg{width:100%;height:36px}</style>
```

## 9. Calendario semanal (grid con eventos)
```html
<div class="card" style="padding:0;overflow:auto"><div class="wk">
 <div></div><b>Lun</b><b>Mar</b><b>Mié</b><b>Jue</b><b>Vie</b>
 <div class="hrs"><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span></div>
 <div class="d"><i style="top:60px;height:60px;--c:#5B4DF1">Standup</i></div>
 <div class="d"><i style="top:120px;height:90px;--c:#FF6B2C">Cierre mensual</i></div>
 <div class="d"><i style="top:0;height:60px;--c:#1E9E5A">Demo cliente</i><i style="top:180px;height:60px;--c:#5B4DF1">1:1</i></div>
 <div class="d"><i style="top:90px;height:120px;--c:#D6334B">Auditoría</i></div>
 <div class="d"><i style="top:30px;height:60px;--c:#5B4DF1">Revisión SOPs</i></div>
</div></div>
<style>
.wk{display:grid;grid-template-columns:48px repeat(5,1fr);min-width:640px}.wk>b{padding:12px;text-align:center;font-size:12px;color:var(--mute);border-bottom:1px solid var(--line)}
.hrs{display:grid;grid-auto-rows:60px}.hrs span{font-size:11px;color:var(--mute);padding:4px 8px}
.d{position:relative;height:360px;border-left:1px solid var(--line);background:repeating-linear-gradient(transparent 0 59px,var(--line) 59px 60px)}
.d i{position:absolute;left:4px;right:4px;border-radius:8px;padding:6px 8px;font:600 11.5px inherit;font-style:normal;background:color-mix(in srgb,var(--c) 14%,var(--card));border-left:3px solid var(--c);color:var(--text)}
</style>
```

## 10. Inbox en vista dividida (lista + detalle)
```html
<div class="split card" style="padding:0">
 <div class="ls" id="ls">
  <a class="m on" data-t="Cobro 7.900€" data-b="Lola pide aprobación. Supera el umbral de 5k y requiere doble OK."><b>Cobro Consultoría Norte</b><small>Lola · hace 12 min</small></a>
  <a class="m" data-t="Contrato SaaS" data-b="Alta de proveedor pendiente de firma legal. Worker #02 adjuntó el PDF."><b>Contrato SaaS</b><small>Worker #02 · hace 1 h</small></a>
  <a class="m" data-t="Informe Q3" data-b="Generado automáticamente. 4 páginas. Listo para revisar."><b>Informe de ventas Q3</b><small>Sistema · ayer</small></a>
 </div>
 <div class="dt"><h3 id="dt">Cobro 7.900€</h3><p id="db">Lola pide aprobación. Supera el umbral de 5k y requiere doble OK.</p><button class="btn p">Aprobar</button> <button class="btn">Rechazar</button></div>
</div>
<style>.split{display:grid;grid-template-columns:280px 1fr;min-height:300px;overflow:hidden}.ls{border-right:1px solid var(--line)}.m{display:block;padding:14px 16px;border-bottom:1px solid var(--line);cursor:pointer;border-left:3px solid transparent}.m small{display:block;color:var(--mute);margin-top:2px}.m:hover{background:var(--chip)}.m.on{background:var(--acs);border-left-color:var(--ac)}.dt{padding:24px}.dt h3{margin:0 0 8px}.dt p{color:var(--mute);line-height:1.6}@media(max-width:600px){.split{grid-template-columns:1fr}}</style>
<script>ls.onclick=e=>{const a=e.target.closest('.m');if(!a)return;ls.querySelectorAll('.m').forEach(x=>x.classList.toggle('on',x==a));dt.textContent=a.dataset.t;db.textContent=a.dataset.b}</script>
```

## 11. Skeleton loading + empty state
```html
<div class="card" style="max-width:420px">
 <div class="sk" style="width:40%;height:14px"></div><div class="sk" style="width:100%;height:10px;margin-top:12px"></div><div class="sk" style="width:80%;height:10px;margin-top:8px"></div>
 <div style="display:flex;gap:10px;margin-top:16px"><div class="sk" style="width:36px;height:36px;border-radius:99px"></div><div style="flex:1"><div class="sk" style="width:60%;height:10px"></div><div class="sk" style="width:35%;height:8px;margin-top:8px"></div></div></div>
</div>
<div class="card empty"><div class="ei">📭</div><b>Sin conversaciones</b><p>Cuando empieces un chat con el agente aparecerá aquí.</p><button class="btn p">+ Nuevo chat</button></div>
<style>.sk{background:linear-gradient(90deg,var(--chip) 25%,var(--line) 50%,var(--chip) 75%);background-size:200% 100%;animation:sh 1.3s infinite;border-radius:8px}@keyframes sh{to{background-position:-200% 0}}
.empty{max-width:420px;text-align:center;padding:36px;margin-top:16px}.ei{font-size:34px}.empty p{color:var(--mute);margin:6px 0 16px}@media(prefers-reduced-motion:reduce){.sk{animation:none}}</style>
```

## 12. Sistema de toasts apilados
```html
<button class="btn p" onclick="toast('Documento subido','ok')">Éxito</button>
<button class="btn" onclick="toast('Falló la sincronización','err')">Error</button>
<div id="ts"></div>
<style>#ts{position:fixed;right:20px;bottom:20px;display:flex;flex-direction:column;gap:8px;z-index:9}
.t{background:#111;color:#fff;border-radius:14px;padding:12px 16px;min-width:240px;display:flex;gap:10px;align-items:center;animation:in .3s cubic-bezier(.22,1,.36,1);border-left:4px solid var(--c)}
.t.out{opacity:0;transform:translateX(20px);transition:.25s}@keyframes in{from{opacity:0;transform:translateY(12px) scale(.96)}}</style>
<script>function toast(m,k){const e=document.createElement('div');e.className='t';e.style.setProperty('--c',k=='ok'?'#22C55E':'#EF4444');e.innerHTML='<span>'+(k=='ok'?'✓':'!')+'</span><span style="flex:1">'+m+'</span><button style="background:none;border:0;color:#fff;cursor:pointer" onclick="this.parentNode.remove()">✕</button>';ts.append(e);setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),250)},4000)}</script>
```

## 13. Drawer lateral de detalle
```html
<button class="btn p" onclick="dr.classList.add('on')">Ver detalle</button>
<div class="dr" id="dr"><div class="bd" onclick="dr.classList.remove('on')"></div>
 <aside><header><b>Talleres Martí S.L.</b><button class="btn" onclick="dr.classList.remove('on')">✕</button></header>
  <div class="bodyd"><span class="chip">● Activo</span><h4>Contacto</h4><p>compras@talleresmarti.es<br>+34 933 214 087</p><h4>Ingresos</h4><p style="font-size:28px;font-weight:700;margin:0">3.240€</p><h4>Actividad</h4><p>Contrato renovado · hace 2 días<br>Factura #204 pagada · hace 5 días</p></div></aside></div>
<style>.dr{position:fixed;inset:0;pointer-events:none;z-index:8}.dr .bd{position:absolute;inset:0;background:rgba(0,0,0,.3);opacity:0;transition:.25s}
.dr aside{position:absolute;right:0;top:0;bottom:0;width:min(400px,92vw);background:var(--card);transform:translateX(100%);transition:transform .3s cubic-bezier(.22,1,.36,1);box-shadow:-20px 0 60px rgba(0,0,0,.15);display:flex;flex-direction:column}
.dr.on{pointer-events:auto}.dr.on .bd{opacity:1}.dr.on aside{transform:none}.dr header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line)}
.bodyd{padding:20px;overflow:auto}.bodyd h4{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);margin:20px 0 6px}.bodyd p{line-height:1.6;margin:0}</style>
<script>addEventListener('keydown',e=>e.key=='Escape'&&dr.classList.remove('on'))</script>
```

## 14. Tabs con subrayado animado
```html
<div class="tabs" id="tabs"><button class="on">Resumen</button><button>Actividad</button><button>Archivos</button><button>Ajustes</button><i id="ul"></i></div>
<style>.tabs{position:relative;display:inline-flex;gap:4px;border-bottom:1px solid var(--line)}.tabs button{border:0;background:none;color:var(--mute);padding:10px 14px;font:600 13.5px inherit;cursor:pointer}.tabs .on{color:var(--text)}
#ul{position:absolute;bottom:-1px;height:2px;background:var(--ac);border-radius:2px;transition:left .3s cubic-bezier(.22,1,.36,1),width .3s cubic-bezier(.22,1,.36,1)}</style>
<script>const mv=b=>{ul.style.left=b.offsetLeft+'px';ul.style.width=b.offsetWidth+'px'};mv(tabs.querySelector('.on'));
tabs.onclick=e=>{const b=e.target.closest('button');if(!b)return;tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));mv(b)}</script>
```

## 15. Árbol de archivos (explorador de documentos)
```html
<div class="card tree" style="max-width:320px">
 <details open><summary>📁 Clientes</summary>
  <details><summary>📁 Talleres Martí</summary><a>📄 Contrato.pdf</a><a>📄 Presupuesto Q3.docx</a></details>
  <a>📄 Listado CIF.xlsx</a></details>
 <details><summary>📁 Finanzas</summary><a>📄 Conciliación sept.xlsx</a><a>📄 Factura_7900.pdf <span class="chip" style="color:var(--warn)">revisar</span></a></details>
 <a>📄 Manual de marca.pdf</a>
</div>
<style>.tree details{margin-left:0}.tree details details,.tree details>a{margin-left:16px}.tree summary,.tree a{display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:8px;cursor:pointer;list-style:none}.tree summary::-webkit-details-marker{display:none}.tree summary:hover,.tree a:hover{background:var(--chip)}</style>
```

## 16. Timeline de workflow / flujo de aprobación
```html
<div class="card" style="max-width:460px"><ol class="wf">
 <li class="done"><b>Solicitud creada</b><small>Lola · 09:42</small></li>
 <li class="done"><b>Validación de CIF y umbral</b><small>Worker #03 · 09:44</small></li>
 <li class="now"><b>Aprobación Finanzas</b><small>Esperando a Marta · 12 min</small></li>
 <li><b>Aprobación Dirección</b><small>Requerida por importe &gt; 5.000€</small></li>
 <li><b>Cobro ejecutado</b><small>Automático</small></li>
</ol></div>
<style>.wf{list-style:none;margin:0;padding:0}.wf li{position:relative;padding:0 0 22px 34px;color:var(--mute)}.wf li::before{content:"";position:absolute;left:0;top:2px;width:20px;height:20px;border-radius:99px;border:2px solid var(--line);background:var(--card)}
.wf li::after{content:"";position:absolute;left:9px;top:24px;bottom:0;width:2px;background:var(--line)}.wf li:last-child::after{display:none}.wf small{display:block;margin-top:2px}
.wf .done{color:var(--text)}.wf .done::before{background:var(--ok);border-color:var(--ok);content:"✓";color:#fff;font-size:11px;text-align:center;line-height:16px}.wf .done::after{background:var(--ok)}
.wf .now{color:var(--text)}.wf .now::before{border-color:var(--warn);box-shadow:0 0 0 4px rgba(255,107,44,.18)}</style>
```

## 17. Presencia: avatares apilados + cursor colaborativo
```html
<div class="card" style="max-width:480px;position:relative">
 <div style="display:flex;justify-content:space-between;align-items:center"><b>Presupuesto Clínica Norte</b>
  <div class="av"><span style="--c:#5B4DF1">A</span><span style="--c:#FF6B2C">M</span><span style="--c:#1E9E5A">L</span><span class="more">+2</span></div></div>
 <p style="line-height:1.7;color:var(--mute)">El plazo de entrega estimado es de <span class="hl">15 días laborables</span> desde la firma del contrato.<i class="cur" style="--c:#FF6B2C"><em>Marta</em></i></p>
</div>
<style>.av{display:flex}.av span{width:28px;height:28px;border-radius:99px;background:var(--c,#ddd);color:#fff;font:700 11px inherit;display:grid;place-items:center;border:2px solid var(--card);margin-left:-8px}.av .more{background:var(--chip);color:var(--mute)}
.hl{background:color-mix(in srgb,#FF6B2C 22%,transparent);border-radius:4px;padding:0 2px}.cur{display:inline-block;width:2px;height:1.1em;background:var(--c);vertical-align:text-bottom;position:relative;animation:bl 1s steps(2) infinite}
.cur em{position:absolute;top:-20px;left:0;background:var(--c);color:#fff;font:600 10px inherit;padding:2px 6px;border-radius:6px 6px 6px 0;white-space:nowrap;font-style:normal}@keyframes bl{50%{opacity:.2}}</style>
```

## 18. Matriz de permisos (roles × recursos)
```html
<div class="card" style="padding:0;overflow:auto"><table class="pm">
<thead><tr><th>Recurso</th><th>Admin</th><th>Finanzas</th><th>Legal</th><th>Lector</th></tr></thead>
<tbody>
<tr><td>Ver clientes</td><td><input type="checkbox" checked></td><td><input type="checkbox" checked></td><td><input type="checkbox" checked></td><td><input type="checkbox" checked></td></tr>
<tr><td>Aprobar cobros</td><td><input type="checkbox" checked></td><td><input type="checkbox" checked></td><td><input type="checkbox"></td><td><input type="checkbox" disabled></td></tr>
<tr><td>Firmar contratos</td><td><input type="checkbox" checked></td><td><input type="checkbox"></td><td><input type="checkbox" checked></td><td><input type="checkbox" disabled></td></tr>
<tr><td>Gestionar equipo</td><td><input type="checkbox" checked></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox" disabled></td></tr>
</tbody></table></div>
<style>.pm{border-collapse:collapse;width:100%;min-width:480px}.pm th,.pm td{padding:12px 16px;text-align:center;border-bottom:1px solid var(--line)}.pm th:first-child,.pm td:first-child{text-align:left;position:sticky;left:0;background:var(--card)}
.pm th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.pm input{width:18px;height:18px;accent-color:var(--ac);cursor:pointer}.pm input:disabled{opacity:.35;cursor:not-allowed}.pm tr:hover td{background:var(--chip)}</style>
```

## 19. Layout shell completo (sidebar + topbar + contenido) con sidebar colapsable
```html
<div class="sh" id="sh">
 <aside><div class="lg">N <span>norte.</span></div>
  <a class="on">▢ <span>Chat</span></a><a>▦ <span>Tareas</span></a><a>▤ <span>Documentos</span></a><a>∿ <span>Centro</span></a>
  <button class="btn" style="margin-top:auto" onclick="sh.classList.toggle('mini')">⇤</button></aside>
 <main><header><span class="chip">● Agente activo</span><span style="flex:1"></span><button class="btn p">+ Nuevo chat</button></header><section>Contenido</section></main>
</div>
<style>.sh{--w:220px;display:grid;grid-template-columns:var(--w) 1fr;height:420px;transition:grid-template-columns .25s}.sh.mini{--w:64px}
.sh aside{padding:16px 10px;display:flex;flex-direction:column;gap:4px;overflow:hidden}.sh aside a{padding:10px 12px;border-radius:12px;color:var(--mute);white-space:nowrap;cursor:pointer}.sh aside a.on{background:var(--card);color:var(--text);font-weight:600}
.sh.mini aside a span,.sh.mini .lg span{display:none}.lg{font-weight:700;padding:6px 10px 14px;white-space:nowrap}
.sh main{background:var(--card);border-radius:24px;margin:8px;display:flex;flex-direction:column;box-shadow:0 6px 30px rgba(0,0,0,.05)}.sh header{display:flex;gap:10px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--line)}.sh section{padding:24px;color:var(--mute)}</style>
```

Si quieres más, dime qué familias (por ejemplo: chat/IA avanzado, dashboards con gráficos, formularios multipaso, mobile/bottom-nav, landing de SaaS, admin de facturación) y los hago más profundos, con variantes de ángulo y estética (dark pro, glass, brutalista, denso tipo Linear).

## User

muy bien, dame ideas logicas asi vivas con ejemplos de codigo para estos casos:

### Pasted
````
Perfecto. Aquí va la lista de **50 casos concretos**, cada uno atado a un fichero real de tu repo, con una frase de "qué resuelve". Están ordenados por familias para que puedas pedir a la otra IA bloques temáticos en lugar de 50 mensajes sueltos.

---

## Familia 1 — Chat & conversación (1-8)

1. **Burbuja de mensaje con estados** (`ChatPanel.tsx`) — pendiente, enviado, leído, error. Hoy no distingues.
2. **Typewriter respetando el SSE real** (`useChat.ts`) — el texto llega en chunks; el typewriter debe consumirlos sin inventar velocidad.
3. **Bloques de tool call agrupados** (`MessageBubble.tsx`) — hoy muestra cada tool por separado. Debería agrupar "3 pasos · 8s · expandible".
4. **Editar mensaje enviado y regenerar respuesta** (`ChatPanel.tsx`) — patrón ChatGPT. Requiere versionar mensajes.
5. **Citar mensaje anterior** (`ChatInput.tsx`) — "responder a este fragmento" con quote inline.
6. **Feedback rápido por mensaje** (`MessageBubble.tsx`) — 👍👎 + "regenerar" + "más corto". Alimenta tu `FeedbackCollector`.
7. **Chips de contexto** (`ContextChips.tsx`, ya existe) — procedencia `auto | alta | media | sugerido | tu`. Falta poblar.
8. **Divisor de día** (`MessageList.tsx`) — "Hoy", "Ayer", "Lunes 3". Sin esto, un chat de 3 meses es ilegible.

## Familia 2 — Tareas & tarea detalle (9-16)

9. **Vista de lista densa para power user** (`TasksView.tsx`) — 40 items en pantalla, sin avatar, sin padding.
10. **Kanban con drag real** (`TasksView.tsx`) — el bloque #1 de la otra IA. Falta conectar a `POST /api/agent/tasks/:id/control`.
11. **Timeline del plan de la tarea** (`TaskDetailModal.tsx`) — el bloque #16. Es tu `AgentTask.plan` visualizado.
12. **Diff de artefactos entre intentos** (`TaskDetailModal.tsx`) — cuando una tarea se reintenta, mostrar qué cambió.
13. **Reasignar tarea a otro usuario** (`TaskDetailModal.tsx`) — dropdown con `listUsers()`. Ya tienes `escalateTask` en backend.
14. **Estimación de tiempo restante** (`TaskDetailModal.tsx`) — con `plan.length` y `attempts`, se puede estimar.
15. **Duplicar tarea** (`TasksView.tsx`) — con mismo input, para repetir un SOP.
16. **Bulk actions sobre tareas** (`TasksView.tsx`) — seleccionar 5, "pausar todas". El bloque #2.

## Familia 3 — Documents & files (17-24)

17. **Árbol de carpetas** (`DocumentsView.tsx`) — el bloque #15. Con `<details>` nativo.
18. **Preview inline de PDF** (`AttachmentPreview.tsx`, ya existe) — pero hoy no hay botón visible. Falta descubrimiento.
19. **Reingesta server-side** (`DocumentsView.tsx`) — hoy descarga el fichero al navegador y lo sube. Ineficiente.
20. **Lista de fuentes RAG** (`DocumentsView.tsx`) — hoy solo se ven fuentes al buscar. Falta endpoint `/api/rag/sources`.
21. **Borrar fuente RAG** (`DocumentsView.tsx`) — hoy no hay botón claro.
22. **Upload con progreso** (`ChatInput.tsx`) — hoy sube en silencio. Con un `POST` normal, no puedes progresar; hay que usar XHR.
23. **Multi-upload** (`DocumentsView.tsx`) — arrastrar 10 PDFs y ver cada uno subir.
24. **Filtro por tipo** (`DocumentsView.tsx`) — `PDF | Imagen | Texto | Office`.

## Familia 4 — Memory & knowledge (25-30)

25. **CRUD completo desde UI** (`MemoryView.tsx`) — hoy solo editar y olvidar. Falta crear.
26. **Agrupación por categoría colapsable** (`MemoryView.tsx`) — hoy lista plana.
27. **Detección de memorias duplicadas** (`MemoryView.tsx`) — "esta memoria se parece a esta otra. ¿Unificar?".
28. **Historial de cambios de una memoria** (`MemoryView.tsx`) — con `AuditStore` ya tienes la fuente.
29. **Importar memorias desde CSV** (`MemoryView.tsx`) — patrón `/api/agent/business-records/import` ya existe.
30. **Sugerir memorias desde el chat** (`MessageBubble.tsx`) — "¿quieres que recuerde esto?" con botón.

## Familia 5 — Projects & artifacts (31-36)

31. **Vista proyecto con tabs** (`ProjectsView.tsx`) — Resumen / Bloques / Memorias / Artefactos. El bloque #14.
32. **Drag de bloques** (`ProjectsView.tsx`) — reordenar bloques con drag.
33. **Vincular memoria o artefacto** (`ProjectsView.tsx`) — picker con búsqueda.
34. **Comparar dos artefactos** (`ProjectsView.tsx`) — diff side-by-side.
35. **Exportar proyecto a PDF** (`ProjectsView.tsx`) — con `pdf-lib` que ya tienes.
36. **Timeline del proyecto** (`ProjectsView.tsx`) — cuándo se creó cada bloque.

## Familia 6 — Approvals & actions (37-42)

37. **Inbox de aprobaciones** (`ApprovalModal.tsx`) — el bloque #10. Vista split con lista + detalle.
38. **Aprobar/rechazar inline** (`TasksView.tsx`) — el botón "Revisar" hoy abre modal. Debería permitir aprobar desde el sidebar.
39. **Doble aprobación** (`ApprovalModal.tsx`) — importe > 5.000€ requiere dos admins.
40. **Undo de aprobación** (`ApprovalModal.tsx`) — el patrón del artifact: 8s de ventana.
41. **Histórico de aprobaciones** (`ApprovalModal.tsx`) — quién aprobó qué, cuándo. Con `AuditStore`.
42. **Reasignar aprobación** (`ApprovalModal.tsx`) — "esto lo debería ver Finanzas".

## Familia 7 — Business Graph (43-46)

43. **Vista entidad con relaciones** (`business-routes.ts`) — hoy solo API. Falta UI.
44. **Buscador de entidades** — `Ctrl+K` con búsqueda por `cif`, `email`, `name`.
45. **Merge de duplicados** (`EntityResolver`) — ya tienes el resolver. Falta UI de "confirmar merge".
46. **Timeline de una entidad** — todos los eventos de `EventBus` filtrados por `entityId`.

## Familia 8 — Admin & team (47-50)

47. **Matriz de permisos** (`UsersView.tsx`) — el bloque #18. Ya lo tienes esbozado.
48. **Cost tracking por usuario** — hoy solo por tenant. Falta por usuario.
49. **Onboarding checklist** (`Onboarding.tsx`, existe) — el bloque #6. Anillo SVG de progreso.
50. **Audit log exportable** (`AuditStore`) — CSV de todas las acciones del último mes.

---

## Cómo pedírselo a la otra IA

En lugar de pedirle los 50 de golpe, pídele **por familia** con un mensaje así:

> "Dame 8 bloques vanilla (HTML+CSS+JS sin dependencias) para un **chat de agente IA**. Cada uno resuelve un caso concreto: burbuja con estado, typewriter con SSE real, bloques de tool call agrupados, editar y regenerar, citar mensaje, feedback rápido, chips de contexto, divisor de día. Mismo sistema de tokens del bloque 0. Prioriza accesibilidad y `prefers-reduced-motion`."

Y así por cada familia. **8 mensajes de la otra IA = 8 familias = 50 bloques coherentes entre sí.**

---

## Orden de prioridad (mi recomendación)

Si quieres ir por valor real y no por familias:

**Top 10 para desbloquear el producto:**
1. **Chat: typewriter con SSE** (2)
2. **Chat: tool calls agrupados** (3)
3. **Tareas: timeline del plan** (11)
4. **Tareas: kanban drag** (10)
5. **Aprobaciones: inbox split** (37)
6. **Aprobaciones: undo de 8s** (40)
7. **Docs: árbol de carpetas** (17)
8. **Admin: matriz permisos** (47)
9. **Shell: layout colapsable** (bloque 19)
10. **Base: tokens + skeleton + empty** (bloques 0 y 11)

Estos 10 son **el 80% del valor visible**. Los otros 40 son pulido, escalado y enterprise.

---

## Un aviso

**50 bloques no son 50 componentes.** Son 50 **patrones**. Algunos se convierten en 3 líneas de CSS en `index.css`. Otros son componentes enteros (`TasksView.tsx` reescrito). La otra IA los da como bloques vanilla porque es la forma más rápida de iterar visualmente. **Tú los portas a TSX cuando ya estés seguro de que el patrón funciona.** No antes.

Y cuando los portes, **no los portes todos a la vez**. Porta uno, verifica, commitea, siguiente. Un bloque por sesión de trabajo. Es la única forma de no romper el typecheck y de no perder contexto entre bloques.

¿Quieres que te prepare los **8 prompts exactos** para pedirle a la otra IA los 50 bloques por familia? Cada prompt con el contexto del bloque 0, los tokens, los `prefers-reduced-motion`, y qué patrón concreto pedirle. Así ella solo tiene que producir y tú solo tienes que portar.
````

## Claude

Todos usan los tokens del **bloque 0** que te di antes (`--card`, `--line`, `--ac`...), así que pégalo primero en el sitio donde renderices. Cada uno trae datos simulados para funcionar solo, y la lógica va aislada para que luego la portes a tu hook o componente. Cubren 14 de tus 50 casos, los que más ganan con lógica "viva" (estado, tiempo, tolerancia a fallos).

## A. Burbuja con máquina de estados (caso 1)
**Idea:** el estado es un dato (`pending → sent → read | error`), nunca un icono suelto. El error ofrece reintento en el mismo sitio.
```html
<div id="msgs"></div>
<button class="btn p" onclick="send('Hola, revisa la factura')">Enviar</button>
<button class="btn" onclick="send('Esto falla',true)">Enviar (fallará)</button>
<style>
.mb{max-width:70%;margin:8px 0 8px auto;background:var(--chip);padding:10px 14px;border-radius:16px 16px 4px 16px;transition:opacity .2s}
.mb .st{display:flex;justify-content:flex-end;gap:6px;font-size:11px;color:var(--mute);margin-top:4px}
.mb[data-s=pending]{opacity:.6}.mb[data-s=error]{outline:1px solid var(--err)}.st a{color:var(--err);text-decoration:underline;cursor:pointer}
</style>
<script>
const ST={pending:'Enviando…',sent:'✓ Enviado',read:'✓✓ Leído',error:'No enviado · <a>Reintentar</a>'};
const set=(el,s)=>{el.dataset.s=s;el.querySelector('.st').innerHTML=ST[s]};
function flow(el,fail){set(el,'pending');setTimeout(()=>{if(fail)return set(el,'error');set(el,'sent');setTimeout(()=>set(el,'read'),1500)},700)}
function send(t,fail){const el=document.createElement('div');el.className='mb';el.innerHTML=t+'<div class="st"></div>';msgs.append(el);
 el.onclick=e=>{if(e.target.tagName==='A')flow(el,false)};flow(el,fail)}
</script>
```

## B. Typewriter con cola y velocidad adaptativa (caso 2)
**Idea:** el SSE manda chunks irregulares. Un buffer los consume y la velocidad sube con el atraso, así nunca va por detrás de la red ni inventa un ritmo fijo. Con `prefers-reduced-motion` pinta directo.
```html
<div class="card" style="max-width:480px;min-height:90px"><span id="o"></span></div>
<button class="btn p" onclick="demo()">Simular stream</button>
<style>.cur::after{content:"▍";color:var(--ac);animation:bl 1s steps(2) infinite}@keyframes bl{50%{opacity:0}}</style>
<script>
class Typer{
 constructor(el){this.el=el;this.q='';this.fin=false;this.raf=0;this.acc=0;this.rm=matchMedia('(prefers-reduced-motion:reduce)').matches}
 push(t){if(this.rm){this.el.textContent+=t;return}this.q+=t;this.el.classList.add('cur');this.run()}
 end(){this.fin=true;this.run()}
 run(){if(this.raf)return;let last=performance.now();
  const f=now=>{const dt=(now-last)/1000;last=now;
   const cps=Math.min(500,35+this.q.length*5);   // más atraso → más rápido
   this.acc+=dt*cps;const n=Math.floor(this.acc);this.acc-=n;
   if(n&&this.q){this.el.textContent+=this.q.slice(0,n);this.q=this.q.slice(n)}
   if(this.q||!this.fin)this.raf=requestAnimationFrame(f);else{this.raf=0;this.el.classList.remove('cur')}};
  this.raf=requestAnimationFrame(f)}
}
function demo(){o.textContent='';const t=new Typer(o);
 const chunks=['Revisé la factura de 7.900€. ','Supera el umbral de 5.000€, ','así que necesita doble aprobación. ','He avisado a Marta y a ti.'];
 chunks.forEach((c,i)=>setTimeout(()=>t.push(c),i*900+Math.random()*400));setTimeout(()=>t.end(),chunks.length*900+600)}
</script>
```

## C. Tool calls agrupados con cronómetro vivo (caso 3)
**Idea:** en lugar de N bloques sueltos, un resumen "3 pasos · 8s" que cuenta mientras hay algo corriendo y se congela al terminar. Se expande para ver el detalle.
```html
<details class="tc" open><summary id="tcs"></summary><ul id="tcl"></ul></details>
<style>
.tc{max-width:420px;border:1px solid var(--line);border-radius:14px;padding:10px 14px;background:var(--card)}
.tc summary{cursor:pointer;display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600}
.tc ul{list-style:none;margin:8px 0 0;padding:0;color:var(--mute);font-size:12.5px}.tc li{display:flex;gap:8px;padding:4px 0}
.sp{display:inline-block;width:10px;height:10px;border:2px solid var(--ac);border-top-color:transparent;border-radius:99px;animation:sp .8s linear infinite}@keyframes sp{to{transform:rotate(1turn)}}
</style>
<script>
const names=['Buscar cliente','Validar CIF','Calcular umbral','Pedir aprobación'],steps=[],t0=Date.now();let end=null,i=0;
function draw(){const run=steps.some(s=>s.run),sec=Math.round(((end||Date.now())-t0)/1000);
 tcs.innerHTML=(run?'<i class="sp"></i>':'✓')+` ${steps.length} pasos · ${sec}s`;
 tcl.innerHTML=steps.map(s=>`<li>${s.run?'<i class="sp"></i>':'✓'} ${s.n}<span style="margin-left:auto">${s.run?'…':s.t+'s'}</span></li>`).join('')}
(function next(){if(i>=names.length){end=Date.now();return draw()}
 const s={n:names[i++],run:true};steps.push(s);draw();
 setTimeout(()=>{s.run=false;s.t=(1+Math.random()*2).toFixed(1);next()},1200+Math.random()*1500)})();
setInterval(()=>!end&&draw(),500);
</script>
```

## D. ETA que aprende (casos 11 y 14)
**Idea:** la estimación se calcula con la media móvil de los pasos ya terminados. Se marca "≈" mientras hay poca evidencia y "~" cuando ya es fiable.
```html
<div class="card" style="max-width:420px"><div id="pl"></div><div class="pbr"><i id="pf"></i></div><div id="et" style="font-size:12px;color:var(--mute);margin-top:6px"></div></div>
<style>.ps{padding:5px 0;color:var(--mute)}.ps.d{color:var(--text)}.ps.n{color:var(--ac);font-weight:600}.pbr{height:4px;background:var(--line);border-radius:99px;margin-top:10px;overflow:hidden}.pbr i{display:block;height:100%;background:var(--ac);transition:width .4s}</style>
<script>
const plan=['Leer documento','Validar CIF','Calcular umbral','Redactar informe','Enviar a revisión'];let k=0,avg=null;
function draw(){pl.innerHTML=plan.map((s,i)=>`<div class="ps ${i<k?'d':i==k?'n':''}">${i<k?'✓':i==k?'●':'○'} ${s}</div>`).join('');
 pf.style.width=k/plan.length*100+'%';const rem=plan.length-k;
 et.textContent=k>=plan.length?'Completado':avg==null?'Calculando…':(k<2?'≈ ':'~ ')+Math.round(avg*rem)+'s restantes'}
function step(){const d=1500+Math.random()*2500;setTimeout(()=>{const s=d/1000;avg=avg==null?s:avg*.6+s*.4;k++;draw();k<plan.length&&step()},d)}
draw();step();
</script>
```

## E. Diff de artefactos entre intentos, en vivo (caso 12)
**Idea:** diff por líneas con LCS, recalculado mientras editas. Sirve igual para comparar intento 1 con intento 2 de una tarea.
```html
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
<textarea id="a" rows="6" class="card" style="font:12.5px monospace">Total: 7.900€
Cliente: Consultoría Norte
Plazo: 30 días</textarea>
<textarea id="b" rows="6" class="card" style="font:12.5px monospace">Total: 7.900€
Cliente: Consultoría Norte S.L.
Plazo: 15 días
Requiere doble OK</textarea></div>
<pre id="df" class="card" style="margin-top:10px;font:12.5px/1.7 monospace;white-space:pre-wrap"></pre>
<style>.df-p{background:rgba(30,158,90,.15)}.df-m{background:rgba(214,51,75,.14);text-decoration:line-through;opacity:.8}</style>
<script>
function diff(x,y){x=x.split('\n');y=y.split('\n');const m=x.length,n=y.length,L=Array.from({length:m+1},()=>Array(n+1).fill(0));
 for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)L[i][j]=x[i]===y[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 const o=[];let i=0,j=0;
 while(i<m&&j<n){if(x[i]===y[j]){o.push(['=',x[i]]);i++;j++}else if(L[i+1][j]>=L[i][j+1])o.push(['-',x[i++]]);else o.push(['+',y[j++]])}
 while(i<m)o.push(['-',x[i++]]);while(j<n)o.push(['+',y[j++]]);return o}
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const up=()=>df.innerHTML=diff(a.value,b.value).map(([t,s])=>`<div class="${t=='+'?'df-p':t=='-'?'df-m':''}">${t=='='?'  ':t+' '}${esc(s)}</div>`).join('');
a.oninput=b.oninput=up;up();
</script>
```

## F. Multi-upload con progreso real y cola concurrente (casos 22 y 23)
**Idea:** XHR (el único que da `upload.onprogress`), máximo 3 subidas a la vez, reintento por fichero. Con `SIM=true` simula; ponlo en `false` y apunta a tu endpoint.
```html
<div id="dz" class="card" style="max-width:480px;text-align:center;border-style:dashed;padding:28px">Arrastra PDFs aquí o <label style="color:var(--ac);cursor:pointer">elige<input type="file" multiple hidden id="fi"></label></div>
<div id="ul" style="max-width:480px;margin-top:10px"></div>
<style>.u{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px}.u .pb{flex:1;height:4px;background:var(--line);border-radius:9px;overflow:hidden}.u .pb i{display:block;height:100%;width:0;background:var(--ac);transition:width .2s}.u.err .pb i{background:var(--err)}.u.ok .pb i{background:var(--ok)}#dz.over{border-color:var(--ac);background:var(--acs)}</style>
<script>
const SIM=true,MAX=3;let active=0;const queue=[];
function xhr(file,onp){return new Promise((ok,ko)=>{
 if(SIM){let p=0;const t=setInterval(()=>{p+=Math.random()*20;onp(Math.min(p,100));if(p>=100){clearInterval(t);Math.random()<.2?ko():ok()}},250);return}
 const x=new XMLHttpRequest(),f=new FormData();f.append('file',file);x.open('POST','/api/rag/upload');
 x.upload.onprogress=e=>e.lengthComputable&&onp(e.loaded/e.total*100);x.onload=()=>x.status<300?ok():ko();x.onerror=ko;x.send(f)})}
function add(file){const r=document.createElement('div');r.className='u';r.innerHTML=`<span style="width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.name}</span><span class="pb"><i></i></span><span class="s">en cola</span>`;ul.append(r);queue.push({file,r});pump()}
function pump(){while(active<MAX&&queue.length){const {file,r}=queue.shift();active++;const bar=r.querySelector('i'),s=r.querySelector('.s');r.className='u';s.textContent='subiendo';
 xhr(file,p=>bar.style.width=p+'%').then(()=>{r.classList.add('ok');s.textContent='✓'}).catch(()=>{r.classList.add('err');s.innerHTML='<a style="cursor:pointer;color:var(--err)">reintentar</a>';s.onclick=()=>{r.className='u';bar.style.width='0';queue.push({file,r});pump()}}).finally(()=>{active--;pump()})}}
fi.onchange=()=>[...fi.files].forEach(add);
dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');
dz.ondrop=e=>{e.preventDefault();dz.classList.remove('over');[...e.dataTransfer.files].forEach(add)};
</script>
```

## G. Detección de duplicados mientras escribes (casos 27 y 45)
**Idea:** similitud de Jaccard sobre palabras normalizadas (sin tildes ni ruido). Si pasa el umbral, ofrece unificar en vez de crear otra memoria.
```html
<div class="card" style="max-width:480px"><input id="nm" placeholder="Nueva memoria…" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit"><div id="sg" style="margin-top:10px"></div><ul id="ml" style="padding-left:18px;color:var(--mute)"></ul></div>
<script>
const mem=['El cliente Talleres Martí paga siempre a 30 días','Las facturas de más de 5.000€ requieren doble aprobación','Marta es la responsable de Finanzas'];
const tok=s=>new Set((s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]{3,}/g)||[]));
const jac=(a,b)=>{const i=[...a].filter(x=>b.has(x)).length;return i/(a.size+b.size-i||1)};
const draw=()=>ml.innerHTML=mem.map(m=>`<li>${m}</li>`).join('');draw();
nm.oninput=()=>{const v=nm.value.trim();if(v.length<8){sg.innerHTML='';return}
 const t=tok(v);let best=null,bs=0;mem.forEach((m,i)=>{const s=jac(t,tok(m));if(s>bs){bs=s;best=i}});
 sg.innerHTML=bs>.35?`<div class="chip" style="display:block;padding:8px 12px;border-radius:10px;color:var(--text)">Se parece (${Math.round(bs*100)}%) a: <i>${mem[best]}</i><br><button class="btn" onclick="merge(${best})">Unificar</button> <button class="btn" onclick="addM()">Crear igualmente</button></div>`:`<button class="btn p" onclick="addM()">Guardar memoria</button>`};
function merge(i){mem[i]=nm.value.length>mem[i].length?nm.value:mem[i];nm.value='';sg.innerHTML='';draw()}
function addM(){mem.push(nm.value);nm.value='';sg.innerHTML='';draw()}
</script>
```

## H. Doble aprobación con ventana de deshacer que ejecuta de verdad (casos 39 y 40)
**Idea:** la acción irreversible no se ejecuta al aprobar, sino cuando termina la cuenta atrás tras la última firma. Deshacer cancela la ejecución y no una acción ya hecha, así que el undo es real.
```html
<div class="card" style="max-width:420px"><b>Cobro Consultoría Norte · 7.900€</b>
<div id="who" style="display:flex;gap:8px;margin:12px 0"></div><div id="st" style="font-size:13px;color:var(--mute)"></div></div>
<script>
const need=2,by=[];let execAt=null;
const left=()=>execAt?Math.max(0,Math.ceil((execAt-Date.now())/1000)):null;
function approve(u){if(by.includes(u)||left()===0)return;by.push(u);if(by.length>=need)execAt=Date.now()+8000;draw()}
function undo(){by.pop();execAt=null;draw()}
function draw(){const l=left();
 st.innerHTML=l===null?`Esperando aprobaciones ${by.length}/${need}`:l>0?`Se ejecutará en <b>${l}s</b> <button class="btn" onclick="undo()">Deshacer</button>`:'✓ Cobro ejecutado';
 who.innerHTML=['Alfonso','Marta'].map(u=>`<button class="btn ${by.includes(u)?'p':''}" ${by.includes(u)||l===0?'disabled':''} onclick="approve('${u}')">${by.includes(u)?'✓ ':''}${u}</button>`).join('')}
setInterval(draw,250);draw();
</script>
```

## I. Buscador de entidades difuso con resaltado (caso 44)
**Idea:** un solo input busca por nombre, CIF o email con coincidencia de subsecuencia, que premia letras consecutivas e inicios de palabra. Se resaltan las letras que casaron.
```html
<div class="card" style="max-width:480px"><input id="q" placeholder="Buscar por nombre, CIF o email…" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit"><div id="res"></div></div>
<style>.rs{padding:9px 10px;border-radius:10px;cursor:pointer;display:flex;justify-content:space-between}.rs.sel,.rs:hover{background:var(--acs)}.rs small{color:var(--mute)}mark{background:none;color:var(--ac);font-weight:700}</style>
<script>
const E=[{n:'Talleres Martí S.L.',cif:'B-58294123',em:'compras@talleresmarti.es'},{n:'Clínica Dental Norte',cif:'B-09348102',em:'admin@clinicadentalnorte.com'},{n:'Estudio Lúa',cif:'B-76512309',em:'hola@estudiolua.com'},{n:'Bodegas Vidal',cif:'A-45238911',em:'pedidos@bodegasvidal.es'}];
function fz(q,s){q=q.toLowerCase();const l=s.toLowerCase();let i=0,sc=0,last=-2;const hit=[];
 for(let j=0;j<l.length&&i<q.length;j++)if(l[j]===q[i]){sc+=j===last+1?3:1;if(j===0||' @.-'.includes(l[j-1]))sc+=2;hit.push(j);last=j;i++}
 return i===q.length?{sc,hit}:null}
const hl=(s,h)=>[...s].map((c,i)=>h.includes(i)?`<mark>${c}</mark>`:c).join('');
let sel=0,R=[];
function go(){const q=this.q?.value||'';R=!q?[]:E.map(e=>{const r=['n','cif','em'].map(k=>({k,m:fz(q,e[k])})).filter(x=>x.m).sort((a,b)=>b.m.sc-a.m.sc)[0];return r&&{e,r}}).filter(Boolean).sort((a,b)=>b.r.m.sc-a.r.m.sc);
 sel=0;draw()}
function draw(){res.innerHTML=R.map((x,i)=>`<div class="rs ${i==sel?'sel':''}"><span>${x.r.k=='n'?hl(x.e.n,x.r.m.hit):x.e.n}</span><small>${x.r.k=='n'?x.e.cif:hl(x.e[x.r.k],x.r.m.hit)}</small></div>`).join('')||(q.value?'<small>Sin resultados</small>':'')}
q.oninput=go;q.onkeydown=e=>{if(e.key=='ArrowDown'){sel=Math.min(sel+1,R.length-1);draw()}if(e.key=='ArrowUp'){sel=Math.max(sel-1,0);draw()}};
</script>
```

## J. Coste por usuario con proyección a fin de mes (caso 48)
**Idea:** no solo cuánto llevas, sino cuánto vas a gastar a este ritmo. La barra cambia de color al 80% y al 100% del presupuesto.
```html
<div class="card" style="max-width:460px"><div style="display:flex;justify-content:space-between"><b id="tot"></b><span id="pj" class="chip"></span></div>
<div class="mt"><i id="mb"></i></div><div id="us" style="margin-top:12px"></div></div>
<style>.mt{height:8px;background:var(--line);border-radius:99px;margin-top:10px;overflow:hidden}.mt i{display:block;height:100%;border-radius:99px;transition:width .4s,background .4s}.ur{display:flex;gap:10px;align-items:center;padding:6px 0;font-size:13px}.ur .b{flex:1;height:4px;background:var(--line);border-radius:9px;overflow:hidden}.ur .b i{display:block;height:100%;background:var(--ac);transition:width .4s}.ur span:last-child{width:62px;text-align:right;font-variant-numeric:tabular-nums}</style>
<script>
const U=[{n:'Alfonso',c:42},{n:'Marta',c:31},{n:'Lola (agente)',c:88}],B=250,day=Math.max(1,new Date().getDate());
function draw(){const t=U.reduce((a,u)=>a+u.c,0),pr=t/day*30,p=t/B*100;
 tot.textContent=t.toFixed(2)+'€ de '+B+'€';mb.style.width=Math.min(100,p)+'%';mb.style.background=p<80?'var(--ok)':p<100?'var(--warn)':'var(--err)';
 pj.textContent='Proyección: '+pr.toFixed(0)+'€';pj.style.color=pr>B?'var(--err)':'var(--mute)';
 us.innerHTML=[...U].sort((a,b)=>b.c-a.c).map(u=>`<div class="ur"><span style="width:100px">${u.n}</span><span class="b"><i style="width:${u.c/t*100}%"></i></span><span>${u.c.toFixed(2)}€</span></div>`).join('')}
setInterval(()=>{U[Math.floor(Math.random()*3)].c+=Math.random()*.9;draw()},700);draw();
</script>
```

## K. Audit log exportable a CSV, listo para Excel en español (caso 50)
**Idea:** separador `;` y BOM UTF-8 para que Excel abra bien tildes y euros. Filtra por rango y muestra el contador antes de exportar.
```html
<div class="card" style="max-width:420px">
<select id="rg" style="padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:inherit"><option value="7">Últimos 7 días</option><option value="30" selected>Últimos 30 días</option><option value="90">Últimos 90 días</option></select>
<div id="cn" style="margin:10px 0;color:var(--mute)"></div><button class="btn p" onclick="exp()">Exportar CSV</button></div>
<script>
const now=Date.now(),D=864e5,LOG=Array.from({length:60},(_,i)=>({fecha:new Date(now-i*D*1.4).toISOString(),usuario:['Alfonso','Marta','Lola'][i%3],accion:['aprobó cobro','creó tarea','editó memoria'][i%3],detalle:'Ref #'+(100+i)+' · importe "7.900€"'}));
const pick=()=>LOG.filter(r=>now-new Date(r.fecha)<=rg.value*D);
const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;
const csv=(rows,cols)=>'\ufeff'+[cols.join(';'),...rows.map(r=>cols.map(c=>esc(r[c])).join(';'))].join('\r\n');
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv(pick(),['fecha','usuario','accion','detalle'])],{type:'text/csv;charset=utf-8'}));a.download=`auditoria_${rg.value}d.csv`;a.click();URL.revokeObjectURL(a.href)}
rg.onchange=()=>cn.textContent=pick().length+' acciones se exportarán';rg.onchange();
</script>
```
*Nota: algunos sandboxes bloquean descargas dentro de iframes. Si no baja, pruébalo en una pestaña propia.*

## L. Citar fragmento seleccionado (caso 5)
**Idea:** al seleccionar texto dentro de una respuesta aparece un botón flotante sobre la selección. Al pulsarlo, el fragmento pasa a chip citado en el composer.
```html
<div class="card ai" style="max-width:480px;line-height:1.7">Supera el umbral de 5.000€, así que necesita doble aprobación. Worker #03 está validando el CIF y te aviso en cuanto termine.</div>
<div id="qc" class="chip" style="display:none;margin-top:10px;max-width:480px"></div>
<button id="qb" class="btn p" style="position:fixed;display:none;z-index:9">❝ Citar</button>
<script>
let quote='';
document.addEventListener('selectionchange',()=>{const s=getSelection();
 if(!s.rangeCount||s.isCollapsed||!s.anchorNode.parentElement.closest('.ai')){qb.style.display='none';return}
 const r=s.getRangeAt(0).getBoundingClientRect();qb.style.display='block';qb.style.left=r.left+r.width/2-35+'px';qb.style.top=r.top-42+'px'});
qb.onmousedown=e=>{e.preventDefault();quote=getSelection().toString().trim();qc.style.display='block';qc.textContent='❝ '+quote.slice(0,120)+(quote.length>120?'…':'')+'  ✕';qb.style.display='none'};
qc.onclick=()=>{quote='';qc.style.display='none'};
</script>
```

## M. "¿Quieres que recuerde esto?" detectado en el chat (caso 30)
**Idea:** reglas baratas sobre el mensaje del usuario (siempre/nunca/prefiero/mi cliente...) sugieren guardar la memoria. Sin LLM extra, solo una heurística que luego puedes afinar.
```html
<div id="chat" style="max-width:480px"></div>
<input id="inp" placeholder="Prueba: 'Mi cliente Martí siempre paga a 30 días'" style="width:100%;max-width:480px;padding:10px;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;margin-top:10px">
<div id="mm" class="card" style="max-width:480px;margin-top:10px"><b style="font-size:12px;color:var(--mute)">MEMORIAS</b><ul id="ml"></ul></div>
<style>.u2{margin:8px 0 8px auto;max-width:80%;background:var(--chip);padding:10px 14px;border-radius:16px 16px 4px 16px}.sug{margin:-2px 0 8px auto;max-width:80%;font-size:12px;background:var(--acs);border-radius:12px;padding:8px 12px;animation:in .3s}@keyframes in{from{opacity:0;transform:translateY(6px)}}</style>
<script>
const RULES=[/\b(siempre|nunca)\b/i,/\bprefiero\b/i,/\bmi (cliente|proveedor|socio|gestor)\b/i,/\b(recuerda|ten en cuenta)\b/i];
inp.onkeydown=e=>{if(e.key!=='Enter'||!inp.value.trim())return;const t=inp.value.trim();inp.value='';
 chat.insertAdjacentHTML('beforeend',`<div class="u2">${t}</div>`);
 if(RULES.some(r=>r.test(t))){const s=document.createElement('div');s.className='sug';
  s.innerHTML=`💡 ¿Recordar esto? <button class="btn" style="padding:3px 10px">Guardar</button> <button class="btn" style="padding:3px 10px">No</button>`;
  const [y,n]=s.querySelectorAll('button');y.onclick=()=>{ml.insertAdjacentHTML('beforeend',`<li>${t}</li>`);s.remove()};n.onclick=()=>s.remove();chat.append(s)}};
</script>
```

## N. Kanban optimista con rollback (caso 10)
**Idea:** la tarjeta se mueve al instante y se llama a `/control` en segundo plano. Si el servidor falla, vuelve a su sitio exacto con una sacudida y un aviso. Así se siente inmediato y sigue siendo honesto.
```html
<div class="kb2">
 <section data-c="todo"><h4>Por hacer</h4><div class="c" draggable="true" data-id="t1">Revisar contrato SaaS</div><div class="c" draggable="true" data-id="t2">Conciliar banco</div></section>
 <section data-c="doing"><h4>En curso</h4><div class="c" draggable="true" data-id="t3">Auditoría web</div></section>
 <section data-c="done"><h4>Hecho</h4></section>
</div><div id="tm" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:12px;display:none"></div>
<style>.kb2{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.kb2 section{background:var(--chip);border-radius:16px;padding:10px;min-height:160px;display:flex;flex-direction:column;gap:8px}.kb2 h4{margin:0;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}.c{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;cursor:grab}</style>
<script>
const SIM=true;let drag;
const api=(id,st)=>SIM?new Promise((ok,ko)=>setTimeout(()=>Math.random()<.4?ko():ok(),600)):fetch(`/api/agent/tasks/${id}/control`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:st})}).then(r=>{if(!r.ok)throw 0});
const toast=m=>{tm.textContent=m;tm.style.display='block';setTimeout(()=>tm.style.display='none',2500)};
document.querySelectorAll('.c').forEach(c=>c.ondragstart=()=>drag=c);
document.querySelectorAll('section').forEach(s=>{s.ondragover=e=>e.preventDefault();s.ondrop=async()=>{
 const from=drag.parentElement,next=drag.nextElementSibling;s.append(drag);drag.style.opacity='.6';
 try{await api(drag.dataset.id,s.dataset.c);drag.style.opacity=1}
 catch{from.insertBefore(drag,next);drag.style.opacity=1;drag.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:260});toast('No se pudo mover · revertido')}}});
</script>
```

## Si quieres la siguiente tanda
Estos 14 son lo que más cambia la sensación de producto vivo. Quedan fuera casos como el divisor de día (caso 8; es una función de ~8 líneas: `hoy / ayer / weekday / dd MMM` con `Intl.DateTimeFormat`), el timeline de entidad (46) o el undo de aprobación en el sidebar (38). Dime por qué familia sigo y los hago igual de profundos, o los hago en versión TSX con los tipos de tu repo.

## User

me validas esta estrategia?

### Pasted
````
Vale. Te doy una propuesta escrita de los **8 primeros frontends** de UI/UX. Cada uno con:

- Qué es y para qué.
- Cómo se ve (layout, componentes).
- Qué datos del backend usa hoy.
- Qué habría que tocar del backend para servirlo de verdad.
- Cómo se conecta (eventos, endpoints, estado).
- Branch propuesto.
- Qué se puede branchar después.

**No es código todavía.** Es la propuesta para que la edites. Cuando la cierres, actualizamos docs y arrancamos el primer branch.

---

## Criterio de selección de los 8

Elijo los 8 por **valor de producto + viabilidad + cobertura de flujos distintos**:

1. **Shell 3 columnas plegables** — donde vive todo.
2. **Chat con typewriter y pasos del agente** — el corazón.
3. **LiveItem en sidebar** — el "DJ feel" que quieres.
4. **Tareas con plan paso a paso** — el flujo más usado.
5. **Inbox de aprobaciones con undo** — el flujo crítico.
6. **Centro de control (dashboard)** — el "cómo va".
7. **Conocimiento por rol (board)** — el "qué ha aprendido".
8. **Panel contextual con ViewSpec** — el "el sistema sirve la vista".

Estos 8 cubren: shell, chat, sidebar, tareas, aprobaciones, dashboard, memoria, y el sistema de UI servida. Si estos 8 funcionan, el resto (docs, projects, users, business graph) son variaciones.

---

## 1. Shell 3 columnas plegables

### Qué es

El contenedor de todo. Sidebar izquierda + main + panel derecho. Los dos paneles se pliegan. El estado se guarda por usuario.

### Cómo se ve

```
┌──────────┬─────────────────────────────┬──────────────┐
│ Sidebar  │  Main                        │  Panel       │
│ (260px)  │  (flex)                      │  (340px)     │
│          │                              │              │
│ Workspace│  TopBar con estado único     │  Tabs:       │
│ switcher │                              │  Tareas      │
│          │  Contenido de la vista       │  Contexto    │
│ Nav      │                              │  Negocio     │
│          │                              │              │
│ Recientes│                              │              │
│          │                              │              │
│ User     │                              │              │
└──────────┴─────────────────────────────┴──────────────┘
```

- Sidebar izquierda: 260px, plegable.
- Main: `flex: 1`, siempre visible.
- Panel derecho: 340px, plegable.
- El shell usa `grid-template-columns` para animar sin reflow.
- El panel cerrado lleva `inert` (accesibilidad).
- Estado persistido en `localStorage` (`ui.left`, `ui.right`).

### Datos que usa hoy

- `useAuth` → usuario, rol.
- `useTasks` → contador de tareas para badge.
- `useThreads` → lista de conversaciones recientes.
- `useNotifications` → contador sin leer.

### Qué toca el backend

**Nada.** El shell es puro frontend. Pero sí necesita que el backend emita más eventos para el badge en vivo (ver LiveItem, punto 3).

### Cómo se conecta

- `usePanel(key, defaultOpen)` hook nuevo, con `localStorage`.
- `SidebarV2` → `Sidebar` (nuevo, con workspace switcher).
- `TopBarV2` → `TopBar` (nuevo, con `.status` único).
- `ContextualPanel` → `Panel` (nuevo, con tabs).
- `App.tsx` → `AppShell.tsx`.

### Branch propuesto

`feat/shell-3-columns` — solo frontend, sin tocar backend.

### Qué se puede branchar después

- Árbol de jerarquía (ClickUp) vs lista (Asana) — el shell acepta cualquiera de los dos.
- Presencia en vivo — el panel derecho puede añadir avatares.
- Densidad configurable — un `data-density` en `.app`.

---

## 2. Chat con typewriter y pasos del agente

### Qué es

El chat del agente. El texto se escribe letra a letra (typewriter adaptativo). Los tool calls se agrupan en un bloque "N pasos completados". El streaming se ve en vivo.

### Cómo se ve

```
┌────────────────────────────────────────────────┐
│ [usuario] Oye, resume la factura de Acme       │
│                                                 │
│ [agente]                                        │
│   ▸ 3 pasos · 8s            ← summary vivo     │
│     ├─ ◐ Buscar factura                         │
│     ├─ ✓ Leer PDF       1.2s                    │
│     ├─ ✓ Calcular IVA   1.8s                    │
│     └─ ◐ Resumir                                │
│                                                 │
│   La factura F-2026-047 de Acme es de...       │
│   ▌                          ← cursor blink     │
└────────────────────────────────────────────────┘
```

- Burbuja usuario: alineada derecha, beige.
- Burbuja agente: alineada izquierda, con avatar.
- Tool calls agrupados: `<details class="steps">` con contador vivo.
- Typewriter: `useTypewriter` con `requestAnimationFrame` y velocidad adaptativa.
- Cursor parpadeante al final.
- Cuando el agente emite texto + tool calls, se muestra primero el bloque de pasos, luego el texto.

### Datos que usa hoy

- `useChat` → `messages`, `streaming`, `streamBuf`, `activeTool`.
- `streamChat` (SSE) → `TEXT_MESSAGE_CHUNK`, `TOOL_CALL_*`, `RUN_FINISHED`.
- `useThreads` → threadId activo.

### Qué toca el backend

**Hoy**: el SSE emite `TEXT_MESSAGE_CHUNK` (delta plano) y `TOOL_CALL_*`. Pero no agrupa los tool calls por turno, y no emite un evento `view.resolved` cuando el agente decide servir una vista. Ver punto 8.

**Cambios propuestos**:
- `apps/server/src/engine/conversation.ts`: emitir `view.resolved` al `SYSTEM_EVENT_TYPES` cuando el fast LLM llama a una tool de tipo `render_view`.
- `packages/domain/src/agent.ts`: `ActiveTool` es local del frontend hoy. Debería ser un tipo del dominio si va a viajar entre SSE y UI.
- `apps/server/src/engine/service.ts`: exponer los tool calls del turno como una lista (no solo el último). Hoy `chat.activeTool` es un único tool. Debe ser `chat.tools: ActiveTool[]`.

### Cómo se conecta

- `useTypewriter` (reescrito) → consume deltas del SSE, emite `displayed`.
- `useChat` → agrupa tool calls por turno en `tools: ActiveTool[]`.
- `MessageList` → pinta `displayed` con `stream-cursor`.
- `ToolCallsGroup` → nuevo componente, `<details>` con summary vivo.
- `MessageBubble` → botones por mensaje (copiar, regenerar, convertir en tarea).

### Branch propuesto

`feat/chat-typewriter-steps` — toca frontend + un poco de backend (emitir `view.resolved` y exponer tool calls).

### Qué se puede branchar después

- Citar fragmento (`quote inline`).
- Feedback 👍👎 por mensaje.
- Divisor de día.
- Chips de contexto (procedencia del mensaje).

---

## 3. LiveItem en sidebar

### Qué es

El item de sidebar que "vive". Seis estados: `idle`, `counter`, `progress`, `pulse`, `timer`, `alert`. Solo uno visible a la vez. Regla dura: si hay alerta, gana la alerta.

### Cómo se ve

```
┌─────────────────────────────────────────┐
│ ● Proyecto Aurora              [⋯]      │  ← título
│ ▬▬▬▬▬░░░░ 47%                            │  ← franja de estado, 18px
└─────────────────────────────────────────┘
```

Estados:
- `idle`: nada (la franja no existe, pero el hueco sí).
- `counter`: `↑ fotos subiendo · 24`.
- `progress`: micro-barra + `47%`.
- `pulse`: `● escribiendo…`.
- `timer`: `⏱ 2m 14s`.
- `alert`: gradiente naranja + `⚠ requiere tu OK`.

### Datos que usa hoy

- `useTasks` → tareas activas.
- `useEvents` (nuevo) → eventos del bus en vivo.
- `useThreads` → conversaciones con estado (escribiendo…, etc.).

### Qué toca el backend

**Hoy**: los eventos del bus existen (`task.status_changed`, `task.completed`, `sop.step_started`, etc.) pero el frontend **no los consume en vivo**. Solo hace polling cada 3s con `useTasks`.

**Cambios propuestos**:
- `apps/server/src/engine/events/types.ts`: añadir `live.updated` al `SYSTEM_EVENT_TYPES` como evento agregado (opcional).
- `apps/server/src/notifications-stream.ts`: extender el SSE para incluir eventos del bus, no solo notificaciones. Hoy solo emite `notification`.
- `apps/server/src/engine/service.ts`: exponer `liveActivity(owner)` que devuelve el estado agregado por tarea/thread.
- **Alternativa sin tocar backend**: el `useEvents` hace polling cada 5s al endpoint `GET /api/events?limit=50` que ya existe. Menos elegante, pero funciona sin tocar nada.

### Cómo se conecta

- `useLiveActivity(owner)` → nuevo hook. Consume `/api/events` (polling) o SSE (cuando exista).
- `pickPrimary(activities: LiveActivity[])` → función pura que decide qué estado mostrar. Prioridad: `alert` > `error` > `pulse` > `progress` > `counter` > `timer` > `idle`.
- `LiveItem` → nuevo componente. 6 estados, franja fija de 18px, sin saltos de layout.
- `Sidebar` → usa `LiveItem` en vez de botones planos.

### Branch propuesto

`feat/live-item-sidebar` — frontend + hook + función pura `pickPrimary` con tests. Backend solo si decidimos emitir `live.updated` al bus.

### Qué se puede branchar después

- Sparkline en `counter`.
- Shimmer en `progress`.
- Ring pulse en el item.
- Estados nuevos: `error`, `paused`, `queued`, `done`, `stale`.
- Acciones inline (aprobar/rechazar desde el item).

---

## 4. Tareas con plan paso a paso

### Qué es

La vista de tareas. Cada tarea muestra su plan (`AgentTask.plan[]`) como timeline vertical. El paso actual late. Los pasos completados tienen check. Los pasos con error tienen rojo.

### Cómo se ve

```
┌─────────────────────────────────────────────────┐
│ Tareas                          [filtrar por rol]│
│                                                  │
│ ⚠ Necesita tu OK · 3 tareas                     │
│                                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ ○ Solicitud creada                       │    │
│ │ ○ Validación de CIF y umbral             │    │
│ │ ◉ Aprobación Finanzas    ← paso activo   │    │
│ │ ○ Aprobación Dirección                   │    │
│ │ ○ Cobro ejecutado                        │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ En curso (2)                                    │
│   ◐ Conciliar banco de septiembre               │
│   ◐ Enviar recordatorios de pago                │
│                                                  │
│ Completado (1)                                  │
│   ✓ Resumen semanal enviado                     │
└─────────────────────────────────────────────────┘
```

- Header con filtros por rol.
- Banner "Necesita tu OK".
- Timeline del plan: cada `TaskStep` es una línea. `status: running` tiene anillo naranja.
- Agrupación: En curso / Por hacer / Completado.
- Al clicar, abre `TaskDetailModal` con más detalle.

### Datos que usa hoy

- `useTasks` → `tasks: AgentTask[]`.
- `AgentTask.plan[]` → ya poblado por `SOPExecutor` y `executeModelTask`.
- `AgentTask.state.roleId` → ya poblado.
- `useAgents` → roles del usuario (para el filtro).

### Qué toca el backend

**Hoy**: `AgentTask.plan[]` ya existe y está poblado. `assignedTo` solo lo pone `escalateTask`. No hay endpoint de "reasignar tarea".

**Cambios propuestos**:
- `apps/server/src/engine/service.ts`: poblar `assignedTo` en `createTask` cuando se pasa `roleId`. Hoy se guarda en `state.roleId`, no en `assignedTo`.
- `apps/server/src/engine/service.ts`: exponer `reassignTask(owner, taskId, toRoleId)`.
- `apps/server/src/engine/routes.ts`: `POST /api/agent/tasks/:id/reassign`.

### Cómo se conecta

- `useTasks` → sigue igual.
- `TaskTimeline` → nuevo componente. Recibe `plan: TaskStep[]`, pinta cada paso.
- `TasksView` → reescrito. 3 secciones: En curso / Por hacer / Completado.
- `TaskDetailModal` → añade timeline completo + botón "Reasignar".

### Branch propuesto

`feat/tasks-timeline` — frontend + pequeño backend (poblar `assignedTo`, endpoint `reassign`).

### Qué se puede branchar después

- Kanban con drag real (mover tarea cambia `status`).
- Bulk actions (seleccionar 5, pausar).
- Diff de artefactos entre intentos.
- ETA que aprende (media móvil).

---

## 5. Inbox de aprobaciones con undo

### Qué es

La vista de aprobaciones pendientes. Cada item es una `ActionProposal`. Se aprueba/rechaza inline. La acción no se ejecuta hasta pasados 8s (undo real). Si el importe es grande, doble firma.

### Cómo se ve

```
┌─────────────────────────────────────────────────┐
│ Aprobaciones (3)                                 │
│                                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ ⚠ Cobro Consultoría Norte · 7.900€      │    │
│ │   Pedido por Lola · hace 12 min          │    │
│ │   Requiere doble firma                   │    │
│ │                                          │    │
│ │   [Aprobar]  [Rechazar]                  │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ┌─────────────────────────────────────────┐    │
│ │ ⚠ Enviar factura Acme · 350€            │    │
│ │   Pedido por Carmen · hace 2 min         │    │
│ │                                          │    │
│ │   Se ejecutará en 7s · Deshacer          │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- Cada item: título, contexto (quién lo pidió, cuándo), importe.
- Botones inline: Aprobar / Rechazar.
- Al aprobar: cuenta atrás visible "Se ejecutará en 7s · Deshacer".
- Importe > 5.000€: doble firma (un segundo aprobador).
- Importe < 500€: aprobación directa sin confirmación.

### Datos que usa hoy

- `useWorkspaceData` → `actions: ActionProposal[]`.
- `ActionProposal` → ya tiene `taskId`, `title`, `kind`, `data`, `hash`, `expiresAt`, `status`.
- `ApprovalModal` → ya existe para aprobar/denegar.

### Qué toca el backend

**Hoy**: `ActionProposal.decide()` ejecuta la acción inmediatamente. No hay `defer` ni `cancel`.

**Cambios propuestos**:
- `apps/server/src/actions.ts`: añadir modo `defer`. La decisión no ejecuta, programa una ejecución a 8s. Nuevo método `cancelDeferred(owner, actionId)`.
- `apps/server/src/engine/events/types.ts`: añadir `action.deferred` y `action.cancelled`.
- `apps/server/src/engine/events/schemas.ts`: schemas para los dos.
- `apps/server/src/admin-routes.ts`: endpoint `POST /api/actions/:id/cancel`.
- `apps/server/src/actions.ts`: doble firma. Si `amount > 5000`, requiere dos `decide()` con usuarios distintos.

### Cómo se conecta

- `ApprovalInbox` → nuevo componente. Lista de items.
- `ApprovalItem` → nuevo. Botones inline + cuenta atrás.
- `useApprovals` → nuevo hook. Consume `/api/workspace` (ya existe) + escucha eventos del bus.
- `Undo` → estado local del item, no toast. El item vuelve a `pending` durante 8s. Solo después se envía.

### Branch propuesto

`feat/approvals-inbox-undo` — frontend + backend (defer, cancel, doble firma). **Es el branch más grande de los 8.**

### Qué se puede branchar después

- Inbox split (lista + detalle).
- Histórico de aprobaciones.
- Reasignar aprobación.
- Reglas de auto-aprobación por umbral.

---

## 6. Centro de control (dashboard)

### Qué es

El "cómo va". Vista principal para el dueño. KPIs + listas por área + alertas. Es el template `dashboard` del `TEMPLATES_V2.md`.

### Cómo se ve

```
┌─────────────────────────────────────────────────┐
│ Centro de control                                │
│ 3 agentes trabajando · 2 cosas esperando tu OK  │
│                                                  │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ │ 3         │ │ 47        │ │ 2         │      │
│ │ Trabajando│ │ Completadas│ │ Esperando │      │
│ └───────────┘ └───────────┘ └───────────┘      │
│                                                  │
│ ⚠ Necesita tu OK · Cobro 7.900€  [Revisar]     │
│                                                  │
│ Procesos en marcha (3)                          │
│   ◐ Conciliar banco  · Agente · hace 4 min      │
│   ◐ Enviar recordatorios · Agente · hace 12 min │
│                                                  │
│ Estado del equipo                                │
│   Trabajando ▬▬▬▬▬▬▬▬░░░ 3                      │
│   Esperando  ▬▬░░░░░░░░░ 1                      │
└─────────────────────────────────────────────────┘
```

- KPIs con `AnimatedNumber`.
- Banner "Necesita tu OK" con botón.
- Procesos en marcha (top 6).
- Estado del equipo (barras).

### Datos que usa hoy

- `useTasks` → tareas agrupadas.
- `useNotifications` → notificaciones sin leer.
- `useEvents` (nuevo) → eventos del bus para KPIs.

### Qué toca el backend

**Hoy**: `ControlCenterView` ya existe y funciona. Pero calcula los KPIs en frontend haciendo `filter` sobre `tasks`.

**Cambios propuestos**:
- `apps/server/src/engine/service.ts`: exponer `dashboardSnapshot(owner)` con KPIs agregados. Menos datos transferidos, cálculo en servidor.
- `apps/server/src/engine/events/types.ts`: añadir `dashboard.updated` (opcional, si queremos SSE).

### Cómo se conecta

- `useDashboard` → nuevo hook. Consume `/api/agent/dashboard` (nuevo endpoint) o `useTasks` + cálculo local.
- `KpiCard` → nuevo componente con `AnimatedNumber`.
- `ProcessList` → reusado de Tareas (mismo componente, distinto filtro).
- `TeamStatusBar` → nuevo.

### Branch propuesto

`feat/control-center-v2` — frontend + endpoint `dashboardSnapshot` en backend.

### Qué se puede branchar después

- Rango temporal (hoy / semana / mes).
- Comparativa con periodo anterior.
- Drill-down desde un KPI a la lista filtrada.
- Export a PDF.

---

## 7. Conocimiento por rol (board)

### Qué es

La vista de memoria. Agrupada por categoría (empresa, cliente, proceso, preferencia, rrhh, producto, otro) y por rol (`roleId`). Filtros + búsqueda + edición.

### Cómo se ve

```
┌─────────────────────────────────────────────────┐
│ Conocimiento                                     │
│ 47 entradas · filtradas por: [todas ▼] [rol ▼]  │
│                                                  │
│ ┌─ Empresa ──────────────────────────────┐     │
│ │ • El tono con clientes es cercano       │     │
│ │ • Facturas el primer día laborable      │     │
│ └─────────────────────────────────────────┘     │
│                                                  │
│ ┌─ Proceso ───────────────────────────────┐    │
│ │ • Antes de alta, validar CIF            │     │
│ │ • Propuestas con 3 paquetes             │     │
│ └─────────────────────────────────────────┘     │
│                                                  │
│ ┌─ Rol: Leo (comercial) ──────────────────┐    │
│ │ • Directo, sin rodeos. Tutea.           │     │
│ │ • Presiona: esto lleva 3 días parado    │     │
│ └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

- Agrupación por categoría con headers colapsables.
- Filtros: categoría, rol, tags.
- Búsqueda.
- Editar / olvidar por item.
- Botón "Nueva memoria".

### Datos que usa hoy

- `useWorkspaceData` → `memories: MemoryEntry[]`.
- `AgentMemory` → `id`, `text`, `source`, `category`, `tags`, `roleId`, `createdAt`.
- `AgentRole` → nombre del rol para agrupar.

### Qué toca el backend

**Hoy**: `POST /api/agent/memories/:id` **no acepta `category` ni `tags`**. Es el bug de la sección 5 del anexo honesto. Solo acepta `text` y `source`.

**Cambios propuestos**:
- `apps/server/src/engine/routes.ts`: ampliar `memorySchema` para aceptar `category` y `tags`.
- `apps/server/src/engine/routes.ts`: añadir `GET /api/agent/memories/grouped` que devuelva memorias agrupadas por categoría + rol.

### Cómo se conecta

- `MemoryBoard` → nuevo componente. Consume `memories` agrupadas.
- `MemoryGroup` → colapsable.
- `MemoryItem` → editar/olvidar inline.
- `MemoryFilter` → categoría + rol + tags.

### Branch propuesto

`feat/memory-board` — frontend + fix backend (`category`, `tags`).

### Qué se puede branchar después

- Detección de duplicados con Jaccard.
- Historial de cambios de una memoria (AuditStore ya lo tiene).
- Importar memorias desde CSV.
- Sugerir memorias desde el chat.

---

## 8. Panel contextual con ViewSpec

### Qué es

El panel derecho del shell. Sirve vistas del sistema cuando el usuario pide algo sin cambiar de pantalla. Es el corazón de la "UI servida".

### Cómo se ve

```
┌─────────────────────────────────────────┐
│ Panel contextual                         │
│ [Tareas] [Contexto] [Negocio]           │
│                                          │
│ El agente dice:                          │
│ "3 leads cerrados este mes."            │
│                                          │
│ Y aquí, el ViewSpec servido:             │
│                                          │
│ ┌─────────────────────────────────────┐│
│ │ Pipeline                             ││
│ │ ┌────────┐ ┌────────┐ ┌────────┐   ││
│ │ │Nuevo(5)│ │Contact.│ │Cerrado │   ││
│ │ │        │ │ (12)   │ │  (3)   │   ││
│ │ │ • Acme │ │ • Beta │ │ • Gamma│   ││
│ │ │ • Delta│ │ • Epsilon│ │        │   ││
│ │ └────────┘ └────────┘ └────────┘   ││
│ └─────────────────────────────────────┘│
│                                          │
│ [Abrir como vista principal]            │
└─────────────────────────────────────────┘
```

- Tabs: Tareas / Contexto / Negocio.
- Contenido: `ViewSpec` renderizado por `ViewRenderer`.
- Botón "Abrir como vista principal" (para llevar el spec al main).
- Slide-in cuando aparece.

### Datos que usa hoy

- `POST /api/views/resolve` → **stub hoy**. Devuelve specs de ejemplo.
- `ViewResolver.resolve(owner, intent)` → **stub hoy**. Regex sobre texto.
- `Views.readView()` y `computeView()` del kernel → **devuelven estructuras vacías**.
- 7 templates (`DashboardTemplate`, `QueueTemplate`, etc.) → **stubs vacíos**.

### Qué toca el backend

**Es el branch con más cambios en backend.** Todo el sistema de `ViewSpec` está a medio construir.

**Cambios propuestos**:
- `packages/domain/src/views.ts` (nuevo): tipos de los 7 ViewSpec.
- `apps/server/src/kernel/graph/views.ts`: implementar `toSpec()` de verdad.
- `apps/server/src/engine/views/resolver.ts`: `ViewResolver.resolve()` con LLM (fast o slow).
- `apps/server/src/routes/views.ts`: `POST /api/views/resolve` que devuelve spec real.
- `apps/server/src/engine/events/types.ts`: añadir `view.resolved`.
- `apps/server/src/engine/events/schemas.ts`: schema para `view.resolved`.
- `apps/server/src/engine/conversation.ts`: emitir `view.resolved` al SSE cuando el agente decide servir una vista.
- `apps/server/src/engine/service.ts`: exponer `resolveView(owner, intent)`.

### Cómo se conecta

- `useViewResolver` → nuevo hook. Llama a `POST /api/views/resolve` cuando el chat detecta una intención.
- `ViewRenderer` → nuevo. Mapea `spec.kind` a componente.
- `Panel` → recibe el spec y decide dónde renderizar (inline / panel / principal).
- `ContextualPanel` → contenedor con tabs + `ViewRenderer`.
- 7 componentes: `DashboardView`, `QueueView`, `InboxView`, `BoardView`, `TableView`, `DetailView`, `FormView`.

### Branch propuesto

`feat/view-spec-panel` — el branch más grande. Toca domain + kernel + engine + routes + frontend.

**Recomendación**: dividirlo en sub-branches:
- `feat/view-spec-types` — solo tipos en domain.
- `feat/view-spec-resolver` — resolver real.
- `feat/view-spec-renderer` — frontend.

### Qué se puede branchar después

- Los 7 templates individualmente.
- Panel contextual con tabs.
- Inline en chat.
- Principal cuando el usuario clica "abrir".
- Debug del kernel (`/api/kernel/turns`).

---

## Resumen de los 8

| # | Nombre | Toca backend | Complejidad | Valor |
|---|---|---|---|---|
| 1 | Shell 3 columnas | No | Media | Alto |
| 2 | Chat typewriter + pasos | Sí (pequeño) | Media | Alto |
| 3 | LiveItem sidebar | Sí (opcional) | Media | Muy alto |
| 4 | Tareas timeline | Sí (pequeño) | Baja | Alto |
| 5 | Inbox aprobaciones + undo | Sí (grande) | Alta | Muy alto |
| 6 | Centro de control v2 | Sí (endpoint) | Baja | Medio |
| 7 | Conocimiento por rol | Sí (fix bug) | Media | Medio |
| 8 | Panel ViewSpec | Sí (grande) | Muy alta | Muy alto |

**Orden recomendado de implementación**:
1. Shell (1) — sin tocar backend, base de todo.
2. Tareas timeline (4) — pequeño, valor alto.
3. Chat typewriter (2) — pequeño, se nota mucho.
4. Conocimiento (7) — fix de un bug real.
5. Centro de control (6) — fácil.
6. Inbox (5) — grande, pero crítico.
7. LiveItem (3) — depende de que el bus esté vivo.
8. Panel ViewSpec (8) — el más grande, se hace al final.

---

## Lo que necesito que confirmes

1. **¿Son estos 8 los primeros?** ¿Cambias el orden? ¿Quitas alguno? ¿Añades?
2. **¿La propuesta de cada uno te cuadra?** ¿Cambias algo del layout, los datos, el backend?
3. **¿Empezamos por el 1 (shell)?** Es el que menos toca y el que más desbloquea.
4. **¿Los docs de UI (`docs/ui/*.md`) los actualizamos ahora con esta propuesta, o esperamos a cerrar los 8?**
5. **¿El backend se toca en el mismo branch o en branches separados?** Yo propongo: mismo branch por flujo. Cada branch es un flujo completo.

Cuando me contestes, actualizo los docs de UI con las decisiones y arrancamos el primer branch.
````

## Claude

**Sí, la valido, con cuatro cambios.** El método es bueno: un flujo por branch, backend y frontend juntos, el estado de cada cosa dicho con honestidad (qué es stub hoy y qué existe de verdad), y la lógica pura (`pickPrimary`) separada del componente y con tests. Lo que ajustaría es el orden y un par de incoherencias.

## Lo que cambiaría

**1. Hay una contradicción en el undo de aprobaciones (el punto más importante).**
La sección de UI dice que el undo es "estado local del item" y que solo después se envía. La de backend propone `defer` en servidor. Son dos diseños incompatibles, y el local es el peligroso: si el usuario cierra la pestaña, refresca o cambia de dispositivo durante esos 8 segundos, la acción se pierde, o se ejecuta sin que él lo sepa.

Mi recomendación es hacerlo solo en servidor: `decide()` programa la ejecución, el cliente solo pinta la cuenta atrás y `cancel` la cancela. Eso obliga a decidir:
- Qué pasa si el servidor se reinicia dentro de la ventana (persistir la ejecución programada).
- Que la ejecución sea idempotente.
- Cómo convive con `expiresAt` y `hash`.

También ojo con la doble firma: si un cliente tiene un solo admin, el umbral de 5.000€ lo bloquea. Hazlo configurable por tenant, con un fallback explícito.

**2. Quita `view.resolved` del branch del chat.**
Ahora mismo el chat (2) depende de la UI servida (8), que es lo más incierto de todo. Deja el 2 puro: lista de tool calls por turno, typewriter y agrupación. El evento entra con el ViewSpec.

**3. Falta un branch de cimientos: el stream de eventos.**
LiveItem (3), Aprobaciones (5) y Centro de control (6) necesitan el mismo hook de actividad en vivo. Pon `useLiveActivity` (con polling a `/api/events` de entrada, SSE después) y `pickPrimary` con tests **antes** de ellos. Es barato, y entonces LiveItem deja de estar en el puesto 7 aunque sea tu diferenciador.

**4. El fix de memorias va aparte y primero.**
Que `POST /memories/:id` no acepte `category` y `tags` es un bug de integridad de datos, no una feature. Es un hotfix de pocas líneas. No lo ates a toda la vista de Conocimiento.

## Ajustes menores

- **Shell:** haz el panel derecho un hueco vacío, cerrado por defecto. Diseñar sus tabs (Tareas, Contexto, Negocio) antes de que exista el ViewSpec es adivinar.
- **Centro de control:** pospón `dashboardSnapshot` en backend. Con los volúmenes de una PYME, filtrar en frontend sirve; el endpoint se justifica cuando duela.
- **ViewSpec:** valida el spec con un schema (zod o similar) antes de renderizar, para que una salida mala del LLM nunca pinte basura. Empieza con 2 templates (dashboard y queue) y un resolver por intenciones cerradas, y deja el LLM para después.
- **Criterio de aceptación por branch:** añade una línea por cada uno, tipo "typecheck verde, tests de `pickPrimary`, funciona con el backend en stub". Hoy la propuesta no dice cuándo un branch está terminado.

## Orden que propongo

0. Hotfix de memorias (`category`, `tags`)
1. Shell (panel derecho como hueco)
2. Tareas con timeline
3. Chat con typewriter y pasos (sin `view.resolved`)
4. Cimientos de eventos, y encima LiveItem
5. Centro de control (solo UI)
6. Aprobaciones con defer en servidor
7. ViewSpec en sub-branches (tipos → resolver → renderer)
8. Tablero de Conocimiento (UI)

## Tus 5 preguntas

1. Sí, son los 8 correctos, con el reorden de arriba.
2. Layouts y datos me cuadran. Lo único a corregir es el undo (punto 1).
3. Sí, empieza por el shell.
4. Los docs de UI, **no los actualices ahora** con las 8 propuestas. Escribe una nota corta de decisión cuando arranque cada branch; así la documentación refleja lo construido y no lo imaginado.
5. Mismo branch por flujo, pero con dos tandas de commits: backend primero (con tests y el contrato en `packages/domain`), frontend después. Así puedes fusionar el contrato antes si hace falta.

## User

dame los bloques de codigo, cuantos mas mejor

## Claude

Todos son TypeScript, atados a los ficheros y nombres de tu propuesta (`AgentTask`, `ActionProposal`, `useChat`, `packages/domain`...). **No he visto tu repo**, así que los tipos son suposiciones razonables: ajusta imports y campos si algo no coincide. Cada bloque es independiente y los puedes portar uno por sesión.

# Parte 1 · Dominio y backend

## 1. `pickPrimary` y urgencia (cimientos de LiveItem)
`packages/domain/src/live.ts`. Función pura: en un mismo item gana siempre una sola actividad, y a igual prioridad la alerta más vieja.
```ts
export type LiveActivity =
  | { kind: "alert"; id: string; label: string; since: number; slaSec?: number; amount?: number }
  | { kind: "error"; id: string; label: string; at: number }
  | { kind: "pulse"; id: string; label: string }
  | { kind: "progress"; id: string; label: string; value: number; max: number; etaSec?: number }
  | { kind: "counter"; id: string; label: string; value: number }
  | { kind: "timer"; id: string; label: string; startedAt: number }
  | { kind: "queued"; id: string; position: number }
  | { kind: "stale"; id: string; lastSeen: number }
  | { kind: "done"; id: string; label: string; at: number };

export type LiveKind = LiveActivity["kind"];

const PRIORITY: Record<LiveKind, number> = {
  alert: 0, error: 1, pulse: 2, progress: 3, counter: 4, timer: 5, queued: 6, stale: 7, done: 8,
};

export function pickPrimary(list: readonly LiveActivity[]): LiveActivity | null {
  let best: LiveActivity | null = null;
  for (const a of list) {
    if (!best) { best = a; continue; }
    const d = PRIORITY[a.kind] - PRIORITY[best.kind];
    if (d < 0) best = a;
    else if (d === 0 && a.kind === "alert" && best.kind === "alert" && a.since > best.since) best = a;
  }
  return best;
}

/** soft → urgent cuando se consume la mitad del SLA. */
export function alertUrgency(a: Extract<LiveActivity, { kind: "alert" }>): "soft" | "urgent" {
  return a.slaSec && a.since > a.slaSec * 0.5 ? "urgent" : "soft";
}
```

## 2. Tests de `pickPrimary`
```ts
import { describe, it, expect } from "vitest";
import { pickPrimary, alertUrgency, type LiveActivity } from "./live";

const alert = (id: string, since: number): LiveActivity => ({ kind: "alert", id, label: "OK", since, slaSec: 1000 });
const pulse: LiveActivity = { kind: "pulse", id: "p", label: "escribiendo…" };
const prog: LiveActivity = { kind: "progress", id: "g", label: "procesando", value: 3, max: 10 };

describe("pickPrimary", () => {
  it("devuelve null si no hay actividad", () => expect(pickPrimary([])).toBeNull());
  it("la alerta gana a todo", () => expect(pickPrimary([prog, pulse, alert("a", 1)])?.id).toBe("a"));
  it("entre alertas gana la más antigua", () => expect(pickPrimary([alert("a", 10), alert("b", 500)])?.id).toBe("b"));
  it("pulse gana a progress", () => expect(pickPrimary([prog, pulse])?.id).toBe("p"));
  it("urgencia a la mitad del SLA", () => {
    expect(alertUrgency(alert("a", 400) as never)).toBe("soft");
    expect(alertUrgency(alert("a", 600) as never)).toBe("urgent");
  });
});
```

## 3. Hotfix de memorias (`category` y `tags`)
`apps/server/src/engine/routes.ts`. Valida, normaliza y rechaza el PATCH vacío.
```ts
import { z } from "zod";

export const MEMORY_CATEGORIES = ["empresa", "cliente", "proceso", "preferencia", "rrhh", "producto", "otro"] as const;

export const memoryPatchSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    source: z.string().trim().max(200).optional(),
    category: z.enum(MEMORY_CATEGORIES).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
    roleId: z.string().nullable().optional(),
  })
  .strict()
  .refine((o) => Object.keys(o).length > 0, { message: "patch vacío" })
  .transform((o) => ({
    ...o,
    tags: o.tags ? [...new Set(o.tags.map((t) => t.toLowerCase()))] : undefined,
  }));

// En el handler:
// const parsed = memoryPatchSchema.safeParse(body);
// if (!parsed.success) return reply(400, { error: parsed.error.flatten() });
// await service.updateMemory(owner, id, parsed.data);
```

## 4. Ejecución diferida con firmas, idempotente y que sobrevive a reinicios
`apps/server/src/actions-deferred.ts`. El undo vive en el servidor. `claim` es una compare-and-set: en tu BD sería `UPDATE ... WHERE status='scheduled'`.
```ts
export type DeferredStatus = "collecting" | "scheduled" | "running" | "executed" | "cancelled" | "failed";

export interface DeferredRecord {
  actionId: string; owner: string; amount?: number;
  signers: string[]; executeAt: number | null; status: DeferredStatus;
}
export interface DeferredStore {
  get(actionId: string): Promise<DeferredRecord | undefined>;
  put(r: DeferredRecord): Promise<void>;
  due(now: number): Promise<DeferredRecord[]>;
  claim(actionId: string): Promise<boolean>;                 // scheduled → running, atómico
  cancelIfOpen(actionId: string): Promise<boolean>;          // collecting|scheduled → cancelled, atómico
}
type Emit = (t: "action.deferred" | "action.cancelled" | "action.executed" | "action.failed", p: Record<string, unknown>) => void;

export class DeferredActions {
  constructor(
    private store: DeferredStore,
    private run: (owner: string, actionId: string) => Promise<void>,
    private emit: Emit,
    private cfg: { windowMs?: number; dualAt?: number | null; now?: () => number } = {},
  ) {}

  private now() { return this.cfg.now?.() ?? Date.now(); }
  private needed(amount?: number) {
    const d = this.cfg.dualAt;                                // null = sin doble firma (tenants con un solo admin)
    return d != null && amount != null && amount >= d ? 2 : 1;
  }

  async decide(owner: string, actionId: string, userId: string, amount?: number) {
    const r: DeferredRecord = (await this.store.get(actionId)) ?? {
      actionId, owner, amount, signers: [], executeAt: null, status: "collecting",
    };
    if (r.owner !== owner) throw new Error("forbidden");
    if (r.status !== "collecting") throw new Error(`estado inválido: ${r.status}`);
    if (r.signers.includes(userId)) throw new Error("ya has firmado");
    r.signers.push(userId);
    if (r.signers.length >= this.needed(r.amount)) {
      r.status = "scheduled";
      r.executeAt = this.now() + (this.cfg.windowMs ?? 8000);
    }
    await this.store.put(r);
    this.emit("action.deferred", { actionId, signers: r.signers, needed: this.needed(r.amount), executeAt: r.executeAt });
    return r;
  }

  async cancel(owner: string, actionId: string, userId: string) {
    const r = await this.store.get(actionId);
    if (!r || r.owner !== owner) throw new Error("not found");
    if (!r.signers.includes(userId)) throw new Error("solo un firmante puede cancelar");
    if (!(await this.store.cancelIfOpen(actionId))) throw new Error("ya no se puede cancelar");
    this.emit("action.cancelled", { actionId, by: userId });
  }

  /** Llamar cada 1s Y una vez al arrancar el servidor (recupera lo pendiente tras un reinicio). */
  async tick() {
    for (const r of await this.store.due(this.now())) {
      if (!(await this.store.claim(r.actionId))) continue;    // otro tick o un cancel ganó la carrera
      try {
        await this.run(r.owner, r.actionId);
        await this.store.put({ ...r, status: "executed" });
        this.emit("action.executed", { actionId: r.actionId });
      } catch (e) {
        await this.store.put({ ...r, status: "failed" });
        this.emit("action.failed", { actionId: r.actionId, error: String(e) });
      }
    }
  }
}

/** Store en memoria, para tests. En producción: tu BD. */
export class MemoryDeferredStore implements DeferredStore {
  private m = new Map<string, DeferredRecord>();
  constructor(private now: () => number = Date.now) {}
  async get(id: string) { return this.m.get(id); }
  async put(r: DeferredRecord) { this.m.set(r.actionId, { ...r }); }
  async due(now: number) { return [...this.m.values()].filter((r) => r.status === "scheduled" && (r.executeAt ?? Infinity) <= now); }
  async claim(id: string) { const r = this.m.get(id); if (r?.status !== "scheduled") return false; r.status = "running"; return true; }
  async cancelIfOpen(id: string) { const r = this.m.get(id); if (!r || (r.status !== "scheduled" && r.status !== "collecting")) return false; r.status = "cancelled"; return true; }
}
```

## 5. Test de la carrera cancelar vs ejecutar
```ts
import { describe, it, expect, vi } from "vitest";
import { DeferredActions, MemoryDeferredStore } from "./actions-deferred";

describe("DeferredActions", () => {
  const setup = (dualAt: number | null = 5000) => {
    let t = 0;
    const run = vi.fn(async () => {});
    const emit = vi.fn();
    const d = new DeferredActions(new MemoryDeferredStore(), run, emit, { now: () => t, windowMs: 8000, dualAt });
    return { d, run, emit, advance: (ms: number) => (t += ms) };
  };

  it("importe pequeño: 1 firma programa y ejecuta tras la ventana", async () => {
    const { d, run, advance } = setup();
    await d.decide("o", "a1", "alfonso", 350);
    advance(7000); await d.tick(); expect(run).not.toHaveBeenCalled();
    advance(1500); await d.tick(); expect(run).toHaveBeenCalledTimes(1);
  });
  it("importe grande exige 2 firmantes distintos", async () => {
    const { d, run, advance } = setup();
    await d.decide("o", "a2", "alfonso", 7900);
    await expect(d.decide("o", "a2", "alfonso", 7900)).rejects.toThrow("ya has firmado");
    await d.decide("o", "a2", "marta", 7900);
    advance(9000); await d.tick(); expect(run).toHaveBeenCalledTimes(1);
  });
  it("cancelar dentro de la ventana evita la ejecución", async () => {
    const { d, run, advance } = setup();
    await d.decide("o", "a3", "alfonso", 100);
    await d.cancel("o", "a3", "alfonso");
    advance(9000); await d.tick(); expect(run).not.toHaveBeenCalled();
  });
  it("tick doble no ejecuta dos veces", async () => {
    const { d, run, advance } = setup();
    await d.decide("o", "a4", "alfonso", 100); advance(9000);
    await Promise.all([d.tick(), d.tick()]); expect(run).toHaveBeenCalledTimes(1);
  });
  it("sin doble firma configurada (dualAt=null) basta una", async () => {
    const { d, run, advance } = setup(null);
    await d.decide("o", "a5", "alfonso", 99999); advance(9000); await d.tick(); expect(run).toHaveBeenCalled();
  });
});
```

## 6. Tipos y schemas de eventos nuevos
`apps/server/src/engine/events/schemas.ts`
```ts
import { z } from "zod";

export const actionDeferredSchema = z.object({
  actionId: z.string(),
  signers: z.array(z.string()),
  needed: z.number().int().min(1),
  executeAt: z.number().nullable(),
});
export const actionCancelledSchema = z.object({ actionId: z.string(), by: z.string() });
export const actionExecutedSchema = z.object({ actionId: z.string() });
export const actionFailedSchema = z.object({ actionId: z.string(), error: z.string() });

export const NEW_EVENT_SCHEMAS = {
  "action.deferred": actionDeferredSchema,
  "action.cancelled": actionCancelledSchema,
  "action.executed": actionExecutedSchema,
  "action.failed": actionFailedSchema,
} as const;

export type NewEventType = keyof typeof NEW_EVENT_SCHEMAS;
```

## 7. SSE del bus con reanudación (`Last-Event-ID`)
`apps/server/src/notifications-stream.ts` (extensión). Si el cliente se cae, recupera lo perdido en vez de quedarse desfasado.
```ts
import type { IncomingMessage, ServerResponse } from "node:http";

export interface BusEvent { id: string; type: string; owner: string; at: number; payload: unknown }

export class EventRing {
  private buf: BusEvent[] = [];
  constructor(private max = 500) {}
  push(e: BusEvent) { this.buf.push(e); if (this.buf.length > this.max) this.buf.shift(); }
  /** Si el id ya no está en el buffer devuelve todo: el cliente debe refrescar estado completo. */
  since(id?: string) {
    if (!id) return [];
    const i = this.buf.findIndex((e) => e.id === id);
    return i < 0 ? [...this.buf] : this.buf.slice(i + 1);
  }
}

export function serveEvents(
  req: IncomingMessage, res: ServerResponse, owner: string, ring: EventRing,
  subscribe: (fn: (e: BusEvent) => void) => () => void,
) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive", "X-Accel-Buffering": "no",
  });
  const send = (e: BusEvent) => {
    if (e.owner !== owner) return;                       // nunca filtrar eventos de otro tenant
    res.write(`id: ${e.id}\nevent: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);
  };
  const last = req.headers["last-event-id"];
  ring.since(Array.isArray(last) ? last[0] : last).forEach(send);
  const off = subscribe(send);
  const hb = setInterval(() => res.write(": hb\n\n"), 15_000);
  req.on("close", () => { clearInterval(hb); off(); });
}
```

## 8. ViewSpec: schema validado y resolver por intenciones cerradas
`packages/domain/src/views.ts` y `engine/views/resolver.ts`. Un LLM nunca pinta nada que no pase el schema.
```ts
import { z } from "zod";

const kpi = z.object({ label: z.string(), value: z.union([z.string(), z.number()]), delta: z.string().optional() });
const queueItem = z.object({
  id: z.string(), title: z.string(), subtitle: z.string().optional(),
  status: z.enum(["pending", "running", "done", "error"]),
  actions: z.array(z.object({ id: z.string(), label: z.string(), kind: z.enum(["primary", "default", "danger"]).default("default") })).max(3).default([]),
});

export const viewSpecSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("dashboard"), title: z.string(), kpis: z.array(kpi).max(6) }),
  z.object({ kind: z.literal("queue"), title: z.string(), items: z.array(queueItem).max(50) }),
]);
export type ViewSpec = z.infer<typeof viewSpecSchema>;

export const parseViewSpec = (raw: unknown): ViewSpec | null => {
  const r = viewSpecSchema.safeParse(raw);
  return r.success ? r.data : null;
};
```
```ts
import { parseViewSpec, type ViewSpec } from "@domain/views";

type Builder = (owner: string) => Promise<unknown>;
const INTENTS: Array<{ re: RegExp; build: Builder }> = [];

export const registerIntent = (re: RegExp, build: Builder) => INTENTS.push({ re, build });

export async function resolveView(owner: string, text: string): Promise<ViewSpec | null> {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { re, build } of INTENTS) {
    if (re.test(t)) return parseViewSpec(await build(owner));     // validado SIEMPRE
  }
  return null;                                                    // sin intención clara: el chat responde con texto
}

// Registro (ejemplo):
// registerIntent(/(que|qué)? ?(esta|está)? ?pendiente|aprobacion|necesita mi ok/, async (o) => ({
//   kind: "queue", title: "Pendiente de tu OK",
//   items: (await service.pendingActions(o)).map(a => ({ id: a.id, title: a.title, status: "pending",
//     actions: [{ id: "approve", label: "Aprobar", kind: "primary" }, { id: "reject", label: "Rechazar" }] })),
// }));
```

# Parte 2 · Frontend (React + TSX)

## 9. `useNow`: un único reloj compartido
Un solo `setInterval` para todos los timers y ETAs de la pantalla. Se apaga solo cuando nadie lo usa.
```ts
import { useSyncExternalStore } from "react";

let now = Date.now();
let timer: number | undefined;
const subs = new Set<() => void>();

function subscribe(fn: () => void) {
  subs.add(fn);
  if (subs.size === 1) {
    now = Date.now();
    timer = window.setInterval(() => { now = Date.now(); subs.forEach((f) => f()); }, 1000);
  }
  return () => {
    subs.delete(fn);
    if (subs.size === 0 && timer) { clearInterval(timer); timer = undefined; }
  };
}
export const useNow = () => useSyncExternalStore(subscribe, () => now, () => now);

export const fmtDur = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
};
```

## 10. `useReducedMotion` y `useHotkeys`
```ts
import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [r, setR] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setR(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return r;
}

type Keymap = Record<string, (e: KeyboardEvent) => void>; // "mod+k", "a", "escape"
export function useHotkeys(map: Keymap) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      const combo = [(e.metaKey || e.ctrlKey) && "mod", e.shiftKey && "shift", e.key.toLowerCase()].filter(Boolean).join("+");
      const fn = map[combo];
      if (!fn) return;
      if (typing && !combo.startsWith("mod")) return;      // no robar teclas mientras escribes
      e.preventDefault(); fn(e);
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [map]);
}
```

## 11. Shell de 3 columnas plegables (`AppShell.tsx` y `usePanel`)
Animación con `grid-template-columns` (sin reflow) y `inert` en el panel cerrado.
```tsx
import { useCallback, useState, type ReactNode } from "react";

export function usePanel(key: string, initial: boolean) {
  const [open, setOpen] = useState<boolean>(() => {
    try { const v = localStorage.getItem(key); return v === null ? initial : v === "1"; } catch { return initial; }
  });
  const set = useCallback((v: boolean | ((p: boolean) => boolean)) => {
    setOpen((p) => {
      const n = typeof v === "function" ? v(p) : v;
      try { localStorage.setItem(key, n ? "1" : "0"); } catch { /* storage bloqueado */ }
      return n;
    });
  }, [key]);
  return [open, set] as const;
}

export function AppShell({ sidebar, children, panel }: { sidebar: ReactNode; children: ReactNode; panel?: ReactNode }) {
  const [left, setLeft] = usePanel("ui.left", true);
  const [right, setRight] = usePanel("ui.right", false);   // hueco cerrado por defecto
  return (
    <div className="shell" data-left={left} data-right={right && !!panel}>
      <aside className="shell__left" inert={!left}>{sidebar}</aside>
      <main className="shell__main">
        <button aria-expanded={left} onClick={() => setLeft((v) => !v)}>☰</button>
        {panel && <button aria-expanded={right} onClick={() => setRight((v) => !v)}>▤</button>}
        {children}
      </main>
      {panel && <aside className="shell__right" inert={!right}>{panel}</aside>}
    </div>
  );
}
```
```css
.shell { display: grid; height: 100vh; grid-template-columns: 0 1fr 0; transition: grid-template-columns .28s cubic-bezier(.22,1,.36,1); }
.shell[data-left="true"] { grid-template-columns: 260px 1fr 0; }
.shell[data-right="true"] { grid-template-columns: 0 1fr 340px; }
.shell[data-left="true"][data-right="true"] { grid-template-columns: 260px 1fr 340px; }
.shell__left, .shell__right { overflow: hidden; min-width: 0; }
@media (prefers-reduced-motion: reduce) { .shell { transition: none; } }
```

## 12. Typewriter adaptativo (`useTypewriter`)
Consume lo que ya llegó por SSE sin inventar ritmo: cuanto más atraso, más rápido. Se usa **uno por mensaje** (con `key={message.id}`).
```tsx
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./hooks";

export function useTypewriter(target: string, streamDone: boolean) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const r = useRef({ shown: 0, target, done: streamDone, acc: 0 });
  r.current.target = target;
  r.current.done = streamDone;

  useEffect(() => {
    if (reduced) return;
    let raf = 0, last = performance.now();
    const loop = (t: number) => {
      const s = r.current;
      const dt = (t - last) / 1000; last = t;
      if (s.target.length < s.shown) { s.shown = 0; s.acc = 0; }          // el texto se reinició
      const backlog = s.target.length - s.shown;
      if (backlog > 0) {
        s.acc += dt * Math.min(600, 40 + backlog * 6);                    // 40–600 chars/s según atraso
        const n = Math.floor(s.acc);
        if (n) { s.acc -= n; s.shown = Math.min(s.target.length, s.shown + n); setShown(s.shown); }
      }
      if (s.done && s.shown >= s.target.length) return;                   // fin: deja de pedir frames
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  if (reduced) return { text: target, typing: !streamDone };
  return { text: target.slice(0, shown), typing: !streamDone || shown < target.length };
}
```
```tsx
export function AgentText({ text, done }: { text: string; done: boolean }) {
  const { text: shown, typing } = useTypewriter(text, done);
  return <p className={typing ? "stream-cursor" : undefined}>{shown}</p>;
}
```
```css
.stream-cursor::after { content: "▍"; color: var(--ac); animation: bl 1s steps(2) infinite; }
@keyframes bl { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .stream-cursor::after { animation: none; } }
```

## 13. Tool calls agrupados por turno (reducer y componente)
Sustituye el `activeTool` único por una lista `tools`.
```ts
export type ToolCall = { id: string; name: string; status: "running" | "done" | "error"; startedAt: number; endedAt?: number };

export type ToolsAction =
  | { type: "RUN_STARTED" }
  | { type: "TOOL_CALL_START"; id: string; name: string; at: number }
  | { type: "TOOL_CALL_END"; id: string; at: number; error?: boolean };

export function toolsReducer(state: ToolCall[], a: ToolsAction): ToolCall[] {
  switch (a.type) {
    case "RUN_STARTED": return [];                                       // un turno nuevo, lista nueva
    case "TOOL_CALL_START":
      return state.some((t) => t.id === a.id) ? state
        : [...state, { id: a.id, name: a.name, status: "running", startedAt: a.at }];
    case "TOOL_CALL_END":
      return state.map((t) => t.id === a.id ? { ...t, status: a.error ? "error" : "done", endedAt: a.at } : t);
  }
}
```
```tsx
import { fmtDur, useNow } from "./useNow";

export function ToolCallsGroup({ tools }: { tools: ToolCall[] }) {
  const running = tools.some((t) => t.status === "running");
  const now = useNow();
  if (!tools.length) return null;
  const t0 = Math.min(...tools.map((t) => t.startedAt));
  const t1 = running ? now : Math.max(...tools.map((t) => t.endedAt ?? t.startedAt));
  return (
    <details className="steps" open={running}>
      <summary>
        <span aria-hidden>{running ? "◐" : tools.some((t) => t.status === "error") ? "!" : "✓"}</span>{" "}
        {tools.length} {tools.length === 1 ? "paso" : "pasos"} · {fmtDur((t1 - t0) / 1000)}
      </summary>
      <ul>
        {tools.map((t) => (
          <li key={t.id} data-status={t.status}>
            {t.name}
            <span>{t.status === "running" ? "…" : fmtDur(((t.endedAt ?? now) - t.startedAt) / 1000)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
```

## 14. Eventos del bus → actividades vivas (`useLiveActivity`)
Reducer puro (testeable) y un hook con SSE y fallback a polling con backoff que se pausa con la pestaña oculta.
```ts
import { useEffect, useReducer, useRef } from "react";
import type { LiveActivity } from "@domain/live";

export interface BusEvent { id: string; type: string; at: number; payload: any }
type State = Map<string, LiveActivity>;

export function applyEvent(prev: State, ev: BusEvent): State {
  const m = new Map(prev);
  const p = ev.payload ?? {};
  switch (ev.type) {
    case "sop.step_started":
      m.set(p.taskId, { kind: "progress", id: p.taskId, label: p.stepTitle ?? "procesando", value: p.index ?? 0, max: p.total ?? 1 }); break;
    case "task.status_changed":
      if (p.status === "running") m.set(p.taskId, { kind: "timer", id: p.taskId, label: "corriendo", startedAt: ev.at });
      if (p.status === "failed") m.set(p.taskId, { kind: "error", id: p.taskId, label: p.title ?? "Falló", at: ev.at });
      break;
    case "task.completed": m.set(p.taskId, { kind: "done", id: p.taskId, label: "Completado", at: ev.at }); break;
    case "action.deferred":
      if (p.executeAt == null) m.set(p.actionId, { kind: "alert", id: p.actionId, label: `Firma ${p.signers.length}/${p.needed}`, since: 0 });
      else m.delete(p.actionId); break;
    case "action.executed": case "action.cancelled": m.delete(p.actionId); break;
  }
  return m;
}

export function useLiveActivity(opts: { streamUrl?: string; poll: (sinceId?: string) => Promise<BusEvent[]>; pollMs?: number }) {
  const [state, dispatch] = useReducer(applyEvent, new Map() as State);
  const lastId = useRef<string>();
  const optsRef = useRef(opts); optsRef.current = opts;

  useEffect(() => {
    let stop = false, es: EventSource | undefined, tm: number | undefined, wait = optsRef.current.pollMs ?? 5000;
    const feed = (e: BusEvent) => { lastId.current = e.id; dispatch(e); };

    const startPolling = () => {
      const tick = async () => {
        if (stop) return;
        if (document.hidden) { tm = window.setTimeout(tick, 2000); return; }       // pausa en segundo plano
        try {
          (await optsRef.current.poll(lastId.current)).forEach(feed);
          wait = optsRef.current.pollMs ?? 5000;
        } catch { wait = Math.min(wait * 2, 30_000); }                              // backoff si falla
        tm = window.setTimeout(tick, wait);
      };
      tick();
    };

    if (opts.streamUrl && "EventSource" in window) {
      es = new EventSource(opts.streamUrl);                                         // reanuda con Last-Event-ID solo
      es.onmessage = (m) => feed(JSON.parse(m.data));
      es.onerror = () => { es?.close(); es = undefined; if (!stop && !tm) startPolling(); };
    } else startPolling();

    return () => { stop = true; es?.close(); clearTimeout(tm); };
  }, [opts.streamUrl]);

  return state;
}
```

## 15. `LiveItem` con franja fija de 18px, alerta con urgencia y sin saltos
```tsx
import { alertUrgency, type LiveActivity } from "@domain/live";
import { fmtDur, useNow } from "./useNow";

export function LiveItem({ title, subtitle, active, live, onClick }: {
  title: string; subtitle?: string; active?: boolean; live: LiveActivity | null; onClick?: () => void;
}) {
  const now = useNow();
  const urgent = live?.kind === "alert" && alertUrgency(live) === "urgent";
  return (
    <button
      className="li" data-active={active} data-kind={live?.kind ?? "idle"} data-urgent={urgent || undefined}
      onClick={onClick} aria-label={`${title}${live && "label" in live ? `, ${live.label}` : ""}`}
    >
      <span className="li__title">{title}</span>
      <span className="li__strip">
        {!live && subtitle}
        {live?.kind === "counter" && <><i className="dot" />{live.label} · <b className="v">{live.value.toLocaleString("es-ES")}</b></>}
        {live?.kind === "progress" && <>
          {live.label}
          <span className="bar" role="progressbar" aria-valuenow={live.value} aria-valuemax={live.max}>
            <i style={{ width: `${(live.value / live.max) * 100}%` }} />
          </span>
          <b className="v">{Math.round((live.value / live.max) * 100)}%</b>
          {live.etaSec != null && <> · ~{fmtDur(live.etaSec)}</>}
        </>}
        {live?.kind === "pulse" && <><i className="dot dot--pulse" />{live.label}</>}
        {live?.kind === "timer" && <>⏱ {live.label} <b className="v">{fmtDur((now - live.startedAt) / 1000)}</b></>}
        {live?.kind === "alert" && <><span className="warn">!</span><b className="w">{live.label}</b></>}
        {live?.kind === "error" && <b className="e">Falló · {live.label}</b>}
        {live?.kind === "queued" && <>En cola · {live.position}º</>}
        {live?.kind === "stale" && <>Sin datos hace {fmtDur((now - live.lastSeen) / 1000)}</>}
        {live?.kind === "done" && <>✓ {live.label}</>}
      </span>
    </button>
  );
}
```
```css
.li { display:flex; flex-direction:column; gap:4px; width:100%; text-align:left; padding:10px 12px; border-radius:12px;
      border:1px solid transparent; border-left:2px solid transparent; background:transparent; font:inherit; color:inherit; cursor:pointer; }
.li__strip { height:18px; display:flex; align-items:center; gap:6px; overflow:hidden; font-size:11px; color:var(--mute); }
.li[data-kind="alert"]  { border-left-color:var(--warn); background:linear-gradient(90deg,rgba(255,140,50,.09),transparent); }
.li[data-urgent]        { background:linear-gradient(90deg,rgba(255,90,30,.18),rgba(255,90,30,.05)); }
.li[data-kind="error"]  { border-left-color:var(--err); }
.li[data-kind="stale"]  { opacity:.6; }
.v { font-variant-numeric:tabular-nums; color:var(--ac); }
```

## 16. Lista que reordena con animación (`useFlip`)
Para que al cambiar la prioridad los items no salten.
```tsx
import { useLayoutEffect, useRef } from "react";

export function useFlip<T extends HTMLElement>(order: string[]) {
  const ref = useRef<T>(null);
  const prev = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.querySelectorAll<HTMLElement>("[data-flip]").forEach((n) => {
      const k = n.dataset.flip!, top = n.getBoundingClientRect().top, old = prev.current.get(k);
      if (old !== undefined && !reduced && old !== top)
        n.animate([{ transform: `translateY(${old - top}px)` }, { transform: "none" }], { duration: 220, easing: "cubic-bezier(.22,1,.36,1)" });
      prev.current.set(k, top);
    });
  }, [order.join("|")]);
  return ref;
}

// Uso:
// const ref = useFlip<HTMLDivElement>(items.map(i => i.id));
// <div ref={ref}>{items.map(i => <div key={i.id} data-flip={i.id}><LiveItem .../></div>)}</div>
```

## 17. `TaskTimeline` (plan paso a paso)
```tsx
export type TaskStep = { id: string; title: string; status: "pending" | "running" | "done" | "error"; durationMs?: number };
const ICON = { pending: "○", running: "◉", done: "✓", error: "×" } as const;

export function TaskTimeline({ plan }: { plan: TaskStep[] }) {
  return (
    <ol className="tl" aria-label="Plan de la tarea">
      {plan.map((s) => (
        <li key={s.id} className="tl__step" data-status={s.status} aria-current={s.status === "running" ? "step" : undefined}>
          <span className="tl__dot" aria-hidden>{ICON[s.status]}</span>
          <div>
            <b>{s.title}</b>
            {s.durationMs != null && <small>{(s.durationMs / 1000).toFixed(1)}s</small>}
          </div>
        </li>
      ))}
    </ol>
  );
}
```
```css
.tl { list-style:none; margin:0; padding:0; }
.tl__step { position:relative; display:flex; gap:12px; padding:0 0 18px; color:var(--mute); }
.tl__step::after { content:""; position:absolute; left:10px; top:24px; bottom:0; width:2px; background:var(--line); }
.tl__step:last-child::after { display:none; }
.tl__dot { width:22px; height:22px; border-radius:99px; border:2px solid var(--line); background:var(--card); display:grid; place-items:center; font-size:11px; flex:none; }
.tl__step[data-status="done"] { color:var(--text); } .tl__step[data-status="done"] .tl__dot { background:var(--ok); border-color:var(--ok); color:#fff; }
.tl__step[data-status="running"] { color:var(--text); } .tl__step[data-status="running"] .tl__dot { border-color:var(--warn); animation:ring 1.8s infinite; }
.tl__step[data-status="error"] .tl__dot { background:var(--err); border-color:var(--err); color:#fff; }
@keyframes ring { 50% { box-shadow:0 0 0 5px rgba(255,107,44,.18); } }
@media (prefers-reduced-motion: reduce) { .tl__dot { animation:none !important; } }
```

## 18. Inbox de aprobaciones con cuenta atrás **dirigida por el servidor**
El cliente solo pinta. `executeAt` viene del servidor, así que sobrevive a refrescos y al cambio de dispositivo.
```tsx
import { fmtDur, useNow } from "./useNow";

export type Approval = {
  id: string; title: string; amount?: number; requestedBy: string; requestedAt: number;
  signers: string[]; needed: number; executeAt: number | null; lockedReason?: string;
};

const CONFIRM_FROM = 5000;

export function ApprovalItem({ a, me, onApprove, onReject, onCancel }: {
  a: Approval; me: string;
  onApprove: (id: string) => Promise<void>; onReject: (id: string) => Promise<void>; onCancel: (id: string) => Promise<void>;
}) {
  const now = useNow();
  const [confirming, setConfirming] = React.useState(false);
  const left = a.executeAt ? Math.max(0, Math.ceil((a.executeAt - now) / 1000)) : null;
  const iSigned = a.signers.includes(me);

  return (
    <article className="ap" data-state={left !== null ? "scheduled" : "pending"} aria-live="polite">
      <header><b>{a.title}</b>{a.amount != null && <span className="chip">{a.amount.toLocaleString("es-ES")}€</span>}</header>
      <small>Pedido por {a.requestedBy} · hace {fmtDur((now - a.requestedAt) / 1000)}{a.needed > 1 && ` · firmas ${a.signers.length}/${a.needed}`}</small>

      {left !== null ? (
        <p>Se ejecutará en <b>{left}s</b> {iSigned && <button className="btn" onClick={() => onCancel(a.id)}>Deshacer</button>}</p>
      ) : a.lockedReason ? (
        <p><button className="btn" disabled>Aprobar</button> <small>🔒 {a.lockedReason}</small></p>
      ) : iSigned ? (
        <p><small>Has firmado. Falta otra persona.</small></p>
      ) : confirming ? (
        <p>¿Aprobar {a.amount?.toLocaleString("es-ES")}€? <button className="btn p" onClick={() => onApprove(a.id)}>Confirmar</button> <button className="btn" onClick={() => setConfirming(false)}>Cancelar</button></p>
      ) : (
        <p>
          <button className="btn p" onClick={() => ((a.amount ?? 0) >= CONFIRM_FROM ? setConfirming(true) : onApprove(a.id))}>Aprobar</button>{" "}
          <button className="btn" onClick={() => onReject(a.id)}>Rechazar</button>
        </p>
      )}
    </article>
  );
}
```

## 19. Actualización optimista con rollback
```ts
/** apply() aplica el cambio local y devuelve cómo deshacerlo. */
export async function optimistic<T>(
  apply: () => () => void,
  request: () => Promise<T>,
  onFail?: (e: unknown) => void,
): Promise<T | undefined> {
  const rollback = apply();
  try { return await request(); }
  catch (e) { rollback(); onFail?.(e); return undefined; }
}

// Uso en el kanban de tareas:
// await optimistic(
//   () => { const prev = tasks; setTasks(move(tasks, id, "doing")); return () => setTasks(prev); },
//   () => api.post(`/api/agent/tasks/${id}/control`, { status: "doing" }),
//   () => toast("No se pudo mover · revertido"),
// );
```

## 20. `ViewRenderer` exhaustivo y tolerante a specs inválidos
Si añades un `kind` al schema y olvidas el componente, **no compila**.
```tsx
import { parseViewSpec, type ViewSpec } from "@domain/views";

const assertNever = (x: never): never => { throw new Error(`kind sin renderer: ${JSON.stringify(x)}`); };

export function ViewRenderer({ spec: raw, onAction }: { spec: unknown; onAction?: (viewItemId: string, actionId: string) => void }) {
  const spec = parseViewSpec(raw);
  if (!spec) return <div className="card" role="alert">No he podido mostrar esta vista.</div>;
  return <Render spec={spec} onAction={onAction} />;
}

function Render({ spec, onAction }: { spec: ViewSpec; onAction?: (id: string, a: string) => void }) {
  switch (spec.kind) {
    case "dashboard":
      return (
        <section>
          <h3>{spec.title}</h3>
          <div className="kpis">
            {spec.kpis.map((k) => (
              <div className="card" key={k.label}><small>{k.label}</small><div className="v">{k.value}</div>{k.delta && <span className="chip">{k.delta}</span>}</div>
            ))}
          </div>
        </section>
      );
    case "queue":
      return (
        <section>
          <h3>{spec.title}</h3>
          {spec.items.map((i) => (
            <div className="card" key={i.id} data-status={i.status}>
              <b>{i.title}</b>{i.subtitle && <small> · {i.subtitle}</small>}
              <div>{i.actions.map((a) => <button key={a.id} className={`btn ${a.kind === "primary" ? "p" : ""}`} onClick={() => onAction?.(i.id, a.id)}>{a.label}</button>)}</div>
            </div>
          ))}
        </section>
      );
    default:
      return assertNever(spec);
  }
}
```

## 21. Agrupar memorias, filtrar y detectar duplicados
```ts
export type Memory = { id: string; text: string; category: string; tags: string[]; roleId?: string | null };

export function groupMemories(list: Memory[], roleName: (id: string) => string, filter: { q?: string; category?: string; roleId?: string }) {
  const q = filter.q?.toLowerCase().trim();
  const out = new Map<string, Memory[]>();
  for (const m of list) {
    if (filter.category && m.category !== filter.category) continue;
    if (filter.roleId && m.roleId !== filter.roleId) continue;
    if (q && !(m.text.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q)))) continue;
    const key = m.roleId ? `Rol: ${roleName(m.roleId)}` : m.category;
    (out.get(key) ?? out.set(key, []).get(key)!).push(m);
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

const tok = (s: string) => new Set(s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{3,}/g) ?? []);

export function similarity(a: string, b: string) {
  const A = tok(a), B = tok(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / (A.size + B.size - inter || 1);
}

export function findDuplicate(text: string, list: Memory[], threshold = 0.4) {
  let best: { m: Memory; score: number } | null = null;
  for (const m of list) {
    const score = similarity(text, m.text);
    if (score >= threshold && (!best || score > best.score)) best = { m, score };
  }
  return best;
}
```

## 22. Divisor de día para el chat (`Intl`, sin librerías)
```ts
const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function dayLabel(ts: number, now = new Date()): string {
  const d = new Date(ts);
  const diff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
                           new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 864e5);
  if (diff <= 1 && diff >= 0) return rtf.format(-diff, "day").replace(/^./, (c) => c.toUpperCase()); // Hoy / Ayer
  if (diff < 7 && diff > 0) return new Intl.DateTimeFormat("es", { weekday: "long" }).format(d).replace(/^./, (c) => c.toUpperCase());
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" }).format(d);
}

/** Inserta separadores solo cuando cambia el día. */
export function withDividers<T extends { createdAt: number }>(msgs: T[]) {
  const out: Array<{ divider: string } | T> = [];
  let last = "";
  for (const m of msgs) {
    const k = dayKey(new Date(m.createdAt));
    if (k !== last) { out.push({ divider: dayLabel(m.createdAt) }); last = k; }
    out.push(m);
  }
  return out;
}
```

## Orden para portarlos
1. **Bloques 3 y 1-2** (hotfix + tests de `pickPrimary`): bajo riesgo y sin UI.
2. **9, 10 y 11** (reloj, hooks, shell).
3. **17** (timeline) y **12-13** (chat).
4. **6, 7, 14, 15 y 16** (eventos en vivo y LiveItem).
5. **4, 5 y 18** (aprobaciones): el más delicado, hazlo con los tests del bloque 5 en verde antes de tocar UI.
6. **8 y 20** (ViewSpec), **21 y 22** (pulido).

Si quieres otra tanda, dime cuál y la hago igual de profunda: **tests de `applyEvent` y de `toolsReducer`**, el **tablero Kanban con `useOptimistic`**, la **UI de merge de entidades duplicadas** o el **log de auditoría con export a CSV** en TSX.

