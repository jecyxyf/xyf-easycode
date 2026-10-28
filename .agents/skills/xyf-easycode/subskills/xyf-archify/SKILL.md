---
name: xyf-archify
description: Generate or maintain EasyCode architecture from agreed requirements or actual source and deploy its editable local webpage. Use for architecture work; application implementation and tests belong to xyf-code.
---

# XYF Archify

Understand -> execute -> check: establish evidence/scope, verify content, lay out from top to bottom, validate data, and deploy the editor. Complete architecture work in the current agent without extra agents. Do not write, change or test application code here; use [xyf-code](../xyf-code/SKILL.md).

## Establish the evidence

For a new architecture webpage that will be deployed, the first user question must be **"Which language should the architecture webpage use?"**, asked in the conversation language before other requirements/scope questions. Accept any natural language and wait for the answer. Reuse an explicit answer passed by the entry skill or already supplied for this task; do not ask twice or infer a language from the current templates. Carry the answer into new architecture display names and descriptive content, and invoke [xyf-web-language](../xyf-web-language/SKILL.md) before deployment. Data-only work does not require a webpage-language question. Existing-page maintenance follows the page's recorded language unless the user requests a change.

Identify the actual project, requested scope, current configuration and authorization; read project rules and reuse valid session decisions. Preserve stable IDs, user changes, layout and out-of-scope content. Resolve known unsaved webpage edits before replacing data. Do not overwrite current data with a stale snapshot or tool template, or treat an empty file in a new directory as the existing baseline.

| Project | Required evidence |
| --- | --- |
| No implementation | Use bundled [brainstorming](../brainstorming/SKILL.md) to confirm goals, functions, layers, modules and interfaces, then write the agreed configuration |
| Existing code | Trace actual entries, registration, calls, data flow, reads/writes, conditions and outputs before choosing boundaries/layout |

Architecture-only discussion does not require separate specification/plan files, application code, business tests or automatic Git commits. Reuse already confirmed design. Source-derived architecture records facts, not proposals, names guessed from filenames, or ideal behavior. Distinguish callers, actual executors, data recipients/storage, optional capabilities and normal paths.

### Limit analysis before searching

Prefer the user-specified business-source path. Otherwise inspect top-level build/startup/project references to locate owned source. Verify `repository.path`; do not default to the whole repository, current directory, or skill installation.

Before deep reads, give a short table of included business source, relevant owned tests/configuration, and exclusions. Apply boundaries before file enumeration/search, not after a whole-repository scan. Exclude agent/skill configuration (`.agents/`, `.codex/`, `.claude/`, skill packages), auxiliary tools/scripts/templates, third-party code (`node_modules/`, `vendor/`, `third_party/`, `.venv/`), Git data, generated build files, caches/logs, and generated architecture webpages. Existing architecture may be read as a maintenance baseline.

Read only necessary execution rules, model and template guidance as tools, not business implementation. Analyze a tool/skill/dependency itself only when explicitly requested as the target. Do not bypass exclusions through hidden-file scans, symlinks or call tracing. Follow external dependencies to owned call sites only; record visible names/arguments/handling without inventing internals or library modules. Owned multipackage business source remains eligible. If source cannot be identified, ask for the missing path; do not use tooling to fill the architecture.

## Paths and model

The installed skill root is two levels above this file's directory. Shared `tools/` is under that root. Run the following `tools/` commands from the installed root with actual project/configuration paths.

| Location | Role |
| --- | --- |
| `<project>/docs/archfiy/archify.json` | Current project architecture |
| `<project>/docs/archfiy/index.html` | Generated editor |
| `<project>/docs/archfiy/html/` | Server and maintenance tools |
| `<project>/docs/archfiy/ReadMe.md` | Live URL, port and restart command |
| [tools README](../../tools/README.md) | Deployment/use |
| [model.js](../../tools/html/assets/model.js) | Authoritative fields and create/update/validate functions, formatVersion 1 |
| [data guide](../../tools/html/templates/archifytemplate.template.jsonc) | Complete persistent-field explanation |

