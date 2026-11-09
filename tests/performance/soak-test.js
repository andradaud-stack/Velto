/**
 * Velto Finance — Soak & Long-term Stability Test (Grafana k6)
 * Objective: Run sustained load over an extended duration at a steady percentage
 * (e.g. 70-80%) of validated stable capacity to uncover memory leaks, connection leaks,
 * garbage collection pauses, and response time degradation over time.
 * 
 * Safety: STAGING ONLY.
 * High-Load Guard: Requires explicit confirmation (-e ALLOW_HIGH_LOAD=true).
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

// Configurable sustained VU level (Default: 200 VUs representing ~75% of a 250 VU stable tier)
const SOAK_VUS = parseInt(__ENV.SOAK_VUS || '200', 10);
const SOAK_DURATION = __ENV.SOAK_DURATION || '30m'; // Configurable: 30m, 1h, 2h

// Pre-test Safety Verification
enforceSafetyGuard(BASE_URL, SOAK_VUS);

export const options = {
  stages: [
    { duration: '2m', target: SOAK_VUS },      // Ramp up smoothly
    { duration: SOAK_DURATION, target: SOAK_VUS }, // Sustain steady-state load
    { duration: '2m', target: 0 },            // Ramp down smoothly
  ],
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    // Error rate must remain under 1% throughout the entire soak duration
    http_req_failed: ['rate<0.01'],
    // Latency must NOT degrade significantly over time
    http_req_duration: ['p(95)<1000', 'p(99)<2500'],
    checks: ['rate>0.98']
  }
};

export default function () {
  group('1. Soak: Static Asset', function () {
    scenarioStaticShellRead(BASE_URL);
  });

  sleep(1);

  group('2. Soak: Dashboard Sync', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1.5);

  group('3. Soak: Transaction Sync', function () {
    scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1);

  group('4. Soak: Parfum Module', function () {
    scenarioParfumFifoRead(BASE_URL, STAGING_TOKEN);
  });

  // Emulate realistic pacing
  sleep(2 + Math.random() * 2);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Soak Stability Test');
}
