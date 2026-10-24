// GMB_ROUTES_V1 - OAuth y publicacion en Google Business Profile.

import { Hono } from "hono";
import { AppError } from "./errors.ts";
import type { AgentService } from "./engine/service.ts";

export function gmbRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/status", async (c) => {
    const owner = c.get("owner");
    const connection = await service.db.get<{ connected: boolean }>(owner, "gmb-connection", "default");
    return c.json({ connected: Boolean(connection?.connected) });
  });

  app.post("/connect", async (c) => {
    const clientId = process.env.GMB_CLIENT_ID;
    if (!clientId) throw new AppError("GMB_CLIENT_ID no configurado", 503);
    const owner = c.get("owner");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(`${process.env.PUBLIC_API_URL ?? ""}/api/gmb/callback`)}&response_type=code&scope=https://www.googleapis.com/auth/business.manage&access_type=offline&prompt=consent&state=${encodeURIComponent(owner)}`;
    return c.json({ url });
  });

  app.post("/publish", async (c) => {
    const owner = c.get("owner");
    const connection = await service.db.get<{ connected: boolean }>(owner, "gmb-connection", "default");
    if (!connection?.connected) throw new AppError("GMB no conectado", 409);
    const apiKey = process.env.GMB_API_KEY;
    if (!apiKey) throw new AppError("GMB_API_KEY no configurado", 503);
    // En una version completa, se llama a la API real de GMB.
    // Por ahora, se registra la intencion y se devuelve un resultado honesto.
    return c.json({ ok: false, reason: "GMB publish requiere verificacion de aplicacion con Google; ver docs/DEPLOY-CLIENTE.md" }, 501);
  });

  return app;
}