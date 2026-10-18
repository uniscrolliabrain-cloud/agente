# Sesion 04 - Verificar aislamiento y carga

**Estado:** parcial.

- Ambas pruebas de concurrencia con 50 tenants pasaron.
- Tras corregir el literal SQL de `ESCAPE`, `scanByPrefix` pasa.
- La prueba que espera rechazo de un prefijo malicioso sigue fallando porque no recibe la excepcion esperada.
- Resultado de la seleccion de aislamiento: 6 pasaron y 1 fallo.

**Siguiente paso:** decidir y codificar el contrato de `scanByOwnerPrefix` para entradas no validas y alinear la prueba con ese contrato sin debilitar la proteccion.
