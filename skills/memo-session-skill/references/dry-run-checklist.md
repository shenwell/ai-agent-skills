# Dry-run checklist (portfolio + skill)

Verification after enabling optional portfolio memory.

**Prerequisite:** `GLOBAL_MEMORY_ROOT:` set in a pilot project's `AGENTS.md` (see [global-memory.md](global-memory.md)). Substitute `$ROOT` below with that resolved path.

## Structure

- [ ] `$ROOT/MEMORY.md` exists
- [ ] `$ROOT/memory/changelog.md` exists
- [ ] `$ROOT/memory/wiki/projects-registry.md` contains `local_path` and `git_remote`
- [ ] Installed skill `references/global-memory.md` documents resolution from `AGENTS.md` only (no maintainer-specific default path)
- [ ] `SKILL.md` contains Preflight §1.5, §1.6, scope, portfolio report §6
- [ ] No copy of `memo-session-skill/SKILL.md` inside `$ROOT`

## Search

```bash
rg -i "GLOBAL_MEMORY_ROOT" "$ROOT"
rg -i "projects-registry" "$ROOT/memory/wiki"
```

## Scope (manual scenario in a project)

1. Open a project repo with `MEMORY.md` and `GLOBAL_MEMORY_ROOT:` in `AGENTS.md`.
2. Invoke memo-session after a task with an API gotcha → `scope: project` only.
3. After a task with server/domain → `scope: portfolio`, line in portfolio changelog with `from:<slug>`.
4. Verify: one paragraph is not in both hot-caches.

## AGENTS.md

In a pilot project insert [agents-md-template.md](agents-md-template.md); repeat memo-session → Preflight §1.6 ok.
