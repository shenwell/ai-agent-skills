# MCP integration (memo-session-mcp)

Optional read-path companion: [memo-session-mcp](../../memo-session-mcp/README.md).

## When MCP is available

1. **Preflight / context (Step 1):** after resolving `GLOBAL_MEMORY_ROOT`, prefer `search_portfolio` or `search_all` over raw `rg` when the MCP server `memo-session-mcp` is connected.
2. **Portfolio search** (read-only): use MCP tools instead of shell `rg` — see [portfolio-search.md](portfolio-search.md).
3. **After writes (end of pipeline):** call MCP `reindex_changed` with the list of files modified in this session (project + portfolio). If MCP unavailable, note in report: `Index: skipped (MCP offline)`.
4. **Do not** route session writes through MCP — writes stay in this skill (conflict gate, scope, hygiene).

## Degraded mode

| Condition | Behavior |
|-----------|----------|
| MCP connected | `search_*` tools + `reindex_changed` |
| MCP offline | `rg` / `Select-String` per [global-memory.md](global-memory.md) |
| `GLOBAL_MEMORY_ROOT` missing | Portfolio skipped (existing degraded mode) |

## Tools mapping

| Intent | MCP tool |
|--------|----------|
| Cross-project / infra / registry | `search_portfolio` |
| Known project slug | `search_project` |
| PDF/Excel corpora | `search_documents` |
| Unsure | `search_all` |
| Slug → paths | `resolve_project` |
| After session writes | `reindex_changed` paths=[...] |
| Full rebuild (rare) | `reindex` |

## Install MCP (user machine)

See [memo-session-mcp README](../../memo-session-mcp/README.md). One global `~/.cursor/mcp.json` entry — works in all repositories.

## Public distribution

Shipped in [shenwell/ai-agent-skills](https://github.com/shenwell/ai-agent-skills) under `skills/memo-session-mcp/`. Not copied into `GLOBAL_MEMORY_ROOT` or project repos.
