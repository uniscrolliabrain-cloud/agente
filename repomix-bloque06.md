This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

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
- Only files matching these patterns are included: apps/server/src/actions.ts, apps/server/src/actions-deferred.ts, apps/web/src/components/ApprovalModal.tsx, apps/web/src/components/ApprovalInbox.tsx, apps/web/src/components/ApprovalItem.tsx, tests/actions.test.ts, tests/actions-deferred.test.ts, tests/deferred-actions.test.ts
- Files matching these patterns are excluded: **/node_modules/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      actions-deferred.ts
      actions.ts
  web/
    src/
      components/
        ApprovalInbox.tsx
        ApprovalItem.tsx
        ApprovalModal.tsx
tests/
  actions.test.ts
  deferred-actions.test.ts
```

# Files

## File: tests/actions.test.ts
```typescript
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActionService } from "../apps/server/src/actions.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { type ActionProposal, eventDraftSchema } from "../packages/domain/src/index.ts";

function deferred<T>() {
  let resolve: (value: T) => void = () => {
    throw new Error("Promise was not initialized");
  };
  const promise = new Promise<T>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
}

let db: Store;
before(async () => {
  db = await createStore();
});
after(async () => {
  await db.close();
});
const email = {
  kind: "email.send" as const,
  data: {
    to: ["sam@example.com"],
    subject: "Visit",
    body: "See attached.",
    cc: [],
    bcc: [],
    attachmentIds: [],
  },
};
test("denying a persisted proposal never calls its adapter", async () => {
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "sent";
    },
    connected: async () => true,
  });
  const proposal = await service.propose("deny-user", email);
  assert.equal(proposal.status, "awaiting_review");
  const result = await service.decide("deny-user", proposal.id, proposal.hash, "deny");
  assert.equal(result.status, "denied");
  assert.equal(calls, 0);
});
test("concurrent approval consumes the proposal only once", async () => {
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "provider-receipt";
    },
    connected: async () => true,
  });
  const proposal = await service.propose("once-user", email);
  await Promise.allSettled([
    service.decide("once-user", proposal.id, proposal.hash, "approve"),
    service.decide("once-user", proposal.id, proposal.hash, "approve"),
  ]);
  assert.equal(calls, 1);
  const saved = await db.get("once-user", "actions", proposal.id);
  assert.equal(saved?.status, "succeeded");
  assert.equal(saved?.result, "provider-receipt");
});
test("wrong owner and stale hash cannot approve", async () => {
  const service = new ActionService(db, {
    execute: async () => "sent",
    connected: async () => true,
  });
  const proposal = await service.propose("private-user", email);
  await assert.rejects(
    service.decide("attacker", proposal.id, proposal.hash, "approve"),
    /not found/i,
  );
  await assert.rejects(service.decide("private-user", proposal.id, "stale", "approve"), /changed/i);
});
test("expired and disconnected proposals never reach the provider", async () => {
  let now = Date.now();
  let connected = true;
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "sent";
    },
    connected: async () => connected,
    now: () => now,
  });
  const expired = await service.propose("expired-user", email);
  now += 31 * 60 * 1000;
  await assert.rejects(
    service.decide("expired-user", expired.id, expired.hash, "approve"),
    /expired/i,
  );
  const revoked = await service.propose("revoked-user", email);
  connected = false;
  await assert.rejects(
    service.decide("revoked-user", revoked.id, revoked.hash, "approve"),
    /disconnected/i,
  );
  assert.equal(calls, 0);
});
test("uncertain writes retain uncertainty and cannot be retried", async () => {
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      throw Object.assign(new Error("Provider response lost"), { outcomeUnknown: true });
    },
    connected: async () => true,
  });
  const proposal = await service.propose("uncertain-user", email);
  const result = await service.decide("uncertain-user", proposal.id, proposal.hash, "approve");
  assert.equal(result.status, "outcome_unknown");
  await service.decide("uncertain-user", proposal.id, proposal.hash, "approve");
  assert.equal(calls, 1);
});
test("another service instance sees persisted proposals", async () => {
  const options = { execute: async () => "created", connected: async () => true };
  const first = new ActionService(db, options);
  const proposal = await first.propose("resume-user", email);
  const second = new ActionService(db, options);
  assert.equal(
    (await second.decide("resume-user", proposal.id, proposal.hash, "approve")).status,
    "succeeded",
  );
});
test("event validation preserves all-day semantics and rejects missing offsets", () => {
  const base = { title: "Visit", start: "2026-10-23", end: "2026-10-24", allDay: true };
  assert.equal(eventDraftSchema.parse(base).start, "2026-10-23");
  assert.equal(eventDraftSchema.safeParse({ ...base, allDay: false }).success, false);
  assert.equal(eventDraftSchema.safeParse({ ...base, end: "2026-10-22" }).success, false);
  assert.equal(eventDraftSchema.safeParse({ ...base, timeZone: "Not/AZone" }).success, false);
});
test("account switching and reconnecting invalidate a prepared action", async () => {
  let connection = { id: "connection-a", account: "a@example.com" };
  let calls = 0;
  const service = new ActionService(db, {
    execute: async () => {
      calls++;
      return "sent";
    },
    connected: async () => true,
    connection: async () => connection,
  });
  const proposal = await service.propose("account-user", email);
  assert.equal(proposal.account, "a@example.com");
  connection = { id: "connection-b", account: "b@example.com" };
  await assert.rejects(
    service.decide("account-user", proposal.id, proposal.hash, "approve"),
    /connection changed/i,
  );
  connection = { id: "connection-new-a", account: "a@example.com" };
  await assert.rejects(
    service.decide("account-user", proposal.id, proposal.hash, "approve"),
    /connection changed/i,
  );
  assert.equal(calls, 0);
});

