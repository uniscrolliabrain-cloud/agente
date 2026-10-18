# Sesion 02 - Revisar scans por prefijo

**Estado:** parcialmente validado.

- Corregido el literal SQL `ESCAPE` para que PGlite reciba un caracter de escape.
- `scanByPrefix filtra correctamente por tenant` pasa.
- `scanByOwnerPrefix rechaza prefijos maliciosos` falla porque la llamada no rechaza la entrada.

**Siguiente paso:** acordar si el contrato exige excepcion o resultado vacio y probar tambien prefijos validos con `%` y `_`.
