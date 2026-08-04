# Goal Mode: план фикса преждевременной остановки

**Статус:** draft (для переноса в `goal-mode`)  
**Дата:** 2026-07-22  
**Контекст:** повторяющийся инцидент — агент завершает ход после одной итерации при `status: CONTINUE`, хотя цель не достигнута. Пользователь ожидает непрерывное выполнение до `COMPLETE` / `BLOCKED` / `FAILED`.

**Аудитория:** maintainers `goal-mode`, интеграторы Goal Mode в целевые репозитории.

---

## 1. Симптомы

| Симптом | Частота |
|---------|---------|
| После auto-continue агент делает **ровно одну** итерацию (worker → verifier → GOAL.md) и завершает ответ | Повторяющийся |
| `GOAL.md`: `status: CONTINUE`, `active_step` указывает на следующий шаг, но работа не продолжается без нового сообщения пользователя | Повторяющийся |
| Прогресс «рваный»: 24 итерации = 24 отдельных хода с потерей контекста между ними | Систематический |
| Hook `stop` иногда не срабатывает или срабатывает с задержкой — пользователь видит «тишину» | Эпизодический |

**Не является багом:** агент корректно ставит `CONTINUE` и обновляет `active_step` — проблема в **оркестрации**, не в worker/verifier.

---

## 2. Диагноз: конфликт инструкций

В текущей поставке Goal Mode одновременно действуют **противоречащие** правила:

| Источник | Инструкция | Эффект |
|----------|------------|--------|
| `.cursor/commands/goal.md` (Execute, п. 5) | «Не останавливаться на CONTINUE в той же сессии, пока бюджет позволяет» | Parent должен крутить цикл |
| `.cursor/hooks/goal-stop-continue.js` | `Execute one iteration: goal-worker then goal-verifier` | Parent делает **один** шаг и завершает ход |
| `.cursor/agents/goal-worker.md` | «One iteration = one step» | Worker — атомарный (это **правильно**) |
| `.cursor/skills/goal-mode/SKILL.md` | «One Iteration (Level 4)» — execute ONE phase sub-step | Parent воспринимает весь ход как одну итерацию |
| Auto-continue prompt (`goal-status.js`) | `Continue iteration #N` | Усиливает модель «один ход = одна итерация» |

### Архитектурная схема (as-is)

```
Пользователь / Automation
        │
        ▼
┌───────────────────┐
│  Parent Agent     │  ← должен оркестрировать, но получает «one iteration»
└─────────┬─────────┘
          │ 1× mcp_task
          ▼
┌───────────────────┐
│  goal-worker      │  ← один шаг phase-N.md  ✓
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  goal-verifier    │  ← verify шага  ✓
└─────────┬─────────┘
          │
          ▼
   GOAL.md updated
   status: CONTINUE
          │
          ▼
   Parent ЗАВЕРШАЕТ ХОД  ← проблема
          │
          ▼ (опционально)
┌───────────────────┐
│  stop hook        │  followup_message → новый ход
│  loop_limit: 25   │  (отдельная сессия, summary, потеря контекста)
└───────────────────┘
```

**Вывод:** система спроектирована как **цепочка одношаговых ходов** через stop-hook, а не как **in-session loop** до завершения цели. Hook — страховка, не основной режим.

### Дополнительные ограничения

| Проблема | Где | Деталь |
|----------|-----|--------|
| `loop_limit: 25` < `max_iterations: 50` | `hooks.json` | Auto-continue перестаёт цеплять followup после 25-го хода |
| Hook молча падает | `goal-stop-continue.js` `catch → {}` | Нет логов, пользователь не знает почему остановилось |
| Нет `execution.mode` в config | `goal.config.yml` | Невозможно переключить single vs run-until-complete |
| `goal-status.js` не отдаёт «сколько осталось» | scripts | Агент не видит масштаб незавершённой работы |
| Troubleshooting не описывает кейс | `references/troubleshooting.md` | Нет runbook для premature stop |

---

## 3. Целевое поведение (to-be)

### Режимы выполнения

Ввести явный `execution.mode` в `goal.config.yml`:

| Режим | Когда использовать | Поведение parent agent |
|-------|-------------------|------------------------|
| `single_iteration` | Отладка, CI smoke, ручной контроль | Один шаг → стоп (как сейчас) |
| `run_until_complete` | **По умолчанию** для `/goal <текст>` и Cloud Agent | Цикл worker→verifier в **одной сессии** до терминального статуса или лимита шагов |

