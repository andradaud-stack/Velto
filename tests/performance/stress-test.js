/**
 * Velto Finance — Stress & Breaking Point Test (Grafana k6)
 * Objective: Push system beyond normal operating limits to detect failure modes,
 * database connection queue exhaustion, Vercel function timeouts, and recovery capabilities.
 * 
 * Safety: STAGING ONLY.
 * High-Load Guard: Requires explicit confirmation (-e ALLOW_HIGH_LOAD=true).
 */

import { sleep, group } from 'k6';
import {
  BASE_URL,
  STAGING_TOKEN,
  enforceSafetyGuard,
  STRESS_THRESHOLDS,
  scenarioDashboardRead,
  scenarioTransactionHistoryRead,
  scenarioParfumFifoRead,
  generateTestSummary
} from './config.js';

// Pre-test Safety Verification for up to 3,000 VUs
enforceSafetyGuard(BASE_URL, 3000);

export const options = {
  stages: [
    { duration: '1m', target: 200 },   // Warm-up to 200 VUs
    { duration: '2m', target: 800 },   // Step up to 800 VUs
    { duration: '2m', target: 1500 },  // Step up to 1,500 VUs
    { duration: '2m', target: 2500 },  // Push to 2,500 VUs
    { duration: '2m', target: 3000 },  // Stress peak at 3,000 VUs
    { duration: '2m', target: 0 },     // Quick cool-down to observe recovery
  ],
  thresholds: STRESS_THRESHOLDS
};

export default function () {
  group('Stress: Dashboard Sync', function () {
    scenarioDashboardRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);

  group('Stress: Transaction History', function () {
    scenarioTransactionHistoryRead(BASE_URL, STAGING_TOKEN);
  });

  sleep(0.5);

  group('Stress: Parfum Inventory', function () {
    scenarioParfumFifoRead(BASE_URL, STAGING_TOKEN);
  });

  // Short pause to maintain intense pressure on the server
  sleep(0.5);
}

export function handleSummary(data) {
  return generateTestSummary(data, 'Stress Test');
}
