# Шаблон: блок «Память агента» в AGENTS.md проекта

Вставь в `AGENTS.md` проектного репозитория (5–10 строк). **Не** копируй сюда `memo-session-skill`.

```markdown
## Память агента

**Проект:** `MEMORY.md` → `memory/hot-cache.md` → при необходимости `warm-cache`, `open-loops`, `decisions` → `memory/wiki/`.

**Портфель (все проекты):** `D:/CURSOR/global-memory/MEMORY.md` → `memory/hot-cache.md` → `memory/wiki/projects-registry.md`.

При `/memo-session-skill`: обновлять проектную память; факты с `scope: portfolio` — в портфель (без дублирования абзацев в hot-cache проекта).

Override портфеля (редко): `GLOBAL_MEMORY_ROOT: <путь>`
```

После вставки при первом memo-session скилл проверит наличие блока в Preflight §1.6.
