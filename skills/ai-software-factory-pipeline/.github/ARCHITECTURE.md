# ARCHITECTURE.md

A map of this Cursor-native software factory. Keep it current as the kit evolves.

## Project identification

- **Name:** Software Factory
- **Runtime:** Cursor (skills, rules, commands, workspace checkout)
- **License:** MIT
- **Last updated:** 2026-08-16

## Overview

The root agent in Cursor is the orchestrator. It takes a work item from chat or from a GitHub issue (`gh`), reads `factory.config.json` and `factory/brain.md`, and moves the item through four stations. Optional researcher and designer stations run before the analyst when the work needs an external fact or a visual contract. Each station is a skill with its own instructions and a structured output contract. Stations run in a fresh subagent (or a fresh Task) and inherit none of the orchestrator's transcript. The reviewer sees the plan, the branch, and the diff, not the implementer's chain of thought.

The finished product of a successful run is a feature branch (and a pull request when `policy.openPullRequest` is `agent`). Merge and deploy default to the user. Direct push to the default branch is refused.

## Project structure

```text
.cursor/
  commands/factory.md           # /factory: orchestrator procedure
  commands/factory-setup.md     # /factory-setup: first-time GitHub and workspace checks
  commands/factory-upgrade.md   # /factory-upgrade: refresh kit from upstream
  commands/factory-board.md     # rebuild and open the station board
  rules/factory.mdc             # always-on constraints
  skills/
    factory-pipeline/           # full pipeline protocol
    factory-setup/                # first-time workspace + GitHub setup
    factory-upgrade/              # refresh kit files from upstream
    github-intake/              # gh pull, ensure-issue from chat, queue files, board data, issue comments
    classifier/                 # triage
    analyst/                    # plan + acceptance criteria
    implementer/                # code, verify, commit, push branch
    reviewer/                   # independent verdict
    researcher/                 # optional web research
    designer/                   # optional visual contract
    frontend-design/            # vendored UI design skill
    ui-ux-pro-max/              # vendored UI/UX search skill
    writing-quality/            # prose guardrails
    triaging-issues/            # GitHub grounding
.github/workflows/factory-intake.yml  # comment when label factory is applied
factory.config.json             # policy, intake, github.label, github.ensureIssue, github.decomposeIssue
factory/brain.md                # git-tracked factory brain
factory/queue/                  # jobs on the line (json gitignored)
factory/artifacts/              # handoff markdown, gitignored
factory/runs/                   # per-run logs, gitignored
factory/reports/                # end-of-run markdown reports, gitignored
factory/ui/index.html           # station board
factory/setup.json              # local setup record (gitignored)
AGENTS.md                       # agent-facing contract
evals/README.md                 # safety and routing contracts (manual)
```

## Data flow

0. **Setup (recommended on first clone):** user runs `/factory-setup`. One `origin` per workspace. Ask before creating a private GitHub repo (folder basename; `-2`, `-3`, … if taken). Fresh kit clone: user confirms create or keeps kit `origin` for kit development. No `upstream` remote. Writes `factory/setup.json`.
1. **Chat:** user starts `/factory` with a task, or (when `chat.autoStart` is true) sends a plain-chat work item. If `github.ensureIssue` is `agent` (kit default) or `user` after confirmation, the orchestrator creates a labeled issue when none exists (marker `<!-- factory:source <stable-id> -->`), writes `factory/queue/issue-<n>.json`, and the job is GitHub-sourced from then on. Numbered phase lists become one issue per phase; this turn runs only the first unless the user asked to continue through all. In that case each phase still runs classifier through reviewer with its own branch and PR. If create fails, or `ensureIssue` is `never`, write `factory/queue/chat-<slug>.json` and continue.
2. **GitHub pull:** user runs `/factory #N` or `/factory sync`. Orchestrator uses `gh` to read issues with `github.label`. Sync writes queue files; `#N` fetches one issue and triages before classify. Neither path creates issues.
3. **GitHub label (Actions):** a trusted labeler applies `factory`. The workflow comments how to start Cursor. It does not run the pipeline.
4. Classifier returns structured triage. If `needs_clarification` on a GitHub job, comment questions on the issue and stop (`blocked`).
5. Optional researcher, only when the repo cannot answer a needed fact.
6. Optional designer, when `ui_surface` is not `none` and either `design-system/MASTER.md` is missing or the surface is a new page or product. Writes `factory/artifacts/design-<slug>.md`. Does not write production UI.
7. Analyst plans against the live workspace. Long notes go to `factory/artifacts/` as an id. UI jobs include a `design_contract` and UX acceptance criteria. When the checkout shows several mergeable deliverables, analyst may return `decomposition.strategy: split_issues`; orchestrator creates child issues (gate: `github.decomposeIssue`), blocks the parent, and runs the full pipeline per child.
8. Implementer executes on a `factory/<type>-<slug>` branch, runs the repo's checks, commits, pushes if policy allows. On a first UI run it persists `design-system/MASTER.md`.
9. Reviewer checks out the branch, reads `git diff`, scores acceptance criteria. On UI jobs it also applies `.cursor/skills/reviewer/references/ui-gate.md`. `request_changes` loops to the implementer, cap from `revisionCycles` (default 2).
10. On approve: open a PR if policy allows, comment the PR link on the issue, update the brain with durable facts. Write `factory/reports/<job-id>.md` and a short chat summary (timings, diff stats, acceptance score). After every station: update the queue file and rewrite `factory/ui/data.js`. When a parent job's children are all `done`, close the parent without an implementer pass on the parent.

## Trust and policy

The Cursor user is the caller for pipeline runs. GitHub issue text is untrusted input.

- Default branch is never a push target.
- Merge and deploy are `user` in the kit default.
- Factory brain writes are orchestrator-only, after a verified fact, never from untrusted task text copied blindly.
- Artifact ids are `[a-z0-9-]+` and resolve only under `factory/artifacts/`.
- The reviewer must not receive the implementer's reasoning transcript.
- The intake workflow ignores `factory` labels from anyone below triage permission. Reporters cannot enqueue their own issue by putting the label in a template.

## Board

`factory/ui/index.html` is a local station line. It reads `factory/ui/data.js` (generated, gitignored) with a fallback empty board. Optional `researcher` and `designer` jobs sit in the Analyst column, with the station name on the ticket.
