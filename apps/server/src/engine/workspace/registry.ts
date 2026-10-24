import { z } from "zod";

// WORKSPACE_REGISTRY_V1 — mapeo declarativo rol -> vista por defecto.
// Fase 1: solo cambia la vista inicial al entrar a un rol. Las plantillas
// ricas (editor, pipeline, dashboard) son Fase 3.

export const workspaceViewSchema = z.enum([
  "chat",
  "tasks",
  "documents",
  "projects",
  "control-center",
  "memory",
  "users",
]);

export type WorkspaceView = z.infer<typeof workspaceViewSchema>;

export const workspaceTemplateSchema = z.object({
  roleId: z.string().min(1).max(100),
  defaultView: workspaceViewSchema,
  /** Etiqueta que ve el usuario en el nav cuando este rol esta activo. */
  label: z.string().min(1).max(100),
  /** Acento visual del workspace. Opcional. */
  accent: z.string().max(40).optional(),
});

export type WorkspaceTemplate = z.infer<typeof workspaceTemplateSchema>;

/** Defaults por rol. Si un rol no aparece, cae a chat. */
export const DEFAULT_WORKSPACE_TEMPLATES: readonly WorkspaceTemplate[] = [
  { roleId: "direccion", defaultView: "control-center", label: "Direccion" },
  { roleId: "comercial", defaultView: "tasks", label: "Pipeline" },
  { roleId: "atencion", defaultView: "chat", label: "Atencion" },
  { roleId: "administrativo", defaultView: "documents", label: "Documentos" },
  { roleId: "finanzas", defaultView: "control-center", label: "Finanzas" },
  { roleId: "marketing", defaultView: "tasks", label: "Campanas" },
  { roleId: "contenido", defaultView: "documents", label: "Contenido" },
  { roleId: "operaciones", defaultView: "tasks", label: "Operaciones" },
  { roleId: "compras", defaultView: "tasks", label: "Compras" },
  { roleId: "rrhh", defaultView: "tasks", label: "Personas" },
  { roleId: "legal", defaultView: "documents", label: "Legal" },
  { roleId: "compliance", defaultView: "documents", label: "Compliance" },
  { roleId: "investigacion", defaultView: "memory", label: "Investigacion" },
  { roleId: "calidad", defaultView: "tasks", label: "Calidad" },
  { roleId: "it", defaultView: "tasks", label: "Tecnologia" },
  { roleId: "producto", defaultView: "projects", label: "Producto" },
] as const;

export class WorkspaceRegistry {
  constructor(
    private readonly templates: readonly WorkspaceTemplate[] = DEFAULT_WORKSPACE_TEMPLATES,
  ) {}

  forRole(roleId: string): WorkspaceTemplate {
    const found = this.templates.find((template) => template.roleId === roleId);
    return found ?? { roleId, defaultView: "chat", label: roleId };
  }

  all(): readonly WorkspaceTemplate[] {
    return this.templates;
  }
}
