# Global Memory (portfolio) — optional

Variable: **`GLOBAL_MEMORY_ROOT`**

Cross-project memory is **optional**. This skill does **not** ship a default filesystem path — each user or team sets their own root in project `AGENTS.md`.

## Path resolution

1. Read `GLOBAL_MEMORY_ROOT:` from the **current project** `AGENTS.md`. That value is the **only** source of truth.
2. If unset, empty, missing, or not readable → **degraded mode**: run the project pipeline only; report **"Portfolio skipped"**.
3. If set and readable but scaffold is missing → in Agent mode, bootstrap portfolio layout per [portfolio-schema.md](portfolio-schema.md) (portfolio limits apply).

**Example** (illustrative — choose any path on your machine):

```markdown
GLOBAL_MEMORY_ROOT: ~/portfolio-memory
```

Common patterns: a dedicated git repo (`~/global-memory`), a folder under your dev root, or a synced drive path. Never commit another maintainer's absolute path into a public skill.

## Purpose

The portfolio store **does not replace** per-project memory. It holds:

- project registry (`local_path`, `git_remote`);
- infrastructure, domains, certificates (no secrets), environment URLs;
- cross-project open loops and agent mistakes.

**Do not store here:** a copy of `memo-session-skill`, single-service API/classes, full project hot-caches.

## Reading (from any project)

1. `GLOBAL_MEMORY_ROOT/MEMORY.md`
2. `memory/hot-cache.md` as needed
3. `memory/wiki/projects-registry.md` to find repos
4. `memory/wiki/project-<slug>.md` for a project card

## Writing (on memo-session)

- Only facts with `scope: portfolio` or body for `scope: both`.
- Dated journals (`changelog`, `decisions`, `open-loops`, …): **newest first** — see [dated-entries.md](dated-entries.md); changelog reason includes `from:<project-slug>`.
- Details: [portfolio-schema.md](portfolio-schema.md).

## Search

Resolve the path from `AGENTS.md` first, then:

```bash
# POSIX — replace with your resolved GLOBAL_MEMORY_ROOT
rg -i "<query>" "$GLOBAL_MEMORY_ROOT/MEMORY.md" "$GLOBAL_MEMORY_ROOT/memory"
```

```powershell
# Windows without rg — set $root from AGENTS.md first
Select-String -Path "$root\memory\**\*.md" -Pattern "<query>" -SimpleMatch
```

Then `projects-registry.md` → `local_path` / `git_remote` → project `MEMORY.md` if needed.

## Skill

Process canon: install via `npx skills add shenwell/ai-agent-skills --skill memo-session-skill` → `~/.cursor/skills/memo-session-skill/SKILL.md` (or `~/.agents/skills/…`). **Do not** copy the skill into the portfolio repo.
