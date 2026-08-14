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

1. Classify by **content** (meeting export → transcript even if `.docx`), not only by extension. Skip `README.md` and scratch `_*` / `_extract*` / `~$*`.
2. Search existing wiki/memory first. Patch the same-topic leaf or create a **new** leaf — do not append unrelated sources onto a hub.
3. Read the original (MCP `search_documents` / `get_source` if indexed; else the file, UTF-8). Do not invent page or slide numbers. Do not leave extract scratch in `memory/inbox/`.
4. Move source originals: binaries/Office → `memory/archive/documents/`; cleaned transcripts → `memory/archive/transcripts/`. Meeting DOCX/PDF: keep the file in `documents/` **and** write the md transcript.
5. Extract durable facts → wiki (`WIKI_ROOT`, default `memory/wiki/`) + link in `index.md`. Tasks → `open-loops.md`; decisions → `decisions.md`; urgent → `hot-cache.md`. Wiki = extract, not a PDF copy.
6. Manifest for PDF/PPTX/XLSX: `memory/archive/manifests/manifest-YYYY-MM-DD-<topic>.md` (section/page \| fact \| wiki heading).
7. Delete the inbox ticket/file after the original is in archive. Never delete `README.md`.
8. MCP `reindex_changed` on new/changed `.md`; if a new PDF/XLSX/PPTX landed in a `knowledge_sources` path, include it or `reindex`. Changelog line in `memory/changelog.md`.

## Report

| Item | Type | Wiki | Archive | Status |
|------|------|------|---------|--------|

Then: `Index: reindexed N files` or `Index: skipped (MCP offline)`.
