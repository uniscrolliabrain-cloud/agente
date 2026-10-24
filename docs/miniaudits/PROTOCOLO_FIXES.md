# Protocolo de fixes

> v1 - 2026-10-04 - Estado: active
> Como se escribe un fix para no desalinear el repo.

## 1. Regla de oro

Un fix atomico. Una marca. Un archivo. Un proposito.

## 2. Marca unica obligatoria

Formato: XXX_VN en un comentario al principio del bloque.
Nunca reutilizar una marca ya usada en otro sitio con contenido distinto.

## 3. Ancla corta y unica

- Maximo 10 lineas.
- Debe existir exactamente una vez en el archivo.
- Comprobar con Select-String antes de aplicar.

## 4. Idempotencia obligatoria

Cada fix comprueba si ya se aplico antes de aplicar.

## 5. Preservar line endings

Detectar CRLF/LF antes de modificar y restaurar al escribir. UTF-8 sin BOM.

## 6. Errores de PowerShell ya cometidos

- R como nombre de funcion: es alias de Invoke-History. Usar Write-RepoFile.
- Here-strings de mas de 40 lineas se cortan al pegar. Usar array de strings.
- Write-Host con -f fuera de parentesis. Envolver en parentesis.

## 7. Verificacion obligatoria

Tras cada fix: comprobar la marca. Tras cada bloque: tabla 15/15.
Tras cada cambio en TS: pnpm typecheck (0 errores).

## 8. Que hacer si un fix no entra

1. No dejarlo para despues. Se reaplica con ancla mas corta.
2. No apilar parches.
3. No silenciar el fallo.

## 9. Que NO hacer

- No usar -replace sobre todo el archivo.
- No escribir un archivo completo sin leerlo antes.
- No modificar codigo de otro bloque sin avisar.
- No introducir dependencias nuevas sin justificar.
- No hardcodear timeouts, modelos, paths.
- No dejar catch {} vacios.
- No usar console.log en codigo de servidor.
- No borrar codigo huerfano sin marcarlo PENDING.
- No marcar un fix como aplicado sin verificar la marca.
- No commitear sin pnpm typecheck en 0.

## 10. Verificacion al cerrar un bloque

Ejecutar la tabla del bloque. Si hay SIN MARCA, reaplicar. Si hay FALTA, crear.

## 11. Referencias

- docs/audits/POLICY_REPO.md
- docs/audits/00-coherencia/miniaudit.md
