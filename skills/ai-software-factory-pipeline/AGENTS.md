# AGENTS.md

Guidance for AI coding agents working in this repository, and for the factory when it runs inside Cursor.

## What this repo is

A Cursor-native software factory. You take a work item from chat or a GitHub issue and move it through four stations: **classifier** → **analyst** → **implementer** → **reviewer**. Optional **researcher** runs before the analyst when the work turns on a fact the repo does not hold. Optional **designer** runs before the analyst when the work changes a UI surface that needs a visual contract.

The workspace is the sandbox. Policy lives in `factory.config.json`. Shared memory lives in `factory/brain.md`. Station procedures live in `.cursor/skills/`. The entrypoint is the `/factory` command. First-time GitHub and workspace checks use `/factory-setup`. The station board is `factory/ui/index.html`.

Vendored UI skills live in `.cursor/skills/frontend-design/` and `.cursor/skills/ui-ux-pro-max/`. The designer CLI needs Python 3. Product look lives in `design-system/MASTER.md` after the first UI run, not in the kit.

## How to start a run

When the user invokes `/factory`, sends a plain-chat work item while `chat.autoStart` is enabled, or asks you to run the factory on a bug, feature, or task: read `factory.config.json` and `.cursor/commands/factory.md`, then follow that command exactly. Load `.cursor/skills/factory-pipeline/SKILL.md` if you need the full protocol in context. GitHub intake uses `.cursor/skills/github-intake/SKILL.md`. Chat free text may mint a labeled issue first (see `github.ensureIssue`); after that the job is GitHub-sourced.

**Chat auto-start** (`factory.config.json` → `chat.autoStart`, default `true`): messages like "исправь баг с email" or "add retry to the webhook" start the same pipeline as `/factory <text>`. Questions, review-only, and read-only messages do not. Set `chat.autoStart` to `false` to require `/factory` or an explicit factory request. GitHub labels and Actions comments still do not start Cursor; someone runs `/factory #N` or `/factory next` for queued issues.

When the user invokes `/factory-setup`, or asks to configure GitHub or fix a fresh clone: read `.cursor/commands/factory-setup.md` and `.cursor/skills/factory-setup/SKILL.md`. Do not run the pipeline.

When the user invokes `/factory-upgrade`, or asks to update or refresh the factory kit in this repo: read `.cursor/commands/factory-upgrade.md` and `.cursor/skills/factory-upgrade/SKILL.md`. Do not run the pipeline.

Do not skip stations. Do not implement in the orchestrator thread. Do not let the implementer review its own work.

## Multi-phase runs

Numbered phase lists become one GitHub issue (or chat job) per phase. The user may ask to run all phases in one session (`continue through all`). That chains phases in order; it does not shorten the pipeline.

Per phase, always: classifier → analyst → implementer → reviewer → feature branch → pull request. Later phases get the same stations as phase 0. One phase, one PR. The orchestrator must not merge to the default branch when `policy.merge` is `user` (kit default). See `.cursor/skills/factory-pipeline/SKILL.md` → **Multi-phase runs**.

## Analyst decomposition

After analyst, a job may **split into child tasks** when the checkout shows several independently mergeable deliverables (for example one roadmap phase that is really ten PRs, or "rewrite the email module" spanning separate transports).

- Only the **analyst** proposes `decomposition.strategy: split_issues`. The implementer escalates scope gaps; it does not invent children.
- `github.decomposeIssue` controls whether children are created without asking (`agent`), after confirmation (`user`, kit default), or not at all (`never`).
- Each child runs the full pipeline and opens its own PR. The parent blocks until all children are `done`.
- See `.cursor/skills/factory-pipeline/SKILL.md` → **Decomposition** and `references/decomposition.md`.

## Policy

Read `factory.config.json` before any git write.

| Action | Config key | Default in this kit |
| --- | --- | --- |
| Commit on a factory branch | `policy.commit` | agent |
| Push that branch | `policy.pushBranch` | agent |
| Open a pull request | `policy.openPullRequest` | agent |
| Merge | `policy.merge` | user |
| Push to `main` / `master` / the default branch | `policy.pushDefaultBranch` | always false |
| Deploy | `policy.deploy` | user |
| Plain-chat work item starts pipeline | `chat.autoStart` | true |

`agent` means do it without waiting. `user` means stop and ask. If the user says "stop before push" (or names another gate) for this run, that overrides the file.

Never push to the default branch. Branch names use `branchPrefix` (default `factory/`) plus a short slug.

`github.ensureIssue` is not a `policy.*` key. Allowed values: `agent` (create a labeled GitHub issue for chat free text when none exists), `user` (propose titles and bodies, then wait), `never` (keep the chat-only queue path). Kit default: `agent`. Missing key: treat as `agent`. Unrecognized value: do not create, tell the user, continue as chat. `/factory #N` and `/factory sync` never create issues.

`github.decomposeIssue` is not a `policy.*` key. Allowed values: `agent` (create child issues from analyst split without asking), `user` (propose children, then wait; kit default), `never` (ignore split; one PR on the parent). Missing key: treat as `user`. Analyst-driven split is separate from intake phase lists. See factory-pipeline `references/decomposition.md`.

`chat.autoStart` is not a `policy.*` key. When `true` (kit default), plain-chat work items start the pipeline like `/factory <text>`. When `false`, require `/factory` or an explicit factory request. Missing key: treat as `true`. `factory/preferences.md` may disable auto-start for the workspace.

## Factory files

- `factory.config.json` — intake, GitHub (`label`, `commentProgress`, `ensureIssue`, `decomposeIssue`), stations, revision cap, git policy
- `factory/brain.md` — durable repo notes; orchestrator reads, trusted updates only
- `factory/artifacts/` — long handoff documents passed by id, not inlined
- `factory/queue/` — jobs on the line (`issue-N.json`, `chat-*.json`)
- `factory/runs/` — per-run logs (gitignored)
- `factory/reports/` — end-of-run markdown reports (gitignored)
- `factory/ui/` — station board (`index.html` + generated `data.js`)
- `factory/preferences.md` — optional standing user notes (gitignored)
- `factory/setup.json` — local first-time setup record (gitignored); written by `/factory-setup`
- `factory/upgrade.json` — last kit upgrade record (gitignored); written by `/factory-upgrade`

## Writing

Load `.cursor/skills/writing-quality/SKILL.md` before drafting PR descriptions, review reports, or other prose meant for humans. No em dashes. No machine-made filler.

## UI

When `ui_surface` is not `none`, stations load the vendored skills above. Designer writes `factory/artifacts/design-<slug>.md`. Implementer persists `design-system/MASTER.md` on the first UI commit. Reviewer uses `.cursor/skills/reviewer/references/ui-gate.md`.

## Before finishing a change to this kit

- Station skills still match the pipeline in `.cursor/commands/factory.md`
- `factory.config.json` keys used in AGENTS.md still exist
