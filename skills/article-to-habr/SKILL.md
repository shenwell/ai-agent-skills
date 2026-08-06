---
name: article-to-habr
description: >-
  End-to-end Habr article workflow for Russian tech blogging: find topics, write
  guides/cases/reviews, review before publish. Mainpointschema, drive-list,
  headline/lead/KDPV rules, hit genres, corporate blog guidance — bundled
  methodology from 17 reference chapters. Use when the user says "статья на Хабр",
  "Habr article", "write a guide/case/review for Habr", "find a topic",
  "drive-list", "check my article", "Mainpointschema", headlines, KDPV, hit
  genres, or asks for pre-publish review of a Habr draft. Prefer over generic
  blog-writing when the target is habr.com and Russian IT audience norms apply.
  Do not use for English-only blogs, non-Habr platforms without adaptation, or
  one-line title tweaks without the full article workflow.
metadata:
  version: "1.0.0"
  author: productlaba
  category: content-writing
  tags: habr, technical-writing, russian, blog, mainpointschema, drive-list,
    guide, case-study, review, headline, kdpv, corporate-blog
---

# Article to Habr

**End-to-end workflow for technical articles on [Habr](https://habr.com)** — topic discovery, structured writing, and pre-publish review — with a bundled methodology (Mainpointschema, drive-list, hit genres, headline/lead/KDPV rules, 17 reference chapters).

Most “write me a Habr post” requests fail because the agent skips topic fit, format choice, and Habr-specific presentation rules. This skill routes each request to the right mode, applies **Mainpointschema** before the first paragraph, and checks drafts against Habr usability norms (scroll depth, no bare text walls, factual subheads).

**Output language:** articles for Habr are **Russian** unless the user explicitly asks otherwise. Protocol and routing below are in English; reference chapters and checklists are in Russian (source methodology).

## Install this skill

```bash
npx skills add shenwell/ai-agent-skills --skill article-to-habr -g
```

## Who it's for

Authors, engineers, and devrel teams publishing on **habr.com** — solo bloggers, corporate blogs, and anyone who wants agent help with **topic shortlists**, **guides/cases/reviews**, or **pre-publish review** without re-explaining Habr conventions every session.

## What you get

- **Three modes:** Topics · Writing · Review (+ methodology lookup)
- **Mainpointschema** — mandatory 8-step prep before drafting
- **Drive-list** — persistent topic backlog with scoring rules
- **Format playbooks** — guide, case, review, story (“байка”)
- **Headline/lead/KDPV** rules and pre-publish checklists
- **17 chapters** — metrics, usability, timing, corporate blog, comments, hit analysis

Canonical references: [references/](references/) · [chapters/](chapters/) · [cheatsheet.md](cheatsheet.md)

## Quick start

After install, edit `drive-list.md` in the skill folder (or project copy) with your topic ideas.

```
Find a Habr topic about API latency — score candidates and update the drive-list
```

```
Write a Habr guide about reducing PostgreSQL bloat — use Mainpointschema
```

```
Review my Habr draft before publish — use the checklist
```

---

## Agent protocol

### Request routing

| User intent | Mode | Read first |
|-------------|------|------------|
| “what to write”, “find a topic”, “drive-list” | **Topics** | `drive-list.md` → [references/hit-genres.md](references/hit-genres.md) → [references/topic-evaluation.md](references/topic-evaluation.md) |
| “write article/guide/case/review” | **Writing** | Mainpointschema below → [references/formats.md](references/formats.md) → [references/headlines-lead.md](references/headlines-lead.md) |
| “review / check article” | **Review** | [assets/checklist.md](assets/checklist.md) → [references/review-checklist.md](references/review-checklist.md) |
| methodology, genres, karma | **Reference** | [cheatsheet.md](cheatsheet.md) or `chapters/chNN-*.md` (index below) |

### Mode: Topics

1. Read `drive-list.md`.
2. Clarify user directions; if none — [references/topic-directions.md](references/topic-directions.md).
3. For each topic: genre ([references/hit-genres.md](references/hit-genres.md)), score 1–5 on six criteria ([references/topic-evaluation.md](references/topic-evaluation.md)).
4. Return shortlist of 3–5 topics + “what to write first” recommendation.
5. Offer to append strong topics to `drive-list.md` ([references/drive-list-rules.md](references/drive-list-rules.md)).

**80% rule:** topic ≈ 80% of success. Strong topic = **unique** + **useful** (practice or infotainment). Amplifier genres: investigation, exposé, social, DIY, pain-point.

**Response table:**

| Topic | Direction | Genre | Reader benefit | To confirm | Score | Add to drive-list |
|-------|-----------|-------|----------------|------------|-------|-------------------|

### Mode: Writing

#### Mainpointschema — mandatory order

Steps 1–6 **before** the first paragraph. Step 7 — draft. Step 8 — cut, proofread, **lead and final headline last**.

1. **Information field** — what already exists on Habr for this topic
2. **Reader takeaway** — “what do they get after reading?”
3. **Format** — guide / case / review / story / encyclopedic → [references/formats.md](references/formats.md)
4. **Working title** — before body text
5. **Structure** — skeleton per format
6. **Factual material** — numbers, screenshots, experiments
7. **Body text**
8. **Cut, proofread, layout, lead**

#### Formats (summary)

| Format | Structure |
|--------|-----------|
| Guide | Problem → Prep → Steps → Pitfalls → Summary |
| Case | Problem → Before → What we did → Result |
| Review | Hook first, then descending interest |
| Story | Narrative → Analysis → Conclusions |

#### Headline and lead

See [references/headlines-lead.md](references/headlines-lead.md): 7 traits, 7–8 words, two-part title, KDPV (+20–30% views).

#### Layout rules

- **No full-screen bare text**
- Subhead = **conclusion or fact**, not “Packaging” / “Screen”
- Lists, quotes, illustrations with factual captions
- Own photos/screenshots, not stock “success” imagery

#### Story format

Story at the top → recognition → technical detail. Often stronger than a dry guide.

#### Before handing off draft

Run [assets/checklist.md](assets/checklist.md).

### Mode: Review

1. Read the user’s text.
2. Walk [references/review-checklist.md](references/review-checklist.md) section by section.
3. Report:
   - **Passed** — no issues
   - **Issues** — what to fix, with location in text
   - **Suggestions** — optional improvements
4. Key question: **“What will the reader push back on?”**

### Methodology core (quick reference)

| Area | Pointers |
|------|----------|
| Author types | Specialist · Cross trainer · Survivor · The called — top expert not required |
| Usability | Scroll 60%+ (excellent 85%+), reads ~30–35%. >10% drop on a block — investigate |
| Avoid | Tech without detail; video instead of text; marketing without downsides; “discovering America”; factual errors; absolutism; politics/gender/religion |
| Timing | Topic beats slot (~20% day, ~39% week). Friday evening — entertainment |
| Comments | Respect opponents; no personal attacks; 10 min pause when emotional; thank for corrections |

### Deep reference (17 chapters)

| # | File | Topic |
|---|------|-------|
| 1 | [ch01-seven-benefits](chapters/ch01-seven-benefits.md) | Why write on Habr |
| 2 | [ch02-barriers](chapters/ch02-barriers.md) | Entry barriers |
| 3 | [ch03-habr-metrics](chapters/ch03-habr-metrics.md) | Karma, metrics |
| 4 | [ch04-topics](chapters/ch04-topics.md) | Hit topics and genres |
| 5 | [ch05-text-work](chapters/ch05-text-work.md) | Mainpointschema, formats |
| 6 | [ch06-images](chapters/ch06-images.md) | Images |
| 7 | [ch07-usability](chapters/ch07-usability.md) | Text usability |
| 8 | [ch08-presentation](chapters/ch08-presentation.md) | Title, lead, KDPV |
| 9 | [ch09-donts](chapters/ch09-donts.md) | Anti-patterns |
| 10 | [ch10-timing](chapters/ch10-timing.md) | Publish timing |
| 11–14 | ch11–ch14 | Corporate blog |
| 15 | [ch15-comments](chapters/ch15-comments.md) | Comments |
| 16 | [ch16-platforms](chapters/ch16-platforms.md) | Other platforms |
| 17 | [ch17-hit-analysis](chapters/ch17-hit-analysis.md) | Hit post analysis |

Also: [glossary.md](glossary.md) · [patterns.md](patterns.md) · [cheatsheet.md](cheatsheet.md) · [references/principles.md](references/principles.md)

### Trust boundary

See [references/trust-boundary.md](references/trust-boundary.md). No network calls during the workflow. Write only to user-requested draft paths and the local `drive-list.md` copy.

### Folder layout

```
article-to-habr/
├── SKILL.md
├── drive-list.md          # user's topic backlog (editable)
├── README.md
├── cheatsheet.md | glossary.md | patterns.md
├── assets/checklist.md
├── references/
└── chapters/              # ch01–ch17
```

Use files from this skill folder when executing. Do not invent Habr rules outside the bundled references.
