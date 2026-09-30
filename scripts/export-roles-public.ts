// Exporta el canon publico de los roles a clientes/_base/agentes.public.json
// para que el repo de redes lo lea sin HTTP. Uso: pnpm exec tsx scripts/export-roles-public.ts
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const src = join(root, "clientes", "_base", "agentes.json");
const dst = join(root, "clientes", "_base", "agentes.public.json");

interface RoleMemory { kind: string; text: string; }
interface Role {
  id: string; name: string; tone: string; avatar: string;
  objetivo: string; roi?: string; memories: RoleMemory[]; active: boolean;
}

async function main() {
  const data = JSON.parse(await readFile(src, "utf8")) as { agentes: Role[] };
  const publicRoles = data.agentes
    .filter((role) => role.active)
    .map((role) => ({
      id: role.id,
      name: role.name,
      tone: role.tone,
      avatar: role.avatar,
      objetivo: role.objetivo,
      ...(role.roi ? { roi: role.roi } : {}),
      identidad: role.memories.find((m) => m.kind === "identidad")?.text ?? role.objetivo,
    }));
  const out = {
    _comment: "Generado por scripts/export-roles-public.ts. No editar a mano. Fuente: clientes/_base/agentes.json.",
    generatedAt: new Date().toISOString(),
    roles: publicRoles,
  };
  await writeFile(dst, JSON.stringify(out, null, 2), "utf8");
  console.log(`OK: ${publicRoles.length} roles exportados a ${dst}`);
}

void main();