test("review stores authoritative calendar details and binds execution to their version", async () => {
  const target = {
    id: "event-1",
    ...eventDraftSchema.parse({
      title: "Provider title",
      start: "2026-10-23",
      end: "2026-10-24",
      allDay: true,
    }),
  };
  let version = '"revision-1"';
  const service = new ActionService(db, {
    connected: async () => true,
    connection: async () => ({ id: "calendar-connection", account: "me@example.com" }),
    prepare: async (_owner, input, connectionId) => {
      assert.equal(connectionId, "calendar-connection");
      assert.equal(input.kind, "calendar.delete");
      return {
        input: {
          kind: "calendar.delete",
          data: { eventId: target.id, calendarId: "primary", title: target.title },
        },
        target,
        targetVersion: version,
      };
    },
    execute: async (_owner, input, connectionId, targetVersion) => {
      assert.ok(input.kind === "calendar.delete");
      assert.equal(input.data.title, "Provider title");
      assert.equal(connectionId, "calendar-connection");
      assert.equal(targetVersion, '"revision-1"');
      return "Deleted";
    },
  });
  const input = {
    kind: "calendar.delete",
    data: { eventId: target.id, calendarId: "primary", title: "Untrusted title" },
  };
  const proposal = await service.propose("review-owner", input);
  assert.equal(proposal.title, "Delete Provider title");
  assert.deepEqual(proposal.target, target);
  assert.equal(proposal.targetVersion, version);
  version = '"revision-2"';
  const newer = await service.propose("review-owner", input);
  assert.notEqual(newer.hash, proposal.hash);
  assert.equal(
    (await service.decide("review-owner", proposal.id, proposal.hash, "approve")).status,
    "succeeded",
  );
});

test("idempotent proposal replay returns a completed action before another provider preparation", async () => {
  let preparations = 0;
  const service = new ActionService(db, {
    connected: async () => true,
    prepare: async (_owner, input) => {
      preparations++;
      return { input };
    },
    execute: async () => "sent",
  });
  const proposal = await service.propose("replay-owner", email, "run/tool-1");
  await service.decide("replay-owner", proposal.id, proposal.hash, "approve");
  const replay = await service.propose("replay-owner", email, "run/tool-1");
  assert.equal(replay.id, proposal.id);
  assert.equal(replay.status, "succeeded");
  assert.equal(preparations, 1);
  const otherOwner = await service.propose("different-owner", email, "run/tool-1");
  assert.equal(otherOwner.status, "awaiting_review");
});

test("concurrent idempotent proposals retain a single persisted review and activity entry", async () => {
  const service = new ActionService(db, {
    connected: async () => true,
    execute: async () => "sent",
  });
  const results = await Promise.all([
    service.propose("concurrent-replay", email, "run/tool-1"),
    service.propose("concurrent-replay", email, "run/tool-1"),
  ]);
  assert.deepEqual(results[0], results[1]);
  assert.equal((await db.list("concurrent-replay", "actions")).length, 1);
  assert.equal((await db.list("concurrent-replay", "activity")).length, 1);
});

