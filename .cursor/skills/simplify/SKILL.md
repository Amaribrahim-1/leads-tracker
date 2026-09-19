---
name: simplify
description: >-
  Simplify and refine recently modified code for clarity and consistency
  without changing behavior. Use only when the user explicitly asks to
  simplify, refine, or clean up code (e.g. simplify, بسّط, نظّف الكود).
  Do not run after ordinary code edits.
disable-model-invocation: true
---

# Simplify

Refine recently modified code for clarity and consistency. Do not change
what the code does — only how it is written.

Run this skill **only when the user explicitly asks**. Never start a
simplification pass on your own after writing or editing code.

## Project standards (this repo)

Follow the Cursor project rules, not Claude-specific docs:

- `.cursor/rules/stack-conventions.mdc`
- `.cursor/rules/mentor-behavior.mdc`
- `.cursor/rules/review-checklist.mdc`
- `AGENTS.md` / `CLAUDE.md` only as Next.js-in-this-repo notes, not as a
  personal style guide from another agent

Match the patterns already in this codebase. Do not impose outside
conventions such as `function` over arrows, import file extensions, or
always-on explicit return types unless this repo already uses them.

Prefer the simpler approach unless extra complexity prevents a real,
current problem.

## What to do

1. **Preserve behavior** — same features, outputs, and edge cases.
2. **Clarify** — less nesting, less redundancy, clearer names, related
   logic together. Drop comments that only restate the code.
3. **Stay readable** — no nested ternaries, no dense one-liners, no
   clever shortcuts. Explicit `if` / `switch` beats compactness.
4. **Do not over-simplify** — keep useful abstractions; do not merge
   unrelated concerns into one function.
5. **Limit scope** — only files/hunks touched in this session, unless
   the user asks for a wider pass.

## Process

1. Identify the recently modified code.
2. Apply the project Cursor rules above.
3. Change structure and naming only — not behavior.
4. Summarize only changes that affect how to read the code.
