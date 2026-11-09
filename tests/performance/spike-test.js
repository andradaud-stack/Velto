/**
 * Velto Finance — Spike Resilience Test (Grafana k6)
 * Objective: Simulate sudden violent traffic spikes (e.g., flash notification, viral opening)
 * to evaluate Vercel Serverless cold-start elasticity and TiDB connection scaling.
 * 
 * Safety: STAGING ONLY.
 * High-Load Guard: Requires explicit confirmation (-e ALLOW_HIGH_LOAD=true).
 */

import { sleep, group } from 'k6';
import {
  BASE_URL,
  STAGING_TOKEN,
  enforceSafetyGuard,
  scenarioDashboardRead,
  scenarioTransactionHistoryRead,
  generateTestSummary
} from './config.js';

// Pre-test Safety Verification for up to 1,500 VUs spike
enforceSafetyGuard(BASE_URL, 1500);

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Low baseline: 20 VUs
    { duration: '15s', target: 1500 }, // VIOLENT SPIKE to 1,500 VUs in 15 seconds!
    { duration: '1m', target: 1500 },  // Hold spike for 1 minute
    { duration: '20s', target: 20 },   // Immediate drop back to 20 VUs
    { duration: '1m', target: 20 },    // Observe recovery at low baseline
    { duration: '15s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    // Under extreme instant spike, some throttling (429/504) is expected
    http_req_failed: ['rate<0.08'],
    http_req_duration: ['p(95)<3000', 'p(99)<6000'],
    checks: ['rate>0.90']
  }
};

export default function () {
  group('Spike: Rapid Overview Sync', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);

  group('Spike: Transaction Sync', function () {
    scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Spike Test');
}
