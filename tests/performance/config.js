/**
 * Velto Finance — Grafana k6 Performance Testing Shared Configuration & Helpers
 * Environment: STAGING ONLY
 * 
 * Safety Rules:
 * 1. Strictly blocks any execution targeting production (velto-pearl.vercel.app).
 * 2. Requires explicit confirmation (ALLOW_HIGH_LOAD=true) for tests exceeding 100 VUs.
 * 3. Does not perform destructive database operations during read-only benchmarking.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

// ─── Environment & Safety Validation ───────────────────────────────────────────
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
export const TARGET_ENV = __ENV.TARGET_ENV || 'staging';
export const STAGING_TOKEN = __ENV.STAGING_TOKEN || '';
export const ALLOW_HIGH_LOAD = __ENV.ALLOW_HIGH_LOAD === 'true';

export function enforceSafetyGuard(targetUrl, maxVUs = 0) {
  if (!targetUrl) {
    throw new Error('[SAFETY GUARD] BASE_URL environment variable is required.');
  }

  const lower = targetUrl.toLowerCase();
  const forbiddenKeywords = ['velto-pearl.vercel.app', 'velto.finance', 'production', 'prod'];

  for (const keyword of forbiddenKeywords) {
    if (lower.includes(keyword)) {
      throw new Error(
        `\n\n🚨 [CRITICAL SAFETY GUARD TRIGGERED]\n` +
        `Target URL "${targetUrl}" matched forbidden production pattern "${keyword}".\n` +
        `Performance & Load Testing is strictly restricted to ISOLATED STAGING environments.\n` +
        `Execution aborted immediately to protect production data and infrastructure.\n`
      );
    }
  }

  // Guard against accidental high-load execution without confirmation
  if (maxVUs > 100 && !ALLOW_HIGH_LOAD) {
    throw new Error(
      `\n\n⚠️ [HIGH-LOAD SAFETY CONFIRMATION REQUIRED]\n` +
      `You are attempting to execute a workload with ${maxVUs} Virtual Users (exceeding 100 VUs).\n` +
      `To prevent accidental cloud infrastructure exhaustion, you must explicitly confirm by setting:\n` +
      `   -e ALLOW_HIGH_LOAD=true\n` +
      `Execution paused for safety.\n`
    );
  }
}

// ─── Standard Performance Thresholds ──────────────────────────────────────────
export const DEFAULT_THRESHOLDS = {
  // HTTP failure rate must stay below 1% for normal operations
  http_req_failed: ['rate<0.01'],
  // 95% of requests must complete under 800ms
  http_req_duration: ['p(95)<800', 'p(99)<2000'],
  // 90% of checks must pass
  checks: ['rate>0.95']
};

export const STRESS_THRESHOLDS = {
  http_req_failed: ['rate<0.05'], // Allow up to 5% failures under extreme stress
  http_req_duration: ['p(95)<2500', 'p(99)<5000'],
  checks: ['rate>0.90']
};

// ─── Request Headers Helper ───────────────────────────────────────────────────
export function getHeaders(token = STAGING_TOKEN) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'k6-VeltoPerformanceTest/1.0'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ─── User Journeys (Read-Only Verified Scenarios) ──────────────────────────────
/**
 * Real-world User Journey: Dashboard & Financial Overview
 * Represents a user logging in and viewing their wallet balances, transactions, and goals.
 */
export function scenarioDashboardRead(baseUrl, token) {
  const headers = getHeaders(token);

  // 1. Fetch comprehensive financial sync payload (Wallets, TX, Goals, Settings)
  const syncRes = http.get(`${baseUrl}/api/sync`, {
    headers,
    tags: { name: 'GET_api_sync_overview' }
  });

  const checkSync = check(syncRes, {
    'overview: status is 200': (r) => r.status === 200,
    'overview: payload is json': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.success === true;
      } catch {
        return false;
      }
    },
    'overview: has wallets array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body?.data?.wallets);
      } catch {
        return false;
      }
    }
  });

  return checkSync;
}

/**
 * Real-world User Journey: Transaction Mutasi & History Navigation
 * Represents a user opening the Mutasi tab to inspect recent financial logs.
 */
export function scenarioTransactionHistoryRead(baseUrl, token) {
  const headers = getHeaders(token);

  const txRes = http.get(`${baseUrl}/api/sync`, {
    headers,
    tags: { name: 'GET_api_sync_transactions' }
  });

  return check(txRes, {
    'transactions: status is 200': (r) => r.status === 200,
    'transactions: has transactions array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body?.data?.transactions);
      } catch {
        return false;
      }
    }
  });
}

/**
 * Real-world User Journey: Parfum FIFO Inventory & Sales Stats
 * Represents a user opening the Parfum FIFO business module.
 */
