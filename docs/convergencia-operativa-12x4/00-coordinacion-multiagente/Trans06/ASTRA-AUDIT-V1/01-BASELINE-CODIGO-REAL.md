# Primera pasada de reconstrucción

La referencia de Trans06 es `5ccddc7d1d05f0a89257e0638b9cadfce2998081`, commit que restaura el handoff. La campaña de origen antigua documenta `93236a34b2d636debb340bba70cd9c9bbf9cf441` como baseline de su propia propuesta. El contraste actual usa los árboles remotos capturados y sus ancestros comunes. Los siguientes commits se obtuvieron por fetch de las ramas con sus nombres exactos.

| Rama | HEAD | Merge-base con la canónica | Carpeta |
|---|---|---|---|
| Trans01 | `8967243326ccf5e22224e0693ac9155ea70d9765` | `751eab413aef2ca124d42dcba602b91696b71c9d` | `Trans01` |
| Trans02 | `89c5925d7a30e70ff41cd81539408d8b0282b92c` | `751eab413aef2ca124d42dcba602b91696b71c9d` | `trans02` |
| Trans03 | `24c232c8bf8239155d9afa45a234be1a2edf322e` | `751eab413aef2ca124d42dcba602b91696b71c9d` | `Trans03` |
| Trans04 | `731604c865cb6193047ad6bd10bba204ca35f47d` | `751eab413aef2ca124d42dcba602b91696b71c9d` | `trans04` |
| Trans05 | `1a70bbc2c6f78c49fe6b51ed18297f27a9822149` | `751eab413aef2ca124d42dcba602b91696b71c9d` | `Trans05` |
| Trans06 | `5ccddc7d1d05f0a89257e0638b9cadfce2998081` | `12e535a264d0c4a5da17d7b049e04c82cbcc681c` | `Trans06` |
| campaign/convergencia-operativa-12x4 | `8672f8c1035067e77de76080aabbe8d4c8030fe5` | `8672f8c1035067e77de76080aabbe8d4c8030fe5` | doce fases en la raíz documental |

El diff canónica → Trans06 tiene 829 rutas bajo `apps`, `packages`, `tests` y el lockfile. Ese total mezcla código, documentación, archivos del laboratorio y fixtures. Al acotar a `apps/server/src`, `packages/domain/src`, `tests` y `pnpm-lock.yaml` quedan tres cambios. `apps/server/src/app.ts` incorpora el fallback estático de las rutas `/legal` y `/legal/`. Cambia el lockfile y se añade `tests/business-command-studio.test.ts`. La diferencia de ancestros sigue siendo material aunque esas superficies sean próximas.

## Cromos, atención y ontología

Rutas relativas a la raíz de Trans06. La búsqueda se hizo sobre fuentes de servidor y pruebas, con `git grep` sobre el HEAD fijado.

| Ruta | Blob | Evidencia y alcance |
|---|---|---|
| `apps/server/src/kernel/cromos/cromo.ts` | `6efd66840dc85944884a1c2d0dcf3042e49e4629` | `cromoSchema` valida campos externos básicos. `field` acepta un mapa de valores desconocidos. La exportación pública del barrel existe. No se encontró invocación funcional del schema. |
| `apps/server/src/kernel/cromos/logic/axioms.ts` | `48f36452abc6c63280559202a55a12d269525376` | `LOGIC_AXIOMS` es una lista de textos. `checkContradiction` solo compara la negación literal con prefijo `no ` tras trim y minúsculas. No se encontró consumidor operativo fuera de su reexportación. |
| `apps/server/src/kernel/cromos/physics/field.ts` | `31bc3f10491fce8793c1a1f83de86bd73e6812fa` | `fieldEnergy` calcula la media de cuadrados y convierte entrada vacía en cero. Su firma no impone finitud ni rango. Elevar al cuadrado borra el signo si el caller admite negativos. Solo se observó consumo interno por `isHighEnergy` y exportación pública. |
| `apps/server/src/kernel/graph/attention.ts` | `cb526ccf3dff5a1caa6ba9475f3c826af6c8e7a1` | Implementa selección, suma normalizada por referencia canónica y solapamiento. `Meta.detectAttentionConflict` llama a `attentionOverlap`. Hace falta contrastar la alcanzabilidad de ese método desde tráfico real. |
| `apps/server/src/kernel/cognition/cycle.ts` | `92466f716b23b4a72f7ebe0a0dba9813be60a9be` | `kernel/subscribers/events.ts:103` llama a `runCognitionCycle`. `index.ts:80` llama a `registerKernelListeners`. Falta demostrar replay del circuito completo y distinguir la idempotencia de apertura de la de cada escritura. |
| `apps/server/src/engine/cognition/chromatic/card-ontology.ts` | `4aa04bdca6b4a6433605efdc1d13f978ed0d17cf` | `CognitiveRuntime` crea el servicio y su inicialización instala la ontología. El projector valida la aprobación cuando el registro trae ontología. El proyector de outcomes comprueba aprobación. Estas llamadas prueban uso del servicio en esas rutas, con el alcance de cada entrypoint aún por fijar. |
| `apps/server/src/engine/cognition/chromatic/ontology-registry.ts` | `ce5d52687edde683225d6419a1cad4eb3bd0fe61` | `CardOntologyService` instancia `ChromaticOntologyRegistry` con un verificador. La gobernanza de esa ontología es una frontera distinta de la política de ejecución empresarial. |

Un contraejemplo directo a equiparar cromos y ontología activa es la entrada vacía. `fieldEnergy([])` devuelve cero y no distingue falta de observación de una observación con peso cero. En una representación que debe conservar desconocimiento, esa equivalencia pierde información. Conviene evaluar los polos independientes del contrato de cards en su ruta existente antes de considerar un campo adicional.

La nota del fundador `Trans05/FUTURO-NUCLEO-AXIOMATICO.md`, en el HEAD fijado de Trans05, exige observar tres empresas propias antes de formular el núcleo sintético. `CAMPAIGN.md` de Trans06 autoriza estudiar el sustrato. La revisión separará preparación experimental de formalización de axiomas. Las simulaciones sintéticas darían evidencia sobre propiedades explícitas del modelo, con el dogfooding como fuente distinta de evidencia empresarial.
