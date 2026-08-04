---
name: memo-session-skill
description: >-
  Analyze the work session and extract durable knowledge into the right channel —
  MEMORY.md, memory/ HOT/WARM layers, project wiki, AGENTS.md, skills, and optional
  portfolio memory — instead of losing context when the chat resets. Routes
  decisions, gotchas, and open loops with conflict gate and temperature limits.
  Use when the user says "подведём итоги", "сохрани знания", "handoff", "open loops",
  "обнови память", or after goal-mode phase complete / BLOCKED / COMPLETE checkpoints.
  Also use for portfolio/global memory, bootstrap project memory, or session changelog.
  Prefer after non-trivial debugging, user corrections, or long goal-mode runs.
  Do not use for one-line trivia, secrets, or replacing git history.
metadata:
  version: "1.0.0"
  author: productlaba
  category: knowledge-management
  tags: memory, session, handoff, wiki, portfolio, changelog, goal-mode
---

# Memo Session Skill

**Turn session noise into durable knowledge** — decisions, gotchas, workarounds, and handoffs — routed into the right place instead of lost when context resets.

Most agent sessions end with valuable context trapped in chat: a workaround that took an hour to find, a user correction (“never do X”), an infra detail, an open blocker. Memo Session Skill runs a **preflight → classify → route → conflict gate** pipeline so knowledge lands in `MEMORY.md`, `memory/` (HOT/WARM), project wiki (COLD), `AGENTS.md`, skills, or optional **portfolio memory** — with temperature limits and no duplicate paragraphs across channels.

Pairs with **[goal-mode](../goal-mode/SKILL.md)** for automatic checkpoints after phase complete, `BLOCKED`, or `COMPLETE`. See [references/goal-mode-integration.md](references/goal-mode-integration.md).

## Install this skill

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g
```

**With goal-mode** (recommended for long runs):

```bash
npx skills add shenwell/ai-agent-skills --skill goal-mode -g -a cursor -y
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

## Who it's for

Engineers and maintainers who want **session handoffs that survive context resets** — project memory in git, optional cross-repo portfolio layer, and automatic checkpoints during goal-mode runs.

## What you get

- HOT/WARM/COLD routing (`memory/` + wiki)
- Preflight: gitignore check, bootstrap scaffold, hygiene limits
- Conflict gate (clean / soft / hard) before writes
- Portfolio dual-write via `GLOBAL_MEMORY_ROOT` (optional)
- Integration hooks for goal-mode memory checkpoints

**Canonical docs:** [references/](references/) · [README](README.md) · collection [README](../../README.md)

## Quick start

After a non-trivial session:

```
подведи итоги сессии
```

The skill starts the pipeline immediately in Agent mode; it stops only for **hard conflicts** (contradictions with approved memory, secrets, git policy).

---

**Язык:** отвечай пользователю на русском.

Этот скилл анализирует сессию, отделяет шум от долговременного знания и предлагает, куда сохранить выводы: в `AGENTS.md`, `.cursor/rules/`, `tests/`, `MEMORY.md`, операционные файлы **`memory/`** (HOT/WARM), **вики `WIKI_ROOT/`** (COLD), пользовательские или проектные скиллы, а также в **портфельную память** (`GLOBAL_MEMORY_ROOT`, по умолчанию `D:/CURSOR/global-memory`). Схема проекта — в **`MEMORY.md`** (Preflight §3); схема портфеля — [references/portfolio-schema.md](references/portfolio-schema.md), путь — [references/global-memory.md](references/global-memory.md).

## Связь с goal-mode

Goal Mode фиксирует **ход выполнения** в `GOAL.md`. Memo-session сохраняет **устойчивое знание** в `memory/` и вики.

| Событие goal-mode | Глубина memo |
|-------------------|--------------|
| Фаза завершена | `full` — полный пайплайн |
| `BLOCKED` / `COMPLETE` | `full` |
| Лимит шагов сессии / каждые N итераций | `light` — hot-cache + open-loops |

Конфиг: `.cursor/goal.config.yml` → `memory.skill: memo-session-skill`. Подробности: [references/goal-mode-integration.md](references/goal-mode-integration.md) · [goal-mode memory-checkpoints](../goal-mode/references/memory-checkpoints.md).

## Быстрый Принцип

Порядок пайплайна: **контекст → preflight (проект + портфель) → дайджест → фильтр и scope → классификация → маршрутизация → conflict gate (проект, затем портфель) → запись (clean/soft) → changelog проекта и при необходимости портфеля → отчёт и handoff**.

Если `GLOBAL_MEMORY_ROOT` недоступен — **degraded mode**: проектный пайплайн без записи в портфель; в отчёте «Портфель пропущен».

При запуске в **Agent mode** сразу начинай пайплайн: после чтения контекста выполни **preflight** (gitignore, hygiene, bootstrap), затем анализируй сессию, маршрутизируй и применяй clean/soft updates без отдельного согласования.

В **Ask/Plan mode** выполняй только чтение, preflight-отчёт и анализ **без** bootstrap и без записи в файлы.