export function scenarioParfumFifoRead(baseUrl, token) {
  const headers = getHeaders(token);

  const parfumRes = http.get(`${baseUrl}/api/sync`, {
    headers,
    tags: { name: 'GET_api_sync_parfum' }
  });

  return check(parfumRes, {
    'parfum: status is 200': (r) => r.status === 200,
    'parfum: has batches and sales': (r) => {
      try {
        const body = JSON.parse(r.body);
        return (
          Array.isArray(body?.data?.parfumBatches) &&
          Array.isArray(body?.data?.parfumSales)
        );
      } catch {
        return false;
      }
    }
  });
}

/**
 * Real-world User Journey: Static SPA Shell / Healthcheck
 * Validates CDN / Edge asset delivery.
 */
export function scenarioStaticShellRead(baseUrl) {
  const res = http.get(`${baseUrl}/manifest.webmanifest`, {
    tags: { name: 'GET_static_manifest' }
  });

  return check(res, {
    'manifest: status is 200': (r) => r.status === 200,
    'manifest: contains velto name': (r) => r.body && r.body.includes('Velto')
  });
}

// ─── Professional Custom Report Generator ──────────────────────────────────────
export function generateTestSummary(data, testName = 'Performance Test') {
  const httpReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const httpRate = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(2) : '0';
  const httpFailed = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : '0';
  
  const p50 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(50)'].toFixed(2) : 'N/A';
  const p90 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(90)'].toFixed(2) : 'N/A';
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A';
  const p99 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A';
  const avgDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 'N/A';
  
  const vusMax = data.metrics.vus_max ? data.metrics.vus_max.values.value : (data.metrics.vus ? data.metrics.vus.values.value : 'N/A');
  const checksPassed = data.metrics.checks ? (data.metrics.checks.values.rate * 100).toFixed(2) : '100';

  let verdict = 'PASSED (Resilient)';
  if (parseFloat(httpFailed) > 5.0 || (p95 !== 'N/A' && parseFloat(p95) > 3000)) {
    verdict = 'FAILED (SLO Breached)';
  } else if (parseFloat(httpFailed) > 1.0) {
    verdict = 'DEGRADED (Warning)';
  }

  const report = `
# VELTO FINANCE — ${testName.toUpperCase()} REPORT
**Generated:** ${new Date().toISOString()}  
**Target Environment:** ${TARGET_ENV.toUpperCase()}  
**Target Base URL:** ${BASE_URL}  
**Overall Verdict:** **${verdict}**

---

### Executive Key Metrics
| Metric | Result | Target SLO | Status |
|---|---|---|---|
| **Max Virtual Users (VUs)** | ${vusMax} VUs | Scaled target | Validated |
| **Total Requests** | ${httpReqs} reqs | - | Completed |
| **Throughput (RPS)** | ${httpRate} req/s | Continuous | Monitored |
| **Average Response Time** | ${avgDuration} ms | < 500 ms | ${parseFloat(avgDuration) <= 500 ? '✅ Optimal' : '⚠️ Elevated'} |
| **P50 Latency (Median)** | ${p50} ms | < 300 ms | ${parseFloat(p50) <= 300 ? '✅ Optimal' : '⚠️ High'} |
| **P90 Latency** | ${p90} ms | < 800 ms | ${parseFloat(p90) <= 800 ? '✅ Pass' : '⚠️ High'} |
| **P95 Latency** | ${p95} ms | < 1,000 ms | ${parseFloat(p95) <= 1000 ? '✅ Pass' : '❌ Breached'} |
| **P99 Latency** | ${p99} ms | < 2,500 ms | ${parseFloat(p99) <= 2500 ? '✅ Pass' : '❌ Breached'} |
| **HTTP Error Rate** | ${httpFailed}% | < 1.00% | ${parseFloat(httpFailed) <= 1.00 ? '✅ Stable' : '❌ High Failures'} |
| **Assertion Checks Passed** | ${checksPassed}% | > 95.00% | ${parseFloat(checksPassed) >= 95 ? '✅ Pass' : '❌ Fail'} |

---

### Analysis & Diagnostic Notes
1. **Error Analysis**: Error rate recorded at ${httpFailed}%. ${parseFloat(httpFailed) === 0 ? 'Zero connection timeouts or unhandled 5xx errors.' : 'Examine Vercel execution logs and TiDB connection pool metrics.'}
2. **Latency Distribution**: P95 at ${p95}ms, P99 at ${p99}ms. ${parseFloat(p95) < 800 ? 'Response times are within smooth user experience bounds.' : 'Latency degradation detected under current concurrency.'}
3. **Capacity Insight**: Tested with up to ${vusMax} concurrent virtual users.

---
*Report generated automatically by Grafana k6 Velto Test Suite.*
`;

  return {
    'stdout': report,
    [`tests/performance/reports/${testName.toLowerCase().replace(/\s+/g, '-')}-report.md`]: report,
    [`tests/performance/reports/${testName.toLowerCase().replace(/\s+/g, '-')}-data.json`]: JSON.stringify(data, null, 2)
  };
}
