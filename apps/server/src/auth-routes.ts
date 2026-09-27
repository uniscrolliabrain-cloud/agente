import { randomBytes, createHash } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { userRoleSchema, userSetupSchema, type User, type UserService } from "./users.ts";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

const createUserSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
  role: userRoleSchema.default("user"),
  setup: userSetupSchema.partial().optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
  setup: userSetupSchema.partial().optional(),
  password: z.string().min(8).max(200).optional(),
});

export function authRoutes(db: Store, users: UserService) {
  const app = new Hono<{ Variables: { owner: string } }>();

  // POST /api/auth/login -> { token, user }
  app.post("/login", async (c) => {
    const body = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await c.req.json());
    const user = await users.verifyCredentials(body.email, body.password);
    if (!user) throw new AppError("Email o contrasena incorrectos", 401);

    const token = randomBytes(32).toString("base64url");
    await db.put("system", "sessions", {
      id: digest(token),
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        setup: user.setup,
      },
    });
  });

  // POST /api/auth/logout
  app.post("/logout", async (c) => {
    const auth = c.req.header("authorization");
    if (auth?.startsWith("Bearer ")) {
      await db.remove("system", "sessions", digest(auth.slice(7)));
    }
    return c.json({ ok: true });
  });

  // GET /api/auth/me -> usuario autenticado actual
  app.get("/me", async (c) => {
    const user = await users.getById(c.get("owner"));
    if (!user) throw new AppError("Usuario no encontrado", 404);
    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      setup: user.setup,
    });
  });

  // GET /api/auth/users -> solo admin
  app.get("/users", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const all: User[] = await users.list();
    return c.json(
      all.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
        setup: u.setup,
        createdAt: u.createdAt,
      })),
    );
  });

  // POST /api/auth/users -> crear usuario (solo admin)
  app.post("/users", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const body = createUserSchema.parse(await c.req.json());
    const user = await users.create(body);
    return c.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        setup: user.setup,
      },
      201,
    );
  });

  // PATCH /api/auth/users/:id -> editar usuario (solo admin)
  app.patch("/users/:id", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const id = c.req.param("id");
    if (id === me.id && (await c.req.json<{ role?: string }>()).role === "user")
      throw new AppError("No puedes quitarte el rol admin a ti mismo", 409);
    const body = updateUserSchema.parse(await c.req.json());
    const updated = await users.update(id, body);
    return c.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      active: updated.active,
      setup: updated.setup,
    });
  });

  // DELETE /api/auth/users/:id (solo admin)
  app.delete("/users/:id", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    if (c.req.param("id") === me.id) throw new AppError("No puedes borrarte a ti mismo", 409);
    await users.remove(c.req.param("id"));
    return c.json({ ok: true });
  });

  return app;
}