# Install XYF EasyCode

Follow this procedure when asked to install `xyf-easycode`. Install the **whole** `.agents/skills/xyf-easycode/` directory, including `subskills/` and `tools/`. Copying only `SKILL.md` leaves the skill incomplete.

## Destination

Use the current user's target project and the agent you are running in. Default to project installation; global installation requires a user request. Do not infer the running agent from unrelated configuration directories.

| Agent | Installer argument | Project directory |
| --- | --- | --- |
| Codex | `--agent codex` | `.agents/skills/xyf-easycode/` |
| Claude Code | `--agent claude-code` | `.claude/skills/xyf-easycode/` |
| OpenCode | `--agent opencode` | `.opencode/skills/xyf-easycode/` |
| Another client | `--skills-dir <documented-skills-directory>` | Supplied directory, followed by `xyf-easycode/` |

Resolve the actual project from the session. Respect project rules and existing authorization. Ask only if a necessary target, agent, or permission is unknown.

## Obtain the source

1. Run `node --version` and check Git. Node.js 22+ is required for both this installer and the editor; no npm packages are needed. If Node is missing or older than 22, tell the user and ask: **"EasyCode needs Node.js 22 or later. May I install a supported Node.js version on this computer, then continue installing EasyCode?"** Obtain an explicit answer using your agent's user-input tool or conversation. **A pending question, silence, or the original request to install the skill is not permission to install Node.js.**
2. Only after the user agrees, install a supported Node.js release using the [official Node.js download/install instructions](https://nodejs.org/en/download) for the actual OS and architecture. Explain the chosen method and preserve existing user configuration. Respect normal OS/agent permission prompts. If the user declines, has not answered, or installation fails, stop dependent work and report the status without claiming installation succeeded. Open a fresh shell or refresh the process PATH as appropriate, run `node --version` again, and continue only when it reports 22 or later. Do not uninstall an existing Node version or change unrelated settings to bypass a failure. If Git is absent, obtain permission for its installation or use the agent's available archive-download tools to obtain the same requested source; do not silently install another tool.
3. Use a matching existing checkout, or clone `https://github.com/jecyxyf/xyf-easycode.git` into a fresh temporary directory. Preserve a requested branch, tag, or commit; do not silently substitute `main`.
4. Read this file from the checkout before running its installer. Use absolute paths in actual commands.

```sh
git clone --depth 1 https://github.com/jecyxyf/xyf-easycode.git <temporary-checkout>
```

## Install and verify

For the current project:

```sh
node <checkout>/scripts/install.mjs --agent codex --project <target-project>
```

For global installation explicitly requested by the user:

```sh
node <checkout>/scripts/install.mjs --agent codex --global
```

Replace `codex` with the running agent from the table. For another client, use `--skills-dir` instead of `--agent`, `--project`, or `--global`.

The installer checks the complete bundle and verifies SHA-256 hashes after copying. An identical installation makes no changes. Different existing files are preserved. `--update` only updates an installer-managed copy whose files still match its recorded hashes. Never delete an existing skill to bypass a conflict.

Verify without writing:

```sh
node <checkout>/scripts/install.mjs --agent codex --project <target-project> --check
```

Report the actual path and verification result. Suggest reloading skills or starting a new session if discovery needs it. Do not claim another agent loaded the skill unless it was actually run.

## After installation

Read the installed `SKILL.md` when the user requests EasyCode. Resolve all bundled references relative to that file. No other skill package, npm dependencies, or cloud service is required for ordinary use.

Installation does not authorize application development or create an architecture. For architecture work, follow the bundled `subskills/xyf-archify/SKILL.md` to maintain the real project configuration and deploy its editor. Preserve existing architecture, stable IDs, and unsaved edits.
