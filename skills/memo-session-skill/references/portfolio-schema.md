# Схема портфельной памяти

Путь: **`GLOBAL_MEMORY_ROOT`** = `D:/CURSOR/global-memory` (см. [global-memory.md](global-memory.md)).

## Scope (обязательно для каждого вывода)

| Scope | Куда писать |
|-------|-------------|
| `project` | Только текущий репозиторий (`memory/`, вики проекта) |
| `portfolio` | Только `GLOBAL_MEMORY_ROOT` |
| `both` | Тело в global; в проекте **одна строка-ссылка** на `memory/wiki/project-<slug>.md` или реестр |
| `skill` | `~/.cursor/skills/` или `.cursor/skills/` |
| `rule` | `AGENTS.md` / `.cursor/rules/` |
| `session-only` | Только отчёт, без записи |

### Anti-dup

- **Запрещено:** один и тот же абзац в `hot-cache` проекта и global.
- **Разрешено `both`:** ссылка в проекте + полный текст в `project-<slug>.md` или тематической wiki global.

## Критерии `scope: portfolio`

Минимум 2 из: неочевидно, переиспользуемо, конкретно, верифицировано — **и** тема:

- другой репозиторий, сервер, домен, сертификат, URL, интеграция;
- повторяемая ошибка агента во всех репо;
- явная просьба «зафиксировать глобально».

## `projects-registry.md`

Колонки:

| slug | name | git_remote | local_path | project_memory | last_verified | status |

- **git_remote** — канон между машинами (полный URL).
- **local_path** — путь на этом ПК.
- **status:** `active` | `archived` | `advisory`.

Детали — в `memory/wiki/project-<slug>.md`, не дублировать длинные таблицы в реестре.

## Обязательные wiki-страницы (bootstrap)

- `projects-registry.md`
- `hosting-and-servers.md`
- `domains-and-certificates.md`
- `urls-and-environments.md`
- `agent-mistakes-registry.md`
- `agent-process.md`
- `project-<slug>.md` — по мере появления проектов

## Conflict gate (портфель)

| Тип знания | Канон |
|------------|--------|
| Серверы, домены, пути репо, URL каталог | Портфель |
| Поведение агента в этом репо | `AGENTS.md` проекта |
| Код, API, миграции | Проект |

Приоритет источников — как в `SKILL.md`, плюс портфельные `decisions.md` и wiki между проектным `MEMORY.md` и hot-cache проекта.

## Метаданные записи (рекомендуется)

В портфельных буллетах и карточках: `source`, `project` (slug), `last_verified` (YYYY-MM-DD), `status`: verified | advisory | unknown.

## Лимиты (только портфель)

| Слой | Лимит |
|------|-------|
| MEMORY.md | ≤300 |
| hot-cache | ≤150 |
| warm-cache | ≤250 |
| open-loops | ≤200 |
| decisions | ≤150 |
| wiki/*.md | ~700, затем split |

Проектные лимиты не менять.

## Changelog и датированные записи портфеля

Пути: `GLOBAL_MEMORY_ROOT/memory/changelog.md`, `decisions.md`, `open-loops.md`, датированные секции в `hot-cache.md`, `agent-mistakes-registry.md`.

**Порядок:** как в `SKILL.md` → **«Записи по дате и времени»** (от нового к старому; `## Активно` в open-loops — закреплён сверху).

Changelog: формат строки как у проекта; в **причине** — `from:<slug>` текущего workspace.

## Субагент

Тяжёлый search/dedupe/hygiene: [../agents/portfolio-librarian.md](../agents/portfolio-librarian.md) — только из каталога скилла, не копировать в проекты и не в global-memory.
