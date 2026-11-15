# C13 · resultados ejecutados

Comando: `node --import tsx --test --test-isolation=none tests/cognition-v2-voice.test.ts`

Exit: **0**. Proveedores usados: fixtures sintéticos locales. Backend: PGlite real, incluido cierre y reapertura de directorio persistente. Ningún proveedor audiovisual real llamado.

```text
✔ C13 durable consent/session/final transcript survive restart; private scope and provider gate are enforced (9662.424383ms)
✔ C13 concurrent renderer is fenced and late text after barge-in is rejected (2816.297783ms)
✔ C13 expiry/silence are recovered from durable timestamps, no timer or provider pricing assumption (4024.309578ms)
✔ C13 Fast voice adapter reuses the shared runtime and cancels subscription when output is rejected (360.423663ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 18387.0229
```

## Fuentes al finalizar

- `apps/server/src/engine/voice-v2/contracts.ts`: `2f4634cd4a95a9f6f04b1d1ca0808256f0b2d2b44e6433bc029fe0dda978f116`
- `apps/server/src/engine/voice-v2/coordinator.ts`: `af8638ceb9481c0da685bf340f3b6aa6eabd7ad76f508f27b599839070918f99`
- `apps/server/src/engine/voice-v2/fast-adapter.ts`: `07cf44782fc085861269aa5304e0b0c8515a29156a035d667fc70a3a49479ece`
- `tests/cognition-v2-voice.test.ts`: `77bd54661a7672c5ccccd5ad66b1e53b7896d3a57a5ab939bd9069388e702f6e`

Typecheck global observado: exit 2 por `preparedContext` any[] en `engine/cognition/v2/slow.ts`, fuera de la superficie C13. Repetir en el SHA final del padre.
