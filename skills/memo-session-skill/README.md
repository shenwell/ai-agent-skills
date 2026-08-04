```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███╗   ███╗███████╗███╗   ███╗ ██████╗     ███████╗███████╗███████╗███████╗ ║
║  ████╗ ████║██╔════╝████╗ ████║██╔═══██╗    ██╔════╝██╔════╝██╔════╝██╔════╝ ║
║  ██╔████╔██║█████╗  ██╔████╔██║██║   ██║    ███████╗█████╗  █████╗  ███████╗ ║
║  ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║    ╚════██║██╔══╝  ██╔══╝  ╚════██║ ║
║  ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝    ███████║███████╗███████╗███████║ ║
║  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝     ╚══════╝╚══════╝╚══════╝╚══════╝ ║
║                                                                              ║
║     Session knowledge → MEMORY.md · memory/ · wiki · portfolio memory        ║
║              Pairs with goal-mode checkpoints · Cursor · MIT                 ║
║                          v1.0.0 · August 2026                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/memo-session-skill)

**memo-session-skill** — [Agent Skill](https://agentskills.io/), который анализирует рабочую сессию, отделяет шум от долговременного знания и маршрутизирует выводы в правильный канал: `MEMORY.md`, `memory/` (HOT/WARM), вики, `AGENTS.md`, скиллы и опционально портфельную память.

Отвечает на русском. Conflict gate, лимиты температур, dual-write в портфель без дублей.

## Quickstart

### Install

**Глобально** — все проекты на машине:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**Только этот репозиторий:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -a cursor -y
```

Вместе с goal-mode (рекомендуется):

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

### Первый запуск

В проекте после нетривиальной сессии:

```
подведи итоги сессии
```

или

```
сохрани знания и сделай handoff
```

Скилл сам выполнит preflight (gitignore, bootstrap каркаса `memory/`), классификацию и запись. Коммит — только по явной просьбе.

Коллекция: [AI Agent Skills](../../README.md) · протокол: [`SKILL.md`](SKILL.md)

## Когда использовать

- «Подведём итоги», «сохрани знания», «handoff», «open loops»
- После отладки, workaround, коррекции пользователя, архитектурного решения
- **Автоматически** из goal-mode: фаза завершена, `BLOCKED`, `COMPLETE`, лимит шагов сессии

**Не использовать** для однострочных фактов, секретов, замены git log.

## Связь с goal-mode

Goal Mode ведёт `GOAL.md` и верификацию «до зелёного». Memo-session сохраняет устойчивый контекст между итерациями и сессиями.

| Событие goal-mode | Memo |
|-------------------|------|
| Фаза complete | `full` pipeline |
| BLOCKED / COMPLETE | `full` |
| Лимит шагов / каждые N итераций | `light` (hot-cache) |

Детали: [`references/goal-mode-integration.md`](references/goal-mode-integration.md) · [goal-mode memory checkpoints](../goal-mode/references/memory-checkpoints.md)

## Layout

```
SKILL.md              ← протокол агента (обязательно)
references/           ← портфель, global-memory, goal-mode, шаблоны
agents/               ← portfolio-librarian (опциональный субагент)
```

## License

MIT (см. [корень репо](../../LICENSE)).
