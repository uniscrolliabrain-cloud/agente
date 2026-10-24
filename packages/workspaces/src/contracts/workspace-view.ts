// WORKSPACE_VIEW_V1 — declaracion tipada de las vistas que sirve un
// workspace. El schema real del resolver es runtimeViewSpecSchema
// (packages/domain/src/views.ts). Este sobre es la declaracion que vive
// dentro del modulo, y el adapter la traduce a RuntimeViewSpec.

import { z } from "zod";

export const workspaceViewDeclarationSchema = z.object({
  id: z.string().min(1).max(200),
  intent: z.string().min(1).max(200),
  kind: z.enum([
    "dashboard",
    "queue",
    "inbox",
    "board",
    "table",
    "detail",
    "form",
    "timeline",
    "graph",
  ]),
  title: z.string().min(1).max(300),
  query: z.string().min(1).max(200),
  actions: z.array(z.string().min(1).max(200)).default([]),
});

export type WorkspaceViewDeclaration = z.infer<
  typeof workspaceViewDeclarationSchema
>;