# Velto Finance — Mandatory Development Rules & Quality Gate

## 1. Principles
Every modification to this repository must preserve application reliability, data integrity, and visual design.

---

## 2. Mandatory Rules Before Completing Any Task

Whenever you add a feature, modify an existing component, change a route, modify an API, or update database logic:

1. **Rule of Hooks**: Never call React hooks inside loops, conditionals, or nested callback functions.
2. **Defensive Data Handling**: Never assume props, API responses, or database records are defined. Always provide safe fallbacks (`|| ''`, `|| []`, `|| 0`).
3. **Multi-Tenant Protection**: Never query or update data without scoping to the authenticated user ID (`user.id` / `owner_andra`).
4. **Preserve Database Records**: Never reset or overwrite the production database without user authorization.
5. **No Blind Try-Catches**: Fix root causes instead of suppressing exceptions. Log detailed diagnostics to console while displaying friendly fallbacks to users.
6. **Automated Verification**:
   - Run `npm test` and ensure all tests pass (0 failures).
   - Run `npm run build` to confirm zero compilation errors.
   - Add regression tests for every significant bug fixed.

---

## 3. Pre-Commit Checklist
- [ ] No syntax errors or broken imports.
- [ ] No illegal nested hook calls.
- [ ] Currency formatters and date utilities handle null/undefined safely.
- [ ] `npm test` passes with 100% success rate.
- [ ] Production build succeeds (`npm run build`).