Keep the intentional `docs/archfiy/` spelling and `archify.json` filename. User paths and existing `docs/archify/` deployments take precedence. Resolve conflicting real configurations before writing. Empty templates and example data are not requirements.

Template pairs: [canvas guide](../../tools/html/templates/canvas.template.html) / [skeleton](../../tools/html/templates/canvas.html), [module guide](../../tools/html/templates/module-node.template.html) / [skeleton](../../tools/html/templates/module-node.html), [group guide](../../tools/html/templates/group-layer.template.html) / [skeleton](../../tools/html/templates/group-layer.html), [data skeleton](../../tools/html/templates/archifytemplate.json).

## Build or maintain content

Every formal item must match confirmed design or actual source. Resolve doubts before generating/replacing formal data or deploying; do not omit doubtful content and claim completeness. Only use empty arrays/strings/omitted optional fields after confirming absence or non-applicability. Keep `unknowns: []` only after its questions are resolved.

- `planned`: confirmed design awaiting implementation, not a guess.
- `verified`: matches actual source with evidence, not a business-test pass.
- `modified`: verified content changed semantically; reverify for delivery or confirm it as planned design. A status edit cannot replace verification.
- All formal methods require complete checked inputs/outputs and both confirmation flags true. Empty arrays mean confirmed absence only.

Understand responsibilities and real relationships first, then choose modules/layers, then layout. Do not map one file/function mechanically to one module or preselect fixed counts. Preserve actual code identifiers in source mode. Use the selected webpage language for new display names and descriptive content; keep English names in English. The editor's visible controls and default content must use the same language after xyf-web-language completes.

For every scoped module cover all names/purpose/language/code locations/group; requirements and important conditions; explicit `dependencies` string array (one confirmed requirement per entry, [] only for confirmed absence); public parameters including types/defaults/required flags; structures and every field; every `interfaces` method including purpose, all inputs/outputs, multiline flow/errors; events including direction/payload/flow; test steps/outcomes; actual sources and status. Do not sample a few representative methods. Source mode records existing test meanings, design mode confirmed acceptance tests. Do not create/run business tests.

Sources must be actually read repository-relative files, 1-based `line`, optional `endLine` and `symbol`. `codeLocation` separately stores code-root-relative locations, newline-separated when multiple. Record actual Git revision and whole-repository dirty state. Modified/untracked/ignored sources need difference evidence or hashes; commit alone is insufficient. Do not invent revision data for non-Git projects.

Create directed `relations` from confirmed relationships; source-mode arrows need actual calls/imports/event wiring/read-write evidence. Never depict indirect calls as direct writes. Canvas annotations do not replace explicit dependencies. Lay layers out top to bottom; place close collaborators nearby, estimate node height from content, and allow room for readable arrows/labels. Preserve reverse calls/callbacks and out-of-scope layout. Group bounds are calculated; do not add unsupported size/routing fields. Rearrange the whole existing canvas only when requested.

## Validate and save

Use `globalThis.EasyCode.Model`. New objects use createProject/createModule/createInterface and corresponding parameter/structure/field/event/test constructors, then replace default example content with facts. Use updateModule/updateInterface/updateMember/updateRelation for semantic edits. IDs are globally unique and survive renames; remove invalid references on deletion. Flow/errors are strings; defaultValue is a string.

Check source -> architecture omissions and architecture -> evidence for every item. Validate completeness, actual conditions, boundaries, no unknown placeholders, retained IDs/user content, and no Model.validate errors. Handle each warning without fabricating data.

