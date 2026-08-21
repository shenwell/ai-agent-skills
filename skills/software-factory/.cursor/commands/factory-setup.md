# /factory-setup

Read `factory.config.json`, then `.cursor/skills/factory-setup/SKILL.md`. Read `factory/brain.md` if it exists.

First-time workspace and GitHub configuration. You are the orchestrator only: run checks and `gh`/`git` steps yourself. Do not start a pipeline. Do not implement product code.

One local checkout, one GitHub repo on `origin`. No `upstream` to the kit.

If a new GitHub repo may be needed, **ask the user** to confirm a private repo with the proposed name (workspace folder basename; `-2`, `-3`, … if taken) before `gh repo create`. If `origin` already points at a working non-kit repo, or the user chose to keep the current repo (including the kit repo for kit work), configure label and checks only.

Honor chat overrides: custom repo name, `public`, `no push`, or an explicit yes/no to the create question.

When setup finishes or stops on a gate, summarize what passed, what failed, and the next command (`/factory sync`, `/factory <task>`, or `gh auth login`).
