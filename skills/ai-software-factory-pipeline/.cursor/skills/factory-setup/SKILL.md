---
name: factory-setup
description: >-
  First-time workspace and GitHub configuration for the software factory.
  Use when the user says /factory-setup, asks to set up the factory, configure
  GitHub, create a repo, fix clone layout, or prepare a fresh install
  before /factory runs.
---

# Factory setup

You configure a workspace so `/factory`, GitHub intake, and the station board work. This is orchestrator intake, not a pipeline station. Do not classify, plan, implement, or review product work.

Read `factory.config.json` before any git write. Honor `policy.pushDefaultBranch` (never push to the default branch except when creating a new empty repo's first push is explicitly requested and the branch is not main/master without user consent).

Load `.cursor/skills/writing-quality/SKILL.md` before the final summary for the user.

## When to run

- Fresh install in a new folder
- Factory files copied into an existing project
- `gh` errors during `/factory sync` or ensure-issue
- Nested `ai-software-factory-pipeline/` folder under another repo root

Re-running setup is safe. Refresh checks and update `factory/setup.json`.

## One workspace, one GitHub repo

Every local checkout is tied to **one** GitHub repository through `origin`. There is no `upstream` to the kit and no cross-repo kit workflow.

- **New project:** user installs the factory in a new folder, runs setup, confirms creation of a new private repo; `origin` points there.
- **Kit development:** user clones the kit repo on purpose; `origin` already points at the kit on GitHub; setup only configures label and checks. No second repo, no upstream.
- **Existing product:** factory dropped into a repo that already has `origin`; setup only configures label and checks.

## Existing repo vs create repo

| Path | When | What setup does |
| --- | --- | --- |
| `existing` | `origin` resolves to a GitHub repo the user will use (`gh repo view` succeeds) and the user did not ask to create a new one | Label, workflow check, board, `factory/setup.json` |
| `create` | No `origin`, `gh repo view` fails, or the user confirmed creating a new repo | Ask (unless already confirmed), create private repo, set `origin`, push, then label and the rest |

Kit template detection: `origin` URL matches `factory.config.json` → `setup.kitRepo` (default `shenwell/ai-agent-skills`). A fresh kit clone matches this. The kit repo **exists** on GitHub, but it is the template checkout, not necessarily the user's project repo.

### Ask before create

**Gate: `user`.** Stop and ask when a new GitHub repo may be needed and the user has not already said yes in this chat.

Propose:

- **Name:** sanitized workspace folder basename (see defaults below). If taken, list the first free candidate (`-2`, `-3`, …).
- **Visibility:** private unless the user said `public`.

Example question (Russian or user's language is fine):

> Создать приватный репозиторий `ia-software-factory` на GitHub и привязать его как `origin`?

When `origin` is the kit template, also offer the alternative in the same message:

> Или использовать текущий репозиторий `shenwell/ai-agent-skills` (папка `skills/ai-software-factory-pipeline`) без создания нового (для доработки кита).

Wait for yes/no. On **yes** → `create`. On **no** and origin is the kit → `existing` with the kit repo. On **no** and there is no usable repo → stop and ask which repo to use.

Skip the question only when:

- the user already confirmed in this chat (`да`, `yes`, `create`, or a repo name after you asked), or
- `origin` points to a non-kit repo and `gh repo view` succeeds (clear `existing` case).

Do not create a repo without confirmation.

## Step 1 — Workspace layout

The workspace root Cursor has open must contain:

- `.cursor/commands/factory.md`
- `factory.config.json`
- `AGENTS.md`
- `factory/brain.md`

If those files are missing at the root but exist under `ai-software-factory-pipeline/` (or another single child folder), set `nestedClone: true` in the report. Tell the user to either File → Open Folder on that child folder, or move kit contents up one level per README Install. Do not continue GitHub steps until layout is fixed or the user explicitly opened the nested folder as the workspace.

## Step 2 — Git

- Confirm `git rev-parse --is-inside-work-tree` succeeds.
- Record current branch and `git status -sb`.
- List remotes with `git remote -v`.

If not a git repository, stop and tell the user to `git init` or clone properly.

## Step 3 — GitHub CLI

```bash
gh auth status
```

If not logged in, stop with `gh auth login` instructions. Do not create repos or labels until auth works.

Record active account login from the status output.

## Step 4 — Resolve owner/repo

Parse `owner/repo` from `git remote get-url origin` when present.

```bash
gh repo view <owner/repo> --json nameWithOwner,url,isPrivate,defaultBranchRef
```

If view fails, treat the workspace as needing `create` (after user confirmation) unless the user names another repo.

Owner for new repos: authenticated `gh` user unless the user named an org in chat.

Apply **Existing repo vs create repo** before step 5.

## Step 5 — Create repository (`create` path only)

Run only after user confirmation.

### Defaults

| Setting | Default | Override |
| --- | --- | --- |
| Visibility | `private` (`setup.defaultRepoVisibility`) | user says `public` in chat |
| Repo name | basename of the workspace folder on disk | user passes a name after `/factory-setup` or in the confirmation |
| Name source | `git rev-parse --show-toplevel`, then folder basename (`setup.repoNameSource`: `workspaceFolder`) | not `factory.config.json` → `name` |

Sanitize the folder basename for GitHub: lowercase; spaces and invalid characters to `-`; collapse repeated `-`; trim leading/trailing `-`; cap at 100 characters. If the result is empty, fall back to `factory.config.json` → `name`, then `repo`.

### Unique name when taken

```bash
gh repo view <owner>/<candidate> --json nameWithOwner 2>/dev/null
```

If view succeeds, the name is taken. Try `<basename>`, `<basename>-2`, … up to `-20`. Use the first free name in the confirmation message.

### Create

```bash
git remote remove origin
gh repo create <chosen-name> --private --source=. --remote=origin --push
```

Use `--public` only when the user asked for `public`.

If push is refused by policy or the user said `no push`, create without `--push` and report `git push -u origin HEAD`.

After create, set `factory.config.json` → `name` to the chosen repo slug.

Never force-push. Never add an `upstream` remote to the kit.

## Step 6 — Factory label

Use the resolved `owner/repo` from `origin` (existing or newly created).

Label name: `factory.config.json` → `github.label` (default `factory`).

```bash
gh label list --repo <owner/repo> --json name --jq '.[].name'
```

Create when missing:

```bash
gh label create <label> --repo <owner/repo> --description "Software factory intake" --color "1D76DB"
```

If create fails because the label exists, treat as success.

## Step 7 — Workflow file

Confirm `.github/workflows/factory-intake.yml` exists in the workspace. If missing (partial copy), tell the user to copy it from the kit README "Drop the factory into another repo" block. Setup does not invent workflows in the orchestrator thread; if the user asks to add it, delegate a normal `/factory` chore instead.

## Step 8 — Python (UI jobs)

Designer needs Python 3 on PATH. Try in order until one succeeds:

```bash
python --version
python3 --version
py -3 --version
```

Record which command works. UI jobs will fail at designer without it; non-UI runs are fine.

## Step 9 — Config touch-up

After `create`, `factory.config.json` → `name` is already set in step 5.

Do not change `policy.*` without user request.

## Step 10 — Board bootstrap

Rebuild the station board even when the queue is empty:

1. Ensure `factory/queue/.gitkeep` exists
2. Write `factory/ui/data.js` using the same shape as github-intake (empty `jobs`, `repo`, `label`, `generatedAt`)

Open `factory/ui/index.html` only if the user asked.

## Step 11 — Write setup record

Write `factory/setup.json` (gitignored, local state):

```json
{
  "completedAt": "<ISO-8601>",
  "path": "existing|create",
  "workspaceOk": true,
  "nestedClone": false,
  "gitOk": true,
  "ghAuthenticated": true,
  "ghAccount": "login",
  "github": {
    "owner": "string",
    "repo": "string",
    "nameWithOwner": "owner/repo",
    "url": "string",
    "remote": "origin"
  },
  "label": "factory",
  "labelReady": true,
  "workflowPresent": true,
  "python": {
    "available": true,
    "command": "python3"
  },
  "warnings": []
}
```

## Step 12 — Report to the user

Short checklist in plain language:

- Workspace root OK or nested-clone fix
- `gh` account
- `owner/repo` and `origin` URL
- Whether a repo was created or an existing one was used
- Label ready
- Python for UI (if applicable)
- Next steps: `/factory <task>`, `/factory sync`, `/factory-board`, or `/factory-upgrade` when a newer kit is available

If setup stopped on a confirmation gate, say exactly what you need to continue.

## Failure handling

- `gh` permission errors: suggest checking repo access or SSO authorization for the org
- Label create forbidden: user may need admin on the repo; continue other steps and warn
- Do not block on optional checks; record failures in `warnings` and `factory/setup.json`
