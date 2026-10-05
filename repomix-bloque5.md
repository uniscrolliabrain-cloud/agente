This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/**/google*.ts, apps/server/src/**/gmail*.ts, apps/server/src/**/stripe*.ts, apps/server/src/**/evolution*.ts, apps/server/src/**/integrations/**, apps/server/src/**/clients/**, apps/server/src/**/business/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        business/
          graph.ts
          resolver.ts
          truth-resolver.ts
          truth.ts
      google-auth.ts
```

# Files

## File: apps/server/src/google-auth.ts
```typescript
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { decryptSecret, encryptSecret } from "../../../packages/integrations/src/vault.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";

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
}
interface OAuthState {
  id: string;
  owner: string;
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
}
export class GoogleAuth {
  private readonly refreshing = new Map<string, Promise<string>>();
  constructor(
    private readonly db: Store,
    private readonly config: Config,
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
        secret: encryptSecret(JSON.stringify(tokens), this.config.encryptionKey),
      },
    );
    if (!saved)
      throw new AppError("Google sign-in changed or was disconnected. Connect again.", 409);
  }
  private async rotateGeneration(owner: string, disconnect = false) {
    const generation = randomUUID();
    for (;;) {
      const previous = await this.db.get<Credential>(owner, "credentials", "google");
      if (!previous) {
        const inserted = await this.db.insertIfAbsent(owner, "credentials", {
          id: "google",
          generation,
          connectionId: null,
          secret: null,
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
    const { generation, previous } = await this.rotateGeneration(owner);
    const existing = this.decodeTokens(previous);
    const scopes = Array.from(
      new Set([
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar.events.readonly",
        "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
        ...(existing?.scopes ?? []),
        ...(write
          ? [
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
            ]
          : []),
      ]),
    );
    await this.db.put("system", "oauth", {
      id: state,
      owner,
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
    const state = await this.db.take<OAuthState>("system", "oauth", stateId);
    if (!state || state.expiresAt < Date.now())
      throw new AppError("Google sign-in expired. Connect again.", 400);
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
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new AppError("Google could not complete sign-in. Connect again.", 502);
    const token = tokenSchema.parse(await response.json());
    const profile = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(15000),
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
  private async refresh(owner: string, tokens: Tokens) {
    if (!tokens.refreshToken) throw new AppError("Google session expired. Connect again.", 401);
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.config.googleClientId ?? "",
        client_secret: this.config.googleClientSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
      signal: AbortSignal.timeout(15000),
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
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok && response.status !== 400)
        throw new AppError(
          "Disconnected locally. Google revocation failed; remove access in your Google account settings.",
          502,
        );
    }
  }
}
```

## File: apps/server/src/engine/business/resolver.ts
```typescript
// ENTITY_RESOLVER_V1 - resuelve entidades candidatas por email/name/cif.

import type { Store } from "../../db.ts";
import type { BusinessEntity } from "../../../../../packages/domain/src/business.ts";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(s\.?l\.?|s\.?a\.?|inc|llc)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export class EntityResolver {
  constructor(private readonly db: Store) {}

  async findCandidates(
    tenantId: string,
    owner: string,
    type: string,
    candidate: { name?: string; email?: string; cif?: string },
  ): Promise<Array<{ entityId: string; confidence: number; reasons: string[] }>> {
    const all = await this.db.list<BusinessEntity>(owner, "business-entities");
    const typed = all.filter((e) => e.type === type);
    const matches: Array<{ entityId: string; confidence: number; reasons: string[] }> = [];

    for (const entity of typed) {
      const reasons: string[] = [];
      const props = entity.properties as Record<string, unknown>;

      if (candidate.email && props.email && String(props.email).toLowerCase() === candidate.email.toLowerCase()) {
        reasons.push("same_email");
      }
      if (candidate.cif && props.cif && String(props.cif).toUpperCase() === candidate.cif.toUpperCase()) {
        reasons.push("same_cif");
      }
      if (candidate.name && entity.name && normalize(entity.name) === normalize(candidate.name)) {
        reasons.push("normalized_name");
      }

      if (reasons.length > 0) {
        matches.push({
          entityId: entity.id,
          confidence: Math.min(1, reasons.length * 0.4),
          reasons,
        });
      }
    }

    void tenantId;
    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
}
```

## File: apps/server/src/engine/business/truth-resolver.ts
```typescript
// TRUTH_RESOLVER_V1 - resuelve entre múltiples fuentes de verdad.

import type { TruthCandidate, TruthResolution } from "../../../../../packages/domain/src/truth.ts";

export class TruthResolver {
  resolve(field: string, candidates: TruthCandidate[]): TruthResolution {
    if (candidates.length === 0) {
      throw new Error(`No candidates for field ${field}`);
    }

    const scored = candidates
      .map((c) => ({
        ...c,
        score: c.reliability * c.confidence * freshness(c.observedAt),
      }))
      .sort((a, b) => b.score - a.score);

    const winner = scored[0];
    const conflicts = scored.slice(1).filter((c) => JSON.stringify(c.value) !== JSON.stringify(winner.value));

    return {
      field,
      value: winner.value,
      source: winner.source,
      confidence: winner.confidence,
      kind: winner.kind,
      resolvedAt: new Date().toISOString(),
      conflicts: conflicts.slice(0, 10),
      wasConflict: conflicts.length > 0,
    };
  }
}

function freshness(observedAt: string): number {
  const ageMs = Date.now() - Date.parse(observedAt);
  const ageDays = ageMs / 86400000;
  return Math.max(0.1, 1 - ageDays / 30);
}
```

## File: apps/server/src/engine/business/truth.ts
```typescript
// TRUTH_RESOLVER_CABLE_V2 - resolveField usa TruthResolver real.
import type { BusinessEntity } from "../../../../../packages/domain/src/business.ts";
import type { BusinessGraph } from "./graph.ts";
import { TruthResolver } from "./truth-resolver.ts";

export interface TruthValue {
  value: unknown;
  source: string;
  actor: string;
  updatedAt: string;
  confidence?: number;
}

export interface EntityTruth {
  entityId: string;
  type: string;
  name: string;
  status?: string;
  properties: Record<string, TruthValue>;
  provenance: {
    source: string;
    actor: string;
    updatedAt: string;
    confidence?: number;
  };
}

export class BusinessTruth {
  constructor(private readonly graph: BusinessGraph) {}

  async forEntity(owner: string, entityId: string): Promise<EntityTruth | null> {
    const entity = await this.graph.getEntity(owner, entityId);
    if (!entity) return null;
    return this.project(entity);
  }

  // TRUTH_RESOLVER_WIRE_V1 - resuelve un campo entre varios candidatos.
  resolveField(field: string, candidates: import("../../../../../packages/domain/src/truth.ts").TruthCandidate[]) {
    return new TruthResolver().resolve(field, candidates);
  }

  project(entity: BusinessEntity): EntityTruth {
    const properties: Record<string, TruthValue> = {};
    for (const [key, value] of Object.entries(entity.properties)) {
      properties[key] = {
        value,
        source: entity.provenance.source,
        actor: entity.provenance.actor,
        updatedAt: entity.provenance.updatedAt,
        ...(entity.provenance.confidence !== undefined
          ? { confidence: entity.provenance.confidence }
          : {}),
      };
    }
    return {
      entityId: entity.id,
      type: entity.type,
      name: entity.name,
      ...(entity.status ? { status: entity.status } : {}),
      properties,
      provenance: entity.provenance,
    };
  }
}
```

## File: apps/server/src/engine/business/graph.ts
```typescript
// GRAPH_STATE_MACHINE_V2 - updateEntity valida contra el StateMachineRegistry.
// GRAPH_ENTITY_RESOLVER_V2 - busca duplicados por email, CIF, nombre normalizado.
// B101b_APPLIED
import { randomUUID } from "node:crypto";
import {
  type BusinessEntity,
  type BusinessRelation,
  businessEntitySchema,
  businessRelationSchema,
} from "../../../../../packages/domain/src/business.ts";
import type { Store } from "../../db.ts";
import { AppError } from "../../errors.ts";
import type { EventBus } from "../events/index.ts";
import type { StateMachineRegistry } from "../state-machines.ts";

const ENTITY_KIND = "business-entities";
const RELATION_KIND = "business-relations";

export interface CreateEntityInput {
  id?: string;
  type: string;
  name: string;
  status?: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
  confidence?: number;
}

export interface UpdateEntityInput {
  name?: string;
  status?: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
  confidence?: number;
}

export interface CreateRelationInput {
  id?: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  properties?: Record<string, unknown>;
  actor: string;
  source: string;
}

export interface Neighborhood {
  entities: BusinessEntity[];
  relations: BusinessRelation[];
}

export class BusinessGraph {
  constructor(
    private readonly db: Store,
    private readonly bus?: EventBus,
    private readonly stateMachines?: StateMachineRegistry,
  ) {}

  // GRAPH_RESOLVER_WIRE_V1 - busca duplicados por cif/email/name antes de crear.
  async createEntity(owner: string, input: CreateEntityInput): Promise<BusinessEntity> {
    // BUSINESS_SCHEMA_WIRE_V2 - validar contra el schema del tenant.
    await this.validateAgainstSchema(owner, input.type, input.properties ?? {});
    // GRAPH_RESOLVER_WIRE_V1 - solo si no hay id explicito, buscamos candidatos.
    const id = input.id ?? randomUUID();
    if (!input.id) {
      try {
        const { EntityResolver } = await import("./resolver.ts");
        const matches = await new EntityResolver(this.db).findCandidates(owner, owner, input.type, {
          ...(input.name ? { name: input.name } : {}),
          ...(typeof input.properties?.email === "string" ? { email: input.properties.email } : {}),
          ...(typeof input.properties?.cif === "string" ? { cif: input.properties.cif } : {}),
        });
        const strong = matches.find((m) => m.confidence >= 0.8);
        if (strong) {
          const found = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, strong.entityId);
          if (found) return found;
        }
      } catch {
        // best-effort: si el resolver falla, se crea igual.
      }
    }
    const existing = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (existing) throw new AppError(`Entity already exists: ${id}`, 409);
    const entity = businessEntitySchema.parse({
      id,
      type: input.type,
      name: input.name,
      ...(input.status ? { status: input.status } : {}),
      properties: input.properties ?? {},
      schemaVersion: "1.0",
      // BUSINESS_GRAPH_VERSION_V1 - primera version.
      version: 1,
      provenance: {
        source: input.source,
        actor: input.actor,
        updatedAt: new Date().toISOString(),
        ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
      },
    });
    await this.db.insertIfAbsent(owner, ENTITY_KIND, entity);
    await this.bus?.emit(owner, "entity.created", { kind: "entity", id: entity.id }, {
      entityId: entity.id,
      entityType: entity.type,
      version: 1,
    });
    return entity;
  }

  async updateEntity(owner: string, id: string, patch: UpdateEntityInput): Promise<BusinessEntity> {
    const current = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (!current) throw new AppError(`Entity not found: ${id}`, 404);
    // B101b — si la entidad declara stateMachineId y este patch cambia status,
    // validamos la transicion via StateMachineRegistry. Sin stateMachineId o sin
    // registry, comportamiento previo.
    if (
      this.stateMachines &&
      current.stateMachineId &&
      patch.status !== undefined &&
      patch.status !== current.status
    ) {
      const from = current.status ?? "";
      await this.stateMachines.apply(owner, current.stateMachineId, id, from, patch.status, patch.actor);
    }
    const nextVersion = current.version + 1;
    const next = businessEntitySchema.parse({
      ...current,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      properties: { ...current.properties, ...(patch.properties ?? {}) },
      // BUSINESS_GRAPH_VERSION_V1 - version monotonica. Antes siempre 1.
      version: nextVersion,
      provenance: {
        source: patch.source,
        actor: patch.actor,
        updatedAt: new Date().toISOString(),
        ...(patch.confidence !== undefined ? { confidence: patch.confidence } : {}),
      },
    });
    await this.db.put(owner, ENTITY_KIND, next);
    await this.bus?.emit(owner, "entity.updated", { kind: "entity", id }, {
      entityId: id,
      entityType: next.type,
      // BUSINESS_GRAPH_VERSION_V1 - la version real, no 1.
      version: nextVersion,
      changedFields: Object.keys(patch).filter((key) => key !== "actor" && key !== "source"),
    });
    return next;
  }

  async getEntity(owner: string, id: string): Promise<BusinessEntity | null> {
    return this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
  }

  async listEntities(owner: string, type?: string): Promise<BusinessEntity[]> {
    const all = await this.db.list<BusinessEntity>(owner, ENTITY_KIND);
    return type ? all.filter((entity) => entity.type === type) : all;
  }

  async deleteEntity(owner: string, id: string, actor: string): Promise<void> {
    const current = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, id);
    if (!current) throw new AppError(`Entity not found: ${id}`, 404);
    const relations = await this.db.list<BusinessRelation>(owner, RELATION_KIND);
    for (const relation of relations) {
      if (relation.fromEntityId === id || relation.toEntityId === id) {
        await this.db.remove(owner, RELATION_KIND, relation.id);
        await this.bus?.emit(owner, "relation.deleted", { kind: "relation", id: relation.id }, {
          relationId: relation.id,
        });
      }
    }
    await this.db.remove(owner, ENTITY_KIND, id);
    await this.bus?.emit(owner, "entity.deleted", { kind: "entity", id }, {
      entityId: id,
      entityType: current.type,
    });
    void actor;
  }

  // BUSINESS_SCHEMA_WIRE_V2 - valida el payload contra el schema del tenant.
  // Si no hay schema registrado o no hay definicion para ese type, deja pasar.
  private async validateAgainstSchema(
    owner: string,
    entityType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    let schema: { entities?: Array<{ type: string; fields?: Array<{ name: string; required?: boolean; type?: string; enumValues?: string[] }> }> } | null = null;
    try {
      schema = await this.db.get(owner, "business-schemas", "default");
    } catch {
      return;
    }
    if (!schema?.entities) return;
    const def = schema.entities.find((e) => e.type === entityType);
    if (!def) return;
    for (const field of def.fields ?? []) {
      const value = payload[field.name];
      if (field.required && (value === undefined || value === null)) {
        throw new AppError(`Entity ${entityType} requires field ${field.name}`, 422);
      }
      if (value === undefined || value === null) continue;
      if (field.type === "number" && typeof value !== "number") {
        throw new AppError(`Field ${field.name} must be number`, 422);
      }
      if (field.type === "boolean" && typeof value !== "boolean") {
        throw new AppError(`Field ${field.name} must be boolean`, 422);
      }
      if (field.type === "enum" && field.enumValues && !field.enumValues.includes(String(value))) {
        throw new AppError(`Field ${field.name} must be one of ${field.enumValues.join(", ")}`, 422);
      }
    }
  }

  async createRelation(owner: string, input: CreateRelationInput): Promise<BusinessRelation> {
    const id = input.id ?? randomUUID();
    const from = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, input.fromEntityId);
    if (!from) throw new AppError(`From entity not found: ${input.fromEntityId}`, 404);
    const to = await this.db.get<BusinessEntity>(owner, ENTITY_KIND, input.toEntityId);
    if (!to) throw new AppError(`To entity not found: ${input.toEntityId}`, 404);
    const relation = businessRelationSchema.parse({
      id,
      fromEntityId: input.fromEntityId,
      toEntityId: input.toEntityId,
      type: input.type,
      properties: input.properties ?? {},
      provenance: {
        source: input.source,
        actor: input.actor,
        updatedAt: new Date().toISOString(),
      },
    });
    // BUSINESS_GRAPH_RELATION_RACE_V1 - antes emitiamos relation.created
    // aunque insertIfAbsent hubiera devuelto null (la relacion ya existia).
    // Eso corrompia el event log factual: decia "se creo" cuando no se creo.
    const inserted = await this.db.insertIfAbsent(owner, RELATION_KIND, relation);
    if (inserted) {
      await this.bus?.emit(owner, "relation.created", { kind: "relation", id: relation.id }, {
        relationId: relation.id,
        fromEntityId: relation.fromEntityId,
        toEntityId: relation.toEntityId,
        relationType: relation.type,
      });
    }
    return relation;
  }

  async listRelations(owner: string, entityId?: string): Promise<BusinessRelation[]> {
    const all = await this.db.list<BusinessRelation>(owner, RELATION_KIND);
    if (!entityId) return all;
    return all.filter(
      (relation) => relation.fromEntityId === entityId || relation.toEntityId === entityId,
    );
  }

  async neighborhood(owner: string, entityId: string, depth = 1): Promise<Neighborhood> {
    const entities = await this.listEntities(owner);
    const relations = await this.listRelations(owner);
    const entityMap = new Map(entities.map((entity) => [entity.id, entity]));
    const found = new Set<string>([entityId]);
    let frontier = new Set<string>([entityId]);
    for (let level = 0; level < depth; level += 1) {
      const next = new Set<string>();
      for (const relation of relations) {
        if (!frontier.has(relation.fromEntityId) && !frontier.has(relation.toEntityId)) continue;
        next.add(relation.fromEntityId);
        next.add(relation.toEntityId);
      }
      for (const id of next) if (!found.has(id)) found.add(id);
      frontier = next;
      if (next.size === 0) break;
    }
    return {
      entities: [...found]
        .map((id) => entityMap.get(id))
        .filter((entity): entity is BusinessEntity => Boolean(entity)),
      relations: relations.filter(
        (relation) => found.has(relation.fromEntityId) && found.has(relation.toEntityId),
      ),
    };
  }
}
```
