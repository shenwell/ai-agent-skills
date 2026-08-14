---
description: >-
  Ingest memory/inbox now (no extra prompt): wiki extracts, archive originals,
  delete tickets. Use for /inbox, dropped documents, transcripts, notes.
---

# /inbox

**Do this now.** Do not ask for a longer prompt. Do not list the queue and wait. Do not wrap up the chat session.

If the current mode is Ask/Plan: list `memory/inbox/` (skip `README.md`) and tell the user to switch to **Agent mode**. No moves, no deletes.

## Autonomy

Process **every** item in `memory/inbox/` except `README.md`. End only when the queue is empty (README only), or on **hard conflict** (secrets, contradiction with approved canon).

Empty queue → one line «inbox empty» and stop.

## Protocol (read, then execute)

Paths below are **relative to this skill** (`commands/inbox.md` → skill root).

1. Read [inbox-protocol](../references/inbox-protocol.md).
2. Run preflight ([preflight-protocol](../references/preflight-protocol.md)) — creates `memory/inbox/` if missing.
3. If the project has `memory/meta/intake-workflow.md` or `memory/meta/wiki-style.md`, apply those extras after the generic protocol.
4. Skip session digest / wrap-up unless the user also asked to wrap up.

## Pipeline per item (if the protocol file is missing, still do this)

1. Read the original (MCP `search_documents` / `get_source` if indexed; else the file). Do not invent page or slide numbers.
2. Move source originals out of inbox: binaries/Office → `memory/archive/documents/`; full transcripts → `memory/archive/transcripts/`. Create those folders if needed.
3. Extract durable facts → wiki (`WIKI_ROOT`, default `memory/wiki/`) + link in `index.md`. Tasks → `open-loops.md`; decisions → `decisions.md`; urgent → `hot-cache.md`. Wiki = extract, not a PDF copy.
4. Manifest for documents only if the project already uses `memory/archive/manifests/` (or the user asked).
5. Delete the inbox ticket/file after the original is in archive. Never delete `README.md`.
6. MCP `reindex_changed` on new/changed `.md`; if a new PDF/XLSX/PPTX landed in a `knowledge_sources` path, include it or `reindex`.

## Report

| Item | Type | Wiki | Archive | Status |
|------|------|------|---------|--------|

Then: `Index: reindexed N files` or `Index: skipped (MCP offline)`.
