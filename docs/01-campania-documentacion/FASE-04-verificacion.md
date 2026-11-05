# FASE-04 — Verificación y gate

> v1 · 2026-10-27 · Estado: current

## Script `pnpm docs:check`

Se crea un script de verificación que valida:

1. **Cero rutas rotas** en `docs/README.md`: cada enlace `[texto](./ruta.md)` debe resolver a un archivo existente.
2. **Cabecera válida** en cada doc de `docs/`: debe empezar con `> vN · YYYY-MM-DD · Estado: current|draft|archived`.
3. **Variables citadas existen**: cada variable de entorno citada en docs operativos debe existir en `config.ts`.
4. **Scripts de pnpm citados existen**: cada `pnpm <script>` citado debe existir en `package.json`.
5. **Contradicciones resueltas o abiertas**: cada contradicción de FASE-01 debe estar resuelta (doc actualizado) o abierta con pregunta exacta.

## Estado de audits (documentado, no corregido en código)

| Audit | Estado | Acción en docs |
|-------|--------|----------------|
| `layers` | Verde | No acción necesaria |
| `bridges` | Verde | No acción necesaria |
| `console` | Verde | No acción necesaria |
| `anchors` | Verde | No acción necesaria |
| `tenant-default` | Verde | No acción necesaria |
| `contracts` | Rojo (150 huérfanos) | Documentado en `gate-estado.md`, no se corrige código |
| `idempotency` | Rojo (157 duplicadas) | Documentado en `gate-estado.md`, no se corrige código |
| `coherence` | Rojo (5/7) | Documentado en `gate-estado.md` |

## Criterios de aceptación FASE-04

- [ ] `docs/README.md` tiene cero enlaces rotos
- [ ] Cada doc en `docs/` tiene cabecera válida
- [ ] `pnpm docs:check` pasa con 0 errores
- [ ] Las 8 contradicciones de FASE-01 están resueltas o abiertas con pregunta exacta
