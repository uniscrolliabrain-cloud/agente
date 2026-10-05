# bloque-03.ps1 - Resiliencia.
# 15 fixes del miniaudit 03.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/fixes/bloque-03.ps1

. (Join-Path $PSScriptRoot "_runner.ps1")

# 03-B1
Apply-Fix -Id "03-B1" -Path "apps/server/src/engine/model-chain.ts" -Mark "MODEL_FIRST_BYTE_CONFIG_V1" -Anchor "      const firstByteTimeout = setTimeout(() => {" -Replacement "      // MODEL_FIRST_BYTE_CONFIG_V1`n      const firstByteMs = Number(process.env.LLM_FIRST_BYTE_MS ?? `"45000`") || 45000;`n      const firstByteTimeout = setTimeout(() => {"

# 03-B2
Apply-Fix -Id "03-B2" -Path "apps/server/src/engine/service.ts" -Mark "RECOVER_CAS_V1" -Anchor "        { status: `"running`", leaseId: value.leaseId ?? null }," -Replacement "        { status: `"running`", leaseId: value.leaseId ?? null, leaseUntil: value.leaseUntil ?? null },"

# 03-B3
Apply-Fix -Id "03-B3" -Path "apps/server/src/engine/worker.ts" -Mark "WORKER_STOP_TIMEOUT_V1" -Anchor "    while (this.active.size || this.ticking) await new Promise((r) => setTimeout(r, 10));" -Replacement "    const drainStart = Date.now();`n    const DRAIN_TIMEOUT_MS = Number(process.env.WORKER_DRAIN_TIMEOUT_MS ?? `"10000`") || 10000;`n    while (this.active.size || this.ticking) {`n      if (Date.now() - drainStart > DRAIN_TIMEOUT_MS) { backgroundFailure(`"worker drain timeout`", new Error(`"drain excedido`")); break; }`n      await new Promise((r) => setTimeout(r, 10));`n    }"

# 03-B4
Apply-Fix -Id "03-B4" -Path "apps/server/src/engine/circuit-breaker.ts" -Mark "CIRCUIT_ALERT_ON_OPEN_V1" -Anchor "    this.openedAt = Date.now();`n    this.failures = 0;" -Replacement "    this.openedAt = Date.now();`n    import(`"../log.ts`").then(({ logWarn }) => logWarn(`"circuit.open`", { circuit: this.name })).catch(() => {});`n    this.failures = 0;"

# 03-B5
Apply-Fix -Id "03-B5" -Path "apps/server/src/engine/worker.ts" -Mark "GUARD_CACHE_100_V1" -Anchor "    const GUARD_CACHE_MS = 500;" -Replacement "    const GUARD_CACHE_MS = Number(process.env.WORKER_GUARD_CACHE_MS ?? `"100`") || 100;"

# 03-B6
Apply-Fix -Id "03-B6" -Path "apps/server/src/engine/service.ts" -Mark "PURGE_DEAD_LETTER_V1" -Anchor "        { kind: `"cognitive-thoughts`", days: 30 }," -Replacement "        { kind: `"cognitive-thoughts`", days: 30 },`n        { kind: `"dead-letter`", days: 90 },"

# 03-B7
Apply-Fix -Id "03-B7" -Path "apps/server/src/engine/service.ts" -Mark "STUCK_5MIN_V1" -Anchor "      const STUCK_MS = 10 * 60 * 1000;" -Replacement "      const STUCK_MS = Number(process.env.OUTCOME_UNKNOWN_STUCK_MS ?? `"300000`") || 300000;"

# 03-B8
Apply-Fix -Id "03-B8" -Path "apps/server/src/engine/model-chain.ts" -Mark "BULKHEAD_PER_PROVIDER_V1" -Anchor "      const firstByteTimeout = setTimeout(() => {" -Replacement "      const bulkheadKey = `"__llm_bulkhead__`";`n      const bulkhead = ((globalThis as Record<string, unknown>)[bulkheadKey] as Map<string, number>) ?? new Map<string, number>();`n      (globalThis as Record<string, unknown>)[bulkheadKey] = bulkhead;`n      const BULKHEAD_MAX = Number(process.env.LLM_BULKHEAD_PER_PROVIDER ?? `"10`") || 10;`n      const providerKey = specs[index].split(`"/`")[0] ?? `"unknown`";`n      const running = bulkhead.get(providerKey) ?? 0;`n      if (running >= BULKHEAD_MAX && hasFallback()) { startNextAttempt(); return; }`n      bulkhead.set(providerKey, running + 1);`n      const releaseBulkhead = () => { const cur = bulkhead.get(providerKey) ?? 1; if (cur <= 1) bulkhead.delete(providerKey); else bulkhead.set(providerKey, cur - 1); };`n      const firstByteTimeout = setTimeout(() => {`n        releaseBulkhead();"

