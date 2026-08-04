# Dry-run checklist (портфель + скилл)

Проверка после внедрения global-memory (2026-05-26).

## Структура

- [ ] `D:/CURSOR/global-memory/MEMORY.md` существует
- [ ] `D:/CURSOR/global-memory/memory/changelog.md` существует
- [ ] `D:/CURSOR/global-memory/memory/wiki/projects-registry.md` содержит `local_path` и `git_remote`
- [ ] `~/.cursor/skills/memo-session-skill/references/global-memory.md` указывает `D:/CURSOR/global-memory`
- [ ] `SKILL.md` содержит Preflight §1.5, §1.6, scope, портфельный отчёт §6
- [ ] Нет `SKILL.md` внутри `D:/CURSOR/global-memory`

## Поиск

```powershell
rg -i "GLOBAL_MEMORY_ROOT" "D:/CURSOR/global-memory"
rg -i "projects-registry" "D:/CURSOR/global-memory/memory/wiki"
```

## Scope (ручной сценарий в проекте)

1. Открыть проектный репо с `MEMORY.md`.
2. Вызвать memo-session после задачи с API gotcha → только `scope: project`.
3. После задачи с сервером/доменом → `scope: portfolio`, строка в global changelog с `from:<slug>`.
4. Убедиться: один абзац не в обоих hot-cache.

## AGENTS.md

В пилотном проекте вставить [agents-md-template.md](agents-md-template.md); повторный memo-session → Preflight §1.6 ok.
