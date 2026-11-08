# Velto Finance — Automated Testing Guide

## 1. Overview
Velto Finance uses **Vitest** for lightning-fast unit, integration, calculation, and regression testing.

---

## 2. Running Automated Tests

Run the full automated test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npx vitest
```

Run test with UI / coverage:
```bash
npx vitest --coverage
```

---

## 3. Test Suites Structure

All test suites reside in the `/tests` root directory:

| Test File | Target Module | Scope |
|---|---|---|
| `tests/currencyFormatter.test.js` | `src/core/utils/currencyFormatter.js` | Indonesian Rupiah formatting, null values, negative values, valid date formatting, and invalid date protection |
| `tests/userScope.test.js` | `src/core/utils/userScope.js` | User identification, owner detection (`andrasyahdand@gmail.com`), multi-tenant account isolation |
| `tests/streakCalculator.test.js` | Desktop & Mobile Streak Logic | Daily transaction streak calculation, weekend gaps, empty transaction handling |
| `tests/authBackend.test.js` | `api/sync.js`, `api/auth/` | JWT token generation and 30-day expiration verification |

---

## 4. Writing New Tests

Follow these standards when adding new test suites:
1. Every new utility or financial calculation function must have unit tests covering edge cases (0 values, negative values, null/undefined inputs).
2. Never mock database layers in a way that fabricates false passes; verify actual return types and fallback defaults.
3. Every fixed bug must have a regression test added to prevent recurrence.
