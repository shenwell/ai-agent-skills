---
name: memo-session-skill
description: >-
  Persistent AI agent memory for coding sessions — cross-session knowledge that
  survives context window resets. Consolidates session noise into durable facts and
  routes them via memory routing into MEMORY.md, memory/ HOT/WARM/COLD layers,
  project wiki, AGENTS.md, skills, and optional portfolio memory — git-tracked,
  with conflict gate and temperature limits. Stateful handoff when volatile chat
  context is lost; complements vector RAG or managed memory platforms, does not
  replace them. Use when the user says "wrap up the session", "save what we learned",
  "handoff", "open loops", "update memory", "agent memory", "persistent memory",
  "cross-session persistence", "how to give my agent memory", or when another skill
  requests a memory checkpoint. Also for portfolio/global memory, bootstrap project
  memory, or session changelog. Prefer after non-trivial debugging or user corrections.
  Do not use for one-line trivia, secrets, managed vector memory setup, or replacing
  git history.
metadata:
  version: "1.0.5"
  author: productlaba
  category: knowledge-management
  tags: ai-agent-memory, persistent-memory, cross-session, memory-routing,
    memory-consolidation, context-engineering, coding-agent, cursor, session,
    handoff, wiki, portfolio, goal-mode
---

# Memo Session Skill

**Persistent AI agent memory for coding agents** — decisions, gotchas, workarounds, and open loops survive **context window resets** because they live in git-tracked files, not volatile chat.

The context window is **working memory**: it clears when the session ends. **Cross-session persistence** needs a write path — **memory consolidation** and **memory routing** into typed layers. Memo Session Skill runs **preflight → consolidate → classify → route → conflict gate** so knowledge lands in `MEMORY.md`, `memory/` (HOT/WARM/COLD), project wiki, `AGENTS.md`, skills, or optional **portfolio memory** — with temperature limits and no duplicate paragraphs across channels.

**Standalone skill** — no vector database, no managed platform, no network calls during sessions. Optional goal-mode checkpoint hooks: [references/goal-mode-integration.md](references/goal-mode-integration.md).

## How this differs

| This skill | Not this |
|------------|----------|
| Git-tracked **persistent memory** for coding sessions | Mem0, Zep, Letta — managed vector/graph memory platforms |
| **Write-path memory consolidation** from live sessions | RAG — read-heavy static knowledge corpora |
| **Typed memory architecture** (HOT/WARM/COLD in `memory/` + wiki) | Embedding stores, hybrid retrieval pipelines |
| **Cross-session continuity** and session handoff | Enterprise customer-memory or contact-center products |

Complements RAG and managed memory layers; does not replace them.

