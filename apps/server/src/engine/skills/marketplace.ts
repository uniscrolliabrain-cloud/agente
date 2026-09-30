import { z } from "zod";
import type { Store } from "../../db.ts";

// SKILL_MARKETPLACE_V1 — scaffold minimo de marketplace. Fase 1: catalogo
// local por owner. Fase 4: catalogo remoto + verificacion de provenance.

export const skillPackageSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().max(4000).default(""),
  version: z.string().max(40).default("1.0.0"),
  author: z.string().max(200).default("openmuse"),
  /** Skills concretas que aporta este paquete. */
  skillIds: z.array(z.string().max(100)).max(50).default([]),
  /** Role ids que puede aportar. Opcional. */
  roleIds: z.array(z.string().max(100)).max(50).default([]),
  active: z.boolean().default(true),
});

export type SkillPackage = z.infer<typeof skillPackageSchema>;

export class SkillMarketplace {
  constructor(private readonly db: Store) {}

  async list(owner: string): Promise<SkillPackage[]> {
    return this.db.list<SkillPackage>(owner, "skill-packages");
  }

  async install(owner: string, pkg: SkillPackage): Promise<SkillPackage> {
    const parsed = skillPackageSchema.parse(pkg);
    await this.db.put(owner, "skill-packages", parsed);
    return parsed;
  }

  async uninstall(owner: string, id: string): Promise<void> {
    await this.db.remove(owner, "skill-packages", id);
  }
}
