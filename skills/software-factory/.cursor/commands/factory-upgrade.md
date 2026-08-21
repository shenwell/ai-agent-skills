# /factory-upgrade

Read `factory.config.json`, then `.cursor/skills/factory-upgrade/SKILL.md`. Read `factory/brain.md` if it exists.

Upgrade the factory kit files in this workspace from the upstream kit repository. You are the orchestrator only: fetch the kit, copy or merge files, show a diff summary. Do not start a pipeline station. Do not change product code unless a merge conflict requires a human choice.

Honor `policy.*` for commit, push, and pull request after the upgrade. Never push to the default branch.

When the workspace **is** the kit repo (`origin` matches `setup.kitRepo`), tell the user to `git pull` on `main` instead of copying from a second clone, unless they explicitly asked to sync from a fork or another ref.

Summarize what was updated, what was preserved, and the next step (`/factory-setup` to re-check, or review `git diff` and merge the upgrade branch).
