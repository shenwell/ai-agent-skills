# Run report

End-of-run reporting for the orchestrator. Inspired by CI/CD practice: a short, scannable chat summary plus a durable report file (GitLab job duration charts, GitHub Actions step summaries, DORA lead-time style wall-clock).

## When to write

At the end of every pipeline run, including:

- `approved` (reviewer approve, PR opened or delivery gate met)
- `blocked` (clarification, revision cap, policy stop)
- `failed` (station error after retry)

Also write a partial report when the run stops early. Set `outcome` accordingly.

## Files

| File | Purpose |
| --- | --- |
| `factory/runs/<job-id>.json` | Machine-readable run log (timings, station outputs, metrics, `reportPath`) |
| `factory/reports/<job-id>.md` | Human-readable report (markdown, gitignored) |

`<job-id>` matches the queue file (`issue-12`, `chat-my-slug`). One report per pipeline run per job.

## Run JSON extensions

Keep existing `stations` outputs. Add or update top-level fields:

```json
{
  "id": "issue-12",
  "runId": "issue-12",
  "startedAt": "2026-08-16T12:00:00Z",
  "completedAt": "2026-08-16T12:41:00Z",
  "outcome": "approved",
  "issue": { "number": 12, "url": "https://github.com/owner/repo/issues/12" },
  "branch": "factory/bug-reset-email",
  "base": "main",
  "prUrl": "https://github.com/owner/repo/pull/45",
  "revisionRounds": 0,
  "reportPath": "factory/reports/issue-12.md",
  "timings": {
    "totalMs": 2460000,
    "stations": {
      "classifier": { "startedAt": "...", "completedAt": "...", "durationMs": 180000 },
      "analyst": { "startedAt": "...", "completedAt": "...", "durationMs": 480000 },
      "implementer": { "startedAt": "...", "completedAt": "...", "durationMs": 1320000 },
      "reviewer": { "startedAt": "...", "completedAt": "...", "durationMs": 480000 }
    }
  },
  "metrics": {
    "stationsRun": ["classifier", "analyst", "implementer", "reviewer"],
    "optionalStationsRun": [],
    "revisionRounds": 0,
    "filesChanged": 7,
    "insertions": 120,
    "deletions": 15,
    "acceptanceCriteriaTotal": 8,
    "acceptanceCriteriaPassed": 8,
    "verdict": "approve"
  },
  "stations": { }
}
```

`outcome` values: `approved` | `blocked` | `failed`.

Record `startedAt` when the pipeline begins (before classifier). Record each station's `startedAt` when delegation starts and `completedAt` when structured output returns. `durationMs` is `completedAt - startedAt`.

For diff stats after implementer pushes, run `git diff --shortstat <base>...<branch>` (or `--numstat` if you need per-file detail in the report). If the branch does not exist yet, omit diff stats or set null.

`acceptanceCriteriaTotal` / `acceptanceCriteriaPassed` come from the analyst plan and reviewer scoring when available.

## Markdown report (`factory/reports/<job-id>.md`)

Load `.cursor/skills/writing-quality/SKILL.md`. Plain prose, no em dashes.

Suggested sections:

1. **Summary** — one paragraph: what was requested, outcome, total wall time.
2. **Outcome** — verdict, PR link, branch, issue link.
3. **Timeline** — table: station | started | duration | notes (revision round, optional stations).
4. **Delivery** — change summary, deviations, verification commands and results.
5. **Diff** — shortstat line; optional per-file table from `git diff --numstat` (top 20 files).
6. **Acceptance criteria** — checklist with pass/fail from reviewer.
7. **Artifacts** — ids under `factory/artifacts/` used this run.
8. **Policy gates** — commit, push, PR opened, merge/deploy stopped per policy.

For `blocked` or `failed`, replace Delivery/Diff with **Stop reason** and what completed before the stop.

## Chat summary (short)

Post after the markdown report is written. Keep it under ~12 lines. Load writing-quality. Format:

```text
Factory run complete — <job-id> · <outcome> · <total duration human-readable>

<Task one-liner from classifier summary>
Issue: #N <url>   Branch: <branch>   PR: <url or "not opened">
Stations: <name> <dur> · <name> <dur> · …   Revisions: <n>
Diff: +<ins> −<del> in <files> files   Acceptance: <passed>/<total>
Report: factory/reports/<job-id>.md
```

Duration format: use `Xm` or `Xh Ym` for totals; omit sub-minute noise or use `<1m` when under 60 seconds.

Multi-phase chained runs: post one chat summary **per phase** when that phase finishes. Optionally add a one-line batch footer after the last phase (`Batch: 6 phases · 3h 12m total · 6 PRs`).

## GitHub

When `github.commentProgress` is true and outcome is `approved`, the issue's closing signal is still the PR link. Do not duplicate the full report on the issue. A single progress comment may point to the PR; the markdown report stays local unless the user asks to paste it.

## Board

After writing the report, rebuild `factory/ui/data.js`. Queue job may set `reportPath` alongside `prUrl` when `station` is `done` or `blocked`.