### Терминальные статусы (стоп обязателен)

- `COMPLETE` — все критерии с HIGH evidence
- `BLOCKED` — нужен ввод человека (A/B/C)
- `FAILED` — бюджет исчерпан
- `PAUSED` — ручная остановка

### Нетерминальные (продолжать)

- `ACTIVE`, `CONTINUE`, `PLANNED` (если execution уже начат)

### Два уровня лимитов

```yaml
budget:
  max_iterations: 50        # глобальный бюджет цели (GOAL.md)

execution:
  mode: run_until_complete
  max_steps_per_session: 10 # шагов за один ход parent (защита от timeout)
```

- **max_iterations** — не превышать за всю жизнь цели
- **max_steps_per_session** — сколько шагов parent делает за один ход; при исчерпании → `CONTINUE` + hook подхватывает следующий ход

---

## 4. План изменений по файлам

### Фаза A — Config и контракт (breaking: нет, additive)

#### A1. `.cursor/goal.config.yml`

```yaml
execution:
  mode: run_until_complete   # single_iteration | run_until_complete
  max_steps_per_session: 10
  stop_on: [COMPLETE, BLOCKED, FAILED, PAUSED]

hooks:
  auto_continue_on_stop: true
  inject_goal_on_session_start: true
  max_continue_loops: 50     # NEW: синхронизировать с max_iterations
```

**Default для новых установок:** `run_until_complete`.  
**Миграция:** существующие проекты получают `single_iteration` явно, если не обновлены (обратная совместимость один релиз).

#### A2. `templates/GOAL.template.md`

Добавить в frontmatter (опционально, override project default):

```yaml
execution_mode: null   # null = из goal.config.yml
```

---

### Фаза B — Скрипты

#### B1. `scripts/goal-status.js`

**Добавить в JSON-вывод:**

```json
{
  "execution_mode": "run_until_complete",
  "max_steps_per_session": 10,
  "steps_remaining_in_phase": 4,
  "phases_remaining": 3,
  "criteria_remaining": ["C5", "C6", "C7"],
  "terminal": false,
  "session_should_loop": true
}
```

**Логика `steps_remaining_in_phase`:**

1. Прочитать `phases/phase-{current_phase}.md`
2. Посчитать `- [ ]` vs `- [x]` в секции Steps

**Логика `session_should_loop`:**

```javascript
session_should_loop =
  should_continue &&
  execution.mode === 'run_until_complete' &&
  iteration < max_iterations;
```

**Новый helper:** `buildSessionLoopPrompt(goalPath, meta, config)` — текст для parent при `run_until_complete`.

#### B2. `scripts/goal-config.js` (NEW)

Единая точка чтения `goal.config.yml` (сейчас дублируется в hooks и goal-status):

```javascript
// exports: loadConfig(), getExecutionMode(), getMaxStepsPerSession()
```

Использовать в: `goal-status.js`, `goal-stop-continue.js`, `goal-session-start.js`.

#### B3. `hooks/goal-stop-continue.js`

**Изменить формирование `followup_message`:**

```javascript
const mode = config.execution?.mode ?? 'single_iteration';
const maxSteps = config.execution?.max_steps_per_session ?? 10;

const tail =
  mode === 'run_until_complete'
    ? [
        `Execution mode: run_until_complete.`,
        `Run up to ${maxSteps} iterations (worker → verifier → GOAL.md) in THIS session.`,
        `Do NOT stop after the first step while status is ACTIVE or CONTINUE.`,
        `Stop only on: COMPLETE, BLOCKED, FAILED, PAUSED, or session step limit.`,
      ].join(' ')
    : 'Execute one iteration: goal-worker then goal-verifier. Update GOAL.md.';
```

**Улучшить observability:**

- При `catch` — писать в stderr (не глотать молча)
- Опционально: append в `goals/{id}/.goal-hook.log`

**Синхронизация loop_limit:**

- Читать `hooks.max_continue_loops` или `budget.max_iterations` из config
- Документировать: `hooks.json` `loop_limit` ≥ `max_iterations`

#### B4. `hooks/goal-session-start.js`

Добавить в `additional_context`:

```markdown
## Goal Execution Policy
Mode: run_until_complete
Session step budget: 10
Rule: While should_continue=true, parent agent MUST loop worker→verifier without ending the turn after one step.
```

---

### Фаза C — Skill и команды

