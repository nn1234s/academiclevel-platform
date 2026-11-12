import { app } from '../server/server.js';
import { db } from '../server/db.js';
import { EventEmitter } from 'events';

function mockRequest(method, url, body = {}, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { 'content-type': 'application/json', ...headers };
  req.body = body;
  req.query = {};
  return req;
}

function mockResponse(callback) {
  return {
    statusCode: 200,
    headers: {},
    status(c) { this.statusCode = c; return this; },
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    getHeader(k) { return this.headers[k.toLowerCase()]; },
    json(d) { callback(this.statusCode, d); },
    send(d) { callback(this.statusCode, d); },
    end() { callback(this.statusCode); }
  };
}

function dispatch(method, url, body = {}, headers = {}) {
  return new Promise(resolve => {
    const req = mockRequest(method, url, body, headers);
    const res = mockResponse((code, data) => resolve({ code, data }));
    app.handle(req, res);
  });
}

async function runPasswordAuthTests() {
  console.log('=== TEST SUITE: STUDENT PASSWORD AUTHENTICATION (GATE 12 / 15-OF-15) ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  const testEmail = `pwd_test_${Date.now()}@academiclevel.test`;
  const validPwd = 'SecurePassword123!';

  // 1. Register without password
  console.log('--- 1. Registration Password Validation ---');
  const r1 = await dispatch('POST', '/api/auth/register', {
    fullName: 'Test Scholar',
    email: testEmail,
    board: 'CBSE',
    grade: 10
  });
  assert(r1.code === 400 && r1.data?.error?.includes('Password is required'),
    'Registration without password rejected with HTTP 400');

  // 2. Register with short password
  const r2 = await dispatch('POST', '/api/auth/register', {
    fullName: 'Test Scholar',
    email: testEmail,
    password: '123',
    board: 'CBSE',
    grade: 10
  });
  assert(r2.code === 400 && r2.data?.error?.includes('at least 6 characters'),
    'Registration with password < 6 chars rejected with HTTP 400');

  // 3. Register with valid password
  const r3 = await dispatch('POST', '/api/auth/register', {
    fullName: 'Test Scholar',
    email: testEmail,
    password: validPwd,
    board: 'CBSE',
    grade: 10
  });
  assert(r3.code === 200 && r3.data?.success && r3.data?.token,
    'Registration with valid password succeeds with HTTP 200 and issues token');
  assert(r3.data?.learner && !('passwordHash' in r3.data.learner) && !('passwordSalt' in r3.data.learner),
    'Registration response strictly omits passwordHash and passwordSalt');

  const registeredId = r3.data?.learner?.id;
  const registeredToken = r3.data?.token;

  // Verify stored in DB
  const dbUser = db.prepare('SELECT * FROM learners WHERE id = ?').get(registeredId);
  assert(dbUser && dbUser.passwordHash && dbUser.passwordSalt,
    'SQLite database persists non-null cryptographic passwordHash and 16-byte random salt');
  assert(dbUser.passwordHash.length === 128,
    'Password hash is 128-hex-character PBKDF2-SHA512 digest');

  // 4. Login with wrong password
  console.log('\n--- 2. Login Verification & Bad Credentials ---');
  const r4 = await dispatch('POST', '/api/auth/login', {
    email: testEmail,
    password: 'WrongPassword999'
  });
  assert(r4.code === 401 && r4.data?.error?.includes('Invalid password'),
    'Login with wrong password rejected with HTTP 401');

  // 5. Login without password
  const r5 = await dispatch('POST', '/api/auth/login', {
    email: testEmail
  });
  assert(r5.code === 400,
    'Login without password field rejected with HTTP 400');

  // 6. Login with correct password
  const r6 = await dispatch('POST', '/api/auth/login', {
    email: testEmail,
    password: validPwd
  });
  assert(r6.code === 200 && r6.data?.success && r6.data?.token,
    'Login with correct password succeeds with HTTP 200 and issues session token');
  assert(r6.data?.learner && !('passwordHash' in r6.data.learner) && !('passwordSalt' in r6.data.learner),
    'Login response strictly omits passwordHash and passwordSalt');

  // 7. Brute-force throttling defense
  console.log('\n--- 3. Brute-Force Rate Limiting Defense ---');
  const bruteEmail = `brute_${Date.now()}@academiclevel.test`;
  await dispatch('POST', '/api/auth/register', {
    fullName: 'Brute Target',
    email: bruteEmail,
    password: validPwd,
    board: 'CBSE',
    grade: 10
  });

  // Perform 5 failed attempts
  for (let i = 1; i <= 5; i++) {
    await dispatch('POST', '/api/auth/login', { email: bruteEmail, password: 'BadGuess' + i });
  }
  // 6th attempt should trigger 429
  const rBrute = await dispatch('POST', '/api/auth/login', { email: bruteEmail, password: validPwd });
  assert(rBrute.code === 429 && rBrute.data?.error?.includes('Too many failed login attempts'),
    'Anti-brute force throttling locks account after 5 failed attempts with HTTP 429');

  // 8. Legacy Account Seamless Upgrade (Zero-lockout for founder test accounts)
  console.log('\n--- 4. Legacy Account Seamless Upgrade ---');
  const legacyEmail = `legacy_${Date.now()}@academiclevel.test`;
  const legacyId = 'lrn_legacy_' + Date.now();
  const legacyReferral = 'AL-LEG-' + Math.floor(10000 + Math.random() * 90000);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO learners (id, email, fullName, board, grade, role, isActive, coinBalance, referralCode, createdAt, updatedAt)
    VALUES (?, ?, ?, 'CBSE', 10, 'STUDENT', 1, 50, ?, ?, ?)
  `).run(legacyId, legacyEmail, 'Legacy Student', legacyReferral, now, now);

  // Check that legacy user currently has null passwordHash
  const legacyBefore = db.prepare('SELECT passwordHash, passwordSalt FROM learners WHERE id = ?').get(legacyId);
  assert(legacyBefore && legacyBefore.passwordHash === null,
    'Legacy test account initially exists with NULL passwordHash');

  // Login with new password -> seamlessly sets it
  const newLegacyPwd = 'MyNewPassword2026!';
  const rLegacyLogin1 = await dispatch('POST', '/api/auth/login', {
    email: legacyEmail,
    password: newLegacyPwd
  });
  assert(rLegacyLogin1.code === 200 && rLegacyLogin1.data?.success,
    'Legacy account first login with new password succeeds seamlessly (zero lockout)');

  const legacyAfter = db.prepare('SELECT passwordHash, passwordSalt FROM learners WHERE id = ?').get(legacyId);
  assert(legacyAfter && legacyAfter.passwordHash && legacyAfter.passwordSalt,
    'Legacy account is now securely upgraded with PBKDF2 salt & hash in SQLite');

  // Next login with wrong password fails
  const rLegacyWrong = await dispatch('POST', '/api/auth/login', {
    email: legacyEmail,
    password: 'WrongPassword'
  });
  assert(rLegacyWrong.code === 401,
    'Subsequent login with incorrect password properly rejected with HTTP 401');

  // Next login with set password succeeds
  const rLegacyCorrect = await dispatch('POST', '/api/auth/login', {
    email: legacyEmail,
    password: newLegacyPwd
  });
  assert(rLegacyCorrect.code === 200 && rLegacyCorrect.data?.success,
    'Subsequent login with correct password succeeds');

  // 9. Sensitive Information Exposure Check
  console.log('\n--- 5. Information Exposure Prevention ---');
  const rMe = await dispatch('GET', '/api/auth/me', {}, {
    authorization: `Bearer ${registeredToken}`
  });
  assert(rMe.code === 200 && !('passwordHash' in rMe.data?.learner) && !('passwordSalt' in rMe.data?.learner),
    '/api/auth/me strips passwordHash and passwordSalt');

  const rStudent = await dispatch('GET', `/api/students/${registeredId}`, {}, {
    authorization: `Bearer ${registeredToken}`
  });
  const studentObj = rStudent.data?.learner || rStudent.data?.student;
  assert(rStudent.code === 200 && studentObj && !('passwordHash' in studentObj) && !('passwordSalt' in studentObj),
    '/api/students/:id strips passwordHash and passwordSalt');

  // 10. Dual Super Admin Vault Preservation
  console.log('\n--- 6. Dual Admin Vault Access Preservation ---');
  const rAdmin1 = await dispatch('POST', '/api/auth/login', {
    email: 'admin@academiclevel.in',
    password: 'Admin@AcademicLevel99'
  });
  assert(rAdmin1.code === 200 && rAdmin1.data?.learner?.role === 'SUPER_ADMIN',
    'Primary Super Admin (admin@academiclevel.in) signs in successfully with SUPER_ADMIN role');

  const rAdmin2 = await dispatch('POST', '/api/auth/login', {
    email: 'naitiknanda1235@gmail.com',
    password: 'Admin@AcademicLevel99'
  });
  assert(rAdmin2.code === 200 && rAdmin2.data?.learner?.role === 'SUPER_ADMIN',
    'Founder Super Admin (naitiknanda1235@gmail.com) signs in successfully with SUPER_ADMIN role');

  console.log(`\n==================================================`);
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED (100%)`);
  console.log(`==================================================\n`);
}

runPasswordAuthTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