[ProjectFile.parse/stringify](../../tools/html/assets/project-file.js) parses/generates data without execution. Formal configuration is strict JSON, two-space indentation and final newline, no assignments/comments/functions/`__proto__`. Record original contents/hash, check again before writing, resolve conflicts, then parse, validate and deeply compare saved data. [files.mjs](../../tools/html/scripts/files.mjs) exposes readProjectFile/writeProjectFile and expectedVersion.

## Deploy the editor

After complete configuration validation, deploy unless the user requested data only. Configuration-only maintenance does not require redeploying programs or rebuilding the entry.

1. Inspect the actual deployment, preserving existing JSON and webpage customization.
   For a new page, use the language obtained by the first question and complete [xyf-web-language](../xyf-web-language/SKILL.md) on the installed `tools/` before running the deployment command. Pass the selected language and actual tools path; wait for its rebuilt/verified result. Read an existing page's `<html lang>` marker before maintenance or regeneration and ensure the tools match that language. Do not overwrite an existing translated page with tools in another language.
2. From the installed skill root:

   ```sh
   node tools/html/scripts/deploy.mjs "<project-root>" --output-dir docs/archfiy --source-file "<verified-archify.json>"
   ```

3. Node.js 22+ builds the entry, deploys html/, and starts local HTTP on an available random port 10000-65535. Keep the command alive through the agent's persistent terminal. Verify/reuse an existing same-directory service. If Node is missing/old, explain the requirement and ask before installing/upgrading it; continue only after explicit consent and a successful version check. Do not claim a file path is a live page.
4. Successful startup updates ReadMe.md with actual URL/port/data and `node html/server.mjs` restart instructions from the deployment directory, preserving notes outside the generated section. Restart can change the port. Ctrl+C stops the server. Explicit --port must be five digits. --no-start means no running service. --mode local is for explicitly requested manual JSON loading only.

The HTTP page loads the same archify.json automatically. Save/Ctrl+S checks version, writes and reads back. External changes are polled around every two seconds: clean pages reload; dirty edits/open dialogs are preserved with a notice. Refresh/reopen/restart still reads the same file. Save As downloads a copy without rebinding; imports reach disk only after Save; HTML snapshots do not prove a save. Failed operations retain current edits.

After editor-source/template changes, run `node tools/html/scripts/build.mjs --runtime`. Standalone snapshots use `build.mjs <JSON> <export.html>` and must not replace the editor entry.

For targeted edits, locate by stable ID, owner and kind, not repeated display names. Name translation changes only the specified englishName and applicable status. Retain actual source identifiers; confirmed requested code renames remain planned until implemented, without changing business code here. [translation.js](../../tools/html/assets/translation.js) formatName formats identifiers, not meaning.

Recover live data from the actual JSON. Explicit HTML snapshots may be parsed with [Serialization.readProject](../../tools/html/assets/serialization.js) without script execution. Verify completeness/evidence and destination version before saving, preserving IDs/fields; do not overwrite current design from old snapshots.

## Check and deliver

Check data, model, scoped differences and saved readback. Run `node tools/html/scripts/check.mjs "<deployment>/index.html"` and `node tools/html/scripts/check.mjs --url "<actual-url>"`; compare API, disk and ReadMe.

Open the actual HTTP page. Verify automatic loading, complete modules/layers/arrows, top-to-bottom layers, no overlaps, readable labels/directions, usable initial view. Actually edit/save/refresh or reopen to confirm the same JSON. API checks cannot replace browser checks; report missing browser verification honestly. Fix layout by positions/ports, not deleting necessary content.

Use an isolated temporary project for saves, restart, external updates, dirty conflicts, imports and malformed JSON. Do not put test records into the formal architecture or test directories into the skill bundle. Verify five-digit ports and ReadMe after restart. Resolve failures without substituting stale outputs.

Deliver a short table of absolute configuration/editor/ReadMe paths, actual URL/port, scope, source revision/workspace differences and checks actually run. Separate data, source, service and page results. If essential facts remain unresolved, preserve originals and report the specific blocker rather than delivering incomplete formal architecture.
