# Acta de congelación — convergencia Trans00–Trans06

**Fecha:** 2026-11-28 · **Rama de trabajo:** `converge/trans00-core` · **Alcance:** local, sin red.

A partir de este acta, cualquier cambio de head en cualquiera de estos SHA **invalida** la
certificación y obliga a repetir la fase correspondiente.

## 1. SHAs congelados

| Ref | SHA | Papel |
|---|---|---|
| `origin/integration/trans00-core` | `892061c98f21c371739c16c781a7ad8d9bbe4c61` | base de campaña declarada en el corpus |
| `origin/main` | `e496dd43338107f07d48d62d3e0ea03c0e0c6c89` | rama a la que se converge |
| `converge/trans00-core` (HEAD local) | `a843ddfc` | rama de convergencia con Trans00–Trans06 |
| `origin/infra/trans00-provider-readiness` | `1bb25aba34b2d362d47fadcb72c652a71154b55d` | trasplante de readiness (Trans00) |
| `origin/campaign/convergencia-operativa-12x4` | `8672f8c1035067e77de76080aabbe8d4c8030fe5` | rama canónica de la campaña |

## 2. Divergencia

`git rev-list --left-right --count HEAD...origin/main` → **100 adelante / 32 detrás**.

Es decir: la rama de convergencia contiene todo `main` hasta el merge-base más 100 commits propios,
y le faltan 32 commits de `main`.

## 3. Entorno de ejecución

| Elemento | Valor |
|---|---|
| Node | `v24.22.1` |
| pnpm | `11.19.0` |
| `pnpm-lock.yaml` (sha256) | `1c2851bc2ce1f0eab66ed1fd60b01018d3f56e73dc0124cbaf28e30543fdace0` |
| PostgreSQL nativo | **no disponible** en el runner |
| Docker | **no disponible** en el runner |
| Red | bloqueada (`ALLOW_NETWORK=0`) en todas las suites |

## 4. Estado de partida de la campaña

- Ledger: 288 bloques, **0 `DONE`**. Ningún cierre de campaña es legítimo aún.
- `07-owner-real` (`07.01`–`07.04`): `NOT_RUN` por falta de autorización y datos del owner.
- Proveedores externos: `LIVE_UNVERIFIED`; ninguna llamada real en toda la campaña.
- Gate integral: **no reproducido** en este entorno (ver informe de convergencia).

## 5. Lo que este acta NO autoriza

No autoriza merge a `main`, ni PR, ni tag, ni despliegue, ni publicación. Solo fija la base sobre la
que se puede ensayar y certificar. El merge real requiere autorización explícita del operador
(`99-ejecutor-freebuff/Trans07 § Autorización`).
