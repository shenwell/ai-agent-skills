```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ███╗   ███╗███████╗███╗   ███╗ ██████╗     ███████╗███████╗███████╗███████╗ ║
║  ████╗ ████║██╔════╝████╗ ████║██╔═══██╗    ██╔════╝██╔════╝██╔════╝██╔════╝ ║
║  ██╔████╔██║█████╗  ██╔████╔██║██║   ██║    ███████╗█████╗  █████╗  ███████╗ ║
║  ██║╚██╔╝██║██╔══╝  ██║╚██╔╝██║██║   ██║    ╚════██║██╔══╝  ██╔══╝  ╚════██║ ║
║  ██║ ╚═╝ ██║███████╗██║ ╚═╝ ██║╚██████╔╝    ███████║███████╗███████╗███████║ ║
║  ╚═╝     ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝     ╚══════╝╚══════╝╚══════╝╚══════╝ ║
║                                                                              ║
║   Persistent AI agent memory · cross-session · MEMORY.md · memory/ · wiki    ║
║         Standalone · git-tracked · Cursor · MIT · v1.1.0                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/memo-session-skill)

**memo-session-skill** is an [Agent Skill](https://agentskills.io/) for **persistent AI agent memory** in coding workflows. When the **context window** resets, session knowledge does not disappear — it is **consolidated** and **routed** into git-tracked `MEMORY.md`, `memory/` (HOT/WARM/COLD), wiki, `AGENTS.md`, and optionally a user-configured portfolio root.

Conflict gate, temperature limits, typed memory architecture, explicit write allowlist. **No network calls during sessions.** See [`references/trust-boundary.md`](references/trust-boundary.md).

## What it is / what it is not

| This skill | Not this |
|------------|----------|
| **Cross-session persistence** for Cursor coding agents | Mem0, Zep, Letta — managed vector/graph platforms |
| **Write-path session memory** (decisions, gotchas, open loops) | RAG — static knowledge corpora |
| **Typed memory layers** in git (`memory/` + wiki) | Embedding stores, hybrid retrieval, temporal knowledge graphs |
| **Context engineering** handoff at session end | Enterprise contact-center or HIPAA memory products |

Use RAG or managed memory for large corpora and semantic search. Use memo-session-skill to **give your coding agent persistent memory** across sessions without standing up infrastructure.

## Quickstart

### Install

**Global** — all projects on this machine:

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -g -a cursor -y
```

**This repository only:**

```bash
npx skills add shenwell/ai-agent-skills --skill memo-session-skill -a cursor -y
```

### First run

In your project after a non-trivial session:

```
wrap up the session
```

The skill runs preflight (gitignore, bootstrap `memory/` scaffold), **memory consolidation**, classification, **memory routing**, and writes automatically. Commit only on explicit request.

Collection: [AI Agent Skills](../../README.md) · protocol: [`SKILL.md`](SKILL.md)

## When to use

- "wrap up the session", "save what we learned", "handoff", "open loops"
- "agent memory", "persistent memory", "cross-session persistence"
- After debugging, workarounds, user corrections, architectural decisions
- When **context window** pressure would lose knowledge before the next session

**Do not use** for one-line trivia, secrets, vector DB setup, or replacing git log.

## How it works (short)

1. **Preflight** — gitignore, bootstrap `MEMORY.md` + `memory/` scaffold, hygiene
2. **Consolidate** — session digest: facts, decisions, open loops vs noise
3. **Classify** — HOT/WARM/COLD (episodic → semantic/procedural) + scope
4. **Route** — `AGENTS.md`, wiki, skills, optional portfolio
5. **Conflict gate** — clean / soft / hard before writes
6. **Handoff** — report for the next session

**Standalone** — does not install other skills during execution. Optional [goal-mode integration](references/goal-mode-integration.md) is documented separately.

## Layout

```
SKILL.md              ← pipeline skeleton + Agent execution contract (~280 lines)
references/           ← normative protocol (preflight, routing, conflict gate, …)
  README.md           ← index: step → reference file
agents/               ← portfolio-librarian (optional subagent)
```

## License

MIT (see [repo root](../../LICENSE)).
