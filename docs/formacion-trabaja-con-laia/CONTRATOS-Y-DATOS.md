# Contrato futuro de microcurso

Ejemplo orientativo TypeScript/Zod; no instalado ni integrado:

```ts
import { z } from "zod";
export const ExerciseSchema = z.strictObject({
  id: z.string().regex(/^(R|P)\\d{2}$/),
  title: z.string().min(1),
  collection: z.string(),
  reelAssetId: z.string().optional(),
  caption: z.string(),
  providerIds: z.array(z.string()),
  capabilityIds: z.array(z.string()),
  requiresConnection: z.boolean(),
  verification: z.enum(["receipt", "read-result", "human-review"]),
  status: z.enum(["draft", "verified", "published"]),
});
```

Separar catálogo público, progreso por usuario, vínculo de conexión por principal y tenant, aprobaciones, SOP/version, eventos y recibos. No almacenar secretos ni payloads personales en eventos analíticos. Un catálogo editorial no confiere permisos. Resolver proveedor y credenciales exclusivamente en backend. El estado `published` exige conector y acción verificados en sandbox o entorno autorizado.
