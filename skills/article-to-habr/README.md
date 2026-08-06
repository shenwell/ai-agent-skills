```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║     █████╗ ██████╗ ████████╗██╗ ██████╗██╗     ███████╗    ██╗  ██╗ █████╗   ║
║    ██╔══██╗██╔══██╗╚══██╔══╝██║██╔════╝██║     ██╔════╝    ██║  ██║██╔══██╗  ║
║    ███████║██████╔╝   ██║   ██║██║     ██║     █████╗      ███████║███████║  ║
║    ██╔══██║██╔══██╗   ██║   ██║██║     ██║     ██╔══╝      ██╔══██║██╔══██║  ║
║    ██║  ██║██║  ██║   ██║   ██║╚██████╗███████╗███████╗    ██║  ██║██║  ██║  ║
║    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝  ║
║                                                                              ║
║   Habr technical articles · topics · Mainpointschema · review · MIT v1.0.0   ║
║         npx skills add shenwell/ai-agent-skills --skill article-to-habr      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-black)](https://agentskills.io/)
[![skills.sh](https://img.shields.io/badge/skills.sh-npx%20skills%20add-black)](https://skills.sh/shenwell/ai-agent-skills/article-to-habr)

**article-to-habr** is an [Agent Skill](https://agentskills.io/) for the full **Habr** article lifecycle: **topic discovery** (drive-list + scoring), **structured writing** (Mainpointschema, guides/cases/reviews), and **pre-publish review** — with 17 bundled methodology chapters for Russian IT blogging on [habr.com](https://habr.com).

No network calls. Reference material is local. Articles are written in **Russian** unless you ask otherwise.

## Quickstart

### Install

**Global** — all projects on this machine:

```bash
npx skills add shenwell/ai-agent-skills --skill article-to-habr -g -a cursor -y
```

**This repository only:**

```bash
npx skills add shenwell/ai-agent-skills --skill article-to-habr -a cursor -y
```

### First run

1. Edit `drive-list.md` in the installed skill path (or project copy) — add your topic ideas.
2. Ask the agent:

```
Find a Habr topic about observability — score candidates and suggest what to write first
```

```
Write a Habr case study about cutting API latency — follow Mainpointschema
```

```
Review my Habr draft before I publish — run the checklist
```

Collection: [AI Agent Skills](../../README.md) · protocol: [`SKILL.md`](SKILL.md)

## When to use

- "статья на Хабр", "Habr article", "write a guide/case/review"
- "find a topic", "drive-list", "what should I write about"
- "check my article", "review before publish"
- Mainpointschema, headline, lead, KDPV, hit genres, corporate blog on Habr

**Do not use** for English-only blogs, generic SEO articles, or platforms other than Habr without adapting the methodology.

## What is inside

| Piece | Purpose |
|-------|---------|
| **Topics mode** | Drive-list, hit genres, 6-criteria scoring, shortlist |
| **Writing mode** | Mainpointschema (8 steps), formats, headlines, layout |
| **Review mode** | Pre-publish checklist + reader pushback pass |
| **17 chapters** | Metrics, usability, images, timing, corporate blog, comments |
| **Cheatsheet / glossary / patterns** | Fast lookup during sessions |

## Layout

```
SKILL.md              ← routing + Agent execution contract
drive-list.md         ← your topic backlog (editable)
cheatsheet.md         ← quick rules (RU)
glossary.md | patterns.md
assets/checklist.md
references/           ← formats, headlines, genres, evaluation, review
chapters/             ← ch01–ch17 deep reference (RU)
```

## Trust boundary

Local files only — no API calls. The skill may update `drive-list.md` when you ask to save topics. See [`references/trust-boundary.md`](references/trust-boundary.md).

## License

MIT (see [repo root](../../LICENSE)).
