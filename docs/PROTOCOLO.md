# Protocolo de trabajo

> v1 · 2026-10-04 · Estado: current

Como se trabaja en este repositorio.

## La verdad

Tres niveles, en este orden:

1. Lo que dice el humano en el chat ahora. Manda sobre todo.
2. El repodump. Fuente del codigo. Es el archivo vivo.
3. Los docs. Pueden estar desactualizados. Si contradicen al codigo,
   se actualiza el doc.

## Antes de escribir

1. Leer el fichero real del repodump.
2. Comprobar si ya se toco en esta sesion (ledger).
3. Comprobar idempotencia. Si tiene marca XXX_V1, no reaplicar.
4. Detectar line endings (CRLF o LF). Preservar.
5. Escribir UTF-8 sin BOM.

Nunca escribir sin haber leido.

## Como se escribe

- Fichero nuevo: WriteAllText con contenido completo.
- Fichero existente, cambio grande: leer entero, reescribir entero.
- Fichero existente, cambio quirurgico: IndexOf sobre cadena corta unica.
- Nunca replace de bloques largos.
- Here-strings de mas de 40 lineas se cortan al pegar. Usar array de strings.
- Evitar los caracteres menor-que y mayor-que dentro de strings.
  PowerShell los interpreta como redireccion.

## Idempotencia

Todo bloque comprueba si ya esta aplicado. Si tiene la marca, imprime
SKIP y no hace nada.

## Line endings

Antes de escribir: leer, comprobar CRLF, normalizar a LF, modificar,
volver a CRLF si lo tenia. UTF-8 sin BOM siempre.

## PowerShell seguro

- ErrorActionPreference = Continue al principio.
- Nunca exit en un bloque pegado.
- Nunca Remove-Item sin -LiteralPath.
- Nunca Select-String -Recurse.
- Comillas simples en PowerShell NO interpretan barra-n.
- Los caracteres menor-que y mayor-que en strings rompen el parser.

## Un fix, un typecheck

Cada bloque que toca TypeScript ejecuta pnpm typecheck al final. Si falla,
se para. Nunca apilar 20 bloques sin verificar.

## Ledger

Se calcula antes de escribir. Formato:

  NEW  ruta del fichero nuevo
  MOD  ruta del fichero ya tocado antes en esta sesion
  Marcas: marcas de idempotencia
  Verificacion: como se comprueba

## Cuando parar

Parar y preguntar si el anchor no coincide, el fichero no existe,
el cambio implica mas ficheros de los previstos, hay error de typecheck
no obvio, o hay decision de diseno abierta.

No parar si el cambio es quirurgico y verificado, si el error es de
line endings, o si la idempotencia ya esta aplicada.

## Cuando revertir

Revertir si un parche rompe el typecheck y no es trivial, si tiene
logica no probada, o si se toco mas de un fichero sin decidirlo.

  git checkout -- ruta del fichero

## Verificacion

Al cerrar cada wave:

- pnpm typecheck da 0.
- pnpm --filter @openmuse/web typecheck da 0.
- pnpm test pasa.

## Comunicacion

- No explicar codigo. Solo bloques que funcionen.
- No pedir disculpas.
- No sugerir alternativas si el humano ya decidio.
- Un bloque = una tarea.
- Si falla un bloque, no apilar parches.

## Errores ya cometidos

- Add-Content con arrays de strings para ficheros largos.
- Anchors con fin-de-string y CRLF.
- Suponer que un bloque se aplico sin ver el output.
- Apilar parches sobre parches.
- Mezclar put con compareAndSwap en el mismo handler.
- Aplicar strict() sin verificar que el cliente no manda campos extra.
- Barra-n en comillas simples de PowerShell.
- const now duplicado en el mismo scope.
- Caracteres menor-que y mayor-que en strings de PowerShell.

## Referencias

- PRODUCT.md - que es OpenMuse.
- README.md - indice.
- ui/PROTOCOLO.md - protocolo especifico de la campana UI.

