# Ficha · agntia-branding

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-branding` |
| Visibilidad | Público |
| Proyecto | Vertical Branding |
| Superficies Agntia Code | Repositorios, Revisiones, Bitácora |
| Estado | SCAFFOLD (implementación en curso, no producto) |
| Verificado contra | `main@534dc9e515b08e1102dedba3b80ecf18e101d54c`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 808 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Vertical de branding, diseño y sistemas de marca: entregar identidad y materiales editables, coherentes, accesibles y trazables, con revisión humana y derechos de uso demostrables. Funciona como middleware hacia AgntiaPro/`agente`.

## Qué declara que funciona hoy

- Monorepo TypeScript con contratos Zod, dominio determinista, identidad JWT, persistencia, adaptadores, API Hono y SDK.
- **131 tests en verde**, typecheck limpio y paquetes ESM instalables desde otro repositorio (según README del 2026-11-23).
- Vertical P0 ejecutable por HTTP con gates deterministas: `brief → research → naming → clearance → voice → tokens → design → qa → review → export → delivery → brandbook`.

## Qué no está verificado

- Supabase real, Postgres/RLS en instancia, Penpot, Anam, editor vectorial y portal: pendientes según el propio repo.
- No hay UI ni proveedores conectados ni base de datos provisionada; `not_configured` y `NOT_VERIFIED` se muestran como tales.
- Las 42 campañas siguen abiertas como gates de producto; no se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:parent`, `npm run pack:parent`, `npm run dev`.
- Monorepo con `apps/`, `packages/`, `scripts/`, `tests/` y `docs/`; lockfile `package-lock.json`.
- Variables de entorno: no hay `.env.example` en la raíz.

## Datos e integraciones

Persistencia propia en el monorepo, sin instancia provisionada. Identidad JWT prevista; integraciones de diseño y vídeo (Penpot, Anam) no verificadas.

## Calidad

- 131 tests declarados con comando y fecha; `verify:parent` comprueba instalación real en un consumidor limpio, lo que es una señal fuerte.
- 8 documentos en `docs/` con producto, investigación, referentes, adaptadores, seguridad, UX, servicio y costes.
- Sin licencia ni descripción en GitHub.

## Límites y riesgos

- "Implementación en curso" puede leerse como producto; la ficha conserva la etiqueta `SCAFFOLD` hasta que exista UI y base de datos verificadas.
- Sin cobertura de marca real: los entregables son estructuras y contratos, no piezas finales aprobadas.
- `handoff_chat_gpt.md` de 30 KB duplicado de otros repos.

## Migración a Agntia Code

1. Alta como proyecto "Branding" con `npm ci`, `npm test` y `npm run build`.
2. Superficies: Repositorios y Revisiones para los gates; Bitácora para criterios de marca.
3. Autocompletar ficha con la salida de `verify:parent` cuando se ejecute.
4. Revisar licencia antes de exponer el proyecto a clientes.
