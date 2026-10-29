# XYF EasyCode

[简体中文](README.zh-CN.md)

**Make VibeCoding easier to guide. Keep the code aligned with the user's requirements.**

XYF EasyCode makes software architecture and interfaces visible and editable, then uses the agreed architecture to guide implementation, testing, and review. Inspect modules, dependencies, method inputs and outputs, events, and expected behavior before the agent writes code.

The repository contains six Agent Skills and a standalone architecture editor. Skills are stored side by side under `skills/`. Support depends on the agent's skill discovery, file access, tools, and delegation capabilities; reading `SKILL.md` alone does not guarantee every workflow will run.

## Install

Open your target project and ask your agent:

> Install the EasyCode skills from https://github.com/jecyxyf/xyf-easycode into this project. Read the repository's INSTALL.md and follow it for your agent.

To install manually, download the requested repository version and copy **all six directories inside `skills/`** into the target agent's skill directory. Keep their names, sibling layout, and complete contents, including `xyf-easycode-install/html/`.

| Agent | Project skill directory |
| --- | --- |
| Codex | `.agents/skills/` |
| Claude Code | `.claude/skills/` |
| OpenCode | `.opencode/skills/` |
| Other agents | Use the location documented for that agent. |

The repository's `skills/` is the source layout; installation locations depend on the agent and version. Preserve existing local changes when updating. Reload skills or start a new session if needed. Installation and the editor require no Node.js, npm packages, build command, or local server. See [INSTALL.md](INSTALL.md).

## Use EasyCode

> Use xyf-easycode to clarify my requirements, show me the software architecture and interfaces, and implement the agreed design.

| Stage | What happens |
| --- | --- |
| Agree on requirements | Establish the goal, scope, constraints, and expected behavior. |
| Visualize architecture | Maintain the architecture and open its editable local webpage. |
| Implement the agreement | Build in dependency order and test documented behavior. |
| Check the documents | Compare actual code with the agreed architecture and report evidence. |
| Review changes | Find regressions, fix authorized issues, and report actual verification. |

You can request one stage. Valid confirmed decisions and checks are reused. Implementation must not silently simplify the design or rewrite architecture to hide a mismatch. Workflows requiring independent agents need that capability; unavailable stages must be reported rather than claimed as complete.

## Architecture editor

Double-click [index.html](skills/xyf-easycode-install/html/index.html) to use the bundled editor. For a project, use [xyf-easycode-install](skills/xyf-easycode-install/SKILL.md) to copy the **contents** of `skills/xyf-easycode-install/html/` into `docs/xyf-easycode/html/`. Existing deployments receive only missing files, preserving project data, language settings, and customizations. Open `docs/xyf-easycode/html/index.html` after deployment; the default language is Chinese.

| File or directory | Purpose |
| --- | --- |
| `index.html` | Webpage entry; loads the language and architecture files. |
| `software_architecture.js` | Project data: `globalThis.softwareArchitecture = <valid JSON>;`. |
| `language.js` | Active interface language, Chinese by default. |
| `language_zh.js` / `language_eng.js` | Chinese and English language configurations. |
| `assert/` | Editor components and styles. |
| `module/` | Canvas, module, and layer templates. |

Copy `language_eng.js` over `language.js` and refresh to use English. For another language, translate the configuration's text while preserving message keys and placeholders. Existing architecture data is translated only when requested.

Save / Ctrl+S writes to the selected data file when the browser supports and grants file access. Otherwise, download a JS copy, replace `software_architecture.js`, and refresh. Saving checks for external changes and preserves unsaved edits on conflict. An HTML snapshot shares the current view without saving the original configuration. The optional name translation button uses an online service; ordinary editing and saving work offline.

See the [editor documentation](skills/xyf-easycode-install/html/README.md) for details.

## Repository layout

```text
skills/
├── xyf-easycode/          Main entry
├── xyf-easycode-install/  html/ and webpage deployment to docs/xyf-easycode/html/
├── xyf-archify/           Architecture design
├── xyf-archifycheck/      Architecture and code comparison
├── xyf-code/             Implementation workflow
└── review-agent/         Code review
AGENTS.md                 Repository collaboration rules
INSTALL.md                Installation procedure
README.md                 English documentation
README.zh-CN.md           Chinese documentation
```

When changing skills, check names, local links, and shared resources. When changing the editor, open it directly in a browser and verify the affected behavior. Report only checks actually run and identify unverified capabilities.
