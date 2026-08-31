---
name: security-maintainability-review
description: Reviews code changes for security vulnerabilities, privacy leaks, auth/authorization flaws, data validation gaps, architectural drift, and maintainability issues. Combined security + code review gate. USE FOR: code review, security review, pre-merge review, high-risk change review, maintainability check.
---
# Security & Maintainability Review

Applies to high-risk plans, pre-merge reviews, and general code changes. Combines the security gate and code review gate into one pass (in OpenCode there are no subagents — the review happens inline in a single session).

**Canonical rules**: `.github/skills/monstrare/ai/skills/security-maintainability-review.md`

## Review Priority (in order)

1. Functional bugs & regressions
2. Security vulnerabilities
3. Privacy leaks
4. Auth & authorization flaws
5. Data validation gaps
6. Migration & rollback risks
7. Architectural drift
8. Duplicate code & maintainability
9. Missing tests or weak verification

## Required Output Format

```text
Finding:
- Severity: CRITICAL | HIGH | MEDIUM | LOW
- File/Line (if available):
- Issue:
- Impact:
- Suggested Fix:

Residual Risk:
Recommendation: APPROVE | REQUEST CHANGES | BLOCK
```

## Maintainability Checks

- Follows existing patterns
- UI changes use design system tokens/components (no hardcoded one-off colors/spacing/type sizes); new components registered in inventory
- Avoids unnecessary abstractions
- Public API stable unless spec requires change
- Functions and components are focused, single-responsibility
- Comments only for non-obvious decisions
- Behavior changes sync with documentation or context maps
- Diff is small and reviewable
- No unrelated formatting changes
- Prefers "boring but testable" over clever

## Security Checks

Apply `ai/checklists/security-checklist.md` systematically:

### Always Check (Every Review)
- No passwords, keys, or secrets in plaintext (code, config, env)
- No secrets in git history or diff output
- Input validation on all user-supplied data
- Output encoding to prevent XSS
- SQL/NoSQL injection vectors
- CSRF protection on state-changing requests
- Proper HTTP security headers (CSP, HSTS, X-Content-Type-Options)
- File upload restrictions (type, size, naming)

### High-Risk Areas (Extra Scrutiny)
- Authentication flow (session management, token handling, password hashing with bcrypt/scrypt, rate limiting)
- Authorization (role checks on every protected endpoint, not just frontend hiding)
- Payment processing (PCI boundaries, amount integrity, idempotency)
- PII handling (encryption at rest, access logging, right-to-delete, data minimization)
- Infrastructure (IAM policies, security group rules, public exposure)

## Integration with Workflow

- Low-risk tasks: run this review at Phase 7 (Verification)
- Medium/high-risk tasks: run this review at Phase 4 (Architecture Plan) AND Phase 7 (Verification) AND Phase 8 (Review)
- The `security-checklist.md` is not just for formal review — apply it during implementation too