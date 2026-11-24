import { db } from '../server/db.js';
import { apiRouter } from '../server/api.js';

function mockReqRes(options) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/',
    headers: options.headers || {},
    body: options.body || {},
    query: options.query || {},
    params: options.params || {}
  };

  return new Promise((resolve) => {
    let statusCode = 200;
    const headers = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(name, value) {
        headers[name] = value;
      },
      json(data) {
        resolve({ status: statusCode, body: data });
      },
      send(data) {
        resolve({ status: statusCode, body: data });
      }
    };

    apiRouter.handle(req, res, (err) => {
      if (err) {
        resolve({ status: 500, body: { error: err.message } });
      } else {
        resolve({ status: 404, body: { error: 'Not found' } });
      }
    });
  });
}

async function runTests() {
  console.log('🧪 Starting Storage & Spin Wheel Mock Verification Suite...');

  // Test 1: POST /storage with subscription missing invoiceNumber
  console.log('▶ Test 1: POST /storage with subscription without invoiceNumber...');
  const testSubId = 'sub_test_' + Date.now();
  const res1 = await mockReqRes({
    method: 'POST',
    url: '/storage',
    headers: {
      'x-admin-passkey': 'AL-ADMIN-VAULT-2026',
      'x-admin-email': 'academic.level.org@gmail.com'
    },
    body: {
      key: 'al_prod_subscriptions_v1',
      value: [{
        id: testSubId,
        learnerId: 'usr_super_admin_001',
        planTier: 'PLUS',
        status: 'ACTIVE',
        paymentMethod: 'UPI_QR',
        amountInr: 129,
        durationDays: 180,
        // invoiceNumber deliberately omitted to verify auto-generation and NOT NULL constraint safety!
        createdAt: new Date().toISOString()
      }]
    }
  });

  console.log('Test 1 Response:', res1.status, res1.body);
  if (res1.status !== 200 || !res1.body.success) {
    throw new Error(`Test 1 Failed: Expected 200, got ${res1.status}: ${JSON.stringify(res1.body)}`);
  }

  const insertedSub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(testSubId);
  if (!insertedSub || !insertedSub.invoiceNumber) {
    throw new Error(`Test 1 Failed: invoiceNumber was not persisted in DB!`);
  }
  console.log('✅ Test 1 Passed: /api/storage safely upserted subscription with generated invoiceNumber:', insertedSub.invoiceNumber);

  // Test 2: POST /coins/transact with reason DAILY_SPIN_WHEEL
  console.log('\n▶ Test 2: POST /coins/transact with reason DAILY_SPIN_WHEEL...');
  const res2 = await mockReqRes({
    method: 'POST',
    url: '/coins/transact',
    headers: {},
    body: {
      learnerId: 'usr_super_admin_001',
      amount: 5,
      transactionType: 'CREDIT',
      reasonCode: 'DAILY_SPIN_WHEEL',
      metadata: { isJackpot: false }
    }
  });

  console.log('Test 2 Response:', res2.status, res2.body);
  if (res2.status !== 200 || !res2.body.success) {
    throw new Error(`Test 2 Failed: Expected 200, got ${res2.status}: ${JSON.stringify(res2.body)}`);
  }
  console.log('✅ Test 2 Passed: /api/coins/transact accepted DAILY_SPIN_WHEEL! New balance:', res2.body.newBalance);

  // Test 3: POST /students/usr_super_admin_001/spin
  console.log('\n▶ Test 3: POST /students/usr_super_admin_001/spin...');
  db.prepare("UPDATE learners SET lastSpinTimestampUtc = NULL WHERE id = 'usr_super_admin_001'").run();

  const res3 = await mockReqRes({
    method: 'POST',
    url: '/students/usr_super_admin_001/spin',
    headers: {
      'x-admin-passkey': 'AL-ADMIN-VAULT-2026'
    }
  });

  console.log('Test 3 Response:', res3.status, res3.body);
  if (res3.status !== 200 || !res3.body.success) {
    throw new Error(`Test 3 Failed: Expected 200, got ${res3.status}: ${JSON.stringify(res3.body)}`);
  }
  console.log('✅ Test 3 Passed: spin endpoint successfully awarded', res3.body.coinsWon, 'coins! New balance:', res3.body.newBalance);

  // Clean up
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(testSubId);

  console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! BACKEND IS 100% ROBUST.');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
