# FASE-02 — Archive estructurado

> v1 · 2026-10-27 · Estado: current

## Regla de oro

**Un doc viejo no se corrige: se archiva y se escribe el nuevo.** Ningún archivo de documentación se borra con `git rm`. Todos se mueven con `git mv` a `docs/archive/2026-10/`.

## Estructura del archive

```
docs/archive/
├── 2026-10/
│   ├── README-ARCHIVE.md    # Índice: qué se movió, por qué, fecha, reemplazo
│   ├── AGENTES-PROYECTOS.txt
│   ├── HANDOFF.md
│   ├── LEDGER.md
│   ├── PROMPT-CLINE-*.md
│   ├── ROADMAP_112.md
│   ├── event-bus-y-agente-omnisciente.txt
│   ├── riesgos-ui.md
│   └── ... (todos los docs obsoletos de docs/ raíz)
└── docs-antiguos/           # Docs de docs/ reemplazados por v2
    └── ...
```

## Criterios para mover a archive

Un doc se mueve a archive si cumple al menos una de estas condiciones:

1. No tiene cabecera de versión válida (`> vN · YYYY-MM-DD · Estado: ...`)
2. Describe funcionalidad que el código no cumple (ver contradicciones en FASE-01)
3. Es un duplicado exacto de otro doc (ver FASE-01)
4. Es ruido (fixes.md < 400 bytes, .bak, directorios _backup, etc.)
5. Está referenciado desde `docs/README.md` pero el archivo no existe

## Metadatos obligatorios en cada entrada de archive

Cada archivo movido a archive debe tener registrada en `README-ARCHIVE.md`:

| Campo | Descripción |
|-------|-------------|
| Archivo original | Ruta relativa antes del movimiento |
| Ruta archive | Ruta relativa después del `git mv` |
| Fecha de archivo | YYYY-MM-DD |
| Motivo | Por qué se archiva (ver criterios arriba) |
| Reemplazo | Ruta del nuevo doc v2 que lo sustituye (si existe) |
| Comando git mv | El comando exacto usado (para trazabilidad) |

## Ejemplo de entrada en README-ARCHIVE.md

```markdown
| Archivo original | Ruta archive | Fecha | Motivo | Reemplazo | Comando git mv |
|------------------|--------------|-------|--------|-----------|----------------|
| docs/ROADMAP.md | docs/archive/2026-10/ROADMAP.md | 2026-10-27 | Obsoleto, sin cabecera válida | docs/02-producto/ROADMAP.md (v2) | `git mv docs/ROADMAP.md docs/archive/2026-10/ROADMAP.md` |
```

## Qué NO se mueve a archive

- `docs/miniaudits/` (25 ramas, estado actual, se mantienen)
- `docs/AUDIT_CONTRACTS.md`, `docs/AUDIT_IDEMPOTENCY.md`, `docs/AUDIT_TENANT_DEFAULT.md` (audits generados, actuales)
- `docs/COMPUTER.md`, `docs/KERNEL_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT.md`, `docs/PROTOCOLO.md`, `docs/BETA.md` (actuales, se versionan a v2 en su lugar o se dejan como están)
- `docs/operacion/HANDOFF-CLINE.md` (se mueve a `docs/04-operaciones/`, no a archive)
- `docs/operacion/CAMPANA-VERDAD.md` (se mueve a `docs/04-operaciones/`, no a archive)
