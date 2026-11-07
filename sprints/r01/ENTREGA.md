# Contrato de entrega · qué tiene que dejar cada agente

Esto es lo que hace que un reporte se pueda leer y revisar. Si un agente no lo cumple, su trabajo no se integra aunque el código sea bueno.

## 1. Dónde escribe

- **Su reporte:** `sprints/r01/<su-carpeta>/REPORTE.md` — ese fichero y ninguno más fuera de su carril.
- **Su código:** dentro de la superficie que declara su `BRIEF.md`.
- **Prohibido:** `docs/`, `package.json`, `pnpm-lock.yaml`, `.github/workflows/`, y el `REPORTE.md` de otro carril.

## 2. En qué rama

```bash
git switch -c sprint/r01-aNN-<slug> <SHA-base>
```

El SHA base se anota en el reporte. Sin SHA no hay forma de saber qué se auditó.

## 3. Los seis campos obligatorios del `REPORTE.md`

1. **Estado:** entregado / en curso / bloqueado.
2. **Qué he medido:** el comando y su salida real, pegada. No "pasa", la salida.
3. **Correcciones al briefing:** si algo que escribí era falso, aquí. Ya pasó dos veces y no es un problema; ocultarlo sí.
4. **Entregable:** ruta del fichero y qué lo demuestra.
5. **Diff:** `git diff --stat BASE...HEAD`.
6. **Abierto:** lo que queda, con el motivo.

## 4. Cómo llega hasta mí

```bash
git add sprints/r01/<su-carpeta> <sus ficheros>
git commit -m "sprint(r01): aNN <qué demuestra>"
git push -u origin sprint/r01-aNN-<slug>
```

Con eso yo hago `git fetch --all`, leo los `REPORTE.md` de las ramas `sprint/r01-*` y consolido. Si el push no está permitido, que deje el commit hecho: se lee igual en local.

## 5. Cuándo un reporte es inválido

- Dice "gate OK" y no pega el `exit` del comando.
- Subió un timeout, añadió un `skip` o relajó una aserción para poner verde.
- Tocó ficheros fuera de su superficie sin declararlo.
- Termina el sprint sin decir qué quedó abierto: siempre queda algo, y no decirlo es lo que rompe la ronda siguiente.
