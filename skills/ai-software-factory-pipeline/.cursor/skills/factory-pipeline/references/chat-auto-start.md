# Chat auto-start

When `factory.config.json` → `chat.autoStart` is `true` (kit default; missing key: treat as `true`), the root agent treats certain plain-chat messages like `/factory <text>` without the user typing `/factory`.

`chat.autoStart: false` restores the old behavior: pipeline runs only on `/factory`, `/factory #N`, `/factory next`, or an explicit "run the factory on …" request.

## When to auto-start

Start the factory pipeline (read `.cursor/commands/factory.md`, load factory-pipeline, orchestrate only) when **all** of the following hold:

1. `chat.autoStart` is not `false`.
2. The message is not a slash command (`/factory`, `/factory-setup`, `/factory-board`, or another tool command).
3. The message is a **work item**: the user wants something built, fixed, changed, added, removed, or refactored in the repo.
4. The message is not in the **skip list** below.

Tell the user in one short line that you are starting the factory, then run the same path as `/factory <their message>` (ensure-issue, classifier, and the rest).

## Skip list (do not auto-start)

Answer normally in the orchestrator thread or as a normal agent; do not open the pipeline.

- **Questions** without implementation intent: "how does X work?", "what is Y?", "why …?", "объясни", "как устроен", "что такое", trailing `?` with no imperative.
- **Read-only exploration**: "show me", "find where", "grep for", "покажи", "найди где".
- **Review or opinion only**: "review this PR", "what do you think", "оцени код", no ask to change the repo.
- **Direct micro-edits** the user wants typed now: "change line 5 to …", "add a comma here".
- **Explicit opt-out**: "don't use factory", "without pipeline", "just answer", "не через factory", "без пайплайна".
- **Factory meta** unless they are changing the kit itself as a task: "what does /factory do?", "update factory.config" as a question.
- **GitHub queue ops** that already have a command: sync, board, next (use `/factory sync` etc.).
- **Mid-pipeline steering** in an active factory run: user is refining the current job, not starting a new one.

When intent is ambiguous (could be a question or a task), ask one short clarifying question instead of auto-starting.

## Work-item signals (auto-start)

Imperative or outcome phrasing in any language, for example:

- fix, add, implement, create, remove, refactor, update, bug, feature, broken, doesn't work
- исправь, почини, добавь, сделай, реализуй, убери, обнови, баг, фича, не работает

Examples that **should** auto-start:

- "исправь баг с email"
- "users get two password reset emails, fix it"
- "add dark mode to settings"

Examples that **should not**:

- "почему письмо уходит дважды?"
- "how does the email service work?"
- "review the auth module"

## Relation to `/factory`

`/factory` always starts the pipeline regardless of `chat.autoStart`. Auto-start is a convenience for the same free-text intake path; it does not change stations, policy, or ensure-issue behavior.

If `factory/preferences.md` says to disable auto-start for this workspace, honor it over `chat.autoStart`.
