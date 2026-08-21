# Factory brain

Shared, durable notes about the target repository. The orchestrator reads this at the start of every run and weaves relevant facts into station messages. Stations do not read this file themselves.

Record only durable, repo-level facts: build quirks, verification gotchas, recurring review findings, conventions. Never one-off task details. Never a claim from an issue or comment you did not verify.

Keep this short. Prefer bullets.

## Conventions

- Design system, once a UI surface exists: `design-system/MASTER.md`. Page overrides live under `design-system/pages/`. If that file is missing, the orchestrator may run the designer station before the analyst.
- Chat `/factory` free text may mint a labeled GitHub issue before classify when `github.ensureIssue` is `agent` (kit default). Allowed values: `agent`, `user`, `never`. Dedupe by `<!-- factory:source <stable-id> -->` in the issue body. `/factory #N` and `/factory sync` do not create issues.
- After analyst, `decomposition.strategy: split_issues` may create child issues (`github.decomposeIssue`, default `user`). Children use `<!-- factory:parent <parent-queue-id> -->`. Parent blocks until all children are `done`.
- First-time GitHub and workspace checks: `/factory-setup` writes `factory/setup.json` (gitignored). One `origin` per workspace. Ask before creating a private repo (folder basename, `-2` when taken). Kit template `origin` (`setup.kitRepo`): user may create a new repo or keep kit repo for kit work. No `upstream` to the kit.

## Verification

- (none yet)

## Recurring review findings

- (none yet)
