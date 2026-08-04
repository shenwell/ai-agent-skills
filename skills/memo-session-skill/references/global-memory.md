# Global Memory (портфель)

**Канонический путь:** `D:/CURSOR/global-memory`

Переменная: **`GLOBAL_MEMORY_ROOT`**

## Разрешение пути

1. Строка `GLOBAL_MEMORY_ROOT:` в `AGENTS.md` **текущего проекта** (override).
2. Иначе — этот файл: `D:/CURSOR/global-memory`.
3. Если каталог недоступен — **degraded mode**: только проектный пайплайн; в отчёте блок «Портфель пропущен».

## Назначение

Репозиторий **не заменяет** память проектов. Хранит:

- реестр проектов (`local_path`, `git_remote`);
- инфраструктуру, домены, сертификаты (без секретов), URL окружений;
- кросс-проектные open loops и ошибки агента.

**Не хранить здесь:** копию `memo-session-skill`, API/классы одного сервиса, полные hot-cache проектов.

## Чтение (из любого проекта)

1. `GLOBAL_MEMORY_ROOT/MEMORY.md`
2. `memory/hot-cache.md` при необходимости
3. `memory/wiki/projects-registry.md` для поиска репо
4. `memory/wiki/project-<slug>.md` для карточки проекта

## Запись (при `/memo-session-skill`)

- Только факты с `scope: portfolio` или тело для `scope: both`.
- Журналы с датой (`changelog`, `decisions`, `open-loops`, …): порядок **от нового к старому** — см. `SKILL.md` «Записи по дате и времени»; changelog — `from:<project-slug>` в причине.
- Подробности: [portfolio-schema.md](portfolio-schema.md).

## Поиск

```text
rg -i "<запрос>" "D:/CURSOR/global-memory/MEMORY.md" "D:/CURSOR/global-memory/memory"
```

На Windows без `rg`: `Select-String -Path "D:\CURSOR\global-memory\memory\**\*.md" -Pattern "<запрос>" -SimpleMatch`

Затем `projects-registry.md` → `local_path` / `git_remote` → при необходимости `MEMORY.md` проекта.

## Скилл

Канон процесса: `~/.cursor/skills/memo-session-skill/SKILL.md` (после `npx skills add shenwell/ai-agent-skills --skill memo-session-skill`). **Не** копировать в global-memory.
