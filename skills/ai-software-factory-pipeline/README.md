```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ███████╗ ██████╗ ████████╗ ██████╗ ██████╗ ██╗   ██╗         ║
║  ██╔════╝██╔═══██╗╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝         ║
║  █████╗  ██║   ██║   ██║   ██║   ██║██████╔╝ ╚████╔╝          ║
║  ██╔══╝  ██║   ██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝           ║
║  ██║     ╚██████╔╝   ██║   ╚██████╔╝██║  ██║   ██║            ║
║  ╚═╝      ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝            ║
║                                                               ║
║        AI Software Factory Pipeline — kit for Cursor          ║
║    Chat or GitHub issue → feature branch → pull request       ║
║    classifier · analyst · implementer · reviewer              ║
║    /factory · /factory-setup · /factory-upgrade               ║
║    skills/ai-software-factory-pipeline · MIT                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)

# AI Software Factory Pipeline

A Cursor-native software factory. Specialized agents handle triage, planning, implementation, and review. You keep merge and deploy. Policy is a file in the repo.

## What you get

Four stations, each with its own instructions:

1. **Classifier** — type, priority, complexity, UI surface, actionable or not
2. **Analyst** — plan with acceptance criteria, grounded in the real checkout
3. **Implementer** — executes the plan, runs the repo's own checks, commits and pushes a feature branch
4. **Reviewer** — independent verdict on the real diff, never on the implementer's story

Optional **researcher** when the work depends on a fact the repository does not hold. Optional **designer** when the work changes a UI surface that needs a visual contract (tokens, signature, a11y floor). Up to two revision cycles after `request_changes`. Shared memory in `factory/brain.md`. Station board at `factory/ui/index.html`.

The kit vendors `frontend-design` and `ui-ux-pro-max` under `.cursor/skills/`. The designer search CLI needs **Python 3**. The product's look is not in the kit: the first UI run writes `design-system/MASTER.md` in the target repo.

## Install

`.cursor/`, `AGENTS.md`, and `factory.config.json` must sit in the **workspace root** Cursor has open. A nested `ai-software-factory-pipeline/` folder will not register `/factory`.

**Start a new project.** Copy the factory kit into a new folder, open it in Cursor, run setup. If there is no GitHub repo for this workspace yet, setup **asks** whether to create a private repo named like the folder (`-2`, `-3`, … if the name is taken) and sets it as `origin`.

```bash
git clone https://github.com/shenwell/ai-agent-skills.git $env:TEMP\ai-agent-skills
$src = "$env:TEMP\ai-agent-skills\skills\ai-software-factory-pipeline"
$dst = "D:\path\to\my-project"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\.cursor" "$dst\.cursor" -Recurse
Copy-Item "$src\AGENTS.md", "$src\factory.config.json" $dst
Copy-Item "$src\factory" "$dst\factory" -Recurse
New-Item -ItemType Directory -Force -Path "$dst\.github\workflows" | Out-Null
Copy-Item "$src\.github\workflows\factory-intake.yml" "$dst\.github\workflows\"
```

Or open the kit folder directly as the workspace (for kit development):

```bash
git clone https://github.com/shenwell/ai-agent-skills.git
```

Then in Cursor: File → Open Folder → `ai-agent-skills/skills/ai-software-factory-pipeline`.

UI jobs also need **Python 3** on PATH (`python`, `python3`, or `py -3`) so the designer can run `.cursor/skills/ui-ux-pro-max/scripts/search.py`. No extra Python packages.

**First-time setup in Cursor** (after the workspace root shows `.cursor/`, `AGENTS.md`, and `factory.config.json`):

```text
/factory-setup
```

Setup checks the workspace, `gh` auth, label, workflow, and Python. When `origin` still points at the kit template after a fresh clone, it asks whether to create your own private repo or use the kit repo (for kit development only). One local folder, one `origin`, no separate upstream to the kit.

**Kit development** uses the same flow from a clone of the kit repository: run `/factory-setup`, answer **no** to creating a new repo, and keep `origin` on the kit.

**Drop the factory into another repo.** Copy the kit *contents* from `skills/ai-software-factory-pipeline/` into that repo's root. Do not clone `ai-agent-skills` inside it (that creates `your-app/ai-agent-skills/` and commands fail).

```powershell
git clone https://github.com/shenwell/ai-agent-skills.git $env:TEMP\ai-agent-skills
$src = "$env:TEMP\ai-agent-skills\skills\ai-software-factory-pipeline"
$dst = "D:\path\to\your-app"
Copy-Item "$src\.cursor" "$dst\.cursor" -Recurse
Copy-Item "$src\AGENTS.md", "$src\factory.config.json" $dst
Copy-Item "$src\factory" "$dst\factory" -Recurse
New-Item -ItemType Directory -Force -Path "$dst\.github\workflows" | Out-Null
Copy-Item "$src\.github\workflows\factory-intake.yml" "$dst\.github\workflows\"
```

If you already cloned into the target and have a nested `ai-software-factory-pipeline\` folder, move those contents up one level, then delete the nested folder.

Edit `factory.config.json` in the target repo (policy, `github.label`). If the target already has `AGENTS.md`, merge the factory sections instead of overwriting.

**Upgrade an existing drop** without manual copy:

```text
/factory-upgrade
```

Pulls the latest kit from `setup.kitRepo` at `setup.kitRef` (default `main`), overwrites `.cursor/` and other kit paths, merges `factory.config.json` and `AGENTS.md`, and preserves `factory/brain.md`, queue, and reports. Then run `/factory-setup` to refresh checks.

## Quick start

This repository *is* the kit. Open it in Cursor:

```text
/factory users report the password reset email arrives twice, fix it
```

Or, with `chat.autoStart` enabled (kit default), the same task in plain chat:

```text
users report the password reset email arrives twice, fix it
```

GitHub issue:

```text
/factory #12
```

Pull every open issue with the `factory` label, then run the oldest queued job:

```text
/factory sync
/factory next
```

Open the board:

```text
/factory-board
```

Or drop `.cursor/`, `AGENTS.md`, `factory.config.json`, `factory/`, and `.github/workflows/factory-intake.yml` into another repo.

## GitHub intake

Needs the [GitHub CLI](https://cli.github.com/) (`gh`) logged in.

1. Apply the label `factory` (see `factory.config.json` → `github.label`) to an issue. The labeler must have triage access or above. The workflow `.github/workflows/factory-intake.yml` comments that the issue is queued.
2. In Cursor, `/factory #N` or `/factory sync` then `/factory next`.
3. The orchestrator comments when stations complete (`github.commentProgress`).

