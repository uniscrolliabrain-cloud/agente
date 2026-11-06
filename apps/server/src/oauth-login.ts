// OAUTH_LOGIN_V1 - entrar con Google o GitHub.
//
// Por que existe: hasta ahora el unico acceso era email+contrasena creado por
// ADMIN_EMAIL/ADMIN_PASSWORD, o `AUTH_PROVIDER=supabase` a medias. Para uso real
// (la agencia y sus clientes) el login tiene que ser el de la cuenta que la
// persona ya usa.
//
// Flujo, identico en los dos proveedores:
//   1. GET /api/auth/oauth/<provider>/start  -> 302 al proveedor con `state`.
//   2. GET /api/auth/oauth/<provider>/callback?code&state
//      -> canjea el code, lee el email, encuentra o crea el usuario y emite una
//         sesion igual que /api/auth/login.
//   3. Devuelve una pagina minima que escribe la sesion en localStorage y
//      vuelve al panel. El panel ya guarda `openmuse_auth` y `openmuse_user`,
//      asi que no hay que tocar el cliente.
//
// OAUTH_ALLOWED_EMAILS - si esta definida (lista separada por comas), solo esos
// emails pueden entrar. Es la barandilla para un deployment abierto a internet:
// sin ella, cualquiera con cuenta de Google crearia un usuario.

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import type { UserService } from "./users.ts";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

type ProviderId = "google" | "github";

interface ProviderDefinition {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  /** Devuelve el email verificado del usuario, o null si no se puede. */
  emailFromToken: (accessToken: string) => Promise<string | null>;
}

const PROVIDERS: Record<ProviderId, ProviderDefinition> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    emailFromToken: async (accessToken) => {
      const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { email?: string; email_verified?: boolean };
      if (!body.email) return null;
      // OAUTH_EMAIL_VERIFIED_STRICT_V1 - se exige `true`, no "distinto de
      // false": si Google omitiera el campo, un email sin verificar pasaria.
      if (body.email_verified !== true) return null;
      return body.email.toLowerCase().trim();
    },
  },
  github: {
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    clientId: () => process.env.GITHUB_CLIENT_ID,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET,
    emailFromToken: async (accessToken) => {
      const headers = {
        authorization: `Bearer ${accessToken}`,
        accept: "application/vnd.github+json",
        "user-agent": "openmuse",
      };
      // OAUTH_GITHUB_VERIFIED_EMAIL_V1 - el email del perfil publico no prueba
      // propiedad de la direccion. La unica fuente valida es /user/emails, que
      // exige el scope `user:email` y distingue `verified`. Antes se aceptaba el
      // del perfil sin comprobarlo.
      const emails = await fetch("https://api.github.com/user/emails", { headers });
      if (!emails.ok) return null;
      const list = (await emails.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      const chosen = list.find((e) => e.primary && e.verified) ?? list.find((e) => e.verified);
      return chosen?.email?.toLowerCase().trim() ?? null;
    },
  },
};

// OAUTH_STATE_COOKIE_V1 - cookie que ata el `state` al navegador que inicio el
// flujo. Se limita a la ruta de OAuth y es HttpOnly: el JS del panel no la ve.
const STATE_COOKIE = "om_oauth_binding";
const STATE_COOKIE_PATH = "/api/auth/oauth";

function allowedEmails(): Set<string> | null {
  const raw = process.env.OAUTH_ALLOWED_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0),
  );
}

