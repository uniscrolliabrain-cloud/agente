# Auditoría de console

> **Este fichero ya no es el informe.** Era una copia del audit generado el 2026-10-26 y se quedó obsoleta.

```bash
pnpm audit:console
```

**Medición del 2026-11-08** (`main` = `a3faf00`): 24 ocurrencias en 235 ficheros de su superficie. El audit es **advisory** (`blocking: false`): cuenta y publica, pero no tumba el gate. Un `grep` crudo sobre todo el repo da 219 ocurrencias en 53 ficheros porque incluye tests y scripts, que el audit excluye a propósito.
