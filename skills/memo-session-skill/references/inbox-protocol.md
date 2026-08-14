# Inbox protocol

Ingest queue for materials that are **not** a live chat session. Wiki stays COLD articles; inbox is the drop folder; `memory/archive/` holds **source originals** only.

Trigger: `/inbox`, "process inbox", "ingest inbox". **Skip** session digest ([consolidation-protocol.md](consolidation-protocol.md)) unless the user also asked to wrap up.

In **Agent mode**, start immediately. Do not ask for a long intake prompt. **Ask/Plan:** list the queue only; no moves or deletes.

## Queue

Path: **`memory/inbox/`**.

**Skip:** `README.md`; scratch `_*`, `_extract*`, `~$*`, `*.tmp`. Delete leftover scratch at the end.

Empty (only README or missing) → report "inbox empty" and stop.

### Classify by **content**, not extension

| Type | Signals |
|------|---------|
| `transcript` | speaker turns, timestamps, "Meeting Recording", Teams/Zoom export — even if `.docx` / `.pdf` |
| `document` | spec, deck, spreadsheet, manual, one-pager |
| `note` | short markdown thought, no source file |
| ticket | `intake-*.md` with YAML `source_type` / `source_path` — follow the ticket |

If the project has `memory/meta/intake-workflow.md` or `memory/meta/wiki-style.md`, apply those **after** this protocol (naming, extra tables).

## Before write

1. **Search** existing memory (`search_project` / `search_all`; `search_documents` if the original is already in a corpus). Patch the **same-topic** wiki leaf; create a **new leaf** for a new topic.
2. **Do not** dump several unrelated sources into one hub page. One topic → one wiki file. If an existing page would grow past ~150 lines or >5 `##` headings, split: new leaf + stub/link, do not append.
3. Conflict gate still applies ([conflict-gate.md](conflict-gate.md)). Update `last_verified` on patched pages.

## Read the original

- Already indexed → `search_documents` / `get_source`. Otherwise read the file (PDF MCP if connected; else local extract).
- Extract **UTF-8**. Do not invent page, slide, or sheet numbers.
- Scratch extracts: write outside `memory/inbox/` (or delete before finish). Never leave `_extract*` in the queue.

## Per item

1. **Originals that are not wiki pages** → `memory/archive/` (create the tree if missing):
   - binaries / Office → `memory/archive/documents/` (copy/move if the file still sits in inbox);
   - meeting export **also** kept as a cleaned transcript: `memory/archive/transcripts/transcript-YYYY-MM-DD-<topic>.md` (keep the original file in `documents/` when it is a DOCX/PDF export).
2. **Extract** durable facts → wiki + link in `WIKI_ROOT/index.md`. Tasks → `open-loops.md`; decisions → `decisions.md`; urgent → `hot-cache.md`. Wiki = extract, not a copy of the PDF.
3. **Manifest** for paginated / tabular sources (PDF, PPTX, XLSX) — always, so later retrieval can cite page/slide/sheet:
   `memory/archive/manifests/manifest-YYYY-MM-DD-<topic>.md` with `source_path`, `routed_to`, `processed_at`, and a table **Section / page | Fact | Wiki heading**. Skip manifests for short notes. If the project already has a manifest template, use it.
4. **Transcript YAML** (minimum): `date`, `participants`, `source`, `routed_to`, `coverage_gaps`, `processed_at`. If auto-ASR: note that names/terms may be wrong; wiki is canon, not the raw text.
5. **Delete** the inbox item (ticket and/or raw file after the original is in archive) **and** scratch files. Never delete `README.md`.
6. MCP **`reindex_changed`** on new/changed `.md`. If a new PDF/XLSX/PPTX landed under a configured `knowledge_sources` path — include that path or run `reindex`. Add a line to `memory/changelog.md`.

## Archive vs wiki

| Path | Role |
|------|------|
| `WIKI_ROOT/*.md` | COLD articles (one topic each) |
| `memory/archive/` | Source originals + manifests — **not** a second wiki |
| `memory/inbox/` | Queue only |

Do not dump wiki articles into `archive/`. Do not leave processed binaries or scratch files in `inbox/`.

## Report

```markdown
## Inbox intake

| Item | Type | Wiki | Archive | Status |
|------|------|------|---------|--------|

Index: reindexed N files | skipped (MCP offline)
```

If the project requires source citations (RAG / «where to look»): end with a navigation table **fact → path → page/slide/heading**. Empty queue: one line, then stop.
