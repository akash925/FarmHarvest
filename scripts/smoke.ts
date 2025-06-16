#!/usr/bin/env ts-node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 1; // You may need to adjust this based on your test data

interface TestResult {
  endpoint: string;
  status: number;
  success: boolean;
  error?: string;
}

const tests: Array<{ name: string; endpoint: string; expectedStatus: number }> = [
  { name: 'Auth Session Check', endpoint: '/api/auth/session', expectedStatus: 401 }, // Should be unauthorized if not logged in
  { name: 'Seller Profiles', endpoint: `/api/seller-profiles/${TEST_USER_ID}`, expectedStatus: 200 },
  { name: 'Listings', endpoint: '/api/listings', expectedStatus: 200 },
  { name: 'Featured Listings', endpoint: '/api/listings/featured', expectedStatus: 200 },
  { name: 'Users', endpoint: `/api/users/${TEST_USER_ID}`, expectedStatus: 200 }, // Might be 404 if user doesn't exist
];

async function runTest(test: { name: string; endpoint: string; expectedStatus: number }): Promise<TestResult> {
  try {
    console.log(`Testing ${test.name} (${test.endpoint})...`);
    
    const response = await fetch(`${BASE_URL}${test.endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    const success = response.status === test.expectedStatus || 
                   (test.expectedStatus === 200 && response.status >= 200 && response.status < 300) ||
                   (test.endpoint.includes('/users/') && response.status === 404); // Users endpoint might not exist in dev

    return {
      endpoint: test.endpoint,
      status: response.status,
      success,
      error: success ? undefined : `Expected ${test.expectedStatus}, got ${response.status}`,
    };
  } catch (error) {
    return {
      endpoint: test.endpoint,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runSmokeTests(): Promise<void> {
  console.log('🔥 Running smoke tests...\n');
  
  const results: TestResult[] = [];
  let allPassed = true;

  // Run tests sequentially to avoid overwhelming the server
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.status}`);
    } else {
      console.log(`❌ ${test.name}: ${result.error}`);
      allPassed = false;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  if (allPassed) {
    console.log('\n🎉 All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some smoke tests failed!');
    console.log('\nFailed tests:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.endpoint}: ${r.error}`));
    
    process.exit(1);
  }
}

// Additional test to check if server is running
async function checkServerHealth(): Promise<boolean> {
  try {
    console.log('🔍 Checking if server is running...');
    const response = await fetch(`${BASE_URL}/api/listings`, { 
      method: 'GET',
      timeout: 5000,
    });
    
    if (response.status >= 200 && response.status < 500) {
      console.log('✅ Server is responding');
      return true;
    } else {
      console.log(`❌ Server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server is not responding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main(): Promise<void> {
  // First check if server is running
  const serverRunning = await checkServerHealth();
  
  if (!serverRunning) {
    console.log('\n💡 Make sure the server is running with: npm run dev');
    process.exit(1);
  }

  // Wait a bit for server to fully initialize
  console.log('⏳ Waiting 2 seconds for server to initialize...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Run the actual tests
  await runSmokeTests();
}

// Run the tests
main().catch((error) => {
  console.error('🚨 Smoke test runner failed:', error);
  process.exit(1);
}); 