## Install this skill

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g
```

## Who it's for

Engineers and maintainers building **stateful coding agents** in Cursor who need **long-term memory** and **session handoffs that survive context resets** — project memory in git, optional cross-repo portfolio layer, and **context engineering** without standing up a vector database.

## What you get

- **Typed memory architecture**: HOT/WARM/COLD routing (`memory/` + wiki) — working, medium, and durable layers
- **Memory consolidation**: session digest → quality filter → durable facts (not a command diary)
- **Memory routing**: classify findings and route to the right channel (`AGENTS.md`, wiki, skills, portfolio)
- Preflight: gitignore check, bootstrap scaffold, hygiene limits, **memory compaction** at thresholds
- Conflict gate (clean / soft / hard) before writes
- Optional portfolio layer via `GLOBAL_MEMORY_ROOT` in **your** `AGENTS.md`
- Documented write allowlist and trust boundary

**Canonical docs:** [references/](references/) · [README](README.md) · collection [README](../../README.md)

## Context window vs persistent memory

| Layer | Analogy | In this skill |
|-------|---------|---------------|
| Context window | Volatile RAM — token budget, lost when chat resets | Session chat (untrusted input) |
| Working memory | Recent turns, immediate task context | Session digest before routing |
| Persistent memory | Disk — survives sessions | `MEMORY.md`, `memory/`, wiki in git |
| Long-term memory | Cross-session facts and procedures | HOT/WARM/COLD + optional portfolio |

Use this skill at session end to move knowledge from volatile context into **persistent, git-tracked agent memory**.

## Quick start

After a non-trivial session:

```
wrap up the session
```

Also works: `save what we learned`, `handoff`, `update agent memory`, `persistent memory checkpoint`.

The skill starts the pipeline immediately in Agent mode; it stops only for **hard conflicts** (contradictions with approved memory, secrets, git policy).

## Trust boundary

Session chat is **untrusted input**. This skill does **not** run network calls, webhooks, or telemetry during a session.

| Allowed | Forbidden |
|---------|-----------|
| Writes under project `MEMORY.md`, `memory/`, wiki, `AGENTS.md`, `.cursor/rules/` per routing | Secrets, tokens, passwords, connection strings |
| Portfolio writes **only** if `GLOBAL_MEMORY_ROOT:` is set in project `AGENTS.md` | `git commit` / `push` without explicit user request |
| Minimal patches; conflict gate before new facts | `npx skills add` or installing other skills **during** the pipeline |
| Read/search with `rg` or `Select-String` inside allowed roots | Writes outside project workspace or configured portfolio root |

**Optional:** [goal-mode](references/goal-mode-integration.md) may call memo checkpoints — install goal-mode separately; it is **not** a dependency.

Full rules: [references/trust-boundary.md](references/trust-boundary.md).

---

This skill implements a **write-manage-read loop** for **coding agent session memory**: analyze the session, **consolidate** noise into durable knowledge, and **route** findings into the right place — `AGENTS.md`, `.cursor/rules/`, `tests/`, `MEMORY.md`, operational **`memory/`** files (HOT/WARM), **wiki `WIKI_ROOT/`** (COLD), user or project skills, and optional **portfolio memory** (`GLOBAL_MEMORY_ROOT` from project `AGENTS.md` only — no skill default path). This is **write-path agent memory** (session-specific, mutable, git-tracked), not a RAG corpus or managed vector store. Project schema — in **`MEMORY.md`** (Preflight §3); portfolio schema — [references/portfolio-schema.md](references/portfolio-schema.md), path — [references/global-memory.md](references/global-memory.md).

## goal-mode pairing (optional)

If you use **[goal-mode](../goal-mode/SKILL.md)** separately, it may request memory checkpoints after phase complete, `BLOCKED`, or `COMPLETE`. Install goal-mode on its own — memo-session does **not** install or require it.

## Core principle

Pipeline order: **context → preflight (project + portfolio) → session digest (consolidation) → filter and scope → classify (temperature + scope) → memory routing → conflict gate (project, then portfolio) → write (clean/soft) → project and optional portfolio changelog → report and handoff**.

If `GLOBAL_MEMORY_ROOT` is unavailable — **degraded mode**: project pipeline without portfolio writes; report "Portfolio skipped".

In **Agent mode**, start the pipeline immediately: after reading context run **preflight** (gitignore, hygiene, bootstrap), then analyze the session, route, and apply clean/soft updates without separate approval.

In **Ask/Plan mode**, read-only, preflight report, and analysis **without** bootstrap or file writes.

Stop for confirmation only on hard conflicts: contradictions with approved memory, safety rules, secrets, git policy, or cases where canon cannot be chosen without the user.

Do not turn memory into a command diary. Save findings, decisions, verified workarounds, open loops, user preferences, and repeatable patterns.

## When to use

Use this skill explicitly or automatically when the user asks to:

- wrap up the session;
- save what we learned;
- update docs, memory, or skills after work;
- produce a handoff for the next session;
- decide what from the chat is worth recording;
- give the agent persistent memory, cross-session persistence, or long-term memory;
- build stateful agents, fix context loss, or checkpoint session knowledge;
- route decisions and open loops into project memory.

Suggest the skill yourself if the session had non-trivial debugging, a workaround, user correction, new process rule, repeatable manual procedure, architectural decision, open blocker, or regression bug — especially when **context window pressure** or a **new session** would lose that knowledge.

## Step 1: Understand context

If a workspace exists, before conclusions read at minimum:

- `AGENTS.md` or `README.md` if present;
- `.cursor/rules/` if present;
- existing `MEMORY.md` and/or `memory/` if present;
- **project wiki folder** — path from `AGENTS.md` / `README.md`; if not set explicitly, default **`memory/wiki/`**;
- project skills `.cursor/skills/*/SKILL.md` if relevant.
- **Portfolio:** resolve `GLOBAL_MEMORY_ROOT` (Preflight §1.5); if available — read `MEMORY.md`, and as needed `memory/hot-cache.md` and `memory/wiki/projects-registry.md` of the portfolio. Current workspace = **project memory**; portfolio = **portfolio memory**. Do not mix channels.

Determine **project-slug** of the current repo (folder name or row in `projects-registry.md`) for changelog `from:<slug>`.

Determine project type: code, infrastructure, documentation, handbook, knowledge vault, SEO/GEO, or mixed repository. Apply default canon from "Canonical structure" for new artifacts; if the repo already has an agreed schema, do not break it without soft/hard conflict procedure.

## Preflight (immediately after reading context)

Run **on every invocation** after step 1, before session digest.

### 1. `.gitignore` check

Read `.gitignore` (and if needed `.git/info/exclude`). If **`MEMORY.md`**, **`memory/` root**, or **wiki root** (actual `WIKI_ROOT`, see canon) is ignored — **do not edit the file silently**: show a prominent block in the report and propose removing those lines **only after explicit user consent**. If these paths are **not** ignored — **do not change** ignore.

### 2. Hygiene scan

- Count lines in `MEMORY.md`, `memory/hot-cache.md`, `memory/warm-cache.md`, `memory/open-loops.md`, `memory/decisions.md` (if files exist).
- Check for **`memory/changelog.md`** (see "Memory changelog" in canon) and **`WIKI_ROOT/index.md`**.
- If `MEMORY.md` or `WIKI_ROOT/index.md` has markdown links to paths inside the repo — flag broken links (missing file), including link to **`memory/changelog.md`** if present.
- **Legacy:** if old journal `WIKI_ROOT/changelog.md` or `wiki/changelog.md` exists with accepted canon **`memory/changelog.md`** — do not delete without explicit request; add one line to **Memory hygiene** "migrate entries to `memory/changelog.md`".
- **Legacy:** if `memory/feedback/`, `memory/projects/`, `memory/references/`, `memory/archive/` exist — do not delete; propose moving content to `WIKI_ROOT/*.md` and link from `index.md` (line at top of changelog after user decision).

See "Temperature limits" for thresholds. Exceeding limits **does not block** the pipeline: add **`Memory hygiene`** block — demote HOT→WARM, promote WARM→wiki, compress index.

### 1.5. GLOBAL_MEMORY_ROOT (portfolio)

1. Read [references/global-memory.md](references/global-memory.md).
2. Resolve `GLOBAL_MEMORY_ROOT:` from project `AGENTS.md` only — **no baked-in default path** in this skill.
3. If set: verify directory exists and is readable. In Agent mode if scaffold missing — bootstrap portfolio per [references/portfolio-schema.md](references/portfolio-schema.md) (like project Preflight §3, with portfolio limits).
4. If unset, missing, or unreadable — **degraded mode**; continue with project preflight only; report "Portfolio skipped".

### 1.6. Project `AGENTS.md` check (memory flow)

Checklist (mark ok / needs patch):

- [ ] "Agent memory" / "Memory flow" block (project read order at minimum)
- [ ] If portfolio is used: `GLOBAL_MEMORY_ROOT:` with a **user-defined** path (never a maintainer's machine path)
- [ ] If portfolio is used: dual-write on memo-session without duplicate paragraphs
- [ ] **No** requirement to copy `memo-session-skill` into the project

In **Agent mode**, if block missing and workspace is a project repo (not the portfolio-memory repo itself): add template from [references/agents-md-template.md](references/agents-md-template.md) (do not rewrite entire `AGENTS.md`).

### 2b. Hygiene scan (portfolio)

If `GLOBAL_MEMORY_ROOT` available — same checks as §2 for portfolio; limits — "Portfolio limits". Separate **Portfolio hygiene** block in report.

### 3. Bootstrap scaffold (Agent mode only)

If any required canon element is missing — **create missing** with short template (heading + 2–5 lines of purpose). **Do not** overwrite existing files wholesale. **Do not** create `memory/feedback/`, `projects/`, `references/`, `archive/` — durable knowledge only in wiki (COLD).

For **`memory/warm-cache.md`** on create:

```markdown
# Warm cache

Medium memory: demote from HOT; promote stable items to wiki (COLD).
```

For **`memory/changelog.md`** on create, minimal scaffold is enough (full format only in canon "Memory changelog"):

```markdown
# Changelog

Project memory change journal.

## YYYY-MM

```

Substitute current month for `YYYY-MM`.

If **`MEMORY.md`** missing — create **agent instruction** template (≤60 lines on first bootstrap; ≤200 long-term):

```markdown
# Project memory

Entry point for repository memory. Does not duplicate wiki or replace git log.

## Temperatures

| Layer | File / place | Meaning |
|-------|----------------|--------|
| HOT | [hot-cache](memory/hot-cache.md) | Context for next 1–3 sessions |
| WARM | [warm-cache](memory/warm-cache.md) | Medium memory; demote from HOT |
| COLD | [Wiki](memory/wiki/index.md) | Transferable articles (`WIKI_ROOT/*.md`) |

Demote down (HOT→WARM), promote to wiki (WARM→COLD). WARM — bullets and links, not essays.

## Agent flow

1. Read this file → `hot-cache` → as needed `warm-cache` → `open-loops` / `decisions`.
2. Urgent new item → HOT.
3. HOT full or item cooled → WARM (one link line in HOT if needed).
4. Stable / process / ADR / long text → wiki page + link in `index.md` / here.
5. Behavior rules ("never do X") → `AGENTS.md` / `.cursor/rules/`, not warm-cache.
6. After skill edits → [changelog](memory/changelog.md) and other journals with date — **at top** (see "Dated entries"). Commit — only on user request.

Limits and conflict gate: **memo-session-skill**.

## Map

- [changelog](memory/changelog.md) · [hot-cache](memory/hot-cache.md) · [warm-cache](memory/warm-cache.md)
- [open-loops](memory/open-loops.md) · [decisions](memory/decisions.md)
- [Wiki — entry](memory/wiki/index.md)
```

## Step 2: Session digest (memory consolidation)

**Memory consolidation** step: distill volatile session context into a short human-readable summary before routing:

- what was done;
- what was learned;
- what was verified by facts;
- what remains hypothesis;
- what broke or was unexpected;
- decisions made;
- open promises, blockers, and follow-ups.

Separately note user corrections: "never do X", "always do Y", "this is the right approach". These are candidates for **`AGENTS.md`**, **`.cursor/rules/`**, or wiki page `user-preferences.md`, not `warm-cache`.

## Step 3: Quality filter

Save only knowledge that passes at least 2 of 4 criteria:

- **Non-obvious:** cannot be easily recovered from code, README, or git log.
- **Reusable:** useful in future sessions.
- **Concrete:** contains action, example, file, command, condition, or verifiable fact.
- **Verified:** checked in this session or explicitly approved by the user.

Fifth criterion is mandatory: **right channel**. Even strong knowledge must not go to memory if it belongs in `AGENTS.md`, documentation, test, or existing skill `references/`.

Sixth criterion is mandatory: **`scope`** — `project` | `portfolio` | `both` | `skill` | `rule` | `session-only` (see [references/portfolio-schema.md](references/portfolio-schema.md)). Before write **anti-dup**: one paragraph must not appear in both project hot-cache and portfolio; for `both` — link in project, body in `GLOBAL_MEMORY_ROOT/memory/wiki/project-<slug>.md`.

## Step 4: Temperature classification

Typed **memory architecture** — map each finding to temperature (and optionally cognitive role):

| Temperature | Cognitive role (informative) | Storage |
|-------------|------------------------------|---------|
| HOT | Episodic / working — next 1–3 sessions | `memory/hot-cache.md` |
| WARM | Medium recall — still active, not urgent | `memory/warm-cache.md` |
| COLD | Semantic / procedural — stable transferable knowledge | **`WIKI_ROOT/`** (flat wiki) |

For each finding choose class:

- `session-only` — useful for report, do not save.
- `HOT` — needed in next 1–3 sessions → `memory/hot-cache.md`.
- `WARM` — still needed by agent, not in HOT → `memory/warm-cache.md` (bullets, not article).
- `COLD` — durable transferable knowledge → **`WIKI_ROOT/`** (flat wiki).
- `durable-doc` — project canon: default **wiki**; `AGENTS.md` / `.cursor/rules/` for agent rules; `docs/` — only if explicit in `AGENTS.md` or user request (see "docs/ and wiki").
- `regression` — bug better fixed with a test.
- `skill-update` — short rule, trigger, or gotcha in existing `SKILL.md`.
- `skill-reference` — large topic in `references/<topic>.md` of existing skill plus link from `SKILL.md`.

For each saved finding specify **`scope`** (required). HOT/WARM/COLD temperature applies **within** chosen channel (project or portfolio).

## Step 5: Memory routing

**Memory routing** — choose destination by audience, lifetime, and scope:

- `AGENTS.md` — stack, architecture, terminology, project best practices, API gotchas, safety rules.
- `.cursor/rules/*.md` — agent behavior rules in this repository.
- `tests/` — regression tests for bugs found.
- `scripts/` — only if session revealed repeatable manual procedure and user asks to automate.
- `MEMORY.md` — **agent instruction** + memory map (see Preflight §3 bootstrap); **in git**.
- **`WIKI_ROOT/`** — **COLD**: transferable articles (see "Wiki: flat structure"); **in git**.
- `memory/hot-cache.md`, `memory/warm-cache.md` — HOT and WARM; `memory/open-loops.md`, `memory/decisions.md`, `memory/changelog.md` — tasks, decisions, skill session journal.
- `docs/` — **not** default channel; only explicit request or canon in `AGENTS.md` (see "docs/ and wiki").
- `.cursor/skills/` or `~/.cursor/skills/` — user and project skills.
- **`GLOBAL_MEMORY_ROOT`** (only when set in `AGENTS.md`) — for `scope: portfolio` or body for `scope: both`:
  - registry, `local_path`, `git_remote` → `memory/wiki/projects-registry.md` + `project-<slug>.md`;
  - servers → `hosting-and-servers.md`; domains/certs → `domains-and-certificates.md`; URLs → `urls-and-environments.md`;
  - agent mistakes → `agent-mistakes-registry.md`; portfolio HOT/WARM — `memory/hot-cache.md`, `warm-cache.md`.

**Do not** copy `SKILL.md` or skill folder into `GLOBAL_MEMORY_ROOT`. **Do not** duplicate project hot-cache in portfolio.

| Topic | Scope |
|-------|--------|
| API, classes, migrations, bug in one service | `project` |
| Server, domain, cert, URL, other repo, git_remote | `portfolio` |
| Project inventory "from outside" | `both` (link in project + card in portfolio) |
| "Always do Y" for all repos | `portfolio` or User Rules / `agent-mistakes-registry.md` |

Do not manually edit `~/.cursor/skills-cursor/`. If a system skill was wrong, record workaround in project docs, memory, or user skill.

## Canonical project structure

**`WIKI_ROOT`:** project wiki root. Path from `AGENTS.md` / `README.md`; if **nowhere** set explicitly, use **`memory/wiki/`** (wiki **inside** `memory/`, not separate repo root).

**Skill session journal:** always **`memory/changelog.md`** (root of `memory/` tree). **Do not** create or use `WIKI_ROOT/changelog.md` for new projects; journal path **does not** depend on `WIKI_ROOT` override.

**Required scaffold** (create missing — in **Preflight §3**, Agent mode only):

| Path | Purpose |
|------|---------|
| `MEMORY.md` | Memory index: navigation and structure (links), see below |
| `memory/changelog.md` | Journal: intentional skill edits; new lines **at top** of month/file; **only** journal path |
| `WIKI_ROOT/index.md` | Wiki entry page (default — `memory/wiki/index.md`) |
| `memory/hot-cache.md` | HOT: context for upcoming sessions |
| `memory/warm-cache.md` | WARM: medium memory (demote from HOT) |
| `memory/open-loops.md` | Open tasks (not a temperature) |
| `memory/decisions.md` | Short decision log; ADR → wiki `adr-*.md` |

**`MEMORY.md`:** full memory schema and agent workflow — **in repository** (Preflight §3 template). On bootstrap and empty file create/supplement per template. Do not duplicate full table in skill — only normative reference to `MEMORY.md`. After new wiki pages update link map and `WIKI_ROOT/index.md`.

### Temperatures: HOT, WARM, COLD (typed memory layers)

Three-tier **persistent memory** inside the project repo — promotion and demotion are the **memory compaction** path when limits are exceeded:

- **HOT → WARM:** `hot-cache` overflow or item unused in HOT for long — move to `warm-cache`, one link line in HOT if needed.
- **WARM → COLD (wiki):** end-to-end process, ADR, reference, investigation after stabilization — flat page `WIKI_ROOT/<kebab>.md`.
- **HOT → COLD:** immediately if topic is large — wiki page + one line in HOT.
- **Stale wiki:** prefix `archived-*.md` or delete (git keeps history); no separate `archive/` folder.

After any new or renamed files in `memory/` or under `WIKI_ROOT/` update **`MEMORY.md`** if it has index links to those paths.

### Wiki: flat structure and content (COLD)

**Wiki = COLD layer** — only place for transferable articles and references (replaces former `memory/projects/`, `references/`, `archive/`).

**Structure:** all pages — only **at root** of `WIKI_ROOT` (required **`index.md`**; journal — **`memory/changelog.md`**, not in wiki). No nested directories for new topics. Names — **`kebab-case.md`**. Do not touch legacy tree under old `WIKI_ROOT` without user request.

**Wiki yes:**

- Cross-cutting end-to-end processes, ADR, glossary, stable references and investigations after fix.
- Connected articles demoted from `MEMORY.md` / WARM at limits.

**Wiki no:**

- Unstable unverified hypotheses — report only or one line in `open-loops`.
- Agent rules — `AGENTS.md` / `.cursor/rules/`; urgent context — HOT/WARM, not wiki.

### docs/ and wiki

- **`WIKI_ROOT/`** — knowledge canon for memo-session (runbook, processes, ADR in project repo).
- **`docs/`** — **do not create or fill** by this skill by default (often MkDocs/Docusaurus/framework API docs). If `docs/` exists — **link from wiki**, no duplicate.
- Write to `docs/`: explicit user request or hard requirement in `AGENTS.md` ("canon = docs/") → conflict gate.

**Required actions for new page:** create or extend file at `WIKI_ROOT/` root per template below; add **link** in **`WIKI_ROOT/index.md`** (TOC or topic list); if needed — one link line in **`MEMORY.md`**.

**Minimal new page template:**

```markdown
# Topic title

**Purpose:** one line why this page exists.
**Audience:** developers / agent / both.

## Content
…

## Links
- …
```

### Dated entries

**Only place in this skill with full order description.** All other sections — references here only.

**Principle:** where events are recorded with **date and/or time**, order **newest to oldest** (reverse chronological). New entry — **at top** of list or block; new period (`## YYYY-MM`, `## YYYY-MM-DD`, table row with date) — **above** older ones.

**Journal files** (required):

| File | How to write new |
|------|------------------|
| `memory/changelog.md` | Line `YYYY-MM-DD \| …` — **first** under `## YYYY-MM`; month without section — new `## YYYY-MM` right after intro, **above** older months |
| `memory/decisions.md` | Section `## YYYY-MM-DD` (or `YYYY-MM`) — **above** older dates; within section order as in session source |
| `memory/open-loops.md` | **`## Active`** — **always** right after intro, before closed archive; blocks "Closed in session …" / dated headers — **newer above** |
| `memory/hot-cache.md` / `warm-cache.md` | Only with `## YYYY-MM-DD` sections: new day **above**; bullets within day — new **at top** |
| `memory/wiki/agent-mistakes-registry.md` | Bullets with `last_verified` — new **at top** of list |
| `GLOBAL_MEMORY_ROOT/memory/*` | Same rules for portfolio |
| `~/.cursor/skills/memo-session-skill/references/changelog.md` | Like `memory/changelog.md` (skill evolution) |

**Table with date column** (e.g. project `memory/decisions.md`): new data rows — **right under** `|---|` separator, **above** older rows.

**Do not sort** by date without explicit journal header: thematic `##` in wiki (`Phase N`, `Prod`, `SEO`), `open-loops` / `hot-cache` by phase or subsystem without date in header; reference pages `WIKI_ROOT/*.md`.

#### `memory/changelog.md` (details)

- **Path:** only **`memory/changelog.md`**. Do not keep parallel journal under `WIKI_ROOT/` or root `wiki/`.
- **Purpose:** short history of **intentional** skill edits: `MEMORY.md`, `memory/**`, `WIKI_ROOT/**`, `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/`; `docs/` — only if skill actually changed them. Do not duplicate git diff.
- **Line:** `YYYY-MM-DD | action | affected paths | reason`. No secrets, tokens, passwords, PII.
- **When to add (Agent mode):** after skill edits in session (bootstrap, hygiene, soft/hard conflict after choice). No "pending" on unresolved hard conflict. Exception: only empty journal on bootstrap — one line.
- **Minimum:** session with skill edits — **at least one** meaningful line; otherwise do not touch file.
- **Meta:** do not confuse with **`references/changelog.md`** of this skill — project/portfolio journal **only** `memory/changelog.md`.

## Temperature limits (memory compaction)

Thresholds **do not block** the pipeline alone. On exceed add **`Memory hygiene`** block — automatic **memory compaction**: demote HOT→WARM, promote WARM→wiki, compress index.

| Layer | Place | Limit | On exceed |
|-------|-------|-------|-----------|
| Index | `MEMORY.md` | ≤200 lines | compress; details → wiki |
| HOT | `memory/hot-cache.md` | ≤80 lines | demote → `warm-cache` or link + wiki |
| WARM | `memory/warm-cache.md` | ≤120 lines | promote → wiki; compress bullets |
| Open loops | `memory/open-loops.md` | ≤120 lines | close resolved; context → warm or wiki |
| Decisions | `memory/decisions.md` | soft ≤80 | ADR to wiki `adr-*.md` |
| COLD | `WIKI_ROOT/*.md` | ~400/file soft | split into two flat pages |

### Portfolio limits (`GLOBAL_MEMORY_ROOT` only)

| Layer | Place | Limit | On exceed |
|-------|-------|-------|-----------|
| Index | `MEMORY.md` | ≤300 | compress; details → wiki |
| HOT | `memory/hot-cache.md` | ≤150 | demote → warm or wiki |
| WARM | `memory/warm-cache.md` | ≤250 | promote → wiki |
| Open loops | `memory/open-loops.md` | ≤200 | close resolved |
| Decisions | `memory/decisions.md` | ≤150 | ADR → `adr-*.md` |
| COLD | `memory/wiki/*.md` | ~700/file | split |

## Git: MEMORY.md and wiki (persistent memory)

**Default policy for project workspace** — git is the **persistent memory** substrate (not a vector store):

1. **`MEMORY.md`** at project root, **entire `memory/` tree** (including **`memory/changelog.md`** and default wiki **`memory/wiki/`**) and **`WIKI_ROOT/`** (if legacy outside `memory/`) must be **inside project git repo** and intended for **GitHub or functional equivalent** (GitLab, Gitea, Forgejo, Bitbucket, Azure DevOps, etc.).
2. **`WIKI_ROOT`** set in `AGENTS.md` or `README.md`. If unset, default — **`memory/wiki/`**. Do not spawn multiple unrelated "wikis" without explicit doc decision.
3. **Do not add** `MEMORY.md`, **`memory/`** root, and **`WIKI_ROOT`** root to `.gitignore` without explicit user request. Preflight checks ignore separately; if paths **not** ignored — **do not change** `.gitignore`.
4. **No secrets** in these paths; for sensitive data — outside repo or project secret store.
5. **Commit and push** only on **explicit user request**; editing files in working tree does not mean automatic commit.

If workspace is **not** a git repo or knowledge stays local by design — note in handoff and do not insist on push.

## Decisions and open loops

Record decisions with provenance:

- `approved_by: user` — user explicitly approved; treat as canon.
- `approved_by: inferred` or no field — advisory; show as assumption, not rule.

New sections in `memory/decisions.md` and closed blocks in `memory/open-loops.md` — **at top** per "Dated entries" (`## Active` in open-loops must not sink down).

Record open loops as actionable items: owner, next step, blocker, absolute date if known.

## Auto-start and conflict gate

Invoking this skill is permission to start the pipeline: read context, run **preflight**, analyze session, classify findings, reconcile memory, prepare updates. Do not ask "start?" or require confirmation for clean updates.

After preflight and routing, **before writing** new facts from session run conflict gate:

1. **Project:** `MEMORY.md`, `WIKI_ROOT`, `memory/`, `AGENTS.md`, `.cursor/rules/`, project skills.
2. **Portfolio** (if `GLOBAL_MEMORY_ROOT` available): `GLOBAL_MEMORY_ROOT/MEMORY.md`, `memory/`, `memory/wiki/`, portfolio `AGENTS.md`.

Canon by type: inventory/servers/domains/URL/git_remote → **portfolio**; agent behavior in this repo → project `AGENTS.md`; code/API → **project**.

Classify result:

- `clean` — no contradictions. In Agent mode apply changes automatically; commit/push still only on explicit request.
- `soft conflict` — duplicate, stale wording, or obvious clarification. May update automatically if new version confirmed by current session; note in handoff as `Resolved automatically`.
- `hard conflict` — contradicts `approved_by: user`, `AGENTS.md`, `.cursor/rules/`, safety rule, git policy, secrets, or canon cannot be determined. Do not write disputed fragment; show conflict report and ask user to choose.

Source priority for auto-resolution:

1. Explicit current user instruction in this session.
2. Decisions with `approved_by: user` in `memory/decisions.md`, flat `adr-*.md` under `WIKI_ROOT/`, or other project canonical doc.
3. `AGENTS.md` and `.cursor/rules/`.
4. `MEMORY.md` as index.
5. `memory/hot-cache.md`, then `memory/warm-cache.md`.
6. `WIKI_ROOT/` pages (COLD), including `archived-*.md`.
7. Agent conclusion without confirmation — advisory only.

If current user instruction changes prior approved rule, do not overwrite silently: record new decision as supersedes and reflect in handoff.

**Journal write (Agent mode only, after actual file edits):**

- **Project:** `memory/changelog.md`, and as needed `decisions` / `open-loops` / dated `hot-cache` — per **"Dated entries"**.
- **Portfolio:** `GLOBAL_MEMORY_ROOT/memory/changelog.md` (and same portfolio journals) — same order; in changelog **reason** mandatory `from:<project-slug>` (slug of current workspace, not `global-memory`, if session was in another repo).

On **hard** conflict — journal entry **only after** user choice.

Hard conflict format:

```markdown
## Conflict resolution required

| # | Topic | Already in memory | New from session | Why conflict | Options |
|---|-------|-------------------|------------------|--------------|---------|
```

## Skill analysis

If skills were used in the session:

1. List global `~/.cursor/skills/*/SKILL.md` and project `.cursor/skills/*/SKILL.md`
2. For each new fact ask: "which skill thematically owns this knowledge?"
3. Short gotcha or rule (1–5 lines) → `skill-update` in `SKILL.md`.
4. Large topic (10+ lines) → `skill-reference` in `references/<topic>.md` and link from `SKILL.md`.
5. If skill reviewed and no edits needed, mention in report.

Propose new skill only if pattern repeated 2+ times, 3+ steps, clear input/output.

## Meta: updating this skill

After a session where `memo-session-skill` was actively used, include edits to `~/.cursor/skills/memo-session-skill/SKILL.md` if any of:

- user corrected workflow, step order, or output format;
- false or weak trigger: description does not match real use case;
- gap: non-obvious case missed all channels in "Routing";
- recurring conflict with another skill or `AGENTS.md` / rules.

Edit rules:

- **`description` in frontmatter:** only **add** new trigger phrases or clarifications; do not rewrite existing text wholesale to avoid breaking skill matching.
- **`SKILL.md` body:** short clarifications in existing sections; if edit grows into history or long examples, move to **`~/.cursor/skills/memo-session-skill/references/changelog.md`** (this skill's **evolution journal**, not project **`memory/changelog.md`**) or other `references/<topic>.md` and add **one** link from `SKILL.md` in appropriate section.
- Do not bloat skill unnecessarily: goal is targeted fixes after real sessions.

## Report and conflict report format

On clean/soft updates do not block on prior approval. After applying show what changed:

```markdown
## Session wrap-up updates

### 1. Documentation, memory, tests

| # | File | Type | Status | Change |
|---|------|------|--------|--------|

### 2. Skills

| # | File | Type | Status | Change |
|---|------|------|--------|--------|

### 3. Skills reviewed without edits

- `skill-name` — reviewed, no edits needed.

### 4. Memory hygiene

- Thresholds: what exceeded; demote HOT→WARM, promote WARM→wiki.
- Preflight: gitignore (ok / needs user), bootstrap (what created), broken index links.

### 5. Changelog

- Project: **`memory/changelog.md`**
- Portfolio: **`GLOBAL_MEMORY_ROOT/memory/changelog.md`** (or "skipped")
- Brief: how many lines, for which events (format — "Memory changelog").

### 6. Portfolio memory

| # | File | scope | Status | Change |
|---|------|-------|--------|--------|
| … | … | project/portfolio/both | … | … |

- `GLOBAL_MEMORY_ROOT`: path, available / degraded
- AGENTS.md check: ok / patched / skipped (if workspace = global-memory)
```

Types: `doc-update`, `portfolio-update`, `rule-update`, `memory-new`, `memory-update`, `regression`, `skill-update`, `skill-reference`, `skill-new-incident`, `status`.

If hard conflicts exist, add separate `Conflict resolution required` block and do not apply disputed changes until user choice.

## Analysis-only format

If user asks analysis only, use:

```markdown
## Brief digest

## Key knowledge

## Open loops

## Decisions

## Worth saving

## Handoff for next session
```

## Handoff

At end of large session provide short handoff for **cross-session continuity**:

- `HOT`: what to keep in mind right now (working memory for next session).
- `Open loops`: open tasks and blockers.
- `Decisions`: approved and advisory decisions separately.
- `Next actions`: 1–5 concrete next steps.
- `Suggested memory updates`: what to save and where.
- `Memory hygiene`: preflight summary (gitignore, broken links, bootstrap) and temperature limit actions.
- `Changelog`: project and portfolio — updated / skipped (why).
- `Portfolio HOT` / `Portfolio open loops` / `Portfolio hygiene` — if portfolio available.

## Portfolio memory search

Without writes or on user request:

1. Resolve `GLOBAL_MEMORY_ROOT` (§1.5).
2. Search: `rg -i "<query>"` over `GLOBAL_MEMORY_ROOT/MEMORY.md`, `GLOBAL_MEMORY_ROOT/memory`, `GLOBAL_MEMORY_ROOT/memory/wiki` (or `Select-String` on Windows, see [references/global-memory.md](references/global-memory.md)).
3. Open `memory/wiki/projects-registry.md` → `local_path`, `git_remote`, `project_memory`.
4. If needed read `MEMORY.md` of found project.
5. Answer: file, summary, `last_verified` / verified | advisory | unknown.

## portfolio-librarian subagent

Optional, see [agents/portfolio-librarian.md](agents/portfolio-librarian.md). Invoke for ≥3 portfolio entries, dedupe, portfolio hygiene, explicit search. **Do not** copy prompt into projects or `GLOBAL_MEMORY_ROOT`. Parent memo-session performs writes after subagent report.

## Install (details)

**Global:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**Repository only:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -a cursor -y
```

Path after install: `~/.cursor/skills/memo-session-skill/` or `~/.agents/skills/memo-session-skill/`.

## Limitations

- **Not** a Mem0/Zep/Letta replacement, vector database, graph memory, or hybrid retrieval stack — no embeddings, no managed memory API.
- **Not** RAG — does not index static corpora for semantic search; use RAG for read-heavy knowledge bases, this skill for **session write-path memory**.
- Do not run `npx skills add`, install other skills, or fetch remote code **during** the memo-session pipeline (install is user-driven, outside the session).
- Do not record secrets, tokens, private keys, passwords, connection strings.
- No commits or push without explicit request; yet `MEMORY.md`, **`memory/`** tree, and **`WIKI_ROOT/`** must **default to git-tracked** (do not hide in `.gitignore` without reason).
- No relative dates like "today"; use absolute dates.
- Do not duplicate knowledge across `AGENTS.md`, wiki, memory, skills; do not duplicate `docs/` without explicit project canon.
- Do not duplicate paragraphs between project `memory/` and `GLOBAL_MEMORY_ROOT`; `scope: both` = link + body in portfolio.
- Do not copy `memo-session-skill` into `GLOBAL_MEMORY_ROOT` or project repos — only link in `agent-process.md` / `AGENTS.md`.
- Do not overwrite existing files wholesale without need.
- Ask/Plan mode: read-only, preflight report, conflict analysis, recommendations **without** bootstrap or project file writes.
- Agent mode: full pipeline including bootstrap and writes; user confirmation only on **hard conflicts** or removing lines from `.gitignore`.
