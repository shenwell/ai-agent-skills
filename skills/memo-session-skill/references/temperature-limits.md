# Temperature limits (memory compaction)

Thresholds **do not block** the pipeline alone. On exceed add **`Memory hygiene`** block — automatic **memory compaction**: demote HOT→WARM, promote WARM→wiki, compress index.

## Project limits

| Layer | Place | Limit | On exceed |
|-------|-------|-------|-----------|
| Index | `MEMORY.md` | ≤200 lines | compress; details → wiki |
| HOT | `memory/hot-cache.md` | ≤80 lines | demote → `warm-cache` or link + wiki |
| WARM | `memory/warm-cache.md` | ≤120 lines | promote → wiki; compress bullets |
| Open loops | `memory/open-loops.md` | ≤120 lines | close resolved; context → warm or wiki |
| Decisions | `memory/decisions.md` | soft ≤80 | ADR to wiki `adr-*.md` |
| COLD | `WIKI_ROOT/*.md` | ~400/file soft | split into two flat pages |

## Portfolio limits (`GLOBAL_MEMORY_ROOT` only)

| Layer | Place | Limit | On exceed |
|-------|-------|-------|-----------|
| Index | `MEMORY.md` | ≤300 | compress; details → wiki |
| HOT | `memory/hot-cache.md` | ≤150 | demote → warm or wiki |
| WARM | `memory/warm-cache.md` | ≤250 | promote → wiki |
| Open loops | `memory/open-loops.md` | ≤200 | close resolved |
| Decisions | `memory/decisions.md` | ≤150 | ADR → `adr-*.md` |
| COLD | `memory/wiki/*.md` | ~700/file | split |