Останавливайся за подтверждением только на hard conflicts: противоречия с утверждённой памятью, safety rules, секретами, git-политикой или ситуациями, где невозможно выбрать канон без пользователя.

Не превращай memory в дневник команд. Сохраняй выводы, решения, проверенные workaround'ы, open loops, предпочтения пользователя и повторяемые паттерны.

## Когда Использовать

Используй этот скилл явно или автоматически, когда пользователь просит:

- подвести итоги сессии;
- сохранить знания;
- обновить документацию, memory или скиллы после работы;
- сформировать handoff на следующую сессию;
- разобраться, что из чата стоит зафиксировать.

Предлагай применить скилл сам, если в сессии были нетривиальная отладка, workaround, коррекция от пользователя, новое правило процесса, повторяемая ручная процедура, архитектурное решение, незакрытый блокер или регрессионный баг.

## Шаг 1: Понять Контекст

Если есть workspace, перед выводами прочитай минимум:

- `AGENTS.md` или `README.md`, если они есть;
- `.cursor/rules/`, если есть;
- существующий `MEMORY.md` и/или `memory/`, если есть;
- **папку проектной вики** — путь бери из `AGENTS.md` / `README.md`; если явно не задан, используй дефолт **`memory/wiki/`**;
- проектные скиллы `.cursor/skills/*/SKILL.md`, если релевантно.
- **Портфель:** разреши `GLOBAL_MEMORY_ROOT` (Preflight §1.5); если доступен — прочитай `MEMORY.md`, при необходимости `memory/hot-cache.md` и `memory/wiki/projects-registry.md` портфеля. Текущий workspace = **project memory**; портфель = **portfolio memory**. Не путай каналы.

Определи **project-slug** текущего репо (имя папки или строка в `projects-registry.md`) для changelog `from:<slug>`.

Определи тип проекта: код, инфраструктура, документация, handbook, knowledge vault, SEO/GEO или смешанный репозиторий. Дефолтный канон из раздела «Каноническая структура» применяй для новых артефактов; если в репозитории уже согласована другая схема, не ломай её без soft/hard conflict процедуры.

## Preflight (сразу после чтения контекста)

Выполняй **на каждом запуске** после шага 1, до дайджеста сессии.

### 1. Проверка `.gitignore`

Прочитай `.gitignore` (и при необходимости `.git/info/exclude`). Если **`MEMORY.md`**, **корень `memory/`** или **корень папки вики** (фактический `WIKI_ROOT`, см. канон) попадают под ignore — **не правь файл молча**: выведи заметный блок в отчёте и предложи удалить соответствующие строки **только после явного согласия пользователя**. Если этих путей **нет** в ignore — **ничего не меняй** в ignore.

### 2. Hygiene scan

- Посчитай строки в `MEMORY.md`, `memory/hot-cache.md`, `memory/warm-cache.md`, `memory/open-loops.md`, `memory/decisions.md` (если файлы есть).
- Проверь наличие **`memory/changelog.md`** (см. «Журнал изменений памяти» в каноне) и **`WIKI_ROOT/index.md`**.
- Если в `MEMORY.md` или `WIKI_ROOT/index.md` есть markdown-ссылки на пути внутри репозитория — отметь битые ссылки (файл отсутствует), включая ссылку на **`memory/changelog.md`**, если она есть.
- **Legacy:** если найден старый журнал `WIKI_ROOT/changelog.md` или `wiki/changelog.md` при уже принятом каноне **`memory/changelog.md`** — не удаляй без явного запроса; вынеси в **Memory hygiene** одну строку «мигрировать записи в `memory/changelog.md`».
- **Legacy:** если есть `memory/feedback/`, `memory/projects/`, `memory/references/`, `memory/archive/` — не удаляй; предложи перенос содержимого в `WIKI_ROOT/*.md` и ссылку из `index.md` (строка в начало changelog после решения пользователя).

Пороги см. «Лимиты температур». Превышение **не блокирует** пайплайн: вынеси в блок **`Memory hygiene`** demote HOT→WARM, promote WARM→вики, сжать индекс.

### 1.5. GLOBAL_MEMORY_ROOT (портфель)

1. Прочитай [references/global-memory.md](references/global-memory.md) — дефолт `D:/CURSOR/global-memory`.
2. Если в `AGENTS.md` проекта есть `GLOBAL_MEMORY_ROOT:` — используй override.
3. Проверь, что каталог существует и доступен для чтения. В Agent mode при отсутствии каркаса — bootstrap портфеля по [references/portfolio-schema.md](references/portfolio-schema.md) (как проектный Preflight §3, с портфельными лимитами).
4. Если недоступен — зафиксируй degraded mode, дальше только проектный preflight.

### 1.6. Проверка `AGENTS.md` проекта (поток памяти)

Чеклист (отметь ok / needs patch):

