# Global Memory (portfolio)

**Canonical path:** `D:/CURSOR/global-memory`

Variable: **`GLOBAL_MEMORY_ROOT`**

## Path resolution

1. `GLOBAL_MEMORY_ROOT:` line in the **current project** `AGENTS.md` (override).
2. Otherwise — this file: `D:/CURSOR/global-memory`.
3. If the directory is unavailable — **degraded mode**: project pipeline only; report block "Portfolio skipped".

## Purpose

This repository **does not replace** project memory. It stores:

- project registry (`local_path`, `git_remote`);
- infrastructure, domains, certificates (no secrets), environment URLs;
- cross-project open loops and agent mistakes.

**Do not store here:** a copy of `memo-session-skill`, API/classes for a single service, full project hot-caches.

## Reading (from any project)

1. `GLOBAL_MEMORY_ROOT/MEMORY.md`
2. `memory/hot-cache.md` as needed
3. `memory/wiki/projects-registry.md` to find repos
4. `memory/wiki/project-<slug>.md` for project card

## Writing (on `/memo-session-skill`)

- Only facts with `scope: portfolio` or body for `scope: both`.
- Dated journals (`changelog`, `decisions`, `open-loops`, …): **newest first** — see `SKILL.md` "Dated entries"; changelog — `from:<project-slug>` in the reason field.
- Details: [portfolio-schema.md](portfolio-schema.md).

## Search

```text
rg -i "<query>" "D:/CURSOR/global-memory/MEMORY.md" "D:/CURSOR/global-memory/memory"
```

On Windows without `rg`: `Select-String -Path "D:\CURSOR\global-memory\memory\**\*.md" -Pattern "<query>" -SimpleMatch`

Then `projects-registry.md` → `local_path` / `git_remote` → project `MEMORY.md` if needed.

## Skill

Process canon: `~/.cursor/skills/memo-session-skill/SKILL.md` (after `npx skills add shenwell/ai-agent-skills --skill memo-session-skill`). **Do not** copy into global-memory.
