---
name: brainstorming
description: Clarify intent, requirements, constraints, and success criteria before designing or changing behavior in the EasyCode workflow.
---

# Agree on the design

Read relevant project rules, source, documents, and recent changes. Understand the user's purpose, audience, and success criteria; knowing the application category is insufficient. Reflect the intended outcome, scope, constraints, and assumptions concisely so the user can correct them. Reuse existing valid decisions and authorization.

Scale the discussion: a feasibility investigation needs an agreed question/probe and a recommendation; a bounded existing-flow change needs a short in-chat design with affected files and checks; a new project/subsystem needs boundaries, interfaces, data flow, errors, dependencies, and acceptance criteria. State the scope before asking essential questions. Ask one focused question at a time, using concise choices where helpful. Compare meaningful alternatives and recommend one. Avoid unrelated features/refactoring.

Obtain the design and write approvals required by the task/project before implementation. A pending question is not approval. A reply covers the work actually presented, not unrelated scope. Reuse explicit authorization without repeating it. Explain newly discovered complexity and confirm design/scope changes.

For EasyCode architecture-only work, hand the confirmed design to [xyf-archify](../xyf-archify/SKILL.md) for `archify.json`; no separate specification, external planning skill, or automatic Git commit is required. For development, return to the main workflow and [xyf-code](../xyf-code/SKILL.md) after its architecture prerequisites are met. Write a plan when useful rather than imposing a missing external skill dependency.

Each module needs one clear purpose, public contract, dependencies, and independently verifiable behavior. Define method inputs/outputs, defaults, sequence, errors, and tests. Follow existing conventions. Split oversized designs into coherent parts. Before handoff, resolve placeholders, contradictions, ambiguity, and unnecessary scope.

## Optional visual companion

Use visual comparison only when seeing a mockup/diagram improves the decision. The architecture editor is the normal EasyCode visual artifact. The brainstorming companion is optional and does not affect installation or ordinary use.

Offer it when a visual question arises, explain that it opens a local browser page, and start only if accepted. Read [visual-companion.md](visual-companion.md) for operation; it needs Node.js and Bash (such as Git Bash on Windows). Keep textual scope and trade-off questions in the conversation. Never automatically commit, push, install unrelated dependencies, or start development from a requirements-only request.
