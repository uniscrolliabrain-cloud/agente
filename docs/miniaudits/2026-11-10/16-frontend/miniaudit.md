# Bloque 16 · Frontend

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 3 · S2 6 · S3 4)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | El token vive en `localStorage`. | Sin verificar |
| 2 | S1 | El rol que decide `isAdmin` sale de `agente_user` en `localStorage`. | Sin verificar |
| 3 | S1 | No hay router: la vista es un `useState`, sin URL, historial ni atrás. | Sin verificar |
| 4 | S2 | `useTasks(3000)`: sondeo fijo, sin pausa por pestaña oculta ni backoff. | Sin verificar |
| 5 | S2 | El SSE toma la sesión de `localStorage` y la pasa por URL: `EventSource` no admite cabeceras. | Sin verificar |
| 6 | S2 | Cualquier 401 limpia la sesión completa, incluido un fallo de una tool. | Sin verificar |
| 7 | S2 | Cinco booleanos de modal independientes: dos pueden abrirse a la vez. | Sin verificar |
| 8 | S2 | `ProfileModal` escribe `localStorage` a mano y no actualiza `useAuth`. | Sin verificar |
| 9 | S2 | Sin `React.lazy` en `App.tsx`: 35 páginas y 7 templates en el primer render. | Sin verificar |
| 10 | S3 | `WORKSPACE_VIEW_BY_ROLE` se exporta y no se consume. | Sin verificar |
| 11 | S3 | El tema se lee en el inicializador de `useState`. | Sin verificar |
| 12 | S3 | La vista "agents" es un placeholder en producción. | Sin verificar |
| 13 | S3 | Sin paginación ni virtualización: las listas reciben el array completo. | Sin verificar |

## Arreglos propuestos

1. **Token fuera de `localStorage`**: cookie `httpOnly` + `SameSite`, o al menos almacenamiento en memoria con refresh; hoy un XSS se lleva la sesión.
2. **El rol no se lee del cliente**: `isAdmin` debe venir del `/api/auth/me`, no de un objeto que el usuario puede editar.
3. **URL de verdad**: router con rutas por workspace/vista; sin eso no hay enlaces, ni atrás, ni recarga estable.
4. **Sondeo con pausa** (`visibilitychange`) y backoff; hoy 3 s fijos por pestaña abierta.
5. **SSE con cookie** o ticket de un solo uso, no token en query string (queda en logs e historial).

## Plan

- **P1 (sesión)**: token y rol del servidor; 401 sin borrar sesión por un fallo de tool.
- **P2 (navegación)**: router y estado de vista en URL.
- **P3 (rendimiento)**: `lazy` por página, virtualización, sondeo con pausa.

---

## Revisión de destino

El cliente opera desde el navegador; la sesión y la navegación son parte del producto, no del andamiaje:

- Token fuera de `localStorage` y `isAdmin` desde el servidor.
- Router con URL por workspace/vista (deep link, atrás, recarga).
- Sondeo con pausa y SSE sin token en query.

## Conclusión

Hoy la UI no puede enlazarse, no soporta recarga y confía en datos que el usuario puede editar. **P1**: no impide el piloto, pero sí una demo con dos usuarios.