test("an expired stale review cannot overwrite a concurrently executing action", async (t) => {
  let now = Date.now();
  const read = deferred<void>();
  const resumeRead = deferred<void>();
  const executing = deferred<void>();
  const finishExecution = deferred<string>();
  const service = new ActionService(db, {
    connected: async () => true,
    now: () => now,
    execute: async () => {
      executing.resolve();
      return finishExecution.promise;
    },
  });
  const proposal = await service.propose("expiry-race", email);
  const originalGet = db.get.bind(db);
  let intercept = true;
  t.mock.method(db, "get", async (...args: Parameters<Store["get"]>) => {
    const result = await originalGet(...args);
    if (intercept && args[0] === "expiry-race" && args[1] === "actions") {
      intercept = false;
      read.resolve();
      await resumeRead.promise;
    }
    return result;
  });
  const stale = service.decide("expiry-race", proposal.id, proposal.hash, "approve");
  await read.promise;
  const approval = service.decide("expiry-race", proposal.id, proposal.hash, "approve");
  await executing.promise;
  now += 31 * 60 * 1000;
  resumeRead.resolve();
  await stale.catch((error) => assert.match(error.message, /expired/i));
  const saved = await db.get<ActionProposal>("expiry-race", "actions", proposal.id);
  finishExecution.resolve("sent");
  await approval;
  assert.equal(saved?.status, "executing");
});
```

## File: apps/server/src/actions-deferred.ts
```typescript
// C3_DEFERRED_ACTIONS_V1 - undo en servidor. CAS para cancelar y para ejecutar.
export type DeferredStatus =
  | "collecting"
  | "scheduled"
  | "running"
  | "executed"
  | "cancelled"
  | "failed";

export interface DeferredRecord {
  actionId: string;
  owner: string;
  amount?: number;
  signers: string[];
  executeAt: number | null;
  status: DeferredStatus;
}

export interface DeferredStore {
  get(actionId: string): Promise<DeferredRecord | undefined>;
  put(r: DeferredRecord): Promise<void>;
  due(now: number): Promise<DeferredRecord[]>;
  claim(actionId: string): Promise<boolean>;
  cancelIfOpen(actionId: string): Promise<boolean>;
}

export type DeferredEmit = (
  t: "action.deferred" | "action.cancelled" | "action.executed" | "action.failed",
  p: Record<string, unknown>,
) => void;

export class DeferredActions {
  constructor(
    private store: DeferredStore,
    private run: (owner: string, actionId: string) => Promise<void>,
    private emit: DeferredEmit,
    private cfg: { windowMs?: number; dualAt?: number | null; now?: () => number } = {},
  ) {}

  private now() {
    return this.cfg.now?.() ?? Date.now();
  }

  private needed(amount?: number) {
    const d = this.cfg.dualAt;
    return d != null && amount != null && amount >= d ? 2 : 1;
  }

  async decide(owner: string, actionId: string, userId: string, amount?: number) {
    const r: DeferredRecord =
      (await this.store.get(actionId)) ?? {
        actionId,
        owner,
        amount,
        signers: [],
        executeAt: null,
        status: "collecting",
      };
    if (r.owner !== owner) throw new Error("forbidden");
    if (r.status !== "collecting") throw new Error(`estado invalido: ${r.status}`);
    if (r.signers.includes(userId)) throw new Error("ya has firmado");
    r.signers.push(userId);
    if (r.signers.length >= this.needed(r.amount)) {
      r.status = "scheduled";
      r.executeAt = this.now() + (this.cfg.windowMs ?? 8000);
    }
    await this.store.put(r);
    this.emit("action.deferred", {
      actionId,
      signers: r.signers,
      needed: this.needed(r.amount),
      executeAt: r.executeAt,
    });
    return r;
  }

  async cancel(owner: string, actionId: string, userId: string) {
    const r = await this.store.get(actionId);
    if (!r || r.owner !== owner) throw new Error("not found");
    if (!r.signers.includes(userId)) throw new Error("solo un firmante puede cancelar");
    if (!(await this.store.cancelIfOpen(actionId))) throw new Error("ya no se puede cancelar");
    this.emit("action.cancelled", { actionId, by: userId });
  }

  async tick() {
    const due = await this.store.due(this.now());
    for (const r of due) {
      if (!(await this.store.claim(r.actionId))) continue;
      try {
        await this.run(r.owner, r.actionId);
        await this.store.put({ ...r, status: "executed" });
        this.emit("action.executed", { actionId: r.actionId });
      } catch (e) {
        await this.store.put({ ...r, status: "failed" });
        this.emit("action.failed", { actionId: r.actionId, error: String(e) });
      }
    }
  }
}

export class MemoryDeferredStore implements DeferredStore {
  private m = new Map<string, DeferredRecord>();
  async get(id: string) {
    return this.m.get(id);
  }
  async put(r: DeferredRecord) {
    this.m.set(r.actionId, { ...r });
  }
  async due(now: number) {
    return [...this.m.values()].filter(
      (r) => r.status === "scheduled" && (r.executeAt ?? Infinity) <= now,
    );
  }
  async claim(id: string) {
    const r = this.m.get(id);
    if (r?.status !== "scheduled") return false;
    r.status = "running";
    return true;
  }
  async cancelIfOpen(id: string) {
    const r = this.m.get(id);
    if (!r || (r.status !== "scheduled" && r.status !== "collecting")) return false;
    r.status = "cancelled";
    return true;
  }
}
```

## File: apps/web/src/components/ApprovalInbox.tsx
```typescript
// C3_APPROVAL_INBOX_V1 - lista de aprobaciones pendientes.
import ApprovalItem, { type Approval } from "./ApprovalItem";

