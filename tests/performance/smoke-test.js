/**
 * Velto Finance — Smoke Test (Grafana k6)
 * Objective: Minimal sanity check (1-5 VUs) to verify staging API reachability,
 * authentication validation, and response contracts before launching higher workloads.
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
enforceSafetyGuard(BASE_URL, 5);

export const options = {
  vus: 3,
  duration: '1m',
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<600']
  }
};

export default function () {
  group('1. Static SPA Shell', function () {
    scenarioStaticShellRead(BASE_URL);
  });

  sleep(0.5);

  group('2. Dashboard & Financial Overview', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);

  group('3. Transaction History', function () {
    scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);

  group('4. Parfum FIFO Inventory', function () {
    scenarioParfumFifoRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Smoke Test');
}
