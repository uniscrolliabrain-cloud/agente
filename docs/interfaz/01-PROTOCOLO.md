# Protocolo de trabajo

> **UI_CAMPAIGN_01_PROTOCOLO_V1** · Última actualización: 2026-10-03.

## 1. La verdad

Tres niveles, en este orden:

1. **Lo que dice el humano en el chat ahora.** Manda sobre todo lo demás.
2. **El repo actual** (lo que hay en disco). Fuente del código.
3. **Los docs** (esta carpeta, HANDOFF, TODO). Pueden estar desactualizados.

Si hay conflicto: gana el chat. Y se actualiza el doc que no cuadre.

## 2. Antes de escribir

Para CADA fichero que se va a tocar:

1. **Leer el fichero real del repo.** No del dump, no de memoria.
2. **Comprobar si ya se tocó en esta sesión** (ledger).
3. **Comprobar idempotencia.** Si el cambio ya está aplicado (marca `XXX_V1`), no reaplicar.
4. **Detectar line endings.** CRLF o LF. Preservar.
5. **Escribir UTF-8 sin BOM.** Siempre.

**Nunca escribir sin haber leído.**

## 3. Cómo se escribe

- **Fichero nuevo:** `[System.IO.File]::WriteAllText` con contenido completo.
- **Fichero existente, cambio grande:** leer entero, reescribir entero.
- **Fichero existente, cambio quirúrgico:** `IndexOf` sobre cadena corta única.
- **CSS/HTML puro:** mismo tratamiento.

**Nunca `-replace` de bloques largos.** Falla con CRLF, comillas, unicode.

## 4. Idempotencia

Todo bloque comprueba si ya está aplicado:

```powershell
if ($t.Contains('MARCA_V1')) {
  Write-Host 'SKIP: ya aplicado' -ForegroundColor Yellow
} else {
  ... aplicar ...
}
```

Cada cambio lleva marca única: `A1_MEMORY_PATCH_V2`, `A2_PICKPRIMARY_V1`, etc.

## 5. Line endings

```powershell
$t = [System.IO.File]::ReadAllText($path)
$hadCRLF = $t.Contains("`r`n")
if ($hadCRLF) { $t = $t.Replace("`r`n", "`n") }
... modificar en LF ...
if ($hadCRLF) { $t = $t.Replace("`n", "`r`n") }
[System.IO.File]::WriteAllText($path, $t, (New-Object System.Text.UTF8Encoding $false))
```

## 6. PowerShell seguro

- `$ErrorActionPreference = "Continue"` al principio.
- **NUNCA `exit`** en un bloque pegado en la terminal.
- Nunca `Remove-Item` sin `-LiteralPath`.
- Nunca `Select-String -Recurse` (usar `Get-ChildItem -Recurse | Select-String`).
- Nunca anchors con `$` final en regex.
- Here-strings grandes → array de strings.

## 7. Ledger

Se calcula **antes** de escribir el bloque.

```
Ledger:
  NEW  <fichero nuevo>
  MOD  <fichero ya tocado antes en esta sesión>
  Dependencias: <verificadas antes de tocar>
  Verificación al final: <cómo se comprueba>
```

**Formato de respuesta al humano:** primero el bloque PowerShell, al final el ledger.

## 8. Cuándo parar

Parar y preguntar si:
- El anchor no coincide con el fichero real.
- El fichero no existe donde se espera.
- El cambio implica más ficheros de los previstos.
- Hay error de typecheck no obvio.
- Hay decisión de diseño abierta.

**No parar** si:
- El cambio es quirúrgico y verificado con el fichero real.
- El error es de line endings (se resuelve con el patrón del apartado 5).
- La idempotencia ya está aplicada (SKIP).

## 9. Cuándo revertir

Revertir si:
- Un parche rompe el typecheck y no es trivial arreglar.
- Un parche tiene lógica no probada.
- Se tocó más de un fichero sin haberlo decidido.

```powershell
git checkout -- <ruta del fichero>
```

Verificar que la marca del parche ya no aparece.

## 10. Verificación

- `pnpm typecheck` → 0.
- `pnpm --filter @openmuse/web typecheck` → 0.
- `pnpm test` → verde.

Al cerrar cada branch: los 3 en verde.

## 11. Comunicación

- No explicar código. Solo comandos que funcionen.
- No pedir disculpas. Si algo falla, se arregla.
- No sugerir alternativas si el humano ya ha decidido.
- Un bloque = una tarea.
- Si falla un bloque, no apilar parches.

## 12. Errores ya cometidos (no repetir)

- Add-Content con arrays de strings para ficheros largos.
- Anchors con `$` final y CRLF.
- Suponer que un bloque se aplicó sin ver output.
- Apilar parches sobre parches.
- Trabajar contra el dump cuando ya modificamos el fichero.
- Reproducir "antes" largos de memoria.
- Mezclar `put()` (no atómico) con `compareAndSwap()` (atómico) en el mismo handler.
- Aplicar `.strict()` sin verificar que el cliente no manda campos extra.
- Escribir handlers grandes con lógica condicional sin tests.

## 13. Diferencias con HANDOFF antiguo

- Backend se toca cuando el flujo lo pide.
- Un commit por bloque dentro del branch.
- Ledger al final de cada bloque.
- Branch por flujo.
- Carpeta `docs/interfaz/` como memoria operativa.

## 14. Referencias

- `docs/interfaz/00-ESTRATEGIA.md` - fases y branches.
- `docs/interfaz/02-ARQUITECTURA.md` - mapa de ficheros.
- `docs/interfaz/03-DECISIONES.md` - decisiones cerradas.
- `docs/interfaz/07-FLUJOS.md` - flujos de usuario.
- `docs/interfaz/99-HISTORIAL.md` - qué se cerró.

**Fin del protocolo.**
