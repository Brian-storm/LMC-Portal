---
name: test-verification
description: Runs tests, typecheck, lint, and build verification before declaring a task done. Captures evidence (commands, output, screenshots) and checks against the definition of done. USE FOR: verify task, run tests, pre-done check, verification evidence, definition of done.
---
# Test Verification

Use before declaring a task complete. Produces the verification evidence required by `.github/skills/monstrare/ai/process/definition-of-done.md`.

**Canonical rules**: `.github/skills/monstrare/ai/skills/test-verification.md`

## Process

1. Read the verification contract from the task card.
2. Determine the smallest set of checks that still covers the contract.
3. Run targeted tests first.
4. Run lint, typecheck, and build as applicable.
5. For UI changes: capture desktop and mobile screenshots (if tooling allows).
6. Check against `.github/skills/monstrare/ai/checklists/testing-checklist.md`:
   - Does each test fail before the fix?
   - Are edge cases covered?
   - Are permission/error paths tested?
7. For UI changes: also check against `.github/skills/monstrare/ai/checklists/design-review-checklist.md`.
8. Record evidence using `.github/skills/monstrare/ai/templates/verification-report.md` as template, output to `ai/artifacts/<Epic>/verification/<card-id>.md`.

## What to Run

Minimum verification for any task:
```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (or project equivalent)
npm run build       # Compile check
```

If the project has tests:
```bash
npm test            # or project-specific test command
```

For UI changes (additionally):
- Screenshot of each changed screen (desktop + mobile viewport)
- Visual diff against mockup (if mockup gate was used)
- Keyboard navigation check
- Screen reader check (if a11y is relevant)

## Output

- Commands executed
- Pass/fail summary
- Screenshot notes (if UI)
- Coverage gaps
- Residual risk
- Verdict: meets definition of done? (YES/NO — if NO, what's missing)

## Integration with Definition of Done

A task is NOT done without:
- Evidence of changed files
- Behavior change summary
- Commands run + their output
- Test output summary
- Lint/typecheck/build output (if applicable)
- UI screenshots or visual comparison (if UI)
- Design system token/component compliance check (if UI)
- Security notes (if high-risk)
- Known limitations
- Follow-up tasks