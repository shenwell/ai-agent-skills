# Time Tracking

Goal Mode отслеживает **wall-clock время** сессий и (опционально) **детализацию по активностям**.

## Что отслеживается автоматически

| Событие | Механизм | Файл |
|---------|----------|------|
| Старт сессии Cursor | `sessionStart` hook → `goal-time.js session-start` | `goals/{id}/time-log.json` |
| Конец сессии / stop hook | `stop` hook → `goal-time.js session-end` | `time-log.json` |
| Бюджет по часам | `goal-status.js` читает `time-log.json` | JSON status |
| Финальный отчёт | `goal-time.js report` при терминальном статусе | `SESSION_TIME_REPORT.md` |

## Детализация «на что потрачено»

Parent agent **после каждого шага** вызывает:

```bash
node .cursor/skills/goal-mode/scripts/goal-time.js log goals/{id} \
  --activity worker --detail "phase-0 step 3: fix lint in Button.tsx"
```

Типы активностей: `intake`, `master_plan`, `phase_plan`, `worker`, `verifier`, `verify_commands`, `memory_checkpoint`, `orchestration`, `other`.

### Когда логировать

| Этап | activity |
|------|----------|
| goal-intake | `intake` |
| goal-planner | `master_plan` |
| goal-phase-planner | `phase_plan` |
| goal-worker | `worker` |
| goal-verifier | `verifier` |
| `goal-verify.js` | `verify_commands` |
| memo-session-skill | `memory_checkpoint` |

## Команды

```bash
# Статус бюджета времени
node .cursor/skills/goal-mode/scripts/goal-time.js status goals/my-goal --json

# Сгенерировать / обновить отчёт
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/my-goal

# JSON с полным отчётом
node .cursor/skills/goal-mode/scripts/goal-time.js report goals/my-goal --format json
```

## Отчёт после сессии

Файл `goals/{id}/SESSION_TIME_REPORT.md` содержит:

- суммарное wall-clock время и остаток бюджета
- разбивку по типам активностей (%)
- список сессий (start → duration → reason)
- последние 30 залогированных шагов

**Parent agent обязан** в конце терминальной сессии (`COMPLETE`, `BLOCKED`, `FAILED`, исчерпан бюджет часов):

1. Вызвать `goal-time.js report`
2. Показать пользователю краткую сводку из отчёта (elapsed, top activities, путь к файлу)

## Бюджет 6+ часов

В `goal.config.yml`:

```yaml
budget:
  max_hours: 8   # или 12, 24 — любое значение

hooks:
  max_continue_loops: 72   # ≥ max_iterations и ~4× max_hours

cloud_agent:
  max_duration_hours: 8    # лимит одной VM; дальше — automation
```

Правила:

- `should_continue` = false, когда `elapsed >= max_hours` (даже если iteration < max_iterations)
- stop hook продолжает auto-continue, пока есть и iteration, и time budget
- Cloud Agent: одна VM ≤ `max_duration_hours`; для 12h+ включите [automation-setup.md](automation-setup.md) (hourly re-trigger)

## Формат time-log.json

```json
{
  "goal_id": "my-goal",
  "started_at": "2026-08-04T10:00:00.000Z",
  "total_wall_ms": 7200000,
  "sessions": [{ "session_id": "s-...", "started_at": "...", "duration_ms": 3600000, "end_reason": "continue" }],
  "activities": [{ "activity": "worker", "detail": "phase-0 step 1", "duration_ms": 0 }],
  "by_activity_ms": { "worker": 5400000, "verifier": 900000 }
}
```
