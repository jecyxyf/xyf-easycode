# Install XYF EasyCode

Install **all six skill directories inside `skills/`** into the target agent's skill directory. Keep them as siblings and copy their complete contents. Skills refer to each other and share `xyf-easycode-install/html/`.

Installation is a file copy. No installer, Node.js, npm packages, build step, or server is required.

## Choose the destination

Use the user's target project and the agent running the task. Default to project installation; use a global skill location only when the user requests it. Resolve the destination from that agent's documentation or current configuration.

| Agent | Project skill directory |
| --- | --- |
| Codex | `.agents/skills/` |
| Claude Code | `.claude/skills/` |
| OpenCode | `.opencode/skills/` |
| Another client | Its documented skill directory. |

These installation locations are separate from this repository's `skills/` source directory. Check the installed version's official [Codex](https://developers.openai.com/codex/skills/), [Claude Code](https://code.claude.com/docs/en/skills), or [OpenCode](https://opencode.ai/docs/skills/) documentation. Respect project rules and existing authorization; ask only when a necessary target or choice is unknown.

## Copy the skills

1. Use a matching existing checkout, or download the requested version of `https://github.com/jecyxyf/xyf-easycode`. Preserve a requested branch, tag, or commit. Read this file from that version.
2. Compare existing destination directories before copying. Keep identical files; preserve local changes and resolve differences before replacing files. Do not delete existing skills to bypass a conflict.
3. Copy each directory below into the chosen skill directory, keeping all nested files. Copy the six directories themselves, without adding another `skills/` layer.

```text
<agent-skill-directory>/
├── xyf-easycode/
├── xyf-easycode-install/
├── xyf-archify/
├── xyf-archifycheck/
├── xyf-code/
└── review-agent/
```

Do not copy the repository's `AGENTS.md` into the target project as part of skill installation; it describes work on this repository.

## Verify the installation

| Check | Expected result |
| --- | --- |
| Skill entries | All six directories contain their `SKILL.md`. |
| File copy | Installed contents match the chosen source version, apart from explicitly preserved local changes. |
| Shared resources | `xyf-easycode-install/html/` is complete. |
| Relative links | Links resolve to installed sibling skills and shared resources. |
| Agent discovery | Reload skills or start a new session as needed, then verify the available skills. |

Report the actual directory and checks performed. File checks do not prove that a client loaded or executed a skill. Do not claim support for an untested agent or version. Some workflows require independent agents or other tools; report unavailable capabilities rather than claiming those stages succeeded.

## After installation

Use [xyf-easycode](skills/xyf-easycode/SKILL.md) as the main entry. In the installed copy, read `<agent-skill-directory>/xyf-easycode/SKILL.md` and resolve links relative to each file.

For architecture work, follow [xyf-archify](skills/xyf-archify/SKILL.md). For webpage deployment, use [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md) to copy the contents of `xyf-easycode-install/html/` into the project's `docs/xyf-easycode/html/` directory. In an existing deployment, add only missing files and preserve architecture data, language settings, and customizations. Double-click `docs/xyf-easycode/html/index.html`; it loads `language.js` and `software_architecture.js` from the same directory and defaults to Chinese for a new deployment.

Installing skills does not itself start application development or replace project architecture. See the [editor documentation](skills/xyf-easycode-install/html/README.md) for language and saving behavior.
