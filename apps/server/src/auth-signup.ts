// AUTH_SIGNUP_V1 - endpoints POST /api/auth/signup y /api/auth/verify.
// El signup guarda un VerificationToken y manda email. El verify crea el
// usuario y el tenant real, y devuelve una sesion normal.

import { randomBytes, randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import {
  signupRequestSchema,
  slugify,
  verificationTokenSchema,
  type VerificationToken,
} from "../../packages/domain/src/signup.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { sendEmail, verifyEmailTemplate } from "./email.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import type { TenantService } from "./engine/tenant.ts";
import { UserService, hashPassword } from "./users.ts";

const TOKEN_KIND = "signup-tokens";
const HOUR = 60 * 60 * 1000;

function ttlMs(): number {
  const hours = Number(process.env.VERIFY_TTL_HOURS ?? "48") || 48;
  return hours * HOUR;
}

export interface SignupRoutesDeps {
  db: Store;
  config: Config;
  users: UserService;
  tenantService?: TenantService;
}

export function signupRoutes({ db, config, users, tenantService }: SignupRoutesDeps) {
  const app = new Hono<{ Variables: { owner: string } }>();
  // SIGNUP_RATE_LIMIT_V1 - maximo 5 cuentas nuevas por IP cada hora.
  const signupLimiter = new RateLimiter(5, 60 * 60 * 1000);

  // POST /api/auth/signup
  app.post("/signup", async (c) => {
    const enabled = process.env.SIGNUP_ENABLED === "true";
    if (!enabled) throw new AppError("Signup is disabled", 503);

    // SIGNUP_RATE_LIMIT_V1 - aplica antes de parsear y de tocar DB.
    const address =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const verdict = signupLimiter.take(address);
    if (!verdict.allowed) {
      c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
      throw new AppError("Demasiadas cuentas creadas desde esta IP. Prueba mas tarde.", 429);
    }
    const body = signupRequestSchema.parse(await c.req.json());
    const email = body.email.toLowerCase().trim();

    // Anti-enumeracion: si el email ya existe, respondemos lo mismo y no
    // enviamos email adicional.
    const existing = await users.getByEmail(email);
    if (existing) {
      return c.json({ ok: true, message: "Revisa tu email para confirmar la cuenta." });
    }

    const passwordHash = await hashPassword(body.password);
    const tenantSlug = slugify(body.organization) || `org-${randomUUID().slice(0, 8)}`;
    const now = new Date();
    const id = randomBytes(32).toString("base64url");
    const token: VerificationToken = verificationTokenSchema.parse({
      id,
      email,
      name: body.name,
      passwordHash,
      organization: body.organization,
      tenantSlug,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs()).toISOString(),
    });
    await db.put("system", TOKEN_KIND, token);

    const verifyUrl = `${config.publicUrl}/api/auth/verify?token=${encodeURIComponent(id)}`;
    const emailTemplate = verifyEmailTemplate({
      name: body.name,
      org: body.organization,
      verifyUrl,
    });
    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    if (!result.ok && !result.skipped) {
      backgroundFailure("signup email", new Error(result.error ?? "email send failed"));
    }

    return c.json({ ok: true, message: "Revisa tu email para confirmar la cuenta." });
  });

  // GET /api/auth/verify?token=...
  app.get("/verify", async (c) => {
    const token = c.req.query("token");
    if (!token) throw new AppError("Falta token", 422);
    const stored = await db.get<VerificationToken>("system", TOKEN_KIND, token);
    if (!stored) throw new AppError("Token invalido o expirado", 404);
    if (stored.usedAt) throw new AppError("Token ya usado", 409);
    if (Date.parse(stored.expiresAt) < Date.now()) throw new AppError("Token expirado", 410);

    // Consume el token atomicamente.
    const consumed = await db.compareAndSwap<VerificationToken>(
      "system",
      TOKEN_KIND,
      token,
      { id: token, usedAt: null },
      { usedAt: new Date().toISOString() },
    );
    if (!consumed) throw new AppError("Token ya usado", 409);

    // Crea el usuario.
    const user = await users.create({
      email: stored.email,
      name: stored.name,
      password: "__from_token__",
      role: "admin",
    });
    // Reemplaza el passwordHash por el que guardamos en el token.
    const record = await db.get<{ id: string; data: unknown; passwordHash: string }>(
      "system",
      "users",
      user.id,
    );
    if (record) {
      await db.put("system", "users", { ...record, passwordHash: stored.passwordHash });
    }

    // Crea el tenant real y la membership.
    if (tenantService) {
      await tenantService.setMembership(user.id, stored.tenantSlug).catch((error) =>
        backgroundFailure("verify tenant membership", error),
      );
    }

    // Devuelve un token de sesion.
    const sessionToken = randomBytes(32).toString("base64url");
    const digest = (await import("node:crypto")).createHash("sha256").update(sessionToken).digest("hex");
    await db.put("system", "sessions", {
      id: digest,
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * HOUR,
    });

    return c.json({
      ok: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenantId: stored.tenantSlug,
    });
  });

  return app;
}