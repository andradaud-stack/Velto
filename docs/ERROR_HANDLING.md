# Velto Finance — Error Handling & Resilience Architecture

## 1. Overview
This document specifies the error handling and resilience strategies implemented across the Velto Finance ecosystem (React frontend, Dexie local database, and TiDB Cloud Serverless APIs).

The primary objective is **zero unhandled crashes**, eliminating blank white screens, ensuring graceful degradation in offline or unstable network environments, and protecting user data.

---

## 2. Global Error Boundary Strategy

### Location & Hierarchy
* **Root Boundary (`src/main.jsx`)**: Intercepts catastrophic failures in root providers (`AuthProvider`, `FinanceProvider`, `ThemeProvider`).
* **View Region Boundary (`src/App.jsx`)**: Intercepts render-phase errors within dynamic tab views (`Home`, `Wallets`, `Parfum`, `Goals`, `Mutasi`, `Settings`), preventing local feature failures from tearing down the navigation bar or header.

### User Recovery Actions
1. **Coba Lagi (Retry)**: Resets the component error state and attempts re-rendering the active tree without losing user session.
2. **Muat Ulang (Hard Reload)**: Safely forces a fresh browser load (`window.location.reload()`) if an unrecoverable cache or runtime condition occurred.
3. **Detail Masalah (Expandable Diagnostics)**: Provides sanitized error stack information for developers while showing a clean, friendly alert to end users.

---

## 3. Defensive Frontend Patterns

### A. Null & Undefined Safety
* **Strings & Search**: All substring search inputs and object attributes must use null-coalescing:
  ```javascript
  // Correct
  const matches = (tx.title || '').toLowerCase().includes(term);
  ```
* **Arrays & Iterations**: Arrays derived from props or API payloads must have default fallbacks:
  ```javascript
  // Correct
  const count = (stats?.bestSeller || []).length;
  ```
* **Date Parsing**: Date inputs passed to formatters must verify valid timestamp numbers:
  ```javascript
  // Correct
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  ```

### B. React Hooks Integrity
* React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) must **never** be placed inside loops, conditionals, or nested functions.
* All data transformations on arrays (e.g., `.map()`, `.filter()`) must consume pre-computed memoized values.

---

## 4. Database & Storage Resilience

### A. Dexie (Local IndexedDB)
* All async operations in background services (`parfumFifoService.js`, `database.js`) are wrapped in `try/catch` blocks to prevent uncaught Dexie promise rejections from propagating to React.
* Multi-tenant scoping guarantees that guest accounts and the primary owner (`andrasyahdand@gmail.com`) only query data belonging to their respective scope.

### B. TiDB Cloud Backend
* All SQL execution helpers handle both Array responses and `{ rows: [] }` wrapper structures from `@tidbcloud/serverless`.
* Insertion queries use `INSERT ... ON DUPLICATE KEY UPDATE` to avoid MySQL error `1062 (Duplicate entry)` during race conditions or dual synchronizations.

---

## 5. Network & Offline Synchronization

### A. Offline-First Fallback
* When network requests fail (e.g., airplane mode, flaky mobile connection), the app logs a background warning and continues serving data from local IndexedDB without interrupting user workflows.

### B. Token Expiration & Unauthorized Sessions
* If `/api/sync` returns HTTP 401 (Unauthorized), the invalid token is cleared from `localStorage` without wiping offline IndexedDB data. The user is prompted to sign in when cloud synchronization is required.
