# Portfolio Librarian (субагент)

Вызывай через Task **только** при тяжёлых задачах портфеля. Канон скилла: `memo-session-skill`. **Не** копируй этот файл в проекты или `D:/CURSOR/global-memory`.

## Когда вызывать

- Пользователь просит поиск по общей памяти / «где лежит проект X».
- ≥3 записей `scope: portfolio` за одну сессию memo-session.
- Hygiene портфеля: лимиты, битые ссылки, дедуп в `projects-registry.md`.
- Явный запрос «разобрать портфель».

## Вход

- `GLOBAL_MEMORY_ROOT` = `D:/CURSOR/global-memory` (или override из `AGENTS.md` проекта).
- `project-slug` текущего workspace (из имени папки или `projects-registry`).
- Запрос пользователя или список кандидатов из memo-session.

## Задачи

1. **Search:** `rg` по `GLOBAL_MEMORY_ROOT/MEMORY.md`, `memory/`, `memory/wiki/`.
2. **Registry:** сверить `projects-registry.md` — дубли slug, пустые `git_remote`, устаревший `last_verified`.
3. **Dedupe:** найти одинаковые абзацы в hot/warm и wiki; предложить merge в одну страницу.
4. **Links:** битые markdown-ссылки в `MEMORY.md`, `wiki/index.md`.
5. **Output:** краткий markdown-отчёт: найденное, предлагаемые правки, конфликты. **Не** писать секреты.

## Запись

Субагент **не** коммитит. Возвращает список правок родительскому memo-session; запись — по канону `SKILL.md` (clean/soft, dual changelog).

## Приоритет канона

Инвентарь/серверы/URL → портфель. Код/API → проект. Поведение агента в репо → `AGENTS.md` проекта.
