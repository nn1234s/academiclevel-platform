import assert from 'assert';
import { apiRouter } from '../server/api.js';
import { db, initDatabaseSchema } from '../server/db.js';

initDatabaseSchema();

console.log('====================================================');
console.log('ACADEMICLEVEL GIFT CARD DISPATCH & DASHBOARD TEST SUITE');
console.log('====================================================\n');

async function runRoute(method, routePattern, reqOverrides = {}) {
  const layer = apiRouter.stack.find(
    s => s.route && s.route.path === routePattern && s.route.methods[method.toLowerCase()]
  );
  assert(layer, `Route ${method} ${routePattern} must exist in apiRouter`);
  const handlers = layer.route.stack.map(s => s.handle);
  const req = {
    method: method.toUpperCase(),
    params: {},
    query: {},
    body: {},
    headers: {},
    ...reqOverrides
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    send(b) { this.body = b; return this; },
    setHeader(k, v) { this.headers[k] = v; return this; }
  };

  let idx = 0;
  async function next(err) {
    if (err) throw err;
    if (idx < handlers.length) {
      const h = handlers[idx++];
      await h(req, res, next);
    }
  }
  await next();
  return res;
}

async function run() {
  const adminEmail = 'admin@academiclevel.in';
  const adminHeaders = {
    'x-admin-email': adminEmail,
    'x-admin-passkey': 'naitik2026'
  };

  const now = Date.now();
  const testStudentId = 'stu_gc_test_' + now;
  const testEmail = `student_${now}@al.test`;
  let gift1Id = null;
  let gift2Id = null;
  let gift3Id = null;

  try {
    // Setup test student with coins
    db.prepare(`
      INSERT INTO learners (id, fullName, email, passwordHash, board, grade, coinBalance, quizzesCompletedCount, role, referralCode, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(testStudentId, 'Arya Sharma', testEmail, 'testhash', 'CBSE', 10, 50000, 20, 'STUDENT', 'REF_' + now);

    // ----------------------------------------------------
    // TEST 1: Student creates Gift Card Redemption
    // ----------------------------------------------------
    console.log('TEST 1: Student creates Amazon Pay gift card redemption');
    const redeemRes = await runRoute('POST', '/gifts/redeem', {
      body: {
        learnerId: testStudentId,
        level: 3,
        brand: 'AMAZON',
        rsAmount: 50,
        coinsCost: 3500,
        deliveryEmail: testEmail,
        deliveryPhone: '9876543210'
      }
    });

    assert.strictEqual(redeemRes.statusCode, 200);
    assert.strictEqual(redeemRes.body.success, true);
    gift1Id = redeemRes.body.reqId;
    assert(gift1Id, 'Must return generated reqId');

    const createdReq = db.prepare('SELECT * FROM gift_requests WHERE id = ?').get(gift1Id);
    assert.strictEqual(createdReq.status, 'PENDING_APPROVAL');
    assert(createdReq.itemTitle.includes('₹50') && createdReq.itemTitle.includes('AMAZON'), 'itemTitle must reflect ₹50 AMAZON');
    console.log('✓ TEST 1 PASSED: Gift card redemption created with PENDING_APPROVAL status\n');

    // ----------------------------------------------------
    // TEST 2: Admin Dispatches Real Voucher Code
    // ----------------------------------------------------
    console.log('TEST 2: Admin enters real voucher code and dispatches');
    const realVoucherCode = 'AMZN-REAL-9842-XK91';
    const dispatchRes = await runRoute('POST', '/admin/gifts/:id/dispatch', {
      headers: adminHeaders,
      params: { id: gift1Id },
      body: { voucherCode: realVoucherCode }
    });

    assert.strictEqual(dispatchRes.statusCode, 200);
    assert.strictEqual(dispatchRes.body.success, true);
    assert(dispatchRes.body.message.includes(realVoucherCode), 'Message must contain real voucher code');

    const dispatchedReq = db.prepare('SELECT * FROM gift_requests WHERE id = ?').get(gift1Id);
    assert.strictEqual(dispatchedReq.status, 'APPROVED_DISPATCHED');
    assert.strictEqual(dispatchedReq.voucherCode, realVoucherCode, 'DB voucherCode must match entered real code');
    assert(dispatchedReq.shippingAddress.includes(`| Voucher Code: ${realVoucherCode}`));
    console.log('✓ TEST 2 PASSED: Real voucher code successfully dispatched and recorded\n');

    // ----------------------------------------------------
    // TEST 3: Student Dashboard Queries Dispatched Gift Card
    // ----------------------------------------------------
    console.log('TEST 3: Student queries my-requests for dashboard rendering');
    const myGiftsRes = await runRoute('GET', '/gifts/my-requests', {
      query: { learnerId: testStudentId }
    });

    assert.strictEqual(myGiftsRes.statusCode, 200);
    assert.strictEqual(myGiftsRes.body.success, true);
    assert(Array.isArray(myGiftsRes.body.requests));
    
    const dispatchedForStudent = myGiftsRes.body.requests.filter(r => r.status === 'APPROVED_DISPATCHED');
    assert.strictEqual(dispatchedForStudent.length, 1);
    assert.strictEqual(dispatchedForStudent[0].id, gift1Id);
    assert.strictEqual(dispatchedForStudent[0].voucherCode, realVoucherCode);
    console.log(`✓ TEST 3 PASSED: Student dashboard receives voucher code "${dispatchedForStudent[0].voucherCode}" for immediate display\n`);

    // ----------------------------------------------------
    // TEST 4: Admin Updates / Edits Dispatched Voucher Code
    // ----------------------------------------------------
    console.log('TEST 4: Admin modifies voucher code to corrected code');
    const updatedVoucherCode = 'AMZN-EDITED-7731-VAL';
    const editDispatchRes = await runRoute('POST', '/admin/gifts/:id/dispatch', {
      headers: adminHeaders,
      params: { id: gift1Id },
      body: { voucherCode: updatedVoucherCode }
    });

    assert.strictEqual(editDispatchRes.statusCode, 200);
    assert.strictEqual(editDispatchRes.body.success, true);

    const reCheckedReq = db.prepare('SELECT * FROM gift_requests WHERE id = ?').get(gift1Id);
    assert.strictEqual(reCheckedReq.voucherCode, updatedVoucherCode);
    // Ensure " | Voucher Code:" is not duplicated in shippingAddress
    const occurrences = (reCheckedReq.shippingAddress.match(/\| Voucher Code:/g) || []).length;
    assert.strictEqual(occurrences, 1, 'shippingAddress must contain exactly one "| Voucher Code:" marker');

    // Check student query reflects updated code
    const reFetchRes = await runRoute('GET', '/gifts/my-requests', {
      query: { learnerId: testStudentId }
    });
    const updatedStudentGift = reFetchRes.body.requests.find(r => r.id === gift1Id);
    assert.strictEqual(updatedStudentGift.voucherCode, updatedVoucherCode);
    console.log(`✓ TEST 4 PASSED: Edited voucher code "${updatedStudentGift.voucherCode}" is immediately reflected on student dashboard\n`);

    // ----------------------------------------------------
    // TEST 5: Multi-Brand Dispatch (Google Play & Flipkart)
    // ----------------------------------------------------
    console.log('TEST 5: Multi-brand redemption & dispatch (Google Play)');
    const gplayRedeem = await runRoute('POST', '/gifts/redeem', {
      body: {
        learnerId: testStudentId,
        level: 1,
        brand: 'GPAY',
        rsAmount: 20,
        coinsCost: 1200,
        deliveryEmail: testEmail,
        deliveryPhone: '9876543210'
      }
    });
    gift2Id = gplayRedeem.body.reqId;

    const gplayCode = 'GPLAY-7749-XABC-5512';
    await runRoute('POST', '/admin/gifts/:id/dispatch', {
      headers: adminHeaders,
      params: { id: gift2Id },
      body: { voucherCode: gplayCode }
    });

    const multiCheck = await runRoute('GET', '/gifts/my-requests', {
      query: { learnerId: testStudentId }
    });
    const dispatchedList = multiCheck.body.requests.filter(r => r.status === 'APPROVED_DISPATCHED');
    assert.strictEqual(dispatchedList.length, 2, 'Student must have 2 dispatched cards');
    const gplayCard = dispatchedList.find(r => r.id === gift2Id);
    assert.strictEqual(gplayCard.voucherCode, gplayCode);
    assert(gplayCard.itemTitle.includes('₹20') && gplayCard.itemTitle.includes('GPAY'));
    console.log('✓ TEST 5 PASSED: Multi-brand gift cards dispatched and queried correctly\n');

    // ----------------------------------------------------
    // TEST 6: Rejection Isolation
    // ----------------------------------------------------
    console.log('TEST 6: Rejected requests are isolated from active dispatched list');
    const rejectRedeem = await runRoute('POST', '/gifts/redeem', {
      body: {
        learnerId: testStudentId,
        level: 1,
        brand: 'FLIPKART',
        rsAmount: 20,
        coinsCost: 1200,
        deliveryEmail: testEmail,
        deliveryPhone: '9876543210'
      }
    });
    gift3Id = rejectRedeem.body.reqId;

    await runRoute('POST', '/admin/gifts/:id/reject', {
      headers: adminHeaders,
      params: { id: gift3Id },
      body: { reason: 'Duplicate test claim' }
    });

    const finalQuery = await runRoute('GET', '/gifts/my-requests', {
      query: { learnerId: testStudentId }
    });
    const onlyActiveDispatched = finalQuery.body.requests.filter(r => r.status === 'APPROVED_DISPATCHED');
    assert.strictEqual(onlyActiveDispatched.length, 2, 'Still only 2 active dispatched cards');
    const rejectedReq = finalQuery.body.requests.find(r => r.id === gift3Id);
    assert.strictEqual(rejectedReq.status, 'REJECTED');
    console.log('✓ TEST 6 PASSED: Rejected card properly excluded from student dashboard dispatched showcase\n');

    console.log('====================================================');
    console.log('ALL 6 GIFT CARD DISPATCH & DASHBOARD TESTS PASSED! 🚀');
    console.log('====================================================');
  } finally {
    // Clean up test data
    if (gift1Id) db.prepare('DELETE FROM gift_requests WHERE id = ?').run(gift1Id);
    if (gift2Id) db.prepare('DELETE FROM gift_requests WHERE id = ?').run(gift2Id);
    if (gift3Id) db.prepare('DELETE FROM gift_requests WHERE id = ?').run(gift3Id);
    db.prepare('DELETE FROM learners WHERE id = ?').run(testStudentId);
    db.prepare('DELETE FROM coin_ledger WHERE learnerId = ?').run(testStudentId);
  }
}

run().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
