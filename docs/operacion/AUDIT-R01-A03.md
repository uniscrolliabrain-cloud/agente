# Auditoría del sprint R01-A03

Base local: `0c8fe81`. Alcance: `tests/setup.ts` y `tests/helpers/config.ts`. Meta: fixtures independientes del entorno del operador y subset verde con entorno vacío.

## Stepper de 30 minutos

- [x] 00–01 Identificar el encargo R01-A03 y su criterio.
- [x] 01–02 Localizar la base y preparar un worktree aislado.
- [x] 02–03 Leer setup, helper, scripts de test y plantilla de informe.
- [x] 03–04 Localizar la carga de dotenv y su orden de importación.
- [x] 04–05 Inventariar consumidores de las fixtures y variables requeridas.
- [x] 05–06 Elegir pruebas de configuración y de arranque representativas.
- [x] 06–09 Preparar el runtime y reproducir el fallo con valores sintéticos.
- [x] 09–12 Definir qué variables aísla el setup y cuáles necesitan los tests de integración.
- [x] 12–17 Aplicar el cambio mínimo dentro de la superficie asignada.
- [x] 17–19 Repetir la reproducción con valores sintéticos.
- [x] 19–22 Ejecutar el subset con el entorno del proceso vacío.
- [ ] 22–24 Ejecutar typecheck y comparar con la base si falla.
- [x] 24–26 Ejecutar secrets check y revisar superficie y whitespace.
- [x] 26–28 Registrar resultados, comandos y códigos de salida.
- [x] 28–30 Registrar commit y estado de entrega.

## Bitácora

- Inicio. El checkout principal está vacío y no hay remoto configurado. Se usa la misma base que R01-A01 y un worktree hermano para R01-A03.
- Diagnóstico. El constructor testConfig ya es puro. Al importar config.ts, Node lee .env desde el directorio actual antes de aplicar alias. El setup de test se precarga antes de los módulos bajo prueba.
- Rojo en BASE. Un proceso con env={} y .env sintético importa config.ts y expone el valor como GOOGLE_API_KEY. Se conserva la carga explícita de archivos fixture. Crash recovery crea un proceso separado sin precarga y queda identificado como caso fuera de esta superficie.
- Verde en la rama. La misma sonda salió con código 0: el alias no contiene el valor del .env y fixture.env se puede leer de forma explícita. git diff --check salió con código 0. Instalación congelada de dependencias y subset con env -i en curso.

## Reproducción del aislamiento

1. Desde el worktree, obtener las URL absolutas de `tests/setup.ts` y `apps/server/src/config.ts`.
2. Crear un directorio temporal fuera del worktree con un archivo `.env` que contenga `GEMINI_API_KEY=synthetic-a03` y otro archivo `fixture.env` que contenga `A03_FIXTURE=ok`.
3. Lanzar Node 24 desde ese directorio con entorno vacío y `--import <URL de setup.ts>`.
4. Importar `config.ts` por su URL absoluta y comprobar que `process.env.GOOGLE_API_KEY` es `undefined`. En la base, falla con el valor sintético.
5. Llamar a `process.loadEnvFile("fixture.env")` y comprobar que `process.env.A03_FIXTURE` vale `ok`. En la rama, pasan ambas comprobaciones.
6. Eliminar los dos archivos sintéticos y su directorio temporal.

## Evidencia de verificación

| Comprobación | Resultado |
|---|---|
| Sonda de configuración con entorno vacío y .env sintético | BASE: aserción roja. Rama: exit 0. |
| env -i node --import ./tests/setup.ts --test tests/expression.test.ts tests/prompt-tone.test.ts tests/log.test.ts | Exit 0. 8 pasan, 0 fallan, 0 omitidos. |
| Primer intento del subset que también incluía format.test.ts | Exit 1. 8 pasan y format.test.ts no arranca por React aún sin enlazar durante la instalación. |
| node --experimental-transform-types scripts/secrets-check.ts | Exit 0 en modo sample. |
| git diff --check | Exit 0. |
| pnpm install --frozen-lockfile | Exit 0 con pnpm 11.19.0. |
| pnpm secrets:check | Exit 0. |
| Subset ampliado con tsx y env -i | format.test.ts pasó sus cinco casos. Resultado agregado en curso al preparar el commit. |
| pnpm typecheck | En curso al preparar el commit. |

## Informe R01-A03

- **Estado**. Abierta para revisión local. La sonda de regresión y el subset de 8 pruebas pasaron. El typecheck completo sigue pendiente de resultado.
- **Rama**. `sprint/r01-a03-entorno-tests`.
- **Base**. `0c8fe81ec8ece4dd35cbc9b12e3b1d1d168ce81f`, base local usada por R01-A01.
- **Cambio**. `tests/setup.ts` evita la lectura implícita del .env por los tests que precargan ese módulo. La auditoría es el único artefacto documental.
- **Límite**. El subprocess de `tests/helpers/crash-worker.ts` se arranca sin precargar el setup y conserva su lectura directa del .env.
- **Petición al portero C8**. Habilitar la precarga en el subprocess de crash recovery para extenderle el aislamiento.
- **PR**. Pendiente de remoto. El repositorio local no tiene ninguno configurado.
