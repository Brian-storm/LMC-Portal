---
name: project-search
description: Builds a task-specific context pack through minimal codebase search, and updates the persistent project map when valuable. Reads project-map, architecture-map, and code-search-guide as starting points, then searches with precise symbols/routes before expanding. USE FOR: understand codebase, context discovery, find relevant files, before planning or implementing.
---
# Project Search

Use before planning or implementing any non-trivial work. Builds a context pack — a minimal, targeted snapshot of what the agent needs to know.

**Canonical rules**: `.github/skills/monstrare/ai/skills/project-search.md`

## Process

1. If they exist, read `ai/context/project-map.md`, `ai/context/architecture-map.md`, and `ai/context/code-search-guide.md` first.
2. Determine precise search terms: symbols, routes, component names, API paths, error messages.
3. Search with precise terms first — use `rg` (ripgrep) / `grep` / symbol-aware tools.
4. Read only the minimal set of relevant files.
5. Produce a context pack following `.github/skills/monstrare/ai/process/context-protocol.md`.
6. Only update `ai/context/code-search-guide.md` when you find something with persistent value.

## Context Pack Format

```text
Task:
Goal:
Relevant files:
Existing patterns:
Assumptions:
Unknowns:
Files allowed to change:
Do not touch:
Verification commands:
Risk level:
Context budget notes: (what was read, what was skipped, why)
```

## Search Rules

- Text search: prefer `rg` (or `Select-String` on Windows)
- Symbol-aware tools when available (Serena MCP, etc.)
- Don't read the entire repo unless the task scope demands it
- Don't paste whole large files when a summary or symbol search suffices
- Summarize findings and cite file paths
- If you discover project-wide useful knowledge, update `ai/context/code-search-guide.md`

## Stop Conditions

Pause and ask for direction when:
- Search reveals multiple viable implementation approaches with different trade-offs
- Requirements conflict with existing architecture
- Required files are missing
- Task touches secrets, auth, payments, migrations, or infrastructure
- Estimated scope exceeds the approved task card