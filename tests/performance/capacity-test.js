/**
 * Velto Finance — Capacity & Progressive Scalability Test (Grafana k6)
 * Objective: Measure system capacity and find the scaling ceiling through progressive stages:
 * 10 -> 50 -> 100 -> 250 -> 500 -> 1,000 -> 2,000 -> 3,500 -> 5,000 VUs.
 * 
 * Safety: STAGING ONLY.
 * High-Load Guard: Requires explicit confirmation (-e ALLOW_HIGH_LOAD=true)
 * to execute workloads scaling beyond 100 VUs.
 */

import { sleep, group } from 'k6';
import {
  BASE_URL,
  STAGING_TOKEN,
  enforceSafetyGuard,
  scenarioDashboardRead,
  scenarioTransactionHistoryRead,
  scenarioParfumFifoRead,
  scenarioStaticShellRead,
  generateTestSummary
} from './config.js';

// Pre-test Safety Verification for up to 5,000 VUs
enforceSafetyGuard(BASE_URL, 5000);

export const options = {
  stages: [
    // Phase 1: Mild Load (10 to 100 VUs)
    { duration: '1m', target: 10 },    // Ramp to 10 VUs
    { duration: '2m', target: 50 },    // Scale to 50 VUs
    { duration: '2m', target: 100 },   // Scale to 100 VUs

    // Phase 2: Moderate Load (250 to 500 VUs)
    { duration: '2m', target: 250 },   // Scale to 250 VUs
    { duration: '2m', target: 500 },   // Scale to 500 VUs

    // Phase 3: High Scale (1,000 to 2,000 VUs)
    { duration: '3m', target: 1000 },  // Scale to 1,000 VUs
    { duration: '3m', target: 2000 },  // Scale to 2,000 VUs

    // Phase 4: Peak Capacity Target (3,500 to 5,000 VUs)
    { duration: '3m', target: 3500 },  // Scale to 3,500 VUs
    { duration: '3m', target: 5000 },  // Peak target at 5,000 VUs
    { duration: '2m', target: 5000 },  // Sustain peak for 2 minutes

    // Phase 5: Controlled Recovery Ramp-down
    { duration: '3m', target: 0 }      // Graceful ramp-down to 0 VUs
  ],
  thresholds: {
    // Under extreme progressive load, error rate must stay below 5%
    http_req_failed: ['rate<0.05'],
    // P95 latency acceptable up to 2500ms under 5k VU concurrency
    http_req_duration: ['p(95)<2500', 'p(99)<4500'],
    checks: ['rate>0.92']
  }
};

export default function () {
  // Balanced real-world distribution
  group('1. Financial Dashboard Overview', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(1);

  // 60% of users inspect mutasi history
  if (Math.random() < 0.6) {
    group('2. Transaction History', function () {
      scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
    });
  }

  sleep(1);

  // 40% of users check parfum module
  if (Math.random() < 0.4) {
    group('3. Parfum FIFO', function () {
      scenarioParfumFifoRead(BASE_URL, STAGING_TOKEN);
    });
  }

  // Realistic human think time between requests (1 to 3 seconds)
  sleep(1 + Math.random() * 2);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Capacity Progressive Test');
}
