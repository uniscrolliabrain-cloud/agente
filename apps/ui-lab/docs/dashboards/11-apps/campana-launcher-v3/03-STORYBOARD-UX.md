# Storyboard UX (C02)

## Modelo de superficies

```
reposo ──(clic / Intro / deslizar)──► escritorio ──(dock)──► cajón
   ▲                                      │  ▲                 │
   │                                      │  └──(icono)────────┘
   │                                      ├──► carpeta ──(icono)──┐
   │                                      ├──► recientes ──(tarjeta)┤
   └────────────(bloquear)───────────────┴──► aplicación ◄─────────┘
```

Estados mutuamente excluyentes (`rest | home | drawer | recents | app`), más una capa de carpeta que
se superpone al escritorio. No hay scroll-jacking ni navegación por historial: el launcher es una
superficie única con estados.

## Recorridos

### 1 · Llegada

1. Reposo: reloj, fecha, briefing, tres notificaciones y accesos.
2. El usuario pulsa «Entrar al escritorio», toca la superficie o desliza hacia arriba.
3. El reposo se funde; el escritorio entra con saludo, favoritas en cascada (40–190 ms) y widgets.

### 2 · Abrir una aplicación

1. El icono recibe hover (ratón) o foco (teclado) y revela su nombre.
2. Clic o Enter: se calcula el centro del icono y se guarda como origen.
3. La superficie de la app se expande desde ese punto (`transform-origin`) en 420 ms.
4. La app queda en recientes; al cerrar, el foco vuelve al mismo icono y el launcher conserva la
   selección de pantalla.

### 3 · Selección táctil

1. Primer toque: el icono se eleva 2 px, recibe anillo violeta y muestra su nombre.
2. Segundo toque sobre el mismo: abre la app.
3. Toque en otro icono: mueve la selección.
4. Toque en espacio vacío: cancela.

### 4 · Cajón y búsqueda

1. Dock → cajón con 35 apps agrupadas y foco en el buscador.
2. Al escribir se filtra en el momento (nombre, descripción y categoría, sin acentos).
3. Sin resultados: mensaje y acción para limpiar.
4. Escape o chevrón: vuelve al escritorio.

### 5 · Carpeta

1. El escritorio muestra tres carpetas con sus miniaturas.
2. Al abrir: diálogo centrado con nombre, recuento, cuatro iconos y foco en «Cerrar».
3. Clic en icono abre la app; Escape o clic en el fondo cierra.

### 6 · Recientes

1. Tarjetas con icono, nombre y descripción de las apps abiertas (máx. 6, deduplicadas).
2. Recuperar una app la abre de nuevo y la sube al principio.
3. «Cerrar todo» vacía la lista; «Volver al escritorio» regresa.

### 7 · Multitarea

- Desde una app: «Recientes» abre la pila, «Escritorio» sale sin cerrar el contexto.
- La app abierta conserva su sitio en recientes.

## Reglas de contenido

- Nombres visibles aprobados; identificadores técnicos solo en el catálogo y en `aria-label`/claves.
- Sin nombres de terceros en la interfaz: las apps son herramientas de la empresa.
- Cada app declara su categoría y una descripción breve con la voz de la marca.
- Los widgets muestran datos sintéticos plausibles, nunca actividad presentada como real.
- Las superficies de app se etiquetan «Demostración» y explican que el workspace real conserva su
  interfaz.

## Estados no ideales

| Estado | Comportamiento |
|---|---|
| Sin recientes | Mensaje y acceso al escritorio |
| Búsqueda vacía | Rejilla completa con contador |
| Búsqueda sin coincidencias | Mensaje con acción para limpiar |
| Sin favoritas | El escritorio cae en la rejilla completa del cajón (acceso siempre disponible) |
| App no disponible | No aplica: las 35 están en el catálogo y todas abren su demostración |
| Reduced motion | Sin cascadas ni desplazamientos; contenido y feedback intactos |
