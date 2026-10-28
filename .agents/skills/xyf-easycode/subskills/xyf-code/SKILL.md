---
name: xyf-code
description: Implement an agreed EasyCode architecture through dependency planning, module development, document checks, independent review, integration repairs, and delivery. Use xyf-archify for architecture design or editor deployment.
---

# XYF Code

The main agent plans, coordinates, personally verifies documents, personally reviews the complete final change, and delivers. Developers implement, test, and fix one module at a time; independent reviewers inspect module changes. Steps 2-4 may run in dependency batches. Do not mark a module complete before its checks pass.

Follow the agreed architecture without silently deleting, replacing, simplifying, or changing it. Reuse valid confirmations. Keep single-stage and read-only requests within scope.

## 1. Inspect differences and plan

Owner: main agent. Pass condition: evidenced differences/dependencies, assignable plan, required authorization.

- Read project rules, source, and build configuration. Use the confirmed actual architecture path: default `docs/archfiy/archify.json`, or existing `docs/archify/archify.json`. Resolve competing baselines; never use the tool's empty template as requirements. Report/confirm the absolute configuration path and all/selected module/member scope; reuse existing explicit confirmation.
- Personally use [xyf-archifycheck](../xyf-archifycheck/SKILL.md) in the current agent to record conformance, differences, uncertainty, schema errors and relevant warnings, without default-filling or writeback. Record document hashes, initial source state including user uncommitted edits, and review baseline. Preserve user changes.
- Pause affected work for empty architecture, conflicting requirements, invalid public names, unconfirmed input/output, or essential missing details. User confirmation may supply evidence without automatically authorizing documentation changes. Continue independent work; do not rewrite already conforming code just to create tasks.
- Order modules by stable IDs, explicit `dependencies`, public interfaces, and actual calls; `relations` are canvas annotations. Resolve unclear/cyclic dependencies and interface conflicts before declaring tasks independent. New prerequisite modules must pass steps 3/4; existing prerequisites need current usability evidence before dependent work starts.
- Present a table of module ID, difference/evidence, dependencies/order, task, owner, writable files, acceptance requirements, parallel groups, shared files and blockers. Obtain project-required batch-write authorization; delegation cannot bypass it.

Interpret the [data guide](../../tools/html/templates/archifytemplate.template.jsonc): groups/group English names describe layer directories under the code root without forcing language namespaces. Repository/language/codeLocation locate actual code; missing paths do not authorize migration. Requirements/dependencies are explicit text, not guesses from arrows. Public members are parameters, structures, `interfaces` (methods), events, and tests. Missing/empty `defaultValue` means no documented default, not zero/false/empty string. Unconfirmed empty input/output lists do not establish absence. Resolve invalid/conflicting public names, layer/path requirements, and ambiguous contracts before implementation.

## 2. Develop modules in parallel

Owner: main agent coordinates; developers implement. Pass condition: implementation and required tests pass, then the writer stops for handoff.

- Give each developer actual project/configuration paths, one module ID, requirements/differences, dependency state, allowed files, absolute test root and writable subdirectory, acceptance checks, authorization, document version and review baseline. One developer handles one module at a time.
- Architecture/key-dependency changes pause affected tasks immediately. Recheck evidence, revise plans, hand off context and invalidate affected prior passes. Do not continue against a stale design or guess historical changes.
- Parallelize only independent tasks with satisfied prerequisites. One active writer per module and per file. Handle shared files centrally or serially. Confirm the previous writer stopped before transferring ownership or starting review. Never overwrite user/other-agent edits.
- Match public names, types, documented defaults and behavior. Internal helpers may follow existing conventions. Implement each method/event flow step with a valid numbered code comment before the step. Without documented flow, choose a sequence and still add numbered comments. Reuse libraries; do not invent an event service, empty implementation, fixed fake result, or simulated completion.
- **All test entries, cases, fixtures, temporary data, caches, logs, coverage and reports must be written/run under `<project>/docs/archify/test/` and its subdirectories.** The test working directory, tool temporary directories, and test-related build/type-check outputs must also stay there. Create authorized module subdirectories for isolation. Referenced business source and reused tools may live outside. Do not migrate/delete existing tests or use them to bypass this run's directory requirement. Adapt tools within scope or report a blocker.
- Verify actual behavior against architecture tests, or confirmed requirements when tests are absent; run needed builds/type checks under the same directory rules. Report actual working directory, commands, results and gaps. Existing test files or historical passes are not current execution evidence.
- Report module ID, changed files, review scope, tests and blockers, then stop writing. Do not assume automatic hooks or self-approve acceptance. If multi-agent development/review is unavailable or prohibited, disclose the unavailable stage and obtain agreement on changed delivery requirements; never pretend delegation or independent review ran.

