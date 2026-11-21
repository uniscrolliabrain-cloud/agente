# 04 — Menú y dashboards hiperpersonalizados mediante UX programada

## Objetivo
La UI se adapta al uso de cada persona y a su función en la empresa sin aleatoriedad. La adaptación es una **capacidad codificada dentro de los componentes**: sidebar, topbar, workspaces, tabs, widgets, filtros, paneles y chat transversal. El runtime puede solicitar disposiciones permitidas, pero no inventar layouts o reglas nuevas.

## Capas de disposición
1. **Catálogo global de workspaces**: identificadores y capacidades disponibles.
2. **Tenant y política**: features habilitadas, organización, roles, invitaciones, accesos, visibilidad.
3. **Rol/persona**: defaults útiles para owner, manager, empleado, invitado, proveedor o agente autorizado.
4. **Preferencias explícitas del usuario**: pin, ocultar (si permitido), ordenar manualmente, favoritos, densidad, modo compacto.
5. **Señales de uso**: frecuencia reciente, recurrencia, último uso, tareas actuales, contexto activo; no confundir con autoridad.
6. **Contexto temporal**: en un flujo concreto, el runtime puede sugerir o abrir un workspace permitido.
7. **Restricciones de dispositivo**: móvil, tablet, escritorio, accesibilidad.

## Orden determinista propuesto
Orden de precedencia: elementos de seguridad/obligatorios > pins manuales > orden manual explícito > grupos por rol > score adaptativo > orden estable del catálogo. Nunca mover un item mientras el usuario intenta pulsarlo; aplicar cambios en momentos predecibles (nueva sesión, apertura del menú, acción explícita), con opción de fijar/revertir.

```ts
type UsageSignal = {
  tenantId: string; actorId: string; workspaceId: string;
  event: 'opened'|'used'|'completed'; occurredAt: string;
};
type MenuPreferences = {
  pinnedIds: string[]; manualOrder?: string[];
  hiddenIds?: string[]; adaptiveOrderEnabled: boolean;
};
function scoreMenuItem(input: {
  frequency7d: number; frequency30d: number;
  recency: number; roleAffinity: number; taskRelevance: number;
}) {
  return 0.30*input.frequency7d + 0.15*input.frequency30d +
    0.15*input.recency + 0.20*input.roleAffinity +
    0.20*input.taskRelevance;
}
```
Pesos **ilustrativos**, no decisión de producción: definir normalización, desempate estable por ID, umbrales/histéresis y tests antes de activar. No aprender de cada click de forma que produzca un menú nervioso.

## Capacidades concretas
- Sidebar: pins, favoritos, reordenar, recientes, frecuentes, secciones, búsqueda, mostrar más, reset.
- Dashboard: widgets permitidos, orden/visibilidad, layouts predefinidos, preferencias individuales y vistas compartidas cuando el rol lo permita.
- Workspaces: pestaña recordada, filtros, densidad de tabla, columnas visibles, ordenación, vistas guardadas.
- Chat: abierto/cerrado, bottom sheet móvil, tamaño/posición permitidos, hilo y modo de entrada; evitar solapamiento con teclado y controles.
- Contexto conversacional: «abre mis tareas de hoy» ejecuta navegación autorizada; no reprograma preferencias persistentes salvo intención explícita.

## Datos y privacidad
Minimizar telemetría: eventos semánticos agregados por actor/tenant; retención limitada y documentada; no almacenar contenido de mensajes ni pulsaciones como señal de uso. La personalización no debe revelar actividad de otros empleados sin permiso. Dar control de reset/desactivar adaptación cuando proceda. Los dashboards del owner sobre trabajo de equipo son una capacidad empresarial distinta con políticas propias.

## Invariantes UX
- Un item inaccesible no reaparece por popularidad.
- Un pin manual no se desplaza por algoritmo.
- Menú comprensible y estable; descubribilidad de todos los workspaces autorizados.
- Cambiar idioma o branding no cambia IDs ni permisos.
- El usuario puede volver al orden por defecto.
- Cada cambio es reproducible con inputs, versión de algoritmo y timestamp de evaluación.
