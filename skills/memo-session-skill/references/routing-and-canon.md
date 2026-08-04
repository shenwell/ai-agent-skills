# Memory routing and canonical structure

Choose destination by audience, lifetime, and scope — after [consolidation-protocol.md](consolidation-protocol.md).

## Memory routing

- `AGENTS.md` — stack, architecture, terminology, project best practices, API gotchas, safety rules.
- `.cursor/rules/*.md` — agent behavior rules in this repository.
- `tests/` — regression tests for bugs found.
- `scripts/` — only if session revealed repeatable manual procedure and user asks to automate.
- `MEMORY.md` — **agent instruction** + memory map (see [preflight-protocol.md](preflight-protocol.md) §3 bootstrap); **in git**.
- **`WIKI_ROOT/`** — **COLD**: transferable articles (see § Wiki: flat structure); **in git**.
- `memory/hot-cache.md`, `memory/warm-cache.md` — HOT and WARM; `memory/open-loops.md`, `memory/decisions.md`, `memory/changelog.md` — tasks, decisions, skill session journal.
- `docs/` — **not** default channel; only explicit request or canon in `AGENTS.md` (see § docs/ and wiki).
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

**Required scaffold** (create missing — in [preflight-protocol.md](preflight-protocol.md) §3, Agent mode only):

| Path | Purpose |
|------|---------|
| `MEMORY.md` | Memory index: navigation and structure (links), see below |
| `memory/changelog.md` | Journal: intentional skill edits; new lines **at top** of month/file; **only** journal path |
| `WIKI_ROOT/index.md` | Wiki entry page (default — `memory/wiki/index.md`) |
| `memory/hot-cache.md` | HOT: context for upcoming sessions |
| `memory/warm-cache.md` | WARM: medium memory (demote from HOT) |
| `memory/open-loops.md` | Open tasks (not a temperature) |
| `memory/decisions.md` | Short decision log; ADR → wiki `adr-*.md` |

**`MEMORY.md`:** full memory schema and agent workflow — **in repository** (preflight §3 template). On bootstrap and empty file create/supplement per template. Do not duplicate full table in skill — only normative reference to `MEMORY.md`. After new wiki pages update link map and `WIKI_ROOT/index.md`.

### Temperatures: HOT, WARM, COLD (typed memory layers)

Three-tier **persistent memory** inside the project repo — promotion and demotion are the **memory compaction** path when limits are exceeded (see [temperature-limits.md](temperature-limits.md)):

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

New sections in `memory/decisions.md` and closed blocks in `memory/open-loops.md` — **at top** per [dated-entries.md](dated-entries.md) (`## Active` in open-loops must not sink down).

Record open loops as actionable items: owner, next step, blocker, absolute date if known.

## Skill analysis

If skills were used in the session:

1. List global `~/.cursor/skills/*/SKILL.md` and project `.cursor/skills/*/SKILL.md`
2. For each new fact ask: "which skill thematically owns this knowledge?"
3. Short gotcha or rule (1–5 lines) → `skill-update` in `SKILL.md`.
4. Large topic (10+ lines) → `skill-reference` in `references/<topic>.md` and link from `SKILL.md`.
5. If skill reviewed and no edits needed, mention in report.

Propose new skill only if pattern repeated 2+ times, 3+ steps, clear input/output.
