import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { decryptSecret, encryptSecret } from "../../../packages/integrations/src/vault.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";

/**
 * GOOGLE_CREDENTIAL_SCOPE_V1 - las credenciales de Google se guardan por
 * empresa. Antes GoogleAuth recibia el Store crudo: el mismo usuario en dos
 * empresas compartia token, y una accion en B leia el Gmail de A. Este tipo
 * estrecho permite pasarle el TenantScopedStore sin arrastrar el Store entero.
 */
type GoogleStore = Pick<
  Store,
  "get" | "put" | "compareAndSwap" | "insertIfAbsent" | "take" | "updateCredential"
>;

/**
 * GOOGLE_CONNECTION_RECORD_V1 (campana 11) - una conexion operativa es un
 * registro con empresa, proveedor, cuenta, scopes, generacion y autorizante.
 * Antes solo habia tokens cifrados: ni el panel ni el gate podian decir a que
 * empresa servia la cuenta ni quien habia autorizado el consentimiento.
 */
export interface GoogleConnection {
  id: string;
  tenantId: string | null;
  provider: "google";
  account: string;
  scopes: string[];
  /** true solo si el consentimiento incluye escritura. */
  write: boolean;
  generation: string | null;
  authorizer: string;
  connectedAt: string | null;
}

/** GOOGLE_SCOPES_READ_V1 - consentimiento operativo por defecto. */
const READ_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];
/** GOOGLE_SCOPES_WRITE_V1 - solo cuando la operacion pide escritura. */
const WRITE_SCOPES = [
  // Full Gmail, full Calendar and full Drive: read, write, delete and sharing.
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive",
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
/** Marca de escritura: sin este scope no hay envio ni modificacion. */
const WRITE_MARKER = "https://mail.google.com/";

export interface GoogleAuthChecks {
  /**
   * GOOGLE_MEMBERSHIP_CHECK_V1 (campana 11) - membership fresca del autorizante
   * en la empresa de la conexion. Debe PROPAGAR el fallo del store: un error
   * de base no se convierte en "no es miembro".
   */
  membership?: (actorId: string, tenantId: string) => Promise<boolean>;
}

const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  expires_in: z.number(),
  scope: z.string().optional(),
});
interface Tokens {
  connectionId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
  account: string;
  /** GOOGLE_CONNECTION_ATTRIBUTION_V1 - empresa y autorizante del consentimiento. */
  tenantId?: string;
  authorizer?: string;
  provider?: "google";
  connectedAt?: string;
}
interface OAuthState {
  id: string;
  owner: string;
  /** Quien inicio el consentimiento, para atribuir la conexion. */
  authorizer?: string;
  /** Empresa que inicio el consentimiento; el callback no tiene sesion. */
  tenantId?: string;
  expiresAt: number;
  verifier: string;
  scopes: string[];
  generation: string;
}
interface Credential {
  id: string;
  generation?: string;
  connectionId: string | null;
  secret: string | null;
  /** Empresa a la que pertenece la credencial, si esta atribuida. */
  tenantId?: string;
  provider?: string;
}
export class GoogleAuth {
  private readonly refreshing = new Map<string, Promise<string>>();
  constructor(
    private readonly db: GoogleStore,
    private readonly config: Config,
    /**
     * El `state` de OAuth vive fuera del scope: lo escribe la peticion
     * autenticada y lo consume el callback de Google, que no trae sesion. Si se
     * guardara en el store scoped, la clave cambiaria entre las dos y el
     * consentimiento se perderia.
     */
    private readonly stateStore: GoogleStore = db,
    private readonly checks: GoogleAuthChecks = {},
  ) {}
  configured() {
    return Boolean(
      this.config.googleClientId && this.config.googleClientSecret && this.config.encryptionKey,
    );
  }
  async tokens(owner: string): Promise<Tokens | null> {
    return this.decodeTokens(await this.db.get<Credential>(owner, "credentials", "google"));
  }
  private decodeTokens(stored: Credential | null): Tokens | null {
    if (!stored?.secret) return null;
    if (!this.config.encryptionKey)
      throw new AppError("TOKEN_ENCRYPTION_KEY is not configured", 503);
    return JSON.parse(decryptSecret(stored.secret, this.config.encryptionKey));
  }
  private async save(owner: string, tokens: Tokens, generation: string) {
    if (!this.config.encryptionKey)
      throw new AppError("TOKEN_ENCRYPTION_KEY is not configured", 503);
    const saved = await this.db.compareAndSwap<Credential>(
      owner,
      "credentials",
      "google",
      { generation },
      {
        generation: randomUUID(),
        connectionId: tokens.connectionId,
        provider: "google",
        ...(tokens.tenantId ? { tenantId: tokens.tenantId } : {}),
        secret: encryptSecret(JSON.stringify(tokens), this.config.encryptionKey),
      },
    );
    if (!saved)
      throw new AppError("Google sign-in changed or was disconnected. Connect again.", 409);
  }
  private async rotateGeneration(owner: string, disconnect = false, tenantId?: string) {
    const attribution = tenantId ? { tenantId, provider: "google" } : {};
    const generation = randomUUID();
    for (;;) {
      const previous = await this.db.get<Credential>(owner, "credentials", "google");
      if (!previous) {
        const inserted = await this.db.insertIfAbsent(owner, "credentials", {
          id: "google",
          generation,
          connectionId: null,
          secret: null,
          ...attribution,
        });
        if (inserted) return { generation, previous: null };
      } else {
        const updated = await this.db.compareAndSwap<Credential>(
          owner,
          "credentials",
          "google",
          { ...previous },
          {
            generation,
            ...attribution,
            ...(disconnect ? { connectionId: null, secret: null } : {}),
          },
        );
        if (updated) return { generation, previous };
      }
    }
  }
  async connect(owner: string, write: boolean) {
    if (!this.configured())
      throw new AppError(
        "Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and TOKEN_ENCRYPTION_KEY to connect Google",
        503,
      );
    const state = randomBytes(32).toString("base64url"),
      verifier = randomBytes(48).toString("base64url");
    // GOOGLE_SCOPES_LEAST_PRIVILEGE_V1 (campana 11) - el consentimiento pide
    // exactamente lo que la operacion necesita. Antes se arrastraban los scopes
    // ya concedidos, asi que reconectar en solo lectura seguia pidiendo Gmail y
    // Drive completos, y el minimo privilegio nunca se cumplia.
    const scope = currentTenantScope();
    const tenantId = scope?.tenantId;
    const { generation } = await this.rotateGeneration(owner, false, tenantId);
    const scopes = write ? [...READ_SCOPES, ...WRITE_SCOPES] : [...READ_SCOPES];
    await this.stateStore.put("system", "oauth", {
      id: state,
      owner,
      ...(tenantId ? { tenantId } : {}),
      ...(scope?.actorId ? { authorizer: scope.actorId } : {}),
      expiresAt: Date.now() + 10 * 60 * 1000,
      verifier,
      scopes,
      generation,
    });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: this.config.googleClientId ?? "",
      redirect_uri: this.config.googleRedirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      state,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      code_challenge_method: "S256",
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    }).toString();
    return { url: url.toString() };
  }
  async callback(stateId: string, code: string) {
    const state = await this.stateStore.take<OAuthState>("system", "oauth", stateId);
    if (!state || state.expiresAt < Date.now())
      throw new AppError("Google sign-in expired. Connect again.", 400);
    // GOOGLE_CALLBACK_TENANT_V1 - el callback no trae JWT: la empresa viaja en
    // el state firmado por nosotros y se restaura para escribir la credencial
    // en la misma zona donde se pidio el consentimiento.
    const finish = async () => {
      // GOOGLE_CALLBACK_MEMBERSHIP_V1 (campana 11) - el consentimiento es de
      // hace minutos: si al autorizante le quitaron la empresa, la credencial
      // no se escribe. `take` ya consumio el state, asi que no hay reintento.
      await this.assertMembership(state.owner, state.tenantId);
      return this.finishCallback(state, code);
    };
    return state.tenantId
      ? runInTenantScope({ tenantId: state.tenantId, actorId: state.owner }, finish)
      : finish();
  }
  private async finishCallback(state: OAuthState, code: string) {
    const credential = await this.db.get<Credential>(state.owner, "credentials", "google");
    if (!state.generation || credential?.generation !== state.generation)
      throw new AppError("Google sign-in changed or was disconnected. Connect again.", 409);
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.googleClientId ?? "",
        client_secret: this.config.googleClientSecret ?? "",
        redirect_uri: this.config.googleRedirectUri,
        grant_type: "authorization_code",
        code,
        code_verifier: state.verifier,
      }),
      signal: AbortSignal.timeout(this.config.toolTimeouts?.googleHttpMs ?? 15000),
    });
    if (!response.ok) throw new AppError("Google could not complete sign-in. Connect again.", 502);
    const token = tokenSchema.parse(await response.json());
    const profile = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(this.config.toolTimeouts?.googleHttpMs ?? 15000),
    });
    if (!profile.ok)
      throw new AppError("Google did not grant Gmail read access. Connect again.", 403);
    const { emailAddress } = z.object({ emailAddress: z.email() }).parse(await profile.json());
    const previous = await this.tokens(state.owner);
    await this.save(
      state.owner,
      {
        connectionId: randomUUID(),
        accessToken: token.access_token,
        refreshToken:
          token.refresh_token ??
          (previous?.account === emailAddress ? previous.refreshToken : undefined),
        expiresAt: Date.now() + token.expires_in * 1000,
        scopes: token.scope?.split(" ") ?? state.scopes,
        account: emailAddress,
        provider: "google",
        authorizer: state.authorizer ?? state.owner,
        connectedAt: new Date().toISOString(),
        ...(state.tenantId ? { tenantId: state.tenantId } : {}),
      },
      state.generation,
    );
  }
  async accessToken(owner: string, expectedConnectionId?: string): Promise<string> {
    const tokens = await this.tokens(owner);
    if (!tokens) throw new AppError("Google is disconnected", 409);
    if (expectedConnectionId && tokens.connectionId !== expectedConnectionId)
      throw new AppError("Google account or connection changed. Prepare a new action.", 409);
    if (tokens.expiresAt > Date.now() + 60000) return tokens.accessToken;
    const refreshKey = `${owner}:${tokens.connectionId}`;
    const pending = this.refreshing.get(refreshKey);
    if (pending) return pending;
    const task = this.refresh(owner, tokens).finally(() => this.refreshing.delete(refreshKey));
    this.refreshing.set(refreshKey, task);
    return task;
  }
  /**
   * GOOGLE_MEMBERSHIP_RECHECK_V1 (campana 11) - sin esta comprobacion un
   * miembro expulsado seguia refrescando el token y operando con la cuenta de
   * la empresa. Solo policia credenciales atribuidas: una conexion legacy sin
   * empresa registrada no se adopta aqui, se atribuye al reconectar.
   */
  private async assertMembership(actorId: string, tenantId?: string) {
    if (!tenantId || !this.checks.membership) return;
    let member: boolean;
    try {
      member = await this.checks.membership(actorId, tenantId);
    } catch {
      throw new AppError("Could not verify the company of this Google connection", 503);
    }
    if (!member)
      throw new AppError("You no longer belong to this company. Connect Google again.", 403);
  }
  /**
   * GOOGLE_CONNECTION_RECORD_V1 (campana 11) - lee la conexion operativa con
   * empresa, proveedor, cuenta, scopes, generacion y autorizante.
   */
  async connection(owner: string): Promise<GoogleConnection | null> {
    const credential = await this.db.get<Credential>(owner, "credentials", "google");
    const tokens = this.decodeTokens(credential);
    if (!tokens) return null;
    return {
      id: tokens.connectionId,
      tenantId: credential?.tenantId ?? tokens.tenantId ?? null,
      provider: "google",
      account: tokens.account,
      scopes: tokens.scopes,
      write: tokens.scopes.includes(WRITE_MARKER),
      generation: credential?.generation ?? null,
      authorizer: tokens.authorizer ?? owner,
      connectedAt: tokens.connectedAt ?? null,
    };
  }
  private async refresh(owner: string, tokens: Tokens) {
    if (!tokens.refreshToken) throw new AppError("Google session expired. Connect again.", 401);
    await this.assertMembership(owner, tokens.tenantId);
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.googleClientId ?? "",
        client_secret: this.config.googleClientSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
      signal: AbortSignal.timeout(this.config.toolTimeouts?.googleHttpMs ?? 15000),
    });
    if (!response.ok) throw new AppError("Google session expired. Connect again.", 401);
    const token = tokenSchema.parse(await response.json());
    const refreshed = {
      ...tokens,
      accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    };
    if (!this.config.encryptionKey) throw new AppError("Token encryption is not configured", 503);
    const updated = await this.db.updateCredential(
      owner,
      tokens.connectionId,
      encryptSecret(JSON.stringify(refreshed), this.config.encryptionKey),
    );
    if (!updated)
      throw new AppError("Google account changed or was disconnected during refresh", 409);
    return token.access_token;
  }
  async disconnect(owner: string) {
    const { previous } = await this.rotateGeneration(owner, true);
    const tokens = this.decodeTokens(previous);
    if (tokens) {
      const response = await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: tokens.refreshToken ?? tokens.accessToken }),
        signal: AbortSignal.timeout(this.config.toolTimeouts?.googleHttpMs ?? 15000),
      });
      if (!response.ok && response.status !== 400)
        throw new AppError(
          "Disconnected locally. Google revocation failed; remove access in your Google account settings.",
          502,
        );
    }
  }
}

