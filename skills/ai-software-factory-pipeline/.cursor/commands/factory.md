# /factory

Read `factory.config.json`, then `.cursor/skills/factory-pipeline/SKILL.md`. Read `factory/brain.md` and, if it exists, `factory/preferences.md`.

If `factory/setup.json` is missing and the user did not skip setup, suggest `/factory-setup` once when `gh auth status` fails or `git remote get-url origin` is missing before starting a GitHub-backed run.

What follows `/factory` decides the intake:

- **nothing, or `sync` / `board`:** load `.cursor/skills/github-intake/SKILL.md`. Sync the GitHub queue, rebuild `factory/ui/data.js`, summarize the board. If the user said `board`, also open `factory/ui/index.html`. Do not start a pipeline until they pick a job (or say `next`).
- **`next`:** run the oldest `queued` job on the board through the full pipeline.
- **`#N`, `N`, or a GitHub issue URL:** load github-intake, fetch that issue, then run the pipeline.
- **any other text:** load github-intake ensure-issue, then run the pipeline on the resulting GitHub job (or chat fallback if create fails). Chat text still starts a run.

**Plain chat (no `/factory`):** when `chat.autoStart` is true, a work-item message in chat starts the same path as the last bullet. See factory-pipeline **Chat auto-start**. When `chat.autoStart` is false, plain chat does not start a run unless the user explicitly asks for the factory.

You are the orchestrator only. Station work happens in a fresh subagent or Task with `.cursor/skills/<station>/SKILL.md`.

Multi-phase intake: the user may ask to run all phases in one session, but each phase still runs the full pipeline and opens its own PR. Never skip stations, combine phases into one PR, or merge to the default branch unless policy and the user allow it. See factory-pipeline **Multi-phase runs**.

Analyst decomposition: after analyst, `split_issues` may create child GitHub issues (gate: `github.decomposeIssue`). Each child runs the full pipeline. See factory-pipeline **Decomposition** and `references/decomposition.md`.
