# Template: "Agent memory" block in project AGENTS.md

Insert into the project repository `AGENTS.md` (5–10 lines). **Do not** copy `memo-session-skill` here.

```markdown
## Agent memory

**Project:** `MEMORY.md` → `memory/hot-cache.md` → as needed `warm-cache`, `open-loops`, `decisions` → `memory/wiki/`.

**Portfolio (optional):** if configured below, read `GLOBAL_MEMORY_ROOT/MEMORY.md` → `memory/hot-cache.md` → `memory/wiki/projects-registry.md`.

On memo-session: update project memory; facts with `scope: portfolio` go to portfolio (no duplicate paragraphs in project hot-cache).

New files to ingest: drop in `memory/inbox/`, then `/inbox`.

GLOBAL_MEMORY_ROOT: <path-to-your-portfolio-memory-repo>
```

Replace `<path-to-your-portfolio-memory-repo>` with a path on **your** machine (e.g. `~/portfolio-memory`). Omit the line entirely if you do not use portfolio memory.

After insertion, the first memo-session run checks for this block in Preflight §1.6.
