// SOCIAL_ROUTES_V1 - OAuth por red social.

import { Hono } from "hono";
import { AppError } from "./errors.ts";
import type { AgentService } from "./engine/service.ts";

const NETWORKS = ["linkedin", "instagram", "facebook"] as const;

export function socialRoutes(service: AgentService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  app.get("/status", async (c) => {
    const owner = c.get("owner");
    const status: Record<string, boolean> = {};
    for (const net of NETWORKS) {
      const conn = await service.db.get<{ connected: boolean }>(owner, "social-connections", net);
      status[net] = Boolean(conn?.connected);
    }
    return c.json({ status });
  });

  app.post("/:network/connect", async (c) => {
    const network = c.req.param("network");
    if (!NETWORKS.includes(network as typeof NETWORKS[number])) throw new AppError("Red no soportada", 422);
    const clientId = process.env[`${network.toUpperCase()}_CLIENT_ID`];
    if (!clientId) throw new AppError(`${network.toUpperCase()}_CLIENT_ID no configurado`, 503);
    const owner = c.get("owner");
    const url = `https://example.com/oauth/${network}?client_id=${clientId}&state=${encodeURIComponent(owner)}`;
    return c.json({ url });
  });

  app.post("/:network/publish", async (c) => {
    const network = c.req.param("network");
    const owner = c.get("owner");
    const conn = await service.db.get<{ connected: boolean }>(owner, "social-connections", network);
    if (!conn?.connected) throw new AppError(`${network} no conectado`, 409);
    return c.json({ ok: false, reason: `${network} publish requiere verificacion con la red; ver docs/DEPLOY-CLIENTE.md` }, 501);
  });

  return app;
}