#### C1. `.cursor/skills/goal-mode/SKILL.md`

**Добавить секцию «Session loop (run_until_complete)»** после «One Iteration (Level 4)»:

```markdown
## Session Loop (execution.mode = run_until_complete)

Parent agent — **оркестратор**. goal-worker — **исполнитель одного шага**.

```
steps_done = 0
WHILE status ∈ {ACTIVE, CONTINUE} AND iteration < max_iterations AND steps_done < max_steps_per_session:
  1. Read GOAL.md + phases/phase-{current_phase}.md
  2. Next unchecked step → mcp_task goal-worker
  3. mcp_task goal-verifier
  4. Update GOAL.md + phase file
  5. If phase complete → current_phase++, load next phase plan
  6. steps_done++
  7. If status ∈ {COMPLETE, BLOCKED, FAILED} → BREAK
END WHILE
```

**Запрещено:** завершать ответ пользователю после шага 3, если status всё ещё CONTINUE и steps_done < max_steps_per_session.

**Разрешённый стоп mid-session:** только при исчерпании `max_steps_per_session` (status остаётся CONTINUE; hook подхватит).
```

**Обновить «Stopping Rules»:**

| status | run_until_complete | single_iteration |
|--------|-------------------|------------------|
| CONTINUE | Продолжать в сессии | Стоп, ждать hook/пользователя |
| COMPLETE | Стоп | Стоп |

#### C2. `.cursor/commands/goal.md`

**Согласовать п. 5 Execute:**

```markdown
3. Цикл до COMPLETE | BLOCKED | FAILED:
   - Режим `run_until_complete` (default): parent крутит до `max_steps_per_session` шагов за ход
   - Режим `single_iteration`: один шаг за ход; продолжение через stop hook
4. Не останавливаться на CONTINUE в той же сессии при `run_until_complete`
```

**Добавить подкоманду:**

```markdown
| `/goal run-until-complete [id]` | Явный запуск с session loop (alias для run при mode=run_until_complete) |
```

#### C3. `references/troubleshooting.md`

Новая секция:

```markdown
## Premature Stop After CONTINUE

**Symptoms:** One iteration done, status CONTINUE, agent ends turn.

**Causes:**
1. execution.mode = single_iteration (or unset, legacy hook message)
2. Parent follows hook "Execute one iteration" literally
3. loop_limit exhausted in hooks.json

**Fix:**
1. Set execution.mode: run_until_complete in goal.config.yml
2. Update goal-stop-continue.js message (phase B3)
3. Raise hooks.json loop_limit to match max_iterations
4. Re-run: /goal resume <id>
```

#### C4. `references/automation-setup.md`

- Cloud Agent prompt: использовать `session_should_loop` из goal-status JSON
- Hourly automation: при `run_until_complete` запускать с `max_steps_per_session`, не single step

---

### Фаза D — Агенты

#### D1. `.cursor/agents/goal-worker.md`

**Без изменений по scope** — worker остаётся «one step». Добавить одну строку:

```markdown
Note: Parent agent may invoke you multiple times per session in run_until_complete mode.
```

#### D2. `.cursor/agents/goal-verifier.md`

**Добавить в return contract:**

```markdown
Return JSON block:
- step_verdict: SATISFIED | NOT_SATISFIED
- should_continue: true | false
- stop_reason: null | COMPLETE | BLOCKED | FAILED | SESSION_LIMIT
- next_step_hint: "phase-4 step 4d — ..."
```

Parent читает `should_continue` для решения о продолжении цикла.

#### D3. NEW: `.cursor/agents/goal-orchestrator.md` (опционально, фаза 2)

Отдельный агент только для session loop — если parent в Cursor плохо держит многошаговый цикл:

```yaml
name: goal-orchestrator
description: Runs worker→verifier loop until terminal status or session limit
model: composer-2.5
skills: [goal-mode]
```

`/goal run` делегирует orchestrator вместо parent. Worker/verifier без изменений.

---

### Фаза E — Hooks manifest

#### E1. `.cursor/hooks.json`

```json
{
  "hooks": {
    "stop": [
      {
        "command": "node .cursor/hooks/goal-stop-continue.js",
        "loop_limit": 50
      }
    ]
  }
}
```

**Правило:** `loop_limit` ≥ `budget.max_iterations` (документировать в README).

---

## 5. Матрица совместимости