- [ ] Блок «Память агента» / «Поток памяти» с порядком чтения **проект → портфель**
- [ ] Ссылка на `GLOBAL_MEMORY_ROOT` или `D:/CURSOR/global-memory`
- [ ] Упоминание dual-write при memo-session без дублирования абзацев
- [ ] **Нет** требования копировать `memo-session-skill` в проект

В **Agent mode**, если блока нет и workspace — проектный репо (не сам `global-memory`): добавь шаблон из [references/agents-md-template.md](references/agents-md-template.md) (не переписывай весь `AGENTS.md`).

### 2b. Hygiene scan (портфель)

Если `GLOBAL_MEMORY_ROOT` доступен — те же проверки, что §2, для портфеля; лимиты — «Лимиты портфеля». Отдельный блок **Portfolio hygiene** в отчёте.

### 3. Bootstrap каркаса (только Agent mode)

Если отсутствует любой обязательный элемент канона — **создай недостающее** коротким шаблоном (заголовок + 2–5 строк назначения). Существующие файлы **не перезаписывай** целиком. **Не** создавай подпапки `memory/feedback/`, `projects/`, `references/`, `archive/` — долговременное знание только во вики (COLD).

Для **`memory/warm-cache.md`** при создании:

```markdown
# Warm cache

Средняя память: demote из HOT; promote стабильное во вики (COLD).
```

Для **`memory/changelog.md`** при создании достаточно минимального каркаса (полный формат только в каноне «Журнал изменений памяти»):

```markdown
# Changelog

Журнал изменений памяти проекта.

## YYYY-MM

```

Подставь текущий месяц вместо `YYYY-MM`.

Если отсутствует **`MEMORY.md`** — создай шаблон **инструкции для агента** (≤60 строк при первом bootstrap; в долгую ≤200):

