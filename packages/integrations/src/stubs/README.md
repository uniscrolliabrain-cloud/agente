# Conectores declarados y sin cablear

Estos cuatro ficheros (**stripe**, **whatsapp**, **gmb**, **social**) son *interfaces
tipadas*, no integraciones. Cada llamada lanza un `AppError` 503 con el nombre de la variable
que falta, y **nadie los importa**: ni el runtime, ni los tests, ni los scripts.

Estan aqui a proposito, y fuera de `src/` para que un grep de "conectores disponibles" no los
cuente como functionality real. Cuando uno se cablee:

1. mover el fichero de vuelta a `packages/integrations/src/`,
2. implementar las llamadas contra la API del proveedor con la credencial de servidor
   (nunca desde el navegador),
3. dejar de devolver 503 en exito: o funciona o falla, pero sin falso exito,
4. anadir el test que cubre el camino de error contra la API real.

## Por que 503 y no una excepcion generica

Un 503 con mensaje ("Falta STRIPE_API_KEY...") es honesto: el front puede pintar que falta
configurar algo. Un falso 200 seria peor que no tener el conector.