| Компонент | single_iteration | run_until_complete |
|-----------|------------------|-------------------|
| goal-worker | 1 step | 1 step (много вызовов за сессию) |
| goal-verifier | 1 verify | 1 verify (много вызовов) |
| stop hook | Основной драйвер | Fallback при session limit / timeout |
| Cloud Agent 6h | Подходит | Подходит + меньше re-trigger |
| Локальный Cursor | Ручной контроль | Быстрее до COMPLETE |
| CI / smoke | **Рекомендуется** | Не использовать |

---

## 6. План внедрения в goal-mode

### Релиз v0.2.0-goal-mode (предлагаемый)

| # | Задача | Файлы | Приоритет |
|---|--------|-------|-----------|
| 1 | `goal-config.js` — единый парсер config | scripts/ | P0 |
| 2 | `execution` block в goal.config.yml + defaults | goal.config.yml, install.ps1 | P0 |
| 3 | Session loop в SKILL.md | skills/goal-mode/SKILL.md | P0 |
| 4 | Hook message по mode | hooks/goal-stop-continue.js | P0 |
| 5 | goal-status.js — extended JSON | scripts/goal-status.js | P1 |
| 6 | sessionStart — execution policy | hooks/goal-session-start.js | P1 |
| 7 | goal.md — согласовать Execute | commands/goal.md | P1 |
| 8 | verifier return contract | agents/goal-verifier.md | P1 |
| 9 | troubleshooting + automation docs | references/ | P1 |
| 10 | hooks.json loop_limit 50 | hooks.json | P1 |
| 11 | goal-orchestrator agent | agents/ | P2 |
| 12 | Hook debug log | hooks/ | P2 |

### Порядок merge (минимальный рабочий фикс — «MVP»)

Три файла, достаточных для 80% эффекта:

1. `goal.config.yml` — `execution.mode: run_until_complete`
2. `SKILL.md` — session loop для parent
3. `goal-stop-continue.js` — убрать «Execute one iteration» в default mode

Остальное — hardening.

---

## 7. Тест-план (acceptance)

### 7.1 Unit (scripts)

| Тест | Вход | Ожидание |
|------|------|----------|
| `goal-config` parse | yaml с execution block | mode, max_steps корректны |
| `goal-status` steps_remaining | phase-4.md с 3/7 [x] | `steps_remaining_in_phase: 4` |
| `goal-status` session_should_loop | CONTINUE + run_until_complete | `true` |
| hook message | mode=run_until_complete | нет строки «one iteration» |

### 7.2 Integration (dogfood)

Создать тестовую цель `goals/_test-run-until-complete/`:

- 5 шагов в phase-0.md (trivial: touch file, run echo)
- `max_steps_per_session: 3`
- Запуск `/goal run _test-run-until-complete`

**Pass criteria:**

1. За один ход parent выполняет **3 шага**, не 1
2. GOAL.md: `iteration` увеличился на 3
3. После хода status `CONTINUE`; hook запускает ход 2
4. После 5 шагов status `COMPLETE`

### 7.3 Regression

| Кейс | mode | Ожидание |
|------|------|----------|
| Отладка одного шага | single_iteration | 1 шаг, стоп |
| BLOCKED на шаге 2 | run_until_complete | стоп на BLOCKED, не шаг 3 |
| iteration >= max_iterations | любой | FAILED, hook не continue |

### 7.4 Real-world (goprogress incident)

Цель: `получить-полностью-проверенный-и-работоспособный`

- Phase 4: шаги 4d–4g за ≤2 session loops (не 4 отдельных пользовательских триггера)
- Метрика: «количество пользовательских сообщений между 4c и 4g» ≤ 2

---

## 8. Документация для README goal-mode

Добавить секцию **Execution modes**:

```markdown
## Execution modes

| Mode | Description |
|------|-------------|
| `run_until_complete` (default) | Parent runs multiple worker→verifier cycles per session |
| `single_iteration` | One step per agent turn; continuation via stop hook |

Configure in `.cursor/goal.config.yml`:

\`\`\`yaml
execution:
  mode: run_until_complete
  max_steps_per_session: 10
\`\`\`

**Tip:** If the agent stops after one step, check:
1. `execution.mode` is not `single_iteration`
2. `hooks.json` → `loop_limit` ≥ `budget.max_iterations`
3. Parent follows session loop in goal-mode SKILL.md
```

---

## 9. Миграция существующих проектов

### install.ps1 / upgrade path

