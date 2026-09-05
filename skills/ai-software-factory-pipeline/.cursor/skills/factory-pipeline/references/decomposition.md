# Decomposition (analyst-driven task split)

When a work item is larger than one PR should carry, the **analyst** may return `decomposition.strategy: split_issues`. The orchestrator creates child jobs (GitHub issues when possible), blocks the parent, and runs the full pipeline on each child.

This is **not** intake phase splitting (numbered phases at `/factory` time). That stays in github-intake **Split work items**. Decomposition happens **after analyst**, grounded in the real checkout.

## Config

`factory.config.json` → `github.decomposeIssue`:

| Value | Behavior |
| --- | --- |
| `agent` | Create child issues/jobs and start the first runnable child without asking |
| `user` | Propose the split, wait for confirmation (kit default) |
| `never` | Ignore `split_issues`; continue to implementer with the analyst plan as one job |

Missing key: treat as `user`. Unrecognized value: treat as `never`, tell the user.

`decomposeIssue` is not a `policy.*` key.

### User overrides for one run

These phrases (and close variants) count as approval to create and run children with `decomposeIssue=user`:

- `разбей и делай`, `разбей и выполни`
- `split and run`, `decompose and continue`
- `continue through all` on the same message as the work item also chains **sibling** children after the parent splits

If the user says `never split` or `one PR only` for this run, force `single_pr` even when the analyst proposed a split.

## Analyst output

The analyst adds a `decomposition` object to its JSON (see analyst skill). Strategies:

- **`single_pr`**: one implementer run on this job (default). `proposed_tasks` is empty.
- **`split_issues`**: orchestrator must not call implementer on the parent. Create children instead.

Use `split_issues` when **two or more** deliverables are independently mergeable (separate PRs, separate acceptance criteria). Use `single_pr` when steps are tightly coupled (schema migration + code + tests in one atomic change).

If `proposed_tasks` has more than **15** items, the orchestrator must ask the user to confirm or regroup before creating issues, even when `decomposeIssue` is `agent`.

## Orchestrator flow (after analyst)

1. If `decomposition.strategy` is `single_pr`, or `github.decomposeIssue` is `never`, continue to implementer as today.
2. If `split_issues`:
   - When `decomposeIssue` is `user` and the user has not approved this batch, post one message: parent job id, reason, table of proposed children (title, stable-id, depends_on), and ask to confirm or say `разбей и делай`. Set parent `station: blocked`, `blockedReason: awaiting decomposition approval`. Stop.
   - On approval or `decomposeIssue=agent`, follow github-intake **Decompose from analyst**.
3. Parent job: `station: blocked`, `blockedReason: decomposed into <child ids>`, `childIds` filled, `decomposedAt` set. Comment on the parent GitHub issue when `commentProgress` is true.
4. Enqueue every child as `queued` with `parentId`, `dependsOn`, `kind: task`.
5. Start the **first runnable** child: oldest `queued` child whose every `dependsOn` job is `done`. If the user asked to continue through all, chain runnable children in dependency order after each child finishes (full pipeline + PR each).
6. When **all** `childIds` are `done`, set parent `station: done` without implementer/reviewer on the parent. Comment the parent issue with links to child PRs. Write a short run report note on the parent if this session closed it.

Do not implement child work in the orchestrator thread. Do not land multiple children on one branch or PR.

## Parent reopen (integration pass)

If merged children leave integration work on the parent (wiring, feature flag flip, docs), the analyst should have included that as the **last child** with `depends_on` pointing at the others. Do not reopen the parent for implementer unless the user explicitly asks `/factory #N` to run a follow-up on a closed parent.

## `/factory next` with dependencies

Oldest runnable `queued` job on the board:

1. GitHub jobs by issue `number` ascending, then chat jobs by `updatedAt` ascending (unchanged).
2. Skip jobs whose `dependsOn` lists any job not in `done`.
3. Among the rest, pick the oldest by the same sort.

## Implementer escalation

If the implementer discovers scope beyond the plan (extra modules, unrelated systems), it must **not** create issues. Return `known_limitations` explaining the gap. The orchestrator sends a **fresh analyst** on the same job with that context. Only the analyst may propose `split_issues`.

## Markers (GitHub child issues)

Child issue bodies include:

```text
<task body>

Parent: #<parent-number> (or chat job id)

<!-- factory:source <stable-id> -->
<!-- factory:parent <parent-queue-id> -->
```

Example parent queue id: `issue-12`, `chat-email-refactor`.

Dedupe children by `factory:source` stable-id like ensure-issue.

## Queue fields

See github-intake **Queue file shape**. New fields:

| Field | Meaning |
| --- | --- |
| `kind` | `task` (default), `phase` (intake sibling), `epic` (container only) |
| `parentId` | queue id of parent, or null |
| `childIds` | queue ids of children after decompose |
| `dependsOn` | queue ids that must be `done` before this job runs |
| `decomposedAt` | ISO timestamp when parent was split |
| `decomposedInto` | copy of child queue ids at split time |

Existing queue files without these fields: treat as `kind: task`, empty arrays, null parent.