## 3. Main-agent document verification

Owner: main agent personally. Pass condition: complete scoped conformance without unresolved uncertainty.

Use [xyf-archifycheck](../xyf-archifycheck/SKILL.md) and personally trace requirements, dependencies, public members, inputs/outputs, flow, errors and test obligations. Matching names, passing tests or developer self-review cannot replace this check.

Remain read-only during comparison. Record module ID, document/source content versions, coverage, conclusions and file/line evidence. Checked files and relevant dependencies must not change concurrently. Return specific differences for step-2 fixes/tests and repeat affected checks. Resolve uncertainty before marking conforming. Static agreement does not replace runtime testing. Register passes in task records without writing architecture status. Only then proceed to step 4.

## 4. Independent module review

Owner: independent reviewer, coordinated by main agent. Pass condition: review completed and defects fixed/rechecked.

Give a separate reviewer [review-agent](../review-agent/SKILL.md), project rules, module scope, baseline, and relevant uncommitted changes. The module's current developer/fixer cannot review their own work. Review actual final code.

Reviewers are read-only: no files, commits, pushes or further delegation. Read the whole scoped diff, surrounding execution paths, callers and tests. Report only evidenced new defects with P0-P3 severity and precise locations, not speculative/style changes.

Send defects back for step-2 repair/testing, repeat affected step-3 checks, then obtain independent re-review. Every finding needs a disposition and evidence, not merely a reply. Record content version, coverage, conclusion and gaps. No findings is not a test pass. Complete a module only after tests and steps 3/4 pass; recheck changed dependencies/callers.

## 5. Main-agent overall review and coordinated repairs

Owner: main agent personally reviews; developers repair. Pass condition: integration verified and review defects resolved/rechecked.

Confirm all planned modules passed tests and steps 3/4, and all writers stopped. Personally use [review-agent](../review-agent/SKILL.md) against the agreed original baseline, covering every final change and related call path. Do not merely summarize module reviews or inspect only the last fix. Focus on cross-module interfaces, actual dependencies, data transfer, error propagation and compatibility.

Run required integration/regression tests, builds and type checks under `<project>/docs/archify/test/`, following step 2's execution/output rules. Report real commands, working directories, results and environmental blockers. Separate module passes do not prove integration.

List repair evidence, severity, modules, tasks, owners, files, dependencies and recheck requirements. Parallelize independent repairs; serialize shared/dependent files. Confirm scope expansions first. After tests, repeat affected steps 3/4 and personally recheck findings/cross-module behavior while retaining complete original review coverage. Stop repeated unproductive retries and report blockers rather than skipping defects.

## 6. Final acceptance and delivery

Owner: main agent. Pass condition: all scoped implementation, tests, document checks and defect handling complete.

Confirm no writers remain. Verify final document/source content including uncommitted edits, coverage and baseline; reuse results only when these still match. Final checks cover all selected modules and affected relationships, not a sample. Final/supplementary tests follow the same `docs/archify/test/` rules. Verify actual working directories/logs/reports and give evidence paths.

Do not claim complete acceptance with unrun required tests, failures, uncertain document conformance, unperformed required independent review, or unresolved defects. Static conformance, `No findings.`, and architecture `verified` are not runtime acceptance. Record explicit user scope reductions and their impact.

Do not write implementation-derived locations, sources, status or versions back into `archify.json` by default. If the agreed solution is infeasible, pause affected work and explain cause/impact/options. Only after explicit agreement on a revised design and write scope, route changes through [xyf-archify](../xyf-archify/SKILL.md), preserving IDs/other content; update plans and repeat affected checks. Never change documentation to conceal implementation deviations.

Deliver concise tables of modules, actual files, module/integration tests, document checks, reviews, gaps and limits. Write only in the authorized project, never installed skill tools or another project. Commit, push, merge or publish only on explicit request.
