# XYF EasyCode

[简体中文](README.zh-CN.md)

**Make VibeCoding easier to guide. Keep the code aligned with the user's requirements.**

XYF EasyCode improves the conversation between people and coding agents. It makes software architecture and interfaces visible and editable, then uses the agreed architecture to guide implementation, testing, and review. Inspect modules, dependencies, method inputs and outputs, events, and expected behavior before the agent writes code.

It is an installable Agent Skill with a bundled architecture editor. It works with Codex, Claude Code, OpenCode, and other agents that read `SKILL.md`. Its workflow ties implementation to the agreed design through document checks, tests, and code review.

## Install by asking your agent

Open your target project and send:

> Install the xyf-easycode skill from https://github.com/jecyxyf/xyf-easycode into this project. Read the repository's INSTALL.md and follow it for your agent.

The agent downloads the repository, runs the installer, and verifies the files. The complete bundle includes all subskills, templates, and editor tools. Installation does not change your application or start a server.

See [INSTALL.md](INSTALL.md) for the agent-facing procedure. The prepared files must be available on the GitHub branch or version you install from.

## Install from a checkout

### Required dependency: Node.js 22+

**Node.js 22 or later is required for both the installer and the local architecture editor.** Check it with `node --version`. No npm packages are required; you do not need to run `npm install`. Git is used to download the source checkout.

When an agent installs EasyCode, it checks Node.js first:

| Result | Installation behavior |
| --- | --- |
| Node.js 22+ is available | Continue installing the skill. |
| Node.js is missing or too old | Explain the requirement and ask whether you want to install a supported Node.js version. |
| You explicitly agree | Install Node.js for your OS, verify `node --version`, then continue installing the skill. |
| You decline or have not answered | Stop. Do not install Node.js or claim the skill is installed. |

The installing agent handles this consent step before running the Node-based installer. It may need your computer's normal installation permissions. You can also install Node.js yourself from the [official Node.js download page](https://nodejs.org/en/download), then retry.

With Node.js already available:

```sh
git clone https://github.com/jecyxyf/xyf-easycode.git
cd xyf-easycode
node scripts/install.mjs --agent codex --project /path/to/your-project
```

Replace `codex` with `claude-code` or `opencode`. For all your projects, use `--global` instead of `--project`. Use `--skills-dir /path/to/skills` for another agent's documented skill directory.

| Agent | Project installation | Global installation |
| --- | --- | --- |
| Codex | `.agents/skills/xyf-easycode/` | `~/.agents/skills/xyf-easycode/` |
| Claude Code | `.claude/skills/xyf-easycode/` | `~/.claude/skills/xyf-easycode/` |
| OpenCode | `.opencode/skills/xyf-easycode/` | `$XDG_CONFIG_HOME/opencode/skills/xyf-easycode/`, or `~/.config/opencode/skills/xyf-easycode/` |

Identical installation is a no-op. Add `--update` to update an installer-managed copy; installation stops if its files were edited. Different unmanaged skills are preserved. Reload skills or start a new session if the skill does not appear.

## Use EasyCode

> Use xyf-easycode to clarify my requirements, show me the software architecture and interfaces, and implement the agreed design.

| Stage | What happens |
| --- | --- |
| Agree on requirements | Establish the goal, scope, constraints, and expected behavior. |
| Visualize architecture | Maintain the architecture and open its editable local webpage. |
| Implement the agreement | Build in dependency order and test the documented interfaces and behavior. |
| Check the documents | Compare actual code with the agreed architecture and report evidence. |
| Review changes | Find regressions, fix authorized issues, and report actual verification. |

You can request one stage: visualize an existing codebase, update architecture, compare code with documents, or review a change. Valid confirmed decisions and checks are reused. Implementation must not silently simplify the design or rewrite architecture to hide a mismatch.

## Architecture editor

The bundled editor runs locally with Node.js. The agent deploys it when architecture work is requested. Its JSON is the shared agreement between the user and agent.

- Default configuration: `docs/archfiy/archify.json`. The spelling `archfiy` is retained for compatibility. Existing projects using `docs/archify/` keep that location.
- The deployed `ReadMe.md` records the actual local URL, random five-digit port, and restart command.
- Save / Ctrl+S writes to the same JSON. Save As downloads a copy. An HTML snapshot shares a view without saving the configuration.
- External changes are detected; conflicting unsaved edits are preserved and reported.
- Before creating a new architecture webpage, the skill first asks which language to use. The bundled `xyf-web-language` skill translates `tools/` before deployment, preserving English names. Any natural language can be requested; new architecture descriptions follow that choice. Existing project data is translated only when requested.
- The optional Chinese-to-English name translation button sends the selected name to MyMemory. Ordinary local editing and saving do not use that service.

See the [editor documentation](.agents/skills/xyf-easycode/tools/README.md) for deployment commands.

## Repository layout

```text
.agents/skills/xyf-easycode/   Complete portable skill bundle
  SKILL.md                   Workflow and routing
  subskills/                 Design, architecture, coding, checks, review
  tools/                     Editor, data model, server and deployment
scripts/install.mjs          Cross-platform installer
scripts/check.mjs            Bundle and repository checks
INSTALL.md                   Agent-facing installation procedure
README.zh-CN.md              Chinese project documentation
```

## Development

```sh
npm run check
npm test
npm run build
```

Checks validate the bundle, local documentation links, data format, and JavaScript syntax. Tests exercise installation, updates, editor deployment, loading, saving, and conflicts. Tests and temporary files stay under `docs/archify/test/`; temporary output is ignored by Git. Browser checks are reported separately from API tests.

Installation paths follow the official [Codex](https://developers.openai.com/codex/skills/), [Claude Code](https://code.claude.com/docs/en/skills), and [OpenCode](https://opencode.ai/docs/skills/) documentation.
