# Changelog

## 0.2.0-beta — 2026-09-24

Enterprise runtime wiring release.

- Promoted `sop` to a first-class durable task kind.
- Added SOPExecutor with checkpoints, allowlists, nested-SOP guards and pause/resume semantics.
- Added skill bootstrap into the isolated computer workspace.
- Added business query runtime for HTTP/PostgreSQL and deterministic sample data.
- Added LearningService with task-provenance and deduplication.
- Added beta smoke and computer vertical-slice scripts.
- Removed stale mobile-only test/package references from the lean server repo.
