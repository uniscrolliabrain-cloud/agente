# Clasificador de fallos de tests · R1 A10

Ejecuta los comandos desde la raíz de cada checkout, con la misma versión de Node, las dependencias instaladas y el mismo entorno de tests. Usa la misma copia del clasificador para la base y el candidato. Node 22 o posterior admite los argumentos del runner usados por el script.

En el checkout base, proporciona la ruta absoluta al script del candidato y guarda los resultados en un archivo nuevo.

```powershell
node --import tsx --import ./tests/setup.ts <clasificador.mjs> --snapshot <base.json> tests/ejemplo.test.ts
```

En el checkout candidato, proporciona la misma selección de archivos y el JSON generado en la base.

```powershell
node --import tsx --import ./tests/setup.ts scripts/classify-test-failures.mjs --baseline <base.json> tests/ejemplo.test.ts
```

Cada archivo con fallos se ejecuta tres veces más en procesos de test nuevos. La tabla incluye una fila por test que falló en la primera ejecución. Usa la ruta relativa y el nombre del test para comparar ambas revisiones. Si el archivo contiene varias coincidencias, la fila queda sin clasificar.

| Etiqueta | Evidencia |
| --- | --- |
| flaky | Las tres repeticiones dieron resultados válidos y al menos una pasó. |
| preexistente | Las tres repeticiones fallaron y el mismo test falló en la base. |
| nuevo | Las tres repeticiones fallaron y el mismo test pasó en la base. |
| sin clasificar | Falta evidencia comparable, hay una coincidencia ambigua o alguna repetición no dio un resultado válido. |

Los fallos al cargar un archivo se muestran por separado. La ejecución de clasificación devuelve 0 si la primera pasada está limpia, 1 si detecta fallos, y 2 si el comando o el archivo de entrada son inválidos. La captura puede registrar una base con tests rojos y devuelve 2 si detecta fallos de carga.
