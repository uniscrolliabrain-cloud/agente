import { createHash, randomBytes } from "node:crypto";
import { getConnInfo } from "@hono/node-server/conninfo";
import { type Context, Hono } from "hono";
import { z } from "zod";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import { RateLimiter } from "./rate-limit.ts";
import { type User, type UserService, userRoleSchema, userSetupSchema } from "./users.ts";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

/** Ventanas anti fuerza bruta del login: 20 intentos por IP y 5 por email cada 5 minutos. */
const LOGIN_ATTEMPTS_PER_IP = 20;
const LOGIN_ATTEMPTS_PER_EMAIL = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

function clientAddress(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c as unknown as Context).remote.address ?? "local";
  } catch {
    // app.request() en los tests no pasa por el servidor de Node: no hay direccion remota.
    return "local";
  }
}

const createUserSchema = z.object({
  email: z.email({ message: "El email no tiene un formato valido" }),
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar 120 caracteres"),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "La contrasena no puede superar 200 caracteres"),
  role: userRoleSchema.default("user"),
  setup: userSetupSchema.partial().optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar 120 caracteres")
    .optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
  setup: userSetupSchema.partial().optional(),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "La contrasena no puede superar 200 caracteres")
    .optional(),
});

export interface AuthRouteOptions {
  config?: Config;
  /**
   * Se ejecuta despues de un login correcto para preparar el workspace del usuario
   * (en modo sample siembra sus datos de ejemplo). Nunca puede tumbar el login.
   */
  afterLogin?: (owner: string) => Promise<void>;
}

export function authRoutes(db: Store, users: UserService, options: AuthRouteOptions = {}) {
  const app = new Hono<{ Variables: { owner: string } }>();
  const ipLimiter = new RateLimiter(LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
  const emailLimiter = new RateLimiter(LOGIN_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS);

  // POST /api/auth/login -> { token, user, mode }
  app.post("/login", async (c) => {
    const body = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await c.req.json());
    const emailKey = `email:${body.email.toLowerCase().trim()}`;
    const keys = [`ip:${clientAddress(c)}`, emailKey];
    const limiters = [ipLimiter, emailLimiter];
    for (let i = 0; i < keys.length; i += 1) {
      const verdict = limiters[i].take(keys[i]);
      if (!verdict.allowed) {
        c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
        throw new AppError("Demasiados intentos de acceso. Prueba otra vez en unos minutos.", 429);
      }
    }

    const user = await users.verifyCredentials(body.email, body.password);
    if (!user) throw new AppError("Email o contrasena incorrectos", 401);
    ipLimiter.reset(keys[0]);
    emailLimiter.reset(emailKey);

    const token = randomBytes(32).toString("base64url");
    await db.put("system", "sessions", {
      id: digest(token),
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    if (options.afterLogin) {
      try {
        await options.afterLogin(user.id);
      } catch (error) {
        // Un workspace de ejemplo que falla no puede impedir entrar.
        backgroundFailure(`login bootstrap for ${user.id}`, error);
      }
    }

    return c.json({
      token,
      mode: options.config?.mode ?? "live",
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

  // PATCH /api/auth/me -> cambiar nombre y/o contrasena del propio usuario
  app.patch("/me", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me) throw new AppError("Usuario no encontrado", 404);
    const body = z
      .object({
        name: z
          .string()
          .trim()
          .min(1, "El nombre es obligatorio")
          .max(120, "El nombre no puede superar 120 caracteres")
          .optional(),
        currentPassword: z.string().min(1).max(200).optional(),
        newPassword: z
          .string()
          .min(8, "La contrasena debe tener al menos 8 caracteres")
          .max(200, "La contrasena no puede superar 200 caracteres")
          .optional(),
      })
      .parse(await c.req.json());

    if (body.newPassword) {
      if (!body.currentPassword)
        throw new AppError("Falta la contrasena actual", 422, {
          currentPassword: "Introduce tu contrasena actual",
        });
      const ok = await users.verifyCredentials(me.email, body.currentPassword);
      if (!ok)
        throw new AppError("Contrasena actual incorrecta", 403, {
          currentPassword: "Contrasena actual incorrecta",
        });
    }

    const updated = await users.update(me.id, {
      ...(body.name ? { name: body.name } : {}),
      ...(body.newPassword ? { password: body.newPassword } : {}),
    });
    return c.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      setup: updated.setup,
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
    const raw = await c.req.json<{ role?: string; active?: boolean }>();
    if (id === me.id && raw.role === "user")
      throw new AppError("No puedes quitarte el rol admin a ti mismo", 409);
    if (id === me.id && raw.active === false)
      throw new AppError("No puedes desactivar tu propia cuenta", 409);
    const body = updateUserSchema.parse(raw);
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

  // GET /api/auth/users/:id/tasks -> ultimas tareas del usuario (solo admin)
  app.get("/users/:id/tasks", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const target = await users.getById(c.req.param("id"));
    if (!target) throw new AppError("Usuario no encontrado", 404);
    const limit = Math.min(Number(c.req.query("limit") ?? "20") || 20, 100);
    // Keyset pagination in SQL: nothing is loaded or sorted in JS.
    const [page, total] = await Promise.all([
      db.listPaged<Record<string, unknown>>(target.id, "tasks", { limit }),
      db.count(target.id, "tasks"),
    ]);
    const tasks = page.map(({ data: t }) => ({
      id: t.id,
      title: t.title,
      kind: t.kind,
      status: t.status,
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
      attempts: t.attempts,
      result: t.result,
      error: t.error,
    }));
    return c.json({ userId: target.id, total, tasks });
  });

  return app;
}