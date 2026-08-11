# Memo Session MCP

**Companion MCP server for [memo-session-skill](../memo-session-skill/)** — read-path search over portfolio memory (`global-memory`), registered project `MEMORY.md` / `memory/`, and optional document corpora (PDF, Excel, PPTX).

| Layer | Role |
|-------|------|
| **memo-session-skill** | Write path: session → consolidate → route → git-tracked memory |
| **memo-session-mcp** | Read path: FTS search + project registry lookup from any Cursor chat |

MIT · part of [shenwell/ai-agent-skills](https://github.com/shenwell/ai-agent-skills)

## Features

- **SQLite FTS5** — no GPU, no cloud; works offline
- **Incremental index** — SHA256 skip unchanged files; `reindex_changed` after session writes
- **Portfolio + projects** — reads `projects-registry.md`, indexes each project's memory
- **Optional documents** — PDF/XLSX/PPTX via `pip install -e ".[documents]"`
- **Portable** — paths via `GLOBAL_MEMORY_ROOT` and `config.yaml`; deploy on any machine

## Quickstart

### 1. Clone global-memory (portfolio)

```bash
git clone https://github.com/shenwell/global-memory.git ~/global-memory
# or use your own portfolio root
```

### 2. Install MCP package

```bash
cd skills/memo-session-mcp
pip install -e .
# optional document extraction:
pip install -e ".[documents]"
```

### 3. Configure

```bash
mkdir -p ~/.config/memo-session-mcp
cp config.example.yaml ~/.config/memo-session-mcp/config.yaml
# edit global_memory_root if needed
```

Or set environment variables only:

```bash
export GLOBAL_MEMORY_ROOT=~/global-memory
export MEMO_SESSION_MCP_INDEX_DIR=~/.local/share/memo-session-mcp
```

### 4. Build index

```bash
memo-session-index reindex
memo-session-index status
memo-session-index search "nginx redirect"
```

### 5. Register in Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "memo-session-mcp": {
      "command": "uv",
      "args": [
        "run",
        "--directory", "/ABSOLUTE/PATH/TO/ai-agent-skills/skills/memo-session-mcp",
        "memo-session-mcp"
      ],
      "env": {
        "GLOBAL_MEMORY_ROOT": "/ABSOLUTE/PATH/TO/global-memory"
      }
    }
  }
}
```

Without `uv`, use pip entry point:

```json
{
  "mcpServers": {
    "memo-session-mcp": {
      "command": "memo-session-mcp",
      "env": {
        "GLOBAL_MEMORY_ROOT": "/ABSOLUTE/PATH/TO/global-memory"
      }
    }
  }
}
```

Restart Cursor. Tools appear as `search_all`, `search_portfolio`, `resolve_project`, `reindex`, etc.

## MCP tools

| Tool | Use when |
|------|----------|
| `search_all` | Unsure where answer lives — portfolio, project, or docs |
| `search_portfolio` | Infra, domains, registry, cross-project facts |
| `search_project` | Specific project slug from registry |
| `search_documents` | PDF/Excel corpora in `knowledge_sources` |
| `resolve_project` | Map name/slug → `git_remote`, `local_path` |
| `get_source` | Full chunk after a search hit |
| `reindex` | Full rebuild (after bulk import) |
| `reindex_changed` | After memo-session writes specific files |
| `index_status` | Debug: file/chunk counts |

## Pair with memo-session-skill

Install both:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**End of session** (skill): consolidate → write markdown → call MCP `reindex_changed` with changed paths.

**During any chat** (MCP): agent calls `search_all` before answering portfolio/project questions.

Add a **User Rule** in Cursor:

> For questions about projects, infrastructure, past decisions, or VMS docs — call `search_all` (memo-session-mcp) first. After memo-session writes, call `reindex_changed`.

## Optional document corpora

In `~/.config/memo-session-mcp/config.yaml`:

```yaml
knowledge_sources:
  - id: my-docs
    path: ~/projects/my-repo/sources
    collection: documents
    patterns: ["**/*.pdf", "**/*.xlsx", "**/*.pptx"]
```

Then: `pip install -e ".[documents]"` and `memo-session-index reindex`.

## Architecture

```
GLOBAL_MEMORY_ROOT/          ← portfolio markdown (canonical)
  MEMORY.md
  memory/wiki/projects-registry.md
project repos/               ← MEMORY.md + memory/ per project
~/.local/share/memo-session-mcp/
  memory_index.db            ← derived FTS index (cache)
memo-session-mcp (MCP)       ← search tools for Cursor
memo-session-skill (skill)   ← write pipeline for sessions
```

Markdown stays canonical. The index is disposable — rebuild anytime with `reindex`.

## Self-test

```bash
GLOBAL_MEMORY_ROOT=~/global-memory python -m memo_session_mcp.server --test
```

Or bootstrap script:

```bash
./scripts/bootstrap-mcp.sh    # Linux/macOS
./scripts/bootstrap-mcp.ps1   # Windows
```

## License

MIT — see [LICENSE](../../LICENSE) in repository root.
