# Portfolio memory search

Read-only search — without writes or on user request.

1. Resolve `GLOBAL_MEMORY_ROOT` ([preflight-protocol.md](preflight-protocol.md) §1.5).
2. Search: `rg -i "<query>"` over `GLOBAL_MEMORY_ROOT/MEMORY.md`, `GLOBAL_MEMORY_ROOT/memory`, `GLOBAL_MEMORY_ROOT/memory/wiki` (or `Select-String` on Windows, see [global-memory.md](global-memory.md)).
3. Open `memory/wiki/projects-registry.md` → `local_path`, `git_remote`, `project_memory`.
4. If needed read `MEMORY.md` of found project.
5. Answer: file, summary, `last_verified` / verified | advisory | unknown.
