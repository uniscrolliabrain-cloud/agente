# Ficha · agntia-redes

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-redes` |
| Visibilidad | Público |
| Proyecto | Vertical Redes |
| Superficies Agntia Code | Ramas, Despliegues, Observabilidad |
| Estado | SCAFFOLD |
| Verificado contra | `main@7940e97ee857580d686b2047fc371dc9820d2450`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 776 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Middleware social de AgntiaPro: convertir objetivos y briefs aprobados en borradores, revisiones, calendario, publicaciones trazables, atención de comunidad y reportes con fuentes. El LLM propone; máquina de estados, permisos, presupuesto y aprobaciones deciden qué se ejecuta.

## Qué declara que funciona hoy

- El paquete compila e instala como librería; existe instalador único para `/agente` con preflight de SHA, montaje por entorno, verificación dentro del padre y reversión.
- El instalador se ensayó **de punta a punta sobre un clon**, no sobre el checkout del fundador.
- Cotejo del repo padre en `9c4c309`: 20 de 24 archivos idénticos.
- Dos verticales ejecutables (publicación y resultado incierto) documentadas; paquete con scripts `slice:publish` y `slice:reconcile`.

## Qué no está verificado

- Sin proveedor social real, sin despliegue y sin instalación aplicada al `/agente` real: el README lo declara.
- 42 campañas, 294 tareas y 84 escenarios de gate, todas `NOT_STARTED`.
- No se ha ejecutado la suite ni el instalador en esta auditoría.

## Stack y ejecución (manifiesto real)

- `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check`.
- `npm run install:parent`, `npm run verify:install`, `npm run slice:publish`, `npm run slice:reconcile`.
- Variables de entorno: no hay `.env.example` en la raíz.

## Datos e integraciones

Diseño de persistencia y auditoría en `docs/implementation/`; conectores sociales no instalados. Identidad por JWT de Supabase y twins vinculados según la decisión del propietario del 2026-11-11.

## Calidad

- Scripts de instalación y verificación con reversión: buena señal para un middleware que modifica otro repo.
- Documentación extensa (producto, proveedores, seguridad, UX, analítica, presupuestos, empresa SaaS, visio).
- Sin licencia ni descripción en GitHub.

## Límites y riesgos

- **Riesgo de instalación**: un instalador que monta archivos en el repo padre puede dejar el padre en estado inconsistente si se interrumpe; la ficha exige preflight de SHA y plan de reversión probado.
- Publicar en redes es un efecto externo irreversible; la ficha debe mantener deny-by-default y aprobación humana.
- `handoff_chat_gpt.md` duplicado de otros seis repos.

## Migración a Agntia Code

1. Alta como proyecto "Redes" con `npm ci`, `npm test` y `npm run build`; sin despliegue.
2. Superficies: Ramas para el cotejo con `agente`, Despliegues deshabilitado y Observabilidad cuando exista runtime.
3. Registrar el SHA del padre usado en el ensayo (`9c4c309`) como evidencia en la ficha.
4. No marcar `IMPLEMENTATION` hasta que exista proveedor sandbox o instalación verificada.