```powershell
# При обновлении goal-mode:
# 1. Merge goal.config.yml — добавить execution block если отсутствует
# 2. Не перезаписывать active_goal и verify overrides
# 3. Предупреждение если hooks.json loop_limit < max_iterations
```

### Changelog entry (шаблон)

```markdown
## [0.2.0] - 2026-07-XX

### Added
- `execution.mode`: `run_until_complete` | `single_iteration`
- `execution.max_steps_per_session` — batch steps per agent turn
- Extended goal-status JSON: steps_remaining, session_should_loop
- Troubleshooting: Premature Stop After CONTINUE

### Changed
- Default execution mode: `run_until_complete`
- stop hook followup message respects execution mode
- hooks.json loop_limit: 25 → 50

### Migration
- Existing projects: add `execution:` block to goal.config.yml
- No breaking changes to GOAL.md format
```

---

## 10. Риски и mitigations

| Риск | Вероятность | Mitigation |
|------|-------------|------------|
| Timeout Cloud Agent при 10 шагах за сессию | Средняя | `max_steps_per_session` настраиваемый; default 5–10 |
| Token budget за один ход | Средняя | Лимит шагов; `.cursorignore`; короткие phase plans |
| Parent игнорирует session loop | Средняя | sessionStart inject; verifier `should_continue`; orchestrator agent (P2) |
| Ложный COMPLETE при batch | Низкая | verifier на каждом шаге; COMPLETE только goal-verifier на всех criteria |
| Hook loop_limit vs iterations | Высокая (сейчас) | Синхронизация в config + install check |

---

## 11. Критерии готовности фикса (definition of done)

- [ ] `execution.mode` в goal.config.yml, задокументирован в README
- [ ] SKILL.md описывает session loop; противоречие с «one iteration» в parent устранено
- [ ] stop hook не говорит «one iteration» при `run_until_complete`
- [ ] `loop_limit` ≥ `max_iterations`
- [ ] goal-status отдаёт `steps_remaining_in_phase` и `session_should_loop`
- [ ] Troubleshooting: секция Premature Stop
- [ ] Dogfood-тест `_test-run-until-complete` проходит
- [ ] Changelog v0.2.0 опубликован

---

## 12. Связанные артефакты

| Репозиторий / путь | Роль |
|--------------------|------|
| `goal-mode/` | Каноническая поставка Goal Mode |
| `goal-mode/.cursor/skills/goal-mode/` | Skill + references |
| `goal-mode/install.ps1` | Доставка в целевой проект |
| Целевой проект `goals/{id}/GOAL.md` | Контракт конкретной цели |
| Инцидент: goprogress iteration 22→24 | Dogfood evidence |

---

## Приложение A — Diff-скелет hook message

```diff
--- a/.cursor/hooks/goal-stop-continue.js
+++ b/.cursor/hooks/goal-stop-continue.js
@@ -55,9 +55,18 @@
       return;
     }

+    const mode = status.execution_mode || 'single_iteration';
+    const maxSteps = status.max_steps_per_session || 10;
+    const tail =
+      mode === 'run_until_complete'
+        ? `Run up to ${maxSteps} iterations (worker → verifier → GOAL.md) in THIS session. ` +
+          `Do NOT stop after one step while status is ACTIVE or CONTINUE. ` +
+          `Stop only on COMPLETE, BLOCKED, FAILED, PAUSED, or session step limit.`
+        : 'Execute one iteration: goal-worker then goal-verifier. Update GOAL.md.';
+
     const msg = [
       '[Goal Mode auto-continue]',
       status.resume_prompt,
-      'Execute one iteration: goal-worker then goal-verifier. Update GOAL.md.',
+      tail,
     ].join('\n');
```

## Приложение B — Пример session loop prompt для Cloud Agent

```
Read goals/{id}/GOAL.md completely.
Execution mode: run_until_complete. Session step budget: 10.

While status is ACTIVE or CONTINUE and iteration < max_iterations:
  - Execute next unchecked step via goal-worker
  - Verify via goal-verifier
  - Update GOAL.md
  - Do NOT end your response until terminal status or step budget exhausted

Follow goal-mode skill exactly.
```

---

*Документ подготовлен по инциденту goprogress (Goal Mode, phase 4, iterations 22–24). Перенос в goal-mode: `docs/wiki/goal-mode-premature-stop-fix-plan.md` или `docs/goal-mode-premature-stop-fix-plan.md`.*