/** Escapa texto para incrustarlo dentro del HTML de la pagina de retorno. */
function htmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function oauthLoginRoutes(db: Store, users: UserService, config: Config) {
  const app = new Hono();

  const redirectUri = (provider: ProviderId) =>
    `${config.publicUrl.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;

  app.get("/:provider/start", async (c) => {
    const provider = c.req.param("provider") as ProviderId;
    const def = PROVIDERS[provider];
    if (!def) throw new AppError("Proveedor de login no soportado", 404);
    const clientId = def.clientId();
    if (!clientId) throw new AppError(`Falta configurar ${provider} para login (client id)`, 503);

    const state = randomBytes(24).toString("base64url");
    // OAUTH_STATE_BINDING_V1 - el `state` se ata al navegador que inicia el
    // flujo. Sin esto, un atacante empieza el login con SU cuenta y hace que la
    // victima abra el callback: la sesion resultante es la del atacante sobre el
    // navegador de la victima (login CSRF / fijacion de sesion).
    const binding = randomBytes(32).toString("base64url");
    await db.put("system", "oauth-login-state", {
      id: digest(state),
      provider,
      binding: digest(binding),
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    setCookie(c, STATE_COOKIE, binding, {
      path: STATE_COOKIE_PATH,
      httpOnly: true,
      sameSite: "Lax",
      secure: config.publicUrl.startsWith("https://"),
      maxAge: 10 * 60,
    });

    const url = new URL(def.authorizeUrl);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri(provider));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", def.scope);
    url.searchParams.set("state", state);
    if (provider === "google") {
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "select_account");
    }
    return c.redirect(url.toString(), 302);
  });

  app.get("/:provider/callback", async (c) => {
    const provider = c.req.param("provider") as ProviderId;
    const def = PROVIDERS[provider];
    if (!def) throw new AppError("Proveedor de login no soportado", 404);

    const url = new URL(c.req.url);
    const providerError = url.searchParams.get("error");
    if (providerError) {
      return c.html(page("Acceso cancelado", `El proveedor devolvio: ${htmlEscape(providerError)}`), 400);
    }
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return c.html(page("Acceso invalido", "Faltan parametros de OAuth."), 400);

    const stateId = digest(state);
    const binding = getCookie(c, STATE_COOKIE);
    deleteCookie(c, STATE_COOKIE, { path: STATE_COOKIE_PATH });
    // OAUTH_STATE_ATOMIC_CONSUME_V1 - `take` es DELETE ... RETURNING: solo un
    // callback puede canjear el state. Antes era get + remove, asi que dos
    // peticiones simultaneas con el mismo state pasaban las dos.
    const stored = await db.take<{ provider: string; binding?: string; expiresAt: number }>(
      "system",
      "oauth-login-state",
      stateId,
    );
    if (!stored) return c.html(page("Acceso invalido", "Estado de OAuth desconocido o ya usado."), 400);
    if (stored.provider !== provider) return c.html(page("Acceso invalido", "Proveedor no coincide."), 400);
    if (typeof stored.expiresAt === "number" && stored.expiresAt < Date.now()) {
      return c.html(page("Acceso caducado", "Vuelve a intentarlo."), 400);
    }
    if (!binding || !stored.binding || digest(binding) !== stored.binding) {
      return c.html(
        page("Acceso invalido", "El acceso se inicio en otro navegador. Vuelve a intentarlo."),
        400,
      );
    }

    const clientId = def.clientId();
    const clientSecret = def.clientSecret();
    if (!clientId || !clientSecret) {
      throw new AppError(`Falta configurar ${provider} para login (client id/secret)`, 503);
    }

    const tokenRes = await fetch(def.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri(provider),
      }).toString(),
    });
    if (!tokenRes.ok) {
      const detail = await tokenRes.text().catch(() => "");
      backgroundFailure(`oauth ${provider} token`, new Error(`${tokenRes.status}: ${detail.slice(0, 200)}`));
      return c.html(page("No se pudo completar el acceso", "El proveedor rechazo el codigo."), 502);
    }
    const tokenBody = (await tokenRes.json()) as { access_token?: string; error_description?: string };
    const accessToken = tokenBody.access_token;
    if (!accessToken) {
      return c.html(page("No se pudo completar el acceso", htmlEscape(tokenBody.error_description ?? "Sin token.")), 502);
    }

    const email = await def.emailFromToken(accessToken);
    if (!email) {
      return c.html(page("Sin email verificado", "La cuenta no expone un email verificado."), 403);
    }

    // OAUTH_ALLOWLIST_ALL_USERS_V1 - la lista se aplica tambien a cuentas que ya
    // existen. Antes `&& !existing` dejaba entrar a cualquier usuario creado
    // antes de activar la lista, que es justo lo que la lista debia impedir.
    // El acceso con contrasena de ADMIN_EMAIL sigue como break-glass.
    const allow = allowedEmails();
    const existing = await users.getByEmail(email);
    if (allow && !allow.has(email)) {
      return c.html(page("Cuenta no autorizada", `El email ${htmlEscape(email)} no esta en la lista de acceso.`), 403);
    }

    let user = existing;
    if (!user) {
      // El primer usuario del deployment entra como admin; el resto, como user.
      const isFirst = (await users.list()).length === 0;
      user = await users.create({
        email,
        name: email.split("@")[0] ?? email,
        // Contrasena aleatoria e inutilizable: la identidad la da el proveedor.
        password: randomBytes(32).toString("base64url"),
        role: isFirst ? "admin" : "user",
        authProviderId: `${provider}:${email}`,
      }).catch(async (error) => {
        // Carrera de dos callbacks simultaneos: si ya existe, se usa.
        const again = await users.getByEmail(email);
        if (again) return again;
        throw error;
      });
    }
    if (!user.active) {
      return c.html(page("Cuenta desactivada", "Contacta con el administrador."), 403);
    }

    const token = randomBytes(32).toString("base64url");
    await db.put("system", "sessions", {
      id: digest(token),
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const payload = {
      token,
      mode: config.mode,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        setup: user.setup,
      },
    };
    return c.html(sessionPage(payload));
  });

  return app;
}

/** Pagina de error minima (fuera del panel: el usuario aun no tiene sesion). */
function page(title: string, message: string): string {
  return `<!doctype html><html lang="es"><meta charset="utf-8">
<title>${htmlEscape(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<body style="font-family:system-ui,sans-serif;background:#0b0d12;color:#e8eaf0;display:grid;place-items:center;height:100vh;margin:0">
<div style="max-width:460px;text-align:center">
<h1 style="font-size:20px;margin:0 0 12px">${htmlEscape(title)}</h1>
<p style="color:#9aa3b2;margin:0 0 20px">${message}</p>
<a href="/" style="color:#7c9cff">Volver al acceso</a>
</div></body></html>`;
}

/**
 * Escribe la sesion en localStorage con las mismas claves que usa el panel
 * (`openmuse_auth`, `openmuse_user`) y vuelve a la raiz. Asi el login social no
 * necesita ningun cambio en el cliente.
 */
function sessionPage(payload: {
  token: string;
  mode: string;
  user: { id: string; email: string; name: string; role: string; setup: unknown };
}): string {
  const auth = JSON.stringify({ token: payload.token, mode: payload.mode });
  const user = JSON.stringify(payload.user);
  // `<\/script>` evita cerrar el bloque sialguna cadena contiene esa secuencia.
  const safe = (json: string) => json.replace(/</g, "\\u003c");
  return `<!doctype html><html lang="es"><meta charset="utf-8">
<title>Entrando...</title>
<body style="font-family:system-ui,sans-serif;background:#0b0d12;color:#e8eaf0;display:grid;place-items:center;height:100vh;margin:0">
<p>Entrando en Agntia Pro...</p>
<script>
try {
  localStorage.setItem("openmuse_auth", ${safe(JSON.stringify(auth))});
  localStorage.setItem("openmuse_user", ${safe(JSON.stringify(user))});
} catch (e) {
  document.body.textContent = "No se pudo guardar la sesion en este navegador.";
}
location.replace("/");
</script>
<noscript>Activa JavaScript para entrar.</noscript>
</body></html>`;
}
