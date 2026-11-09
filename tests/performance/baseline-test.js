/**
 * Velto Finance — Baseline Benchmark Test (Grafana k6)
 * Objective: Establish the golden standard baseline metrics (P50, P90, P95, RPS, error rate)
 * under normal, healthy concurrent traffic (10 to 20 VUs).
 * 
 * Safety: STAGING ONLY.
 */

import { sleep, group } from 'k6';
import {
  BASE_URL,
  STAGING_TOKEN,
  enforceSafetyGuard,
  DEFAULT_THRESHOLDS,
  scenarioDashboardRead,
  scenarioTransactionHistoryRead,
  scenarioParfumFifoRead,
  scenarioStaticShellRead,
  generateTestSummary
} from './config.js';

// Pre-test Safety Verification
enforceSafetyGuard(BASE_URL, 20);

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Warm-up to 10 VUs
    { duration: '2m', target: 20 },  // Steady state at 20 VUs
    { duration: '30s', target: 0 },  // Ramp-down to 0
  ],
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    http_req_failed: ['rate<0.01'],        // < 1% error rate
    http_req_duration: ['p(95)<800', 'p(99)<1500'], // P95 < 800ms
    checks: ['rate>0.98']                  // 98% assertions must pass
  }
};

export default function () {
  group('1. Edge Static Shell', function () {
    scenarioStaticShellRead(BASE_URL);
  });

  sleep(1);

  group('2. Financial Dashboard Read', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1.5);

  group('3. Transaction History Read', function () {
    scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1);

  group('4. Parfum Business Module', function () {
    scenarioParfumFifoRead(BASE_URL, STAGING_TOKEN);
  });

  // Realistic user think time
  sleep(2);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Baseline Test');
}
