# Contributing

Thanks for interest in **AI Agent Skills**.

## Add a skill

1. Create `skills/<skill-name>/SKILL.md` with Agent Skills frontmatter (`name`, `description`).
2. Keep the package self-contained under that folder (scripts, references, assets).
3. Verify discovery:

```bash
npx skills add . --list
```

4. Document the skill in the root [README.md](README.md) (one pain line + link).
5. Open a PR against `main`.

### Description / discovery

Follow the portfolio checklist for public skill `description` (pain first, Use when quotes, Prefer / Do not use). After merge:

```bash
npx skills add shenwell/ai-agent-skills --skill <skill-name> -g
```

Installs via `npx skills add` (default branch) are what [skills.sh](https://skills.sh) counts — not git clone.

## Scope

- Prefer lean root: `README`, `LICENSE`, `skills/`.
- Do not commit secrets, `.env`, or local `.cursor/` workspace junk.
- Review any new `scripts/` for safety before merge.

## License

By contributing you agree your changes are licensed under the MIT License.