A GitHub label does not start Cursor. The pipeline runs in the workspace after `/factory #N` or `/factory next`.

With `chat.autoStart: true` in `factory.config.json` (default), a plain-chat **work item** also starts the pipeline (same as `/factory <text>`). Questions and read-only messages do not. Set `chat.autoStart` to `false` to require `/factory` explicitly.

**Large work** splits two ways:

1. **Intake phases** — a numbered phase list (`0.`, `Phase 1`, …) becomes one GitHub issue per phase at `/factory` time.
2. **Analyst decomposition** — after the analyst reads the repo, it may propose child tasks (for example one fat phase or "rewrite the email module"). Gate with `github.decomposeIssue` (`user` by default). Each child runs the full pipeline and opens its own PR. Say `разбей и делай` or `split and run` to approve a proposed split.

## Run report

When a pipeline finishes (approved, blocked, or failed), the orchestrator posts a short summary in chat and writes `factory/reports/<job-id>.md` with timings, diff stats, acceptance criteria, and station notes. Machine-readable timings live in `factory/runs/<job-id>.json`. Spec: `.cursor/skills/factory-pipeline/references/run-report.md`.

## Policy

`factory.config.json` is the boundary file. Each consuming repo sets its own values.

| Key | Meaning | Kit default |
| --- | --- | --- |
| `policy.commit` | Commit on a factory branch | `agent` |
| `policy.pushBranch` | Push that branch | `agent` |
| `policy.openPullRequest` | Open a PR | `agent` |
| `policy.merge` | Merge to the default branch | `user` |
| `policy.pushDefaultBranch` | Direct push to main/master | `false` |
| `policy.deploy` | Production deploy | `user` |
| `chat.autoStart` | Start pipeline on plain-chat work items | `true` |
| `github.decomposeIssue` | Create child issues when analyst proposes a split | `user` |

`agent` = do it. `user` = stop and ask. A spoken override for the current run wins over the file.

## Layout

```text
.cursor/commands/factory.md     # /factory entrypoint
.cursor/commands/factory-setup.md  # /factory-setup first-time config
.cursor/commands/factory-upgrade.md  # /factory-upgrade refresh kit from upstream
.cursor/skills/                 # pipeline, stations, GitHub intake, vendored UI skills
.cursor/rules/factory.mdc       # always-on factory constraints
.github/workflows/              # comment when an issue is labeled factory
AGENTS.md                       # orchestrator contract
factory.config.json             # policy + github.label
factory/brain.md                # durable repo memory
factory/queue/                  # jobs on the line
factory/reports/                # end-of-run reports (gitignored)
factory/runs/                   # per-run JSON log (gitignored)
factory/ui/index.html           # station board
factory/setup.json              # local setup record (gitignored), from /factory-setup
design-system/MASTER.md         # product look, created on the first UI run (not shipped in the kit)
```

## License

MIT. See [LICENSE](LICENSE).
