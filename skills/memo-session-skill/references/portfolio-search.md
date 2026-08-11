# Portfolio memory search

Read-only search — without writes or on user request.

## Preferred: memo-session-mcp

If MCP server `memo-session-mcp` is connected in Cursor:

1. Resolve `GLOBAL_MEMORY_ROOT` ([preflight-protocol.md](preflight-protocol.md) §1.5).
2. Call **`search_all`** with the user query (or **`search_portfolio`** for infra/registry-only).
3. For a known project: **`resolve_project`** → **`search_project`** with `project_slug`.
4. Answer: source path, section, summary, `last_verified` / verified | advisory | unknown.
5. Use **`get_source`** for full chunk when the preview is insufficient.

## Fallback: ripgrep (MCP offline)

1. Resolve `GLOBAL_MEMORY_ROOT`.
2. Search: `rg -i "<query>"` over `GLOBAL_MEMORY_ROOT/MEMORY.md`, `GLOBAL_MEMORY_ROOT/memory`, `GLOBAL_MEMORY_ROOT/memory/wiki` (or `Select-String` on Windows, see [global-memory.md](global-memory.md)).
3. Open `memory/wiki/projects-registry.md` → `local_path`, `git_remote`, `project_memory`.
4. If needed read `MEMORY.md` of found project.
5. Answer: file, summary, `last_verified` / verified | advisory | unknown.

See [mcp-integration.md](mcp-integration.md) for post-session `reindex_changed`.
