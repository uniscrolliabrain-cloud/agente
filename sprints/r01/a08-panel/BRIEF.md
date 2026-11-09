# A08 · Panel (interfaz)

**Carril:** C8 · **Rama:** `sprint/r01-a08-panel` · **Superficie:** `sprints/r01/a08-panel/`, `apps/web/src/components/`

## Estado medido sobre `0c8fe81`

- 31 componentes `.tsx`, 43 ficheros con `fetch(` o `/api/`.
- Vistas con nombre de producto: `ControlCenterView`, `TasksView`, `ProjectsView`, `DocumentsView`, `MemoryView`, `UsersView`, `WhatsAppView`.
- `apps/server/src/app.ts` registra **68** rutas. El panel no tiene tests.
- El CI compila el panel (`pnpm --filter @agente/web exec tsc --noEmit`) pero **no comprueba que llame a endpoints existentes**.

## El riesgo concreto

Un panel puede estar entero en verde de tipos y tener la mitad de los botones apuntando a rutas que no existen, o a rutas que existen pero exigen un scope que el panel no manda. Eso no lo detecta `tsc` y no lo detecta ningún audit.

## Preguntas

1. Por cada vista: ¿a qué endpoints llama, con qué método y qué muestra si el endpoint devuelve `401`/`403`/`409`?
2. ¿Cuántos `fetch` apuntan a rutas que **no** están en `app.ts`? (script, no vista a vista)
3. ¿Hay botones que no hacen nada, o que hacen `console.log`?
4. ¿Las vistas de admin (`UsersView`, `ControlCenterView`) respetan el tenant activo o muestran datos de otro?
5. ¿`WhatsAppView` refleja el estado real (`awaiting_review`, `outcome_unknown`, `requiresReconciliation`)? Si no los muestra, el operador va a reintentar lo que no debe.

## Entregable del sprint

`sprints/r01/a08-panel/cruce-vistas-endpoints.md` con la tabla vista → endpoint → existe en `app.ts` → código de error que maneja. Y un script `check-endpoints.mjs` en tu superficie que extraiga los `fetch` y falle si alguno no casa con una ruta registrada. **No reescribas vistas**: R8 es cuando se construyen.

## Gate

```bash
node sprints/r01/a08-panel/check-endpoints.mjs
node --import tsx --test --test-timeout=30000 sprints/r01/a08-panel/*.test.ts
```

## Trampa

Arreglar el panel "de paso". Este sprint es diagnóstico: el valor es la lista de rutas huérfanas, no un rediseño. Si tocas un componente para que compile con tu tabla, dilo en el reporte con el diff.
