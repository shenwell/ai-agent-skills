---
name: factory-upgrade
description: >-
  Upgrade the software factory kit in a consumer workspace from the upstream kit
  repo. Use when the user says /factory-upgrade, asks to update the factory,
  pull the latest pipeline, or refresh kit skills and commands.
---

# Factory upgrade

You refresh factory kit files in the open workspace from the upstream kit repository. This is orchestrator maintenance, not a pipeline station. Do not classify, plan, implement product features, or review product code.

Read `factory.config.json` before any git write. Honor `policy.*`. Never push to `main`, `master`, or the default branch.

Load `.cursor/skills/writing-quality/SKILL.md` before the final summary.

Upstream source:

- `factory.config.json` → `setup.kitRepo` (default `shenwell/ai-agent-skills`)
- `factory.config.json` → `setup.kitPath` (default `skills/software-factory`; missing key: copy from repo root)
- `factory.config.json` → `setup.kitRef` (default `main`; missing key: `main`)

## When to run

- Consumer repo with an older factory drop
- After a new kit release on GitHub
- User asks to update skills, commands, or pipeline rules without reinstalling the whole project

Re-running is safe. Idempotent copies overwrite kit-managed paths only.

## Kit repo vs consumer repo

Detect kit repo: `git remote get-url origin` resolves to a repo whose `owner/name` equals `setup.kitRepo` (normalize `.git`, `https`, `git@`).

| Workspace | Action |
| --- | --- |
| **Kit repo** | Do not shallow-clone over yourself. Tell the user to `git fetch origin` and `git pull origin <default branch>` (or merge the kit PR they need). Stop unless they explicitly want to copy from another remote/ref. |
| **Consumer repo** | Shallow-clone upstream kit, copy/merge files below, then report. |

## Step 1 — Fetch upstream kit (consumer only)

```bash
git clone --depth 1 --branch <kitRef> https://github.com/<kitRepo>.git <temp-dir>
```

Use a temp directory outside the workspace (OS temp). On Windows, `$env:TEMP\factory-kit-upgrade` is fine. If clone fails, report the error and stop.

Record the kit commit SHA from `<temp-dir>/.git` (`git -C <temp-dir> rev-parse HEAD`).

Set `<kit-root>` to `<temp-dir>/<kitPath>` when `setup.kitPath` is set, otherwise `<temp-dir>`.

## Step 2 — Copy kit-managed paths (overwrite)

From `<kit-root>` into the workspace root. Overwrite matching files.

| Source | Notes |
| --- | --- |
| `.cursor/` | Entire tree: commands, rules, skills |
| `.github/workflows/factory-intake.yml` | Create `.github/workflows/` if missing |
| `factory/ui/` | `index.html`, `data.empty.js` only; do not copy `data.js` (generated) |
| `evals/` | Optional contracts; copy if present in kit |
| `factory/reports/.gitkeep` | Ensure `factory/reports/` exists |
| `factory/runs/.gitkeep`, `factory/artifacts/.gitkeep`, `factory/queue/.gitkeep` | Create only if missing |

## Step 3 — Never overwrite (preserve local state)

Do not copy from kit into these paths if they already exist with content:

- `factory/brain.md`
- `factory/preferences.md`
- `factory/setup.json`
- `factory/upgrade.json`
- `factory/queue/*.json`
- `factory/runs/*` (except `.gitkeep`)
- `factory/reports/*.md`
- `factory/artifacts/*` (except `.gitkeep`)
- `design-system/MASTER.md` and other product design files
- Product application source outside `factory/` and `.cursor/`

## Step 4 — Merge `factory.config.json`

Do not blind overwrite. Read workspace copy and kit copy.

**Keep from workspace (local policy and project identity):**

- `name`
- `policy.*`
- `github.label`, `github.commentProgress`, `github.ensureIssue`, `github.decomposeIssue`
- `setup` except add missing keys from kit (`kitRepo`, `kitPath`, `kitRef`, `defaultRepoVisibility`, `repoNameSource`)
- `branchPrefix`, `revisionCycles`, `stations`, `optionalStations`, `intake` if the user customized them

**Add or refresh from kit when missing locally:**

- New top-level keys (example: `chat.autoStart`)
- New `setup` keys the kit introduced

If both files define the same key and values differ on a **new** kit key, prefer kit default and mention it in the report. If they differ on `policy.*` or `github.*`, keep workspace values.

Write the merged JSON back to the workspace.

## Step 5 — Merge `AGENTS.md`

If workspace `AGENTS.md` is identical to kit or only exists from a prior kit drop, you may replace with kit version.

If the user merged product-specific guidance into `AGENTS.md`, merge manually:

1. Read both files.
2. Ensure factory sections from kit are present: How to start a run, Multi-phase runs, Analyst decomposition, Policy table, Factory files, UI, kit maintenance pointers.
3. Keep non-factory sections the user added.

When unsure, keep both: append missing kit sections under a `## Software factory` heading rather than deleting user prose.

## Step 6 — Git (consumer)

Show `git status` and a short diff stat. Do not commit product-only files touched by mistake.

When `policy.commit` is `agent`:

- Create branch `factory/upgrade-kit-<YYYYMMDD>` from the current HEAD (or use existing factory branch if the user named one).
- Commit only kit paths: `.cursor/`, `AGENTS.md`, `factory.config.json`, `factory/ui/`, `evals/`, `.github/workflows/factory-intake.yml`, `.gitignore` kit lines if updated.

When `policy.commit` is `user`, stop after applying files and show the diff; ask before commit.

When `policy.pushBranch` and `policy.openPullRequest` are `agent`, push the branch and open a PR titled like `Upgrade software factory kit`. Body: upstream repo, ref, SHA, preserved paths, merge notes for config/agents.

Never merge the upgrade PR unless `policy.merge` is `agent` and the user asked on this run.

## Step 7 — Write upgrade record

Write `factory/upgrade.json` (gitignored):

```json
{
  "completedAt": "<ISO-8601>",
  "kitRepo": "owner/repo",
  "kitRef": "main",
  "kitSha": "<full sha>",
  "path": "consumer|kit-pull",
  "filesCopied": [".cursor/", "factory/ui/", "..."],
  "merged": ["factory.config.json", "AGENTS.md"],
  "preserved": ["factory/brain.md", "factory/queue/", "..."],
  "warnings": []
}
```

## Step 8 — Report to the user

Short checklist:

- Upstream `owner/repo@ref` and SHA
- What was copied vs merged vs preserved
- Branch and PR URL if created
- Suggested next step: `/factory-setup` (refresh label/workflow checks), then a smoke `/factory` or plain-chat task if `chat.autoStart` is on

If `nestedClone` layout is detected (factory files only under a child folder), stop and point to README Install before upgrading.

## Failure handling

- Clone failed: network, auth, or unknown ref; report and stop
- Dirty workspace with conflicts on kit paths: list conflicted files; do not delete user edits; ask how to proceed
- Record non-fatal issues in `warnings` and `factory/upgrade.json`
