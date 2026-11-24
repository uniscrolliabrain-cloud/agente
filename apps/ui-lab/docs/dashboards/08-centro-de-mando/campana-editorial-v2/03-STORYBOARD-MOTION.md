# Storyboard y movimiento (C04)

## Entrada en tres tiempos

| Tiempo | Elemento | Disparador | Propiedad | Duración | Easing | Retardo |
|---|---|---|---|---|---|---|
| 1 · identidad | `.cce-hero` | montaje | `opacity` + `translateY(10px → 0)` | 520 ms | `cubic-bezier(.22,1,.36,1)` | 0 |
| 2 · briefing | `.cce-briefing` | montaje | igual | 540 ms | idem | 70 ms |
| 3 · actividad | secciones y paneles | montaje | igual | 540 ms | idem | 130/190/240/280 ms |

La cascada agrupa **secciones**, nunca filas ni letras: máximo 5 grupos y 280 ms acumulados.

## Reglas

- **Sin replay en polling**: las animaciones viven en el montaje del nodo; una actualización de
  datos re-renderiza el mismo DOM y no reinicia `animation`. Verificado con el botón «Actualizar»:
  `getAnimations()` del hero queda en estado `finished`, nunca `running`.
- **Selección con continuidad**: la línea de la cifra activa se dibuja con `transform: scaleX`
  (240 ms); las píldoras cambian con transición de 160 ms. La selección no desmonta la sección.
- **Hoja móvil**: entrada `cce-sheet-in` 280 ms con backdrop `cce-fade` 180 ms; salida inmediata al
  cerrar (no se bloquea la interacción mientras se anima).
- **Feedback**: botones 120–160 ms; nunca retrasan el clic.
- **Números sin contar**: no se animan cifras; los valores se leen de golpe, como en la vista real.
- **Reduced motion**: `prefers-reduced-motion: reduce` deja `animation-duration: 0.01ms`, elimina
  retardos y conserva contenido y feedback. Verificado: duraciones `0.01ms` y saludo con
  `opacity: 1`.
- **Sin parallax, sin scroll-jacking, sin animaciones infinitas** (solo el spinner de actualización,
  que se anula con reduced motion).
- Solo se animan `opacity` y `transform`: no hay animación de altura ni de layout, por lo que no se
  introduce CLS.

## Storyboard por recorrido

| Recorrido | Secuencia |
|---|---|
| Llegada | hero → briefing → cifras → atención (cascada de grupos) |
| Revisar decisión | tarjeta → «Revisar y aprobar» (flujo existente) → vuelta al mismo punto con el filtro intacto |
| Consultar avance | filtro «En marcha» → tarjetas de ejecución → «Ver tarea» |
| Abrir resultado | sección OS → «Ver prueba» |
| Detalle operativo en móvil | bloque → hoja (foco al cierre) → Escape → foco de vuelta al bloque |
| Volver de otra superficie | el filtro y la posición se mantienen; no hay reset de scroll |