```markdown
# Память проекта

Вход в память репозитория. Не дублирует вики и не заменяет git log.

## Температуры

| Слой | Файл / место | Смысл |
|------|----------------|--------|
| HOT | [hot-cache](memory/hot-cache.md) | Контекст ближайших 1–3 сессий |
| WARM | [warm-cache](memory/warm-cache.md) | Средняя память; demote из HOT |
| COLD | [Вики](memory/wiki/index.md) | Передаваемые статьи (`WIKI_ROOT/*.md`) |

Demote вниз (HOT→WARM), promote в вики (WARM→COLD). WARM — буллеты и ссылки, не эссе.

## Поток агента

1. Читать этот файл → `hot-cache` → при необходимости `warm-cache` → `open-loops` / `decisions`.
2. Срочное новое → HOT.
3. HOT переполнен или пункт остыл → WARM (в HOT при необходимости одна строка-ссылка).
4. Стабильное / процесс / ADR / длинный текст → страница вики + ссылка в `index.md` / здесь.
5. Правила поведения («не делай X») → `AGENTS.md` / `.cursor/rules/`, не в warm-cache.
6. После правок скилла → [changelog](memory/changelog.md) и прочие журналы с датой — **в начало** (см. «Записи по дате и времени»). Коммит — только по просьбе пользователя.

Лимиты и conflict gate: скилл **memo-session-skill**.

## Карта

- [changelog](memory/changelog.md) · [hot-cache](memory/hot-cache.md) · [warm-cache](memory/warm-cache.md)
- [open-loops](memory/open-loops.md) · [decisions](memory/decisions.md)
- [Вики — вход](memory/wiki/index.md)
```

## Шаг 2: Дайджест Сессии

Собери короткий human-readable summary:

- что сделали;
- что узнали;
- что проверено фактами;
- что осталось гипотезой;
- что сломалось или было неожиданным;
- какие решения приняты;
- какие обещания, блокеры и follow-up остались открытыми.

Отдельно отмечай коррекции пользователя: "не делай X", "всегда делай Y", "вот это правильный подход". Это кандидаты в **`AGENTS.md`**, **`.cursor/rules/`** или страницу вики `user-preferences.md`, не в `warm-cache`.

## Шаг 3: Фильтр Качества

Сохраняй только знания, которые проходят минимум 2 из 4 критериев:

- **Неочевидно:** это нельзя легко восстановить из кода, README или git log.
- **Переиспользуемо:** пригодится в будущих сессиях.
- **Конкретно:** содержит действие, пример, файл, команду, условие или проверяемый факт.
- **Верифицировано:** проверено в этой сессии или явно утверждено пользователем.

Пятый критерий обязателен: **правильный канал**. Даже сильное знание не должно попасть в memory, если ему место в `AGENTS.md`, документации, тесте или `references/` существующего скилла.

Шестой критерий обязателен: **`scope`** — `project` | `portfolio` | `both` | `skill` | `rule` | `session-only` (см. [references/portfolio-schema.md](references/portfolio-schema.md)). Перед записью **anti-dup**: один абзац не должен оказаться и в hot-cache проекта, и в портфеле; для `both` — ссылка в проекте, тело в `GLOBAL_MEMORY_ROOT/memory/wiki/project-<slug>.md`.

## Шаг 4: Классификация По Температуре

Для каждого вывода выбери класс:

- `session-only` — полезно для отчёта, но не сохранять.
- `HOT` — нужно в ближайших 1–3 сессиях → `memory/hot-cache.md`.
- `WARM` — ещё нужно агенту, но не в HOT → `memory/warm-cache.md` (буллеты, не статья).
- `COLD` — устойчивое передаваемое знание → **`WIKI_ROOT/`** (плоская вики).
- `durable-doc` — канон проекта: по умолчанию **вики**; `AGENTS.md` / `.cursor/rules/` для правил агента; `docs/` — только если явно в `AGENTS.md` или просьба пользователя (см. «docs/ и вики»).
- `regression` — баг, который лучше закрепить тестом.
- `skill-update` — короткое правило, триггер или gotcha в существующий `SKILL.md`.
- `skill-reference` — объёмная тема в `references/<topic>.md` существующего скилла плюс ссылка из `SKILL.md`.

Для каждого сохраняемого вывода укажи **`scope`** (обязательно). Температура HOT/WARM/COLD применяется **внутри** выбранного канала (проект или портфель).

## Шаг 5: Маршрутизация

Выбирай место по аудитории и сроку жизни:

- `AGENTS.md` — стек, архитектура, терминология, проектные best practices, API gotchas, safety rules.
- `.cursor/rules/*.md` — правила поведения агента в этом репозитории.
- `tests/` — regression-тесты на найденные баги.
- `scripts/` — только если сессия выявила повторяемую ручную процедуру и пользователь просит автоматизировать.
- `MEMORY.md` — **инструкция агенту** + карта памяти (см. bootstrap Preflight §3); **в git**.
- **`WIKI_ROOT/`** — **COLD**: передаваемые статьи (см. «Вики: плоская структура»); **в git**.
- `memory/hot-cache.md`, `memory/warm-cache.md` — HOT и WARM; `memory/open-loops.md`, `memory/decisions.md`, `memory/changelog.md` — задачи, решения, журнал сессии скилла.
- `docs/` — **не** канал по умолчанию; только явная просьба или канон в `AGENTS.md` (см. «docs/ и вики»).
- `.cursor/skills/` или `~/.cursor/skills/` — пользовательские и проектные скиллы.
- **`GLOBAL_MEMORY_ROOT`** (`D:/CURSOR/global-memory` по умолчанию) — при `scope: portfolio` или теле для `scope: both`:
  - реестр, `local_path`, `git_remote` → `memory/wiki/projects-registry.md` + `project-<slug>.md`;
  - серверы → `hosting-and-servers.md`; домены/сертификаты → `domains-and-certificates.md`; URL → `urls-and-environments.md`;
  - ошибки агента → `agent-mistakes-registry.md`; HOT/WARM портфеля — `memory/hot-cache.md`, `warm-cache.md`.

**Не** копировать `SKILL.md` или папку скилла в `GLOBAL_MEMORY_ROOT`. **Не** дублировать проектный hot-cache в портфель.

| Тема | Scope |
|------|--------|
| API, классы, миграции, баг одного сервиса | `project` |
| Сервер, домен, cert, URL, другой репо, git_remote | `portfolio` |
| Инвентарь проекта «снаружи» | `both` (ссылка в проекте + карточка в портфеле) |
| «Всегда делай Y» для всех репо | `portfolio` или User Rules / `agent-mistakes-registry.md` |

Не правь вручную `~/.cursor/skills-cursor/`. Если системный скилл оказался неточным, зафиксируй workaround в проектной документации, memory или пользовательском скилле.

## Каноническая структура проекта

**`WIKI_ROOT`:** корень проектной вики. Путь бери из `AGENTS.md` / `README.md`; если **нигде** явно не задан, используй **`memory/wiki/`** (вики **внутри** `memory/`, не отдельный корень репозитория).

**Журнал сессии скилла:** всегда **`memory/changelog.md`** (корень дерева `memory/`). **Не** создавай и **не** используй `WIKI_ROOT/changelog.md` для новых проектов; путь журнала **не** зависит от переопределения `WIKI_ROOT`.

**Обязательный каркас** (создание недостающего — в **Preflight §3**, только Agent mode):

| Путь | Назначение |
|------|------------|
| `MEMORY.md` | Индекс памяти: навигация и структура (ссылки), см. ниже |
| `memory/changelog.md` | Журнал: намеренные правки скилла; новые строки **в начало** месяца/файла; **единственный** путь журнала |
| `WIKI_ROOT/index.md` | Входная страница вики (при дефолте — `memory/wiki/index.md`) |
| `memory/hot-cache.md` | HOT: контекст ближайших сессий |
| `memory/warm-cache.md` | WARM: средняя память (demote из HOT) |
| `memory/open-loops.md` | Незакрытые задачи (не температура) |
| `memory/decisions.md` | Короткий лог решений; ADR → вики `adr-*.md` |

**`MEMORY.md`:** полная схема памяти и поток работы агента — **в репозитории** (шаблон Preflight §3). При bootstrap и при пустом файле создай/дополни по шаблону. В скилле не дублируй всю таблицу — только норматив и отсылка к `MEMORY.md`. После новых страниц во вики обновляй карту ссылок и `WIKI_ROOT/index.md`.

### Температуры: HOT, WARM, COLD

- **HOT → WARM:** переполнение `hot-cache` или пункт давно не использовался в HOT — перенести в `warm-cache`, в HOT при необходимости оставить одну строку со ссылкой.
- **WARM → COLD (вики):** процесс end-to-end, ADR, справка, расследование после стабилизации — плоская страница `WIKI_ROOT/<kebab>.md`.
- **HOT → COLD:** сразу, если тема большая — страница вики + одна строка в HOT.
- **Устаревшее во вики:** префикс `archived-*.md` или удаление (git хранит историю); отдельной папки `archive/` нет.

После любых новых или переименованных файлов в `memory/` или под `WIKI_ROOT/` обновляй **`MEMORY.md`**, если там есть индексные ссылки на эти пути.

### Вики: плоская структура и наполнение (COLD)

**Вики = слой COLD** — единственное место для передаваемых статей и справок (вместо бывших `memory/projects/`, `references/`, `archive/`).

**Структура:** все страницы — только **в корне** `WIKI_ROOT/` (обязательный **`index.md`**; журнал — **`memory/changelog.md`**, не во вики). Без вложенных каталогов для новых тем. Имена — **`kebab-case.md`**. Legacy-дерево под старым `WIKI_ROOT` не трогать без запроса пользователя.

**Что класть во вики (да):**

- Сквозные процессы end-to-end, ADR, глоссарий, стабильные справки и расследования после фиксации.
- Связные статьи, вынесенные из `MEMORY.md` / demote из WARM по лимитам.

**Чего во вики не класть (нет):**

- Нестабильные гипотезы без проверки — только отчёт сессии или одна строка в `open-loops`.
- Правила агента — `AGENTS.md` / `.cursor/rules/`; срочный контекст — HOT/WARM, не вики.

### docs/ и вики

- **`WIKI_ROOT/`** — канон знания для memo-session (runbook, процессы, ADR в репозитории проекта).
- **`docs/`** — **не создавать и не наполнять** этим скиллом по умолчанию (часто MkDocs/Docusaurus/API-доки фреймворка). Если `docs/` уже есть — **ссылка из вики**, без дубля.
- Запись в `docs/`: явная просьба пользователя или hard requirement в `AGENTS.md` («канон = docs/») → conflict gate.

**Обязательные действия агента при новой странице:** создать или дополнить файл в корне `WIKI_ROOT/` по шаблону ниже; добавить **ссылку** на него в **`WIKI_ROOT/index.md`** (оглавление или тематический список); при необходимости — одна строка-ссылка в **`MEMORY.md`**.

**Минимальный шаблон новой страницы:**

```markdown
# Заголовок темы

**Назначение:** одна строка, зачем эта страница.
**Аудитория:** разработчики / агент / оба.

## Содержание
…

## Ссылки
- …
```

### Записи по дате и времени

**Единственное место в этом скилле с полным описанием порядка.** Во всех остальных разделах — только отсылки сюда.

**Принцип:** где фиксируются события с **датой и/или временем**, порядок **от нового к старому** (reverse chronological). Новая запись — **в начало** соответствующего списка или блока; новый период (`## YYYY-MM`, `## YYYY-MM-DD`, строка таблицы с датой) — **выше** более старых.

**Журнальные файлы** (обязательно):

| Файл | Как писать новое |
|------|------------------|
| `memory/changelog.md` | Строка `YYYY-MM-DD \| …` — **первая** под `## YYYY-MM`; месяц без секции — новый `## YYYY-MM` сразу после вводного блока, **выше** старых месяцев |
| `memory/decisions.md` | Секция `## YYYY-MM-DD` (или `YYYY-MM`) — **выше** более старых дат; внутри секции порядок как в источнике сессии |
| `memory/open-loops.md` | **`## Активно`** (или `Active`) — **всегда** сразу после вводного блока, до архива закрытых; блоки «Закрыто в сессии …» / с датой в заголовке — **новее выше** |
| `memory/hot-cache.md` / `warm-cache.md` | Только при секциях `## YYYY-MM-DD`: новый день **выше**; буллеты внутри дня — новые **в начало** |
| `memory/wiki/agent-mistakes-registry.md` | Буллеты с `last_verified` — новые **в начало** списка |
| `GLOBAL_MEMORY_ROOT/memory/*` | Те же правила для портфеля |
| `~/.cursor/skills/memo-session-skill/references/changelog.md` | Как `memory/changelog.md` (эволюция скилла) |

**Таблица с колонкой даты** (например `memory/decisions.md` у проекта): новые строки данных — **сразу под** строкой-разделителем `|---|`, **выше** старых строк.

**Не сортировать** по дате без явного журнального заголовка: тематические `##` во вики (`Фаза N`, `Prod`, `SEO`), `open-loops` / `hot-cache` по фазам или подсистемам без даты в заголовке; справочные страницы `WIKI_ROOT/*.md`.

#### `memory/changelog.md` (детали)

- **Путь:** только **`memory/changelog.md`**. Не веди параллельный журнал под `WIKI_ROOT/` или в корневом `wiki/`.
- **Назначение:** краткая история **намеренных** правок скилла: `MEMORY.md`, `memory/**`, `WIKI_ROOT/**`, `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/`; `docs/` — только если скилл их реально менял. Не дублируй git diff.
- **Строка:** `YYYY-MM-DD | действие | затронутые пути | причина`. Без секретов, токенов, паролей, PII.
- **Когда вносить (Agent mode):** после правок скилла в сессии (bootstrap, hygiene, soft/hard conflict после выбора). Не добавляй «pending» при нерешённом hard conflict. Исключение: только создание пустого журнала при bootstrap — одна строка.
- **Минимум:** за сессию с правками скилла — **не меньше одной** осмысленной строки; иначе файл не трогай.
- **Мета:** не путать с **`references/changelog.md`** этого скилла — проектный/портфельный журнал **только** `memory/changelog.md`.

## Лимиты температур

Пороги **не блокируют** пайплайн сами по себе. При превышении добавь блок **`Memory hygiene`**: demote HOT→WARM, promote WARM→вики, сжать индекс.

| Слой | Место | Лимит | При превышении |
|------|-------|-------|----------------|
| Индекс | `MEMORY.md` | ≤200 строк | сжать; детали → вики |
| HOT | `memory/hot-cache.md` | ≤80 строк | demote → `warm-cache` или ссылка + вики |
| WARM | `memory/warm-cache.md` | ≤120 строк | promote → вики; сжать буллеты |
| Open loops | `memory/open-loops.md` | ≤120 строк | закрыть решённые; контекст → warm или вики |
| Decisions | `memory/decisions.md` | мягко ≤80 | ADR во вики `adr-*.md` |
| COLD | `WIKI_ROOT/*.md` | ~400/файл мягко | split на две плоские страницы |

### Лимиты портфеля (`GLOBAL_MEMORY_ROOT` только)

| Слой | Место | Лимит | При превышении |
|------|-------|-------|----------------|
| Индекс | `MEMORY.md` | ≤300 | сжать; детали → wiki |
| HOT | `memory/hot-cache.md` | ≤150 | demote → warm или wiki |
| WARM | `memory/warm-cache.md` | ≤250 | promote → wiki |
| Open loops | `memory/open-loops.md` | ≤200 | закрыть решённые |
| Decisions | `memory/decisions.md` | ≤150 | ADR → `adr-*.md` |
| COLD | `memory/wiki/*.md` | ~700/файл | split |

## Git: MEMORY.md и вики

**Политика по умолчанию для проектного воркспейса:**

1. Файл **`MEMORY.md`** в корне проекта, **всё дерево `memory/`** (включая **`memory/changelog.md`** и дефолтную вики **`memory/wiki/`**) и **`WIKI_ROOT/`** (если вынесен из `memory/` в legacy) должны находиться **внутри git-репозитория проекта** и предназначены для выкладки на **GitHub или функциональный аналог** (GitLab, Gitea, Forgejo, Bitbucket, Azure DevOps и т.п.).
2. **`WIKI_ROOT`** задаётся в `AGENTS.md` или `README.md`. Если не задан, дефолт — **`memory/wiki/`**. Не плоди несколько несвязанных «вики» без явного решения в документации.
3. **Не добавляй** `MEMORY.md`, корень **`memory/`** и корень **`WIKI_ROOT`** в `.gitignore` без явной просьбы пользователя. Preflight проверяет ignore отдельно; если пути **не** в ignore — **не меняй** `.gitignore`.
4. **Секреты** в эти пути не записывай; для чувствительного — вне репозитория или в принятом в проекте секрет-хранилище.
5. **Коммит и push** выполняй только по **явному запросу** пользователя; сам факт правки файлов в рабочем дереве не означает автоматический коммит.

Если воркспейс **не** git-репозиторий или знания осознанно остаются только локально — явно отметь это в handoff и не навязывай push.

## Decisions И Open Loops

Решения фиксируй с происхождением:

- `approved_by: user` — пользователь явно утвердил; можно считать каноном.
- `approved_by: inferred` или без поля — advisory; показывай как предположение, не как правило.

Новые секции в `memory/decisions.md` и закрытые блоки в `memory/open-loops.md` — **в начало** по правилам «Записи по дате и времени» (`## Активно` в open-loops не опускать вниз).

Open loops фиксируй как actionable items: владелец, следующий шаг, блокер, абсолютная дата, если дата известна.

## Автозапуск И Conflict Gate

Запуск этого скилла сам по себе является разрешением начать пайплайн: читать контекст, выполнять **preflight**, анализировать сессию, классифицировать выводы, сверять память и готовить обновления. Не спрашивай "начать?" и не требуй подтверждения на clean updates.

После preflight и маршрутизации, **перед записью** новых фактов из сессии выполни conflict gate:

1. **Проект:** `MEMORY.md`, `WIKI_ROOT`, `memory/`, `AGENTS.md`, `.cursor/rules/`, проектные скиллы.
2. **Портфель** (если `GLOBAL_MEMORY_ROOT` доступен): `GLOBAL_MEMORY_ROOT/MEMORY.md`, `memory/`, `memory/wiki/`, `AGENTS.md` портфеля.

Канон по типу: инвентарь/серверы/domains/URL/git_remote → **портфель**; поведение агента в этом репо → **проект** `AGENTS.md`; код/API → **проект**.

Классифицируй результат:

- `clean` — противоречий нет. В Agent mode применяй изменения автоматически; коммит/push всё равно только по явному запросу.
- `soft conflict` — есть дубль, устаревшая формулировка или очевидное уточнение. Можно обновить автоматически, если новая версия подтверждена текущей сессией; отметь в handoff как `Resolved automatically`.
- `hard conflict` — есть противоречие с `approved_by: user`, `AGENTS.md`, `.cursor/rules/`, safety rule, git-политикой, секретами или невозможно определить канон. Не записывай спорный фрагмент; покажи conflict report и попроси пользователя выбрать.

Приоритет источников для авторазрешения:

1. Явная текущая инструкция пользователя в этой сессии.
2. Решения с `approved_by: user` в `memory/decisions.md`, плоская страница `adr-*.md` под `WIKI_ROOT/` или другой канонический документ проекта.
3. `AGENTS.md` и `.cursor/rules/`.
4. `MEMORY.md` как индекс.
5. `memory/hot-cache.md`, затем `memory/warm-cache.md`.
6. Страницы `WIKI_ROOT/` (COLD), включая `archived-*.md`.
7. Вывод агента без подтверждения — только advisory.

Если текущая инструкция пользователя меняет прежнее утверждённое правило, не затирай старое молча: зафиксируй новое решение как supersedes и отрази это в handoff.

**Запись в журнал (только Agent mode, после фактических правок файлов):**

- **Проект:** `memory/changelog.md`, при необходимости `decisions` / `open-loops` / датированный `hot-cache` — по **«Записи по дате и времени»**.
- **Портфель:** `GLOBAL_MEMORY_ROOT/memory/changelog.md` (и те же журналы портфеля) — тот же порядок; в **причине** changelog обязательно `from:<project-slug>` (slug текущего workspace, не `global-memory`, если сессия велась в другом репо).

При **hard** conflict — запись в журнал **только после** выбора пользователя.

Формат hard conflict:

```markdown
## Требуется Решение По Конфликтам

| # | Тема | Уже в памяти | Новое из сессии | Почему конфликт | Варианты |
|---|------|--------------|-----------------|-----------------|----------|
```

## Анализ Скиллов

Если в сессии использовались скиллы:

1. Собери список глобальных `~/.cursor/skills/*/SKILL.md` и проектных `.cursor/skills/*/SKILL.md`
2. Для каждого нового факта спроси: "какой скилл тематически владеет этим знанием?"
3. Короткий gotcha или правило на 1-5 строк клади как `skill-update` в `SKILL.md`.
4. Объёмную тему на 10+ строк клади как `skill-reference` в `references/<topic>.md` и добавляй ссылку из `SKILL.md`.
5. Если скилл рассмотрен и правки не нужны, упомяни это в отчёте.

Новый скилл предлагай только если паттерн повторялся 2+ раза, состоит из 3+ шагов и имеет чёткий вход/выход.

## Мета: обновление этого скилла

После сессии, где активно использовался `memo-session-skill`, включи в план правок сам файл `~/.cursor/skills/memo-session-skill/SKILL.md`, если выполнилось хотя бы одно из условий:

- пользователь поправил workflow, порядок шагов или формат вывода;
- сработал ложный или слабый триггер: описание не отражает реальный use case;
- всплыла дыра: неочевидный кейс не попал ни в один канал из раздела «Маршрутизация»;
- повторяющийся конфликт с другим скиллом или с `AGENTS.md` / правилами.

Правила правок:

- **`description` в frontmatter:** только **добавляй** новые триггер-фразы или уточнения; существующий текст не переписывай целиком, чтобы не сломать подбор скилла.
- **Тело `SKILL.md`:** короткие уточнения — в существующие секции; если правка разрастается в историю или длинные примеры, вынеси в **`~/.cursor/skills/memo-session-skill/references/changelog.md`** (это журнал **эволюции этого скилла**, не путать с **`memory/changelog.md`** проекта) или другой `references/<тема>.md` и добавь **одну** ссылку из `SKILL.md` в подходящий раздел.
- Не раздувай скилл сверх необходимости: цель — точечные правки после реальных сессий.

## Формат Отчёта И Conflict Report

При clean/soft updates не блокируйся на предварительном согласовании. После применения покажи, что изменено:

```markdown
## Обновления По Итогам Сессии

### 1. Документация, память, тесты

| # | Файл | Тип | Статус | Изменение |
|---|------|-----|--------|-----------|

### 2. Скиллы

| # | Файл | Тип | Статус | Изменение |
|---|------|-----|--------|-----------|

### 3. Скиллы, рассмотренные без правок

- `skill-name` — рассмотрен, правки не нужны.

### 4. Memory hygiene

- Пороги: что превышено; demote HOT→WARM, promote WARM→вики.
- Preflight: gitignore (ok / needs user), bootstrap (что создано), битые ссылки в индексе.

### 5. Changelog

- Проект: **`memory/changelog.md`**
- Портфель: **`GLOBAL_MEMORY_ROOT/memory/changelog.md`** (или «пропущен»)
- Кратко: сколько строк, за какие события (формат — «Журнал изменений памяти»).

### 6. Портфельная память

| # | Файл | scope | Статус | Изменение |
|---|------|-------|--------|-----------|
| … | … | project/portfolio/both | … | … |

- `GLOBAL_MEMORY_ROOT`: путь, доступен / degraded
- AGENTS.md check: ok / patched / skipped (если workspace = global-memory)
```

Типы: `doc-update`, `portfolio-update`, `rule-update`, `memory-new`, `memory-update`, `regression`, `skill-update`, `skill-reference`, `skill-new-incident`, `status`.

Если есть hard conflicts, добавь отдельный блок `Требуется Решение По Конфликтам` и не применяй спорные изменения до выбора пользователя.

## Формат Анализа Без Записи

Если пользователь просит только анализ, используй:

```markdown
## Краткий Дайджест

## Ключевые Знания

## Открытые Петли

## Решения

## Что Стоит Сохранить

## Handoff На Следующую Сессию
```

## Handoff

В конце крупной сессии дай короткий handoff:

- `HOT`: что важно держать в голове прямо сейчас.
- `Open loops`: незакрытые задачи и блокеры.
- `Decisions`: утверждённые решения и advisory-решения отдельно.
- `Next actions`: 1-5 конкретных следующих шагов.
- `Suggested memory updates`: что сохранить и куда.
- `Memory hygiene`: итог preflight (gitignore, битые ссылки, bootstrap) и действия по лимитам температур.
- `Changelog`: проект и портфель — обновлены / пропущены (почему).
- `Portfolio HOT` / `Portfolio open loops` / `Portfolio hygiene` — если портфель доступен.

## Поиск по портфельной памяти

Без записи или по запросу пользователя:

1. Разреши `GLOBAL_MEMORY_ROOT` (§1.5).
2. Поиск: `rg -i "<запрос>"` по `GLOBAL_MEMORY_ROOT/MEMORY.md`, `GLOBAL_MEMORY_ROOT/memory`, `GLOBAL_MEMORY_ROOT/memory/wiki` (или `Select-String` на Windows, см. [references/global-memory.md](references/global-memory.md)).
3. Открой `memory/wiki/projects-registry.md` → `local_path`, `git_remote`, `project_memory`.
4. При необходимости прочитай `MEMORY.md` найденного проекта.
5. Ответ: файл, суть, `last_verified` / verified | advisory | unknown.

## Субагент portfolio-librarian

Опционально, см. [agents/portfolio-librarian.md](agents/portfolio-librarian.md). Вызывай при ≥3 portfolio-записях, dedupe, hygiene портфеля, явном поиске. **Не** копируй промпт в проекты или `GLOBAL_MEMORY_ROOT`. Запись выполняет родительский memo-session после отчёта субагента.

## Install (детали)

**Глобально:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**Только репозиторий:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -a cursor -y
```

Путь после install: `~/.cursor/skills/memo-session-skill/` или `~/.agents/skills/memo-session-skill/`.

## Ограничения

- Не записывай секреты, токены, приватные ключи, пароли и connection strings.
- Не делай коммиты и push без явного запроса; при этом `MEMORY.md`, дерево **`memory/`** и **`WIKI_ROOT/`** по умолчанию **должны быть отслеживаемыми в git** (не прятать в `.gitignore` без причины).
- Не используй относительные даты вроде "сегодня"; пиши абсолютные даты.
- Не дублируй знание между `AGENTS.md`, вики, memory и скиллами; `docs/` не дублируй без явного канона проекта.
- Не дублируй абзацы между проектным `memory/` и `GLOBAL_MEMORY_ROOT`; `scope: both` = ссылка + тело в портфеле.
- Не копируй `memo-session-skill` в `GLOBAL_MEMORY_ROOT` или в проектные репо — только ссылка в `agent-process.md` / `AGENTS.md`.
- Не перезаписывай существующие файлы целиком без необходимости.
- В Ask/Plan mode: только чтение, preflight-отчёт, conflict analysis и рекомендации **без** bootstrap и без записи в файлы проекта.
- В Agent mode: полный пайплайн включая bootstrap и запись; отдельное подтверждение пользователя нужно только при **hard conflicts** или при удалении строк из `.gitignore`.
