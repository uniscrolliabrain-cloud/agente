import { randomBytes, createHash } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { userRoleSchema, userSetupSchema, type User, type UserService } from "./users.ts";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

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

export function authRoutes(
  db: Store,
  users: UserService,
  options: { ensureSample?: (owner: string) => Promise<void> } = {},
) {
  const app = new Hono<{ Variables: { owner: string } }>();

  const loginAttempts = new Map<string, number[]>();
  const LOGIN_WINDOW_MS = 60_000;
  const LOGIN_MAX_ATTEMPTS = 10;
  const loginKey = (ip: string, email: string) => `${ip}|${email.toLowerCase().trim()}`;
  const checkLoginLimit = (ip: string, email: string) => {
    const key = loginKey(ip, email);
    const now = Date.now();
    const recent = (loginAttempts.get(key) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
    if (recent.length >= LOGIN_MAX_ATTEMPTS) {
      loginAttempts.set(key, recent);
      throw new AppError("Demasiados intentos. Espera un minuto e intentalo de nuevo.", 429);
    }
    recent.push(now);
    loginAttempts.set(key, recent);
  };

  // POST /api/auth/login -> { token, user }
  app.post("/login", async (c) => {
    const body = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await c.req.json());
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "unknown";
    checkLoginLimit(ip, body.email);
    const user = await users.verifyCredentials(body.email, body.password);
    if (!user) throw new AppError("Email o contrasena incorrectos", 401);
    if (options.ensureSample) await options.ensureSample(user.id);

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
    const all = await db.list<Record<string, unknown>>(target.id, "tasks");
    const tasks = all
      .sort((a: any, b: any) =>
        String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")),
      )
      .slice(0, limit)
      .map((t: any) => ({
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
    return c.json({ userId: target.id, total: all.length, tasks });
  });

  return app;
}