---
description: Process memory/inbox — wiki extract, archive originals, delete tickets
---

# /inbox

Immediately process every item in `memory/inbox/` except `README.md`.

This is the **memo-session-skill** inbox pipeline. Do not ask for a long intake prompt.

1. Read `references/inbox-protocol.md` from the installed skill (`~/.cursor/skills/memo-session-skill` or `~/.agents/skills/memo-session-skill`).
2. Run preflight (creates `memory/inbox/` if missing).
3. Follow the inbox protocol. If the project has `memory/meta/intake-workflow.md` or `memory/meta/wiki-style.md`, apply those extras.
4. Skip session wrap-up digest unless the user also asked to wrap up.

If the queue is empty, say so and stop. Stop for confirmation only on hard conflict (secrets, canon contradiction).
