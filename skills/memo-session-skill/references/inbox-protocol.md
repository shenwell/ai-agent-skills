# Inbox protocol

Ingest queue for materials that are **not** a live chat session. Wiki stays COLD articles; inbox is the drop folder; `memory/archive/` holds **source originals** only.

Trigger: `/inbox`, "process inbox", "ingest inbox". **Skip** session digest ([consolidation-protocol.md](consolidation-protocol.md)) unless the user also asked to wrap up.

In **Agent mode**, start immediately. Do not ask for a long intake prompt. **Ask/Plan:** list the queue only; no moves or deletes.

## Queue

Path: **`memory/inbox/`**. Skip **`README.md`**.

Empty (only README or missing) → report "inbox empty" and stop.

| Item | Type |
|------|------|
| `intake-*.md` with YAML `source_type` / `source_path` | ticket |
| PDF, PPTX, XLSX, DOCX | `document` |
| meeting `.txt` / long transcript `.md` | `transcript` |
| short note `.md` | `note` |

If the project has `memory/meta/intake-workflow.md` or `memory/meta/wiki-style.md`, apply those **after** this protocol (naming, extra tables).

## Per item

1. **Read** the original (`search_documents` / `get_source` if already indexed; otherwise the file). Do not invent page or slide numbers.
2. **Originals that are not wiki pages** → `memory/archive/` (create the tree if missing):
   - binaries / Office → `memory/archive/documents/` (move if the file still sits in inbox);
   - full transcripts → `memory/archive/transcripts/transcript-YYYY-MM-DD-<topic>.md`.
3. **Extract** durable facts → wiki page (new leaf or same-topic update) + link in `WIKI_ROOT/index.md`. Tasks → `open-loops.md`; decisions → `decisions.md`; urgent → `hot-cache.md`. Quality filter and [conflict-gate.md](conflict-gate.md) still apply. Wiki = extract, not a copy of the PDF.
4. **Manifest** (documents only, and only if the project already uses `memory/archive/manifests/` or the user asked): `memory/archive/manifests/manifest-YYYY-MM-DD-<topic>.md` with `source_path`, `routed_to`, `processed_at`.
5. **Delete** the inbox item (ticket and/or raw file after the original is in archive). Never delete `README.md`.
6. MCP **`reindex_changed`** on new/changed `.md`. If a new PDF/XLSX/PPTX landed under a configured `knowledge_sources` path — include that path or run `reindex`.

## Archive vs wiki

| Path | Role |
|------|------|
| `WIKI_ROOT/*.md` | COLD articles |
| `memory/archive/` | Source originals + optional manifests — **not** a second wiki |
| `memory/inbox/` | Queue only |

Do not dump wiki articles into `archive/`. Do not leave processed binaries in `inbox/`.

## Report

```markdown
## Inbox intake

| Item | Type | Wiki | Archive | Status |
|------|------|------|---------|--------|

Index: reindexed N files | skipped (MCP offline)
```

Empty queue: one line, then stop.
