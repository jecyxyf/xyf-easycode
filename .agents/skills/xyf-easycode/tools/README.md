# Architecture editor tools

Requires **Node.js 22+**. No npm dependencies or `npm install` are needed. Check with `node --version`. If Node is missing or too old, the installing agent must explain the requirement, ask whether to install a supported release, and wait for explicit consent. Only after successful installation/version verification may dependent work continue. Refusal or silence means stop; see the repository INSTALL.md and https://nodejs.org/en/download.

## Deploy and access

Run from this `tools/` directory:

```sh
node html/scripts/deploy.mjs "<project-root>" --source-file "<verified-archify.json>"
```

Default output: `<project>/docs/archfiy/` (intentional compatibility spelling). User paths and existing `docs/archify/` deployments take precedence.

```text
docs/archfiy/
  index.html    Editor with scripts, styles and templates embedded
  archify.json  Single current configuration
  ReadMe.md     Actual live URL, port and restart command
  html/         Server and maintenance tools
```

The local HTTP server picks an available random five-digit port in 10000-65535 and stays running in the terminal. Keep it available through the agent's persistent-terminal mechanism; Ctrl+C stops it. Restart from the deployment directory with `node html/server.mjs`. A successful start updates ReadMe.md while preserving notes outside its generated section; the port may change on restart.

| Option | Purpose |
| --- | --- |
| `--output-dir docs/archfiy` | Project-relative deployment directory |
| `--source-file <JSON>` | Verified source; stop if target data differs |
| `--port <five-digit-port>` | Explicit instead of random port |
| `--no-start` | Generate files without claiming a live server |
| `--mode local` | Explicit manual JSON loading, without a server |

Preserve existing target JSON. Without source/existing data, the tool creates an empty framework with a new project ID, not a verified business architecture. Legacy archify.js without verified JSON stops deployment. Never replace existing project data with the tool template.

## Edit and save

| Operation | Result |
| --- | --- |
| Open the HTTP address | Automatically load deployed archify.json |
| Save / Ctrl+S | Check version, write the same JSON, read back and compare |
| Refresh/reopen/restart | Read the same JSON |
| Save As / Ctrl+Shift+S | Download a copy, without rebinding the server file |
| Load configuration | Replace page content; Save writes it to disk |
| HTML snapshot | Share a standalone view, without saving configuration |
| Failure/conflict | Preserve edits and explain the error |

External changes are checked about every two seconds. Clean pages reload; dirty edits/open dialogs are preserved with a notice. Background pages may poll later. Version checks are not cross-process locks. The optional Chinese-to-English name button sends the selected name to MyMemory; normal local editing/saving needs no external service. English defaults do not translate user-supplied project data.

## Maintain

`html/assets/project-file.js` parses/serializes without execution; `model.js` validates data. Formal JSON has two-space indentation and a final newline, no script assignments/comments/functions/`__proto__`. Preserve stable IDs, fields, layout and model version. Check original contents/hash before writing, then parse/validate/deeply compare saved data. `html/scripts/files.mjs` provides readProjectFile/writeProjectFile with expectedVersion conflict checks.

```sh
node html/scripts/build.mjs --runtime
node html/scripts/check.mjs archify.json
node html/scripts/check.mjs index.html
node html/scripts/check.mjs --url "<actual-HTTP-URL>"
node html/scripts/build.mjs archify.json archify-export.html
```

Rebuild the entry after source/template changes. Snapshots cannot overwrite index.html. Templates have guidance/skeleton pairs for canvas, module, group and data. `*.template.html` and `archifytemplate.template.jsonc` are guides; comments/examples are not formal project facts.

Verify automatic loading, layout, edits, saves, refresh, restart, external conflicts, imports, malformed JSON and error messages through a real HTTP page in an isolated temporary project. API checks do not replace browser checks. Do not put test directories into the skill bundle or test data into formal architecture.
