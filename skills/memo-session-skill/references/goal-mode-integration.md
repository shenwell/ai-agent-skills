# Интеграция с goal-mode

**Скиллы:** `memo-session-skill` + `goal-mode` ([shenwell/ai-agent-skills](https://github.com/shenwell/ai-agent-skills))

Goal Mode фиксирует **что произошло** в `GOAL.md` (Progress Log, статусы, итерации). Memo-session сохраняет **устойчивое знание** — решения, gotcha, workaround — в `memory/` и вики, чтобы следующий ход агента (после summarization или stop-hook) не потерял контекст проекта.

## Установка пары

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

После первого `/goal` в проекте bootstrap копирует `.cursor/goal.config.yml` с блоком `memory.checkpoints` → `skill: memo-session-skill`.

## Когда goal-mode вызывает memo-session

| Событие | Глубина | Действие |
|---------|---------|----------|
| Фаза завершена (exit criterion verified) | `full` | Полный пайплайн memo-session |
| `BLOCKED` | `full` | Handoff с блокером и опциями |
| `COMPLETE` | `full` | Закрыть open-loops; wiki runbook; портфель при cross-repo |
| Лимит шагов сессии (`max_steps_per_session`) | `light` | Только `hot-cache` + open-loops |
| Каждые N итераций (`every_n_iterations`) | `light` | Пакетный checkpoint |

Подробности: [goal-mode/references/memory-checkpoints.md](../../goal-mode/references/memory-checkpoints.md).

## Глубина memo

### `light` (2–5 мин, inline родителем)

- `memory/hot-cache.md` — goal id, phase, iteration, 3–7 буллетов новых фактов
- `memory/open-loops.md` — новый блокер или follow-up
- `goals/{id}/GOAL.md` frontmatter: `last_memory_checkpoint: <iteration>`

### `full` (полный пайплайн memo-session-skill)

Preflight → classify → route → conflict gate → запись:

- **HOT** — решения, активный контекст следующей сессии
- **WARM** — demote из HOT при лимитах
- **COLD (wiki)** — `memory/wiki/goal-<goal-id>.md`
- **Портфель** — если цель затронула infra, deploy или cross-repo факты

Строка в `memory/changelog.md` после записей.

## Вики на цель

```
memory/wiki/goal-<goal-id>.md   # runbook по цели
memory/wiki/index.md            # ссылка в разделе «Goals»
```

Ссылка из Progress Log: `Memory: memory/wiki/goal-<id>.md`.

На **COMPLETE**: секция «Outcome» в wiki; demote HOT, относящиеся только к этой цели.

## Конфиг (goal.config.yml)

```yaml
memory:
  skill: memo-session-skill
  checkpoints:
    enabled: true
    on_phase_complete: full
    on_blocked: full
    on_complete: full
    on_session_limit: light
    every_n_iterations: 10
  wiki:
    per_goal_page: true
```

Отключить: `memory.checkpoints.enabled: false`.

## Ручной триггер

```
подведи итоги по цели
сохрани знания после goal-mode
```

Родительский агент goal-mode запускает checkpoints автоматически; пользователю не нужно помнить про memo.
