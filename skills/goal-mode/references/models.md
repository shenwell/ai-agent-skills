# Model Routing

Два способа задать модель. Можно комбинировать.

## Способ 1 — выпадашка в `.cursor/agents/*.md` (рекомендуется)

Cursor показывает **model picker** в UI при редактировании файла субагента.

Откройте, например, [goal-planner.md](../../agents/goal-planner.md) и выберите модель в поле `model:`:

```yaml
---
name: goal-planner
description: ...
model: gpt-5.3-codex-high   # ← клик → выпадашка всех доступных моделей
---
```

| Файл агента | Роль | Модель по умолчанию |
|-------------|------|---------------------|
| `goal-intake.md` | Критерии из репо | Codex 5.3 High |
| `goal-planner.md` | Мастер-план | Codex 5.3 High |
| `goal-phase-planner.md` | План фазы | Codex 5.3 High |
| `goal-worker.md` | Код | Composer 2.5 |
| `goal-verifier.md` | Verify | Composer 2.5 |

При вызове `mcp_task(subagent_type="goal-planner", ...)` Cursor **сам** возьмёт `model` из frontmatter агента.

## Способ 2 — пул и defaults в config

Файл [goal.models.yml](../../goal.models.yml) (или секция `models` в `goal.config.yml`):

```yaml
models:
  available:          # справочник: какие модели для каких ролей
    - id: gpt-5.3-codex-high
      label: Codex 5.3 High
      for: [master_plan, phase_plan]
    - id: composer-2.5[fast=false]
      label: Composer 2.5
      for: [execute, verify]
  planning: gpt-5.3-codex-high
  coding: composer-2.5[fast=false]
```

Проверка:

```bash
node .cursor/skills/goal-mode/scripts/goal-models.js
node .cursor/skills/goal-mode/scripts/goal-models.js --json master_plan
```

## Приоритет

```
1. model в frontmatter агента (.cursor/agents/*.md)  ← UI dropdown
2. models.<step> в goal.models.yml / goal.config.yml
3. models.planning / models.coding (группа)
4. inherit (модель родительской сессии)
```

## Несколько моделей на выбор

- В **available** перечислите все модели, которые допустимы в проекте
- В каждом агенте через **выпадашку** выберите одну из пула
- Для A/B: дублируйте агента, например `goal-worker-fast.md` с `composer-2.5-fast`

## Параметры модели (bracket syntax)

```yaml
model: composer-2.5[fast=false]     # не fast-вариант
model: claude-opus-4-8[effort=high]
```

## mcp_task model (опционально)

Если frontmatter задан — **не дублируйте** `model` в mcp_task.

Если нужно переопределить разово:

```
mcp_task(subagent_type="goal-worker", model="composer-2.5-fast", ...)
```

## Ограничения Cursor

- На legacy-планах subagents могут форситься на Composer — нужен Max Mode
- Баги: frontmatter иногда игнорируется — см. troubleshooting.md
- Cloud Agent: модель выбирается в UI при запуске VM
