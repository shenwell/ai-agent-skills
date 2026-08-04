# Dry-run checklist (portfolio + skill)

Verification after global-memory rollout (2026-05-26).

## Structure

- [ ] `D:/CURSOR/global-memory/MEMORY.md` exists
- [ ] `D:/CURSOR/global-memory/memory/changelog.md` exists
- [ ] `D:/CURSOR/global-memory/memory/wiki/projects-registry.md` contains `local_path` and `git_remote`
- [ ] `~/.cursor/skills/memo-session-skill/references/global-memory.md` points to `D:/CURSOR/global-memory`
- [ ] `SKILL.md` contains Preflight §1.5, §1.6, scope, portfolio report §6
- [ ] No `SKILL.md` inside `D:/CURSOR/global-memory`

## Search

```powershell
rg -i "GLOBAL_MEMORY_ROOT" "D:/CURSOR/global-memory"
rg -i "projects-registry" "D:/CURSOR/global-memory/memory/wiki"
```

## Scope (manual scenario in a project)

1. Open a project repo with `MEMORY.md`.
2. Invoke memo-session after a task with an API gotcha → `scope: project` only.
3. After a task with server/domain → `scope: portfolio`, line in global changelog with `from:<slug>`.
4. Verify: one paragraph is not in both hot-caches.

## AGENTS.md

In a pilot project insert [agents-md-template.md](agents-md-template.md); repeat memo-session → Preflight §1.6 ok.
