---
name: xyf-archifycheck
description: Read-only verification of actual code against an EasyCode architecture or specified requirements/interfaces. Report differences and evidence; use xyf-code for authorized repairs.
---

# XYF ArchifyCheck

Perform the comparison in the current agent. Do not modify code, architecture, or documents.

## Establish scope

Reuse specified project/document/module scope and authorization. Without a module limit, cover all documented modules. Default: `<project>/docs/archfiy/archify.json`, or existing `docs/archify/archify.json`; resolve competing baselines. Never use a tool template, example, or stale snapshot as project requirements.

Read project rules. Verify source roots/entries rather than trusting `repository.path`, `codeLocation`, or `sources`. Locate owned source from build/startup configuration as needed. Exclude skills, third-party implementations, caches, and generated pages unless explicitly targeted. Record document hashes/version and actual source version/uncommitted differences. A commit alone does not establish current content. Recheck changed evidence.

Parse JSON with [ProjectFile.parse](../../tools/html/assets/project-file.js) and check [Model.validate](../../tools/html/assets/model.js); see the [data guide](../../tools/html/templates/archifytemplate.template.jsonc). Do not fill defaults, change state, or write back. Other documents retain their actual sections/clauses/interfaces. Mark missing/empty/contradictory/ambiguous requirements `Cannot confirm`; continue unaffected checks and ask only essential questions.

## Verify every item

List scoped modules, members, and requirements. Trace entry/registration/calls to actual execution, reads/writes, and returns. Matching names/comments or a visible button do not prove conformance. Batch large work without claiming sampled coverage is complete.

| Contract | Check |
| --- | --- |
| Function/requirements | Normal paths, important conditions, results and side effects; no empty/fake implementation |
| Layer/language/location | Explicit contracts, without imposing absent conventions |
| Dependencies | Explicit requirements backed by imports/calls/registration/runtime prerequisites |
| Parameters/structures/input/output | Public names, fields, types, required flags, documented defaults and returns |
| Method flow/errors | Real steps/order/branches/error handling, not comments alone |
| Events | Direction, name, payload, flow and wiring |
| Tests | Required steps/outcomes covered; distinguish static reading, actual runs and gaps |

Methods remain in `interfaces`. False input/output confirmation flags do not mean empty contracts are confirmed. Missing/empty `defaultValue` means no documented default, not zero/false/empty string. `verified` is not a business test pass. `relations` annotate the canvas; dependencies come from explicit requirements and actual source. Unconstrained internal helpers/behavior are not automatically violations. Before alleging missing implementation, inspect registration, callers and alternate execution paths. Distinguish insufficient evidence from defects.

## Boundary and report

Default to static read-only work: no installs, builds, tests, server startup or report-file writes. Existing task authorization for runtime checks remains valid; use project tools/rules and record actual commands/results/coverage. Do not count historical, simulated, or unrun checks as current passes.

Do not erase differences by changing code/documents. Requested repairs route to [xyf-code](../xyf-code/SKILL.md); confirmed architecture changes to [xyf-archify](../xyf-archify/SKILL.md).

Report scope/key findings, then a table of requirement, document location, source evidence, result, and difference/action. Results: `Conforms`, `Does not conform`, `Cannot confirm`, with file paths/lines and stable IDs. State static/runtime evidence. Any demonstrated mismatch means overall `Does not conform`; otherwise missing evidence/coverage means `Cannot confirm`. Only complete supported coverage permits `Conforms`. List unexamined modules, unrun tests, and blockers separately. Static conformance is not runtime acceptance.
