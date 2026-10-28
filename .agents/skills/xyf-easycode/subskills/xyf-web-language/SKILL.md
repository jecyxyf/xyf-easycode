---
name: xyf-web-language
description: Translate EasyCode's bundled architecture webpage tools into any user-specified natural language while preserving English names and code identifiers. Use before deploying a new architecture webpage or when asked to change its language.
---

# XYF Web Language

Translate the actual installed EasyCode [tools directory](../../tools/README.md). Resolve `../../tools/` relative to this skill directory; do not hard-code the author's checkout path. This changes the shared templates used by subsequent deployments. Use an explicitly supplied tools copy for isolated checks. Deployment itself remains the responsibility of [xyf-archify](../xyf-archify/SKILL.md).

## Select the language

For a new architecture webpage, the first user question is: **"Which language should the architecture webpage use?"** Ask in the user's conversation language. Accept any natural language, not a fixed list. Reuse a language explicitly supplied for this task; do not infer it from the conversation, browser, operating system, or current template. Wait for the answer before translation, architecture generation, or deployment. Do not ask again when the calling skill already obtained the answer.

Read the current templates and their `<html lang>` marker. For an existing page, retain its recorded language unless the user requests a change. Establish the target tools directory and authorized write scope before editing; reuse existing approval. Translate with the agent rather than requiring an external translation service or installing language packs.

## Translate the tools

Work from source files, then rebuild `index.html`; editing the bundled HTML alone loses translations on the next build.

| Translate into the selected language | Preserve exactly |
| --- | --- |
| Visible HTML text, titles, tooltips, placeholders, accessible labels, buttons, dialogs and empty states | HTML hooks, IDs, classes, selectors, template slots and SVG data |
| JavaScript-generated labels, confirmation messages, validation errors, save/import/sync status and server errors shown in the page | JavaScript identifiers, object keys, enum values, routing and comparisons that control behavior |
| Default display names, purposes, parameter descriptions, method flows, event descriptions and test instructions in model defaults and data/template examples | Every `englishName` value, actual source symbols, programming-language names, data types, paths, URLs and version/evidence fields |
| Human-readable tool instructions, template guidance and generated access instructions | Commands, code examples and data contracts; translate only explanatory prose within examples |

Translation changes text only. Preserve CSS, fonts, spacing, positions, dimensions, colors, DOM order, alignment, layout and existing direction attributes. Do not add right-to-left mirroring or other styling changes for a language, including Arabic. Do not add direction overrides to headings, inputs or the canvas. A layout change requires a separate user request.

Inspect `html/templates/`, `html/assets/`, `html/server.mjs`, `html/scripts/`, `archify.json` and the tools README as applicable. Keep guidance/skeleton pairs consistent. In JavaScript, distinguish displayed text from strings used as lookup keys or branch conditions. If the same word serves both purposes, translate at the display boundary and preserve its internal value. Do not use blind global replacement or alter business meaning. Preserve interpolation expressions, escaping, line breaks and placeholders in messages.

Set the canvas skeleton and guide's `<html lang>` to the selected language tag as a language marker; retain the original `dir` attributes unchanged. The language marker must survive rebuilding and HTML export. A translated label on the English-name field is allowed; its value stays English.

This task covers the bundled tools, not an existing project's business architecture. When handing off to architecture generation, pass the selected language so its new display names and descriptive content use that language while English names retain their role. Translate existing project data only when that change is requested.

## Rebuild, verify and hand off

Run from the selected tools directory:

```sh
node html/scripts/build.mjs --runtime
node html/scripts/check.mjs archify.json
node html/scripts/check.mjs index.html
```

Check changed JavaScript with `node --check`, validate translated JSON, and compare protected identifiers and `englishName` values with their pre-edit values. Confirm CSS is unchanged and compare layout, DOM order and direction attributes with the original. Read the rebuilt HTML back and confirm its language marker. Do not claim completion from a marker alone: inspect visible controls, module editing, new-item defaults, validation/confirmation messages, save/refresh and English names through an actual deployed HTTP page. Use an isolated test project for edits and record which paths were checked; distinguish API checks from real browser checks.

If translation or verification is incomplete, report the affected files and do not deploy an untranslated fallback as completed work. Return the actual tools path, selected language/tag, changed files, rebuilt entry and check results to the calling skill. Do not start a server unless deployment was requested.
