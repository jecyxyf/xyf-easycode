---
name: xyf-easycode
description: Guide EasyCode work from agreed requirements and visual architecture through implementation, document verification, and defect review. Use to start, continue, or check a project with EasyCode.
metadata:
  version: "0.0.1"
---

# XYF EasyCode

Improve VibeCoding interaction by making software architecture and interfaces visible, then keeping AI coding aligned with the user's agreed requirements. This entry point routes tasks and manages handoffs. Read only the subskill needed at the current stage.

## Bundled subskills

Paths are relative to this installed skill directory. Keep the entire bundle together. Read nested instructions directly if the agent does not register them as separate skills.

| Subskill | Purpose | Instructions |
| --- | --- | --- |
| brainstorming | Agree on requirements and design | [SKILL.md](subskills/brainstorming/SKILL.md) |
| xyf-archify | Maintain architecture and deploy its editor | [SKILL.md](subskills/xyf-archify/SKILL.md) |
| xyf-code | Implement, test, verify documents, review, and repair | [SKILL.md](subskills/xyf-code/SKILL.md) |
| xyf-archifycheck | Read-only document/code comparison | [SKILL.md](subskills/xyf-archifycheck/SKILL.md) |
| review-agent | Read-only review of new defects in a change | [SKILL.md](subskills/review-agent/SKILL.md) |

## Choose the route

Establish the actual project, desired result, scope, artifacts, and existing authorization. Default to the current project; read its collaboration rules. Explain the start, finish, and reason in a short table. Ask only for missing essential information. Existing files alone do not prove prior stages are complete. Reuse valid confirmations; resolve missing prerequisites and obtain required write/scope authorization.

| Stage | Action and result |
| --- | --- |
| 1 | brainstorming: agreed goals, constraints, design, and acceptance criteria |
| 2 | xyf-archify: checked architecture, actual paths, and editor delivery |
| 3 | xyf-code: six-step development, tests, main-agent document checks and personal overall review, with versions, coverage, baseline |
| 4 | xyf-archifycheck: scoped comparison, differences, evidence, unresolved items |
| 5 | review-agent: severity-ranked regressions and overall assessment |

New full development: 1 -> 2 -> 3 -> 4 -> 5. Confirmed requirements without usable architecture: 2 -> 3 -> 4 -> 5. Usable architecture: 3 -> 4 -> 5. Completed code needing checks: 4 -> 5. Architecture-only ends at 2 (clarify first if needed); document-only is 4; defect-only is 5. Honor explicitly requested start/finish after checking prerequisites. Do not expand a read-only task into repairs or architecture work into application development.

For architecture-only tasks, brainstorming's agreed design goes into the configuration through xyf-archify; do not require separate specification/plan files or repeat the discussion. Stage 3's six internal steps are distinct from this table. Module document verification comes before independent review; the main agent personally reviews the complete final change.

## Handoffs and rework

- Pass actual project/document paths, module/file scope, confirmations, authorization, and checked artifacts. Default architecture: `<project>/docs/archfiy/archify.json`. Honor user paths or existing `docs/archify/archify.json`; resolve competing data baselines. Never substitute the tool's empty template for project requirements.
- Preserve pre-existing user edits. Record whether review targets uncommitted changes, merge-base differences, or a specified commit. Read-only review does not authorize fixes.
- Reuse stage 3's complete main-agent checks at stages 4/5 only when document content, current source including uncommitted edits, coverage, and review baseline all match. A commit ID alone, partial checks, or developer self-review is insufficient. Recheck changed or missing coverage.
- For authorized development, send findings back to stage 3, fix/test within scope, and repeat affected checks. Read-only tasks report findings and stop without writing.
- Obtain confirmation before changing requirements/architecture, then return to stage 1/2. Never change documents to hide implementation deviations. Input changes invalidate affected prior checks.
- Report environmental/missing-information blockers; continue independent work where possible. Do not retry endlessly or describe incomplete work as passed.

## Delivery

Use short tables for actual stages, artifacts, checks run, and unresolved work. Separate data, source, service, and real-browser checks. State unrun tests honestly. Full delivery requires scoped implementation, required tests, document verification, and defect handling to be complete. A completed read-only review does not mean findings were fixed. Commit, push, merge, or publish only when explicitly requested.

Runtime requirement: Node.js 22+ for the bundled editor. No npm dependencies are required. The optional brainstorming browser companion also uses Bash; it is not needed for the architecture editor or ordinary skill use.