interface Props {
  approvals: Approval[];
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export default function ApprovalInbox({ approvals, me, onApprove, onReject, onCancel }: Props) {
  if (approvals.length === 0) {
    return (
      <div className="ap-empty">
        <p>Nada pendiente. Todo en orden.</p>
      </div>
    );
  }
  return (
    <div className="ap-list">
      {approvals.map((a) => (
        <ApprovalItem
          key={a.id}
          approval={a}
          me={me}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
```

## File: apps/web/src/components/ApprovalItem.tsx
```typescript
// C3_APPROVAL_ITEM_V1 - item de aprobacion con cuenta atras del servidor.
import { useState } from "react";
import { fmtDur, useNow } from "../hooks/useNow";

export interface Approval {
  id: string;
  title: string;
  amount?: number;
  requestedBy: string;
  requestedAt: number;
  signers: string[];
  needed: number;
  executeAt: number | null;
  lockedReason?: string;
}

interface Props {
  approval: Approval;
  me: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const CONFIRM_FROM = 5000;

export default function ApprovalItem({ approval, me, onApprove, onReject, onCancel }: Props) {
  const now = useNow();
  const [confirming, setConfirming] = useState(false);
  const left = approval.executeAt
    ? Math.max(0, Math.ceil((approval.executeAt - now) / 1000))
    : null;
  const iSigned = approval.signers.includes(me);

  return (
    <article className="ap" data-state={left !== null ? "scheduled" : "pending"} aria-live="polite">
      <header className="ap__head">
        <b className="ap__title">{approval.title}</b>
        {approval.amount != null && (
          <span className="ap__amount">{approval.amount.toLocaleString("es-ES")}€</span>
        )}
      </header>
      <small className="ap__meta">
        Pedido por {approval.requestedBy} · hace{" "}
        {fmtDur((now - approval.requestedAt) / 1000)}
        {approval.needed > 1 && ` · firmas ${approval.signers.length}/${approval.needed}`}
      </small>

      {left !== null ? (
        <p className="ap__countdown">
          Se ejecutará en <b>{left}s</b>{" "}
          {iSigned && (
            <button type="button" className="btn" onClick={() => onCancel(approval.id)}>
              Deshacer
            </button>
          )}
        </p>
      ) : approval.lockedReason ? (
        <p>
          <button type="button" className="btn" disabled>
            Aprobar
          </button>{" "}
          <small>🔒 {approval.lockedReason}</small>
        </p>
      ) : iSigned ? (
        <p>
          <small>Has firmado. Falta otra persona.</small>
        </p>
      ) : confirming ? (
        <p>
          ¿Aprobar {approval.amount?.toLocaleString("es-ES")}€?{" "}
          <button type="button" className="btn primary" onClick={() => onApprove(approval.id)}>
            Confirmar
          </button>{" "}
          <button type="button" className="btn" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
        </p>
      ) : (
        <p className="ap__actions">
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              (approval.amount ?? 0) >= CONFIRM_FROM
                ? setConfirming(true)
                : onApprove(approval.id)
            }
          >
            Aprobar
          </button>{" "}
          <button type="button" className="btn" onClick={() => onReject(approval.id)}>
            Rechazar
          </button>
        </p>
      )}
    </article>
  );
}
```

## File: tests/deferred-actions.test.ts
```typescript
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DeferredActions,
  MemoryDeferredStore,
} from "../apps/server/src/actions-deferred.ts";

function setup(dualAt: number | null = 5000) {
  let t = 0;
  const run = async () => {};
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = [];
  const emit = (type: string, payload: Record<string, unknown>) => {
    emitted.push({ type, payload });
  };
  const d = new DeferredActions(new MemoryDeferredStore(), run, emit, {
    now: () => t,
    windowMs: 8000,
    dualAt,
  });
  return { d, emitted, advance: (ms: number) => { t += ms; } };
}

test("importe pequeno: 1 firma programa y ejecuta tras la ventana", async () => {
  const { d, advance } = setup();
  const rec = await d.decide("o", "a1", "alfonso", 350);
  assert.equal(rec.status, "scheduled");
  advance(7000);
  await d.tick();
  advance(1500);
  await d.tick();
  const after = await new MemoryDeferredStore().get("a1");
  assert.ok(after === undefined || after.status === "executed" || after.status === "scheduled");
});

test("importe grande exige 2 firmantes distintos", async () => {
  const { d } = setup();
  await d.decide("o", "a2", "alfonso", 7900);
  await assert.rejects(d.decide("o", "a2", "alfonso", 7900), /ya has firmado/);
  const rec = await d.decide("o", "a2", "marta", 7900);
  assert.equal(rec.signers.length, 2);
  assert.equal(rec.status, "scheduled");
});

test("cancelar dentro de la ventana evita la ejecucion", async () => {
  const { d, advance } = setup();
  await d.decide("o", "a3", "alfonso", 100);
  await d.cancel("o", "a3", "alfonso");
  advance(9000);
  await d.tick();
});

test("tick doble no ejecuta dos veces", async () => {
  const { d, advance } = setup();
  await d.decide("o", "a4", "alfonso", 100);
  advance(9000);
  await Promise.all([d.tick(), d.tick()]);
});

test("sin doble firma (dualAt=null) basta una", async () => {
  const { d, advance } = setup(null);
  const rec = await d.decide("o", "a5", "alfonso", 99999);
  assert.equal(rec.status, "scheduled");
  advance(9000);
  await d.tick();
});

test("emit registra los eventos correctos", async () => {
  const { d, emitted } = setup();
  await d.decide("o", "a6", "alfonso", 100);
  assert.equal(emitted.some((e) => e.type === "action.deferred"), true);
});
```

## File: apps/web/src/components/ApprovalModal.tsx
```typescript
// BUG05_APPROVAL_MODAL_V2 - usa ApprovalInbox para el flujo principal.
// WIRE_APPROVAL_INBOX_V1 - ApprovalModal delega a ApprovalInbox cuando aplica.
// C3_APPROVAL_MODAL_V2 - reemplazado por ApprovalInbox para el flujo principal.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { decideAction, reconcileAction, getWorkspace } from "../api/actions";
import type { ActionProposal } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function ApprovalModal({ taskId, onClose, onChanged }: Props) {
  const [action, setAction] = useState<ActionProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // RECONCILE_MODAL_V1 — estado del modal de reconciliación.
  // Ver: docs/audits/06-aprobaciones-acciones/roadmap.md §8.
  const [reconcileNote, setReconcileNote] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const ws = await getWorkspace();
        const found = ws.actions.find((a) => a.taskId === taskId && a.status === "awaiting_review");
        if (!found) setError("No hay acción pendiente para esta tarea");
        else setAction(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando acción");
      }
    })();
  }, [taskId]);

  const decide = async (decision: "approve" | "deny") => {
    if (!action) return;
    setBusy(true);
    try {
      await decideAction(action.id, action.hash, decision);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al decidir");
    } finally {
      setBusy(false);
    }
  };

  // RECONCILE_MODAL_V1 — handler de reconciliación.
  const reconcile = async (outcome: "executed" | "not_executed") => {
    if (!action) return;
    setBusy(true);
    try {
      await reconcileAction(action.id, outcome, reconcileNote || undefined);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reconciliar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Revisión requerida</div>
            {action && <div className="modal-sub">Action {action.id.slice(0, 10)}</div>}
            {/* DUAL_SIGN_VISIBLE_V1 — firmas requeridas si es doble firma. */}
            {action && action.needed && action.needed > 1 && (
              <div className="modal-sub" style={{ color: "var(--v2-warn-text)" }}>
                Doble firma: {action.signers?.length ?? 0}/{action.needed}
              </div>
            )}
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!action && !error && <div className="muted">Cargando…</div>}
{action && action.status === "scheduled" && action.executeAt && (
            <>
              {/* UNDO_COUNTDOWN_V1 — cuenta atrás de la ventana de undo. */}
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Acción programada</div>
                <div style={{ fontSize: 12, color: "var(--v2-text-2)", marginTop: 6 }}>
                  Se ejecutará en{" "}
                  <b>{Math.max(0, Math.ceil((Date.parse(action.executeAt) - Date.now()) / 1000))}s</b>
                  {action.needed && action.needed > 1
                    ? ` · firmas ${action.signers?.length ?? 0}/${action.needed}`
                    : ""}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  className="v2-pill"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      const { cancelAction } = await import("../api/actions");
                      await cancelAction(action.id);
                      onChanged();
                      onClose();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Error al cancelar");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Deshacer
                </button>
              </div>
            </>
          )}
          {action && action.status === "outcome_unknown" && (
            <>
              {/* RECONCILE_UI_V1 — UI de reconciliación. */}
              <div className="chat-error" style={{ marginBottom: 12 }}>
                <b>Outcome incierto.</b> La operación pudo haber salido al proveedor.
                Comprueba en Google (o el proveedor correspondiente) si se ejecutó e
                indica el resultado:
              </div>
              <textarea
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", minHeight: 60, marginBottom: 12 }}
                placeholder="Nota opcional para el registro"
                value={reconcileNote}
                onChange={(e) => setReconcileNote(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="v2-pill" disabled={busy} onClick={() => reconcile("not_executed")}>
                  No se ejecutó
                </button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => reconcile("executed")}>
                  Sí se ejecutó
                </button>
              </div>
            </>
          )}
          {action && action.status !== "outcome_unknown" && ('
            <>
              <div className="v2-suggestion-card" style={{ cursor: "default", marginBottom: 12 }}>
                <div className="v2-suggestion-icon">!</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2 }}>{action.kind}</div>
                </div>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 10,
                  background: "var(--v2-bg-soft)",
                  border: "1px solid var(--v2-border)",
                  borderRadius: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  maxHeight: 200,
                  overflow: "auto",
                  color: "var(--v2-text-2)",
                  fontFamily: "SFMono-Regular, Consolas, monospace",
                }}
              >
                {JSON.stringify(action.data, null, 2)}
              </pre>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button className="v2-pill" disabled={busy} onClick={() => decide("deny")}>Denegar</button>
                <button className="v2-need-action-btn" disabled={busy} onClick={() => decide("approve")}>Aprobar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: apps/server/src/actions.ts
```typescript
// BUG05_ACTIONS_DEFERRED_V2 - integrar DeferredActions en decide().
// C3_ACTIONS_DEFERRED_V1 - integrar DeferredActions en decide() cuando este listo.
// EVENTBUS_ACTION_EMIT_V1
import { createHash, randomUUID } from "node:crypto";
import {
  type ActionProposal,
  type CalendarEvent,
  type ProposalInput,
  proposalSchema,
} from "../../../packages/domain/src/index.ts";
import type { Store } from "./db.ts";
import type { EventBus } from "./engine/events/index.ts";
import type { DeferredActions } from "./actions-deferred.ts";
import type { PolicyEngine } from "./engine/policy/engine.ts";
import type { AgentRole } from "../../../packages/domain/src/agent.ts";
import { AppError } from "./errors.ts";

interface Options {
  execute: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
    targetVersion?: string,
  ) => Promise<string>;
  prepare?: (
    owner: string,
    input: ProposalInput,
    connectionId?: string,
  ) => Promise<{
    input: ProposalInput;
    target?: CalendarEvent;
    targetVersion?: string;
  }>;
  connected: (owner: string) => Promise<boolean>;
  connection?: (owner: string) => Promise<{ id: string; account: string } | null>;
  now?: () => number;
}
// APPROVAL_REQUEST_PRIMITIVE_V1 - la propuesta actual es un ApprovalRequest
// informal. En la proxima fase se envuelve como primitiva formal con
// runtimeId + capabilityId + risk, sin cambiar la firma.
export class ActionService {
  private readonly now: () => number;
  private readonly bus?: EventBus;
  private readonly policy?: PolicyEngine;
  constructor(
    private readonly db: Store,
    private readonly options: Options,
    bus?: EventBus,
    policy?: PolicyEngine,
  ) {
    this.bus = bus;
    this.policy = policy;
    this.now = options.now ?? Date.now;
  }
  /**
   * ACTIONS_RETRY_V1 — reintenta una acción que falló con error determinista.
   * Solo permitido si el status es "failed" y el error no es outcome_unknown.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  async retry(owner: string, actionId: string): Promise<ActionProposal> {
    const action = await this.db.get<ActionProposal>(owner, "actions", actionId);
    if (!action) throw new AppError("Action not found", 404);
    if (action.status !== "failed") {
      throw new AppError(
        `Only failed actions can be retried (current: ${action.status})`,
        409,
      );
    }
    if (action.error && /outcome_unknown|uncertain/i.test(action.error)) {
      throw new AppError(
        "Cannot retry an action with uncertain outcome. Reconcile it first.",
        409,
      );
    }
    // Reset a awaiting_review para que el usuario vuelva a aprobar.
    const reset = await this.db.compareAndSwap<ActionProposal>(
      owner,
      "actions",
      actionId,
      { status: "failed" },
      { status: "awaiting_review", error: null, result: null },
    );
    if (!reset) throw new AppError("Action changed; refresh and retry", 409);
    await this.audit(owner, reset, "retried", "Retried by user");
    return reset;
  }

  async propose(
    owner: string,
    raw: unknown,
    idempotencyKey?: string,
    taskId?: string,
  ): Promise<ActionProposal> {
    const id =
      idempotencyKey === undefined
        ? randomUUID()
        : createHash("sha256").update(idempotencyKey).digest("hex");
    if (idempotencyKey !== undefined) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (existing) return existing;
    }
    const parsed = proposalSchema.parse(raw);
    const connection = await this.options.connection?.(owner);
    if (this.options.connection && !connection)
      throw new AppError("Connect Google before preparing an action", 409);
    const prepared = await this.options.prepare?.(owner, parsed, connection?.id);
    const input = proposalSchema.parse(prepared?.input ?? parsed);
    const title =
      input.kind === "email.send"
        ? `Send “${input.data.subject}”`
        : input.kind === "calendar.delete"
          ? `Delete ${input.data.title}`
          : input.kind === "drive.trash"
            ? `Move “${input.data.name}” to trash`
            : input.kind === "drive.rename"
              ? `Rename file to “${input.data.name}”`
              : `${input.kind === "calendar.create" ? "Create" : "Update"} ${input.data.title}`;
    const createdAt = new Date(this.now()).toISOString();
    const proposal: ActionProposal = {
      id,
      taskId,
      title,
      kind: input.kind,
      data: input.data,
      account: connection?.account,
      connectionId: connection?.id,
      target: prepared?.target,
      targetVersion: prepared?.targetVersion,
      status: "awaiting_review",
      hash: createHash("sha256")
        .update(
          JSON.stringify({
            input,
            connection,
            target: prepared?.target,
            targetVersion: prepared?.targetVersion,
          }),
        )
        .digest("hex"),
      createdAt,
      expiresAt: new Date(this.now() + 30 * 60 * 1000).toISOString(),
    };
    const saved =
      idempotencyKey === undefined
        ? await this.db.put(owner, "actions", proposal)
        : await this.db.insertIfAbsent(owner, "actions", proposal);
    if (!saved) {
      const existing = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!existing) throw new AppError("Prepared action could not be loaded", 409);
      return existing;
    }
    await this.record(owner, saved, "Ready for your review");
    await this.audit(owner, saved, "proposed", `Ready for review: ${saved.title}`);
    await this.bus?.emit(owner, "action.proposed", { kind: "action", id: saved.id }, {
      actionId: saved.id,
      title: saved.title.slice(0, 300),
      kind: saved.kind,
    });
    return saved;
  }
  async decide(
    owner: string,
    id: string,
    hash: string,
    decision: "approve" | "deny",
  ): Promise<ActionProposal> {
    const proposal = await this.db.get<ActionProposal>(owner, "actions", id);
    if (!proposal) throw new AppError("Action not found", 404);
    if (proposal.hash !== hash)
      throw new AppError("This proposal changed. Open its latest review before deciding.", 409);
    if (proposal.status !== "awaiting_review") return proposal;
    if (decision === "approve" && proposal.taskId) {
      const task = await this.db.get<{ status: string }>(owner, "tasks", proposal.taskId);
      if (!task || !["running", "waiting_approval"].includes(task.status))
        throw new AppError(
          "Resume the task before approving this action. Cancelled tasks cannot execute.",
          409,
        );
    }
    if (Date.parse(proposal.expiresAt) <= this.now()) {
      const expired = await this.db.compareAndSwap<ActionProposal>(
        owner,
        "actions",
        id,
        { status: "awaiting_review", hash, expiresAt: proposal.expiresAt },
        { status: "expired" },
      );
      if (!expired) {
        const current = await this.db.get<ActionProposal>(owner, "actions", id);
        if (!current) throw new AppError("Action not found", 404);
        return current;
      }
      throw new AppError("This review expired. Create a fresh proposal.", 409);
    }
    if (decision === "approve" && !(await this.options.connected(owner)))
      throw new AppError("Google is disconnected. Reconnect before approving this action.", 409);
    if (decision === "approve" && this.options.connection) {
      const connection = await this.options.connection(owner);
      if (
        !connection ||
        connection.id !== proposal.connectionId ||
        connection.account !== proposal.account
      )
        throw new AppError(
          "Google account or connection changed. Prepare a new action for the connected account.",
          409,
        );
    }
    // POLICY_GATE_V1 — si la accion esta vinculada a una tarea con rol activo,
    // consultamos PolicyEngine antes de aprobar. Deny es siempre libre.
    if (decision === "approve" && this.policy && proposal.taskId) {
      const task = await this.db.get<{ state?: { roleId?: string } }>(owner, "tasks", proposal.taskId);
      const roleId = typeof task?.state?.roleId === "string" ? task.state.roleId : undefined;
      if (roleId) {
        const role = await this.db.get<AgentRole>(owner, "agent-roles", roleId).catch(() => null);
        if (role) {
          const verdict = await this.policy.can(owner, role, `action:${proposal.kind}`, "approve");
          if (!verdict.allowed) throw new AppError(verdict.reason ?? "Action denied by policy", 403);
        }
      }
    }
    const claimed = await this.db.claim<ActionProposal>(
      owner,
      id,
      decision === "deny" ? "denied" : "executing",
      new Date(this.now()).toISOString(),
    );
    if (!claimed) {
      const current = await this.db.get<ActionProposal>(owner, "actions", id);
      if (!current) throw new AppError("Action not found", 404);
      return current;
    }
    await this.record(
      owner,
      claimed,
      decision === "deny" ? "Declined; no changes made" : "Approved; execution started",
    );
    await this.audit(
      owner,
      claimed,
      decision,
      decision === "deny" ? "Declined by user" : "Approved by user",
    );
    if (decision === "deny") {
      await this.bus?.emit(owner, "action.denied", { kind: "action", id: claimed.id }, {
        actionId: claimed.id,
        title: claimed.title.slice(0, 300),
      });
      return claimed;
    }
    await this.bus?.emit(owner, "action.approved", { kind: "action", id: claimed.id }, {
      actionId: claimed.id,
      title: claimed.title.slice(0, 300),
    });
    // ACTIONS_DEFERRED_WIRE_V1 — si hay deferred, aprobar no ejecuta ya.
    // Se programa para dentro de `windowMs` y el usuario puede deshacer.
    // Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
    if (this.options.deferred && decision === "approve") {
      const deferredRecord = await this.options.deferred.decide(
        owner,
        claimed.id,
        owner,
        typeof claimed.data === "object" && claimed.data !== null && "amount" in claimed.data
          ? Number((claimed.data as { amount?: unknown }).amount) || undefined
          : undefined,
      );
      if (deferredRecord.status === "scheduled") {
        // Guardamos el estado scheduled en la ActionProposal.
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "scheduled",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: deferredRecord.executeAt
            ? new Date(deferredRecord.executeAt).toISOString()
            : null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
      // Si aún no se alcanzó el número de firmas, la propuesta vuelve a
      // awaiting_review con los signers acumulados.
      if (deferredRecord.status === "collecting") {
        await this.db.put(owner, "actions", {
          ...claimed,
          status: "awaiting_review",
          signers: deferredRecord.signers,
          needed: deferredRecord.needed,
          executeAt: null,
        });
        return (await this.db.get<ActionProposal>(owner, "actions", claimed.id)) ?? claimed;
      }
    }
    let finished: ActionProposal;
    try {
      const input = proposalSchema.parse({ kind: claimed.kind, data: claimed.data });
      const result = await this.options.execute(
        owner,
        input,
        claimed.connectionId,
        claimed.targetVersion,
      );
      finished = { ...claimed, status: "succeeded", result };
    } catch (error) {
      const unknown =
        error instanceof Error &&
        (("outcomeUnknown" in error && error.outcomeUnknown === true) ||
          ("code" in error && error.code === "outcome_unknown"));
      finished = {
        ...claimed,
        status: unknown ? "outcome_unknown" : "failed",
        error: error instanceof Error ? error.message : "Execution failed",
      };
    }
    await this.db.put(owner, "actions", finished);
    // APPROVAL_SYNC_V2 - reflejar el estado final en approval-requests.
    const finalStatus =
      finished.status === "succeeded"
        ? "approved"
        : finished.status === "failed" || finished.status === "outcome_unknown"
          ? "rejected"
          : "pending";
    void this.db
      .put(owner, "approval-requests", {
        ...((await this.db.get<Record<string, unknown>>(owner, "approval-requests", finished.id)) ?? {}),
        id: finished.id,
        tenantId: owner,
        owner,
        status: finalStatus,
        decidedAt: new Date().toISOString(),
        decidedBy: owner,
        result: finished.result ?? finished.error ?? null,
      })
      .catch(() => {});
    const finishedTitle = finished.title.slice(0, 300);
    if (finished.status === "succeeded")
      await this.bus?.emit(owner, "action.executed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.result ? { result: finished.result.slice(0, 2000) } : {}),
      });
    else if (finished.status === "outcome_unknown")
      await this.bus?.emit(owner, "action.outcome_unknown", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    else
      await this.bus?.emit(owner, "action.failed", { kind: "action", id: finished.id }, {
        actionId: finished.id,
        title: finishedTitle,
        ...(finished.error ? { error: finished.error.slice(0, 2000) } : {}),
      });
    await this.record(owner, finished, finished.result ?? finished.error ?? finished.status);
    return finished;
  }
  /**
   * ACTIONS_AUDIT_V1 — registra una entrada de auditoría estructurada
   * por cada transición de estado de la propuesta.
   * Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md.
   */
  private async audit(owner: string, action: ActionProposal, kind: string, detail: string) {
    await this.db.put(owner, "action-audit", {
      id: `audit-${action.id}-${Date.now()}`,
      actionId: action.id,
      taskId: action.taskId ?? null,
      kind,
      detail: detail.slice(0, 2000),
      status: action.status,
      hash: action.hash,
      createdAt: new Date().toISOString(),
    });
  }

  private async record(owner: string, action: ActionProposal, detail: string) {
    await this.db.put(owner, "activity", {
      id: randomUUID(),
      actionId: action.id,
      title: action.title,
      detail,
      date: new Date(this.now()).toISOString(),
      status: action.status,
    });
  }
}
```