# 03-B8b
Apply-Fix -Id "03-B8b" -Path "apps/server/src/engine/model-chain.ts" -Mark "BULKHEAD_RELEASE_V1" -Anchor "          clearTimeout(firstByteTimeout);`n          if (stopped) return;" -Replacement "          clearTimeout(firstByteTimeout);`n          releaseBulkhead();`n          if (stopped) return;"

# 03-B9
Apply-Fix -Id "03-B9" -Path "apps/server/src/google-auth.ts" -Mark "GOOGLE_TIMEOUT_CONFIG_V1" -Anchor "      signal: AbortSignal.timeout(15000)," -Replacement "      signal: AbortSignal.timeout(this.config.toolTimeouts?.googleHttpMs ?? 15000),"

# 03-B10
Apply-Fix -Id "03-B10" -Path "apps/server/src/app.ts" -Mark "WEBHOOK_RETRY_V1" -Anchor "    await db.put(`"system`", `"whatsapp-incoming`", {" -Replacement "    const { retryWithBackoff } = await import(`"./engine/retry.ts`");`n    await retryWithBackoff(() => db.put(`"system`", `"whatsapp-incoming`", {"

# 03-B10b
Apply-Fix -Id "03-B10b" -Path "apps/server/src/app.ts" -Mark "WEBHOOK_RETRY_CLOSE_V1" -Anchor "      receivedAt: new Date().toISOString(),`n    });`n    return c.json({ ok: true });" -Replacement "      receivedAt: new Date().toISOString(),`n    }), { maxAttempts: 3, baseMs: 200, maxMs: 2000 });`n    return c.json({ ok: true });"

# 03-B11
Apply-Fix -Id "03-B11" -Path "apps/server/src/index.ts" -Mark "SHUTDOWN_DRAIN_TIMEOUT_V1" -Anchor "const shutdown = () => {`n  stopBackupScheduler();`n  server?.close(() => {" -Replacement "const shutdown = () => {`n  stopBackupScheduler();`n  const DRAIN_MS = Number(process.env.SHUTDOWN_DRAIN_MS ?? `"10000`") || 10000;`n  const forceExit = setTimeout(() => { console.warn(`"[OpenMuse] shutdown drain timeout`"); process.exit(1); }, DRAIN_MS);`n  forceExit.unref?.();`n  server?.close(() => {"

# 03-B11b
Apply-Fix -Id "03-B11b" -Path "apps/server/src/index.ts" -Mark "SHUTDOWN_DRAIN_CLEAR_V1" -Anchor "      .then(() => process.exit(0));`n  });`n};" -Replacement "      .then(() => { clearTimeout(forceExit); process.exit(0); })`n      .catch(() => process.exit(1));`n  });`n};"

# 03-B12
Apply-Fix -Id "03-B12" -Path "apps/server/src/files.ts" -Mark "FILES_EMBED_RETRY_V1" -Anchor "        const vectors = await embedTexts(chunks);" -Replacement "        const { retryWithBackoff } = await import(`"./engine/retry.ts`");`n        const vectors = await retryWithBackoff(() => embedTexts(chunks), { maxAttempts: 3, baseMs: 500, maxMs: 5000 });"

# 03-B13
Apply-Fix -Id "03-B13" -Path "apps/server/src/engine/retry.ts" -Mark "RETRY_MAX_TOTAL_MS_V1" -Anchor "  signal?: AbortSignal;`n}" -Replacement "  signal?: AbortSignal;`n  maxTotalTimeMs?: number;`n}"

# 03-B13b
Apply-Fix -Id "03-B13b" -Path "apps/server/src/engine/retry.ts" -Mark "RETRY_TOTAL_CHECK_V1" -Anchor "  let lastError: unknown;`n`n  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {" -Replacement "  let lastError: unknown;`n  const startedAt = Date.now();`n`n  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {`n    if (options.maxTotalTimeMs !== undefined && Date.now() - startedAt > options.maxTotalTimeMs) { throw lastError ?? new Error(`"retry maxTotalTimeMs exceeded`"); }"

# 03-B14
Apply-Fix -Id "03-B14" -Path "apps/server/src/engine/conversation.ts" -Mark "CHAT_GRACEFUL_ERROR_V1" -Anchor "              message: error instanceof Error ? error.message : `"Could not start the task`"," -Replacement "              message: (() => { const raw = error instanceof Error ? error.message : `"`"; return raw.includes(`"Model did not respond`") || raw.includes(`"fetch failed`") || raw.includes(`"timeout`") ? `"Ahora mismo no puedo responder. Prueba en un minuto.`" : raw.slice(0, 200) || `"Algo ha fallado. Prueba otra vez.`"; })(),"

# 03-B15
Apply-Fix -Id "03-B15" -Path "apps/server/src/engine/service.ts" -Mark "RECOVER_ACTIONS_IN_MAINTAIN_V1" -Anchor "      const STUCK_MS = 10 * 60 * 1000;" -Replacement "      await this.db.recoverInterruptedActions().catch((error) => backgroundFailure(`"maintain recoverInterruptedActions`", error));`n      const STUCK_MS = Number(process.env.OUTCOME_UNKNOWN_STUCK_MS ?? `"300000`") || 300000;"

# 03-C1
Apply-Fix -Id "03-C1" -Path "apps/server/src/engine/circuit-breaker.ts" -Mark "CIRCUIT_RECORD_METHODS_V1" -Anchor "  reset(): void {" -Replacement "  recordFailure(error: unknown): void {`n    if (typeof (error as { status?: number })?.status === `"number`") {`n      const s = (error as { status: number }).status;`n      if (s >= 400 && s < 500 && s !== 408 && s !== 429) return;`n    }`n    this.onFailure();`n  }`n  recordSuccess(): void { this.onSuccess(); }`n`n  reset(): void {"

# 03-C2
Apply-Fix -Id "03-C2" -Path "apps/server/src/index.ts" -Mark "RECOVER_BEFORE_START_V1" -Anchor "if (config.taskWorkerEnabled && processRole !== `"api`") agent.start();" -Replacement "if (config.taskWorkerEnabled && processRole !== `"api`") {`n  const recovered = await agent.recoverInterruptedTasks().catch(() => 0);`n  if (recovered > 0) console.log(`"[OpenMuse] ${recovered} tareas recuperadas antes de arrancar`");`n  agent.start();`n}"

# 03-C2b
Apply-Fix -Id "03-C2b" -Path "apps/server/src/index.ts" -Mark "RECOVER_PARALLEL_REMOVED_V1" -Anchor "void agent.recoverInterruptedTasks().then((n) => {`n  if (n > 0) console.log(`"[OpenMuse] ${n} tareas recuperadas`");`n});" -Replacement "// RECOVER_PARALLEL_REMOVED_V1 - movido antes de agent.start()."

# 03-C4
Apply-Fix -Id "03-C4" -Path "apps/server/src/engine/model-chain.ts" -Mark "FIRST_BYTE_CLEANUP_V1" -Anchor "    return () => {`n      stopped = true;`n      subscription?.unsubscribe();`n    };" -Replacement "    return () => {`n      stopped = true;`n      if (typeof current !== `"undefined`") { try { current?.abortRun(); } catch { /* noop */ } }`n      subscription?.unsubscribe();`n    };"

# 03-C5
Apply-Fix -Id "03-C5" -Path "apps/server/src/engine/retry.ts" -Mark "RETRY_SIGNAL_CLEANUP_V1" -Anchor "        const timer = setTimeout(resolve, delayMs);`n        const abort = () => {`n          clearTimeout(timer);`n          reject(new Error(`"Aborted during retry backoff`"));`n        };`n        options.signal?.addEventListener(`"abort`", abort, { once: true });" -Replacement "        const done = () => { options.signal?.removeEventListener(`"abort`", abort); resolve(); };`n        const timer = setTimeout(done, delayMs);`n        const abort = () => { clearTimeout(timer); options.signal?.removeEventListener(`"abort`", abort); reject(new Error(`"Aborted during retry backoff`")); };`n        options.signal?.addEventListener(`"abort`", abort, { once: true });"

# 03-C6
Apply-Fix -Id "03-C6" -Path "apps/server/src/engine/worker.ts" -Mark "WORKER_STATUS_APPLY_V1" -Anchor "      await checkpoint({ ...result, leaseId: null, leaseUntil: null });" -Replacement "      const ALLOWED = new Set([`"queued`",`"running`",`"waiting_approval`",`"waiting_input`",`"scheduled`",`"paused`",`"succeeded`",`"failed`",`"cancelled`"]);`n      if (result.status !== undefined && !ALLOWED.has(result.status)) { backgroundFailure(`"worker invalid status`", new Error(`"status invalido: ${String(result.status)}`")); delete (result as Partial<AgentTask>).status; }`n      await checkpoint({ ...result, leaseId: null, leaseUntil: null });"

Write-Host ""
Write-Host "Aplicando fixes del bloque 03..." -ForegroundColor Cyan
Report-Results -BlockName "03"