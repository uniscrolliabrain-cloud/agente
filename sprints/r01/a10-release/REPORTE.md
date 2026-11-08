# REPORTE · A10 Release

- **Estado:** abierto | en curso | entregado | bloqueado
- **SHA base:** `0c8fe81`
- **Rama:** `sprint/r01-a10-release`
- **Tiempo de sprint usado:** __ / 30 min

## 1. Los seis defectos

| # | Defecto | Confirmado | Evidencia (fichero:línea) | Arreglado |
|---|---|---|---|---|
| 1 | `worker` con `continue-on-error` | | `ci.yml:42` | |
| 2 | timeout 10 s vs 30 s | | | |
| 3 | CI no usa `pnpm gate` | | | |
| 4 | 9 E2E skip permanentes | | | |
| 5 | `docs/audits/.../miniaudit.md` no existe | | | |
| 6 | sin SHA acreditado en prod | | | |

## 2. Demostración de que `run: |` oculta audits

```
$ (comando y salida: hazlo fallar a propósito en una copia)
```

## 3. CI antes / después

| Job | Verifica | Bloquea antes | Bloquea después |
|---|---|---|---|
| unit | | | |
| worker | | | |
| web | | | |
| integration | | | |
| release-gate | | | |

## 4. Diff

```
$ git diff --stat BASE...HEAD
```

## 5. Abierto / bloqueado

## 6. Riesgo que dejo al siguiente carril
